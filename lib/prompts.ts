// StealthHumanizer v3 - Anti-Detection Prompt Engine
// Rewritten to actually defeat AI detectors by disrupting statistical fingerprints

import { RewriteLevel, StylePreset, TonePreset } from './types';

// ==================== TONE CONFIGURATIONS ====================

export const TONE_CONFIGS: Record<TonePreset, {
  name: string; personalityTraits: string[]; vocabularyPreferences: string[];
  writingPatterns: string[];
}> = {
  'academic-formal': {
    name: 'Academic Formal',
    personalityTraits: ['rigorous', 'evidence-based', 'precise', 'measured'],
    vocabularyPreferences: ['demonstrates', 'suggests', 'indicates', 'argues', 'contends', 'posits'],
    writingPatterns: ['thesis-evidence structure', 'hedging language', 'citation-style references', 'counterarguments'],
  },
  'academic-casual': {
    name: 'Academic Casual',
    personalityTraits: ['thoughtful', 'accessible', 'curious', 'balanced'],
    vocabularyPreferences: ['think about', 'look at', 'interesting', 'makes sense', 'worth noting', 'raises the question'],
    writingPatterns: ['conversational academic tone', 'occasional first person', 'relatable examples', 'questions to reader'],
  },
  'journalistic': {
    name: 'Journalistic',
    personalityTraits: ['direct', 'informative', 'engaging', 'fact-driven'],
    vocabularyPreferences: ['according to', 'reports show', 'experts say', 'data reveals', 'investigation found'],
    writingPatterns: ['inverted pyramid', 'short punchy paragraphs', 'direct quotes', 'attributed claims'],
  },
  'creative-writing': {
    name: 'Creative Writing',
    personalityTraits: ['imaginative', 'expressive', 'evocative', 'unique voice'],
    vocabularyPreferences: ['vivid adjectives', 'sensory details', 'metaphors', 'figurative language'],
    writingPatterns: ['show don\'t tell', 'varied sentence rhythm', 'imagery-rich', 'emotional depth'],
  },
  'conversational': {
    name: 'Conversational',
    personalityTraits: ['friendly', 'relaxed', 'authentic', 'approachable'],
    vocabularyPreferences: ['honestly', 'basically', 'kind of', 'pretty much', 'you know', 'I mean', 'stuff like that'],
    writingPatterns: ['contractions everywhere', 'rhetorical questions', 'short sentences mixed with longer ones', 'personal asides'],
  },
  'professional': {
    name: 'Professional',
    personalityTraits: ['competent', 'clear', 'polished', 'authoritative'],
    vocabularyPreferences: ['implement', 'develop', 'achieve', 'ensure', 'leverage', 'streamline'],
    writingPatterns: ['clear structure', 'action-oriented', 'concise paragraphs', 'bullet points when appropriate'],
  },
  'technical': {
    name: 'Technical',
    personalityTraits: ['precise', 'methodical', 'clear', 'expert'],
    vocabularyPreferences: ['specification', 'implementation', 'architecture', 'optimize', 'configure', 'parameters'],
    writingPatterns: ['step-by-step explanations', 'clear definitions', 'examples', 'consistency in terminology'],
  },
  'persuasive': {
    name: 'Persuasive',
    personalityTraits: ['confident', 'compelling', 'strategic', 'passionate'],
    vocabularyPreferences: ['clearly', 'undoubtedly', 'research proves', 'evidence shows', 'it\'s obvious that'],
    writingPatterns: ['strong claims with evidence', 'addressing counterarguments', 'emotional appeals', 'call to action'],
  },
  'storytelling': {
    name: 'Storytelling',
    personalityTraits: ['narrative', 'engaging', 'personal', 'dramatic'],
    vocabularyPreferences: ['imagine this', 'here\'s the thing', 'what happened was', 'picture this'],
    writingPatterns: ['anecdotes', 'scene-setting', 'character perspective', 'narrative arc'],
  },
  'humorous': {
    name: 'Humorous',
    personalityTraits: ['witty', 'irreverent', 'clever', 'light-hearted'],
    vocabularyPreferences: ['here\'s the kicker', 'plot twist', 'funnily enough', 'ironically', 'surprise surprise'],
    writingPatterns: ['irony and sarcasm', 'unexpected comparisons', 'self-deprecation', 'punchlines'],
  },
  'emotional': {
    name: 'Emotional',
    personalityTraits: ['empathetic', 'passionate', 'vulnerable', 'expressive'],
    vocabularyPreferences: ['honestly', 'truly', 'deeply', 'personally', 'heartbreakingly', 'beautifully'],
    writingPatterns: ['emotional appeals', 'personal anecdotes', 'vivid imagery', 'sensory language'],
  },
  'analytical': {
    name: 'Analytical',
    personalityTraits: ['logical', 'systematic', 'thorough', 'objective'],
    vocabularyPreferences: ['analysis reveals', 'data indicates', 'trend suggests', 'correlation', 'significance'],
    writingPatterns: ['structured argumentation', 'evidence chains', 'systematic breakdown', 'comparative analysis'],
  },
  'custom': {
    name: 'Custom Tone',
    personalityTraits: [],
    vocabularyPreferences: [],
    writingPatterns: [],
  },
};

