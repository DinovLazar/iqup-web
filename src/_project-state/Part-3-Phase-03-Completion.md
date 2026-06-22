# Completion Report — Part 3 · Phase 03 · Adaptive engine + scoring (Code)

- **Phase ID + name:** 3.03 — Adaptive engine + scoring (the deterministic logic layer)
- **Executing Claude:** Code
- **Date completed:** 2026-06-22

---

## What shipped

The full deterministic, **no-AI** logic layer the rest of v2 builds on — engine, scoring, validity, seed norms, both seams, and a complete unit suite. **Pure logic only: no UI, no item content, no persistence, no copy.**

- **Seeded PRNG** (`src/lib/engine/prng.ts`) — mulberry32 + an xmur3 string hash + `deriveSeed` for independent per-domain streams. `makeRng(number|string)`, `nextInt`/`pick`/`shuffle`. The same utility 3.04's generators will import. No `Math.random()` on the path.
- **Input seam** (`src/lib/engine/types.ts`) — `Item` / `ItemProvider` / `Response` (+ `ItemScoringMeta`, `Domain`, `AgeCluster`, `ItemFormat`), documented for 3.04.
- **Adaptive engine** (`src/lib/engine/engine.ts`) — basal/ceiling per domain: start level by exact age, correct→up / error→down, discontinue at 2 consecutive errors or the per-domain cap, age-cluster format selection (Gsm forward-only <8, forward+backward ≥8; 10–13 extended battery). Exposed as both a step-by-step `createDomainController` (for the live UI in 3.05) and pure `runDomain`/`runSession` drivers (for tests). Emits a `SessionRun`.
- **Fixture providers + responders** (`src/lib/engine/fixtures.ts`) — deterministic stubs at known levels with known answers + scoring meta; `alwaysCorrect`/`alwaysWrong`/`correctUpToLevel`/`scripted`. Shipped (not test-only) so 3.04 reuses them.
- **v2 scoring** (`src/lib/scoring/v2/`) — `SessionRun` → the **`CognitiveProfile`** output seam via `buildProfile`: per-domain raw → per-age 0–100 indices (Прилог B.2) → the **8 signals** (incl. derived attention + calibration-relative timing) → the **5 composite indices** (exact spec weights) → **bands** (stable enum) → **confidence** labels → **derived structural features** + the validity outcome + session/version metadata.
- **Validity** (`src/lib/validity/`) — the five flags as pure functions, the derived **attention** signal (`raw = clamp(1 − normVariability − impulsiveRate, 0, 1)`, calibration-relative), and the **graduated-outcome policy** (mild → `gentle_note`; strong → `not_representative`). Telemetry capture + retry UI explicitly left to 3.05.
- **Seed norms** (`src/content/norms/index.ts`) — start-level table, span norms (Прилог B.1), the B.2 coefficients, band cutoffs, domain caps + ceiling rule, validity/confidence/feature thresholds, and the provisional speed table + calibration reference. PROVISIONAL header; `NORMS_VERSION = 'seed-2026-06-PROVISIONAL'`.
- **Seam docs** — expanded `engine/README.md` (both seams), new `scoring/v2/README.md` (pipeline + the no-numbers rule + per-age normalization), updated `validity/README.md`.

Source: `IQ UP Specifikacija v1.2 FINAL.pdf` (located at `~/Documents/…`, MK, 37pp) — Дел 3/4/5/6/7/8 + Прилог A/B read for every concrete number.

