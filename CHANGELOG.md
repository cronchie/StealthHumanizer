# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

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

- Comprehensive governance and support documentation (`SUPPORT.md`, improved contribution/security policies).
- Professionalized GitHub community templates and automation (`CODEOWNERS`, Dependabot, workflow modernization).
- Structured Markdown docs information architecture under `docs/` for onboarding and usage.
- Release workflow for tag-based GitHub release publishing.

### Changed

- Overhauled `README.md` for professional onboarding, architecture overview, and policy links.
- Modernized CI and Pages workflows for `main` branch and clearer quality gates.
- Added repository hygiene baselines (`.editorconfig`, `.gitattributes`, refined `.gitignore`).

### Removed

- Removed duplicate root-level `FUNDING.yml` in favor of `.github/FUNDING.yml`.

## Release Checklist (v1.0.0)

- [x] Changelog entry finalized
- [x] CI workflows updated
- [x] Docs and governance pages updated
- [ ] Create and push tag `v1.0.0`
- [ ] Publish GitHub Release notes
- [ ] Confirm GitHub Pages source/deployment settings