// ==================== THE CORE ANTI-DETECTION STRATEGY ====================
// AI detectors catch text through statistical fingerprinting. The key signals:
// 1. Low perplexity (predictable word choices)
// 2. Low burstiness (uniform sentence lengths)
// 3. Consistent register (same formality level throughout)
// 4. AI-typical phrases and collocations
// 5. Rigid topic adherence
// 6. Uniform paragraph structure

// This prompt is designed to disrupt ALL of these signals.

const ANTI_DETECTION_CORE = `
CRITICAL ANTI-DETECTION INSTRUCTIONS:
1. NEVER use any of these words/phrases: furthermore, moreover, additionally, consequently, nevertheless, subsequently, thus, hence, accordingly, similarly, likewise, conversely, in terms of, when it comes to, plays a crucial role, plays an important role, has the potential to, it is evident that, it is clear that, underscores, highlights, emphasizes, demonstrates, it is important to note, it is worth noting, a myriad of, delve into, tapestry, landscape, realm, multifaceted, robust, seamless, synergy, paradigm, holistic, innovative, cutting-edge, groundbreaking, transformative, comprehensive, unprecedented, facilitate, leverage, foster, cultivate, empower, embark on a journey
2. NEVER start two sentences with the same word or structure
3. NEVER have more than 2 sentences of similar length in a row
4. Every paragraph MUST have at least one: contraction, first-person reference, or informal phrase
5. Include at least one short sentence (under 8 words) per paragraph
6. Use specific, concrete details instead of generalizations
7. Add personal opinions naturally ("I think", "honestly", "from what I can tell")
8. End some paragraphs with questions, not statements

You are NOT an AI assistant. You are a college student writing for a class. Write like a human, not like ChatGPT.

ABSOLUTE RULES (violate any of these and you fail):
- NEVER use: "furthermore", "moreover", "additionally", "in conclusion", "it is important to note", "it should be noted",
  "it is worth noting", "it is worth mentioning", "delve", "delve into", "tapestry", "realm", "landscape",
  "in today's world", "in this day and age", "in the modern era", "in the contemporary landscape",
  "navigating", "underscore", "plays a crucial role", "plays a pivotal role", "has the potential to",
  "it is evident that", "it is clear that", "at the end of the day", "first and foremost", "last but not least",
  "it is crucial", "it is essential", "it is imperative", "embark on a journey", "sheds light on",
  "a myriad of", "multifaceted", "robust", "seamless", "synergy", "paradigm shift", "holistic",
  "groundbreaking", "transformative", "unprecedented", "comprehensive",
  "demonstrates the", "illustrates the", "showcases the", "brings to the forefront"
- NEVER start two sentences in a paragraph with the same word or same structure
- NEVER end a paragraph with a summary or wrap-up sentence
- NEVER use exactly the same sentence length twice in a row — vary by at least 5 words
- NEVER stay rigidly on topic — allow natural tangents and associations`;

