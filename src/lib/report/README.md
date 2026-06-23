# `src/lib/report/` — deterministic report engine (no AI)

Assembles a **personalised, non-templated** report from a `CognitiveProfile`
without any AI (spec Дел 9). The power comes from rich features × a large module
library × the assembly logic — not generation. The localised content library it
assembles from lives in [`src/content/report/`](../../content/report/).

**Entry point:** `buildReport(profile, context)` → a typed `ReportContent` for one
locale (the contract Phase 3.08 designs against and 3.09 / 3.10 render). It is
**pure + deterministic**: same `CognitiveProfile` + same `context` → byte-identical
output. No clock (the generated date is caller-supplied), no randomness.

Pipeline: the upstream **`CognitiveProfile.features`** (profile shape, index pairs,
solving style, memory asymmetry, learning slope, ceiling/floor) are read, never
recomputed → this layer does **presentational selection** (top strength = the
strongest index; growth area = the area with most room; band→word; confidence→word;
age→program; the all-strong / all-floor / ceiling / floor edge cases) → fires the
matching modules → orders them into `ReportContent`.

Files: `types.ts` (the `ReportContent` contract + `ReportContext`), `select.ts`
(the pure selection helpers), `assemble.ts` (`buildReport`).

Seams: the booking URL `/booking?grad={city}` is built by the rendering surface
(3.09) — the engine only carries the city. `context.generatedAt` is supplied by
the caller so the engine stays clock-free.

Implemented in Phase 3.07 (the report engine).
