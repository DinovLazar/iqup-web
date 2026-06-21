# `src/lib/report/` — deterministic report engine (no AI)

Assembles a **personalised, non-templated** report from the scores without any AI
(spec Дел 9). The power comes from rich signals × a large module library × the
assembly logic — not generation.

Three layers: **signals** (per task — accuracy, level, time, error type) →
**derived features** (profile shape flat/spiky, index pairs, speed-accuracy style,
memory asymmetry, ceiling, learning slope) → **module library + assembly** (each
combination triggers a module with text + home activities + an IQ UP! program
hook + a dynamic demo CTA). Selects top strength + growth area + style module +
the STEM bridge → one assembled report. The module content library itself lives
in [`src/content/report/`](../../content/report/).

Scaffolded in Phase 3.01 — implementation lands in a later v2 phase.
