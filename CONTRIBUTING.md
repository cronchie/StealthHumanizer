# Contributing to StealthHumanizer

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- A free AI provider API key (Gemini recommended)

### Steps

```bash
git clone https://github.com/rudra496/StealthHumanizer.git
cd StealthHumanizer
npm install
npm run dev
```

Open http://localhost:3000 and configure your API key in Settings.

## Project Structure

```
stealthhumanizer/
├── app/
│   ├── api/
│   │   ├── humanize/route.ts    # Main humanization endpoint
│   │   └── alternative/route.ts # Alternative rewrites endpoint
│   ├── page.tsx                 # Main app page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── Humanizer.tsx            # Main humanizer UI
│   ├── Detector.tsx             # AI detector UI
│   ├── Settings.tsx             # API key management
│   ├── History.tsx              # Past humanizations
│   ├── Navbar.tsx               # Navigation
│   └── Toast.tsx                # Notifications
├── lib/
│   ├── types.ts                 # TypeScript type definitions
│   ├── providers.ts             # Multi-provider AI abstraction
│   ├── prompts.ts               # Humanization prompt templates
│   ├── detector.ts              # AI detection engine
│   ├── humanizer.ts             # Multi-pass humanization logic
│   ├── readability.ts           # Readability scoring
│   └── storage.ts               # LocalStorage utilities
└── docs/                        # Documentation
```

## Code Style

- **TypeScript strict mode** — All files must have proper types
- **Functional components** with hooks (no class components)
- **Tailwind CSS** for styling — no custom CSS files
- **Descriptive naming** — `getSystemPrompt()` not `gsp()`
- **Error handling** — Always wrap API calls in try/catch

## Adding a New Provider

1. Add provider config to `PROVIDERS` array in `lib/providers.ts`
2. Add a case in `generateWithProvider()` function
3. Add setup instructions in `components/Settings.tsx`
4. Test with `testApiKey()` function
5. Update README.md provider table

## Adding a New Tone

1. Add tone config to `TONE_CONFIGS` in `lib/prompts.ts`
2. Add personality traits, vocabulary, and writing patterns
3. Add option to `TONES` array in `components/Humanizer.tsx`
4. Update `TonePreset` type in `lib/types.ts`

## Adding a New Detection Metric

1. Add calculation function in `lib/detector.ts`
2. Add score to `DetectionResult.analysis` in `lib/types.ts`
3. Add weight to the overall score calculation
4. Add display in `components/Detector.tsx`

## Pull Request Process

Follow this exact sequence with direct links:

1. Open repository home:  
   https://github.com/rudra496/StealthHumanizer

2. Open branch list (copy your branch name):  
   https://github.com/rudra496/StealthHumanizer/branches

3. Confirm your branch contains your commits (example: `feature-login`).

4. Open this exact compare URL (replace `YOUR_BRANCH`):  
   https://github.com/rudra496/StealthHumanizer/compare/main...YOUR_BRANCH?quick_pull=1

5. Verify on the compare page:
   - Base branch is `main`
   - Compare branch is `YOUR_BRANCH`
   - Click **Create pull request**

6. Fill in PR details:
   - Add a clear title
   - Add a clear description of your changes
   - Click **Create pull request**

7. Open PR list anytime here:  
   https://github.com/rudra496/StealthHumanizer/pulls

8. Open your PR from the list.

9. Merge the PR:
   - Scroll to the merge section
   - Click **Merge pull request**
   - Click **Confirm merge**

10. Optional cleanup:
    - Click **Delete branch** after merge

11. If merge is blocked:
    - Open the PR **Checks** tab
    - Wait for pending checks or fix failing checks
    - Retry merge after checks pass

Reusable compare link template:

`https://github.com/rudra496/StealthHumanizer/compare/main...YOUR_BRANCH?quick_pull=1`

## Benchmark & Model Contribution Path (PR3+)

Use the reproducible pipeline sequence:

```bash
npm run papers:benchmark -- --config data/papers/benchmark.config.example.json
npm run model:train -- --config data/models/train.config.example.json
npm run model:eval -- --manifest data/models/current/run.manifest.json
```

When contributing benchmark/model changes:

- Keep label classes balanced (`human_academic` vs `ai_transformed`)
- Preserve run manifests and quality-gate outputs
- Do not bypass fail gates by lowering thresholds without justification
- Update docs under `docs/` when adding metrics, policies, or evaluation criteria

### PR Checklist
- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] New features include updated types
- [ ] UI changes are responsive (mobile + desktop)
- [ ] No API keys or secrets in code
- [ ] PR3/PR4 quality gates pass when related pipeline code is changed
