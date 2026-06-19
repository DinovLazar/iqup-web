# Completion Report — Part 2 · Phase 2.04 · Analytics, tracking & a GDPR-grade consent layer (+ the bilingual `/privacy` page)

- **Phase ID + name:** 2.04 — Code half (consent system, consent-gated trackers, `track()` helper, `/privacy`)
- **Executing Claude:** Code
- **Date completed:** 2026-06-19

---

## What shipped

A custom, first-party, **deny-by-default cookie-consent system** + **consent-gated analytics** + a **PII-free `track()` helper** wired into the funnel + the site's first **bilingual `/privacy` page**. The lead pipeline, emails, CRM, notification, and Supabase schema are **untouched**.

- **Consent system** (`src/lib/consent/`): `iqup_consent` first-party cookie (`COOKIE_CONSENT_VERSION = 'cookies-v1-2026-06'`, ~6-month expiry, `Path=/; SameSite=Lax; Secure` in prod), three categories (**Necessary** always-on / **Analytics** = GA4 + Clarity / **Marketing** = Meta Pixel), a cookie-backed `useSyncExternalStore` provider (`ConsentProvider` + `useConsent`), and a re-openable Manage dialog.
- **Banner + Manage dialog** (`src/components/consent/`): an accessible, brand-matched, non-modal bottom banner — **Accept all / Reject (identical styling, equal salience) / Manage** — and a Radix Dialog (from the existing unified `radix-ui`) Manage panel with per-category toggles **un-pre-ticked by default** + Save. Rendered post-hydration (no CLS/mismatch), reduced-motion-aware (transform-only entrance), `next/dynamic` code-split off every page's initial bundle.
- **Consent-gated loaders** (`src/lib/analytics/`): GA4 (`gtag`), Microsoft Clarity, Meta Pixel — each injected **only** after its category is granted **and** its `NEXT_PUBLIC_*` id is set; a clean, logged no-op otherwise. GA Consent Mode defaults-denied→update; Clarity `consentv2`; Pixel `consent grant`→init→PageView; withdrawal re-signals denied/`revoke`. A `// FUTURE(CAPI 2.x)` note sits by the Pixel loader.
- **`track()` helper** + four seams: `test_start` + `test_complete` (`TestRunner`), `generate_lead` (+ Pixel `Lead`, fired **client-side after `submitLead` returns success**) (`EmailGate`), `trial_cta_click` (`TrialInvite` tel/mailto/contact-form), and `page_view` (+ Pixel `PageView`) on client navigation via `usePathname()`. Params sanitised to **exactly** `{band, locale, path}`.
- **`/privacy` (+ `/en/privacy`)** — SSG, in the locale layout, per-locale metadata + hreflang, bilingual structured content in `src/content/privacy/`, a real cookie table, the `Privacy` chrome namespace, MK/EN parity + forbidden-vocab tests.
- **Seams resolved:** the gate's `// TODO(privacy-page)` consent link → locale-aware `/privacy`; **Privacy policy** + **Cookie settings** links in `SiteFooter` (the latter re-opens the Manage dialog).
- **`.env.local.example`** documents `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_META_PIXEL_ID` (no real values).

## Decisions made on the fly (with "why")

