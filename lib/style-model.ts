/**
 * Style Model — Loads corpus style statistics and provides calibrated
 * constraints for the humanizer engine.
 *
 * Server-only module: file I/O uses dynamic require that webpack/Next.js
 * cannot statically analyze, preventing Node.js built-ins from leaking
 * into client bundles.
 */

// ==================== TYPES ====================

export interface SentenceLengthDistribution {
  mean: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
}

export interface BurstinessProfile {
  mean: number;
  stddev: number;
}

export interface StyleRange {
  mean: number;
  stddev: number;
  min?: number;
  max?: number;
}

export interface PunctuationStats {
  emDashPer1000: StyleRange;
  semicolonPer1000: StyleRange;
  exclamationPer1000: StyleRange;
}

export interface CorpusStyleModel {
  generatedAt: string;
  paperCount: number;
  global: {
    avgSentenceLength: number;
    avgBurstiness: number;
    avgVocabularyDiversity: number;
    avgContractionFrequency: number;
    avgPassiveVoiceRatio: number;
    avgFirstPersonPronouns: number;
    avgHedgingFrequency: number;
    avgWordsPerParagraph: number;
  };
  byDomain: Record<string, {
    paperCount: number;
    sentenceLengthMean: number;
    burstinessMean: number;
    vocabularyDiversityMean: number;
    passiveVoiceMean: number;
  }>;
  sentenceLengthDistribution: SentenceLengthDistribution;
  burstinessProfile: BurstinessProfile;
  vocabularyDiversityRange: { min: number; max: number; mean: number };
  transitionWordFrequency: Record<string, number>;
  aiPhraseFrequency: Record<string, number>;
  contractionFrequency: StyleRange;
  passiveVoiceRatio: StyleRange;
  sentenceStarters: Record<string, number>;
  humanWritingExamples: string[];
  punctuation: PunctuationStats;
}

export interface StyleConstraints {
  sentenceLengthRange: { min: number; max: number; idealMean: number };
  burstinessTarget: number;
  vocabularyDiversityTarget: number;
  transitionWordBudget: number; // per 1000 words
  contractionTarget: number; // per 1000 words
  passiveVoiceTarget: number; // percentage
  firstPersonPronounTarget: number; // per 1000 words
  hedgingBudget: number; // per 1000 words
}

export interface CalibratedThresholds {
  humanScoreMin: number;
  humanScoreMax: number;
  humanScoreMedian: number;
  targetScore: number;
  burstinessFloor: number;
  vocabularyFloor: number;
  transitionCeiling: number;
}

// ==================== LOADING ====================

let cachedModel: CorpusStyleModel | null = null;

