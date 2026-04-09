# StealthHumanizer

[![CI](https://github.com/rudra496/StealthHumanizer/actions/workflows/ci.yml/badge.svg)](https://github.com/rudra496/StealthHumanizer/actions/workflows/ci.yml)
[![Docs](https://github.com/rudra496/StealthHumanizer/actions/workflows/pages.yml/badge.svg)](https://github.com/rudra496/StealthHumanizer/actions/workflows/pages.yml)
[![Release](https://img.shields.io/github/v/release/rudra496/StealthHumanizer?sort=semver)](https://github.com/rudra496/StealthHumanizer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

StealthHumanizer is an open-source web application for rewriting AI-generated text into more human-like writing with configurable tone, style, and rewrite intensity, plus an integrated detection and readability analysis layer.

**Docs site:** https://rudra496.github.io/StealthHumanizer/

## Table of Contents

- [Features](#features)
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

- Multi-provider generation pipeline with support for free and paid model providers.
- Multiple rewrite levels (including multi-pass modes) to control transformation strength.
- Preset writing styles and tone controls for output targeting.
- Built-in detector with multiple heuristics and readability scoring.
- Side-by-side workflow for source text, transformed output, and quality feedback.
- Browser-first key handling to keep user API keys local to the client.

## Architecture

High-level architecture:

1. **UI layer (`components/`, `app/page.tsx`)** handles text entry, settings, and result rendering.
2. **API routes (`app/api/`)** orchestrate provider calls and rewrite workflows.
3. **Core logic (`lib/`)** provides prompt construction, provider abstraction, detector scoring, and storage helpers.
4. **Research and evaluation scripts (`scripts/`, `data/`)** support benchmark and training smoke pipelines.
5. **Documentation (`docs/`)** provides user and contributor guides published through GitHub Pages.

For deeper technical details, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [STYLE_ENGINE.md](./STYLE_ENGINE.md).

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

Then open `http://localhost:3000`, add a provider API key in settings, and run a rewrite.

## Configuration

StealthHumanizer is configured primarily through UI controls and local browser storage.

- **Provider keys:** configured in app settings and stored locally.
- **Rewrite strategy:** choose level, style, tone, and target score.
- **Research pipeline scripts:** use JSON configs under `data/papers/*.config.example.json` and `data/models/*.config.example.json`.

See [docs/configuration.md](./docs/configuration.md) for full details.

## Usage Examples

### Application usage

1. Paste AI-generated text.
2. Select rewrite level, style, and tone.
3. Run humanization.
4. Review detector/readability scores and iterate.

### Scripted benchmark/training smoke flow

```bash
npm run papers:benchmark -- --config data/papers/benchmark.smoke.config.json --run-id local-smoke
npm run model:train -- --config data/models/train.smoke.config.json --run-id local-smoke
npm run model:eval -- --manifest data/models/current/run.manifest.json
```

## Testing and Local Development

Common commands:

```bash
npm run lint
npm run test:integration
npm run build
```

Notes:

- `npm run test:integration` expects generated benchmark/model manifests.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow standards.

## Benchmarks and Performance

Benchmark and analysis documentation:

- [docs/BENCHMARK_METHODOLOGY.md](./docs/BENCHMARK_METHODOLOGY.md)
- [docs/HUMAN_AI_SIGNAL_LAYER.md](./docs/HUMAN_AI_SIGNAL_LAYER.md)
- [docs/MODEL_TRAINING_FRAMEWORK.md](./docs/MODEL_TRAINING_FRAMEWORK.md)

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for release milestones and planned improvements.

## Contributing

Contributions are welcome. Please review [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Security, Support, and License

- Security policy: [SECURITY.md](./SECURITY.md)
- Support channels: [SUPPORT.md](./SUPPORT.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- License: [MIT](./LICENSE)
