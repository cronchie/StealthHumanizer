# Examples

## Basic Humanization Flow

1. Paste AI-generated draft text.
2. Select **Medium** rewrite and **Professional** style.
3. Set target human score.
4. Run transformation and inspect detector metrics.

## Multi-pass Flow

1. Choose **Aggressive** or **Ninja** mode.
2. Review rewritten output and score deltas.
3. Iterate with alternate tone preset.

## Scripted Pipeline Example

```bash
npm run papers:benchmark -- --config data/papers/benchmark.smoke.config.json --run-id docs-example
npm run model:train -- --config data/models/train.smoke.config.json --run-id docs-example
npm run model:eval -- --manifest data/models/current/run.manifest.json
```

## Good Practices

- Start with lighter rewrite levels for minimal semantic drift.
- Validate with detector and readability metrics before final use.
- Keep provider-specific behavior notes in PR descriptions when changing prompts.
