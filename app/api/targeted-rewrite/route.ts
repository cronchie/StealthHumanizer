import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider } from '@/lib/server/providers-runtime';
import { isCliOnlyProvider } from '@/lib/providers';
import { checkRateLimit } from '@/lib/rate-limit';
import { getPromptProfile } from '@/lib/server/prompt-profiles';
import { buildStyleGuidePrompt, type StyleGuides } from '@/lib/style-guides';
import { splitIntoSentences } from '@/lib/text-utils';
import { detectAI } from '@/lib/detector';
import { scoreHumanLikeness } from '@/lib/server/model-runtime';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });

    const { text, styleGuides, profileId, model, apiKey } = await request.json() as {
      text: string;
      styleGuides: StyleGuides;
      profileId?: string;
      model: string;
      apiKey: string;
    };

    if (!text?.trim() || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (isCliOnlyProvider(model as never)) {
      return NextResponse.json({ error: 'CLI-only providers not available here.' }, { status: 400 });
    }

    // Split preserving paragraph structure
    const paragraphs = text.split(/\n\n+/);
    const allSentences: string[] = [];
    const paragraphRanges: { start: number; end: number }[] = [];

    for (const para of paragraphs) {
      const paraSentences = splitIntoSentences(para);
      paragraphRanges.push({ start: allSentences.length, end: allSentences.length + paraSentences.length });
      allSentences.push(...paraSentences);
    }

    if (allSentences.length === 0) {
      return NextResponse.json({ error: 'No sentences found.' }, { status: 400 });
    }

    // Step 1: detect violations in the input
    const activeRules: { name: string; content: string }[] = [];
    for (const cat of styleGuides) {
      if (!cat.enabled) continue;
      for (const rule of cat.rules) {
        if (rule.enabled && rule.content.trim()) {
          activeRules.push({ name: rule.name, content: rule.content.trim() });
        }
      }
    }

    let violations: Record<number, string[]> = {};

    if (activeRules.length > 0) {
      const rulesBlock = activeRules.map((r, i) => `${i + 1}. **${r.name}**: ${r.content}`).join('\n');
      const sentencesBlock = allSentences.map((s, i) => `[${i}] ${s}`).join('\n');

      const analysisPrompt = `You are a strict style guide checker. These are source sentences. Flag which rules each one clearly and explicitly violates.

RULES FOR FLAGGING:
- Only flag if the sentence contains a specific word, phrase, or pattern explicitly named in the rule.
- Do NOT infer or extend. When in doubt, do NOT flag.

ACTIVE RULES:
${rulesBlock}

SENTENCES:
${sentencesBlock}

Return a JSON object: keys are sentence indices (strings), values are arrays of violated rule names exactly as listed. Only include sentences with clear violations. If none, return {}.
Return ONLY the JSON object.`;

      const analysisRaw = await generateWithProvider(model as never, apiKey, '', analysisPrompt, {
        temperature: 0.1,
        maxTokens: 1024,
      });

      const jsonMatch = analysisRaw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, string[]>;
        for (const [k, v] of Object.entries(parsed)) {
          const idx = parseInt(k, 10);
          if (!isNaN(idx) && Array.isArray(v) && v.length > 0) violations[idx] = v;
        }
      }
    }

    // Step 2: if violations exist, rewrite only flagged sentences
    const rewritten = [...allSentences];

    if (Object.keys(violations).length > 0) {
      const activeProfile = profileId ? getPromptProfile(profileId) : undefined;
      const systemPrompt = activeProfile
        ? activeProfile.systemPrompt + buildStyleGuidePrompt(styleGuides)
        : buildStyleGuidePrompt(styleGuides);

      const sentenceBlock = allSentences
        .map((s, i) => {
          const v = violations[i];
          return v?.length
            ? `[${i}][REWRITE: ${v.join(', ')}] ${s}`
            : `[${i}][KEEP] ${s}`;
        })
        .join('\n');

      const rewritePrompt = `You are editing a document. Sentences marked [REWRITE] violate style rules — fix only those violations. Sentences marked [KEEP] must be returned verbatim, word-for-word.

Return exactly ${allSentences.length} sentences as a JSON array of strings in order.

${sentenceBlock}

Return: ["sentence 0 text", "sentence 1 text", ...]`;

      const rewriteRaw = await generateWithProvider(model as never, apiKey, systemPrompt, rewritePrompt, {
        temperature: 0.3,
        maxTokens: 4096,
      });

      const arrayMatch = rewriteRaw.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        const parsed: string[] = JSON.parse(arrayMatch[0]);
        for (let i = 0; i < allSentences.length; i++) {
          if (parsed[i] && violations[i]?.length) {
            rewritten[i] = parsed[i].trim();
          }
        }
      }
    }

    // Reconstruct full text preserving paragraph breaks
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
      finalScore: finalDetection.score,
      passes: Object.keys(violations).length > 0 ? 2 : 1,
      model,
      wordCount: {
        input: text.split(/\s+/).filter(Boolean).length,
        output: fullText.split(/\s+/).filter(Boolean).length,
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
