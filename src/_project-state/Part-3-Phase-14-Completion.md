# Completion Report — Part 3 · Phase 3.14 · Supporting pages + the honest-framing notice

**Phase:** 3.14 (Code) · **Branch:** `phase-3.14-supporting-pages` (off `main`, pushed, **not merged**)
**Date:** 2026-06-25 · **Status:** ✅ complete, awaiting operator's "yes" to merge

---

## What shipped

1. **One shared honest-framing notice.** A new `Disclaimer` i18n namespace (`notice` · `provisional` · `ariaLabel`) — the single source — rendered by ONE presentational, props-driven component **`HonestNote`** (`src/components/common/HonestNote.tsx`, `plain` | `inset` variants, muted `text-ink-soft` AA text). Textually consistent with the frozen `report.disclaimer.body` but surface-agnostic ("IqUp is informative and indicative … not a clinical assessment, an IQ score, or a diagnosis"). It is the one documented place clinical/IQ/diagnosis words may appear — only to negate them.

2. **The `/about-test` page** (MK `/about-test`, EN `/en/about-test`) — public, **SSG, indexable**, in the locale layout (skip-link + global header/footer, per-locale `<html lang>`), per-locale `generateMetadata` with **canonical + hreflang + alternates**. Montserrat headings + the official palette. Content-as-data (`src/content/about/{mk,en}.ts`) + the `About` chrome namespace. Covers **what-it-is** (the five areas, shown as a picture, never a number/ranking) · **what-it-isn't** (leans on the shared notice) · **credibility** (original tasks within recognised families, honest provisional norms, the STEM/coding bridge) · **what-the-parent-receives** (on-screen profile · emailed keepsake report · shareable certificate · free demo invite) + a free-test/demo CTA. No Bibi. No number/%/score/rank in the content or chrome. MK slug `// TODO(mk-slug)`.

3. **`/privacy` brought to the v2 data model** (additive content edit of `src/content/privacy/{mk,en}.ts`). Four new sections — **two unlinkable stores** · **emailed-not-stored PDF** (via Brevo) · **the three parental consents vs. cookie consent** · **the internal back-office access surface** — plus rewritten *what-we-collect* / *children's-data* (incl. the **on-device-only certificate child name**) / *retention* / *processors* lines. The cookie table + the 3.12 Meta CAPI disclosure are preserved verbatim; MK↔EN structural parity is held; version → `privacy-v2-draft-2026-06` (display-only). Still a provisional GDPR baseline.

4. **The notice placed on every required chrome surface** (see the list below), the footer **About the test** link, the new i18n namespaces (MK + EN exact parity, MK provisional), tests, and axe scans.

---

## Task 0 — repo sync + dependency gate (findings)

- `git fetch` + `git status`: local was **clean and up to date with `origin/main`** (no uncommitted work, not ahead, not diverged). Branch `phase-3.14-supporting-pages` created off `main`.
- **Merge state of `main`** (`git log --oneline -20`): **3.09, 3.10, 3.11, 3.12, 3.13 are ALL merged** (`fbfda84`, `a6725d1`, `e207157`, `a880663`, `104188f`). The brief *expected* 3.11 + 3.13 to be unmerged; they are not. Consequences handled (see "Surprises"): the certificate-panel disclaimer spot was **wired** (not deferred), and the privacy `internal-access` paragraph describes the **live** admin (not anticipatory).
- **Prerequisites confirmed present** (nothing re-implemented): the `/privacy` page + `src/content/privacy/{mk,en}.ts` + the `Privacy` namespace; `report.disclaimer` rendering on `ResultsScreen` (line 319) and the PDF (`ReportDocument.tsx` lines 390–391); the `SiteFooter` legal-links pattern; the `/trial` public-page pattern.
- **Decisions numbering:** started at **#229** exactly as instructed (highest reserved was #228 from 3.13).

---

## The final honest-framing-spots list (the "seven required spots" reconciled)

The in-repo spec source used is `plan.md` §5/§6.7 (the canonical PDF was not opened; the working set in the brief matches the live route list). Coverage on this branch base:

