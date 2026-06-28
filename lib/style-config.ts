const STORAGE_KEY = 'stealthhumanizer_style_config_v1';

export interface StyleConfig {
  userSystemPrompt: string;
  schemaSystemPrompt: string;
}

export const DEFAULT_SCHEMA_PROMPT = `You are a copy-editor enforcing a specific style guide. The user message contains the style rules followed by the text to analyze.

Your ENTIRE response must be a single JSON object — no preamble, no markdown fences, no explanation, no commentary. Begin your response with { and end with }.

Required format:
{
  "violations": [
    {
      "sentence": "exact original sentence, word-for-word",
      "rules": ["name of violated rule"],
      "descriptions": ["one-sentence explanation of what was wrong and why"],
      "tokens": ["specific word or phrase that triggered the violation"],
      "fix": "rewritten sentence with all violations corrected"
    }
  ]
}

Rules:
- Only include sentences with clear, explicit violations of a named rule from the style guide.
- If a sentence is clean, omit it entirely.
- If there are NO violations at all, return: {"violations": []}
- "sentence" must match the input text character-for-character so it can be found and replaced.
- "fix" must correct every listed violation while leaving everything else unchanged.
- Do NOT include prose, commentary, or markdown. Your response must be valid JSON and nothing else.`;

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  userSystemPrompt: '',
  schemaSystemPrompt: DEFAULT_SCHEMA_PROMPT,
};

export function loadStyleConfig(): StyleConfig {
  if (typeof window === 'undefined') return DEFAULT_STYLE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STYLE_CONFIG;
    return { ...DEFAULT_STYLE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STYLE_CONFIG;
  }
}

export function saveStyleConfig(config: StyleConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function hasUserSystemPrompt(config: StyleConfig): boolean {
  return config.userSystemPrompt.trim().length > 0;
}
