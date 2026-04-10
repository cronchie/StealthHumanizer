import { NextRequest, NextResponse } from 'next/server';
import { RewriteLevel, StylePreset, TonePreset, ModelProvider } from '@/lib/types';
import { getSystemPrompt, getRehumanizePrompt, getSelfCheckPrompt, getFixPrompt, getCorpusAwareSystemPrompt, LEVEL_PARAMS } from '@/lib/prompts';
import { generateWithProvider, getProvider } from '@/lib/providers';
import { detectAI } from '@/lib/detector';
import { postprocess, corpusAwarePostprocess } from '@/lib/postprocess';
import { loadStyleModelAsync, loadStyleModel, hasStyleModel } from '@/lib/style-model';
import { calibrateWithCorpus } from '@/lib/detector';
import { chainModels } from '@/lib/chain';
import {
  appendAuditLog,
  applyRewriteRegressionGuard,
  buildConfidenceReport,
  enforceSafetyPolicy,
} from '@/lib/server/humanization-governance';
import { scoreHumanLikeness } from '@/lib/server/model-runtime';

const MAX_BATCH_SIZE = 20;

function countWords(text: string): number { return text.trim().split(/\s+/).filter(w => w.length > 0).length; }

function chunkText(text: string, maxWords: number = 2500): string[] {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return [text];
  const chunks: string[] = [];
  let current: string[] = [];
  for (const word of words) {
    current.push(word);
    if (current.length >= maxWords) {
      const ct = current.join(' ');
      const last = Math.max(ct.lastIndexOf('.'), ct.lastIndexOf('!'), ct.lastIndexOf('?'));
      if (last > ct.length * 0.5) {
        chunks.push(ct.slice(0, last + 1));
        current = ct.slice(last + 1).trim().split(/\s+/);
      } else { chunks.push(ct); current = []; }
    }
  }
  if (current.length > 0) chunks.push(current.join(' '));
  return chunks;
}

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+[\s]*/g)?.map(s => s.trim()).filter(s => s.length > 0) || [text.trim()];
}

async function llmSelfCheck(
  provider: ModelProvider,
  apiKey: string,
  text: string
): Promise<{ score: number; issues: string[]; flaggedSentences: string[] }> {
  try {
    const prompt = getSelfCheckPrompt().replace('{TEXT}', text.slice(0, 3000));
    const providerInfo = getProvider(provider);
    const result = await generateWithProvider(provider, apiKey, prompt, '', {
      model: providerInfo?.defaultModel,
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 1024,
    });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        flaggedSentences: Array.isArray(parsed.flaggedSentences) ? parsed.flaggedSentences : [],
      };
    }
  } catch {}
  return { score: 50, issues: [], flaggedSentences: [] };
}

