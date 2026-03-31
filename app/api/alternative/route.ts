import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { RewriteLevel, StylePreset } from '@/lib/types';
import { getSystemPrompt } from '@/lib/prompts';

async function getAlternative(
  original: string,
  current: string,
  systemPrompt: string,
  model: string,
  apiKey: string
): Promise<string[]> {
  const altPrompt = `${systemPrompt}\n\nORIGINAL SENTENCE: "${original}"\nCURRENT VERSION: "${current}"\n\nProvide 3 DIFFERENT alternative humanizations. Return ONLY the alternatives, one per line, no numbering.`;

  let responseText = '';

  if (model === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const m = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: altPrompt }] }],
      generationConfig: { temperature: 1.0, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
    });
    responseText = result.response.text();
  } else if (model === 'openai') {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: altPrompt },
      ],
      temperature: 1.0,
      max_tokens: 1024,
    });
    responseText = response.choices[0]?.message?.content || '';
  } else {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: altPrompt }],
    });
    const textBlock = response.content.find((b: any) => b.type === 'text');
    responseText = textBlock ? textBlock.text : '';
  }

  const alternatives = responseText
    .split('\n')
    .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(line => line.length > 10 && line !== current);

  return alternatives.slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    const { original, current, level, style, model, apiKey } = await request.json();

    if (!original || !current || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(level as RewriteLevel, style as StylePreset);
    const alternatives = await getAlternative(original, current, systemPrompt, model, apiKey);

    return NextResponse.json({ alternatives });
  } catch (err: any) {
    console.error('Alternative error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
