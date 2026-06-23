# Part 3 · Phase 3.09 — Completion report

**Phase:** Code — the on-screen results screen (Surface A).
**Branch:** `phase-3.09-results-screen` (off `main`).
**Date:** 2026-06-23.
**Outcome:** Complete. The `/report` flow now reveals the real v2 results screen (MK + EN). Build / lint / typecheck clean; **623/623** tests pass; browser-verified end-to-end in both locales; axe-clean both locales.

---

## What shipped

The `// HANDOFF (3.09)` interstitial in `ReportFlow` is replaced by the real **Surface A** results reveal, rendered from `buildReport(profile, context)` — the profile recomputed client-side from the persisted run, `context = {locale, city, generatedAt}` drawn from `iqup.leadContext.v2` (gender omitted). No psychometric is recomputed; the screen consumes `ReportContent`.

**New components (`src/components/report/`):**
- **`ResultsScreen.tsx`** — pure/presentational Surface A: header (title + age/date meta over a band wave) · identity pentagon + caption · five colour-coded index cards · top strength · "what we noticed" · report-emailed strip · violet demo CTA · certificate entry · disclaimer. Props `{report, copy, locale, bookingUrl}`; no storage/hooks/`Date` → renders under Vitest's Node env. Deterministic `formatGeneratedDate` (static month tables; no `Date`/`Intl`).
- **`IdentityPentagon.tsx`** — faithful React/SVG port of the kit's `identityPentagon()` (viewBox 410×360, cx 205, cy 176, R 110, angles −90/−18/54/126/198; five kites + white seams + ink outline; `dim` lowers wedge opacity). The **same shape & size for every child** (identity, not magnitude); `var(--ix-*)` fills; filter-free for 3.10's PDF.
- **`index-meta.ts`** — `INDEX_META`/`INDEX_ORDER` keyed by the real `IndexId` → angle, hue slug, short label (MK/EN), card glyph.
- **`results-copy.ts`** — the `ResultsCopy` chrome contract.

**Wiring:**
- `ReportFlow.tsx` — reveals results on `submittedCtx ?? persistedLead` (refresh-safe via `useSyncExternalStore` on `iqup.leadContext.v2`), calls `buildReport` + `bookingUrlFor`, leaves `// SEAM (3.10)/(3.11)/(3.12)`. Form + `submitAssessment` data logic unchanged except the reveal.
- `report/page.tsx` — resolves the `Results` namespace server-side, mounts `ReportFlow` with `results`; container widened `max-w-2xl` → `max-w-[1080px]` (form self-centres, unaffected).
- `src/lib/email/site-url.ts` — **`bookingUrlFor(locale, cityKey)`**: `NEXT_PUBLIC_BOOKING_URL` else localized `/trial`, always `?grad=<centre-id>` (stable slug). Never a dead link.

**Tokens / i18n:** the 3.02 v2 semantic layer + `.iq-results` CSS added to `globals.css` (additive; `--ix-*`→`var(--iq-*)`). New `Results` chrome namespace (MK + EN, exact parity, MK provisional).

**Tests (+27 → 623):** `results-screen.test.tsx` (rendered-screen forbidden-token + stray-digit scan, both locales × 3 validity states; validity rendering; CTA `?grad=`; pentagon byte-identity), `site-url.test.ts` (`bookingUrlFor`), `messages.test.ts` (Results parity + forbidden + no-digit).

---

## Task 0 — sync + dependency gate

