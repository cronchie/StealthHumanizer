export interface StyleRule {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
}

export interface StyleGuideCategory {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  isDefault: boolean; // prevents accidental deletion of built-in categories
  rules: StyleRule[];
}

export type StyleGuides = StyleGuideCategory[];

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createRule(name = 'New rule'): StyleRule {
  return { id: uid(), name, content: '', enabled: true };
}

export function createCategory(name = 'Custom'): StyleGuideCategory {
  return { id: uid(), name, description: '', enabled: true, isDefault: false, rules: [createRule()] };
}

export const DEFAULT_STYLE_GUIDES: StyleGuides = [
  {
    id: 'voice',
    name: 'Voice & Register',
    description: 'Core style, personality, and which register fits the context',
    enabled: false,
    isDefault: true,
    rules: [
      { id: 'voice-core', name: 'Core style', content: 'Clarity with teeth. Technically careful, casually voiced, lightly witty, evidence-driven, allergic to language that hides the point. Direct without being blunt for its own sake, precise without going dry, casual without going sloppy, witty without going jokey, nuanced without going mushy, confident without overclaiming, polished without sounding machine-smoothed.', enabled: true },
      { id: 'voice-default-register', name: 'Default register', content: 'Technical: the practitioner walking through a mechanism. Measured, precise, evidence-led, dry where dryness helps. Stays careful without going cold. Most prose should live here.', enabled: true },
      { id: 'voice-playful', name: 'Playful register (when it applies)', content: 'Dry, surreal, occasionally profane, fast. Brief, native to the argument. Do not turn a serious point into a bit. Only use when the subject and tone genuinely invite it.', enabled: true },
      { id: 'voice-enthusiast', name: 'Enthusiast register (when it applies)', content: 'Voice of someone nerding out about something genuinely cool. Sentences pick up speed and run longer. Earn it with specificity — point at the exact thing worth caring about. The moment prose markets its own importance ("this will blow your mind"), it has tipped into hype. Fix it by naming the concrete detail.', enabled: true },
      { id: 'voice-avoid', name: 'Styles and tones to avoid', content: 'Beige professionalism (polished but lifeless, no point of view). Template brain (generic intro, stock conclusion, mechanically parallel bullets). Forced whimsy (playfulness that does not belong to the argument). Slogan endings (memorable-sounding conclusions that mean nothing). The tone should feel authored, never like a standards committee, corporate memo, or LLM explainer.', enabled: true },
    ],
  },
  {
    id: 'stance',
    name: 'Stance',
    description: 'What the writing should do: openings, argument structure, consequences',
    enabled: false,
    isDefault: true,
    rules: [
      { id: 'stance-purpose', name: 'What writing should do', content: 'Every paragraph argues toward a point, not neutrally describes a topic. A reader should be able to tell what the paragraph changes: what becomes clearer, what assumption gets challenged, what risk appears, or what action follows. Aim for: claim, evidence, consequence.', enabled: true },
      { id: 'stance-openings', name: 'Direct openings', content: 'Open with the claim, tension, or practical problem. No procedural openers: no "This post will explore", "It is important to note", "Before we begin". Start with something that does work.', enabled: true },
      { id: 'stance-consequences', name: 'Show consequences, not importance', content: 'Name what breaks, what changes, what risk appears, who is affected. Do not wave at importance with words like "critical" or "important" — name the actual consequence instead.', enabled: true },
      { id: 'stance-mistakes', name: 'Respect reasonable mistakes', content: 'Show why a careful person might miss the thing: the first fix is reasonable, the test is useful but incomplete, the primitive solves one problem and not the whole property. Avoid smugness. Never treat an error as obvious or the person who made it as foolish.', enabled: true },
    ],
  },
  {
    id: 'cadence',
    name: 'Cadence & Structure',
    description: 'Sentence rhythm, paragraph flow, headings, transitions',
    enabled: false,
    isDefault: true,
    rules: [
      { id: 'cadence-rhythm', name: 'Rhythm', content: 'Vary sentence length on purpose. Mix direct claims with longer explanatory sentences. Use a short landing sentence only when it earns its place. Avoid: stacked micro-sentences, fake dramatic fragments, repeated sentence structures, illustrative pairs that feel too symmetrical, paragraphs where every sentence is the same length, over-polished transitions that sound generated.', enabled: true },
      { id: 'cadence-paragraphs', name: 'Paragraph-level editing', content: 'Edit at the paragraph level, not just the word level. Check whether the paragraph opens in the right place, whether the strongest idea lands too early or too late, whether the transition into the next paragraph works, and whether a sentence is technically true but rhythmically dead. Improve the movement of the thought, not only the word choices.', enabled: true },
      { id: 'cadence-headings', name: 'Headings & transitions', content: 'Headings carry the argument. Prefer a heading that signals movement or tension over one that merely labels the next object. Transitions should explain why the next section exists, not just announce it is coming. Avoid "now let\'s look at..." unless it is genuinely the cleanest option.', enabled: true },
      { id: 'cadence-minimal', name: 'Minimal intervention', content: 'If a sentence is already clear, active, and correctly structured, make the smallest change that fixes a real problem. Do not add words, interpretations, or elaborations that were not in the original. Do not manufacture a problem to solve. A sentence that needs no editing should come back unchanged.', enabled: true },
    ],
  },
  {
    id: 'claims',
    name: 'Claims & Evidence',
    description: 'Certainty calibration, nuance, avoiding false neutrality',
    enabled: false,
    isDefault: true,
    rules: [
      { id: 'claims-evidence', name: 'Evidence orientation', content: 'Say what the evidence supports and stop where it cannot. Do not broaden a claim past what the example supports. Watch for "always" when the honest answer is "often" or "in this case". A fix that solves the demo should not be sold as the general rule.', enabled: true },
      { id: 'claims-nuance', name: 'Nuance without mush', content: 'Preserve the distinction between what is known, likely, plausible, and unproven. Do not bury the claim under stacked hedges (may, might, could, potentially piled together). Nuance, not mush.', enabled: true },
      { id: 'claims-neutrality', name: 'False neutrality (avoid)', content: 'If the evidence supports a strong conclusion, state it plainly. Do not manufacture symmetrical pros and cons when the uncertainty is not real. Identify the stronger interpretation and say why it is stronger.', enabled: true },
    ],
  },
  {
    id: 'diction',
    name: 'Diction & Anti-LLM',
    description: 'Banned words, patterns to avoid, preferred verb choices',
    enabled: true,
    isDefault: true,
    rules: [
      { id: 'diction-banned', name: 'Banned words & phrases', content: 'Do not use: dive into, delve into, leverage, facilitate, enable (when a concrete verb fits), robust (as filler praise), seamless, holistic, load-bearing (as metaphor), shape/shapes (as noun or metaphor; use structure, arc, arrangement, anatomy, or through-line instead), real (as an intensifier), "this article explores", "X matters because" (as generic glue), critical/important used instead of explaining the actual consequence, "in today\'s fast-paced landscape", tidy takeaway lines that sound polished but say nothing. Also cut when they add no meaning: actually, simply, just, really, genuinely, clearly (when the thing is not clear from the evidence), quietly/silently in any non-literal sense.', enabled: true },
      { id: 'diction-patterns', name: 'Banned structural patterns', content: 'No "not X, but Y" scaffolding. Never: "The issue is not X, but Y", "This is not merely X; it is Y", "The lesson is not X. The lesson is Y", repetitive "not only / but also". State the actual claim directly. Also avoid the balanced "X happened, but Y" antithesis where two clauses pivot on a symmetrical reversal — the tidy reversal reads as a tic even when the content is right.', enabled: true },
      { id: 'diction-verbs', name: 'Preferred verbs', content: 'Prefer concrete verbs: shows, breaks, records, skips, overwrites, contradicts, hides, forces, changes, narrows, exposes, preserves. Avoid abstract filler verbs: facilitates, enables, leverages, drives, provides visibility into, serves to, plays a role in.', enabled: true },
      { id: 'diction-voice', name: 'Active voice & human subjects', content: 'Center a person whenever one plausibly acted. Watch for buried people: "Testing revealed the gap", "the analysis shows", "the review caught it" all hide a developer or reviewer behind an instrument. Put the person back. Prefer active voice; prefer an animate actor over an abstract one ("the test", "the system"). Passive voice is fine when the actor is genuinely unknown or irrelevant. Do not bolt on a narrator ("We can see that...", "the developer might notice...") when the mechanism is the actual subject. Exception: collective nouns and institutions — organizations, companies, governments, teams, regulators — are legitimate active subjects. "Organizations must ensure..." is already active voice; do not rewrite it into an impersonal or passive construction.', enabled: true },
      { id: 'diction-echoing', name: 'No constraint echoing', content: 'Do not narrate, defend, or negate rules. Never assert the absence of a flaw — if a sentence\'s only job is to deny a fault, cut it. The reader has not seen this prompt; announcing what the prose is not doing spends words on a phantom. Avoid: "This isn\'t a generic explainer", "To be concrete here", "To put it plainly". Be the thing the rule was steering toward.', enabled: true },
    ],
  },
  {
    id: 'grammar',
    name: 'Grammar & Mechanics',
    description: 'Chicago Manual of Style — non-negotiable',
    enabled: true,
    isDefault: true,
    rules: [
      { id: 'grammar-dashes', name: 'Em dashes', content: 'No em dashes. Recast with a comma, colon, period, or parentheses. Do not smuggle one back as a spaced en dash. If a thought needs a hard break, end the sentence and start a new one.', enabled: true },
      { id: 'grammar-possessives', name: 'Possessives', content: "Add 's to a singular noun even when it ends in s (the witness's account, the boss's call). Apostrophe alone for a plural ending in s (the reviewers' notes, the developers' tooling). Keep its/it's and whose/who's straight.", enabled: true },
      { id: 'grammar-caps', name: 'Capitalization & emphasis', content: 'No all caps for emphasis. Use italics, rarely. Acronyms and initialisms are exempt. One emphasis tool at a time — italics or a strong verb, not bold stacked on top.', enabled: true },
      { id: 'grammar-colons', name: 'Colons', content: 'Use colons sparingly. At most one colon-led structure per paragraph. Require a complete sentence before the colon. Lowercase after it unless a proper noun or more than one full sentence follows.', enabled: true },
      { id: 'grammar-misc', name: 'Other rules', content: "Serial comma always (detection, indexing, and routing). En dash for ranges (2024–2026, pages 40–52). Hyphen for compound modifiers before a noun (home-rolled access control). 'That' for restrictive clauses; 'which' (with commas) for nonrestrictive ones. en-US spelling by default.", enabled: true },
    ],
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Overlay for technical, security, or domain-specific content',
    enabled: false,
    isDefault: true,
    rules: [
      { id: 'tech-precision', name: 'Practical precision', content: 'Be the practitioner walking through a mechanism. Name the concrete detail — not "the vulnerability" but the specific thing that breaks. Do not generalize from one example to all cases.', enabled: true },
      { id: 'tech-credibility', name: 'Practitioner credibility', content: 'Evidence-led, dry where dryness helps. Measured, careful without going cold. Respect reasonable mistakes: show why a careful engineer might have missed the thing. This avoids smugness and makes the point easier to absorb.', enabled: true },
      { id: 'tech-claims', name: 'Technical claims', content: "Do not broaden claims past what the example supports. A fix that solves the demo is not the general rule. Watch for 'always' when the honest answer is 'often' or 'in this case'. Source claims the reader might challenge; don't decorate obvious ones.", enabled: true },
      { id: 'tech-structure', name: 'Post structure', content: 'Reward both careful reading and skimming. Plain-English setup before any dense passage; plain-English takeaway after it. A skimmer should come away with the main claim, the example\'s purpose, the practical takeaway, and why the piece exists.', enabled: true },
    ],
  },
];

