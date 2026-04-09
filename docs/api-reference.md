# API Reference

StealthHumanizer exposes internal Next.js API routes for app functionality.

## `POST /api/humanize`

Primary rewrite endpoint used by the UI.

### Expected behavior

- Accepts source text and rewrite settings
- Selects configured provider/model
- Returns transformed text and related metadata

## `POST /api/alternative`

Returns alternative phrasing suggestions for selected text segments.

### Expected behavior

- Accepts original segment and rewrite context
- Generates multiple candidate alternatives
- Returns structured options for UI rendering

## Supporting Modules

- `lib/providers.ts`: provider catalog and request handling
- `lib/humanizer.ts`: transformation orchestration
- `lib/detector.ts`: detector scoring and metrics
- `lib/readability.ts`: readability calculations

For implementation-level details, see [ARCHITECTURE.md](https://github.com/rudra496/StealthHumanizer/blob/main/ARCHITECTURE.md).