Sync clean (on `main`, up to date with `origin/main`). The 3.08 deliverables were **not** in the repo (they had been produced in a Cowork session and never committed). The operator supplied them; they were **landed on `main` in a dedicated commit** (`docs/design-handovers/Part-3-Phase-08-Handover.md` + `surfaces/` + `report-kit.js` + `tokens-v2.css` + mockups + 3.08 completion) so the gate passed and the 3.09 branch diff stays additive (decision #185). Gate then green: 3.06 (`/report` + `ReportFlow` + seam), 3.07 (`buildReport` + `ReportContent`), 3.08 (handover) all present.

---

## Definition of Done

- [x] Task 0 passed (sync clean; 3.06/3.07/3.08 present — 3.08 landed on `main` first).
- [x] The `// HANDOFF (3.09)` interstitial is replaced by the real results screen (MK + EN); v1 `/result` untouched.
- [x] Renders from `buildReport(profile, {locale, city, generatedAt})` (client-recomputed profile; gender omitted); no psychometric recompute.
- [x] All Surface-A sections present per the handover; none of the off-screen (PDF-only) sections added.
- [x] The pentagon is the magnitude-free identity pentagon (same shape for all), not the 3.02 radar.
- [x] The three validity states render from `meta.validity` (valid / gentle_note quieter note / not_representative bespoke + dimmed pentagon), consistent with 3.05 (retry → `/test`, never a contradictory second retry).
- [x] `bookingUrlFor(locale, cityKey)` → `NEXT_PUBLIC_BOOKING_URL` else `/trial`, always `?grad=<slug>`; never a dead link; env var documented.
- [x] `// SEAM (3.10)` (no email sent; emailed strip presentational), `// SEAM (3.11)` (entry affordance only; no Bibi/route), no tracking (3.12).
- [x] No number/%/score/IQ/rank/level-N/gauge/bar, MK + EN — proven by the extended, non-vacuous rendered-screen forbidden-token test.
- [x] No child name anywhere; no Bibi on the screen; disclaimer present.
- [x] `Results` chrome namespace, MK + EN exact parity (parity test green), MK provisional; report content not duplicated in messages.
- [x] WCAG 2.2 AA: **axe-clean both locales** (16 passes, 0 violations) after fixing one real contrast issue; colour-not-alone (name + word); ≥44px (CTA 56px); visible focus; reduced-motion inherited; no timers.
- [x] Refresh-after-submit re-reveals results (no forced re-submit); direct access guarded → `/test`.
- [x] Frozen engine/scoring/validity/tasks/norms/report-engine + 3.06 form/two-store/`submitAssessment` data logic untouched (`git diff main --stat` = additive results-screen work + env doc + i18n + two config edits).
- [x] `typecheck` / `lint` / `build` clean; `npm test` 623/623 (596 prior + 27 new); browser-verified MK + EN.
- [x] Fresh-context review run; the two a11y nits it raised were taken.
- [x] Independent calls logged (#185–#193); `current-state.md` + `file-map.md` + `00_stack-and-config.md` updated; branch pushed; **asking Lazar before merging to `main`.**

---

## Verification

- **Static:** `npm run typecheck`, `npm run lint`, `npm run build` all clean (21 routes; `/report` unchanged in the table). `npm test` → **623/623** (59 files). `git diff main --stat` confirms only additive results-screen work + `.env.local.example` + i18n + `eslint.config.mjs`/`vitest.config.ts`.
- **Browser (dev, both locales):** autopilot → completion → form → submit → results. Verified: all five index cards (band WORDS, 3-pip confidence cue), top strength, what-we-noticed, the report-emailed strip, the demo CTA carrying `?grad=aerodrom` (MK → `/trial`, EN → `/en/trial`), the certificate entry, the disclaimer, the identity pentagon (`role="img"`). Refresh re-revealed results (no form). Mobile 375px: no horizontal overflow; CTA 56px. No console errors. **axe (WCAG 2.x/2.2 AA): 0 violations** in both MK and EN.
- **Contrast fix:** axe flagged the confidence label + disclaimer at `--ink-faint` (#8a8499, 3.59:1); moved to `--ink-muted` (#5A6675) per tokens-v2's "ink-faint = large/UI/placeholder only" note. Re-ran → clean.

---

## Decisions (logged #185–#193 in `Decisions.md`)

185 land 3.08 on `main` first · 186 lift the v2 semantic token layer into `globals.css` · 187 scoped `.iq-results` CSS (not a CSS Module) for node-renderability · 188 wordmark/lang stay in the global `SiteHeader` · 189 card drops the non-existent per-index "desc" (uses `confidenceNote`) · 190 `not_representative` is defensive (unreachable via the funnel) + dimmed pentagon + `/test` retry · 191 `bookingUrlFor` falls back to `/trial` (not `/booking`) · 192 AA contrast `--ink-faint`→`--ink-muted` · 193 `eslint` ignore `docs/**` + `vitest` tsx include + `/report` container width.

---

## Flagged / carryover

- **MK copy** in the `Results` namespace is provisional — native-MK review (consistent with prior phases).
- **`NEXT_PUBLIC_BOOKING_URL`** is unset → the CTA uses the `/trial` fallback until IqUp's real booking flow lands.
- **Seams left for later phases:** 3.10 (PDF report + email send — the emailed strip is presentational now), 3.11 (the Bibi certificate — only the entry affordance ships), 3.12 (CAPI/GA4 — no tracking added).
- **Out of scope, untouched:** v1 `/result` + components + email gate; the frozen engine/scoring/validity/item-bank/norms/report-engine; the 3.06 form data logic + two-store writes.

---

## Outputs

- Code: `src/components/report/{ResultsScreen,IdentityPentagon,index-meta,results-copy}.tsx|ts` + `ReportFlow.tsx`/`index.ts` wiring; `src/app/[locale]/report/page.tsx`; `src/lib/email/site-url.ts` (`bookingUrlFor`); `src/app/globals.css` (tokens + scoped styles); `src/messages/{mk,en}.json` (`Results`).
- Tests: `src/components/report/results-screen.test.tsx`, `src/lib/email/site-url.test.ts`, `src/messages/messages.test.ts` (extended).
- Docs/config: `.env.local.example`, `eslint.config.mjs`, `vitest.config.ts`; `Decisions.md` (#185–#193); `current-state.md`, `file-map.md`, `00_stack-and-config.md`; this report; `Part-3-Phase-09-Audit.md` (the read-only audit note).
