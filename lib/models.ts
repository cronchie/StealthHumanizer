import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ModelProvider, ApiKeys } from './types';

export function getAvailableModel(keys: ApiKeys): ModelProvider | null {
  // Prefer Gemini (free tier), then OpenAI, then Claude
  if (keys.gemini) return 'gemini';
  if (keys.openai) return 'openai';
  if (keys.claude) return 'claude';
  return null;
}

export function getModelName(provider: ModelProvider): string {
  switch (provider) {
    case 'gemini':
      return 'Google Gemini';
    case 'openai':
      return 'OpenAI GPT-4';
    case 'claude':
      return 'Anthropic Claude';
  }
}

export async function humanizeWithGemini(
  apiKey: string,
  text: string,
  systemPrompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nText to humanize:\n\n${text}` }],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  return result.response.text();
}

export async function humanizeWithOpenAI(
  apiKey: string,
  text: string,
  systemPrompt: string
): Promise<string> {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

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
}

export async function humanizeWithClaude(
  apiKey: string,
  text: string,
  systemPrompt: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: 'user', content: `Text to humanize:\n\n${text}` },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock ? textBlock.text : '';
}

export async function getAlternativeRewrite(
  provider: ModelProvider,
  apiKey: string,
  originalSentence: string,
  humanizedSentence: string,
  systemPrompt: string
): Promise<string> {
  const altPrompt = `${systemPrompt}

ORIGINAL SENTENCE: "${originalSentence}"
CURRENT HUMANIZED VERSION: "${humanizedSentence}"

Provide a DIFFERENT alternative humanization of the original sentence. Make it noticeably different from the current version while still preserving meaning. Return ONLY the alternative sentence, nothing else.`;

  switch (provider) {
    case 'gemini':
      return humanizeWithGemini(apiKey, originalSentence, altPrompt);
    case 'openai':
      return humanizeWithOpenAI(apiKey, originalSentence, altPrompt);
    case 'claude':
      return humanizeWithClaude(apiKey, originalSentence, altPrompt);
  }
}
