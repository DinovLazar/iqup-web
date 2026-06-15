# Completion Report — Part 1 · Phase 1.11 · Parity + Accessibility + Performance finalisation

- **Phase ID + name:** Part 1 · Phase 1.11 — Parity + Accessibility + Performance finalisation
- **Executing Claude:** Code
- **Date completed:** 2026-06-15
- **Result:** **Part 1 is complete.** The funnel had its first whole-site, tool-driven quality pass.

---

## 1. What shipped

The site was built screen-by-screen across 1.06–1.10; this phase gave the whole thing a single quality
pass and closed the Part-1 carryover. Nothing in the user-facing funnel changed in behaviour except the
language switch (now keeps `?age`) and a proper branded/accessible 404.

### Tooling added (dev-only, pinned exact, NOT in the app bundle)
- **`@lhci/cli` 0.15.1** — median-of-5 Lighthouse vs the production build (`lhci:mobile` / `lhci:desktop`).
- **`@playwright/test` 1.61.0** (Chromium only) + **`@axe-core/playwright` 4.11.3** — axe scans across every
  route × state × locale, reliable headless screenshots, and the device matrix.
- **`scripts/lh-median.mjs`** (`lh:median`) — a Windows-tolerant local median runner (see §2/§4).
- Four version-controlled, scoped auditor subagent definitions in `.claude/agents/` (perf/a11y/parity/device-qa)
  for repeatable re-runs.
- Config + scripts: `lighthouserc.{mobile,desktop}.cjs`, `playwright.config.ts`, `tests/e2e/*`,
  `docs/qa/Part-1-Phase-11/` evidence dir, new `package.json` scripts, `.gitignore` entries.

### Final Lighthouse medians (production build, this machine)

| Surface | Perf | A11y | BP | SEO | LCP | CLS | TBT | runs |
|---|---|---|---|---|---|---|---|---|
| Landing `/` (MK) **mobile** | **92** | **100** | **100** | **100** | 3.35 s | 0.015 | 75 ms | 5 |
| Landing `/en` (EN) **mobile** | **92** | **100** | **100** | **100** | 3.32 s | 0 | 57 ms | 5 |
| `/test` (MK) **mobile** | **91** | **100** | **100** | **100** | 3.41 s | 0 | 104 ms | 3 |
| Landing `/` (MK) **desktop** | **100** | **100** | **100** | **100** | 0.71 s | 0 | 0 ms | 3 |
| Landing `/en` (EN) **desktop** | **100** | **100** | **100** | **100** | 0.72 s | 0 | 1 ms | 3 |

Raw data: `docs/qa/Part-1-Phase-11/lighthouse-medians.json`. (Fixed mobile preset: simulated slow-4G +
4× CPU, `Accept-Language: mk`.)

### Accessibility (WCAG 2.2 AA)
- **Automated:** `@axe-core/playwright` on mobile + desktop across landing · test (start / first question /
  age-picker fallback) · email gate (empty + invalid) · result (all 3 bands) · not-found — both locales —
  **zero serious/critical** (`docs/qa/Part-1-Phase-11/axe-summary.{mobile,desktop}.json`). axe's WCAG 2.2
  rules (incl. `target-size`, `aria-progressbar-name`) ran and pass.
- **Two real defects found + fixed:** (1) the test progressbar had no accessible name → `aria-labelledby`
  to the visible "Question X of Y" line (`ProgressHeader.tsx`); (2) the new 404's "404" failed contrast
  (hero yellow on cream) → brand blue `text-secondary`.
- **Manual + the WCAG 2.2 delta — verified and recorded:**
  - **2.4.11 Focus Not Obscured (AA):** added `scroll-padding-top: 5rem` on `html` so a tab-focused control
    is never hidden behind the 64px sticky `SiteHeader`. (The test `ProgressHeader` is **not** sticky.)
  - **2.5.7 Dragging (AA):** no essential drag anywhere — age picker = Radix radiogroup, option tiles =
    Radix RadioGroup.Item, city picker = native `<select>`. All tap/click/keyboard.
  - **2.5.8 Target Size 24×24 (AA):** axe `target-size` passed; primary targets are ≥44px; the one inline
    text link (contact-form link) takes the inline exception.
  - **3.2.6 Consistent Help (A):** the footer (one shared component) appears in the same relative order on
    every page; the trial centre contacts are result-page-specific help.
  - **3.3.7 Redundant Entry (A):** the language switch now preserves `?age` (fix below); the gate never
    re-asks carried info.
  - **3.3.8 Accessible Authentication (AA):** no login, no cognitive puzzle, no CAPTCHA; the honeypot stays
    `aria-hidden` / `tabIndex -1` / off-screen.
  - **Carry-overs:** a working **skip-to-content** link is now on **every** page incl. the 404; one `h1`
    + sane heading order per page; AA contrast verified numerically by axe; `prefers-reduced-motion`
    honoured site-wide; per-locale `<html lang>` correct (incl. the localized 404).