const STORAGE_KEY = 'stealthhumanizer_style_guides_v4';

export function loadStyleGuides(): StyleGuides {
  if (typeof window === 'undefined') return DEFAULT_STYLE_GUIDES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STYLE_GUIDES;
    return JSON.parse(raw) as StyleGuides;
  } catch {
    return DEFAULT_STYLE_GUIDES;
  }
}

export function saveStyleGuides(guides: StyleGuides): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guides));
}

export function hasActiveGuides(guides: StyleGuides): boolean {
  return guides.some(c => c.enabled && c.rules.some(r => r.enabled && r.content.trim().length > 0));
}

export function activeRuleCount(guides: StyleGuides): number {
  return guides.reduce((n, c) => {
    if (!c.enabled) return n;
    return n + c.rules.filter(r => r.enabled && r.content.trim().length > 0).length;
  }, 0);
}

/**
 * Serializes active guide rules into a system prompt block.
 * Placed after anti-detection core, before level instructions.
 * Explicitly overrides the default casualification directives.
 */
export function buildStyleGuidePrompt(guides: StyleGuides): string {
  const sections = guides
    .filter(c => c.enabled)
    .flatMap(c => {
      const rules = c.rules.filter(r => r.enabled && r.content.trim().length > 0);
      if (rules.length === 0) return [];
      const body = rules.map(r => `- **${r.name.trim()}:** ${r.content.trim()}`).join('\n');
      return [`### ${c.name}\n${body}`];
    });

  if (sections.length === 0) return '';

  return `

=== PERSONAL STYLE GUIDE ===
These rules take precedence over the default rewriting instructions above. Follow them exactly.

${sections.join('\n\n')}

OVERRIDE: Because a personal style guide is active, do NOT add staccato one-word paragraphs, casual filler sentences ("Right.", "Honestly.", "Makes sense.", "Exactly."), forced conjunction starters ("And ", "But ", "So "), or rhetorical questions inserted for texture. Apply the register and voice specified in the style guide instead.
=== END STYLE GUIDE ===`;
}
