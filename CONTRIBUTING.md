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

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes with descriptive messages
4. Push to your fork
5. Open a Pull Request

### PR Checklist
- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] New features include updated types
- [ ] UI changes are responsive (mobile + desktop)
- [ ] No API keys or secrets in code