| # | Spot | Status this phase |
|---|---|---|
| 1 | **Landing** (`Hero.tsx`) | ✅ shared `HonestNote` footnote added near the hero CTA (reconciled with the existing 1.06 explainer — now also carries the shared source). |
| 2 | **Assessment setup / age screen** (`AgeSetup.tsx`) | ✅ shared `HonestNote` added (parent-facing line; `notice` threaded via `AssessmentCopy.setup`). |
| 3 | **On-screen results** (`ResultsScreen.tsx`, 3.09) | ✅ **verified present, unchanged** — renders `report.disclaimer` (frozen). |
| 4 | **Emailed PDF** (`src/lib/pdf/ReportDocument.tsx`, 3.10) | ✅ **verified present, unchanged** — renders `disclaimer.body`/`disclaimer.provisional` (frozen). |
| 5 | **Certificate panel chrome** (`CertificatePanel.tsx`, 3.11) | ✅ **wired** (3.11 is merged) — a brief shared `HonestNote` line in the panel chrome; the rasterised `CertificateArt` artboard is untouched. **No deferred spot.** |
| 6 | **About page** (Task 2) | ✅ the fullest treatment (`inset` variant, notice + provisional). |
| 7 | **Privacy page** (Task 3) | ✅ shared `HonestNote` restatement after the draft note. |

