# Part 3 · Phase 07 · Code — The report engine (deterministic report assembly) — Completion Report

**Phase:** 3.07 (Code) · **Branch:** `phase-3.07-report-engine` (off `main`) · **Date:** 2026-06-23
**One-line:** The scores become words — a pure, deterministic content + logic layer that turns a finished `CognitiveProfile` into the warm, no-number parent report the PDF (3.10) and on-screen results (3.09) will render, with zero visual/PDF/rendering work this phase.

---

## Repo sync ritual

`git fetch` → local `main` clean and up to date with `origin/main` (3.06 already merged; HEAD `bc635f8`). Branched `phase-3.07-report-engine` off `main`. No unexpected state. All work on the branch; nothing committed to `main`.

---

## What shipped

Two new directories, both pure libraries (no UI, no PDF, no route/schema/i18n change):

### `src/lib/report/` — the deterministic assembly
- **`types.ts`** — the **`ReportContent`** output contract (the seam 3.08 designs against / 3.09 + 3.10 render) + **`ReportContext`** (`{locale, city, gender?, generatedAt?}`; age comes from the profile).
- **`select.ts`** — pure presentational selection over `CognitiveProfile.features` (recomputes no psychometric): `growthVariant` (standard / all_strong / all_floor), `learningBucket` (PROVISIONAL Glr-slope copy buckets), `stemBridgeVariant`, `indexPairVariant` + `pairVariantsToNarrate`, `activityIndices` + `selectActivities` (seed-rotated draw), `dayLevel` (ISO→`YYYY-MM-DD` by string-slice — **never constructs a `Date`**).
- **`assemble.ts`** — **`buildReport(profile, context)`**: features → fired modules → the assembled `ReportContent`. Maps band→word, confidence→word+note, age→program; handles validity + the edge cases; fills `{program}`/`{index}` slots; leaves the booking URL a `// SEAM (booking URL)`.
- **`index.ts`** barrel; **`README.md`** rewritten (engine overview + the purity/no-recompute contract + the booking + generatedAt seams).

### `src/content/report/` — the bilingual module library (MK default + EN mirror, exact key parity, all MK PROVISIONAL)
`bands.ts` (band display words + confidence words/notes) · `indices.ts` (per-index name/strength/growth/activity + the next-frontier & gentle-floor variants) · `narrative.ts` (profile-shape · index-pair · solving-style · learning-slope · extremes) · `stem.ts` (STEM intro + bridge variants) · `activities.ts` (the **(index, age-cluster)** home-activity bank, ≥2 per cell) · `iqup.ts` (the 4 in-scope programs + `AGE_TO_PROGRAM` + `programForAge` + positioning/program-fit/CTA) · `disclaimer.ts` (indicative-not-diagnostic + provisional-norms + validity notes) · `types.ts` + `index.ts` + **`README.md`** rewritten.

---

## The `ReportContent` contract, as built

`meta` (age · locale · `normsVersion` · day-level `generatedDate` · validity treatment) · the **five `indices`** (parent name + band **display word** + confidence **word** + a plain-language confidence note) · `overview` (profile-shape + strong index-pair sentences) · `topStrength` · `growthArea` (variant + kind body + supporting activity) · 2–3 `homeActivities` · `solvingStyle` (observed body + the kindly learning trajectory) · `stemReadiness` (body + the STEM **bridge**) · `extremes` (positive ceiling / gentle floor, null when none) · `iqup` (positioning + program-fit + demo CTA + `programId`/`programName` + the carried `city`) · `disclaimer` (body + provisional-norms note).

Two beyond the brief's enumerated list — **`overview`** and **`extremes`** — give the profile-shape, index-pair, and ceiling/floor module families an explicit output home (Decision #177).

---

## Independent decisions the brief asked me to make

