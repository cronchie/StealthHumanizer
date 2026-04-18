# Roadmap

This roadmap reflects incremental improvements that preserve existing behavior
while enhancing the style-aware humanization engine and overall user
experience.

## Current Focus (v2.1+ corpus engine)

- Validate style-aware engine against real-world AI detectors (GPTZero,
  Originality, Turnitin).
- Expand corpus coverage with additional academic domains and publication years.
- Fine-tune collocation database based on detector feedback loops.
- Improve post-processing pipeline for edge-case phrase patterns.

## Near-Term

- Add automated detector benchmarking suite with published score reports.
- Support domain auto-detection from input text to select matching corpus
  statistics.
- Optimize corpus-style-model.json size for faster client-side loading.
- Improve docs with corpus engine technical deep-dives.

## Mid-Term

- Optional hosted API layer for programmatic access.
- User feedback loop to continuously refine corpus thresholds.
- Per-domain calibration profiles for specialized writing contexts.
- Expand static analysis and docs lint quality gates.

## Long-Term

- Multilingual corpus support (beyond English).
- Browser extension for in-page humanization.
- Mobile companion app.
- Internationalization of user-facing docs and onboarding.

## Contribution Alignment

Roadmap updates should be proposed via pull request and include:

- Problem statement
- Proposed scope
- Risk level (must remain safe/non-breaking unless explicitly approved)
- Validation plan
