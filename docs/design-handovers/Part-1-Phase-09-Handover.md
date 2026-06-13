# Part 1 · Phase 1.09 — Design Handover: Results + Certificate

> **Filing note (added by Phase 1.10, Code).** Phase 1.09's design was delivered
> as **three live HTML mockups**, not as a written prose handover. The mockups
> are the authoritative visual spec. This file is an **honest index + faithful
> transcription** of what those mockups contain — it does **not** invent or
> reconstruct any design decision. Where a detail matters, read it from the
> mockup source directly.
>
> A separate written **completion report** for Phase 1.09
> (`src/_project-state/Part-1-Phase-09-Completion.md`) was **not** in the drop and
> could not be located anywhere under the project folder — flagged for Lazar.

## Authoritative sources (filed in `./Part-1-Phase-09-assets/`)

| File | What it is |
|---|---|
| `Phase-09-Mockups.html` | The index: device frames for the results screen (mobile + desktop), the certificate showcase (two children), and the "what Code builds / reused / guardrails" panel (its section D). |
| `Result.html` | The **live `/result` reference implementation** — full layout, all MK+EN copy, the tier logic, the band handoff variants. Open with `?band=3-5\|6-9\|10-13&cele=1\|2\|3&lang=mk\|en`. |
| `Certificate.html` | The **live certificate reference** — 1080×1350 artboard, per-child tint rule, Bibi placeholder, all copy. Open with `?lang=mk\|en&name=…&top=code,code,code` (add `?embed=1` to skip the fit-to-viewport scaler). |
| `tokens.css` | Companion stylesheet (reconstructed by 1.10 — see its header) so the mockups render for review. Mirrors the live 1.03 tokens in `src/app/globals.css`. |

> The mockups embed their design rationale as **inline comments** (e.g. the
> "two moods in one scroll" note atop `Result.html`, the render-constraint and
> drop-in-box notes in `Certificate.html`). Treat those comments as part of the
> spec.

## Key specs (transcribed from the mockups — see source for the exact rules)

**Results screen (`Result.html`)**
- *"Two moods, one scroll":* a **playful zone** (child) — reveal hero with the
  child's first name, a **strengths constellation**, and the certificate preview
  + actions — flows into a **calm zone** (parent) — the band handoff.
- *Constellation* = three warm, non-evaluative tiers, **no charts/bars/numbers**:
  **celebrated** (1–3, large badges), **also strong** (medium chips), **growing**
  (small encouraging chips, framed as potential). Tiers are derived purely from
  the existing ranked `TestResult` — `total/hits/ratio` only ever *order* them.
- *Band handoff:* bands **3–5 / 6–9** get a **trial invite** (warm copy + nearest-
  center card + CTA); band **10–13** gets a distinct **"curious mind" ending**
  (no trial, a fully-resolved close).
- Reuses `SiteHeader`, `SiteFooter`, `LanguageToggle`, `Button`, `Card`, the
  strength glyphs, and `Reveal`/`MotionProvider`. Staggered entrance defaults to
  the end-state (capture/print/reduced-motion safe).

**Certificate (`Certificate.html`)**
- **Portrait 4:5, 1080 × 1350** (Instagram/Facebook feed size); 96px internal safe
  margin. Built under an explicit *render constraint*: every element is text, a
  simple vector, a solid/gradient fill, or the bundled placeholder SVG — so 1.10
  reproduces it faithfully as a flat raster.
- **Celebrated strengths only** (1–3 chips, each in its own strength colour).
- **Per-child tint (deterministic):** frame gradient blends **top1 → top2** tints;
  the name flourish uses **top1** solid; a single celebrated strength falls back
  to `top1-tint → lighter mix`. **Background stays a constant warm cream**
  (`#FFFBF2`, never tinted) so AA + brand consistency hold for any colour combo.
- **Bibi = licensed art only.** A 336×336 dashed **drop-in box** holds an abstract,
  licensing-safe placeholder; the real asset replaces only that element with no
  layout change. Never generated or redrawn.

**Hard guardrails (from `Phase-09-Mockups.html` §D — verified):**
- No score, IQ, %, points, bars, gauges, or 1st/2nd/3rd medals anywhere.
- "Growing" always reads as potential, never weakness.
- WCAG 2.2 AA: strength colours hit contrast on their tints; focus-visible
  everywhere; certificate alt text; reduced-motion safe.

## Copy source

The **substantive result/certificate copy** (strength blurbs, headline, also-
strong / growing lines, trial CTA, closing, certificate body) is owned by
**`docs/content/Part-1-Phase-04-Content-Spec.md` §6** and lives in code under
`src/content/results/`. The mockups' tier labels, button labels, and chrome copy
live in the `Result` i18n namespace. All MK is provisional pending native review.
