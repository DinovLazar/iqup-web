# `src/lib/engine/` — adaptive assessment engine (v2)

The deterministic, **no-AI** adaptive motor (spec Дел 5). Per-domain item
selection with **basal/ceiling logic** (WISC-style): each task has a 1–10
difficulty level, the start level is keyed to the child's exact age, a correct
answer raises the level and an error lowers it, and a domain ends at its ceiling
(two consecutive errors) or its per-domain item cap (target 4–6 items/domain;
Gf/Gv get a couple more; the 10–13 cluster runs a slightly longer battery).

**Determinism is a hard requirement** (spec Дел 5): a session is parameterised
by `(age, seed)`; identical answers always produce the identical path and result.
No `Math.random()` anywhere — only the seeded PRNG (`prng.ts`, mulberry32). Each
domain draws from an independent stream derived from `(seed, domain)`, so domain
order never perturbs another domain's stream.

## The two seams

This phase (3.03) defines and documents both seams so later phases build against
a frozen contract.

### Input — implemented by 3.04 (the item bank)

- **`Item`** (`types.ts`) — declares its `domain`, `level` (1–10), `format`, an
  opaque `payload` (the engine never reads it), a `judge(response)` that returns
  `{correct, credit?}`, and optional `meta` (span length, cell counts, EF min
  moves…) that the **scoring** layer reads.
- **`ItemProvider.getItem(domain, level, format, rng)`** — returns an item for a
  domain at a level/format, optionally drawing on the seeded `rng`. 3.04
  implements this over the procedural generators; `fixtures.ts` implements it for
  tests.
- **`Response`** (`types.ts`) — the child's answer plus the telemetry the
  engine/validity/scoring layers consume (response time, idle gaps, selected
  position, omission, Gs tapped-cell count). **Telemetry capture is 3.05.**

### Output — consumed by 3.05 / 3.07 / 3.09

The engine emits a **`SessionRun`** (`engine.ts`): per-domain `DomainRun` records
(items shown, responses, judgments, levels, ceiling/floor extremes). The scoring
layer (`@/lib/scoring/v2`) turns a `SessionRun` into the **`CognitiveProfile`**
(8 signals + 5 indices + bands + confidence + derived features + validity
outcome) — that is the contract 3.05/3.07/3.09 consume.

## Files

- `prng.ts` — the seedable mulberry32 PRNG + helpers (`makeRng`, `deriveSeed`,
  `nextInt`, `pick`, `shuffle`). **3.04's generators reuse this.**
- `types.ts` — the input seam (`Item`/`ItemProvider`/`Response`) + shared core
  types (`Domain`, `AgeCluster`, levels).
- `engine.ts` — the adaptive loop: `createDomainController` (step-by-step, for
  the live UI) and `runDomain`/`runSession` (driven by a `Responder`, for tests).
- `fixtures.ts` — deterministic stub provider + responder helpers.
