// StealthHumanizer - Non-LLM Post-Processing Engine (Layer 2)
// This is the most important layer — pure deterministic transformations that
// break AI statistical fingerprints without any LLM involvement.

import { getRandomSafeSynonym } from './synonyms';
import { applyCollocation, applyRandomCollocation } from './collocations';

// ==================== HELPERS ====================

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation while preserving the punctuation
  return text.match(/[^.!?]*[.!?]+[\s]*/g)?.map(s => s.trim()).filter(s => s.length > 0) || [text.trim()];
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// Detect if a word looks like a proper noun (starts with uppercase mid-sentence)
function looksLikeProperNoun(word: string, position: number, sentence: string): boolean {
  if (position === 0) return false; // First word of sentence is always capitalized
  if (!/^[A-Z]/.test(word)) return false;
  // Check if it's at the start of the sentence text
  const trimmed = sentence.trim();
  if (trimmed.startsWith(word)) return false;
  return true;
}

function isInQuotes(text: string, index: number): boolean {
  let inQuote = false;
  for (let i = 0; i < index; i++) {
    if (text[i] === '"') inQuote = !inQuote;
    if (text[i] === "'" && (i === 0 || text[i-1] !== 's') && (i === text.length-1 || text[i+1] !== 's')) inQuote = !inQuote;
  }
  return inQuote;
}

// ==================== 2a. SYNONYM SWAPPING ====================

function swapSynonyms(text: string): string {
  // Only swap the safest single-word synonyms at low probability.
  // No context-blind replacements — only words where all synonyms
  // preserve meaning and grammatical role.
  const words = text.split(/(\s+)/);
  const result: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Skip whitespace, punctuation, numbers, short words, words in quotes
    if (!word || /^\s+$/.test(word) || /^[^a-zA-Z]+$/.test(word) || word.length < 4) {
      result.push(word);
      continue;
    }

    // Skip all-caps words
    if (word === word.toUpperCase()) {
      result.push(word);
      continue;
    }

    // Check if in quotes
    const fullTextSoFar = words.slice(0, i).join('');
    if (isInQuotes(text, fullTextSoFar.length)) {
      result.push(word);
      continue;
    }

    // Check if looks like proper noun (capitalized mid-sentence)
    const sentenceContext = words.slice(Math.max(0, i - 20), i + 20).join('');
    if (looksLikeProperNoun(word, i, sentenceContext)) {
      result.push(word);
      continue;
    }

    // 10% chance to swap (reduced from 30%)
    if (chance(0.10)) {
      const synonym = getRandomSafeSynonym(word);
      if (synonym) {
        // Preserve capitalization
        if (/^[A-Z]/.test(word) && /^[a-z]/.test(synonym)) {
          result.push(synonym.charAt(0).toUpperCase() + synonym.slice(1));
        } else {
          result.push(synonym);
        }
        continue;
      }
    }

    result.push(word);
  }

  return result.join('');
}

// ==================== CHARACTER SHIELD (Optional) ====================

export function addInvisibleCharacters(text: string): string {
  const invisibleChars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    if (i % 7 === 0 && word.trim().length > 3) {
      const char = invisibleChars[Math.floor(Math.random() * invisibleChars.length)];
      const pos = Math.floor(word.length * 0.6);
      return word.slice(0, pos) + char + word.slice(pos);
    }
    return word;
  }).join('');
}

// ==================== 2b. SENTENCE REORDERING ====================

function reorderSentences(paragraph: string): string {
  const sentences = splitSentences(paragraph);
  if (sentences.length <= 2) return paragraph; // Too short to reorder

  const pronounPattern = /\b(he|she|it|they|this|that|these|those|his|her|its|their)\b/i;

  // Keep first and last in place, swap 20-30% of middle sentences
  const middle = sentences.slice(1, -1);
  if (middle.length <= 1) return paragraph;

  const swapCount = Math.max(1, Math.floor(middle.length * (0.2 + Math.random() * 0.1)));
  const result = [...middle];

  for (let s = 0; s < swapCount; s++) {
    const i = Math.floor(Math.random() * result.length);
    let j = Math.floor(Math.random() * result.length);
    // Avoid swapping with self
    while (j === i && result.length > 1) j = Math.floor(Math.random() * result.length);
    if (i === j) continue;

    // Check if swapping would break pronoun references
    const afterI = result.slice(Math.min(i, j) + 1).join(' ');
    const sentenceI = result[i];
    const sentenceJ = result[j];

    // If either sentence starts with a pronoun that might reference the other, skip
    if (pronounPattern.test(sentenceI.split(' ')[0]) || pronounPattern.test(sentenceJ.split(' ')[0])) {
      // 50% chance to skip pronoun-sensitive swaps
      if (chance(0.5)) continue;
    }

    [result[i], result[j]] = [result[j], result[i]];
  }

  return [sentences[0], ...result, sentences[sentences.length - 1]].join(' ');
}

