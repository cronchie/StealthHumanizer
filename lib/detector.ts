import { DetectionResult, SentenceDetectionResult } from './types';

// Common AI-generated text patterns
const AI_PHRASES = [
  'it is important to note',
  'it is worth mentioning',
  'in conclusion',
  'in summary',
  'to summarize',
  'furthermore',
  'moreover',
  'additionally',
  'in addition',
  'it is crucial',
  'it is essential',
  'plays a crucial role',
  'plays an important role',
  'has the potential to',
  'it is evident that',
  'it is clear that',
  'demonstrates the',
  'illustrates the',
  'showcases the',
  'underscores the',
  'highlights the',
  'on the other hand',
  'in terms of',
  'when it comes to',
  'as previously mentioned',
  'as discussed earlier',
  'it should be noted',
  'it must be noted',
  'needless to say',
  'last but not least',
  'first and foremost',
  'at the end of the day',
  'in today\'s world',
  'in this day and age',
  'in the modern era',
  'comprehensive',
  'multifaceted',
  'nuanced',
  'robust',
  'seamless',
  'leverage',
  'utilize',
  'facilitate',
  'optimize',
  'streamline',
  'synergy',
  'paradigm',
  'holistic',
  'innovative',
  'cutting-edge',
  'state-of-the-art',
];

const TRANSITION_WORDS = [
  'however', 'therefore', 'moreover', 'furthermore', 'additionally',
  'consequently', 'nevertheless', 'meanwhile', 'subsequently', 'thus',
  'hence', 'accordingly', 'similarly', 'likewise', 'conversely',
  'otherwise', 'instead', 'rather', 'yet', 'still',
];

const FILLER_WORDS = [
  'basically', 'actually', 'literally', 'honestly', 'like',
  'you know', 'I mean', 'kind of', 'sort of', 'pretty much',
];

// Split text into sentences
function splitIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = '';
  let i = 0;

  while (i < text.length) {
    current += text[i];

    // Check for sentence endings
    if (['.', '!', '?'].includes(text[i])) {
      // Check if it's an abbreviation
      const beforeMatch = text.slice(Math.max(0, i - 5), i + 1);
      const abbreviations = ['Mr.', 'Mrs.', 'Dr.', 'Prof.', 'Inc.', 'Ltd.', 'etc.', 'e.g.', 'i.e.', 'vs.'];

      if (!abbreviations.some(abbr => beforeMatch.endsWith(abbr))) {
        // Check for quote marks
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

// Calculate perplexity approximation (simplified)
function calculatePerplexity(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 5) return 50;

  // Check for repetitive patterns
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // High repetition suggests AI
  const maxFreq = Math.max(...Object.values(wordFreq));
  const avgFreq = words.length / Object.keys(wordFreq).length;

  // AI text tends to have more uniform distribution
  const uniformityScore = maxFreq / avgFreq;

  // Normalize to 0-100 (higher = more AI-like = lower perplexity)
  return Math.min(100, Math.max(0, 100 - (uniformityScore * 15)));
}

// Calculate burstiness (variation in sentence structure)
function calculateBurstiness(sentences: string[]): number {
  if (sentences.length < 3) return 50;

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  // Calculate variance
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Human text has higher burstiness (more variation)
  // AI text is more uniform
  const burstiness = (stdDev / avgLength) * 100;

  return Math.min(100, burstiness * 2);
}

// Calculate vocabulary diversity
function calculateVocabularyDiversity(text: string): number {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  if (words.length < 10) return 50;

  const uniqueWords = new Set(words);
  const diversity = (uniqueWords.size / words.length) * 100;

  return diversity;
}

// Calculate sentence length variation
function calculateSentenceLengthVariation(sentences: string[]): number {
  if (sentences.length < 3) return 50;

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const max = Math.max(...lengths);
  const min = Math.min(...lengths);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  // High variation is human-like
  const variation = ((max - min) / avg) * 50;
  return Math.min(100, variation);
}

// Calculate transition word frequency
function calculateTransitionFrequency(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 10) return 50;

  let transitionCount = 0;
  const lowerText = text.toLowerCase();

  TRANSITION_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) transitionCount += matches.length;
  });

  // AI tends to overuse formal transitions
  const frequency = (transitionCount / words.length) * 1000;

  // Higher frequency suggests AI
  return Math.min(100, frequency * 10);
}

// Calculate passive voice ratio
function calculatePassiveVoiceRatio(text: string): number {
  const sentences = splitIntoSentences(text);
  if (sentences.length < 2) return 50;

  // Simple passive voice detection (was/were/is/are/been + past participle)
  const passivePatterns = [
    /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
    /\b(is|are|was|were|been|being)\s+\w+en\b/gi,
    /\b(is|are|was|were|been|being)\s+\w+t\b/gi,
  ];

  let passiveCount = 0;
  sentences.forEach(sentence => {
    passivePatterns.forEach(pattern => {
      const matches = sentence.match(pattern);
      if (matches) passiveCount += matches.length;
    });
  });

  const ratio = (passiveCount / sentences.length) * 100;
  return Math.min(100, ratio);
}