**No discrepancy** between the working set and the live routes; **no spot deferred** (because 3.11 is merged, spot #5 shipped rather than being held behind a `// TODO(disclaimer 3.14)`).

---

## Decisions made on the fly (with "why") — Decisions.md #229–#237

- **#229** — the shared notice is a `Disclaimer` namespace + ONE props-driven `HonestNote` (no `useTranslations` in client islands — matches the repo's zero-client-i18n-runtime convention).
- **#230** — the notice is textually consistent with `report.disclaimer` but surface-agnostic; a dedicated permissive scan requires the negation and forbids digit/%.
- **#231** — the certificate-panel spot WAS wired (3.11 merged); the panel *chrome* changed, the artboard did not — Task-4 #5's explicit conditional governs over the brief's general "no certificate changes" guard.
- **#232** — `/about-test` uses Montserrat headings (the v2 brand) while `/privacy`+`/trial` keep their 2.04 Rubik (content-only edit there).
- **#233** — the About "what it isn't" section leans on the shared notice; the About content authors no clinical/IQ/diagnosis words (so it passes the strict scan).
- **#234** — the `/privacy` version bumped `v1-draft → v2-draft` + `lastUpdated 2026-06-25` (display-only; decoupled from the stored parental-consent version).
- **#235** — the privacy v2 narrative is additive: 4 new sections + rewritten lines; cookie table + 3.12 CAPI disclosure preserved; MK↔EN parity held.
- **#236** — the `internal-access` privacy paragraph is current (3.13 merged), not anticipatory.
- **#237** — "notice present on each surface" is proven by a hybrid test (real render for the leaf islands + a source-level structural assertion for the async pages, mirroring 3.13's import-edge precedent).

---

## Surprises / off-spec changes

- **3.11 + 3.13 are already merged on `main`** (the brief expected them unmerged). This is the only material deviation from the brief's framing. It made the phase *simpler*, not harder: the certificate-panel disclaimer spot shipped instead of being deferred, and the privacy `internal-access` text is factual rather than forward-looking. No re-implementation, no conflict.
- **The brief's "out of scope: no certificate changes" vs. Task-4 #5's conditional.** Resolved in favour of the specific instruction (wire the panel chrome when 3.11 is on the branch base) — the rasterised artboard (`CertificateArt.tsx`) and all certificate *render/determinism* logic stayed frozen; only the panel chrome (`CertificatePanel.tsx`) gained one presentational line. Flagged here so it isn't a silent ratification.

---

## Files written / updated

**New:**
- `src/components/common/HonestNote.tsx` + `src/components/common/honest-notice.test.tsx`
- `src/content/about/{types,en,mk,index}.ts` + `src/content/about/about.test.ts`
- `src/components/about/AboutArticle.tsx`
- `src/app/[locale]/about-test/page.tsx`
- `src/_project-state/Part-3-Phase-14-Completion.md` (this file)

**Modified (additive):**
- `src/messages/{en,mk}.json` (new `Disclaimer` + `About` namespaces + `Landing.footer.about`)
- `src/messages/messages.test.ts` (parity + the two new forbidden scans)
- `src/content/privacy/{en,mk}.ts` (v2 data-model expansion)
- `src/components/landing/Hero.tsx`, `src/components/landing/SiteFooter.tsx`
- `src/components/assessment/screens/AgeSetup.tsx`, `src/components/assessment/copy.ts`, `src/app/[locale]/test/page.tsx`
- `src/components/report/CertificatePanel.tsx`, `src/components/report/certificate-copy.ts`, `src/components/report/certificate.test.tsx`, `src/app/[locale]/report/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `tests/e2e/a11y.spec.ts` (`/about-test` scan + `/privacy` re-scan)
- `Decisions.md`, `src/_project-state/{current-state,file-map,00_stack-and-config}.md`

---

## Tests run + results (verbatim)

```
npm run typecheck   → tsc --noEmit (clean, exit 0)
npm run lint        → eslint (clean, exit 0)
npm run build       → next build green; route table:
                      ● /[locale]/about-test  (/mk/about-test, /en/about-test)  ← new, SSG, indexable
                      ● /[locale]/privacy, ● /[locale]/report (SSG, noindex), ● /[locale]/trial
                      ƒ /[locale]/test (dynamic), ƒ /admin/** (unchanged)
npm test (vitest)   → Test Files 77 passed (77) · Tests 797 passed (797)
                      = 775 prior + 22 new
                        · messages.test.ts: +3 (Disclaimer+About parity, permissive Disclaimer scan, strict About-chrome scan)
                        · about.test.ts: +8 (accessor, parity ×4, forbidden-vocab ×3)
                        · honest-notice.test.tsx: +11 (HonestNote render ×2, per-surface render ×6, wiring ×3)
@axe-core/playwright → 8/8 passed: about-test + privacy, mk + en, mobile + desktop (axe-clean, settle-wait used)
```

**Browser smoke** (dev server, real runtime): `/about-test` EN + MK and `/privacy` EN + MK — H1 in Montserrat (`font-family: Montserrat`, weight 800), the shared notice renders (incl. clean MK Cyrillic, no tofu), the privacy page shows `privacy-v2-draft-2026-06` + all 14 sections, mobile 375px `scrollWidth == clientWidth` (no overflow), the About CTA is 48px tall (≥44px), **zero console errors** on every page. The landing-hero footnote and the age-setup notice were also confirmed live.

---

## Additive-only evidence

- `git diff main --stat`: 25 files, +1172 / −46 — only the new About page/content/notice, the additive privacy edit, the surface placements, the footer/i18n/test wiring, and project-state/docs.
- **Frozen-layer grep returns nothing** (engine / scoring / validity / tasks / norms / report-engine / PDF / email-send / `submit-assessment` / meta / scores / admin / `CertificateArt` / both write paths). `CertificateArt.tsx` is **not** in the diff; `report.disclaimer` wording is **not** changed; `ResultsScreen.tsx` + `ReportDocument.tsx` are **not** modified.
- **No new dependency** (`package.json` unchanged), **no env var**, **no schema/store/write-path change**.

---

## Blocked / carryover items

- **Live legal sign-off** of the v2 privacy narrative — pending IqUp's lawyer (this is a provisional baseline, by design).
- **Native-MK review** of all new MK copy.
- **State-file reconcile when future phases merge** — N/A this time: 3.11 + 3.13 are already merged, so the state files reflect the real `main`. (No deferred reconcile.)

---

## Flags (for Lazar / IqUp / Cowork — surface, don't decide)

- **IqUp legal:** the **whole v2 `/privacy` narrative** is a provisional draft — it needs legal review before launch. Particularly: the two-stores/unlinkability framing, the emailed-not-stored claim (Brevo retention applies), the three-consents wording, the internal-access paragraph, and the retention periods.
- **IqUp:** confirm the **controller/DPO contact** — the page still uses the provisional `info@iqup.mk` with a `// TODO(IqUp: confirm privacy contact email / DPO)` marker.
- **Native-MK reviewer:** **all** new MK copy is provisional — the `About` content + chrome, the shared `Disclaimer` notice, and the 4 new privacy sections.
- **Lazar / Cowork:** the `/about-test` **MK route slug** is provisional (`// TODO(mk-slug)`), mirroring `/privacy` + `/trial`.
- **Merge state:** 3.09–3.13 are **all merged**; this phase wired the certificate-panel disclaimer spot accordingly (no deferred spots). The `internal-access` privacy paragraph is factual now (the admin is live on `main`).

---

## What's next

Operator decision to merge `phase-3.14-supporting-pages` → `main`. After that, the remaining open Part-3 items are the deferred live-config verifications (Supabase/Brevo/GA4/Meta keys), lead durability (`// TODO(durability 3.16)`), and any launch-hardening (Vercel Pro, domain). This phase adds no new runtime surface to verify with keys — it ships content + a presentational notice only.
