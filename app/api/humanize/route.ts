import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { RewriteLevel, StylePreset } from '@/lib/types';
import { getSystemPrompt } from '@/lib/prompts';

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function chunkText(text: string, maxWords: number = 2500): string[] {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return [text];
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  for (const word of words) {
    currentChunk.push(word);
    if (currentChunk.length >= maxWords) {
      const chunkText = currentChunk.join(' ');
      const lastSentenceEnd = Math.max(
        chunkText.lastIndexOf('.'), chunkText.lastIndexOf('!'), chunkText.lastIndexOf('?')
      );
      if (lastSentenceEnd > chunkText.length * 0.5) {
        chunks.push(chunkText.slice(0, lastSentenceEnd + 1));
        const remaining = chunkText.slice(lastSentenceEnd + 1).trim();
        currentChunk = remaining ? remaining.split(/\s+/) : [];
      } else {
        chunks.push(chunkText);
        currentChunk = [];
      }
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk.join(' '));
  return chunks;
}

async function humanizeChunk(text: string, systemPrompt: string, model: string, apiKey: string): Promise<string> {
  if (model === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const m = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nText to humanize:\n\n${text}` }] }],
      generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 8192 },
    });
    return result.response.text();
  } else if (model === 'openai') {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Text to humanize:\n\n${text}` },
      ],
      temperature: 0.9,
      max_tokens: 4096,
    });
    return response.choices[0]?.message?.content || '';
  } else {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Text to humanize:\n\n${text}` }],
    });
    const textBlock = response.content.find((b: any) => b.type === 'text');
    return textBlock ? textBlock.text : '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, level, style, model, apiKey } = await request.json();

    if (!text || !level || !style || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (countWords(text) > 10000) {
      return NextResponse.json({ error: 'Text exceeds 10,000 word limit' }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(level as RewriteLevel, style as StylePreset);
    const chunks = chunkText(text, 2500);

    let humanizedText = '';
    for (let i = 0; i < chunks.length; i++) {
      const result = await humanizeChunk(chunks[i], systemPrompt, model, apiKey);
      humanizedText += (i > 0 ? '\n\n' : '') + result;
    }

    // Simple sentence mapping
    const splitSentences = (t: string) =>
      t.match(/[^.!?]+[.!?]+[\s]*/g)?.map(s => s.trim()) || [t.trim()];

    const originalSentences = splitSentences(text);
    const humanizedSentences = splitSentences(humanizedText);

    const sentences = Math.max(originalSentences.length, humanizedSentences.length);
    const sentenceResults = [];
    for (let i = 0; i < sentences; i++) {
      sentenceResults.push({
        original: originalSentences[i] || '',
        humanized: humanizedSentences[i] || '',
        alternatives: [],
        index: i,
      });
    }

    // Save to history (client-side would do this, but we return data for it)
    return NextResponse.json({
      sentences: sentenceResults,
      fullText: humanizedText,
      model,
      wordCount: { input: countWords(text), output: countWords(humanizedText) },
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Humanization error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