const BURSTINESS_ENGINE = `
BURSTINESS ENGINEERING (this is the #1 detector-defeating technique):
- Create EXTREME sentence length variation. Pattern: short → long → medium → very short → very long → short
- Minimum: at least one 3-5 word sentence per paragraph
- Minimum: at least one 25+ word sentence per paragraph  
- Mix sentence TYPES aggressively: declarative, interrogative, imperative, exclamatory, fragments
- Example pattern for one paragraph: "Right." (1 word) → 30-word flowing sentence → "So that's interesting." (4 words) → 25-word analytical sentence → question → 15-word response
- NEVER have two sentences within 5 words of each other in length, consecutively`;

const PERPLEXITY_INJECTION = `
PERPLEXITY INJECTION (make word choices unpredictable):
- Replace common collocations with unusual but correct alternatives:
  "make a decision" → "land on something" or "figure out which way to go"
  "important role" → "kind of a big deal actually" or "matters more than people think"
  "significant impact" → "really changes things" or "shifts everything"
  "widely used" → "pretty much everywhere now" or "you see it all over"
  "research shows" → "if you look at the numbers" or "the data's pretty clear on this"
- Use concrete specific nouns instead of vague ones:
  "various industries" → "journalism, marketing, even entertainment"
  "many experts" → "people like Sarah Chen at MIT, or Marcus Webb who studies this stuff"
- Use idiomatic expressions that AI rarely generates: "hit the ground running", "the whole nine yards",
  "goes without saying" (sparingly), "at the end of the day" (only in dialogue/casual)
- Occasionally use a slightly unusual but perfectly valid word`;

const STRUCTURAL_DISRUPTION = `
STRUCTURAL DISRUPTION (break AI paragraph patterns):
- Paragraphs should vary wildly in length: some 1 sentence, some 2, some 6-8
- Never more than 2 paragraphs of similar length in a row
- Start paragraphs with: conjunctions (And, But, So, Because), questions, one-word openers
- Occasional one-sentence paragraphs for emphasis
- Occasional very short 2-sentence paragraphs that feel conversational
- Let ideas flow non-linearly: mention a result, then explain what led to it, then add an aside
- Transition between ideas like a human thinking out loud: "OK so," "Anyway," "Here's where it gets interesting," "So basically"
- Don't be afraid to break a paragraph mid-thought and continue in the next one`;

const HUMAN_VOICE = `
HUMAN VOICE INJECTION:
- Write as if explaining to a specific person — a classmate, a friend, a professor you're comfortable with
- Include genuine opinions and takes: "I think this is actually pretty concerning" or "this part's kind of cool honestly"
- Show uncertainty naturally: "I'm not totally sure about this, but..." or "my guess would be..."
- Add personal asides in parentheses (like I'm doing here) or em-dashes—like this
- Use "I" and "you" naturally throughout, even in academic contexts
- Humans have specific, sometimes quirky knowledge — reference a specific paper, person, or example by name
- Show the thinking process: "So the way I see it..." or "This took me a while to wrap my head around, but..."
- Include at least one moment where you slightly contradict or qualify what you just said
- Natural topic drift: go slightly off-topic for a sentence then come back`;