export async function POST(request: NextRequest) {
  try {
    const {
      text, level, style, tone, customTone, model, apiKey,
      targetScore, language, writingSample,
      // New pipeline parameters
      postprocess: enablePostprocess = true,
      characterShield: enableCharShield = false,
      chainModels: chainModelIds = [],
      apiKeys: extraApiKeys = {},
      batchTexts = [],
    } = await request.json();

    if (!text || !model || !apiKey) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    if (countWords(text) > 10000) return NextResponse.json({ error: 'Exceeds 10,000 word limit' }, { status: 400 });
    if (Array.isArray(batchTexts) && batchTexts.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `Batch size exceeds limit (${MAX_BATCH_SIZE}).` }, { status: 400 });
    }

    const safety = enforceSafetyPolicy(text);
    if (safety.blocked) {
      return NextResponse.json(
        {
          error: 'Request blocked by safety policy.',
          reasons: safety.reasons,
          safeUseGuidance: safety.safeUseGuidance,
        },
        { status: 400 }
      );
    }

    // Load corpus style model
    await loadStyleModelAsync();
    const useCorpus = hasStyleModel();

    // Calibrate detector with corpus
    if (useCorpus) {
      const model = loadStyleModel();
      if (model) calibrateWithCorpus(model);
    }

    const params = LEVEL_PARAMS[level as RewriteLevel];
    const systemPrompt = useCorpus
      ? getCorpusAwareSystemPrompt(level, style, tone, customTone, writingSample, undefined, language)
      : getSystemPrompt(level, style, tone, customTone, writingSample, language);
    const providerInfo = getProvider(model);
    const modelId = providerInfo?.defaultModel || model;

    if (Array.isArray(batchTexts) && batchTexts.length > 0) {
      const selected = batchTexts.slice(0, MAX_BATCH_SIZE).filter((item: unknown) => typeof item === 'string' && item.trim().length > 0);
      const batchResults: Array<{
        index: number;
        fullText: string;
        finalScore: number;
        confidenceReport: ReturnType<typeof buildConfidenceReport>;
        runtimeModelScore: Awaited<ReturnType<typeof scoreHumanLikeness>>;
      }> = [];

      for (let i = 0; i < selected.length; i++) {
        const batchInput = selected[i];
        const chunks = chunkText(batchInput, 2500);
        let rewritten = '';
        for (let j = 0; j < chunks.length; j++) {
          const out = await generateWithProvider(model, apiKey, systemPrompt, chunks[j], {
            model: modelId,
            temperature: params.temperature,
            topP: params.topP,
          });
          rewritten += (j > 0 ? '\n\n' : '') + out;
        }
        const final = enablePostprocess ? postprocess(rewritten, { light: true }) : rewritten;
        const detection = detectAI(final);
        const confidenceReport = buildConfidenceReport(detection.score);
        const runtimeModelScore = await scoreHumanLikeness(final);
        batchResults.push({
          index: i,
          fullText: final,
          finalScore: detection.score,
          confidenceReport,
          runtimeModelScore,
        });
      }

      await appendAuditLog({
        timestamp: new Date().toISOString(),
        route: '/api/humanize',
        model,
        mode: 'batch',
        batchCount: batchResults.length,
      });

      return NextResponse.json({
        mode: 'batch',
        count: batchResults.length,
        results: batchResults,
        model,
        modelName: providerInfo?.name || model,
      });
    }

    const maxPasses = level === 'ninja' ? 3 : level === 'aggressive' ? 2 : level === 'medium' ? 2 : 1;
    const target = targetScore || 80;
    const chunks = chunkText(text, 2500);

    // Language note for non-English/non-Chinese text (Chinese is handled by getSystemPrompt)
    let langNote = '';
    if (language && language !== 'en' && language !== 'auto' && language !== 'zh-CN' && language !== 'zh-TW') {
      langNote = '\n\nIMPORTANT: The text is in a language other than English. Rewrite it in the SAME language. Do NOT translate.';
    }

    // ==================== LAYER 1: LLM Rewrite ====================
    let humanizedText = '';
    for (let i = 0; i < chunks.length; i++) {
      const chunkPrompt = chunks[i] + langNote;
      const result = await generateWithProvider(model, apiKey, systemPrompt, chunkPrompt, {
        model: modelId,
        temperature: params.temperature,
        topP: params.topP,
      });
      humanizedText += (i > 0 ? '\n\n' : '') + result;
    }

    let passes = 1;
    let currentText = humanizedText;

    // ==================== LAYER 2: Post-Processing ====================
    // Always apply corpus-aware post-processing if model is loaded
    if (useCorpus) {
      currentText = corpusAwarePostprocess(currentText);
    }
    // Also apply regular post-processing if toggled on
    if (enablePostprocess) {
      currentText = postprocess(currentText, { characterShield: enableCharShield });
    }

    // ==================== LAYER 3: Multi-Model Chain ====================
    if (chainModelIds && chainModelIds.length > 0) {
      // Build chain config from provided model IDs and API keys
      const allApiKeys = { ...extraApiKeys, [model]: apiKey };
      const chainConfig = chainModelIds
        .filter((id: string) => allApiKeys[id])
        .map((id: string) => ({
          provider: id as ModelProvider,
          apiKey: allApiKeys[id],
        }));

      if (chainConfig.length > 0) {
        const chainResult = await chainModels({
          text: currentText,
          chainModels: chainConfig,
          level: level as RewriteLevel,
          style: style as StylePreset,
          tone,
          customTone,
        });
        currentText = chainResult.text;
        passes += chainResult.passes.length;
      }
    }

    // ==================== LAYER 4: Final Polish ====================
    if (enablePostprocess) {
      // Light post-process pass after chain
      currentText = postprocess(currentText, { light: true });
    }

    // NOTE: Self-check loop disabled — multi-pass LLM self-checking adds more AI fingerprints
    // with each pass, making text MORE detectable, not less. Single-pass rewrite is more effective.
    // The code below is preserved but skipped.
    /*
    if (chainModelIds.length === 0) {
      for (let pass = 2; pass <= maxPasses; pass++) {
        const check = await llmSelfCheck(model, apiKey, currentText);
        if (check.score >= target) break;

        const allIssues = [...check.issues, ...check.flaggedSentences];
        if (allIssues.length === 0) break;

        try {
          const fixPrompt = getFixPrompt(allIssues);
          const fullFixPrompt = `${fixPrompt}\n\nORIGINAL TEXT TO FIX (rewrite the entire text with these fixes applied):\n\n${currentText}`;
          const result = await generateWithProvider(model, apiKey, fixPrompt, currentText, {
            model: modelId,
            temperature: params.temperature,
            topP: params.topP,
          });
          currentText = result;
          passes = pass;

          // Apply light post-processing after each self-check fix
          if (enablePostprocess) {
            currentText = postprocess(currentText, { light: true });
          }
        } catch { break; }
      }
    }
    */

    const guard = applyRewriteRegressionGuard({
      originalText: text,
      candidateText: currentText,
      fallbackText: humanizedText,
    });
    const finalText = guard.text;
    const finalDetection = detectAI(finalText);
    const confidenceReport = buildConfidenceReport(finalDetection.score);
    const runtimeModelScore = await scoreHumanLikeness(finalText);
    const origSentences = splitSentences(text);
    const humanizedSentences = splitSentences(finalText);
    const maxLen = Math.max(origSentences.length, humanizedSentences.length);

    const sentences = [];
    for (let i = 0; i < maxLen; i++) {
      sentences.push({
        original: origSentences[i] || '',
        humanized: humanizedSentences[i] || '',
        alternatives: [],
        index: i,
        detectionScore: finalDetection.sentences[i]?.score,
      });
    }

    const responsePayload = {
      sentences, fullText: finalText, model, modelName: providerInfo?.name || model,
      wordCount: { input: countWords(text), output: countWords(finalText) },
      timestamp: Date.now(), passes, finalScore: finalDetection.score,
      options: { level, style, tone, language },
      confidenceReport,
      runtimeModelScore,
      fallbackBehavior: {
        used: guard.usedFallback,
        reason: guard.reason,
      },
      provenanceDisclosure: {
        source: 'user-provided-input',
        policyVersion: 'pr7-safety-governance-v1',
        modelSelection: runtimeModelScore.modelSource,
      },
    };

    await appendAuditLog({
      timestamp: new Date().toISOString(),
      route: '/api/humanize',
      model,
      passes,
      inputWords: countWords(text),
      outputWords: countWords(finalText),
      finalScore: finalDetection.score,
      confidence: confidenceReport.confidence,
      fallbackUsed: guard.usedFallback,
      runtimeModelSource: runtimeModelScore.modelSource,
      batchCount: Array.isArray(batchTexts) ? batchTexts.length : 0,
    });

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