// ==================== 2c. PUNCTUATION & FORMATTING NOISE ====================

const CONTRACTIONS: [string, string][] = [
  ["don't", "do not"], ["can't", "cannot"], ["won't", "will not"],
  ["isn't", "is not"], ["aren't", "are not"], ["wasn't", "was not"],
  ["weren't", "were not"], ["hasn't", "has not"], ["haven't", "have not"],
  ["hadn't", "had not"], ["doesn't", "does not"], ["didn't", "did not"],
  ["shouldn't", "should not"], ["wouldn't", "would not"], ["couldn't", "could not"],
  ["I'm", "I am"], ["you're", "you are"], ["he's", "he is"],
  ["she's", "she is"], ["it's", "it is"], ["we're", "we are"],
  ["they're", "they are"], ["I've", "I have"], ["you've", "you have"],
  ["we've", "we have"], ["they've", "they have"], ["I'll", "I will"],
  ["you'll", "you will"], ["he'll", "he will"], ["she'll", "she will"],
  ["we'll", "we will"], ["they'll", "they will"], ["I'd", "I would"],
  ["you'd", "you would"], ["he'd", "he would"], ["she'd", "she would"],
  ["let's", "let us"], ["that's", "that is"], ["there's", "there is"],
  ["here's", "here is"], ["what's", "what is"], ["who's", "who is"],
];

function addPunctuationNoise(text: string): string {
  let result = text;

  // 10% chance: double space between some sentences
  if (chance(0.10)) {
    const sentenceEnds = result.match(/([.!?])\s+/g);
    if (sentenceEnds) {
      const idx = Math.floor(Math.random() * sentenceEnds.length);
      const match = sentenceEnds[idx];
      result = result.replace(match, match[0] + '  ');
    }
  }

  // 5% chance: em-dash instead of comma (find a comma to replace)
  if (chance(0.05)) {
    const commas = Array.from(result.matchAll(/,\s/g));
    if (commas.length > 0) {
      const c = randomPick(commas);
      const before = result.slice(0, c.index);
      const after = result.slice(c.index + c[0].length);
      result = before + '—' + after;
    }
  }

  // 5% chance: semicolon between related sentences (replace ". " with "; ")
  if (chance(0.05)) {
    const periodSpaces = Array.from(result.matchAll(/\.\s+(?=[A-Z])/g));
    if (periodSpaces.length > 0) {
      const p = randomPick(periodSpaces);
      if (p.index !== undefined && p.index > 0) {
        const before = result.slice(0, p.index);
        const after = result.slice(p.index + p[0].length);
        result = before + '; ' + after.charAt(0).toLowerCase() + after.slice(1);
      }
    }
  }

  // Contractions expansion/randomization
  if (chance(0.15)) {
    const contraction = randomPick(CONTRACTIONS);
    const [short, expanded] = contraction;
    // Randomly go either direction
    if (chance(0.5)) {
      // Expand contraction
      result = result.replace(new RegExp(`\\b${short.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), expanded);
    } else {
      // Contract (only if expanded form exists)
      result = result.replace(new RegExp(`\\b${expanded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), short);
    }
  }

  return result;
}

// ==================== 2d. SENTENCE LENGTH MANIPULATION ====================

const FILLER_PHRASES = [
  'in my experience,',
  'from what I\'ve seen,',
  'I\'d argue that',
  'honestly,',
  'the way I see it,',
  'from my perspective,',
  'if you think about it,',
  'interestingly,',
  'to be fair,',
  'in practice,',
  'at least in my view,',
  'one thing that stands out is',
  'what strikes me is',
  'it\'s worth pointing out that',
  'as far as I can tell,',
];

function manipulateSentenceLengths(text: string): string {
  const sentences = splitSentences(text);
  const result: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const words = sentence.trim().split(/\s+/);
    const wc = words.length;

    // Merge two consecutive short sentences (both < 8 words) with 20% chance
    if (
      wc < 8 && i < sentences.length - 1 &&
      sentences[i + 1].trim().split(/\s+/).length < 8 &&
      chance(0.20)
    ) {
      const next = sentences[i + 1].trim();
      const conjunction = randomPick(['and', 'but', 'while', 'whereas']);
      const merged = sentence.trim().replace(/[.!?]+$/, '') + ', ' + conjunction + ' ' +
        next.charAt(0).toLowerCase() + next.slice(1);
      result.push(merged);
      i++; // Skip next sentence
      continue;
    }

    // Split long sentences (>30 words) at a natural break point with 30% chance
    if (wc > 30 && chance(0.30)) {
      // Find a natural break: comma, "and", "but", "which", "that"
      const text = sentence.trim();
      const breakPatterns = [
        /,\s+(?:and|but|or|while)\s+/gi,
        /,\s+(?:which|that|where|when|who)\s+/gi,
        /,\s+(?:however|therefore|moreover|furthermore)\s+/gi,
      ];

      let breakPoint = -1;
      let replacement = '. ';

      for (const pattern of breakPatterns) {
        const match = text.match(pattern);
        if (match && match.index !== undefined && match.index > 10 && match.index < text.length - 10) {
          breakPoint = match.index;
          // Start new sentence with the conjunction
          replacement = '. ' + match[0].replace(/,\s+/, '').charAt(0).toUpperCase() +
            match[0].replace(/,\s+/, '').slice(1);
          break;
        }
      }

      // Fallback: split at a comma in the middle
      if (breakPoint === -1) {
        const commas = Array.from(text.matchAll(/,\s+/g));
        const middleCommas = commas.filter(c => c.index !== undefined && c.index > text.length * 0.3 && c.index < text.length * 0.7);
        if (middleCommas.length > 0) {
          const c = randomPick(middleCommas);
          breakPoint = c.index!;
          replacement = '. ';
        }
      }

      if (breakPoint > 0) {
        const first = text.slice(0, breakPoint).replace(/[,:]$/, '');
        const second = text.slice(breakPoint).replace(/^,?\s*/, '');
        const secondCapitalized = second.charAt(0).toUpperCase() + second.slice(1);
        result.push(first + '. ' + secondCapitalized);
        continue;
      }
    }

    result.push(sentence);
  }

  return result.join(' ');
}

