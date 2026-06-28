import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider } from '@/lib/server/providers-runtime';
import { isCliOnlyProvider } from '@/lib/providers';
import { checkRateLimit } from '@/lib/rate-limit';
import { getPromptProfile } from '@/lib/server/prompt-profiles';
import { buildStyleGuidePrompt, type StyleGuides } from '@/lib/style-guides';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });

    const { fullText, violatingSentences, profileId, styleGuides, model, apiKey } = await request.json() as {
      fullText: string;
      violatingSentences: { text: string; violations: string[] }[];
      profileId?: string;
      styleGuides: StyleGuides;
      model: string;
      apiKey: string;
    };

    if (!fullText || !violatingSentences?.length || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (isCliOnlyProvider(model as never)) {
      return NextResponse.json({ error: 'CLI-only providers not available here.' }, { status: 400 });
    }

    const activeProfile = profileId ? getPromptProfile(profileId) : undefined;
    const systemPrompt = activeProfile
      ? activeProfile.systemPrompt + buildStyleGuidePrompt(styleGuides)
      : buildStyleGuidePrompt(styleGuides);

    const violationBlock = violatingSentences
      .map(s => `"${s.text}"\n→ Violates: ${s.violations.join(', ')}`)
      .join('\n\n');

    const userPrompt = `The text below was rewritten but some sentences still violate style rules. Fix ONLY the sentences listed below. Do not change anything else — every other sentence must remain word-for-word identical.

SENTENCES TO FIX:
${violationBlock}

FULL TEXT:
${fullText}

Output the corrected full text. Only the listed sentences may change.`;

    const corrected = await generateWithProvider(model as never, apiKey, systemPrompt, userPrompt, {
      temperature: 0.2,
      maxTokens: 4096,
    });

    return NextResponse.json({ corrected });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
