# `src/content/tasks/` — the procedural item bank (Phase 3.04)

The real assessment content for the seven measured task domains (spec Дел 4 +
Прилог A). Each domain has **one procedural generator** that emits typed,
**language-neutral** items on demand. This layer is **pure generation logic +
content data — it renders nothing.** 3.05 draws the screens against these
shapes; 3.02 designs against them.

> **Boundary (3.04 vs 3.05), as built.** 3.04 = the generators + the content
> specs (data) + the answer/`judge` + the scoring meta. 3.05 = the screens that
> render them, the live flow, timing/telemetry capture, the visible Gs countdown,
> the retry/gentle-note UI, and the localized instruction copy (i18n, keyed by
> each item's `taskType`). Nothing here is React/DOM/SVG/Tailwind.

## The provider (the seam the engine pulls from)

`createTaskItemProvider()` returns a **`TaskItemProvider`** — the engine's
`ItemProvider` plus `getPracticeItem(domain)`. 3.05 injects it into
`createDomainController` (3.03) in place of `fixtures.ts`:

```ts
import {createTaskItemProvider} from '@/content/tasks';
const provider = createTaskItemProvider();
// engine: provider.getItem(domain, level, format, rng) → Item
// practice screen: provider.getPracticeItem(domain) → a stable, easy Item
```

`getItem(domain, level, format, rng)` dispatches to the domain generator.
`fixtures.ts` is **kept** for the engine's own unit tests; this provider is the
**production** source.

## Determinism guarantee (extends 3.03 end-to-end)

- The **only** randomness is `@/lib/engine/prng` (mulberry32). **No `Math.random()`**
  anywhere on the path (asserted by a source scan in `provider.test.ts`).
- The engine derives an **independent per-domain `rng`** from `(seed, domain)`
  (`deriveSeed`) and threads it into every `getItem` call; each generator draws a
  unique id tag from that stream. So a given **session seed + age + answer path
  reproduces every item exactly**, and domain order never perturbs another
  domain's stream.
- The headline check (`integration.test.ts`): a full session through the engine +
  this provider + v2 scoring reproduces a **byte-identical `SessionRun` +
  `CognitiveProfile`** across two runs; different seeds → different sessions
  (new item sets on retest).

## The content-spec contract (what 3.05 renders)

Every item's `payload` is a `TaskSpec` (`types.ts`) — a discriminated union on
`taskType`. Shared conventions, binding for every spec:

- **`taskType`** — a stable id; the 3.05 i18n instruction key + the renderer
  discriminant. (e.g. `'gf.matrix'`, `'gv.rotation'`, `'ct.maze'`.)
- **`interaction`** — the input model **as data** (`{mode, …}`), so 3.05 knows
  which widget to show and how to package the child's `Response.answer`. Modes:
  `select-one`, `tap-sequence`, `multi-tap-timed`, `move-balls`, `order-steps`,
  `match-pairs`, `tap-error`.
- **`solution`** — **internal only; the renderer must NOT render it.**
  `solution.answer` IS the canonical correct `Response.answer`, so a single
  generic oracle (`correctAnswerFor`) can drive a "perfect" responder and `judge`
  can compare. `wrongAnswerFor` derives a guaranteed-wrong answer from
  `interaction.mode` (used by tests + the end-to-end check).
- **No localized text** anywhere — only tokens (`Glyph` / `ColorToken` /
  `Direction`), positions, and quantities. Instruction copy is i18n (3.05).
- **No forbidden tokens** — no score / IQ / % / rank / "level N" string ever
  appears in content (asserted). Internal difficulty levels stay internal.

### The specs, by domain

| Domain | `taskType`(s) | Paradigm (Прилог A) | Interaction | Scoring `meta` |
|---|---|---|---|---|
| **Gf** | `gf.matrix`, `gf.series` | 3×3 matrices + number series | `select-one` (4) | `optionCount` |
| **Gv** | `gv.rotation` | mental rotation (polyomino) | `select-one` (4) | `optionCount` |
| **Gsm** | `gsm.corsi` | Corsi span, show-hide-repeat | `tap-sequence` (fwd/bwd) | `spanLength` |
| **Gs** | `gs.symbolSearch` | timed symbol search | `multi-tap-timed` | `cellCount`, `targetCount` |
| **EF** | `ef.towerOfLondon` | Tower of London | `move-balls` | `minMoves` |
| **Glr** | `glr.pairedAssociate` | paired-associate, multi-attempt | `match-pairs` | `attempt`, `optionCount` |
| **CT** | `ct.{sequence,debug,loop,conditional,maze}` | Bebras/Code.org CT | `order-steps`/`tap-error`/`select-one` | `optionCount` (MC sub-types) |

The `meta` on each item is **exactly** what `@/lib/scoring/v2` reads for that
domain (e.g. `raw.ts maxCorrectSpan` reads `meta.spanLength` + `item.format`;
`gsNetPerTime` reads `meta.targetCount`; `learningSlope` groups by `meta.attempt`;
`validity/flags detectSpeedGaming` reads `meta.cellCount`). `judge()` returns
`credit` already net of any domain penalty (Decision #141).

> **Attention has no generator** — it is derived in scoring from response-time
> variability + omissions + impulsive errors across the whole session. **There is
> no verbal generator** — the verbal index is deferred for this MVP; the battery
> is nonverbal and language-neutral.

## Files

- `provider.ts` — `createTaskItemProvider` + `getPracticeItem` (the seam).
- `types.ts` — every content-spec type (the 3.05 rendering contract).
- `glyphs.ts` — token catalogs + polyomino geometry helpers.
- `shared.ts` — id builder, equality helpers, the `correct`/`wrong` answer oracle.
- `gf.ts` `gv.ts` `gsm.ts` `gs.ts` `ef.ts` `glr.ts` `ct.ts` — the seven generators
  (each `generate<Domain>` + `practice<Domain>`), tests alongside.
- `index.ts` — the public barrel (`@/content/tasks`).

## PROVISIONAL parameters (flagged like 3.03's seed norms)

The spec gives concrete numbers for many parameters; where it underspecifies, a
defensible PROVISIONAL value is set (and flagged inline + in `Decisions.md`):
Gf series rules above level 5; Gv uses 90/180/270° (135° from the spec needs
vector-path shapes, deferred); the Gsm level→span map + non-consecutive tile
revisits for spans > 6 tiles; the Gs per-level grid/target/time maps; the EF
minMoves cap of 7 above level 5; the Glr level→pairCount map + single learning
block recalled across the engine cap + the 0.5 recall threshold; the CT
per-sub-type difficulty maps + uniform sub-type selection + 4-option default.
These are MVP reference values for the recommended psychologist review + pilot.
