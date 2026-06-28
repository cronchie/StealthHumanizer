import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider } from '@/lib/server/providers-runtime';
import { isCliOnlyProvider } from '@/lib/providers';
import { checkRateLimit } from '@/lib/rate-limit';
import type { StyleGuides } from '@/lib/style-guides';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });

    const { sentences, styleGuides, model, apiKey } = await request.json() as {
      sentences: string[];
      styleGuides: StyleGuides;
      model: string;
      apiKey: string;
    };

    if (!sentences?.length || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (isCliOnlyProvider(model as never)) {
      return NextResponse.json({ error: 'CLI-only providers not available here.' }, { status: 400 });
    }

    // Flatten all enabled rules from enabled categories into a labeled list
    const activeRules: { name: string; content: string }[] = [];
    for (const cat of (styleGuides as StyleGuides)) {
      if (!cat.enabled) continue;
      for (const rule of cat.rules) {
        if (rule.enabled && rule.content.trim()) {
          activeRules.push({ name: rule.name, content: rule.content.trim() });
        }
      }
    }

    if (activeRules.length === 0) return NextResponse.json({ violations: {} });

    const rulesBlock = activeRules
      .map((r, i) => `${i + 1}. **${r.name}**: ${r.content}`)
      .join('\n');

    const sentencesBlock = sentences
      .map((s, i) => `[${i}] ${s}`)
      .join('\n');

    const prompt = `You are a strict style guide checker. These are ORIGINAL sentences before any editing. Flag which rules each one violates, so the editor knows what needed fixing.

RULES FOR FLAGGING:
- Only flag a violation if the sentence contains a specific word, phrase, or pattern explicitly named in the rule.
- Do NOT infer, extend, or guess. If the rule lists "banned words: dive into, delve into, leverage", only flag sentences containing those exact words.
- Do NOT flag vague style concerns not grounded in a specific named violation.
- When in doubt, do NOT flag. False positives are worse than missed violations.

ACTIVE RULES:
${rulesBlock}

ORIGINAL SENTENCES:
${sentencesBlock}

Return a JSON object where keys are sentence indices (as strings) and values are arrays of violated rule names (exactly as listed above). Only include sentences with clear, explicit violations. If no clear violations, return {}.

Example: {"0": ["Em dashes", "Banned words & phrases"], "3": ["Em dashes"]}

Return ONLY the JSON object. No explanation, no markdown fences.`;

    const raw = await generateWithProvider(model as never, apiKey, '', prompt, {
      temperature: 0.1,
      maxTokens: 1024,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ violations: {} });

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string[]>;
    // Re-key as numbers for convenience
    const violations: Record<number, string[]> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const idx = parseInt(k, 10);
      if (!isNaN(idx) && Array.isArray(v)) violations[idx] = v;
    }

    return NextResponse.json({ violations });
  } catch (err) {
    return NextResponse.json({ violations: {} });
  }
}
