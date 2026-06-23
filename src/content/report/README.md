# `src/content/report/` — report module library (copy)

The localised content library the [report engine](../../lib/report/) assembles
into a parent-facing `ReportContent` (spec Дел 9.2 + Прилог C). Data only — the
deterministic assembly lives in `@/lib/report`.

**Bilingual: Macedonian (default) + English (mirror).** All MK copy is
**PROVISIONAL**, drafted for the native-Macedonian reviewer; EN is the mirror and
must keep exact key parity. (The 3.01 scaffold README floated a four-locale
`mk·sr·hr·en` shape; the live `Locale` type and this phase's scope are MK+EN —
the engine is locale-generic, so adding a locale later is a data-only edit.)

Module families (each a small module that fires on a `CognitiveProfile` feature):

- **`bands.ts`** — band → display **word**; confidence → word + a plain-language note.
- **`indices.ts`** — per-index name · as-strength · as-growth (+ a supporting
  activity), plus the all-strong "next frontier" and all-floor gentle variants.
- **`narrative.ts`** — profile-shape · index-pair · solving-style · learning-slope
  · ceiling/floor extremes.
- **`stem.ts`** — STEM readiness + the bridge to coding/robotics (by variant).
- **`activities.ts`** — the home-activity bank keyed by **(index, age-cluster)**
  (the largest block; the engine draws 2–3 per child).
- **`iqup.ts`** — the expert positioning paragraph, the **age → program** mapping
  (data; flagged for IqUp to confirm), the program-fit line, and the demo CTA.
- **`disclaimer.ts`** — the honest indicative-not-diagnostic notice + the
  provisional-norms honesty + the validity-treatment notes. Flagged for IqUp legal.

**Hard rule (project guardrail + spec 1.1 / 6.4):** **no number / `%` / "IQ" /
score / rank / "level N" / deficit language** in any user-facing string, MK or EN.
Bands appear only as the approved words; confidence only as high/medium/low words
+ a note. Growth is "room to grow", never a deficit. Enforced, non-vacuously, by
`report-content.test.ts`.

Implemented in Phase 3.07 (the report engine).
