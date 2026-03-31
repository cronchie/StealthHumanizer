// Type definitions for StealthHumanizer

export type RewriteLevel = 'light' | 'medium' | 'aggressive';
export type StylePreset = 'academic' | 'casual' | 'professional';
export type ModelProvider = 'gemini' | 'openai' | 'claude';

export interface ApiKeys {
  gemini?: string;
  openai?: string;
  claude?: string;
}

export interface HumanizationOptions {
  level: RewriteLevel;
  style: StylePreset;
  model: ModelProvider;
}

export interface SentenceResult {
  original: string;
  humanized: string;
  alternatives?: string[];
  index: number;
}

export interface HumanizationResult {
  sentences: SentenceResult[];
  fullText: string;
  model: ModelProvider;
  wordCount: {
    input: number;
    output: number;
  };
  timestamp: number;
}

export interface DetectionResult {
  score: number; // 0-100, higher = more human
  sentences: SentenceDetectionResult[];
  overallVerdict: 'human' | 'ai' | 'mixed';
  analysis: {
    perplexity: number;
    burstiness: number;
    vocabularyDiversity: number;
    sentenceLengthVariation: number;
    transitionFrequency: number;
    passiveVoiceRatio: number;
  };
}

export interface SentenceDetectionResult {
  text: string;
  score: number; // 0-100, higher = more human
  classification: 'human' | 'maybe' | 'ai';
  issues: string[];
}

export interface HistoryEntry {
  id: string;
  originalText: string;
  humanizedText: string;
  options: HumanizationOptions;
  wordCount: {
    input: number;
    output: number;
  };
  timestamp: number;
  model: ModelProvider;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
