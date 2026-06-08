# Completion Report — Part 1 · Phase 1.07 · Test engine

- **Phase ID + name:** 1.07 — Test engine (Code)
- **Executing Claude:** Code
- **Date completed:** 2026-06-08

---

## What shipped

The interactive **brain-games test** — the heart of the product. A parent can now land, pick an age,
and play the whole age-banded test on screen; it computes a strengths result and hands it off cleanly
for the email gate (1.08) and results screen (1.10) to plug into.

- **The route `/[locale]/test`** (`/test` MK, `/en/test` EN): a Server Component shell that reads
  `?age=N`, resolves the band via `getBandForAge` (`src/lib/bands.ts`), and mounts the client runner.
  On a missing/invalid age it renders an **inline age-picker fallback** reusing the landing's
  `AgeStart` (which links back to `/test?age=N`). Per-locale metadata (title/description/canonical/
  hreflang/OG), consistent with the 1.06 landing.
- **All 36 questions as content data** (`src/content/test/band-{3-5,6-9,10-13}.ts`), transcribed
  **verbatim** from the 1.04 spec §5 (MK verbatim, EN mirrored), each tagged to exactly one strength.
  The 1.04 spec was found at `docs/Part-1-Phase-04-Content-Spec.md` and **copied to
  `docs/content/Part-1-Phase-04-Content-Spec.md`** as required.
- **Shared strengths taxonomy** (`src/content/strengths.ts`): the six strengths per spec §1 — codes,
  1.03 colour-token binding (`words_obs`→`verbal`), bilingual display names — imported by scoring now
  and the 1.10 results screen later.
- **Rule-based scoring** (`src/lib/scoring/`): deterministic `score(answers, band, locale)` per spec
  §3, outputting the typed `TestResult`. **No total score and no IQ number** anywhere.
- **The question runner** (`src/components/test/`): one question at a time, a progress bar + "Question
  X of Y" (aria-live), Back/Next, accessible radio-group answer tiles, original inline-SVG + Lucide
  puzzle graphics, and the **reveal mechanic** (spec §7) for the 5 memory items.
- **End-of-test hand-off:** computes the `TestResult`, stamps `completedAt`, persists it to
  `sessionStorage['iqup.testResult.v1']`, and routes to a clearly-temporary completion view carrying
  the `// HANDOFF (1.08)` seam. Nothing sensitive is in the URL (only `age`).
- **i18n chrome:** a `Test` namespace in `mk.json` + `en.json` (exact key parity).
- **Dev preview:** `?dev=1` (non-production only) — a band-jump + auto-finish bar and a dev strengths
  summary; a no-op / stripped in production.
- **Tests:** scoring + content-integrity Vitest suites (and a `@/`→`src` Vitest alias to run them).

### The `TestResult` hand-off contract (what 1.08 + 1.10 consume)

```ts
interface TestResult {
  version: 1;
  band: BandKey;                 // '3-5' | '6-9' | '10-13'
  locale: 'mk' | 'en';
  strengths: {                   // all six, ranked strongest → weakest
    code: StrengthCode;
    total: number;               // questions feeding this strength in the band
    hits: number;                // correct among those
    ratio: number;               // hits/total ∈ [0,1] — PER-STRENGTH ONLY
    rank: number;                // 1..6 (deterministic)
    tier: 'celebrated' | 'also' | 'growing';
  }[];
  top1; top2; top3: StrengthCode;   // ranks 1/2/3
  growing: StrengthCode[];          // ranks 4–6
  completedAt?: string;             // ISO, stamped at hand-off
}
```

Persisted under `TEST_RESULT_STORAGE_KEY = 'iqup.testResult.v1'` (exported from `@/lib/scoring`).
**Invariant (verified live + by tests):** no aggregate/total score, no IQ/percentile/grade/pass-fail
field or string — the serialized payload contains no `"iq"`.

## Decisions made on the fly (with "why")
> All also appended to `Decisions.md` (#38–#48). Calling them out explicitly — no silent ratifications.

- **#38 Canonical band keys + `a-q01`/`b-q01`/`c-q01` ids** mapping the spec's `band-a/b/c` onto
  `src/lib/bands.ts`'s keys (never redefine the bands).
- **#39 Content schema extended** with a typed `GlyphSpec`/`StemSpec` visual model (stems + image
  options are data, not bespoke JSX) — the spec invites Code to own the implementation.
