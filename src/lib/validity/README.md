# `src/lib/validity/` — validity, timing & the derived attention signal

Guards a confident profile against garbage data (spec Дел 7 + Дел 8). Holds the
**validity flags** (too-fast responses, same-position bias, excessive idle gaps,
chance-level accuracy), the **graduated outcomes** (mild → soft note; strong →
withhold the confident profile), **per-task and total timing** capture, and the
**derived attention indicator** (computed from response-time variability +
omissions + impulsive errors — never a separate CPT).

Also home to the per-domain **confidence label** (high / medium / low) logic
(spec 6.5) and the basal/ceiling extreme handling (spec 7.3).

Scaffolded in Phase 3.01 — implementation lands in a later v2 phase.
