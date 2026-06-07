# Part 1 · Phase 1.04 — Test Content & Scoring · Completion Report

**Phase:** 1.04 — Test content + scoring (Chat phase)
**Status:** ✅ Complete
**Date:** 2026-06-07
**Deliverable:** `Part-1-Phase-04-Content-Spec.md` (place in repo at `docs/content/`)

---

## 1. Summary

Authored the complete content and scoring spec for the brain-games test: the six-strength taxonomy (mapped to the 1.03 colours), a deterministic rule-based scoring algorithm with no total and no IQ number, a recommended data schema for Code, **all 36 original questions** across the three bands in Macedonian and English, the full result/strengths-profile templates, the certificate copy, and the asset/mechanic dependencies.

**Definition of Done:**
- [x] Six strengths defined, each with code, colour binding, description, and bilingual display name.
- [x] Per-band test shape (10 / 12 / 14) and strength distribution.
- [x] Deterministic scoring algorithm (ratio-based; top-2 celebrated, rank-3 "also", ranks 4–6 "growing"; positive-only; no score/IQ).
- [x] Recommended TypeScript schema for Code.
- [x] Full question banks: Band A (10), Band B (12), Band C (14) — every item original, MK + EN, with options, correct answer, strength tag, and asset note.
- [x] Result templates (celebration, headline, blurbs, also/growing lines, band CTAs) + certificate copy, MK + EN.
- [x] Reveal-mechanic spec for memory items, with reduced-motion fallback.
- [x] Asset dependency list (simple original graphics; Bibi optional/decorative only).
- [x] Hand-off notes for Code, the native MK reviewer, and IqUp.

---

## 2. Decisions made during authoring (review & adjust freely)

| # | Decision | One-line reason |
|---|---|---|
| 1 | **Length gradient 10 / 12 / 14** (3–5 / 6–9 / 10–13) | "Balanced" with the youngest shortest; difficulty climbs with age. |
| 2 | **All six strengths appear in every band** | Keeps the colour system, results, and certificate consistent across siblings of different ages. |
| 3 | **Each question feeds exactly one strength** | Cleanest, most interpretable rule-based scoring; avoids one strength inflating others. |
| 4 | **Ratio scoring + top-2 headline / rank-3 "also" / ranks 4–6 "growing"** | Fair per-strength comparison; always positive; never a score, rank, or weakness. |
| 5 | **Result copy is parent-facing; certificate is kid-facing** | The parent is the lead and reads the result for every band; the certificate is the child's keepsake. |
| 6 | **Reveal mechanic for the 5 memory items** (timed show-then-hide, with a manual reduced-motion fallback) | Memory can't be tested on a static screen; this is the UX implication, flagged for Code. |
| 7 | **Provisional MK written by Claude for all 36 items + templates** | Lets the engine be built and tested now; final MK is the native reviewer's. |
| 8 | **Dropped a letter-sequence item in favour of a language-neutral arrow-rotation** (Band C) | A Latin-letter sequence wouldn't mirror cleanly into Cyrillic; rotation is unambiguous in both. |
| 9 | **Six-colour binding suggested, not fixed** (indigo→pattern, blue→logic, rose→memory, teal→spatial, amber→numeracy, green→words_obs) | Code/Design may reassign; one strength = one colour is the only hard rule. |
| 10 | **Cube-net item (C-Q10) flagged with an easy substitution** | It's the heaviest graphic; can swap for another spatial/pattern item if asset time is tight. |

---

## 3. Open items / hand-offs

1. **Native-Macedonian reviewer** to finalise all MK copy (currently provisional).
2. **Simple original graphics** to be produced for the visual items (buildable as SVG/Lucide in the test-engine phase); Bibi art remains optional decoration via existing licensed assets only.
3. **Code (1.07)** to transcribe the banks, implement scoring + the reveal mechanic, and wire the six strengths to the 1.03 colours.
4. **`{center}` selection mechanism** (nearest IqUp centre for the trial CTA) to be finalised in the results/trial-booking work.
