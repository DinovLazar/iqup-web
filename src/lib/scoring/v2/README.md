# `src/lib/scoring/v2/` — v2 scoring & the `CognitiveProfile` output seam

The deterministic scoring layer (spec Дел 6). Turns an engine `SessionRun` into
the **`CognitiveProfile`** — the OUTPUT contract that Phase 3.05 (results), 3.06
(anonymous Store A), 3.07 (report engine) and 3.09 (PDF/pentagon) consume.

> **Separation from v1.** The v1 strengths scorer (`@/lib/scoring` —
> `score.ts`, `reconstruct.ts`, …) is a different domain model and is still wired
> into v1 surfaces. It is **untouched** this phase. v2 lives entirely under this
> `v2/` subfolder; nothing here imports v1 and v1 imports nothing here.

## Pipeline (`buildProfile`)

1. **Signals** (`signals.ts` + `raw.ts` + `normalize.ts`) — per-domain raw scores
   → per-age 0–100 indices (Прилог B.2), plus the derived **attention** signal
   (`@/lib/validity`). Eight signals: Gf, Gv, Gsm, Gs, attention, EF, Glr, CT.
2. **Validity** (`@/lib/validity`) — the graduated outcome + the chance-level
   domains, computed before confidence (they feed it).
3. **Indices** (`indices.ts` + `weights.ts`) — the five composite indices via the
   spec's exact weights (`COMPOSITE_WEIGHTS`), each with a **band** (`bands.ts`,
   stable enum) and a **confidence** label (`confidence.ts`, weakest contributing
   signal).
4. **Features** (`features.ts`) — the structural derivations 3.07 narrates
   (profile shape, index pairs, solving style, memory asymmetry, learning slope,
   ceiling/floor extremes).

## The no-user-facing-numbers rule

This module legitimately computes raw + normalised 0–100 numbers — Store A saves
them and the bands + pentagon derive from them. That is NOT a violation of the
product's "no score/%/IQ/rank shown to the parent" rule: that rule governs what
the parent *sees* (3.09–3.11), not what the engine computes or the anonymous
store keeps. This layer renders **no** user-facing number/%/IQ/rank string — it
returns data; the band is an enum with **no display words baked in** (the words
are 3.09 / report / native-MK copy).

## Per-age normalisation

Span (Gsm) and speed (Gs) carry explicit per-age `expected` terms (`@/content/norms`).
The accuracy family (Gf/Gv/CT/EF/Glr) folds age in through the **adaptive
difficulty**: the age-keyed start level gives older children harder reached
items, and the raw score weights accuracy by reached-item difficulty — the
WISC-style way age enters an adaptive battery.
