# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project follows [Semantic Versioning](https://semver.org/).

## [2.1.0] - 2026-04-11

### Added

- Style-aware humanization engine calibrated from academic writing statistics
  (OpenAlex, 11 domains, 2018–2025).
- Style model capturing real human writing patterns: sentence length distribution
  (mean 20.5, median 20, stddev 9.4), burstiness (0.426), vocabulary diversity
  (69.4%), passive voice ratio (18.1%), transition word frequencies, and sentence
  starter distributions.
- Style-aware prompt builder that injects corpus-calibrated statistical targets
  directly into LLM rewrite prompts.
- Corpus-calibrated detection thresholds — dynamic baselines derived from real
  academic writing rather than hardcoded values.
- Corpus-aware post-processing engine for output refinement.
- Expanded collocation database with 50+ new AI phrase replacements (150+ total).
- Bulk paper download and ingestion pipeline (`scripts/papers/`).

### Changed

- Style model (`public/corpus-style-model.json`) now loads via `fetch()` for
  client-side compatibility (no `node:fs` in browser bundle).
- AI detector uses dynamic corpus-calibrated thresholds instead of static
  heuristics.

### Fixed

- LinkedIn URL corrected in `Footer.tsx`.
- CI/CD workflow branch triggers updated from `main` to `master`.
- Client bundle crash resolved by isolating `node:fs` usage from browser-targeted
  `style-model.ts`.
- Markdown lint configuration fixed for Quality workflow.

## [2.0.0] - 2026-03-31

### Added

- 13 AI provider support with configurable API keys
- 4 rewrite levels including multi-pass ninja mode
- 13 preset writing tones and style controls
- Integrated AI detection heuristic scoring
- Readability analysis layer (Flesch-Kincaid, Gunning Fog)
- PDF and DOCX file upload support
- Grammar check integration
- Multi-language humanization support
- Browser-first API key storage (no server-side persistence)
- Side-by-side humanizer/detector workflow
- Dark/light theme toggle
- Research pipeline scripts for benchmark and training
- Comprehensive docs site with GitHub Pages deployment

### Changed

- Major rewrite from initial prototype to production Next.js application
- Upgraded to Next.js 16, React 19, TypeScript 6
- Modernized CI with Node 20/22 matrix testing
- Overhauled UI with Tailwind CSS and glass-morphism design

### Security

- All user data (API keys, history) stored client-side only
- No server-side persistence of user prompts or outputs

## [1.0.0] - 2026-04-09

### Added

- Comprehensive governance and support documentation (`SUPPORT.md`, improved
  contribution/security policies).
- Professionalized GitHub community templates and automation (`CODEOWNERS`,
  Dependabot, workflow modernization).
- Structured Markdown docs information architecture under `docs/` for onboarding
  and usage.
- Release workflow for tag-based GitHub release publishing.

### Changed

- Overhauled `README.md` for professional onboarding, architecture overview, and
  policy links.
- Modernized CI and Pages workflows for `main` branch and clearer quality gates.
- Added repository hygiene baselines (`.editorconfig`, `.gitattributes`, refined
  `.gitignore`).

### Removed

- Removed duplicate root-level `FUNDING.yml` in favor of `.github/FUNDING.yml`.
