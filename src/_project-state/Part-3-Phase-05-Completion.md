# Part 3 · Phase 05 · Code — The live assessment flow + task screens — Completion Report

**Phase:** 3.05 (Code) · **Branch:** `phase-3.05-assessment-flow` (off `main`) · **Date:** 2026-06-23
**One-line:** The invisible 3.03 engine + 3.04 item bank now have a real, on-brand UI at `/test` — age setup through the completion badge, one task at a time, fully deterministic, no AI at runtime.

---

## ⚠️ Gate B was waived — read first

The phase's **Dependency Gate B** requires the 3.02 design outputs (`docs/design-handovers/Part-3-Phase-02-Handover.md` + token file + prototype) and says **STOP and report** if absent. They **do not exist anywhere in the repo** — the Part-3 completion reports jump 3.01 → 3.03, so the **3.02 design phase was never executed/committed**. This was reported to the operator, who instructed to **continue**. The visual design was therefore **derived** from the confirmed brand constants (`brand.md` §6: official palette, Montserrat, the puzzle-brain motif, the ≥44px/spacing/radius scales) + `plan.md` §5/§8 (the assessment spec) + the Part-1 token system — **not** validated against a real 3.02 handover.

**Carryover:** if a real Part-3-Phase-02 handover later lands, reconcile the screens (the two-mood token system, exact task-frame states, motion specs) against it. Logged as **Decision #155**.

Gate A (3.03 + 3.04 on `main`) **passed**. Repo sync ritual ran clean (on `main`, up to date, no anomalies).

---

## What shipped

### The flow (`src/components/assessment/`, new module)
- **`AssessmentFlow.tsx`** — the client island `/test` mounts. Renders per phase; shows the puzzle-brain during practice/task; hosts the dev autopilot; carries the `// HANDOFF (3.06)` continue action. Wrapped in the existing `MotionProvider` (LazyMotion).
- **`useAssessment.ts`** — the orchestrator. Drives `createDomainController` across the seven domains **in the engine's canonical order**, injects `createTaskItemProvider()` in place of `fixtures.ts`, threads captured telemetry into each engine `Response`, and at session end assembles the `SessionRun`, runs `evaluateValidity(toResponseOutcomes(run))`, and persists the hand-off (or routes to retry).
- **`telemetry.ts`** — `useItemTimer` (silent per-item response-time + idle/blur capture, spec Дел 8; idle excluded from RT) and `baselineFromTaps` (median-of-5, clamped) for device calibration.
- **`session.ts`** — `generateSeed` (Web Crypto, no `Math.random`), `persistHandoff`/`readHandoff` to the versioned **`iqup.assessmentRun.v1`** sessionStorage key (no PII, never in the URL).

### The screens
- **Age setup** — exact age 5–13, **no child name**; large keyboard-operable buttons.
- **5–7 parent-assist gate** — technical-help-only rules + a confirmation checkbox; shown only for ages ≤7 (8+ go solo).
- **Practice** — `getPracticeItem(domain)` rendered with the real renderer (unscored), skippable; the **first practice runs the device-tap calibration** before the example.
- **Completion** — "Assessment complete" + the bespoke **"IQ UP! Explorer" badge** (assembled-pentagon SVG, brand gradient, **no Bibi**).
- **Retry** — the not-representative screen with a working retry (fresh seed → fresh item set).

### The seven task renderers (all off `TaskSpec.interaction`, as data)
Gf matrix + series, Gv rotation, CT loop + conditional → **`select-one`** (shared `SelectOneGrid`); Gsm Corsi → **`tap-sequence`** (show→hide→repeat, with a reduced-motion manual "Show → I'm ready" path); Gs symbol-search → **`multi-tap-timed`** (`TapField`, **the only visible countdown**); EF Tower of London → **`move-balls`**; Glr paired-associate → **`match-pairs`**; CT sequence + maze → **`order-steps`**, CT debug → **`tap-error`**. Built on shared primitives: `TaskFrame`, `SelectOneGrid`, `TapField`, the bespoke-SVG `Glyph`/`PolyShapeGlyph`/`DirectionArrow` vocabulary, `ConfirmAction`. (Four of the seven were built by parallel subagents against the shared contract, then integrated + reviewed.)

### The puzzle-brain progress
`PuzzleBrain.tsx` — five index-region pentagon pieces assemble as sections complete: **Logical←Gf · Spatial←Gv · Memory&focus←Gsm · Planning&speed←EF+Gs · Learning&STEM←CT+Glr**. A region fills with its brand hue + a check tab only when **all** its domains are done. A quiet non-numeric within-domain micro-indicator lives in the task frame. **No number / "N of M" / % / score anywhere.**

### Telemetry → validity → hand-off
Captured per item: response time, idle/blur, `selectedPosition` (select-one only — not tap-error, to avoid same-position-flag pollution), Gs `tappedCells`, omissions, and the device baseline (in `SessionRun.input`). `buildProfile(SessionRun)` runs clean on the assembled run (smoke). Validity at end: **mild → gentle note** on completion; **strong → not-representative + retry**.

### i18n
New **`Assessment`** namespace in `mk.json` + `en.json` — exact key parity (asserted by `messages.test.ts`), per-`taskType` instructions for all 12 task types + all flow chrome. **MK is provisional** (flagged).

