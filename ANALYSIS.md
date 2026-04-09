# 🔬 Deep Surgical Analysis: StealthHumanizer vs StealthWriter

## ROOT CAUSE: Why StealthHumanizer INCREASES AI detection

### Problem 1: The prompt tells the LLM to write like a "college student" but then asks it to preserve ALL meaning perfectly
- This contradiction causes the LLM to write MORE carefully, making it MORE detectable
- StealthWriter likely uses a different approach: they use their own fine-tuned models (not prompting public models)

### Problem 2: Post-processing ADDS detectable patterns
The `postprocess.ts` actually makes things worse:
- **Sentence reordering** breaks logical flow → reads as "edited" not "written by human"
- **Filler phrase injection** ("in my experience", "from what I've seen") is detectable — real humans don't use these in every other sentence
- **Random capitalization** of nouns is a known AI humanization artifact
- **Contraction expansion** (don't → do not) is backwards — humans USE contractions, they don't remove them
- **Double spaces** between sentences is an obvious edit artifact

### Problem 3: The self-check loop is counterproductive
- The `llmSelfCheck` asks an LLM to detect AI text, then uses ANOTHER LLM call to "fix" it
- Each additional LLM rewrite adds MORE AI fingerprints
- More passes = more AI-like text, not less

### Problem 4: The built-in detector gives FALSE HIGH scores
- The `detectAI()` function checks for AI phrases and rewards contractions/filler words
- But the postprocessing ADDS these exact things artificially
- So the detector says "80% human!" while real detectors (GPTZero, Originality) say "100% AI"
- This gives users false confidence

### Problem 5: No real integration with actual AI detectors
- StealthWriter likely tests against real detectors behind the scenes
- StealthHumanizer's detector is heuristic-only and easily fooled

## HOW StealthWriter Actually Works (educated guess + analysis)

1. **Fine-tuned proprietary models** (they mention "optimized 5.1 & 4.6 models") — NOT just prompting
2. **Simple, clean output** — no fake "imperfections" or injected filler
3. **Actual detector testing** — their built-in detector tests against real patterns
4. **Light touch** — they probably rewrite LESS, not more
5. **English only** — they don't dilute quality by supporting everything

## WHAT TO FIX (Priority Order)

### P0 — Critical (makes things worse currently)
1. Remove postprocessing by default (or make it opt-in)
2. Remove the self-check LLM loop (it adds AI fingerprints)
3. Rewrite the prompt to be LESS prescriptive (less instructions = more natural output)
4. Stop injecting fake imperfections

### P1 — Important
5. Add integration with REAL detector APIs (GPTZero, Originality) for accurate scoring
6. Simplify the prompt — shorter = better (less AI patterns in the prompt itself)
7. Reduce temperature range (0.95-1.0 is too high, causes hallucination → weird text)

### P2 — Enhancement
8. Add a "stealth mode" that does minimal rewriting (1-2 word changes per sentence)
9. Sentence-by-sentence processing with context window
10. Better API route — currently the humanization logic is duplicated in route.ts and humanizer.ts