// Detect AI phrases
function detectAIPhrases(text: string): number {
  const lowerText = text.toLowerCase();
  let count = 0;

  AI_PHRASES.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      count += phrase.split(' ').length;
    }
  });

  const words = text.split(/\s+/).length;
  const ratio = (count / words) * 100;

  return Math.min(100, ratio * 5);
}

// Analyze a single sentence
function analyzeSentence(sentence: string): SentenceDetectionResult {
  const issues: string[] = [];
  let score = 70; // Start with neutral-human score

  // Check for AI phrases
  const lowerSentence = sentence.toLowerCase();
  let aiPhraseCount = 0;
  AI_PHRASES.forEach(phrase => {
    if (lowerSentence.includes(phrase)) {
      aiPhraseCount++;
      issues.push(`AI-like phrase: "${phrase}"`);
    }
  });
  score -= aiPhraseCount * 15;

  // Check sentence length
  const words = sentence.split(/\s+/).length;
  if (words > 30) {
    issues.push('Very long sentence (AI tends to write long sentences)');
    score -= 10;
  }

  // Check for formal language
  if (/\b(utilize|implement|facilitate|leverage)\b/i.test(sentence)) {
    issues.push('Formal/AI-like vocabulary');
    score -= 10;
  }

  // Check for passive voice
  if (/\b(is|are|was|were)\s+\w+ed\b/i.test(sentence)) {
    issues.push('Passive voice detected');
    score -= 5;
  }

  // Check for filler words (human indicator)
  let fillerCount = 0;
  FILLER_WORDS.forEach(filler => {
    if (lowerSentence.includes(filler)) {
      fillerCount++;
    }
  });
  score += fillerCount * 10;

  // Check for contractions (human indicator)
  if (/\w+\'(t|s|re|ve|ll|d|m)\b/i.test(sentence)) {
    score += 8;
  }

  // Check for first person (human indicator)
  if (/\b(I|me|my|we|us|our)\b/i.test(sentence)) {
    score += 5;
  }

  // Check for very uniform structure (AI indicator)
  if (/^(\w+\s+){5,15}\w+[.!?]$/.test(sentence)) {
    issues.push('Uniform sentence structure');
    score -= 15;
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  let classification: 'human' | 'maybe' | 'ai';
  if (score >= 60) classification = 'human';
  else if (score >= 40) classification = 'maybe';
  else classification = 'ai';

  return {
    text: sentence,
    score,
    classification,
    issues,
  };
}

// Main detection function
export function detectAI(text: string): DetectionResult {
  const sentences = splitIntoSentences(text);

  // Analyze each sentence
  const sentenceResults = sentences.map(analyzeSentence);

  // Calculate overall metrics
  const perplexity = calculatePerplexity(text);
  const burstiness = calculateBurstiness(sentences);
  const vocabularyDiversity = calculateVocabularyDiversity(text);
  const sentenceLengthVariation = calculateSentenceLengthVariation(sentences);
  const transitionFrequency = calculateTransitionFrequency(text);
  const passiveVoiceRatio = calculatePassiveVoiceRatio(text);
  const aiPhraseScore = detectAIPhrases(text);

  // Calculate overall score (weighted average)
  const weights = {
    sentenceAvg: 0.3,
    perplexity: 0.15,
    burstiness: 0.15,
    vocabulary: 0.1,
    sentenceVariation: 0.1,
    transitions: 0.1,
    passive: 0.05,
    aiPhrases: 0.05,
  };

  const sentenceAvg = sentenceResults.length > 0
    ? sentenceResults.reduce((sum, s) => sum + s.score, 0) / sentenceResults.length
    : 50;

  const overallScore = (
    sentenceAvg * weights.sentenceAvg +
    perplexity * weights.perplexity +
    burstiness * weights.burstiness +
    vocabularyDiversity * weights.vocabulary +
    sentenceLengthVariation * weights.sentenceVariation +
    (100 - transitionFrequency) * weights.transitions +
    (100 - passiveVoiceRatio) * weights.passive +
    (100 - aiPhraseScore) * weights.aiPhrases
  );

  // Determine overall verdict
  let overallVerdict: 'human' | 'ai' | 'mixed';
  if (overallScore >= 60) overallVerdict = 'human';
  else if (overallScore >= 40) overallVerdict = 'mixed';
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
    },
  };
}

export function getVerdictColor(verdict: 'human' | 'ai' | 'mixed'): string {
  switch (verdict) {
    case 'human': return 'text-green-500';
    case 'ai': return 'text-red-500';
    case 'mixed': return 'text-yellow-500';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 60) return 'text-green-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function getClassificationColor(classification: 'human' | 'maybe' | 'ai'): string {
  switch (classification) {
    case 'human': return 'bg-green-500/20 border-green-500/50';
    case 'maybe': return 'bg-yellow-500/20 border-yellow-500/50';
    case 'ai': return 'bg-red-500/20 border-red-500/50';
  }
}
