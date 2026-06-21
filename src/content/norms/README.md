# `src/content/norms/` — age norms + scoring weights (seed)

The by-age normalisation data and composite-index weights (spec Дел 6 + Прилог B).
Raw scores → a 0–100 index **per exact age (5…13)**, where 50 = typical for the
age; the five composite indices are weighted combinations of the 8 signals
(weights are configurable here, e.g. `Memory&focus = 0.7·Gsm + 0.3·Attention`).

**Seed/initial values, not final norms (spec 6.6):** these start as indicative
reference values calibrated within the system, clearly labelled as such, and are
recalibrated from a pilot + the growing anonymous dataset into real norms over
time. Versioned with each anonymous record (spec 19.4) so results stay comparable.

Scaffolded in Phase 3.01 — data lands in a later v2 phase.
