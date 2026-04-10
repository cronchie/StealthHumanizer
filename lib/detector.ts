// StealthHumanizer v2 - Advanced AI Detection Engine

import { DetectionResult, SentenceDetectionResult } from './types';
import { calculateReadability } from './readability';
import type { CorpusStyleModel, CalibratedThresholds } from './style-model';

// ==================== PATTERN DATABASES ====================

const AI_PHRASES = [
  'it is important to note', 'it is worth mentioning', 'it is worth noting',
  'in conclusion', 'in summary', 'to summarize', 'to conclude',
  'furthermore', 'moreover', 'additionally', 'in addition',
  'it is crucial', 'it is essential', 'it is imperative',
  'plays a crucial role', 'plays an important role', 'plays a pivotal role',
  'has the potential to', 'it is evident that', 'it is clear that',
  'demonstrates the', 'illustrates the', 'showcases the',
  'underscores the', 'highlights the', 'emphasizes the',
  'on the other hand', 'in terms of', 'when it comes to',
  'as previously mentioned', 'as discussed earlier', 'as noted above',
  'it should be noted', 'it must be noted', 'needless to say',
  'last but not least', 'first and foremost', 'at the end of the day',
  'in today\'s world', 'in this day and age', 'in the modern era',
  'in the contemporary landscape', 'in the current landscape',
  'a myriad of', 'delve into', 'delves into',
  'tapestry of', 'navigating the landscape',
  'multifaceted', 'robust', 'seamless', 'streamline',
  'synergy', 'paradigm', 'paradigm shift', 'holistic',
  'innovative', 'cutting-edge', 'state-of-the-art', 'groundbreaking',
  'transformative', 'comprehensive', 'unprecedented',
  'utilize', 'facilitate', 'optimize', 'leverage',
  'implement', 'foster', 'cultivate', 'empower',
  'embark on a journey', 'sheds light on', 'brings to the forefront',
];

const AI_SENTENCE_STARTERS = [
  'In this article', 'This paper', 'This study', 'This research',
  'The results', 'The findings', 'The analysis', 'The data',
  'It is widely', 'It is commonly', 'There is a',
  'One of the', 'Another important', 'A key aspect',
  'The importance of', 'The significance of', 'The role of',
  'Research has shown', 'Studies have shown', 'Evidence suggests',
];

const HEDGING_PHRASES = [
  'it could be argued', 'one might consider', 'it is possible that',
  'it would seem', 'this suggests that', 'this may indicate',
  'it appears that', 'this could potentially', 'one could argue',
];

const QUANTIFIERS = [
  'numerous', 'various', 'multiple', 'several', 'a variety of',
  'a multitude of', 'a range of', 'a number of', 'countless',
  'a vast array of', 'a wide range of', 'a significant number of',
];

const TRANSITION_WORDS = [
  'however', 'therefore', 'moreover', 'furthermore', 'additionally',
  'consequently', 'nevertheless', 'meanwhile', 'subsequently', 'thus',
  'hence', 'accordingly', 'similarly', 'likewise', 'conversely',
  'otherwise', 'instead', 'rather', 'yet', 'still', 'moreover',
];

const HUMAN_INDICATORS = [
  'basically', 'actually', 'literally', 'honestly', 'like',
  'you know', 'I mean', 'kind of', 'sort of', 'pretty much',
  'I think', 'I feel like', 'I guess', 'I\'d say', 'to be honest',
  'weirdly', 'interestingly', 'funnily enough', 'surprisingly',
  'anyway', 'so yeah', 'I dunno', 'tbh', 'imo',
];

// ==================== CORE ANALYSIS FUNCTIONS ====================

function splitIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = '';
  let i = 0;
  const abbreviations = ['Mr.', 'Mrs.', 'Dr.', 'Prof.', 'Inc.', 'Ltd.', 'etc.', 'e.g.', 'i.e.', 'vs.', 'al.'];

  while (i < text.length) {
    current += text[i];
    if (['.', '!', '?'].includes(text[i])) {
      const beforeMatch = text.slice(Math.max(0, i - 5), i + 1);
      if (!abbreviations.some(abbr => beforeMatch.endsWith(abbr))) {
        if (text[i + 1] === '"' || text[i + 1] === "'") { current += text[i + 1]; i++; }
        const trimmed = current.trim();
        if (trimmed.length > 0) sentences.push(trimmed);
        current = '';
      }
    }
    i++;
  }
  const trimmed = current.trim();
  if (trimmed.length > 0) sentences.push(trimmed);
  return sentences;
}

