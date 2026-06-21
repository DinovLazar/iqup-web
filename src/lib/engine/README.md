# `src/lib/engine/` — adaptive assessment engine

The deterministic, **no-AI** adaptive motor (spec Дел 5). Per-domain item
selection with **basal/ceiling logic** (WISC-style): each task has a 1–10
difficulty level, the start level is keyed to the child's age, a correct answer
raises the level and an error lowers it, and a domain ends at its ceiling
(e.g. 2 consecutive errors) or a max-item cap (target 4–6 items/domain).

**Determinism is a hard requirement:** identical answers must always produce the
identical path and result (seedable, no randomness in scoring, no AI at runtime).

Scaffolded in Phase 3.01 — implementation lands in a later v2 phase.