/** Check if we're in a Node.js environment */
function isNode(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

/** Dynamically require a Node.js built-in — webpack cannot statically analyze this. */
function nodeRequire(mod: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const _r = new Function('mod', 'return require(mod)');
  return _r(mod);
}

export function loadStyleModel(modelPath?: string): CorpusStyleModel | null {
  if (cachedModel) return cachedModel;
  if (!isNode()) return null;

  let fs: { readFileSync: (p: string, e: string) => string; existsSync: (p: string) => boolean };
  let pathMod: { resolve: (...parts: string[]) => string };

  try {
    fs = nodeRequire('node:fs') as typeof fs;
    pathMod = nodeRequire('node:path') as typeof pathMod;
  } catch {
    return null;
  }

  const base = __dirname;
  const paths = [
    modelPath,
    pathMod.resolve('data/models/corpus-style-model.json'),
    pathMod.resolve('../data/models/corpus-style-model.json'),
    pathMod.resolve(base, '../../data/models/corpus-style-model.json'),
  ].filter(Boolean);

  for (const p of paths) {
    try {
      if (fs.existsSync(p!)) {
        const raw = fs.readFileSync(p!, 'utf-8');
        cachedModel = JSON.parse(raw) as CorpusStyleModel;
        return cachedModel;
      }
    } catch {
      // try next
    }
  }

  return null;
}

// ==================== STYLE CONSTRAINTS ====================

/**
 * Get style constraints for a given domain (or global defaults).
 */
export function getStyleConstraints(domain?: string): StyleConstraints {
  const model = loadStyleModel();
  if (!model) {
    return getDefaultConstraints();
  }

  const domainData = domain && model.byDomain[domain]
    ? model.byDomain[domain]
    : null;

  const slDist = model.sentenceLengthDistribution;
  const burst = model.burstinessProfile;
  const vocab = model.vocabularyDiversityRange;

  const totalTransitions = Object.values(model.transitionWordFrequency)
    .reduce((sum, v) => sum + v, 0);

  return {
    sentenceLengthRange: {
      min: Math.max(4, slDist.p10),
      max: slDist.p90 + 5,
      idealMean: domainData?.sentenceLengthMean ?? slDist.mean,
    },
    burstinessTarget: domainData?.burstinessMean ?? burst.mean,
    vocabularyDiversityTarget: domainData?.vocabularyDiversityMean ?? vocab.mean,
    transitionWordBudget: totalTransitions,
    contractionTarget: model.contractionFrequency.mean,
    passiveVoiceTarget: domainData?.passiveVoiceMean ?? model.passiveVoiceRatio.mean,
    firstPersonPronounTarget: model.global.avgFirstPersonPronouns,
    hedgingBudget: model.global.avgHedgingFrequency,
  };
}

function getDefaultConstraints(): StyleConstraints {
  return {
    sentenceLengthRange: { min: 6, max: 35, idealMean: 20 },
    burstinessTarget: 0.35,
    vocabularyDiversityTarget: 0.55,
    transitionWordBudget: 3.5,
    contractionTarget: 1.0,
    passiveVoiceTarget: 15,
    firstPersonPronounTarget: 5,
    hedgingBudget: 8,
  };
}

// ==================== PROMPT BUILDER ====================

/**
 * Build a prompt section that tells the LLM to match corpus-calibrated
 * human writing patterns. These are concrete, measurable instructions.
 */
export function buildStyleInjectionPrompt(domain?: string): string {
  const model = loadStyleModel();
  const constraints = getStyleConstraints(domain);

  if (!model) {
    return '';
  }

  const sl = constraints.sentenceLengthRange;
  const examples = model.humanWritingExamples.slice(0, 5);

  const topStarters = Object.entries(model.sentenceStarters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  return `

=== CORPUS-CALIBRATED STYLE TARGETS ===
Based on analysis of ${model.paperCount.toLocaleString()} published papers, match these exact patterns:

1. SENTENCE LENGTH: Average ${sl.idealMean} words. Have sentences as short as ${sl.min} and as long as ${sl.max}. The burstiness coefficient (length variation) should be around ${constraints.burstinessTarget.toFixed(2)}.

2. VOCABULARY: Aim for ${Math.round(constraints.vocabularyDiversityTarget * 100)}% unique word ratio. Don't repeat the same words — use synonyms and rephrase.

3. TRANSITIONS: Use no more than ${constraints.transitionWordBudget.toFixed(1)} transition words per 1000 words total. That means roughly 1 transition per paragraph max. The corpus shows humans rarely chain transitions.

4. PASSIVE VOICE: Keep passive constructions around ${constraints.passiveVoiceTarget}% of sentences — not zero, but not dominant either.

5. CONTRACTIONS: Use contractions at roughly ${constraints.contractionTarget.toFixed(1)} per 1000 words — natural, not forced.

6. HEDGING: Hedging phrases at ${constraints.hedgingBudget.toFixed(1)} per 1000 words — use them, but don't overdo it.

7. COMMON SENTENCE STARTERS in this domain: ${topStarters.join(', ')}. Feel free to start sentences with these or with "And", "But", "So".

EXAMPLE sentences from real papers showing natural patterns:
${examples.map((e, i) => `${i + 1}. "${e}"`).join('\n')}
=== END STYLE TARGETS ===`;
}

// ==================== CALIBRATED THRESHOLDS ====================

/**
 * Get detection thresholds calibrated against real human writing from the corpus.
 */
export function getCorpusCalibratedThresholds(): CalibratedThresholds {
  const model = loadStyleModel();
  if (!model) {
    return {
      humanScoreMin: 50,
      humanScoreMax: 90,
      humanScoreMedian: 70,
      targetScore: 75,
      burstinessFloor: 20,
      vocabularyFloor: 50,
      transitionCeiling: 15,
    };
  }

  const burstinessFloor = Math.round(model.burstinessProfile.mean * 50);
  const vocabularyFloor = Math.round(model.vocabularyDiversityRange.mean * 85);

  const totalTransitions = Object.values(model.transitionWordFrequency)
    .reduce((sum, v) => sum + v, 0);
  const transitionCeiling = Math.round(totalTransitions * 200);

  return {
    humanScoreMin: 45,
    humanScoreMax: 95,
    humanScoreMedian: 70,
    targetScore: 75,
    burstinessFloor,
    vocabularyFloor,
    transitionCeiling,
  };
}

// ==================== UTILITY ====================

export function hasStyleModel(): boolean {
  return loadStyleModel() !== null;
}

export function getStyleModelInfo(): { loaded: boolean; paperCount?: number; generatedAt?: string } {
  const model = loadStyleModel();
  if (!model) return { loaded: false };
  return { loaded: true, paperCount: model.paperCount, generatedAt: model.generatedAt };
}