function calculatePerplexity(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 5) return 50;
  const freq: Record<string, number> = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const values = Object.values(freq);
  const maxFreq = Math.max(...values);
  const avgFreq = words.length / values.length;
  const uniformity = maxFreq / avgFreq;
  // N-gram analysis for perplexity
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) bigrams.push(words[i] + ' ' + words[i + 1]);
  const bigramFreq: Record<string, number> = {};
  bigrams.forEach(b => bigramFreq[b] = (bigramFreq[b] || 0) + 1);
  const uniqueBigrams = Object.keys(bigramFreq).length;
  const bigramDiversity = uniqueBigrams / bigrams.length;
  // Higher diversity + lower uniformity = higher perplexity (more human)
  const score = (bigramDiversity * 60) + ((100 - uniformity * 15) * 0.4);
  return Math.min(100, Math.max(0, score));
}

function calculateBurstiness(sentences: string[]): number {
  if (sentences.length < 3) return 50;
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const burstiness = (stdDev / avg) * 100;
  return Math.min(100, burstiness * 2.5);
}

function calculateVocabularyDiversity(text: string): number {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  if (words.length < 10) return 50;
  return (new Set(words).size / words.length) * 100;
}

function calculateSentenceLengthVariation(sentences: string[]): number {
  if (sentences.length < 3) return 50;
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const max = Math.max(...lengths);
  const min = Math.min(...lengths);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  return Math.min(100, ((max - min) / avg) * 60);
}

