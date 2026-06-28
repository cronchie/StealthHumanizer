import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider } from '@/lib/server/providers-runtime';
import { isCliOnlyProvider } from '@/lib/providers';
import { checkRateLimit } from '@/lib/rate-limit';
import { splitIntoSentences } from '@/lib/text-utils';
import { detectAI } from '@/lib/detector';
import { scoreHumanLikeness } from '@/lib/server/model-runtime';
import { countWords } from '@/lib/storage';

interface ViolationDetail {
  sentence: string;
  rules: string[];
  descriptions?: string[];
  tokens: string[];
  fix: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });

    const { text, userSystemPrompt, schemaSystemPrompt, model, apiKey } = await request.json() as {
      text: string;
      userSystemPrompt: string;
      schemaSystemPrompt: string;
      model: string;
      apiKey: string;
    };

    if (!text?.trim() || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!userSystemPrompt?.trim()) {
      return NextResponse.json({ error: 'userSystemPrompt is required.' }, { status: 400 });
    }
    if (isCliOnlyProvider(model as never)) {
      return NextResponse.json({ error: 'CLI-only providers not available here.' }, { status: 400 });
    }

    // Schema instructions as system prompt so they get maximum model attention.
    // Style rules + text go in the user message.
    const systemPrompt = schemaSystemPrompt.trim();
    const userMessage = `Style rules to enforce:\n\n${userSystemPrompt.trim()}\n\n---\n\nText to analyze:\n\n${text}`;

    const raw = await generateWithProvider(model as never, apiKey, systemPrompt, userMessage, {
      temperature: 0.1,
      maxTokens: 4096,
      timeoutMs: 180_000,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[structured-rewrite] raw response:', raw.slice(0, 2000));
    }

    function parseViolations(response: string): ViolationDetail[] {
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) return [];
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed.violations)) {
          return parsed.violations.filter(
            (v: unknown) => v && typeof (v as ViolationDetail).sentence === 'string' && typeof (v as ViolationDetail).fix === 'string'
          );
        }
      } catch {}
      return [];
    }

    // Parse violation JSON from model response
    let violationDetails = parseViolations(raw);

    // Retry once if no JSON object was found at all in the response.
    if (!raw.match(/\{[\s\S]*\}/)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[structured-rewrite] no JSON found, retrying with explicit instruction');
      }
      const retrySystem = `${systemPrompt}\n\nCRITICAL: You MUST respond with ONLY a JSON object. No text before or after. Begin with { and end with }.`;
      const raw2 = await generateWithProvider(model as never, apiKey, retrySystem, userMessage, {
        temperature: 0,
        maxTokens: 4096,
        timeoutMs: 60_000,
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('[structured-rewrite] retry raw response:', raw2.slice(0, 2000));
      }
      violationDetails = parseViolations(raw2);
    }

    // Split input into sentences and apply fixes
    const paragraphs = text.split(/\n\n+/);
    const allSentences: string[] = [];
    const paragraphRanges: { start: number; end: number }[] = [];
    for (const para of paragraphs) {
      const paraSentences = splitIntoSentences(para);
      paragraphRanges.push({ start: allSentences.length, end: allSentences.length + paraSentences.length });
      allSentences.push(...paraSentences);
    }

    // Map violations to sentence indices by exact match
    const rewritten = [...allSentences];
    const violations: Record<number, string[]> = {};
    const violationDescriptions: Record<number, string[]> = {};

    for (const v of violationDetails) {
      const idx = allSentences.findIndex(s => s.trim() === v.sentence.trim());
      if (idx !== -1) {
        rewritten[idx] = v.fix.trim();
        violations[idx] = v.rules ?? [];
        // Use descriptions when the model returns them; fall back to rule names
        violationDescriptions[idx] = v.descriptions?.length ? v.descriptions : (v.rules ?? []);
      }
    }

    const fullText = paragraphRanges
      .map(({ start, end }) => rewritten.slice(start, end).join(' '))
      .join('\n\n');

    const sentences = allSentences.map((orig, i) => ({
      original: orig,
      humanized: rewritten[i],
      alternatives: [],
      index: i,
    }));

    const finalDetection = detectAI(fullText);
    const runtimeModelScore = await scoreHumanLikeness(fullText);

    return NextResponse.json({
      success: true,
      sentences,
      fullText,
      violations,
      violationDescriptions,
      violationDetails,
      finalScore: finalDetection.score,
      passes: 1,
      model,
      wordCount: {
        input: countWords(text),
        output: countWords(fullText),
      },
      timestamp: Date.now(),
      options: {},
      runtimeModelScore,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({
      error: process.env.NODE_ENV === 'development' ? message : 'Internal error',
    }, { status: 500 });
  }
}