- **#40 Strengths module carries bilingual display *names* + an English-only `whatItIs`;** the warm
  bilingual §6 blurbs are 1.10 result copy and are intentionally not duplicated here.
- **#41 Tokenised `--toy-*` puzzle palette** added to `globals.css` (content colours, kept as tokens).
- **#42 `sessionStorage` hand-off** under `iqup.testResult.v1`; `completedAt` stamped at hand-off, not
  inside pure `score()`.
- **#43 Start screen + temporary Completion view** (handover §D) and the `TestResult` contract shape.
- **#44 Dev preview** gated to `?dev=1` + non-production.
- **#45 Runner motion** via `tw-animate-css` `animate-in` + framer-motion's `useReducedMotion` hook
  only (no `MotionProvider`/`LazyMotion` in the runner; no new deps).
- **#46 Vitest `@/`→`src` alias.**
- **#47 Runner column `max-w-xl`** (vs handover §D's 420px) to fit 3-col image-option grids on desktop.
- **#48 Lucide for objects, original inline SVG for abstract figures + the objects Lucide lacks**
  (duck, sock, shoe, butterfly, ball, balloon, block); locale-aware generated stem alt text.

## Surprises / off-spec changes

- **No conflicts between this prompt and `AGENTS.md`/`CLAUDE.md`/`current-state.md`.** The one
  reconciliation already anticipated by the repo: the 1.04 spec uses `band-a/b/c` while the canonical
  bands are `3-5/6-9/10-13`; mapped 1:1 (decision #38), as `bands.ts` itself instructs.
- **Spec §1 provides bilingual display *names* but only an English "what it is";** the warm bilingual
  descriptions live in §6 (result copy). Resolved per decision #40 (taxonomy = names + colour +
  English summary; §6 blurbs deferred to 1.10).
- **Dev-server visual artifact (not a bug):** under `next dev` (Tailwind v4 + Turbopack JIT), the
  selected-tile colour utilities intermittently failed to apply on dynamically-rendered tiles. The
  **production build renders them correctly** (verified by computed-style inspection on `next start`:
  selected tile = `--secondary-tint` bg + `--brand-blue` border + visible check badge). Documented so
  it isn't mistaken for a defect.
- **Screenshots:** the local preview screenshot tool times out in this environment (confirmed it fails
  even on the known-good 1.06 landing — a renderer/network-idle issue, not our code). Visual fidelity
  was instead verified by precise **computed-style inspection** against the 1.03 tokens plus
  accessibility-tree snapshots (arguably more exact than a screenshot for colours/fonts/structure).

## Files written / updated

**New — content + scoring:** `src/content/locale.ts`, `src/content/strengths.ts`,
`src/content/test/{types,band-3-5,band-6-9,band-10-13,index,content.test}.ts`,
`src/lib/scoring/{types,score,storage,index,score.test}.ts`.
**New — runner + visuals:** `src/app/[locale]/test/page.tsx`,
`src/components/test/{TestRunner,QuestionView,OptionTile,ProgressHeader,StartScreen,CompletionView,DevBar,StrengthChip}.tsx`,
`src/components/test/copy.ts`, `src/components/test/visuals/{Glyph,StemVisual}.tsx`,
`src/components/test/visuals/{lexicon,index}.ts`.
**Updated:** `src/messages/mk.json` + `src/messages/en.json` (added `Test` namespace),
`src/app/globals.css` (`--toy-*` palette), `vitest.config.ts` (`@/`→`src` alias).
**Docs/state:** copied `docs/content/Part-1-Phase-04-Content-Spec.md`; updated `current-state.md`,
`file-map.md`, `00_stack-and-config.md`, `Decisions.md`; this report. **New dev-tooling:**
`.claude/launch.json`. **Removed:** `src/content/test/.gitkeep`, `src/lib/scoring/.gitkeep`.

## Tests run + results

- `npm run build` ✓ · `npm run typecheck` ✓ · `npm run lint` ✓ (one `react-hooks` finding fixed) ·
  `npm test` ✓ **39/39** (existing bands suite + new scoring + content-integrity suites).
- **Scoring suite:** ranking by ratio then the fixed tie-break; tiers; all-correct & all-wrong both
  still celebrate top1/top2; determinism (deep-equal); invariants (six strengths, ranks 1..6, ratios
  in [0,1], **no total/no IQ** key or string).
- **Content suite:** per-band counts 10/12/14; exact strength distribution; one valid strength per Q;
  2–4 options with one existing `correct`; unique ids; MK/EN parity; the 5 reveal items.