function calculateTransitionFrequency(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 10) return 50;
  let count = 0;
  const lower = text.toLowerCase();
  TRANSITION_WORDS.forEach(w => {
    const regex = new RegExp(`\\b${w}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  });
  return Math.min(100, (count / words.length) * 1000);
}

function calculatePassiveVoiceRatio(text: string): number {
  const sentences = splitIntoSentences(text);
  if (sentences.length < 2) return 50;
  const patterns = [
    /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
    /\b(is|are|was|were|been|being)\s+\w+en\b/gi,
  ];
  let passiveCount = 0;
  sentences.forEach(s => patterns.forEach(p => {
    const m = s.match(p); if (m) passiveCount += m.length;
  }));
  return Math.min(100, (passiveCount / sentences.length) * 100);
}

function calculateAIPhraseDensity(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  AI_PHRASES.forEach(phrase => { if (lower.includes(phrase)) count++; });
  return Math.min(100, (count / Math.max(splitIntoSentences(text).length, 1)) * 20);
}

function calculateSentenceStartDiversity(sentences: string[]): number {
  if (sentences.length < 4) return 50;
  const starts = sentences.map(s => s.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, ''));
  const uniqueStarts = new Set(starts);
  return (uniqueStarts.size / starts.length) * 100;
}

function calculatePronounUsage(text: string): number {
  const personalPronouns = ['I', 'me', 'my', 'we', 'us', 'our', 'you', 'your'];
  const words = text.split(/\s+/);
  let count = 0;
  words.forEach(w => { if (personalPronouns.includes(w)) count++; });
  const ratio = (count / Math.max(words.length, 1)) * 500;
  return Math.min(100, ratio);
}

function calculateHedgingFrequency(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  HEDGING_PHRASES.forEach(phrase => { if (lower.includes(phrase)) count++; });
  return Math.min(100, count * 15);
}

function calculateQuantifierOveruse(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  QUANTIFIERS.forEach(q => {
    const regex = new RegExp(`\\b${q}\\b`, 'gi');
    const m = lower.match(regex); if (m) count += m.length;
  });
  return Math.min(100, count * 10);
}

// ==================== SENTENCE-LEVEL ANALYSIS ====================

function analyzeSentence(sentence: string): SentenceDetectionResult {
  const issues: string[] = [];
  let score = 50;

  const lower = sentence.toLowerCase();

  // AI phrases (heavy penalty)
  let aiPhraseCount = 0;
  AI_PHRASES.forEach(phrase => {
    if (lower.includes(phrase)) { aiPhraseCount++; issues.push(`AI phrase: "${phrase}"`); }
  });
  score -= aiPhraseCount * 22;

  // AI sentence starters
  AI_SENTENCE_STARTERS.forEach(starter => {
    if (lower.startsWith(starter.toLowerCase())) {
      score -= 12;
      issues.push(`AI-like sentence opener`);
    }
  });

  // Sentence length
  const wordCount = sentence.split(/\s+/).length;
  if (wordCount > 35) { issues.push('Very long sentence'); score -= 18; }
  if (wordCount > 25) { issues.push('Long sentence (AI tendency)'); score -= 8; }
  if (wordCount <= 5 && wordCount >= 2) { score += 5; } // Short sentences are human-like

  // Formal vocabulary
  if (/\b(utilize|implement|facilitate|leverage|foster|cultivate|empower)\b/i.test(sentence)) {
    issues.push('Formal/AI vocabulary'); score -= 15;
  }

  // Passive voice
  if (/\b(is|are|was|were|been|being)\s+\w+ed\b/i.test(sentence)) {
    issues.push('Passive voice'); score -= 8;
  }

  // Hedging
  HEDGING_PHRASES.forEach(h => {
    if (lower.includes(h)) { issues.push('Hedging language'); score -= 10; }
  });

  // Quantifiers
  QUANTIFIERS.forEach(q => {
    if (lower.includes(q)) { score -= 6; }
  });

  // Human indicators (positive signals)
  let humanSignals = 0;
  HUMAN_INDICATORS.forEach(h => { if (lower.includes(h)) humanSignals++; });
  score += humanSignals * 3;

  // Contractions (human signal)
  const contractions = sentence.match(/\w+'(?:t|s|re|ve|ll|d|m)\b/gi);
  if (contractions) score += contractions.length * 2;

  // First person (human signal)
  if (/\b(I|me|my|we|us|our)\b/i.test(sentence)) { score += 4; }

  // Second person
  if (/\byou\b/i.test(sentence)) { score += 2; }

  // Questions (human signal)
  if (sentence.endsWith('?')) { score += 3; }

  // Exclamation
  if (sentence.endsWith('!')) { score += 2; }

  // Em-dashes (human signal)
  if (sentence.includes('—') || sentence.includes(' - ')) { score += 2; }

  // Parenthetical asides
  if (/\([^)]+\)/.test(sentence)) { score += 3; }

  // Starts with conjunction
  if (/^(and|but|so|because|also|plus|or|well|ok|hey)\b/i.test(sentence)) { score += 3; }

  // Uniform structure penalty
  if (/^(\w+\s+){8,20}\w+[.!?]$/.test(sentence)) {
    issues.push('Uniform structure'); score -= 18;
  }

  score = Math.max(0, Math.min(100, score));

  let classification: 'human' | 'maybe' | 'ai';
  const sFloor = calibratedThresholds?.humanScoreMin ?? 60;
  const sMid = Math.max(20, sFloor - 20);
  if (score >= sFloor) classification = 'human';
  else if (score >= sMid) classification = 'maybe';
  else classification = 'ai';

  return { text: sentence, score, classification, issues };
}

// ==================== MAIN DETECTION FUNCTION ====================

/** Corpus-calibrated thresholds (set via calibrateWithCorpus) */
let calibratedThresholds: CalibratedThresholds | null = null;

/**
 * Calibrate the detector against corpus statistics.
 * Adjusts weights and thresholds based on real human writing patterns.
 */
export function calibrateWithCorpus(styleModel: CorpusStyleModel): CalibratedThresholds {
  const burstinessFloor = Math.round(styleModel.burstinessProfile.mean * 50);
  const vocabularyFloor = Math.round(styleModel.vocabularyDiversityRange.mean * 85);
  const totalTransitions = Object.values(styleModel.transitionWordFrequency)
    .reduce((sum, v) => sum + v, 0);
  const transitionCeiling = Math.round(totalTransitions * 200);

  calibratedThresholds = {
    humanScoreMin: 45,
    humanScoreMax: 95,
    humanScoreMedian: 70,
    targetScore: 75,
    burstinessFloor,
    vocabularyFloor,
    transitionCeiling,
  };
  return calibratedThresholds;
}

/**
 * Get the realistic score range for human writing based on corpus analysis.
 */
export function getHumanScoreRange(): { min: number; max: number; median: number } {
  if (calibratedThresholds) {
    return {
      min: calibratedThresholds.humanScoreMin,
      max: calibratedThresholds.humanScoreMax,
      median: calibratedThresholds.humanScoreMedian,
    };
  }
  return { min: 50, max: 90, median: 70 };
}

export function detectAI(text: string): DetectionResult {
  const sentences = splitIntoSentences(text);
  const sentenceResults = sentences.map(analyzeSentence);

  const perplexity = calculatePerplexity(text);
  const burstiness = calculateBurstiness(sentences);
  const vocabularyDiversity = calculateVocabularyDiversity(text);
  const sentenceLengthVariation = calculateSentenceLengthVariation(sentences);
  const transitionFrequency = calculateTransitionFrequency(text);
  const passiveVoiceRatio = calculatePassiveVoiceRatio(text);
  const aiPhraseDensity = calculateAIPhraseDensity(text);
  const sentenceStartDiversity = calculateSentenceStartDiversity(sentences);
  const pronounUsage = calculatePronounUsage(text);
  const hedgingFrequency = calculateHedgingFrequency(text);
  const quantifierOveruse = calculateQuantifierOveruse(text);

  const weights = {
    sentenceAvg: 0.25,
    perplexity: 0.15,
    burstiness: 0.15,
    vocabulary: 0.05,
    sentenceVariation: 0.08,
    transitions: 0.08,
    passive: 0.05,
    aiPhrases: 0.12,
    sentenceStart: 0.05,
    pronoun: 0.03,
    hedging: 0.03,
    quantifier: 0.02,
  };

  const sentenceAvg = sentenceResults.length > 0
    ? sentenceResults.reduce((s, r) => s + r.score, 0) / sentenceResults.length : 50;

  const overallScore = (
    sentenceAvg * weights.sentenceAvg +
    perplexity * weights.perplexity +
    burstiness * weights.burstiness +
    vocabularyDiversity * weights.vocabulary +
    sentenceLengthVariation * weights.sentenceVariation +
    (100 - transitionFrequency) * weights.transitions +
    (100 - passiveVoiceRatio) * weights.passive +
    (100 - aiPhraseDensity) * weights.aiPhrases +
    sentenceStartDiversity * weights.sentenceStart +
    pronounUsage * weights.pronoun +
    (100 - hedgingFrequency) * weights.hedging +
    (100 - quantifierOveruse) * weights.quantifier
  );

  let overallVerdict: 'human' | 'ai' | 'mixed';
  const humanFloor = calibratedThresholds?.humanScoreMin ?? 60;
  const mixedFloor = Math.max(20, humanFloor - 20);
  if (overallScore >= humanFloor) overallVerdict = 'human';
  else if (overallScore >= mixedFloor) overallVerdict = 'mixed';
  else overallVerdict = 'ai';

  return {
    score: Math.round(overallScore),
    sentences: sentenceResults,
    overallVerdict,
    analysis: {
      perplexity: Math.round(perplexity),
      burstiness: Math.round(burstiness),
      vocabularyDiversity: Math.round(vocabularyDiversity),
      sentenceLengthVariation: Math.round(sentenceLengthVariation),
      transitionFrequency: Math.round(transitionFrequency),
      passiveVoiceRatio: Math.round(passiveVoiceRatio),
      aiPhraseDensity: Math.round(aiPhraseDensity),
      sentenceStartDiversity: Math.round(sentenceStartDiversity),
      pronounUsage: Math.round(pronounUsage),
      hedgingFrequency: Math.round(hedgingFrequency),
      quantifierOveruse: Math.round(quantifierOveruse),
    },
    readability: calculateReadability(text),
  };
}

// ==================== UTILITY FUNCTIONS ====================

export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

export function getClassificationColor(classification: 'human' | 'maybe' | 'ai'): string {
  switch (classification) {
    case 'human': return 'bg-green-500/20 border-green-500/50';
    case 'maybe': return 'bg-yellow-500/20 border-yellow-500/50';
    case 'ai': return 'bg-red-500/20 border-red-500/50';
  }
}

export function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}