## Decisions made on the fly (with "why")
> All also appended to `Decisions.md` (#130–#142). Summary:

- **#130** v2 under `scoring/v2/` (subpath), v1 untouched.
- **#131** PRNG = mulberry32 + xmur3 + per-domain `deriveSeed` (the documented algorithm choice).
- **#132** Start-level table = the spec's Gf example applied to all domains (PROVISIONAL for non-Gf — the spec tabulates only Gf).
- **#133** Caps: Gf/Gv 6, others 5, +1 for 10–13; ceiling 2 consecutive errors; no hard minimum (a real floor stays a floor, reported via low confidence).
- **#134** Gsm format: forward-only <8, alternating from 8 (PROVISIONAL interleave).
- **#135** B.2 formulas verbatim; accuracy form reused for EF/Glr/attention; accuracy-domain per-age norming via the adaptive difficulty (WISC-style), span/speed via explicit per-age terms.
- **#136** PROVISIONAL per-age speed table + the `effectiveSeconds` calibration model. **Known artifact:** the provisional speed `expected` is small, so an all-wrong Gs still normalizes to ~46 (solid) — flagged for the psychologist review.
- **#137** Span ranges (ages 6/9/12) encoded as midpoints (PROVISIONAL).
- **#138** Confidence model (PROVISIONAL thresholds); index confidence = weakest contributing signal; attention consistency = `1 − normVariability`.
- **#139** Validity severity mapping (same-position + smearing = strong; too-fast >30% strong; chance-level → per-index confidence drop, not a session-wide strong flag).
- **#140** `CognitiveProfile` derived-features shape (Code owns the structure; cutoffs in `norms.FEATURES`, PROVISIONAL).
- **#141** Credit seam: `item.judge()` returns `credit` already net of domain penalties (keeps scoring generator-agnostic).
- **#142** No spec-vs-plan mismatch found.

## Surprises / off-spec changes
- **None off-spec.** Every numeric value `plan.md` §6 restates matches the spec PDF appendices verbatim — nothing had to be overridden (#142).
- The provisional **Gs speed floor (~46)** artifact (#136) is the one place a provisional norm produces a slightly counter-intuitive number; it is in-range, NaN-free, spec-faithful (formula + provisional expected), and explicitly flagged for calibration. It does not affect any hard invariant.
- The fixtures' `selectedPosition` was made opt-in (not defaulted) so ordinary sessions don't trip the same-position flag; positions are exercised explicitly in the flag tests.

## Files written / updated
**New code:** `src/lib/engine/{prng,types,engine,fixtures,index}.ts`; `src/lib/scoring/v2/{types,weights,normalize,raw,collect,signals,bands,confidence,indices,features,profile,index}.ts` + `README.md`; `src/lib/validity/{types,attention,flags,policy,index}.ts`; `src/content/norms/index.ts`.
**New tests:** `engine/{prng,engine}.test.ts`; `scoring/v2/{normalize,bands,composite,confidence,features,profile}.test.ts`; `validity/{attention,flags,policy}.test.ts`; `content/norms/norms.test.ts`.
**Updated (docs only):** `src/lib/engine/README.md`, `src/lib/validity/README.md`.
**State/docs:** `Decisions.md` (#130–#142), `current-state.md`, `file-map.md`, this report.
**Untouched (verified):** all v1 scoring (`score.ts`/`reconstruct.ts`/`types.ts`/`storage.ts`/`index.ts`) and every v1 component.

## Tests run + results
- **`npm test` — 420 passed / 420 (40 files).** 292 pre-existing v1 tests + **128 new**. (Reported new count: 128.)
- **`npm run typecheck`** — clean. **`npm run lint`** — clean. **`npm run build`** — green; route table unchanged (engine/scoring are pure libs, not yet wired to any page — correct for this phase).
- Coverage includes: determinism (byte-identical path + profile; different seeds change the path; domain-order independence), golden full sessions per age cluster (hand-checked signals/indices/bands/confidence), all five composite formulas, band edges (44/45, 63/64, 79/80, 8/99 clamps), confidence high/medium/low reachability + validity caps, every validity flag firing + silent, the graduated policy mild vs strong, and the hard invariants (time-not-a-penalty off Gs; ceiling/floor in-range & NaN-free; no user-facing number/%/IQ/rank string leaks; Store-A slice all numeric).
- **Fresh-context review subagent:** **PASS-WITH-NITS, no blockers.** Two worthwhile nits fixed (attention zero-baseline fallback aligned to `REFERENCE_TAP_BASELINE_MS`; floor-extreme comment added); the rest are noted above/in Decisions. Re-ran all gates green after the fixes.

## Blocked / carryover items
- **PROVISIONAL seed values for the recommended psychologist review (spec 6.6 / 20):** the non-Gf start-level curve (#132), per-age speed expectation + the ~46 Gs floor artifact (#136), span midpoints (#137), confidence thresholds (#138), validity severities (#139), and feature cutoffs (#140). All are clearly flagged in code and `NORMS_VERSION`.
- **Future cleanup (not now):** remove the v1 scoring/engine/results code once its last v1 surface is rebuilt (kept green this phase per scope).
- **Merge:** branch `phase-3.03-engine-scoring` pushed, **not merged** — awaiting Lazar's explicit yes (per the repo ritual).

## What's next
- **3.04 — item bank:** implement `ItemProvider`/`getItem` + the procedural generators against the input seam, reusing `prng.ts`; replace the fixtures with real items.
- **3.05 — the live flow:** drive `createDomainController` step-by-step, capture the telemetry the `Response`/validity layers consume, measure the device calibration baseline (first practice task), and build the gentle-note / retry UI off the validity outcome.
- **3.06 / 3.07 / 3.09:** extract the anonymous slice from `CognitiveProfile` (Store A), map its derived features to report prose, and draw the pentagon from the five index values.
