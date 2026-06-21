# Completion Report — Part 3 · Phase 01 · Repo onto v2 footing

- **Phase ID + name:** Part 3 · Phase 01 — Repo onto v2 footing (docs + tokens + deps + scaffold)
- **Executing Claude:** Code
- **Date completed:** 2026-06-21
- **Branch:** `phase-3.01-v2-footing` (off `main`)

> Foundation phase only — **no feature logic**. The clean slate the rest of Part 3 sits on. Additive and non-breaking: the v1 app, tokens, and tests are untouched and still green.

---

## What shipped

**1. v2 canonical docs landed.**
- **`plan.md`** rewritten as the **v2 master spec** — the adaptive cognitive + STEM assessment (5–13): 8 internal signals → 5 parent-facing indices, the adaptive basal/ceiling engine, deterministic/no-AI, scoring & norming, validity/timing, the report engine, screen + PDF output, profile→program mapping, parent tone, the two-store data model, admin, legal (the 7 placements), localization, the design system, tech/security, acceptance + phases, what IqUp provides, and the appendix index. **Derived faithfully from the canonical `IQ UP Specifikacija v1.2` PDF** (see decision #127) and names that PDF as the authoritative source.
- **`brand.md` §6** updated **DRAFT → CONFIRMED**: the official palette (`#EC008C` magenta … `#999999` grey, mapped to the 5 indices + violet primary action), **Montserrat** (weights 800/700/600/400–500), the **puzzle-brain** signature motif, the design-token scales (spacing/radius/tap), the certificate-only Bibi rule, and WCAG AA notes. The TL;DR + caveat lines that flagged visual identity as DRAFT were updated.

**2. `CLAUDE.md` + `AGENTS.md` updated to v2** — product/architecture specifics (the adaptive 8→5 model, deterministic no-AI, the hard no-number positioning rule, the two deliverables, the two-unlinkable-stores model, Bibi-on-certificate-only, `@react-pdf/renderer` + custom-SVG pentagon + server-side Meta CAPI + Montserrat/official-palette, the v2 folder map). **Every process rule kept** (phase workflow, the update-state ritual, the quality bar, security, "what not to do").

**3. Brand token primitives wired (additive, non-breaking).**
- **Montserrat** loaded via `next/font/google` in `src/app/[locale]/layout.tsx` (variable, Cyrillic+Latin, `--font-montserrat`).
- **`globals.css`**: the official palette (`--iq-*` + `--index-*`), `--font-brand` → Montserrat, radius (`rounded-card` 14px / `rounded-card-lg` 18px / `rounded-badge` 30px), spacing (`--space-1..8` = 4–32px), and the **≥44px tap target** (`--tap-min` / `--spacing-tap`). Exposed as Tailwind utilities via `@theme inline`. **Every v1 token left intact** — the v1 UI renders unchanged. The "two-mood"/semantic layer was deliberately **not** built (that's Design phase 3.02).

**4. `@react-pdf/renderer@4.5.1` added + smoke-tested** against the live React 19.2.4 stack — a throwaway script rendered a one-page PDF (valid `%PDF` buffer), then was deleted. **Kept.** **No charting library** added (pentagon = custom SVG, decision #124).

**5. v2 folder skeleton scaffolded** (READMEs only): `src/lib/{engine,validity,report,pdf}` + `src/content/{tasks,norms,report}`. `src/lib/scoring/` already existed — left untouched. Existing pages/components untouched.

**6. Project state refreshed** — `Decisions.md` (#124–#129), `00_stack-and-config.md`, `current-state.md`, `file-map.md`; the stray v1 `Part-2-Phase-06-Cowork-HANDOFF.md` deleted (superseded).

## Decisions made on the fly (with "why")
> Also appended to `Decisions.md` (#124–#129).
- **#127 — Authored `plan.md` + `brand.md` §6 from the canonical spec PDF.** The brief said "Lazar supplies the two files," but no ready-made v2 markdown existed anywhere on disk. I located the canonical source (`~/Documents/IQ UP Specifikacija v1.2 FINAL.pdf`, MK, 37pp), extracted its text, and derived both docs from it verbatim — **no invented spec**. *Flagged here for Lazar: if a different/newer v2 doc is the intended source, point me at it and I'll reconcile.*
- **#128 — `phase-plan.md` left as v1 (pending).** No v2 phase-plan file was provided; the brief said to note it pending rather than invent the v2 phase sequence.
- **#129 — ran `npm audit fix` + deleted the stray handoff doc.** react-pdf pulled a transitive `hono` **high** advisory in code paths we never invoke; the non-breaking fix cleared it. The 2 remaining production advisories (`postcss`/`next`) are pre-existing and only fixable by a breaking Next downgrade — left as-is.
- **#124 / #125 / #126** — the three pre-locked decisions (custom-SVG pentagon / `@react-pdf/renderer` / Montserrat via `next/font`) recorded as instructed; #125 includes the passing React-19 smoke-test result.

## Surprises / off-spec changes
- **The attached `@plan.md` / `@brand.md` were the current v1 files**, not v2 rewrites — so Task 1 became "author from the canonical spec PDF" (decision #127), confirmed with Lazar before proceeding.
- **The spec lists 4 languages (MK · SR · HR · EN)**; the repo shell is MK/EN today. v1 plan said MK/EN. `plan.md` now reflects the spec: **MK ships first (MVP); SR/HR/EN in phase 2.** No i18n change made this phase.
- **CSS build gotcha (found + fixed in-phase):** a comment containing the literal `*/` token (`--strength-*/--chart-*`) prematurely closed the CSS comment and failed the Turbopack build; reworded, build green.
- **The assessment age is 5–13** (the spec), vs. the v1 test's 3–13 and IqUp's 3–9 in-person program. `plan.md`/`AGENTS.md`/`CLAUDE.md` now say 5–13 for the assessment; `brand.md` keeps 3–13 for the *program* (correct — different things).

## Files written / updated
- **Docs:** `plan.md` (rewritten v2), `brand.md` (§6 + intro + caveat), `CLAUDE.md`, `AGENTS.md`.
- **Code:** `src/app/[locale]/layout.tsx` (Montserrat), `src/app/globals.css` (v2 token block + `@theme` exposures).
- **Deps:** `package.json` + `package-lock.json` (`@react-pdf/renderer@4.5.1`; `npm audit fix`).
- **Scaffold (new):** `src/lib/engine/README.md`, `src/lib/validity/README.md`, `src/lib/report/README.md`, `src/lib/pdf/README.md`, `src/content/tasks/README.md`, `src/content/norms/README.md`, `src/content/report/README.md`.
- **Project state:** `Decisions.md`, `src/_project-state/00_stack-and-config.md`, `current-state.md`, `file-map.md`, **this report**.
- **Deleted:** `src/_project-state/Part-2-Phase-06-Cowork-HANDOFF.md` (untracked v1 handoff, superseded).
- **Created + deleted within the phase:** `scripts/_pdf-smoke.mjs` (throwaway PDF smoke test).

## Tests run + results
- `npm run typecheck` (`tsc --noEmit`) — **clean.**
- `npm run lint` (eslint) — **clean.**
- `npm test` (vitest) — **292 passed / 292 (28 files)** — unchanged from 2.05 (no test touched).
- `npm run build` (`next build`, Turbopack) — **green**; route table identical to 2.05 (no route added/changed).
- `@react-pdf/renderer` render check on React 19.2.4 — **valid `%PDF`** (before and after `npm audit fix`).

## Blocked / carryover items
- **`phase-plan.md` is still v1 — pending the v2 phase plan.** Chat writes the v2 phase sequence now that this footing has landed (decision #128).
- **Confirm the canonical v2 source** with Lazar: I used `~/Documents/IQ UP Specifikacija v1.2 FINAL.pdf`. If that's not the intended source, I'll reconcile `plan.md`/`brand.md`.
- **`META_CAPI_ACCESS_TOKEN`** (server-side Meta CAPI) is documented as net-new but **not yet wired** — added to `.env.local.example` + Vercel when CAPI is implemented. `NEXT_PUBLIC_META_PIXEL_ID` becomes server-scoped at that point.
- **2 pre-existing production npm advisories** (`postcss`/`next`) remain — only fixable by a breaking Next downgrade; not touched.
- **Pushed to the remote; do NOT merge to `main` without Lazar's go-ahead** (per the brief).

## What's next
- Chat writes the **v2 phase plan** into `phase-plan.md`.
- Likely first build phases per the spec: the **task bank + procedural generators** (Дел 4 / Прилог A), the **adaptive engine** (Дел 5), **scoring + seed norms** (Дел 6 / Прилог B), then the **report engine** (Дел 9) and the **PDF** (Дел 10). The Design phase (3.02) produces the semantic/"two-mood" token layer + screen direction on top of the primitives landed here.