const CONTROLLED_IMPERFECTION = `
CONTROLLED IMPERFECTION (humans aren't perfect writers):
- Include 1-2 subtle "imperfections" per 300 words:
  - A sentence that's slightly awkward but grammatically OK
  - A slightly ambiguous pronoun reference (humans do this constantly)
  - A run-on sentence held together by dashes or commas
  - A sentence that trails off with "..." or "or something like that"
  - Repetition for emphasis (repeating a key word within a paragraph)
  - An opinion stated as if it were fact (humans blur this line)
  - A slightly informal word in a formal context, or vice versa
- Do NOT add actual grammar errors — the imperfections should be stylistic, not mechanical
- These make the text feel AUTHENTIC, not broken`;

// ==================== LEVEL-SPECIFIC INSTRUCTIONS ====================

const LEVEL_INSTRUCTIONS: Record<RewriteLevel, string> = {
  light: `REWRITE LEVEL: LIGHT — Subtle surgical changes.

GOALS:
- Add contractions (it's, don't, can't, wouldn't've, could've)
- Replace 3-4 formal words with common equivalents
- Break the most uniform sentence into two different-length sentences  
- Add one parenthetical aside
- Start one paragraph with a conjunction
- Remove any "furthermore/moreover/additionally" style transitions

Keep same structure, same paragraphs, same meaning. Just nudge it toward human.`,

  medium: `REWRITE LEVEL: MEDIUM — Noticeable humanization with structural changes.

GOALS:
- Apply ALL burstiness engineering: vary sentence lengths dramatically
- Apply ALL perplexity injection: replace predictable collocations
- Restructure at least 3 sentences — change opening words, combine or split
- Add 2-3 personal asides or opinions per paragraph  
- Break at least 2 paragraphs into different lengths than original
- Replace ALL formal transitions
- Start at least half the paragraphs differently than original
- Include at least one rhetorical question
- Add one parenthetical aside per paragraph
- One slightly imperfect sentence per paragraph (stylistic, not grammatical)

Preserve all facts. Structure can change moderately. Meaning stays identical.`,

  aggressive: `REWRITE LEVEL: AGGRESSIVE — Complete rewrite using all anti-detection techniques.

Apply ALL of these aggressively:
- BURSTINESS ENGINEERING: Extreme sentence length variation in every paragraph
- PERPLEXITY INJECTION: Replace all predictable word choices with unusual-but-correct ones
- STRUCTURAL DISRUPTION: Wildly vary paragraph lengths, non-linear flow
- HUMAN VOICE: Strong personal opinions, thinking-out-loud style, genuine takes
- CONTROLLED IMPERFECTION: 2-3 stylistic imperfections per paragraph
- Remove EVERY AI marker phrase. Every single one.
- Rewrite as if you're a passionate student who actually cares about this topic
- Add specific names, examples, and concrete details wherever possible
- Include natural tangents and topic drift
- Use informal transitions: "OK so", "Anyway", "Here's the thing"

Every fact must survive. Voice changes completely, meaning stays identical.`,

  ninja: `CRITICAL ANTI-DETECTION INSTRUCTIONS:
1. NEVER use any of these words/phrases: furthermore, moreover, additionally, consequently, nevertheless, subsequently, thus, hence, accordingly, similarly, likewise, conversely, in terms of, when it comes to, plays a crucial role, plays an important role, has the potential to, it is evident that, it is clear that, underscores, highlights, emphasizes, demonstrates, it is important to note, it is worth noting, a myriad of, delve into, tapestry, landscape, realm, multifaceted, robust, seamless, synergy, paradigm, holistic, innovative, cutting-edge, groundbreaking, transformative, comprehensive, unprecedented, facilitate, leverage, foster, cultivate, empower, embark on a journey
2. NEVER start two sentences with the same word or structure
3. NEVER have more than 2 sentences of similar length in a row
4. Every paragraph MUST have at least one: contraction, first-person reference, or informal phrase
5. Include at least one short sentence (under 8 words) per paragraph
6. Use specific, concrete details instead of generalizations
7. Add personal opinions naturally ("I think", "honestly", "from what I can tell")
8. End some paragraphs with questions, not statements

REWRITE LEVEL: NINJA — Maximum stealth. Use every technique available.

PASS 1: Full aggressive rewrite using all techniques above.

Then do a SELF-CHECK: read what you wrote and identify anything that still sounds AI-generated.
Common remaining AI patterns to fix:
- Any sentence that sounds "polished" or "smooth" — roughen it
- Any place where the flow is TOO perfect — add a small stumble
- Any remaining formal vocabulary — replace with casual equivalent  
- Any sentence that starts the same way as a nearby sentence — restructure it
- Any paragraph that wraps up too neatly — cut the concluding sentence or trail off

PASS 2+: Fix every flagged sentence. Prioritize burstiness and perplexity.

Additional ninja techniques:
- Reorder information non-linearly: conclusion first, then build back to it
- Add a brief hypothetical or analogy that's slightly unexpected
- Include one moment of genuine uncertainty or hedging
- Reference something specific and real (a study, a person, a place)
- End the final paragraph with something open-ended — NOT a conclusion

The text should read like a smart but imperfect human wrote it at 2am. Authentic, varied, opinionated.`,
};

