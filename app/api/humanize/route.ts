import { NextRequest, NextResponse } from 'next/server';
import { RewriteLevel, StylePreset, TonePreset, ModelProvider } from '@/lib/types';
import { getSystemPrompt, getRehumanizePrompt } from '@/lib/prompts';
import { generateWithProvider, getProvider } from '@/lib/providers';
import { detectAI } from '@/lib/detector';

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

export async function POST(request: NextRequest) {
  try {
    const { text, level, style, tone, customTone, model, apiKey, targetScore, language } = await request.json();
    if (!text || !model || !apiKey) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    if (countWords(text) > 10000) return NextResponse.json({ error: 'Exceeds 10,000 word limit' }, { status: 400 });

    const systemPrompt = getSystemPrompt(level, style, tone, customTone);
    const providerInfo = getProvider(model);
    const modelId = providerInfo?.defaultModel || model;
    const maxPasses = level === 'ninja' ? 3 : level === 'aggressive' ? 2 : 1;
    const target = targetScore || 80;
    const chunks = chunkText(text, 2500);

    let langNote = '';
    if (language && language !== 'en' && language !== 'auto') {
      langNote = '\n\nIMPORTANT: The text is in a language other than English. Rewrite it in the SAME language. Do NOT translate.';
    }

    // Pass 1
    let humanizedText = '';
    for (let i = 0; i < chunks.length; i++) {
      const result = await generateWithProvider(model, apiKey, systemPrompt, `Text to humanize:\n\n${chunks[i]}${langNote}`, { model: modelId });
      humanizedText += (i > 0 ? '\n\n' : '') + result;
    }

    let passes = 1;
    let currentText = humanizedText;

    // Multi-pass
    for (let pass = 2; pass <= maxPasses; pass++) {
      const detection = detectAI(currentText);
      if (detection.score >= target) break;

      const flagged = detection.sentences.filter(s => s.classification !== 'human').map(s => s.text);
      if (flagged.length === 0) break;

      try {
        const rehumanizePrompt = getRehumanizePrompt(flagged, level, style, tone, customTone);
        const result = await generateWithProvider(model, apiKey, rehumanizePrompt, '', { model: modelId, temperature: 1.0 });
        const rehumanized = result.split('\n').map(l => l.replace(/^\d+[\.\)]\s*/, '').trim()).filter(l => l.length > 10);
        const origSentences = splitSentences(currentText);
        let idx = 0;
        currentText = origSentences.map(orig => {
          if (flagged.includes(orig) && idx < rehumanized.length) { idx++; return rehumanized[idx - 1]; }
          return orig;
        }).join(' ');
        passes = pass;
      } catch { break; }
    }

    const finalText = currentText;
    const finalDetection = detectAI(finalText);
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

    return NextResponse.json({
      sentences, fullText: finalText, model, modelName: providerInfo?.name || model,
      wordCount: { input: countWords(text), output: countWords(finalText) },
      timestamp: Date.now(), passes, finalScore: finalDetection.score,
      options: { level, style, tone, language },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
