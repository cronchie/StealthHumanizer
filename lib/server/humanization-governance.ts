import fs from 'node:fs/promises';
import path from 'node:path';
import { tokenizeWords } from '@/lib/server/text-utils';

function tokenize(text: string): string[] {
  return tokenizeWords(text);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 1;
  const intersection = Array.from(a).reduce((count, item) => (b.has(item) ? count + 1 : count), 0);
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function evaluateMeaningRetention(original: string, rewritten: string) {
  const a = new Set(tokenize(original));
  const b = new Set(tokenize(rewritten));
  const lexicalOverlap = jaccard(a, b);
  const originalWords = tokenize(original).length;
  const rewrittenWords = tokenize(rewritten).length;
  const lengthRatio = originalWords > 0 ? rewrittenWords / originalWords : 1;
  return { lexicalOverlap, lengthRatio };
}

export function applyRewriteRegressionGuard(input: {
  originalText: string;
  candidateText: string;
  fallbackText: string;
  minLexicalOverlap?: number;
  minLengthRatio?: number;
  maxLengthRatio?: number;
}) {
  const {
    originalText,
    candidateText,
    fallbackText,
    minLexicalOverlap = 0.3,
    minLengthRatio = 0.45,
    maxLengthRatio = 1.9,
  } = input;
  const retention = evaluateMeaningRetention(originalText, candidateText);
  const failed =
    retention.lexicalOverlap < minLexicalOverlap ||
    retention.lengthRatio < minLengthRatio ||
    retention.lengthRatio > maxLengthRatio;

  return {
    usedFallback: failed,
    reason: failed ? 'meaning_or_length_guard_triggered' : 'guard_passed',
    retention,
    text: failed ? fallbackText : candidateText,
  };
}

export function buildConfidenceReport(humanScore: number) {
  const normalized = Math.max(0, Math.min(100, Number(humanScore) || 0));
  const confidence = Math.round(Math.min(100, Math.abs(normalized - 50) * 2));
  return {
    humanLikenessScore: normalized,
    confidence,
    calibrationBand:
      confidence >= 75 ? 'high' : confidence >= 45 ? 'medium' : 'low',
  };
}

const BLOCKED_PATTERNS = [
  /bypass (ai|aigc|plagiarism) detector/i,
  /undetectable cheating/i,
  /fake (citation|references|sources)/i,
  /impersonat(e|ing) (a|an) (student|researcher|author)/i,
];

export function enforceSafetyPolicy(text: string) {
  const matches = BLOCKED_PATTERNS.filter((pattern) => pattern.test(text || ''));
  return {
    blocked: matches.length > 0,
    reasons: matches.map((pattern) => pattern.source),
    safeUseGuidance:
      'Use this tool for clarity and style improvement, not deception, impersonation, or fraudulent academic use.',
  };
}

export async function appendAuditLog(event: Record<string, unknown>) {
  try {
    const root = path.resolve(process.cwd(), 'data/governance/audit');
    await fs.mkdir(root, { recursive: true });
    const filePath = path.join(root, 'humanization-events.jsonl');
    await fs.appendFile(filePath, `${JSON.stringify(event)}\n`, 'utf8');
  } catch {
    // Do not fail request on audit log write errors.
  }
}
