# `src/lib/validity/` — validity, the graduated outcome & derived attention (v2)

Guards a confident profile against garbage data (spec Дел 7 + Дел 8) — **pure
functions only**. The live telemetry capture (timers, idle/blur detection) and
the gentle-note / retry UI are **Phase 3.05**; this layer just computes the
flags, the outcome, and the inputs the confidence model needs.

## What's here

- `flags.ts` — the five validity flags as pure detectors (spec 7.1):
  **too-fast** answers (RT < ~500ms; >30% → strong), **same-position** picking
  (>60% one position → strong), **idle gaps** (repeated long pauses → mild),
  **chance-level** accuracy (per domain → that index's confidence drops), and
  **speed-task gaming** ("smearing" Gs by tapping ~all cells → strong on Gs).
  Thresholds live in `@/content/norms` (`VALIDITY`).
- `policy.ts` — the **graduated-outcome policy**: no flags → `valid`; only mild →
  `gentle_note`; any strong → `not_representative` (retry). `evaluateValidity()`
  returns the full `ValiditySummary` (outcome + flags + counts + the chance-level
  domains the confidence model reads).
- `attention.ts` — the **derived attention** signal (spec 6.1):
  `raw = clamp(1 − normVariability − impulsiveRate, 0, 1)`, where variability is
  the coefficient of variation of **calibration-relative** response times and the
  impulsive rate counts too-fast-and-wrong answers + omissions. Attention is
  never a separate task (a real CPT is unreliable on an unsupervised phone — spec
  Дел 4). The scoring layer normalises this raw value to a 0–100 index.

The per-domain **confidence label** (high / medium / low) and the ceiling/floor
extreme handling live with scoring (`@/lib/scoring/v2`), which consumes this
layer's outputs.

Scaffolded in Phase 3.01 — implemented in Phase 3.03.