// ==================== 2e. WORD-LEVEL PERPLEXITY INJECTION ====================

function injectPerplexity(text: string): string {
  // Apply all collocation replacements
  return applyCollocation(text);
}

// ==================== 2f. PARAGRAPH STRUCTURE RANDOMIZATION ====================

function randomizeParagraphs(text: string): string {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length <= 1) return text;

  const result: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const sentences = splitSentences(p);

    // 20% chance to split a paragraph into two at a natural point
    if (sentences.length >= 4 && chance(0.20)) {
      const splitPoint = 1 + Math.floor(Math.random() * (sentences.length - 2));
      const first = sentences.slice(0, splitPoint).join(' ');
      const second = sentences.slice(splitPoint).join(' ');
      result.push(first);
      result.push(second);
      continue;
    }

    // 20% chance to merge with next paragraph if both are short
    if (
      i < paragraphs.length - 1 &&
      sentences.length <= 2 &&
      splitSentences(paragraphs[i + 1]).length <= 2 &&
      chance(0.20)
    ) {
      result.push(p + ' ' + paragraphs[i + 1]);
      i++; // Skip next paragraph
      continue;
    }

    // 5% chance to add a one-sentence paragraph emphasis
    if (chance(0.05)) {
      // Extract a key sentence to emphasize
      if (sentences.length >= 3) {
        const emphasizeIdx = 1 + Math.floor(Math.random() * (sentences.length - 2));
        const emphasized = sentences[emphasizeIdx];
        const remaining = sentences.filter((_, idx) => idx !== emphasizeIdx);
        result.push(remaining.join(' '));
        result.push(emphasized);
        continue;
      }
    }

    result.push(p);
  }

  return joinParagraphs(result);
}

// ==================== MAIN POST-PROCESS FUNCTION ====================

export interface PostProcessOptions {
  light?: boolean; // If true, apply lighter version (for Layer 4)
  characterShield?: boolean; // If true, insert invisible Unicode chars to disrupt detectors
}

/**
 * Apply all non-LLM post-processing transformations.
 * Each transformation is randomized, so the same input produces different output each time.
 */
export function postprocess(text: string, options?: PostProcessOptions): string {
  const light = options?.light ?? false;
  let result = text;

  // Step 1: Collocation replacements (always)
  result = injectPerplexity(result);

  if (light) {
    // Light version: only synonym swapping + light punctuation
    result = swapSynonyms(result);
    if (chance(0.5)) result = addPunctuationNoise(result);
    return result;
  }

  // Step 2: Synonym swapping
  result = swapSynonyms(result);

  // Step 3: Punctuation & formatting noise
  result = addPunctuationNoise(result);

  // Step 4: Sentence length manipulation
  result = manipulateSentenceLengths(result);

  // Step 5: Sentence reordering within paragraphs
  const paragraphs = splitParagraphs(result);
  const reorderedParagraphs = paragraphs.map(p => reorderSentences(p));
  result = joinParagraphs(reorderedParagraphs);

  // Step 6: Paragraph structure randomization
  result = randomizeParagraphs(result);

  // Step 7: Additional random collocation pass
  for (let i = 0; i < 3; i++) {
    result = applyRandomCollocation(result);
  }

  // Clean up: normalize whitespace but keep intentional double spaces between sentences
  result = result
    .replace(/  +/g, (match) => {
      // Keep intentional double spaces (between sentences)
      if (/[.!?]  /.test(match)) return '  ';
      return ' ';
    })
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();

  // Optional: Character Shield
  if (options?.characterShield) {
    result = addInvisibleCharacters(result);
  }

  return result;
}
