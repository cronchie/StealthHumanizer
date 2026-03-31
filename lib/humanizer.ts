import { HumanizationOptions, HumanizationResult, SentenceResult, ModelProvider, ApiKeys } from './types';
import { getSystemPrompt } from './prompts';
import { humanizeWithGemini, humanizeWithOpenAI, humanizeWithClaude } from './models';
import { chunkText, countWords } from './storage';

// Split text into sentences
function splitIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = '';
  let i = 0;

  while (i < text.length) {
    current += text[i];

    if (['.', '!', '?'].includes(text[i])) {
      const beforeMatch = text.slice(Math.max(0, i - 5), i + 1);
      const abbreviations = ['Mr.', 'Mrs.', 'Dr.', 'Prof.', 'Inc.', 'Ltd.', 'etc.', 'e.g.', 'i.e.', 'vs.'];

      if (!abbreviations.some(abbr => beforeMatch.endsWith(abbr))) {
        if (text[i + 1] === '"' || text[i + 1] === "'") {
          current += text[i + 1];
          i++;
        }
        const trimmed = current.trim();
        if (trimmed.length > 0) {
          sentences.push(trimmed);
        }
        current = '';
      }
    }
    i++;
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    sentences.push(trimmed);
  }

  return sentences;
}

async function humanizeChunk(
  text: string,
  options: HumanizationOptions,
  apiKey: string
): Promise<string> {
  const systemPrompt = getSystemPrompt(options.level, options.style);

  switch (options.model) {
    case 'gemini':
      return humanizeWithGemini(apiKey, text, systemPrompt);
    case 'openai':
      return humanizeWithOpenAI(apiKey, text, systemPrompt);
    case 'claude':
      return humanizeWithClaude(apiKey, text, systemPrompt);
  }
}

export async function humanizeText(
  text: string,
  options: HumanizationOptions,
  apiKey: string,
  onProgress?: (progress: number) => void
): Promise<HumanizationResult> {
  const inputWordCount = countWords(text);
  const chunks = chunkText(text, 2500);

  let humanizedText = '';
  const originalSentences = splitIntoSentences(text);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const humanizedChunk = await humanizeChunk(chunk, options, apiKey);
    humanizedText += (i > 0 ? '\n\n' : '') + humanizedChunk;

    if (onProgress) {
      onProgress(((i + 1) / chunks.length) * 100);
    }
  }

  const humanizedSentences = splitIntoSentences(humanizedText);
  const outputWordCount = countWords(humanizedText);

  // Map sentences (best effort matching)
  const sentenceResults: SentenceResult[] = [];
  const maxLen = Math.max(originalSentences.length, humanizedSentences.length);

  for (let i = 0; i < maxLen; i++) {
    sentenceResults.push({
      original: originalSentences[i] || '',
      humanized: humanizedSentences[i] || '',
      alternatives: [],
      index: i,
    });
  }

  return {
    sentences: sentenceResults,
    fullText: humanizedText,
    model: options.model,
    wordCount: {
      input: inputWordCount,
      output: outputWordCount,
    },
    timestamp: Date.now(),
  };
}

export async function getAlternatives(
  originalSentence: string,
  currentHumanized: string,
  options: HumanizationOptions,
  apiKey: string,
  count: number = 3
): Promise<string[]> {
  const { getAlternativeRewrite } = await import('./models');
  const alternatives: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const alt = await getAlternativeRewrite(
        options.model,
        apiKey,
        originalSentence,
        currentHumanized,
        getSystemPrompt(options.level, options.style)
      );
      alternatives.push(alt.trim());
    } catch {
      // If we fail to get an alternative, skip it
    }
  }

  return alternatives;
}