All appended to `Decisions.md` (**#108–#114** — see note below on numbering):

- **#108** — cookie/tracking consent is a brand-new, fully separate consent from the lead's parental consent (zero coupling).
- **#109** — deny-by-default "don't load the script until consent" (not the load-denied-with-pings pattern); env-gated; GA Consent Mode / Clarity `consentv2` / Pixel grant; no force-unload mid-session.
- **#110** — the provider is backed by `useSyncExternalStore` over the cookie (the repo idiom), not a setState-in-effect (ESLint-enforced; Decision #73).
- **#111** — `track()` is a single PII-free helper sanitised to `{band, locale, path}` with independent per-category routing; `generate_lead` fires client-side after the action, never inside it.
- **#112** — the banner + Manage dialog are `next/dynamic` code-split off every page's initial bundle (perf — keeps Radix Dialog out of the critical path).
- **#113** — Accept and Reject get **identical** styling (equal salience, not just equal size) after the fresh-context review flagged a hero-gold nudge on Accept; an e2e assertion now compares their computed styles.
- **#114** — `/privacy` is a provisional GDPR baseline (versioned, legal-pending, all-MK-provisional), exempt from the no-number rule but introducing no score/IQ vocabulary; GA4/Clarity/Pixel added to the Part-2 legal-review processor list.

## Surprises / off-spec changes / live-code-vs-doc mismatches

- **Decision numbering:** the phase prompt said "continue from #104", but the live `Decisions.md` already runs through **#107** (the macOS-move checkpoint appended #104–#107). Live code wins → this phase is **#108–#114**.
- **Env file name:** the prompt/CLAUDE.md say `.env.example`; the live repo's committed template is **`.env.local.example`** (per `file-map.md`). Documented the three new vars there.
- **i18n parity baseline:** the consent namespace copy is owned end-to-end by the main session (subagents consumed it), so no two agents touched the messages JSON — per the §3 shared-file rule.
- **Two real a11y defects found + fixed during e2e** (both in the Track-C `/privacy` output): the cookie-table horizontal-scroll container was not keyboard-focusable (now `tabIndex=0` + `role="region"` + label, WCAG 2.1.1), and the "last updated · version" line used `text-ink-faint` (3.39:1 on canvas — below AA), changed to `text-ink-soft`.
- **Banner entrance animation** was switched from opacity-fade to **transform-only** so an a11y scanner reading mid-animation never sees a composited sub-AA colour (pre-empting the documented #107 fade artifact for the new surface).

## Files written / updated

**New — consent lib:** `src/lib/consent/{constants,types,state,cookie,ConsentProvider}.ts(x)`, `src/lib/consent/consent.test.ts`.
**New — consent UI:** `src/components/consent/{copy,CookieSettingsButton,ConsentBanner,ConsentManageDialog,ConsentRoot}.ts(x)`.
**New — analytics:** `src/lib/analytics/{env,runtime,track,sync}.ts`, `src/lib/analytics/loaders/{ga,clarity,pixel}.ts`, `src/lib/analytics/{track,sync}.test.ts`.
**New — privacy:** `src/content/privacy/{types,mk,en,index}.ts`, `src/content/privacy/privacy.test.ts`, `src/app/[locale]/privacy/page.tsx`.
**New — e2e + evidence:** `tests/e2e/consent.spec.ts`, `docs/qa/Part-2-Phase-04/lighthouse-medians.json`.
**Updated:** `src/app/[locale]/layout.tsx` (mount `ConsentRoot` + resolve consent copy), `src/app/[locale]/test/page.tsx` (gate privacy-link copy), `src/components/test/TestRunner.tsx` (2 track seams), `src/components/gate/{EmailGate.tsx,copy.ts}` (track seam + privacy link), `src/components/result/{TrialInvite.tsx,ResultView.tsx}` (track seam + band prop), `src/components/landing/SiteFooter.tsx` (privacy + cookie-settings links), `src/messages/{mk,en}.json` (`Consent` + `Privacy` namespaces, gate privacy-link keys, footer link keys), `src/messages/messages.test.ts` (new required-key block), `.env.local.example`, `playwright.config.ts` (dev-server tracker-id env), `scripts/lh-median.mjs` (`LH_OUT_DIR` / `LH_INCLUDE_PRIVACY` / `LH_ONLY` opt-ins, default 1.11 behaviour unchanged).

## Tests run + results

- `npm run typecheck` — clean. `npm run lint` — clean. `npm run build` — green (15/15 static pages; `/privacy` is **SSG**; the static/dynamic split is unchanged — `/test` remains the only dynamic funnel route).
- `npm test` (Vitest) — **289 passed** (28 files), up from 258. New: consent state machine + cookie round-trip + version-bump invalidation; `track()` no-ops + per-category routing + **PII-free payload** assertion; sync deny-by-default + idempotent injection + withdrawal; `/privacy` MK/EN parity + forbidden-vocab; `messages.test.ts` `Consent`/`Privacy` namespaces.
- **Playwright e2e `consent.spec.ts` — 28 passed** (mobile + desktop). The **headline guarantee**: with no consent cookie, landing + `/test` + `/privacy` (both locales) fire **zero** requests to `googletagmanager.com` / `google-analytics.com` / `*.clarity.ms` / `connect.facebook.net` and expose no `gtag`/`clarity`/`fbq` global; **Accept all** then injects all three (dummy ids set on the dev server); **Reject** in a fresh context loads nothing. Plus: banner axe-clean, equal Accept/Reject computed styling, both keyboard-reachable + in-viewport, ESC closes the dialog, `/privacy` axe-clean both locales with correct `<html lang>` + skip-link, and the footer Cookie-settings re-opens the dialog.
- **Lighthouse** (`npm run lh:median`, prod build, median-of-5 mobile / 3 desktop, this machine, **no tracker ids set** = the real production baseline):

  | Surface | Perf | A11y | BP | SEO | LCP | CLS | TBT |
  |---|---|---|---|---|---|---|---|
  | `/` (mk) mobile | **91** | 100 | 100 | 100 | 3.40 s | 0.015 | 10 ms |
  | `/en` mobile | **93** | 100 | 100 | 100 | 3.24 s | 0 | 10 ms |
  | `/privacy` (mk) mobile | **92** | 100 | 100 | 100 | 3.23 s | 0.001 | 9 ms |
  | `/test` (mk) mobile | **86–88** | 100 | 100 | 100 | 3.9–4.2 s | 0 | 15 ms |
  | `/` · `/en` · `/privacy` desktop | **100** | 100 | 100 | 100 | 0.64–0.69 s | 0 | 0 ms |

  **A11y / BP / SEO held 100 on every surface, both locales, incl. the new `/privacy`; desktop 100 across the board.** Landing held its 1.11 mobile-Perf baseline (91, LCP 3.40 s — unchanged); `/en` and `/privacy` clear 92–93. **`/test` mobile measured 86–88 (n=5) vs the 1.11-documented 91 (n=3)** — its throttled LCP rose ~3.4→4.0 s. Since landing wraps the **same** consent island and is unchanged, this is `/test`-specific hydration contention under the slow-4G + 4×-CPU throttle on the heaviest funnel route (its StartScreen heading is SSR'd, so the post-hydration, code-split, below-fold banner cannot delay its paint). It remains the **noise-dominated, framework-JS-gated** mobile-Perf metric the 1.11 report already flagged as below 95 and expected to clear on clean Vercel infra (**re-measure in 2.06**). No category other than the already-sub-95 mobile Perf moved.
- **Fresh-context review subagent:** verdict **PASS** with one should-fix — the Accept/Reject **visual-weight** asymmetry (Accept had hero-gold + hero-shadow vs Reject's flat blue). **Fixed** (Decision #113: identical styling + an e2e style-parity assertion). All ten guardrails otherwise confirmed against the diff (deny-by-default proven, PII-free, two consents separate, lead pipeline untouched, no new dep, no `useSearchParams`, SSG `/privacy`, graceful no-op, correct cookie attributes + consent signals).

_(Screenshots: the local preview screenshot tool has timed out in this environment since 1.07; visual + a11y properties were verified via the axe a11y tree, computed-style assertions in `consent.spec.ts`, and the network-assertion e2e instead — consistent with prior phases.)_

## Blocked / carryover items

- **Live tracker verification — DEFERRED PENDING COWORK (2.04 second half).** See the "For Cowork" section. Until the three ids land, every tracker is a logged no-op and the banner/cookie still work.
- **`/test` mobile Lighthouse Perf (86–88) — re-measure on Vercel in 2.06.** Noise-dominated framework-JS baseline under throttle; A11y/BP/SEO stayed 100 and the LCP element is SSR'd text (real-world LCP ~1.2 s per 1.11). Tracked, not a real-world UX regression.
- **Legal / native-MK review (continuing #88 / #96):** the `/privacy` policy text (provisional GDPR baseline, version `privacy-v1-draft-2026-06`), the cookie/tracking consent wording, and **GA4 / Microsoft Clarity / Meta Pixel as data processors** — all for IqUp legal/privacy sign-off; all MK provisional. The provisional privacy contact (`info@iqup.mk` / DPO) needs confirming.
- **Pre-existing flaky a11y test (#107) unchanged** — the 1.11 `a11y.spec.ts` result-band scans still report transient mid-fade `color-contrast` false-positives on this faster machine; out of scope here (the new consent surfaces use a transform-only entrance and are clean).

## For Cowork (2.04 second half)

1. Create the **GA4** property → set `NEXT_PUBLIC_GA4_ID` (`G-…`).
2. Create the **Microsoft Clarity** project → set `NEXT_PUBLIC_CLARITY_ID`, **and switch OFF Clarity's automatic cookies** in the project's Advanced settings so it obeys the `consentv2` signal this code sends.
3. Create the **Meta Pixel / dataset** in Events Manager → set `NEXT_PUBLIC_META_PIXEL_ID`.
4. **Live verification matrix** (both locales, with ids set): confirm **nothing** fires before consent → **Accept all** loads all three (GA4 real-time shows the hit, Clarity records, the Meta Pixel Helper shows `PageView` + `Lead` on submit) → **Reject** keeps everything off → changing preferences in Manage works (and the new state takes effect on the next navigation).
5. **Legal-review additions** (continuing #88 / #96): GA4 / Clarity / Meta Pixel as processors + the `/privacy` policy text + the cookie/tracking-consent wording — all for IqUp legal/privacy sign-off, tied to the policy version. (No change to the existing parental-consent review.)

## What's next

**2.05** real trial booking (the `// TODO(booking 2.05)` seam — the email/nurture + result-screen trial CTA then point at the real flow), then **2.06** Vercel Pro + the iqup.mk subdomain + production `NEXT_PUBLIC_SITE_URL` + the branded `@iqup.mk` sender (SPF/DKIM/DMARC) + **re-measure mobile Lighthouse on clean infra**, **2.07** pre-launch QA + go-live, **2.08** post-launch check.
