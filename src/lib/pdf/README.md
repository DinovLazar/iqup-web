# `src/lib/pdf/` — server-side PDF report

Generates the branded **PDF cognitive profile** server-side, deterministically
from the scores, and hands it to the email send (spec Дел 10). The PDF is
**emailed, not stored** (the two-store privacy model — Дел 14).

**Library: `@react-pdf/renderer`** (Phase 3.01 decision — React-based,
Vercel-friendly, supports custom fonts + embedded SVG). The five-index
**pentagon** is rendered as a **custom SVG** (no charting library) so it is
byte-identical on screen and in the PDF.

Contents per spec 10.3: pentagon + 5 index bands (no number), per-index
confidence label, strength + growth area + activities, the STEM-readiness section,
IQ UP! positioning, the demo CTA (with `?grad=` city), and the disclaimer.

Scaffolded in Phase 3.01 — implementation lands in a later v2 phase.