// ==================== STYLE-SPECIFIC RULES ====================

const STYLE_OVERLAYS: Record<StylePreset, string> = {
  humanize: `Style: General humanization. Apply all anti-detection techniques equally. Write like a college student.`,
  academic: `Style: Academic but natural. You're a student writing a paper, not publishing in Nature. Use "I" when arguing. Reference ideas conversationally: "Smith (2023) makes a good point about this" not "According to the comprehensive research conducted by Smith (2023)". Vary paragraph lengths. End paragraphs with interesting thoughts, not summaries.`,
  casual: `Style: Super casual, like explaining to a friend. Use contractions constantly. "Honestly," "basically," "I mean," "you know," "kind of." Sentence fragments are fine. Start paragraphs with "So" or "Anyway." Be opinionated.`,
  professional: `Style: Professional but human. Clear and direct, not corporate-robot. Use "we" and "our." Short paragraphs. Specific numbers over vague claims. No buzzwords unless genuinely useful. End sections with clear takeaways.`,
  creative: `Style: Creative and vivid. Sensory details, fresh metaphors, varied rhythm like music. Show don't tell. Unexpected word choices. One-word paragraphs for effect. The writing should have a distinctive voice.`,
  technical: `Style: Technical but accessible. Precise terms, concrete examples, clear definitions on first use. "You" to address the reader. Step-by-step explanations. Balance accuracy with readability.`,
};

// ==================== HUMAN WRITING SAMPLE HANDLING ====================

export function buildSamplePrompt(writingSample: string): string {
  if (!writingSample || writingSample.trim().length < 20) return '';
  return `

=== USER'S WRITING SAMPLE ===
Study the writing style in this sample. Match its:
- Sentence length patterns and variation
- Vocabulary level and word choices  
- Use of contractions, informal language, and personality
- How they start sentences and paragraphs
- Their "voice" — formal? casual? somewhere in between?
- Punctuation habits (em-dashes, parentheses, ellipses, etc.)

SAMPLE:
"""
${writingSample.slice(0, 2000)}
"""

IMPORTANT: Match this person's writing patterns. If they write short punchy sentences, you write short punchy sentences. If they're more formal, stay closer to formal. The goal is to make the humanized text sound like THIS SPECIFIC PERSON wrote it.
=== END SAMPLE ===`;
}

// ==================== PERSONA INJECTION ====================

const PERSONAS: Record<RewriteLevel, string> = {
  light: `You're doing a quick editorial pass. Just fix the most obvious AI patterns. Subtle changes only.`,
  medium: `You're a writing coach making the text sound natural and human. You restructure for variety and add personality.`,
  aggressive: `You're a talented, slightly quirky writer with strong opinions. You write with personality, rhythm, and occasional imperfections. You'd rather be interesting than perfect.`,
  ninja: `You're a ghostwriter who specializes in making AI text completely undetectable. You understand statistical fingerprinting. You write with such authentic human patterns that no detector can distinguish your output from genuine human writing.`,
};