- **Lighthouse** (`/test`, production `next start`):

  | Run | Perf | A11y | Best-Practices | SEO |
  |---|---|---|---|---|
  | MK mobile | 97 | 100 | 100 | 100 |
  | MK desktop | 100 | 100 | 100 | 100 |
  | EN mobile | 88 | 100 | 100 | 100 |
  | EN desktop | 100 | 100 | 100 | 100 |

  A11y/BP/SEO = 100 everywhere; desktop Perf 100; mobile Perf 88–97 — **at/above the landing's
  documented ~87** web-font-gated baseline (same root cause; no regression; finalize in 1.11).
- **Live flow** (production) verified for all 3 bands + both locales: start → image/text questions →
  reveal (timed: "Ready?" → "маче" stimulus + countdown → auto-hide → options) → completion →
  `sessionStorage['iqup.testResult.v1']` holds a valid `TestResult` with no `iq`. Mobile (375px):
  no overflow, 2-col grid, 56px CTA, 144px tiles. Dev preview present in dev, stripped in prod.

## Fresh-context review

A fresh-context review subagent independently checked the build against the 1.04 spec and
`current-state.md`. **Outcome: zero blockers, zero should-fix items.**

- **Transcription fidelity (critical):** all 36 questions diffed character-for-character against spec
  §5 — every MK prompt + option is **verbatim** (including `…`, `→`, `°`, `·`, `%`, `денари`), and
  every EN string, `correct` id, `strength` tag, and option order matches exactly. Nothing invented,
  dropped, altered, reordered, or mistranslated.
- **Strengths / counts / distribution / scoring / reveal / accessibility / i18n parity (23 keys both
  sides) / guardrails** — all PASS. The **no-total / no-IQ** invariant is confirmed intact (no
  aggregate/IQ/percentile/grade/pass-fail field or string). No child data in the URL; the
  `// HANDOFF (1.08)` seam present; dev preview stripped in production; no Bibi generated/redrawn.
- **Nits (all intentional/documented):** C-Q10 cube-net kept (spec's preferred path, not the optional
  substitution); `whatItIs` English-only by design (spec §1 is English-only there); lexicon alt-text
  is provisional MK (flagged for review). No action required.

Verdict: faithful transcription, invariants intact, ready to close.

## Blocked / carryover items

- **Provisional MK pending native review:** all 36 test questions/options (MK verbatim from the spec),
  the `Test` chrome strings, and the generated stem alt-text in `visuals/lexicon.ts` are
  Claude-drafted/transcribed; EN is the mirror and must stay equivalent.
- **`/test` language toggle drops `?age`** mid-test (`usePathname` is query-less) → returns to the age
  picker on a locale switch. Minor; carry the age across the switch in a later polish pass.
- **C-Q10 cube-net** is the spec's heaviest graphic; rendered simply (face marks decorative — scoring
  uses `correct`). Spec §7 offers an easy substitution if a cleaner asset is wanted.
- **Reduced-motion reveal** (manual Show / "I'm ready") is implemented + code-verified; the timed path
  was verified live (reduced-motion couldn't be emulated in the headless preview).
- **Mobile Lighthouse Performance** carryover (web-font-gated LCP) continues from 1.06 → finalize 1.11.
- **Bibi art** remains optional decoration only; none present, so the test renders without it
  (graceful absence) — never generated/redrawn.

### Notes for the native-Macedonian reviewer
Every Macedonian question, option, and chrome string in this phase is **provisional, Claude-drafted/
transcribed** and needs review for natural, child-appropriate language; the logic items should read
clearly; number/`денари` formatting should be checked; EN is the mirror and must stay equivalent. The
auto-generated stem alt-text (`visuals/lexicon.ts`) is likewise draft MK.

### Notes for IqUp
The test reports **no score and no IQ number** — strengths-based and positive-only, consistent with
the honest-IQ-framing rule (all-low runs still celebrate the top strengths and frame the rest as
"growing"). Final privacy/consent wording remains IqUp's sign-off, handled separately (1.08 / 2.04).

## What's next

**1.08 — Email gate** at the `// HANDOFF (1.08)` seam: capture parent email + consent, read the
`TestResult` from `sessionStorage`, and call `insertLead()` (1.05) storing only the strengths summary.
**1.10 — Results + certificate:** read the same `TestResult`, import the strengths taxonomy, and build
the profile + certificate from the spec §6 templates (`src/content/results/`).
