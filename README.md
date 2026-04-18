# StealthHumanizer

[![CI](https://github.com/rudra496/StealthHumanizer/actions/workflows/ci.yml/badge.svg)](https://github.com/rudra496/StealthHumanizer/actions/workflows/ci.yml)
[![Docs](https://github.com/rudra496/StealthHumanizer/actions/workflows/pages.yml/badge.svg)](https://github.com/rudra496/StealthHumanizer/actions/workflows/pages.yml)
[![Release](https://img.shields.io/github/v/release/rudra496/StealthHumanizer?sort=semver)](https://github.com/rudra496/StealthHumanizer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://stealthhumanizer.vercel.app/)

> 🥷 Free, open-source AI text humanizer with style-aware rewriting.
> 13 AI providers, 4 rewrite levels, multi-pass ninja mode. No login required.

**Live app:** https://stealthhumanizer.vercel.app/ ·
**Docs:** https://rudra496.github.io/StealthHumanizer/

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quickstart](#quickstart)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Testing and Local Development](#testing-and-local-development)
- [Benchmarks and Performance](#benchmarks-and-performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security, Support, and License](#security-support-and-license)

## Features

- **Style-aware humanization engine** with configurable writing patterns
  calibrated from academic writing statistics.
- **Dynamic detection thresholds** calibrated against real human writing patterns,
  not guesswork — sentence length, burstiness, vocabulary diversity, and
  transition frequency.
- **Expanded AI phrase database** with 150+ collocation replacements for natural
  output.
- **Domain-aware style matching** across 11 academic disciplines.
- **13 AI provider support** with configurable API keys (free and paid).
- **4 rewrite levels** including multi-pass ninja mode for maximum transformation.
- **13 preset writing tones** and granular style controls.
- **Integrated AI detection** with corpus-calibrated heuristic scoring.
- **Readability analysis** (Flesch-Kincaid, Gunning Fog).
- **PDF and DOCX file upload** support.
- **Grammar check** integration.
- **Multi-language humanization** support.
- **Side-by-side workflow** for source, output, and quality feedback.
- **Browser-first key handling** — all API keys stay on your device.
- **Dark/light theme** toggle.

## How It Works

StealthHumanizer uses a multi-layer rewriting approach:

1. **LLM rewrite** — your chosen provider transforms the text using a
   style-aware prompt with statistical targets from academic writing analysis.
2. **Post-processing** — a collocation engine replaces common AI-signature
   phrases with natural alternatives.
3. **Built-in scoring** — the heuristic detector provides feedback on
   writing patterns (sentence length variation, vocabulary diversity,
   transition frequency) to help you iterate.

> **Note:** Built-in detection scores are heuristic estimates, not a guarantee
> of passing external AI detectors. Results vary by detector and input.

## Architecture

High-level architecture:

1. **UI layer (`components/`, `app/page.tsx`)** — text entry, settings, and
   result rendering.
2. **API routes (`app/api/`)** — provider orchestration and rewrite workflows.
3. **Style model layer (`public/corpus-style-model.json`)** — writing statistics
   and calibrated thresholds loaded client-side.
4. **Core logic (`lib/`)** — prompt construction (with corpus-aware injection),
   provider abstraction, detector scoring, and storage helpers.
5. **Research and evaluation scripts (`scripts/`, `data/`)** — benchmark,
   training, and corpus ingestion pipelines.
6. **Documentation (`docs/`)** — user and contributor guides published via
   GitHub Pages.

For deeper technical details, see [ARCHITECTURE.md](./ARCHITECTURE.md) and
[STYLE_ENGINE.md](./STYLE_ENGINE.md).

## Installation

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
git clone https://github.com/rudra496/StealthHumanizer.git
cd StealthHumanizer
npm ci
```

## Quickstart

Run the application locally:

```bash
npm run dev
```

Then open `http://localhost:3000`, add a provider API key in settings, and run a
rewrite.

## Configuration

StealthHumanizer is configured primarily through UI controls and local browser
storage.

- **Provider keys:** configured in app settings and stored locally.
- **Rewrite strategy:** choose level, style, tone, and target score.
- **Research pipeline scripts:** use JSON configs under
  `data/papers/*.config.example.json` and `data/models/*.config.example.json`.

See [docs/configuration.md](./docs/configuration.md) for full details.

## Usage Examples

### Application usage

1. Paste AI-generated text.
2. Select rewrite level, style, and tone.
3. Run humanization.
4. Review detector/readability scores and iterate.

### One-command corpus + training bootstrap

```bash
npm run pipeline:q1-ready
```

Faster reruns (skip reinstall):

```bash
npm run pipeline:q1-ready:skip-install
```

The wrapper (`scripts/papers/complete-ready-pipeline.mjs`) runs:

1. `npm ci` (unless `--skip-install`)
2. `node scripts/papers/batch-download-and-train.mjs` with Q1 OA configs
3. `node scripts/model/evaluate-framework.mjs --manifest data/models/current/run.manifest.json`

### Scripted benchmark/training smoke flow

```bash
npm run papers:benchmark -- --config data/papers/benchmark.smoke.config.json --run-id local-smoke
npm run model:train -- --config data/models/train.smoke.config.json --run-id local-smoke
npm run model:eval -- --manifest data/models/current/run.manifest.json
```

## Testing and Local Development

```bash
npm run lint
npm run test:integration
npm run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow standards.

## Benchmarks and Performance

- [docs/BENCHMARK_METHODOLOGY.md](./docs/BENCHMARK_METHODOLOGY.md)
- [docs/HUMAN_AI_SIGNAL_LAYER.md](./docs/HUMAN_AI_SIGNAL_LAYER.md)
- [docs/MODEL_TRAINING_FRAMEWORK.md](./docs/MODEL_TRAINING_FRAMEWORK.md)

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for release milestones and planned improvements.

## Contributing

Contributions are welcome. Please review [CONTRIBUTING.md](./CONTRIBUTING.md)
before opening a pull request.

## 👨‍💻 Author

**Rudra Sarker** — 3rd-year IPE student at SUST, Bangladesh. Building open-source
tools for accessibility, education, and developer productivity.

[![Portfolio](https://img.shields.io/badge/Portfolio-rudra496-blue?logo=github)](https://rudra496.github.io/site)
[![GitHub](https://img.shields.io/badge/GitHub-rudra496-181717?logo=github)](https://github.com/rudra496)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rudra_Sarker-0A66C2?logo=linkedin)](https://www.linkedin.com/in/rudrasarker)
[![X/Twitter](https://img.shields.io/badge/X-@Rudra496-000?logo=x)](https://x.com/Rudra496)
[![DevPost](https://img.shields.io/badge/DevPost-rudrasarker-003E54?logo=devpost)](https://devpost.com/rudrasarker)

## Security, Support, and License

- Security policy: [SECURITY.md](./SECURITY.md)
- Support channels: [SUPPORT.md](./SUPPORT.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- License: [MIT](./LICENSE)