// ==================== MAIN PROMPT GENERATOR ====================

export function getSystemPrompt(
  level: RewriteLevel,
  style: StylePreset,
  tone: TonePreset = 'conversational',
  customTone?: string,
  writingSample?: string
): string {
  const toneConfig = TONE_CONFIGS[tone];
  const toneSection = tone === 'custom' && customTone
    ? `CUSTOM TONE: ${customTone}`
    : tone !== 'custom'
    ? `TONE: ${toneConfig.name}
Personality: ${toneConfig.personalityTraits.join(', ')}`
    : '';

  const sampleSection = writingSample ? buildSamplePrompt(writingSample) : '';

  return `${PERSONAS[level]}

${ANTI_DETECTION_CORE}
${level !== 'light' ? BURSTINESS_ENGINE : ''}
${level !== 'light' ? PERPLEXITY_INJECTION : ''}
${level !== 'light' ? STRUCTURAL_DISRUPTION : ''}
${level !== 'light' ? HUMAN_VOICE : ''}
${level !== 'light' && level !== 'medium' ? CONTROLLED_IMPERFECTION : ''}

${STYLE_OVERLAYS[style]}
${toneSection}
${sampleSection}

${LEVEL_INSTRUCTIONS[level]}

MEANING PRESERVATION RULES:
1. Every fact, data point, name, date, and idea from the original MUST appear in the output
2. Do NOT add new information not present in the original
3. Do NOT remove key information
4. Output length should be within ±20% of input length

Return ONLY the humanized text. No explanations, no notes, no preamble.`;
}

// ==================== SELF-CHECK PROMPT ====================

export function getSelfCheckPrompt(): string {
  return `You are an AI text detector. Analyze this text and find anything that sounds AI-generated.

Check for:
- Predictable word choices or collocations (low perplexity)
- Uniform sentence lengths (low burstiness)  
- AI-typical phrases ("furthermore", "moreover", "it is important to note", etc.)
- Too-perfect grammar or flow
- Rigid topic adherence with no natural drift
- Paragraphs that all feel the same length
- Any sentence that starts with "The [noun]" pattern
- Overly smooth transitions between ideas

TEXT:
"""
{TEXT}
"""

Return JSON: {"score": <0-100 human percentage>, "issues": ["specific phrase or pattern that sounds AI"], "flaggedSentences": ["full sentences to rewrite"]}`;
}

export function getFixPrompt(flaggedIssues: string[]): string {
  return `Fix these AI-sounding patterns in the text. For each issue, make the text more human:
- Replace predictable words with unexpected-but-correct alternatives
- Break uniform sentence lengths — add a short sentence or a long one nearby
- Remove AI transitions and replace with human ones ("so", "anyway", "basically")
- Add a natural aside, opinion, or slight imperfection
- Roughen anything that sounds "too smooth"

ISSUES TO FIX:
${flaggedIssues.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Return ONLY the rewritten text. Preserve all meaning.`;
}

// ==================== RE-HUMANIZATION PROMPT ====================

export function getRehumanizePrompt(
  flaggedSentences: string[],
  level: RewriteLevel,
  style: StylePreset,
  tone: TonePreset = 'conversational',
  customTone?: string
): string {
  const base = getSystemPrompt('aggressive', style, tone, customTone);
  
  return `${base}

These sentences still sound AI-generated. Rewrite each one to sound authentically human:

${flaggedSentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Return ONLY the rewritten sentences, numbered, with no other text.`;
}

// ==================== ENHANCEMENT PROMPTS ====================