### Latent Phase 3.01 defect fixed (`globals.css`)
The `:root` block's banner comment used a long run of `=` characters; **Turbopack's dev CSS parser truncated on it**, silently dropping every token below it (`--iq-*`, `--index-*`, `--space-*`, `--tap-min`) in `next dev` — so the entire v2 brand palette resolved to nothing in dev (the **production** build was unaffected, which is why 3.01 never caught it). Replaced with a concise comment; no token value changed. (Decision #157.)

---

## Definition of Done — checklist

- [x] `/test` renders the v2 assessment in both locales; v1 test engine no longer mounted (v1 left intact/orphaned).
- [x] Age setup (5–13, **no name**) drives the engine; 5–7 parent-assist gate + checkbox; 8+ solo.
- [x] All **seven task types** render from `TaskSpec.interaction`; a full session runs one-task-at-a-time end to end (verified in-browser via the dev autopilot — all 7 domains completed, hand-off persisted).
- [x] Practice precedes each new task type (skippable); **first practice captures the device tap-baseline**; `getPracticeItem` used.
- [x] Puzzle-brain assembles by index-region per the mapping, fills index colours, non-numeric within-domain indicator — **no number/%/score on any screen**.
- [x] **Visible countdown on Gs only**; no visible timer elsewhere.
- [x] Gsm reveal (show→hide→repeat) enforced, with a reduced-motion manual path.
- [x] All telemetry captured; well-formed `SessionRun` produced; `buildProfile(SessionRun)` runs (smoke).
- [x] Validity at end: **mild → gentle note**; **strong → not-representative + working retry** (fresh item set).
- [x] Completion + **"IQ UP! Explorer" badge** render.
- [x] `SessionRun` persisted to a **versioned sessionStorage key**, no PII, nothing in the URL; `// HANDOFF (3.06)` seam present; no form/Supabase/Brevo/results work.
- [x] **Deterministic** — same age+seed+answers → byte-identical `SessionRun` (asserted in `flow.test.ts`).
- [x] **No Bibi characters** anywhere.
- [x] `Assessment` i18n namespace, MK/EN exact parity (asserted), per-`taskType` instructions; MK provisional.
- [x] **WCAG 2.2 AA** intent across screens: keyboard + focus-visible, ≥44px (`min-h-tap`), reduced motion, never colour-alone (icon+colour selected states), no anxious timers except Gs. Mobile-first verified at narrow width (no overflow). *(Note: no automated `axe` run was added — the repo's axe suite targets v1 routes; an axe pass over `/test` states is recommended in QA. See Carryover.)*
- [x] `npm run build`, `lint`, `typecheck`, `npm test` all clean; **527/527 tests** (514 prior + 13 new); v1 suites still pass.
- [x] **Fresh-context review** dispatched — verdict **GO, no blockers, no should-fix**; its 2 a11y nits fixed (stray SR cell-count removed; over-broad `aria-live` scoped off the task section), 1 UX nit left as optional polish.
- [x] Independent decisions logged (#155–#164) — no silent ratifications.

---

## Quality (verbatim)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — **527 passed (50 files)** = 514 prior + 13 new (`src/components/assessment/flow.test.ts`).
- `npm run build` — green, 19 routes; `/test` is `ƒ Dynamic` (reads searchParams), as in v1.
- **Browser verification** (dev server): age setup → calibration → practice (Gf series + puzzle-brain) → full 7-domain autopilot → completion + colour badge; `iqup.assessmentRun.v1` persisted with all 7 domains, baseline captured, outcome `valid`. Screenshots captured during the session.

## Independent decisions (Decisions.md #155–#164)
155 Gate B waived (design derived, not from a 3.02 handover) · 156 v1 disposition (orphaned, not deleted) · 157 globals.css dev-truncation fix · 158 bespoke SVG uses literal hex (theme tokens are `@theme inline`) · 159 crypto seed · 160 calibration = median-of-5 · 161 in-flow age setup vs redirect · 162 practice unscored/skippable · 163 dev autopilot as state · 164 badge entrance scale-only (never opacity-0 on essential content).

## Blockers / carryover
- **3.02 design handover never existed** — reconcile screens if/when one lands (Decision #155).
- **MK copy is provisional** — needs a native review pass.
- **No automated axe scan over `/test`** was added this phase (the existing axe e2e targets v1 routes); recommend adding `/test`-state axe coverage in a QA pass. Manual a11y intent (keyboard, focus, targets, contrast, reduced-motion, no-colour-alone) was built in and reviewed.
- **PROVISIONAL difficulty/norm parameters** from 3.03/3.04 still flow through unchanged (frozen layers untouched).

## What's next → 3.06
The parent **form + consents + the two-store data model**. It plugs in at the `// HANDOFF (3.06)` seam on the completion screen, reading the persisted `iqup.assessmentRun.v1` (the `SessionRun` + validity outcome + device baseline) to drive lead capture + the report — none of which is built here.

## Process
Branch `phase-3.05-assessment-flow` off `main`; **not merged** — awaiting Lazar's explicit yes (then PR-or-direct-merge per branch protection, then delete the branch). Frozen layers (engine/scoring/validity/content/tasks/norms) **untouched** (confirmed by `git diff main --stat`).