- **Method note:** axe + screenshots ran against the **dev server** (DOM/ARIA-equivalent to prod, and it
  lets the gate be reached via `?dev=1` with no Supabase write); Lighthouse ran against the **production
  build**. The Next dev overlay is excluded from axe and removed before screenshots; the dev-only `DevBar`
  + gate dev panel are tagged `data-dev-only` and excluded, so the scans reflect production.

### Parity + the language-switch fix
- **`LanguageToggle` now preserves the full path AND query string** — switching MK↔EN mid-test keeps the
  child's `?age` instead of bouncing to the age picker. Implemented with `useSyncExternalStore`
  (`window.location.search`), **not** `useSearchParams()` (which would deopt the static landing/result
  pages into client rendering) — keeps every page static, no hydration mismatch, no setState-in-effect.
  Asserted by `tests/e2e/parity.spec.ts` (MK→EN, EN→MK, and the landing case).
- **Key parity** stays green (`messages.test.ts`, 98/98) with the new `NotFound` namespace in both locales.
- **hreflang / canonical** present + consistent on every indexable page (landing, `/test`, `/result`,
  layout default).
- **Content equivalence:** structural parity confirmed (every UI string both sides; the 36 questions +
  options, result/certificate copy, and centre labels line up 1:1). No MK copy was rewritten (out of scope).

### Cross-device
- **No horizontal overflow** at 360 / 390 / 414 / 768 / 1024 / 1280 px across landing, `/test`, `/result`
  (both locales).
- **Certificate on mobile:** renders 1080×1350; **Download** produces a `.png`; **Share** (no Web Share API
  in headless Chromium) falls back to copy-link with a status message — the child's name never leaves the
  browser.
- **Screenshot evidence:** `docs/qa/Part-1-Phase-11/{mobile,desktop}/` — landing (mk/en), test start, gate,
  result ×3 bands, not-found.
- **CLS ~0** confirmed on the key pages (Lighthouse medians; no font change was made).

### Repo hygiene (Workstream E)
- Deleted the two **non-canonical** duplicate copies of the 1.04 content spec — `Part-1-Phase-04-Content-Spec.md`
  (repo root) and `docs/Part-1-Phase-04-Content-Spec.md`; kept the canonical `docs/content/...`. No code
  referenced them; the only references are inside **filed historical completion reports (04/07/10), left
  unedited** (rewriting filed history would be dishonest). `file-map.md` updated.
- Corrected `.mcp.json`'s Supabase `project_ref` → the canonical EU leads project `cpxssfodboukznzaksnb`,
  and **committed it** — `.mcp.json` is actually **tracked** in the repo (the phase prompt called it
  "untracked"; live code wins), so committing is the only way the repo stops carrying the wrong ref. It is
  a local Supabase-MCP convenience, unused by the build. (Surfaced in §4.)

---

## 2. The performance verdict (honesty clause, §4)

**Desktop hits the 95+ bar on all four categories, both locales (100/100/100/100).**
**Mobile A11y/BP/SEO = 100, both locales. Mobile Performance = 91–92 — below 95.**

- **Median-of-5** (landing) gives **92** (mk) / **92** (en), up from the documented ~87 single-run baseline
  — the improvement is mostly a defensible measurement (median-of-5, machine isolated) of an already
  well-optimised landing, plus the `/result` JS trim below.
- **The gated metric is LCP ≈ 3.3 s** under the simulated slow-4G + 4× CPU throttle. The trace shows the
  **LCP element is the hero explainer paragraph (body text)**, which paints **immediately in the
  `display:swap` metric-matched fallback** — so it is not actually web-font-blocked (this refines the
  1.06 assumption that the h1/web-font was the LCP). Field-style reality: observed LCP ~1.2 s, **CLS ~0
  (0–0.015)**, **TBT 57–104 ms** (a healthy INP proxy).