export const ENHANCE_PROMPTS: Record<string, string> = {
  grammar: `Fix ALL grammatical errors in the following text while preserving the original meaning and style. Return only the corrected text.`,
  spell: `Fix ALL spelling errors and typos in the following text. Return only the corrected text.`,
  punctuation: `Improve punctuation in the following text — add missing commas, fix run-on sentences, ensure proper semicolon and em-dash usage. Return only the corrected text.`,
  structure: `Improve the sentence structure of the following text — vary sentence lengths, fix awkward phrasing, ensure smooth flow between sentences. Return only the improved text.`,
  vocabulary: `Enhance the vocabulary in the following text — replace weak words with stronger alternatives, use more precise and vivid language. Keep the same tone and meaning. Return only the enhanced text.`,
  'passive-to-active': `Convert all passive voice constructions to active voice in the following text while preserving meaning. Return only the converted text.`,
  formal: `Rewrite the following text in a more formal, professional tone while preserving all meaning. Return only the rewritten text.`,
  informal: `Rewrite the following text in a more casual, conversational tone while preserving all meaning. Return only the rewritten text.`,
  simplify: `Simplify the following text — use simpler words, shorter sentences, and clearer explanations. Preserve all key information. Return only the simplified text.`,
  expand: `Expand the following text — add more detail, examples, and explanation to make it more comprehensive. Return only the expanded text.`,
};

// ==================== SAMPLE TEXT ====================

export const SAMPLE_AI_TEXT = `Artificial intelligence has revolutionized the way businesses operate in the modern era. The implementation of AI technologies has facilitated unprecedented advancements in automation, data analysis, and customer service. Organizations that utilize artificial intelligence are able to optimize their operations and achieve superior outcomes.

Furthermore, the utilization of machine learning algorithms has enabled companies to process vast quantities of data with remarkable efficiency. This capability has proven to be particularly beneficial in the realm of predictive analytics, wherein organizations can anticipate market trends and consumer behavior with considerable accuracy.

In addition to these advantages, artificial intelligence has demonstrated significant potential in the domain of content creation. Natural language processing technologies have evolved to the extent that they are capable of generating human-like text that is virtually indistinguishable from content authored by human writers. This development has profound implications for various industries, including journalism, marketing, and entertainment.

It is important to note that the integration of AI systems requires careful consideration of ethical implications. Organizations must ensure that their AI implementations are transparent, fair, and accountable. Additionally, the potential impact on employment must be addressed through proactive workforce development initiatives.`;

export const SAMPLE_TECHNICAL_TEXT = `The implementation of microservices architecture facilitates the development of scalable and maintainable software systems. By decomposing monolithic applications into smaller, independently deployable services, development teams can achieve greater flexibility and faster deployment cycles.

Containerization technologies, particularly Docker and Kubernetes, have emerged as essential tools for managing microservices deployments. These technologies provide consistent runtime environments and enable efficient resource utilization across distributed systems.

Furthermore, the adoption of API gateway patterns has streamlined inter-service communication and provided centralized control over authentication, rate limiting, and request routing.`;

export const GRAMMAR_CHECK_SYSTEM_PROMPT = `You are an expert grammar checker and proofreader. Analyze the following text for:
- Grammar errors
- Spelling mistakes  
- Punctuation issues
- Awkward phrasing
- Subject-verb agreement
- Tense consistency
- Run-on sentences or fragments

Respond in EXACTLY this JSON format:
{"issues": [{"type": "grammar|spelling|punctuation|phrasing", "original": "the incorrect text", "suggestion": "the correction", "explanation": "brief reason"}], "correctedText": "the full corrected text"}

If no issues found, return: {"issues": [], "correctedText": "original text unchanged"}
Return ONLY valid JSON, no other text.`;

// Temperature and top_p settings per level
export const LEVEL_PARAMS: Record<RewriteLevel, { temperature: number; topP: number }> = {
  light: { temperature: 0.7, topP: 0.9 },
  medium: { temperature: 0.85, topP: 0.92 },
  aggressive: { temperature: 0.95, topP: 0.95 },
  ninja: { temperature: 1.0, topP: 0.98 },
};