- **Age → program mapping** (Decision #179): a clean non-overlapping partition — **5–7 → Magic Laboratory · 8–9 → Magic Laboratory PLUS · 10–11 → Oliver's Scientific Adventures · 12–13 → Oliver's Scientific Adventures PLUS** (Little Explorers 3–5 excluded since the test starts at 5). Data record → one-line correctable. **FLAGGED for IqUp to confirm.**
- **Validity treatment** (Decision #181): `valid` → clean report; `gentle_note` → soft note (`caveated:false`); `not_representative` → the **full** report + `caveated:true` + a strong lead caveat — the engine never withholds; the send/withhold decision is the caller's (3.10).
- **Generated date** (Decision #178): caller-supplied via `context.generatedAt`, day-level-sliced; the engine is clock-free for determinism.
- **Forbidden-token exception** (Decision #183): clinical/diagnostic terms banned everywhere **except** the disclaimer + validity notes (negation only); all other tokens banned everywhere — resolving the brief's "no clinical terms" vs. "disclaimer must say *not diagnostic*" tension.
- **Scope** (Decision #184): bilingual MK+EN (not the scaffold README's `mk·sr·hr·en`); locale-generic so adding a locale is data-only.

Full list: Decisions.md **#177–#184**. Also: learning-slope copy buckets (#180), home-activity draw (#182).

---

## Definition of Done — status

- [x] `src/content/report/` + `src/lib/report/` exist and replace the 3.01 README placeholders; **`ReportContent`** defined + exported.
- [x] `buildReport` is **pure + deterministic** — byte-identical output asserted; no `Date`/`Math.random`.
- [x] **No forbidden tokens** in any user-facing string, MK + EN, non-vacuous (>120 strings scanned in content, >20 in assembled prose, per locale); bands only as approved words, confidence only as high/medium/low words + a note.
- [x] **Honest framing holds:** no number; growth always kind; ceiling positive; floor gentle; disclaimer indicative-not-diagnostic + norms provisional.
- [x] **MK/EN parity** asserted (every leaf has non-empty mk+en; slot parity).
- [x] **Personalization property** asserted (varied profiles → near-total report uniqueness).
- [x] **No child name** anywhere; addresses "your child"; gender-neutral MK (`context.gender` accepted, unused).
- [x] **CTA:** every exact age 5–13 → exactly one program; city carried; `?grad` construction left a documented `// SEAM`.
- [x] **Validity handled** (valid / gentle_note / not_representative); treatment documented.
- [x] Frozen 3.03 / 3.04 layers **untouched** (no tracked file modified — pure additions); `CognitiveProfile` consumed without recomputing features.
- [x] `npm run typecheck`, `npm run lint`, `npm test` clean; `next build` green; **route table unchanged**.
- [x] Fresh-context review run; verdict recorded; should-fix addressed.
- [x] Completion report filed; state files updated; every independent decision surfaced + logged.

---

## Quality (verbatim)

- `npm run typecheck` → clean.
- `npm run lint` → clean (0 problems).
- `npm test` → **597/597 passed (57 files)** = 572 prior + **25 new** (12 in `report.test.ts`, 9+ groups in `report-content.test.ts`).
- `next build` → green; **route table unchanged** (21 routes, identical to 3.06 — the report engine is a pure lib, not yet wired to any page).
- Frozen-layer check: `git status` shows only **new untracked files** under `src/content/report/` + `src/lib/report/` — no tracked file modified (scoring/validity/norms/engine untouched).

---

## Fresh-context review

A fresh-context reviewer (no prior context on my reasoning) audited the new code against every guardrail and ran typecheck/lint/tests. **Verdict: APPROVE, no must-fix.** It confirmed determinism (no clock/randomness), no feature recomputation, non-vacuous forbidden-token tests, the scoped clinical-negation exception, MK gender-neutrality, age→program coverage, and all edge cases. One genuine MK typo it flagged — `провер` → `проверка` (narrative.ts, `fast_errors` style) — was fixed. Nice-to-haves (typographic-quote normalization for the PDF phase, an explicit `\blevel\s+\d` regex) noted, not blocking.

---

## Carryover / flagged for the parallel track (for Lazar to route)

1. **Age → program mapping** → **IqUp** to confirm (Decision #179; data record, one-line correctable).
2. **Disclaimer + validity-note wording** → **IqUp legal** (PROVISIONAL).
3. **All report MK copy** → the **native-Macedonian reviewer** (EN is the mirror).
4. PROVISIONAL **learning-slope thresholds** ride with the other seed-norm thresholds for the pilot/psychologist re-tune.
5. `00_stack-and-config.md` **unchanged** — no dependency or config change this phase.

---

## Process

One phase, one branch, one commit (this report included). End-of-phase: push `phase-3.07-report-engine`; **ask Lazar before merging** — do not merge unprompted.