- **Named remaining bottleneck:** the framework-JS execution baseline (React 19 + Next 16 + next-intl +
  LazyMotion-gated Framer Motion + Radix) under the 4× CPU throttle on a modest machine. This is inherent
  to the locked stack; there is no honest landing-side lever left.
- **Genuine optimisation applied, no score-gaming:** confirmed fonts are already optimal for a body-text
  LCP (Rubik preloaded, Nunito Sans `preload:false`, both `swap` + size-adjust → CLS ~0); **`html-to-image`
  made a dynamic `import()`** so it leaves the initial `/result` client bundle; confirmed LazyMotion intact
  and **zero third-party** requests. The brand font and the accessible entrance animation were **not**
  stripped to chase the number.
- **Expectation on clean infra:** the single-digit gap is expected to clear 95 on Vercel (higher CPU
  benchmark + real network). **Re-measure there in 2.06.** Not deployed this phase (in scope = local
  production-build measurement).

---

## 3. Decisions made on the fly (with "why") + off-spec changes

Full detail in `Decisions.md` #69–#81. Summary of the notable ones:

- **#70 — audits run in the main session (perf isolated, then the Playwright suite), not as four parallel
  server-driving subagents.** On one Windows machine, four concurrent `next start` + Chromium instances
  collide on port 3000 and pollute the noise-sensitive Lighthouse median. The four `.claude/agents/*.md`
  definitions are committed for repeatable re-runs — satisfying the "repeatable, scoped" intent without the
  contention. *(This is the main deviation from §2's "run A–D in parallel"; surfaced explicitly.)*
- **#71 — Lighthouse measured with `scripts/lh-median.mjs`; the LHCI configs are kept for clean infra.** On
  this machine every Lighthouse child dies on a temp-dir `EPERM` (chrome-launcher cleanup) *after* the
  audit, which makes LHCI discard the otherwise-valid run. The script reads each report regardless. *(See
  §4.)*
- **#72 — Lighthouse pins `Accept-Language: mk`** so `/` resolves to the MK landing instead of next-intl
  redirecting Lighthouse's English UA to `/en` (which fails the run).
- **#73 — the toggle reads the query via `useSyncExternalStore`, not `useSearchParams()`** — to avoid
  deopting static pages + avoid a hydration mismatch + avoid a setState-in-effect lint error.
- **#77 — 404 rebuilt as three files** (localized `[locale]/not-found.tsx` + catch-all `[...rest]` +
  global `not-found.tsx`) after the first attempt (global-only) caused a hydration mismatch on
  locale-prefixed unknown URLs. Added a `NotFound` i18n namespace.
- **#78 — dev-only chrome tagged `data-dev-only` and excluded from axe** (the 8 "gate contrast" hits were
  dev-only UI, not the real gate).
- **#80 — Workstream E** deletions + `.mcp.json` correction; filed historical reports left unedited.

No brand tokens, palette, typefaces, copy semantics, or Part-2 seams were changed. No new dependency ships
in the app bundle.

---

## 4. Surprises / anything that disagreed with the docs (live code wins)

- **The mobile LCP element is the hero explainer paragraph (body text), not the brand `h1` web-font.** The
  1.06–1.08 reports attributed the mobile-perf gap to a "web-font-gated LCP" on the Rubik heading. The
  actual Lighthouse trace (`largest-contentful-paint-element`) names the explainer `<p>` (Nunito Sans body),
  which paints in the swap fallback immediately. The real gate is framework-JS under the CPU throttle, not
  the font. Documented honestly in §2 — no font change would have helped.
- **`html-to-image` was statically imported** in `CertificateCard.tsx` (it shipped in the initial `/result`
  bundle), contradicting §4's assumption that it was already dynamic. Fixed (dynamic `import()`).
- **`/` locale-redirects under an English UA.** next-intl locale detection redirects `/` → `/en` for an
  English `Accept-Language`. Expected behaviour (not a bug), but it failed Lighthouse runs on `/` until the
  config pinned `Accept-Language: mk`. Worth knowing for any future external measurement.
- **A custom global `not-found.tsx` with its own `<html>` hydration-mismatches** for locale-prefixed unknown
  routes in this next-intl + Next 16 setup. The fix is the localized 404 + a `[...rest]` catch-all (the
  next-intl-correct structure).
- **Windows + LHCI/Lighthouse:** the chrome-launcher temp-dir cleanup throws `EPERM` here, breaking LHCI's
  run accounting. Worked around with the direct-Lighthouse median runner; the data itself is sound.
- **`.mcp.json` is tracked, not untracked.** The phase prompt described it as "untracked"; `git ls-files`
  shows it tracked. Live code wins, so the corrected `project_ref` is committed (not left as a local-only
  edit), so the repo no longer carries the wrong Supabase project.

---

## 5. Blocked / carryover into Part 2 (still-open pre-launch items)

None of these are Code tasks for this phase; restated so they aren't lost:
- **Native-Macedonian copy review + IqUp sign-off** of ALL draft copy (landing, test, gate, result/
  certificate, the new 404 strings, and the consent/marketing wording tied to `CONSENT_VERSION`).
- **`centers.ts` verification** — IqUp must confirm the 10 centres' phones/addresses before launch (powers
  the trial CTA; flagged PROVISIONAL).
- **Licensed assets** — Bibi art (`BIBI_CERT_ART` + `HeroArt`), official logo (`Wordmark`), official OG art,
  real favicon. Never generated/redrawn.
- **Real brand palette/type** — the 1.03 provisional tokens re-skin by editing `globals.css` + the two
  `next/font` calls.
- **`NEXT_PUBLIC_SITE_URL`** — set the production domain in 2.06 (absolute canonical/OG URLs) and
  **re-measure mobile Lighthouse on Vercel** (expected to clear 95).
- **Supabase** — transfer to an IqUp-controlled account + legacy→publishable/secret key migration (Part-2
  hardening).
- **Phase 1.09 written completion report** — still missing; could not be located (Lazar/Chat item; **not
  fabricated**, per the 1.10 precedent).

---

## 6. Tests run + results

- `npm run build` (Turbopack) — clean; 13 static pages + the new dynamic `[locale]/[...rest]` catch-all.
- `npm run typecheck` (`tsc --noEmit`) — clean (incl. the e2e specs).
- `npm run lint` (eslint) — clean.
- `npm test` (Vitest) — **98/98** passing (parity test green with the new `NotFound` namespace).
- Playwright e2e — **45/45** passing (axe zero serious/critical, parity, overflow, certificate mobile).
- Lighthouse `lh:median` — medians in §1; raw JSON committed.
- **Fresh-context review subagent (whole diff, no prior context): zero blockers, zero should-fix.** One nit
  (the toggle is JS-only / `pushState`-blind — a deliberate, documented trade-off for this funnel, fine to
  ship; Decisions #73). Guardrails re-verified clean by the reviewer: no score/IQ/rank introduced, fonts
  unchanged, no Bibi generation, no brand-token change, no new PII, Part-2 seams intact.

---

## 7. Definition of Done — checklist

- [x] LHCI configured (median-of-5, fixed mobile throttling) with npm scripts; run against the production
      build. (Plus `lh:median` as the Windows-tolerant runner — see §4.)
- [x] Lighthouse 95+ **desktop, both locales**; **mobile A11y/BP/SEO 100, both locales**; **mobile Perf
      91–92** with the honest §2 write-up (median + lab LCP/CLS/TBT + field values + named bottleneck +
      clean-infra expectation).
- [x] `@axe-core/playwright` zero serious/critical across every route × state × locale.
- [x] Manual keyboard + SR pass + the **WCAG 2.2 delta** (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) verified
      and recorded; skip-link on every page incl. the 404.
- [x] Language toggle preserves full path + query everywhere; `/test` `?age` drop fixed + asserted; key
      parity test green; hreflang/canonical correct on every indexable page.
- [x] Cross-device matrix walked both locales; certificate download/share verified on mobile; screenshots
      captured + referenced.
- [x] Workstream E done (duplicates removed; `.mcp.json` corrected); `file-map.md` updated.
- [x] Guardrails re-verified; `typecheck` + `lint` + `build` + full `test` clean.
- [x] Fresh-context review: **zero blockers**; should-fixes resolved (none raised).
- [x] No silent changes: every on-the-fly decision is in `Decisions.md` (#69–#81) and summarised above.

---

## 8. What's next

**Part 1 is complete → start Part 2 with 2.01 (results email).** The OG image + certificate share are
already name-free, so 2.01 can email the strengths summary without new PII. Then 2.02 CRM/notify · 2.03
follow-ups · 2.04 analytics + Pixel + consent + cookie banner + `/privacy` page · 2.05 the real trial
booking (`// TODO(booking 2.05)` seam) · 2.06 Vercel Pro + domain + DNS + `NEXT_PUBLIC_SITE_URL`
(re-measure mobile Lighthouse on clean infra there).
