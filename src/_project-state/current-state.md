# IqUp-Web — Current State

> Live snapshot of the repo. **Code updates this at the end of every phase.** If this and the live code ever disagree, the live code wins.

**Last updated:** 2026-06-22 — **Phase 3.03 (Code): the v2 adaptive engine + scoring + validity (the deterministic logic layer).** Pure logic, **no UI / no item content / no persistence / no copy** — and **additive: all v1 scoring/engine/results code is untouched and every existing test still passes.** Built faithfully from the canonical `IQ UP Specifikacija v1.2 FINAL.pdf` (Дел 3/4/5/6/7/8 + Прилог A/B). **Seeded PRNG** (`src/lib/engine/prng.ts`) — **mulberry32** + xmur3 string hash + per-domain `deriveSeed` (independent streams) + `nextInt`/`pick`/`shuffle`; **no `Math.random()` anywhere on the path**; the same utility 3.04's generators will import. **Input seam** (`engine/types.ts`) — `Item`/`ItemProvider`/`Response`(+`ItemScoringMeta`) for 3.04. **Adaptive engine** (`engine/engine.ts`) — basal/ceiling per domain: start level by **exact age** (the spec's Gf curve 5→1…13→8, applied to all domains, PROVISIONAL for non-Gf), correct→up / error→down, **discontinue at 2 consecutive errors** or the per-domain cap (Gf/Gv 6, others 5, **+1 for the 10–13 extended battery**), **age-cluster format** (Gsm forward-only <8, forward+backward ≥8); exposed as a step-by-step `createDomainController` (for 3.05's live UI) **and** pure `runDomain`/`runSession` drivers (tests); emits a `SessionRun`. **Fixture providers + responders** (`engine/fixtures.ts`, shipped for 3.04 reuse). **v2 scoring** (`src/lib/scoring/v2/` — kept under `v2/` so **v1 stays separate & green**): `buildProfile(SessionRun)` → the **`CognitiveProfile`** output seam — per-domain raw → **per-exact-age 0–100** indices (Прилог B.2, clamp [8,99], 50=typical) → the **8 signals** (Gf, Gv, Gsm, Gs, **derived attention**, EF, Glr, CT; timing **calibration-relative** via a passed-in device baseline) → the **5 composite indices** (exact spec weights: Logical=Gf · Spatial=Gv · Memory&focus=0.7·Gsm+0.3·attention · Planning&speed=0.6·EF+0.4·Gs · Learning&STEM=0.5·CT+0.5·Glr) → **bands** (stable enum ≥80/64–79/45–63/<45, **no display words**) → **confidence** (high/med/low; index = weakest contributing signal) → **derived structural features** (profile shape, index pairs, solving style, memory asymmetry, learning slope, ceiling/floor) + the **validity outcome** + session/version metadata. **Validity** (`src/lib/validity/`, pure functions) — the 5 flags (too-fast / same-position / idle / chance-level / Gs-smearing), the **derived attention** signal (`1 − normVariability − impulsiveRate`, calibration-relative), and the **graduated-outcome policy** (mild → `gentle_note`; strong → `not_representative`/retry); **telemetry capture + retry UI explicitly left to 3.05**. **Seed norms** (`src/content/norms/index.ts`, **PROVISIONAL**, `NORMS_VERSION='seed-2026-06-PROVISIONAL'`) — start levels, span norms (B.1, range-midpoints), B.2 coefficients, band cutoffs, caps+ceiling, and the threshold sets the spec leaves as *method only* (confidence, validity, features, the per-age **speed expectation** + calibration reference) — all flagged for the recommended psychologist review. **Determinism proven:** fixed (age, seed, responses) → byte-identical path + identical `CognitiveProfile`; different seeds change the path; domain order is independent. **Hard invariants tested:** time is never a penalty off Gs; ceiling/floor stay in-range & NaN-free; the module **renders no user-facing number/%/IQ/rank string** (raw 0–100 carried internally for Store A + bands + pentagon). **Quality: typecheck + lint clean, `next build` green (route table unchanged — the engine/scoring are pure libs not yet wired to a page), `npm test` 420/420 (40 files) = 292 pre-existing + 128 new.** Fresh-context spec-invariant review: **PASS-WITH-NITS, no blockers** (two nits fixed — attention zero-baseline fallback, floor-extreme comment). Independent calls #130–#142 in `Decisions.md`; see `Part-3-Phase-03-Completion.md`. **Branch `phase-3.03-engine-scoring` pushed, NOT merged — awaiting Lazar's yes.** _Previous entry:_ **Phase 3.01 (Code): the repo onto v2 footing.** The first phase of **Part 3 (the v2 rebuild)** — a **foundation phase only, no feature logic**. The canonical docs are now v2: **`plan.md` is rewritten as the v2 master spec** — the adaptive **cognitive + STEM assessment** for ages **5–13** (**8 internal signals → 5 parent-facing indices**: Logical · Spatial · Memory & focus · Planning & speed · Learning & STEM; an **adaptive basal/ceiling engine**, **fully deterministic, no AI at runtime**; results as **bands + a pentagon + confidence labels, never a score/%/IQ/rank**; two deliverables — a **server-side PDF report** (emailed, **not stored**) + a **shareable Bibi certificate**; **two unlinkable data stores** — anonymous scores in Supabase + leads in Brevo; Meta **CAPI** server-side) — **derived faithfully from the canonical `IQ UP Specifikacija v1.2` PDF** (no ready-made v2 markdown existed; Lazar's spec is the ground truth). **`brand.md` §6 is updated DRAFT→CONFIRMED** (official palette `#EC008C`…`#999999`, **Montserrat**, the puzzle-brain motif, design-token scales). **`CLAUDE.md` + `AGENTS.md` updated to v2** (product/architecture; **all process rules kept**). The confirmed **brand primitives are wired into code, additive & non-breaking**: **Montserrat** via `next/font` (Cyrillic+Latin) + the **official palette/index hues + radius (card 14/18, badge 30) + spacing (4–32) + ≥44px tap** tokens added to `globals.css` — **every v1 token left in place** (Rubik/Nunito, the yellow `--primary`, the `--strength-`/`--chart-` sets), so the v1 UI renders **unchanged** and migrates component-by-component later. **`@react-pdf/renderer@4.5.1` added + smoke-tested on React 19** (valid PDF); **no charting library** (pentagon = custom SVG). The v2 **engine/report folder skeleton** is scaffolded (READMEs only): `src/lib/{engine,validity,report,pdf}` + `src/content/{tasks,norms,report}`. The stray v1 Vercel-deploy handoff doc was deleted. **Quality all green & unchanged: typecheck + lint clean, 292 vitest (28 files), `next build` green (route table identical).** No schema/route/i18n change. Net-new v2 env var noted (not yet wired): **`META_CAPI_ACCESS_TOKEN`**. **`phase-plan.md` is still v1 — pending the v2 phase plan** (Chat writes it). See `Part-3-Phase-01-Completion.md` (and the v1→v2 inventory in `Part-3-Phase-00-Completion.md`). _Previous entry:_ **Phase 2.05 (Code): the real trial-booking mechanic.** The trial CTA now has a working endpoint. A single shared **`TrialBooking`** client component (native city `<select>`, no geolocation → chosen centre + one-tap **Call / Email (name-free `mailto:`) / Get directions (verified-or-derived Maps search link) / optional Viber-WhatsApp**, AA-accessible, PII-free consent-gated `trial_cta_click`) is reused by **two surfaces**: a new public bilingual **`/trial` (+ `/en/trial`)** SSG page (in the locale layout, name-free, per-locale metadata + canonical/hreflang + generic name-free OG, slug `// TODO(mk-slug)`) and the **result screen** (bands 3–5 / 6–9, inline — old `// TODO(booking 2.05)` picker/seam removed; band 10–13 untouched). Every trial CTA now resolves from **one** `trialBookingUrl(locale, utmCampaign?)` helper (`site-url.ts`): the results email + the three trial nurture emails (`welcome-trial`/`trial-invite`/`nudge`) point at `/trial` (`welcome-general` keeps its general site-root link). `centers.ts` stays the single source — additive only (optional **unset** `viber?`/`whatsapp?`, derived Maps search via `mapsUrlFor`, no value changes, PROVISIONAL kept). New `Trial` i18n namespace (exact MK/EN parity, MK provisional). **Contact-only — no new PII / Supabase write / Brevo call / schema change / processor / dependency.** Deliberate test changes (flagged): `ResultsEmailProps.siteUrl` → `trialUrl` + the trial-URL assertions now target `/trial`. A latent 1.10 AA contrast defect (chosen-centre contact line, 3.39:1) was exposed by the new `/trial` selected-state axe scan and fixed (`text-ink-soft`). Quality: **292 vitest** (28 files) + build/lint/typecheck clean; `/trial` axe-clean both locales (empty + selected); fresh-context review **PASS** (no blockers). Booking link host is the dev placeholder until 2.06; centre data + Viber/WhatsApp + exact pins + MK slug pending. See `Part-2-Phase-05-Code-Completion.md`. _Previous entry:_ **Phase 2.04 (Code half): analytics, tracking & a GDPR-grade consent layer + the bilingual `/privacy` page.** The funnel is now measurable **with consent**, the honest way: a custom, first-party, **deny-by-default cookie-consent system** (accessible bottom banner — equal-weight **Accept all / Reject / Manage** — + a Radix Manage dialog with per-category toggles **un-pre-ticked by default**, backed by the first-party `iqup_consent` cookie `COOKIE_CONSENT_VERSION='cookies-v1-2026-06'`, ~6-month Lax/Secure, re-openable from the footer **and** `/privacy`), three **consent-gated trackers** (GA4 + Microsoft Clarity behind the **Analytics** category; Meta Pixel behind **Marketing**) that **load nothing and set no cookie until their category is granted** and are a clean **no-op when their `NEXT_PUBLIC_*` id is unset**, a PII-free **`track()`** helper (sanitised to `{band, locale, path}`) wired into four funnel seams (`test_start`/`test_complete`/`generate_lead`+Pixel `Lead`/`trial_cta_click`) + `page_view` on client navigation (via `usePathname()`, never `useSearchParams()`), and the site's first **`/privacy` (+ `/en/privacy`)** page (SSG, bilingual structured content + a real cookie table, a provisional GDPR baseline flagged for IqUp legal). The cookie/tracking consent is **entirely separate** from the lead's parental consent — no coupling, rename, or re-version. The **lead pipeline, emails, CRM, notification, and Supabase schema are untouched.** Quality bars: `build`/`lint`/`typecheck` clean; **289 vitest** (28 files); **28 Playwright consent e2e** (the headline network-assertion proof: zero tracker requests before consent on landing/`/test`/`/privacy` both locales, all three load on Accept, nothing on Reject); mobile Lighthouse A11y/BP/SEO **100** on every surface incl. `/privacy` (mobile Perf 91/93/92 landing/en/privacy; `/test` 86–88 — the documented noise-dominated mobile-Perf metric, re-measure on Vercel in 2.06); desktop **100** across the board; fresh-context review **PASS** (its one should-fix — Accept/Reject equal salience — fixed). Live tracker verification is **deferred-pending-Cowork** (the three account ids). Live delivery is **deferred-pending-config**. _Previous entry:_ **new-machine checkpoint** (verification + doc reconciliation only, no product code changed): the build was re-verified green on macOS after the project moved from Windows (`C:\Users\user\Desktop\iqup-web`) to macOS (`~/Projects/iqup-web`), and the project-state docs (`phase-plan.md`, this file, `file-map.md`) were reconciled to the live repo. Verbatim results: **258/258 vitest tests pass** (24 files), typecheck clean, lint clean, production `next build` green (13/13 pages); MK/EN i18n parity perfect (139 keys each). The `@axe-core/playwright` WCAG 2.2 AA suite needs Playwright's Chromium binary installed first (`npx playwright install chromium` — a one-time per-machine step); with that done, 16/26 scans pass and **10 are timing-flaky on this faster machine** — axe scans mid-`animate-in` entrance fade and reads the strength chips' settled-fine tokens composited at ~36% opacity (a transient false-positive `color-contrast`, NOT a shipped defect: a 700 ms settle-wait makes all 26 pass). Logged as a **finding** for Lazar (Decisions.md #107) with a recommended `scan()` settle-wait fix — left unfixed here because altering tests is out of scope this pass. See `Part-2-Checkpoint-Verify-Reconcile-Completion.md`. _The last feature phase remains Phase 2.03 (follow-up nurture emails — Code half)._ The lead lifecycle's final content piece now exists as version-controlled, bilingual **nurture email templates** — a warm welcome (trial + general) and two gentle trial nudges (trial band) — authored as React Email components that **reuse the 2.01 brand/layout**, personalised purely by **Brevo merge tags** (child first name with a graceful fallback; age/locale are branch conditions only — nothing new collected or stored) and rendered to **8 static HTML files** (`docs/email-templates/Part-2-Phase-03-nurture/`) the Cowork half loads into Brevo. No certificate attached; no new route/dependency/schema; **258 tests** green; route table unchanged. The app funnel is unchanged. Previously, after Phase 2.02 (CRM contact routing + new-lead notification): the instant a lead saves, the same isolated `after()` work now fans out **three** side-effects: the 2.01 results email, **a Brevo Contacts upsert** (the parent becomes a CRM contact by email, on an operational "all leads" list always + a marketing/nurture list **only on `marketing_opt_in`**), and **an internal new-lead notification** to IqUp's team — each fully isolated (any one failing/slow/unconfigured can never break the save, the redirect, or the others), and each a logged no-op until its Brevo env lands. Nothing stored changed (no schema/column, no Brevo id persisted — Supabase stays the system of record). Live delivery is **deferred-pending-config** (build/typecheck/lint/test all verified; 190 tests). _(Previously: after Phase 2.01 — the funnel reached the parent's inbox with a warm bilingual results email + attached certificate via Brevo, deferred-pending-key. After Phase 1.11 — Part 1 complete: the whole funnel land → test → gate → lead saved → strengths profile + certificate, with a WCAG 2.2 AA pass, a median-of-5 Lighthouse sweep, and a cross-device matrix.)_

---

## How to run locally

```bash
npm install
npm run dev
```

Then open:
- **http://localhost:3000/** — Macedonian (default locale, no prefix)
- **http://localhost:3000/en** — English

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

## Tech stack (current)

Installed and wired: **Next.js 16.2.7** (App Router, Turbopack) · **React 19.2.4** · **TypeScript 5.9.3** · **Tailwind CSS v4** (brand tokens from the 1.03 handover) · **shadcn/ui** (radix-nova style) · **next-intl 4.13.0** · **Framer Motion 12.40.0** (via LazyMotion) · **@fontsource/rubik 5.2.8** + **@fontsource/nunito-sans 5.2.7** (OG-image + email-certificate fonts) · **html-to-image 1.11.13** (client-side certificate → PNG, phase 1.10) · **@react-email/components 1.0.12** + **@react-email/render 2.0.8** (results email, phase 2.01) · **@supabase/supabase-js 2.107.0** · **zod 4.4.3** · **server-only 0.0.1** · dev: **Vitest 4.1.8**, **supabase CLI 2.105.0**, **tsx 4.22.4**, and (phase 1.11, QA-only, not in the app bundle) **@lhci/cli 0.15.1**, **@playwright/test 1.61.0** (Chromium only), **@axe-core/playwright 4.11.3**. Fonts: **Rubik** (display) + **Nunito Sans** (body) via `next/font/google` (Latin + Cyrillic). Exact pinned versions in `00_stack-and-config.md`.

**v2 footing additions (phase 3.01, additive):** **`@react-pdf/renderer` 4.5.1** (server-side PDF report — spec Дел 10; smoke-tested on React 19) and **Montserrat** via `next/font/google` (the v2 brand font, Cyrillic+Latin) are now installed. The **official IqUp palette + Montserrat + radius/spacing/tap tokens** live in `globals.css` (`--iq-*`, `--index-*`, `--font-brand`, `rounded-card/-lg/-badge`, `--tap-min`) **alongside** the untouched v1 tokens. **No charting library** — the pentagon is a custom SVG. The v1 UI still renders on Rubik/Nunito.

Analytics is now **wired (phase 2.04)** with **no new dependency** — GA4 (`gtag.js`), Microsoft Clarity, and Meta Pixel are injected on demand by first-party, consent-gated, env-gated loader modules (no SDK/npm package); they stay dormant until both the consent category is granted and the `NEXT_PUBLIC_*` id is set.

## Routes / pages built

- `src/app/[locale]/page.tsx` — the **real landing page** (phase 1.06): Server Component composing
  header, hero (hook + honest explainer + age picker + Start CTA), how-it-works (3 steps), trust
  cues, reassurance strip, footer. Per-locale `generateMetadata` (title/description/canonical/
  hreflang/OG/Twitter). The Start CTA links to `/test?age=N` (the test route is built in 1.07).
- `src/app/[locale]/opengraph-image.tsx` — dynamic per-locale OG image (1200×630, `next/og`,
  Cyrillic-safe Rubik). Generated for `/mk/opengraph-image` and `/en/opengraph-image`.
- `src/app/[locale]/test/page.tsx` — the **test engine** (phase 1.07): a Server Component shell that
  reads `?age=N`, resolves the band via `getBandForAge`, mounts the client runner, and (on a missing/
  invalid age) renders an inline age-picker fallback that reuses the landing's `AgeStart`. Per-locale
  `generateMetadata` (title/description/canonical/hreflang/OG). **Dynamic route** (reads searchParams).
  Now passes the exact `age` and the resolved gate copy to the runner (phase 1.08).
- `src/app/[locale]/result/page.tsx` — the **real results page** (phase 1.10): a **Static (SSG)** Server
  Component shell that resolves the `Result` chrome server-side + mounts the `ResultView` client island,
  which reads `iqup.testResult.v1` + `iqup.leadContext.v1` from sessionStorage and renders the warm
  strengths profile + the shareable certificate (no total/IQ/score/bar/rank anywhere). Still guards
  direct access (redirects home if either key is missing). Per-locale `generateMetadata` + header/footer.
- `src/app/[locale]/result/opengraph-image.tsx` — **generic, name-free** per-locale `/result` OG image
  (1200×630, `next/og`, Cyrillic Rubik) — a shared result link previews on-brand without any child PII.
- `src/app/[locale]/trial/page.tsx` — the **public trial-booking page** (phase 2.05): a **Static
  (SSG)** Server Component in the locale layout (skip-link + header/footer, per-locale `<html lang>`),
  per-locale `generateMetadata` (canonical + hreflang). **Name-free, collects nothing** — a band-agnostic
  heading + honest intro + the shared `TrialBooking` (no band). `trial/opengraph-image.tsx` = a generic
  name-free per-locale OG image (mirrors `/result`). MK `/trial`, EN `/en/trial`. Slug `// TODO(mk-slug)`.
- `src/app/[locale]/privacy/page.tsx` — the **bilingual privacy/cookie policy** (phase 2.04): a
  **Static (SSG)** Server-Component in the locale layout (skip-link + header/footer, per-locale
  `<html lang>`), per-locale `generateMetadata` (title/description/canonical/hreflang). Renders the
  structured policy + a real cookie table from `src/content/privacy/{mk,en}.ts` + the `Privacy`
  chrome namespace + the footer **Cookie settings** re-open button. MK at `/privacy`, EN at `/en/privacy`.
- Locale routing works: `/` serves MK, `/en` serves EN, and `/mk` 307-redirects to the canonical `/` (next-intl `as-needed`).
- `/_not-found` is handled by Next.js's default.

## Components built

- `src/components/landing/` — `SiteHeader`, `Hero`, `AgeStart` (client island: age radiogroup +
  gated Start link), `HowItWorks`, `TrustCues`, `Reassurance`, `SiteFooter`, `Wordmark` (logo
  stand-in), `HeroArt` (abstract decorative placeholder for licensed Bibi art), `Reveal` +
  `MotionProvider` (LazyMotion entrance animation).
- `src/components/LanguageToggle.tsx` — accessible MK/EN **pill** switcher; preserves the current
  path (sets `NEXT_LOCALE` on switch); takes its label as a prop.
- `src/components/ui/` — `button.tsx`, `card.tsx`, `radio-group.tsx`, `label.tsx`, and (1.08)
  `input.tsx` + `checkbox.tsx` (handover §B.5 primitives on the unified `radix-ui` package).
- `src/components/gate/` — `EmailGate` (the 1.08 email-gate form island) + `copy.ts` (`GateCopy`).
- `src/components/result/` — the **real results profile + certificate** (phase 1.10): `ResultView`
  (client island; replaced `ResultPlaceholder`), `ResultHero`, `StrengthsConstellation`, `ParentNote`,
  `CertificateCard` + `Certificate` (+ `certificate-model`, `StrengthGlyph`, `bibi`), `TrialInvite`,
  `CuriousMindEnding`, `copy` (chrome type). `src/lib/a11y/contrast.ts` backs the certificate AA test.
- `src/lib/bands.ts` — canonical band definitions (`3-5`/`6-9`/`10-13`), `getBandForAge`,
  `isValidAge`, `BANDS`/`AGES` (+ `bands.test.ts`, Vitest).
- `src/components/test/` — the runner island and its parts: `TestRunner` (phases start/running/**gate**
  + answers + hand-off + dev wiring; dynamic-imports `EmailGate`), `QuestionView` (one question +
  reveal mechanic), `OptionTile`, `ProgressHeader`, `StartScreen`, `DevBar`, `StrengthChip`, `copy.ts`,
  and `visuals/` (`Glyph`, `StemVisual`, `lexicon`) — original inline-SVG + Lucide puzzle graphics.
  (The temporary 1.07 `CompletionView` was removed in 1.08 — the email gate is now the post-test step.)

## Test engine (phase 1.07)

- **Content as data** (`src/content/test/`): all **36 questions** transcribed verbatim from the 1.04
  spec (`docs/content/Part-1-Phase-04-Content-Spec.md`) into `band-3-5.ts` (10), `band-6-9.ts` (12),
  `band-10-13.ts` (14), each tagged to exactly one strength; MK is verbatim, EN mirrors it. The
  schema (`types.ts`) carries a typed `GlyphSpec`/`StemSpec` visual model so stems + image options are
  data. `index.ts` exposes `getQuestionsForBand` / `ALL_QUESTIONS`.
- **Strengths taxonomy** (`src/content/strengths.ts`): the six strengths (spec §1) — code, 1.03
  colour-token binding (`words_obs`→`verbal`), bilingual display names — the single source shared by
  scoring now and the 1.10 results screen.
- **Scoring** (`src/lib/scoring/`): deterministic `score(answers, band, locale)` (spec §3) — ratio per
  strength, fixed tie-break `pattern, logic, spatial, numeracy, memory, words_obs`, tiers
  celebrated/also/growing. **No total, no IQ number** anywhere.
- **`TestResult` hand-off contract** (what 1.08 + 1.10 consume):
  `{ version: 1, band, locale, strengths: { code, total, hits, ratio, rank, tier }[6] (ranked),
  top1, top2, top3, growing[], completedAt }`. On the final answer the runner computes it, stamps
  `completedAt`, and persists it to **`sessionStorage['iqup.testResult.v1']`** (`TEST_RESULT_STORAGE_KEY`).
  No child data is ever placed in the URL (only `age`).
- **1.08 plugged in** at the `// HANDOFF (1.08)` seam: the runner now ends in a `gate` phase rendering
  `EmailGate` (which reads the in-memory + persisted `TestResult`) and submits the summary-only lead.
  **1.10 plugs in** by reading the same `TestResult` (+ the `iqup.leadContext.v1` lead-context written
  by the gate) and rendering the strengths profile + certificate from the §6 templates at the
  `// PLUGS INTO 1.10` seam in `src/components/result/ResultPlaceholder.tsx`.
- **Reveal mechanic** (spec §7) for the 5 memory items: "Ready?" → stimulus shown for `revealMs` →
  auto-hides → question; reduced-motion gets a manual Show / "I'm ready" path (no timer).
- **i18n:** a `Test` namespace in `mk.json` + `en.json` (exact key parity) holds the runner chrome;
  question/option content stays in `src/content/test/`.
- **Dev preview:** `/test?age=N&dev=1` (non-production only) shows a band-jump + auto-finish bar and a
  strengths summary on completion; forced off / stripped in production.

## Email gate + lead capture (phase 1.08)

- **The gate** (`src/components/gate/EmailGate.tsx`): a parent-mood form at the runner's `gate` phase —
  parent email, child first name (Cyrillic + Latin), **required** consent, **optional/unchecked**
  marketing, and an off-screen honeypot. `age`/`band`/`locale`/strengths-summary are carried through
  (in-memory `TestResult` + the page's `?age=N`), never re-asked, never in the URL. WCAG 2.2 AA:
  associated labels, `aria-invalid`/`aria-describedby`, focus to the first invalid field, `role="alert"`
  error banner, keyboard checkboxes, ≥44px label-row targets, AA contrast.
- **Submit** (`src/lib/leads/submit-lead.ts`, `'use server'`): honeypot check first (filled → success-
  shaped, no insert) → `buildLeadInput` → existing service-role `insertLead()`; everything re-validated
  by `leadSchema`. Pure mapping in `src/lib/leads/lead-mapping.ts` (`LEAD_BAND_BY_KEY` 3-5/6-9/10-13 →
  band-a/b/c; `toTopStrengths` = `{top1,top2,top3,scores}`, scores = per-strength ratio, number-only;
  `CONSENT_VERSION = 'v1-draft-2026-06'`).
- **Hand-off** (`src/lib/leads/lead-context.ts`): on success the gate persists `iqup.leadContext.v1`
  (`{childFirstName, age, submittedAt}` — no email/strengths) and navigates to `/result`.
- **Guardrails (verified):** no answers, no IQ/total anywhere (lead, gate, `/result`); summary-only;
  server-side write only (anon denied); consent mandatory + separate from marketing; no PII in URL.
- **i18n:** `Gate` + `Result` namespaces in `mk.json`/`en.json` (exact parity; provisional MK flagged).
  The Privacy Policy reference is plain text with a `// TODO(privacy-page)` seam (Part 2).
- **Dev:** `?dev=1` auto-finish now lands on the gate (stripped in production).

## Results profile + shareable certificate (phase 1.10)

- **`/result` is now the real payoff screen** (`ResultView` island): a "two moods, one scroll" layout
  — a **playful zone** (reveal hero with the child's first name, a positive-only **strengths
  constellation** of three non-evaluative tiers, and the certificate) flowing into a **calm zone**
  (parent §6 prose + the band handoff). It reads the SAME hand-off (`iqup.testResult.v1` +
  `iqup.leadContext.v1`), keeps the direct-access guard, and stays an **SSG shell + client island**.
- **Strengths constellation** (`StrengthsConstellation`): celebrated = top1/top2 (big badges), also =
  top3 (chip), growing = #4–#6 (encouraging chips). The ranked `TestResult` only *orders* the tiers —
  **no score, IQ, %, bar, gauge, or medal anywhere**. Accents come from `--strength-*` tokens via
  `src/content/strengths.ts`.
- **Result copy** (`src/content/results/`): the spec §6 templates as typed data — per strength ×
  tier × locale blurbs + the §6B/§6C wrapper. `getResultCopy(result, name, locale)` assembles the
  celebrated/also/growing copy. **No digits/%/score/rank words** in any user-facing string (tested).
- **The certificate** (`Certificate.tsx`, **1080×1350 portrait 4:5**): child name + celebrated
  strengths + IqUp branding + a licensing-safe **Bibi placeholder** (drop-in via `bibi.ts`
  `BIBI_CERT_ART`). **Deterministic per-child tint** (frame top1→top2 tints, flourish = top1) on a
  **constant cream** background, so AA holds for every tint (verified in `certificate-model.test.ts`).
  **Download** = client-side `html-to-image` PNG (≈1080×1350, fonts embedded after `document.fonts.ready`);
  **Share** = Web Share API file share + a copy-the-landing-URL fallback. The child's name never leaves
  the browser.
- **Trial invite** (`TrialInvite`, bands **3–5 / 6–9**): the §6 heading/intro (`{center}` slot) + the
  shared **`TrialBooking`** mechanism inline (phase 2.05 — the old `// TODO(booking 2.05)` picker/seam +
  the IqUp contact-form fallback were removed). Band **10–13** ends with `CuriousMindEnding` (no trial).
- **OG image:** `src/app/[locale]/result/opengraph-image.tsx` — generic, **name-free**, Cyrillic-safe.
- **i18n:** the `Result` namespace was rewritten for the real chrome (hero, constellation, certificate
  face, parents, trial, ending) in both locales (exact parity). **All new MK provisional.**

## Results email (phase 2.01)

- **The funnel now reaches the inbox.** After `insertLead()` succeeds, `submitLead`
  schedules `after(() => sendResultsEmail(...))` (`after` from `next/server`), so the parent's
  redirect to `/result` is never delayed and the work still completes on serverless. The honeypot
  path returns before this — **bots never send**.
- **Fully isolated.** `sendResultsEmail` (`src/lib/email/send-results-email.ts`, `server-only`) is
  internally try/caught and **never throws**; a slow/failing/unconfigured Brevo can't affect the
  lead save or the redirect. With `BREVO_API_KEY` unset it logs `skipped-no-key` and returns (the
  app runs locally before Cowork's account exists).
- **Same content as the screen, no new data.** It rebuilds the on-screen ranking from the lead's
  stored ratio summary via `reconstructResult` (`src/lib/scoring/reconstruct.ts`, reusing `score()`'s
  comparator/tiers — proven byte-identical), assembles the body from `getResultCopy` (the single
  source), and renders the **certificate PNG** (`src/lib/email/certificate-image.tsx`, Satori/`next/og`,
  1080×1350, Rubik + Nunito Sans Cyrillic, per-child tint, Bibi placeholder) **attached** to the email.
  The child's name is rendered in memory and attached — **never stored, never in a URL**.
- **The email** (`src/emails/ResultsEmail.tsx`, React Email): greeting → strengths profile → "your
  certificate is attached" → trial CTA button (bands **3–5 / 6–9** only) / curious-mind ending (band
  **10–13**) → IqUp identity + contact footer. Literal-hex brand tokens (`src/lib/email/brand.ts`),
  web-safe fonts, mobile-first. Rendered to HTML + plain text. **No score/IQ/%/rank** anywhere
  (forbidden-token test extended over the rendered email + the new strings).
- **Brevo** (`src/lib/email/brevo.ts`, `server-only`): a thin typed `fetch` client (no SDK) →
  `POST /v3/smtp/email` with the `api-key` header, the message + base64 `certificate.png` attachment,
  and `tags: ['results-email', band, locale]` for later segmentation. **No CRM/lists/automations**
  (2.02 owns lead routing); **no nurture** (2.03, marketing-opt-in-gated). One transactional send.
- **i18n:** a new **`Email` namespace** (chrome only) in `mk.json`/`en.json` (exact parity; all MK
  provisional, footer/identity flagged for IqUp legal — tied to `CONSENT_VERSION`).
- **Dev check:** `npm run test:email` drives the real orchestrator per band × locale to
  `TEST_EMAIL_TO` (refuses prod/CI). **Live delivery is deferred-pending-key** — see Open carryover.

## CRM contact routing + new-lead notification (phase 2.02)

- **The 2.01 `after()` hook is now a 3-way fan-out.** `submitLead` schedules
  `after(() => runAfterLead(...))` (`src/lib/leads/after-lead.ts`) once the lead saves; `runAfterLead`
  runs the **results email** (2.01), the **Brevo contact upsert** (2.02), and the **internal new-lead
  notification** (2.02) — each in an `isolate` try/catch inside `Promise.allSettled`, so one failing
  (even a synchronous throw), slow, or unconfigured side-effect can never affect the lead save, the
  `/result` redirect, or the others. The honeypot path returns **before** `after()`, so **bots never
  route into the CRM and never notify.** `submitLead` passes only data it already has + the saved row's
  `created_at` as the timestamp (no new data collected or stored).
- **Brevo contact upsert** (`src/lib/email/{brevo-contacts,contact-mapping,upsert-lead-contact}.ts`):
  a thin typed `fetch` client → `POST /v3/contacts` with `updateEnabled: true` (**upsert by email** —
  a re-take updates, never duplicates), mirroring the 2.01 `brevo.ts` pattern (no SDK). **Stateless:**
  the returned contact id is discarded — no schema change, no new column, no id persisted (Supabase
  stays the system of record). Eight UPPERCASE attributes (`CHILD_FIRST_NAME`, `CHILD_AGE`, `BAND` =
  digit-free human label, `LOCALE`, `MARKETING_OPT_IN`, `CONSENT_VERSION`, `TOP_STRENGTHS` = the two
  celebrated strength names in English, `SOURCE` = `website-quiz`). **Consent gate (the headline
  guardrail):** every lead → the operational list (`BREVO_LEADS_LIST_ID`) always; the marketing list
  (`BREVO_MARKETING_LIST_ID`) **iff `marketing_opt_in === true`** — a non-opt-in lead is never on the
  marketing list. Missing/invalid list id → skipped (the contact still upserts). No-op + logged when
  `BREVO_API_KEY` unset.
- **Internal new-lead notification** (`src/lib/email/{lead-notification,send-lead-notification}.ts`):
  an **English-only** ops alert sent through the **existing** transactional `sendTransactionalEmail`
  (tags `['lead-notification', band, locale]`) to `LEAD_NOTIFY_TO` (comma-separated allowed), from
  `LEAD_NOTIFY_FROM` || `EMAIL_FROM_ADDRESS`. Contains child first name, parent email, child age
  (**worded**), band (human label), locale, marketing opt-in (Yes/No), consent version, timestamp, and
  the "parent already received their strengths profile + certificate" line. **No raw answers, no
  score/IQ/%/rank/number** (forbidden-token coverage extended; the only digit-bearing values — email,
  consent version, timestamp — are masked in the test, the age is worded). No-op + logged when its env
  is unset.
- **i18n:** no namespace touched — the notification is internal and English-only (the parent's locale
  is reported as a field), so `messages.test.ts` is unchanged.

## Follow-up nurture emails (phase 2.03 — Code half)

- **The content half of the lead lifecycle's last piece.** Four follow-up "nurture" emails, authored
  as React Email components in `src/emails/nurture/` and rendered to **8 static HTML files** in
  `docs/email-templates/Part-2-Phase-03-nurture/` (the Cowork half loads them into Brevo). The app
  funnel does not change; **nothing new is collected or stored**.
- **The four emails** (each MK + EN, reusing the 2.01 brand/layout + a wordmark stand-in, mobile-first;
  **no certificate attached**): `welcome-trial` (trial track, age ≤ 9 — thank-you + "your strengths +
  certificate are already in your inbox" + a soft trial mention), `welcome-general` (general track,
  age ≥ 10 — thank-you + certificate reminder, **no trial CTA**, a quiet "explore IqUp" link),
  `trial-invite` (trial track — the §2 story → hands-on discovery → create lesson, Bibi/Bobi/Oliver-led,
  + the trial CTA), and `nudge` (trial track — a gentle final note + the trial CTA once more).
- **Personalisation = Brevo merge tags only**, using only attributes Brevo already has from 2.02:
  `CHILD_FIRST_NAME` (greeted with a graceful `default:` fallback so an absent name reads naturally),
  and `CHILD_AGE`/`LOCALE` as **branch conditions only** (the child's age is **never shown**). The
  render helper (`src/emails/nurture/render.ts`) restores the literal quotes React escapes inside
  `{{ }}` so Brevo gets a valid filter.
- **Guardrails (tested):** **no numbers/scores** anywhere (copy + rendered HTML — the 2.01 forbidden-
  token discipline, proven non-vacuous); **unsubscribe + legal sender identity + postal address**
  (`IKUP d.o.o.`, Todor Aleksandrov, Skopje) in every footer; **UTM-tagged links** (`utm_source=brevo`,
  `utm_medium=email`, per-email `utm_campaign`); the **trial CTA present in welcome-trial / trial-invite /
  nudge and ABSENT in welcome-general**.
- **Trial CTA target = the 2.01 email's target**, behind a `// TODO(booking 2.05)` seam: both now
  resolve it from one shared place — `src/lib/email/site-url.ts` `siteUrlFor` (extracted from 2.01, no
  behaviour change) + the UTM in `src/emails/nurture/links.ts`. Link host = `NEXT_PUBLIC_SITE_URL` (dev
  placeholder until 2.06); booking flow swaps in at 2.05 — both emails update in one place.
- **Render + tests:** `npm run emails:nurture` renders the 8 files (same script-local tsconfig as 2.01's
  `test:email`). `copy.test.ts` (MK/EN parity + slots + forbidden-token) and `render-smoke.test.ts`
  (merge tag + unsubscribe + identity + UTM + CTA split + forbidden-token over the rendered HTML) both
  run under the default `npm test`. **No new dependency** (reuses React Email + render from 2.01).
- **README** (`docs/email-templates/Part-2-Phase-03-nurture/README.md`) is the authoritative Cowork
  hand-off: file→workflow-step mapping, subjects/preview per email, the **exact Brevo trigger + branch
  conditions** (entry = contact added to the **marketing list** `BREVO_MARKETING_LIST_ID`, never the
  ops "all leads" list; trial split = `CHILD_AGE` at most 9; language split = `LOCALE` mk/en), the
  workflow shape, and the link/sender 2.05/2.06 notes. **The automation stays paused until launch.**

## Analytics, consent layer + `/privacy` (phase 2.04 — Code half)

- **Consent system** (`src/lib/consent/`): `iqup_consent` first-party cookie (`COOKIE_CONSENT_VERSION='cookies-v1-2026-06'`, ~6-month, `Path=/; SameSite=Lax; Secure` in prod), three categories — **Necessary** (always on: the consent cookie + `NEXT_LOCALE`), **Analytics** (GA4 + Clarity), **Marketing** (Meta Pixel). `ConsentProvider` is **cookie-backed via `useSyncExternalStore`** (the repo idiom, not a setState-in-effect — Decision #110); the cookie is the single source of truth; the banner renders **post-hydration** (stable `NOT_READY` server snapshot → no mismatch/CLS). `useConsent()` exposes `ready/decided/consent/manageOpen` + `acceptAll/rejectAll/savePreferences/openManage/closeManage`. Pure helpers (`state.ts`, `cookie.ts`) are unit-tested (round-trip + **version-bump invalidation**).
- **Banner + Manage dialog** (`src/components/consent/`): a **non-modal** bottom banner — **Accept all / Reject** (IDENTICAL styling/salience — Decision #113) **/ Manage**, ≥44px targets, transform-only motion-safe entrance — and a **Radix Dialog** (existing unified `radix-ui`) Manage panel: Necessary (always-on, informational) + Analytics + Marketing toggles **un-pre-ticked by default** + Save. Both are **`next/dynamic` (ssr:false)** so they're code-split off every page's initial bundle (perf — Decision #112). `CookieSettingsButton` re-opens the dialog from the footer + `/privacy`. `ConsentRoot` (in the locale layout) wires provider + banner + dialog + page-view tracker + the `syncTrackers` effect.
- **Consent-gated loaders** (`src/lib/analytics/`): `loaders/{ga,clarity,pixel}.ts` inject **only** on a granted category **and** a set `NEXT_PUBLIC_*` id (logged no-op otherwise; SSR-safe; never throw; idempotent). GA Consent Mode defaults-denied→update; Clarity `consentv2`; Pixel `consent grant`→init→PageView; `// FUTURE(CAPI 2.x)` note by the Pixel loader. `syncTrackers(consent)` (called by `ConsentRoot`) loads on grant + re-signals denied/`revoke` on withdrawal (no force-unload mid-session — clean state lands on next navigation). A shared `runtime.ts` holds the live consent snapshot + idempotency flags + the `window` global types.
- **`track(event, params?)`** (`src/lib/analytics/track.ts`): sanitises params to **exactly** `{band, locale, path}` (PII-free, unit-asserted), routes GA iff Analytics granted + GA id + `gtag`, Pixel iff Marketing granted + Pixel id + `fbq`, independently. Seams: `test_start`/`test_complete` (`TestRunner`), `generate_lead`+Pixel `Lead` (`EmailGate`, **client-side after `submitLead` returns success**), `trial_cta_click` (`TrialInvite`), `page_view`+Pixel `PageView` (client navigation via `usePathname()`, first path skipped — the SDKs send the initial view).
- **`/privacy` (+ `/en/privacy`)** — **SSG**, in the locale layout (per-locale `<html lang>`, skip-link, header/footer), per-locale `generateMetadata` (canonical + hreflang). Body = bilingual structured content (`src/content/privacy/{mk,en}.ts`, typed shape: ordered sections + a real cookie table) + the `Privacy` chrome namespace. **Provisional GDPR baseline** (`privacy-v1-draft-2026-06`), controller **IKUP d.o.o.**, all-MK-provisional, **exempt from the no-number rule** (dates/durations/address) but introduces **no score/IQ vocabulary** (forbidden-vocab test). The gate's `// TODO(privacy-page)` seam + the footer **Privacy policy** + **Cookie settings** links resolve here.
- **i18n:** new **`Consent`** + **`Privacy`** namespaces + `Gate.consent.privacy*` + `Landing.footer.{privacy,cookieSettings,legalNavLabel}` keys, parity-clean in both locales (`messages.test.ts` extended). All new MK provisional.
- **Env (public, not secrets):** `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_META_PIXEL_ID` documented in `.env.local.example`. **No new runtime dependency.**

## Trial-booking mechanic (phase 2.05 — Code)

- **Shared mechanism** (`src/components/trial/TrialBooking.tsx`): one client island reused by both
  surfaces — an accessible native city `<select>` (no geolocation) over the 10 centres → the chosen
  centre's name + address + contact + a one-tap action row: **Call** (`tel:`), **Email** (a **name-free**
  `mailto:` with a provisional bilingual subject/body), **Get directions** (`mapsUrl` or a derived Maps
  **search** link, new tab + `noopener`), and **Viber / WhatsApp** rendered **only when** a centre carries
  the number (zero today). Labels resolve server-side from the `Trial` namespace (`resolve-copy.ts`) →
  plain-string props (no translation runtime in the island). AA: labelled select, real anchors, ≥44px,
  brand tokens. `track('trial_cta_click', {band?, locale, path})` fires client-side on each action,
  PII-free + consent-gated (the result screen passes `band`; the page omits it).
- **`centers.ts`** (single source) extended additively: optional **unset** `viber?`/`whatsapp?` (E.164;
  not fabricated) + helpers `mapsUrlFor` (verified `mapsUrl` or a derived Google Maps search link),
  `viberHref`/`whatsappHref` (built only when the number exists). **Existing phone/email/address values
  unchanged; PROVISIONAL flag kept.** `IQUP_CONTACT_URL` (the old contact-form fallback) was removed.
- **Public page** `/trial` (+ `/en/trial`) — SSG, name-free, per-locale metadata + canonical/hreflang +
  generic name-free OG; slug `// TODO(mk-slug)`. **Result screen** (3–5 / 6–9) renders the same mechanism
  inline; band 10–13 unchanged.
- **One trial target:** `trialBookingUrl(locale, utmCampaign?)` (`src/lib/email/site-url.ts`, on
  `siteUrlFor` + `/trial` + optional UTM). The results email + the three trial nurture links resolve from
  it; `welcome-general` keeps its general site-root link. `ResultsEmailProps.siteUrl` was renamed to
  `trialUrl` (deliberate; the two email tests' trial-URL assertions updated to `/trial`).
- **i18n:** new `Trial` namespace (page heading/intro, picker label, 4 action labels, name-free mailto
  subject/body, reassure, meta + OG), exact MK/EN parity (`messages.test.ts` extended); `Result.trial`
  slimmed to `{heading, nearestCenter}`. **All new MK provisional.**
- **Quality:** **292 vitest** (28 files) + build/lint/typecheck clean; `/trial` axe-clean both locales
  (empty + city-selected — the selected scan caught + verified a latent 1.10 contrast fix); nurture
  re-rendered (three trial emails → `/trial`); fresh-context review **PASS**. **No new PII / Supabase
  write / Brevo call / schema change / processor / dependency.**

## Bilingual shell

- next-intl wired: `routing.ts` (locales `mk`/`en`, default `mk`, `localePrefix: 'as-needed'`), `request.ts` (loads `src/messages/<locale>.json`), `navigation.ts`, and `src/proxy.ts` (Next 16 middleware convention).
- Per-locale `<html lang>` and hreflang alternates (`mk` → `/`, `en` → `/en`, `x-default` → `/`); landing also sets per-locale canonical + OG.
- UI strings in `src/messages/mk.json` and `src/messages/en.json` (Meta, Landing, Test, Gate, Result namespaces; exact key parity, enforced by `src/messages/messages.test.ts`). **All copy is draft pending native-MK review.**

## Integrations wired

- **Supabase leads pipeline (phase 1.05) — live & verified.** The `leads` table
  exists in the EU project (`cpxssfodboukznzaksnb`, `eu-central-1`) with RLS enabled,
  no anon policies, and anon grants revoked. Server-side path: `insertLead(input)`
  (`src/lib/leads/insert-lead.ts`) validates with the zod `leadSchema`
  (`src/lib/validation/lead.ts`) and inserts via the service-role client
  (`src/lib/supabase/server.ts`). A browser anon client (`client.ts`) exists for
  future non-leads use. Proven end-to-end by `npm run test:insert` (anon is denied
  read + write; service-role insert/read/cleanup works; table left empty).
  **Phase 1.08 now drives this:** the email gate's `'use server'` `submitLead` action (after a
  honeypot check) builds the snake_case lead and calls `insertLead()` — verified live (real rows
  inserted in both locales with the summary only + correct band map, then deleted; anon still denied).
- **Results email (phase 2.01) — wired; live delivery deferred-pending-key.** The `submitLead`
  action fires `sendResultsEmail` via `after()` once the lead saves; it renders the strengths
  profile + an attached certificate PNG and sends one transactional email via **Brevo** (thin
  `fetch` client, no SDK). Build/render/wiring verified end-to-end (incl. the real Next runtime);
  the actual Gmail/Outlook delivery is verified once Cowork adds `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS`
  (`npm run test:email`). **Brevo is a new data processor → on the Part-2 legal-review list.**
- **CRM contact routing + new-lead notification (phase 2.02) — wired; live delivery deferred-pending-config.**
  On a saved lead the same `after()` work now upserts the parent into **Brevo Contacts** by email
  (consent-gated lists) and emails IqUp's team an internal new-lead alert via the existing transactional
  path. Build/typecheck/lint/test verified end-to-end (190 tests); the actual contact landing, list
  membership, and alert delivery are verified once Cowork sets `BREVO_LEADS_LIST_ID`,
  `BREVO_MARKETING_LIST_ID`, `LEAD_NOTIFY_TO` (+ creates the 8 UPPERCASE attributes) — one Brevo setup
  lights up 2.01 + 2.02 together. **No new data processor** (Brevo already on the Part-2 legal list from
  2.01); the **operational-list-vs-marketing-list consent boundary is flagged for IqUp legal/privacy.**
- **Nurture / follow-up emails (phase 2.03 — Code half) — templates authored + rendered; the Brevo
  automation is the Cowork half.** The 8 bilingual HTML templates + the README hand-off are in
  `docs/email-templates/Part-2-Phase-03-nurture/`; they run on the **marketing list 2.02 populates**
  (and only that list, so the marketing-opt-in consent gate carries through). **The Cowork half builds
  + stages the automation in Brevo from the README** (trigger, branches, sender) and keeps it **paused
  until launch**. Analytics / Pixel / consent banner / `/privacy` = 2.04; real trial booking = 2.05.

## Reserved folders (created, awaiting content)

`public/bibi/` (licensed Bibi art — still awaiting; `HeroArt` and the certificate's `BIBI_CERT_ART` placeholder stand in until it lands), `public/og/` (no static OG needed — the OG image is dynamic). (`src/content/results/`, `src/lib/supabase/`, `src/content/test/`, `src/lib/scoring/`, and `docs/design-handovers/` now hold real files.)

## Quality checks (Phase 1.11)

- **Lighthouse (median-of-5/3, production build, this machine; LCP/CLS/TBT lab values):**

  | Surface | Perf | A11y | BP | SEO | LCP | CLS | TBT |
  |---|---|---|---|---|---|---|---|
  | Landing `/` (MK) mobile | **92** | 100 | 100 | 100 | 3.35 s | 0.015 | 75 ms |
  | Landing `/en` (EN) mobile | **92** | 100 | 100 | 100 | 3.32 s | 0 | 57 ms |
  | `/test` (MK) mobile | **91** | 100 | 100 | 100 | 3.41 s | 0 | 104 ms |
  | Landing `/` (MK) desktop | **100** | 100 | 100 | 100 | 0.71 s | 0 | 0 ms |
  | Landing `/en` (EN) desktop | **100** | 100 | 100 | 100 | 0.72 s | 0 | 1 ms |

  **Desktop hits the 95+ bar on all four categories, both locales.** **Mobile A11y/BP/SEO = 100; mobile
  Performance = 91–92 (below 95)** — up from the documented ~87 single-run baseline (now a defensible
  median-of-5). The gated metric is **LCP ≈ 3.3 s under the simulated slow-4G + 4× CPU throttle**; the
  LCP element is the hero **explainer paragraph (body text)**, which paints immediately in the
  `display:swap` metric-matched fallback (observed real-world LCP ~1.2 s, **CLS ~0**, **TBT 57–104 ms**).
  The single-digit gap to 95 is the framework-JS execution baseline (React 19 + Next 16 + next-intl +
  LazyMotion-gated Framer + Radix) under the throttle on a modest machine — expected to clear 95 on clean
  production infra (Vercel). Genuine optimisation applied (fonts already optimal for the body-text LCP;
  `html-to-image` dynamic-imported off the initial `/result` bundle; no third-party/heavy client JS); the
  brand font/animation were **not** degraded to game the score. Full write-up in the 1.11 report §2.
- **Accessibility (WCAG 2.2 AA):** `@axe-core/playwright` across every route × state × locale (landing ·
  test start/question/age-fallback · gate empty+invalid · result ×3 bands · not-found; both locales) —
  **zero serious/critical** on mobile + desktop (`docs/qa/Part-1-Phase-11/axe-summary.*.json`). The 2.2
  delta (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) verified; skip-link now on **every** page incl. the
  404. Two real defects found + fixed: the test progressbar lacked an accessible name
  (`aria-progressbar-name`) and the new 404's "404" failed contrast. (The "gate contrast" axe hits were
  the dev-only `?dev=1` chrome, excluded from the scan; stripped in production.)
- **Parity:** `messages.test.ts` green (added `NotFound` namespace, both locales); hreflang/canonical
  present on every indexable page; the language switch now preserves full path **+ query** (the `/test`
  `?age` drop is fixed, asserted by `tests/e2e/parity.spec.ts`).
- **Cross-device:** no horizontal overflow at 360/390/414/768/1024/1280 px (landing, `/test`, `/result`,
  both locales); certificate renders 1080×1350 and **Download (PNG) + Share (copy-link fallback) work on
  mobile** with the child's name never leaving the browser. Screenshot evidence: `docs/qa/Part-1-Phase-11/{mobile,desktop}/`.
- `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` (**98/98**) — all clean. Playwright
  e2e: **45/45** green.

## Quality checks (Phase 1.10)

- `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` (**98/98**) — all clean. New
  suites: `results` (per strength×tier×locale coverage, MK/EN slot parity, **no forbidden tokens** —
  digits/%/score/rank/deficit, `getResultCopy` assembly), `centers` (10 centres, fields, unique
  ids/emails), `certificate-model` (deterministic tint + **AA contrast for every tint the rule can
  produce** + name sizing/date/list), and updated `messages.test.ts` (rewritten `Result` namespace).
- **Live-verified in the dev preview** (the screenshot tool worked this phase): all **3 bands × both
  locales** render the profile; bands 3–5 & 6–9 show the trial invite + city picker, band 10–13 shows
  the curious-mind ending (no trial); the direct-access guard redirects home when storage is cleared;
  no console errors/warnings; MK Cyrillic chrome + content render correctly.
- **Certificate capture verified live:** Download produced a valid **1080×1350 PNG** (≈223 KB, fonts
  embedded, no tofu) — a sample is saved at
  `docs/design-handovers/Part-1-Phase-09-assets/sample-certificates/certificate-mk-band-3-5-Ива.png`.
  Per-child tint confirmed visually (Ива spatial+verbal = teal→green; Марко pattern+spatial = indigo→teal).
- **Lighthouse not re-run this phase** (carried baseline; final perf sweep is 1.11).

## Quality checks (Phase 1.08)

- `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` (**73/73**) — all clean. New
  suites: `submit-lead` (band map, summary-only/no-IQ, consent-false rejected, honeypot no-insert,
  unknown-key stripping, action flow), i18n parity (`messages.test.ts`), and the `/result` storage +
  lead-context guards.
- **Live funnel** (both locales, `?dev=1` fast-finish): landing → test → gate → submit → `/result`
  showing name + top 3. EN (age 7 → band-b, Cyrillic) and MK (age 11 → band-c, Latin, marketing on)
  each inserted a **summary-only** row (correct band map, `consent_version` stamped) — read back,
  then **every test row deleted** (table left at 0). Anon read+write still denied (`test:insert`).
  Validation (empty + invalid email) shows field errors + moves focus to the first invalid field;
  honeypot is off-screen / `tabIndex -1` / `aria-hidden`; `/result` direct-visit redirects home.
- Mobile (375px): no overflow; submit 56px, input 52px, consent row ≥44px; CLS ~0.
- **Lighthouse** (`/test` route — hosts the gate; production): desktop **100/100/100/100**; mobile
  **Perf 88** / A11y 100 / BP 100; SEO **100** origin-matched (a localhost-port `metadataBase`
  artifact aside). Mobile Perf at the documented web-font-gated baseline — no regression (the gate is
  code-split out of the initial `/test` bundle). Gate + `/result` content states (behind
  sessionStorage/interaction) verified structurally (a11y tree, computed contrast, head metadata).
- _(Screenshots not captured — the local preview screenshot tool times out in this environment, as in
  1.07; visuals/a11y verified via accessibility-tree snapshots + computed-style inspection instead.)_
- A fresh-context review subagent found **zero blockers**; its one should-fix (orphaned
  `Test.completion` copy after the `CompletionView` removal) was fixed.

## Quality checks (Phase 1.07)

- `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` (**39/39**) — all clean. New
  suites: scoring (ranking/tiers/determinism/no-total-no-IQ invariants) + content integrity (counts,
  distribution, one-strength-per-Q, MK/EN parity, reveal items).
- **Lighthouse** (`/test`, production): A11y / Best-Practices / SEO = **100** mobile + desktop, both
  locales; Performance **desktop 100** both, **mobile 88–97** (at/above the landing's ~87 web-font-
  gated baseline — same root cause, no regression; finalize in 1.11).
- Flow verified live (production build) for all three bands + both locales: start → questions (image &
  text) → reveal mechanic (timed) → completion → `sessionStorage['iqup.testResult.v1']` populated with
  a valid `TestResult` (no `iq` field). Selected-state styling, strength-chip colours, stem alt text,
  progress aria-live, mobile 2-col grid (no overflow, 56px CTA, 144px tiles) all confirmed via
  computed-style inspection + a11y snapshots. Dev preview confirmed present in dev, stripped in prod.
- _(Screenshots were not captured: the local preview screenshot tool times out in this environment —
  verified it fails even on the known-good 1.06 landing — so visual properties were verified via
  precise computed-style inspection against the 1.03 tokens instead.)_

## Quality checks (Phase 1.06)

- `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` (11/11) — all clean.
- **Lighthouse:** desktop **99–100 / 100 / 100 / 100** (Perf/A11y/BP/SEO) both locales;
  mobile **100 A11y, 100 BP, 100 SEO** both; **mobile Performance ~87** — below 95, gated by the
  brand heading web-font under the simulated slow-4G + 4× CPU throttle (observed real LCP ~1.2 s,
  CLS ~0). Measurement is noise-dominated on this modest machine. Revisit on clean infra in **1.11**.
  Full detail + the optimizations applied are in `Part-1-Phase-06-Completion.md`.
- WCAG 2.2 AA verified (landmarks, single h1, labels, ≥44 px targets, keyboard radiogroup,
  reduced-motion, AA contrast); MK/EN parity exact; Start CTA → `/test?age=N` with correct locale
  prefix; no dead links. Per-locale OG image renders Cyrillic correctly (verified visually).
- A fresh-context code-review subagent found **no blockers / no should-fix**.

_(Phase 1.05 lead pipeline still holds: anon denied, service-role insert verified. Phase 1.02
baseline: both locales prerender, language toggle works.)_

## Open carryover items

- **Tracker live-verification — DEFERRED PENDING COWORK (phase 2.04 second half).** Everything is
  built + tested; each tracker is a logged no-op until its id lands. Cowork must: create the **GA4**
  property → `NEXT_PUBLIC_GA4_ID`; create the **Microsoft Clarity** project → `NEXT_PUBLIC_CLARITY_ID`
  **and switch OFF Clarity auto-cookies** (Advanced settings) so it obeys the `consentv2` signal;
  create the **Meta Pixel** → `NEXT_PUBLIC_META_PIXEL_ID`. Then the live matrix (both locales):
  nothing fires before consent → **Accept all** loads all three (GA4 real-time, Clarity records, Pixel
  Helper shows `PageView` + `Lead` on submit) → **Reject** keeps everything off → Manage changes work.
  Full checklist in the 2.04 completion report.
- **Legal/native-MK review additions (phase 2.04, continuing #88 / #96):** the `/privacy` policy text
  (provisional GDPR baseline, version `privacy-v1-draft-2026-06`), the cookie/tracking-consent wording,
  and **GA4 / Microsoft Clarity / Meta Pixel as data processors** — all for IqUp legal/privacy sign-off;
  all MK provisional. The provisional privacy contact (`info@iqup.mk` / DPO) needs confirming; the MK
  `/privacy` slug can be localised later (`// TODO(mk-slug)`).
- **`/test` mobile Lighthouse Perf 86–88 (phase 2.04) — re-measure on Vercel in 2.06.** A11y/BP/SEO held
  100 everywhere (incl. the new `/privacy` at mobile Perf 92); landing held its 91 baseline. `/test`'s
  throttled LCP rose ~3.4→4.0 s — `/test`-specific hydration contention on the heaviest route under the
  slow-4G + 4×-CPU throttle (its StartScreen heading is SSR'd, so the post-hydration, code-split,
  below-fold banner can't delay paint). The same noise-dominated framework-JS metric 1.11 flagged;
  expected to clear on clean infra. Evidence: `docs/qa/Part-2-Phase-04/lighthouse-medians.json`.
- **Results email live delivery — DEFERRED PENDING `BREVO_API_KEY` (phase 2.01).** Everything is
  built, tested, and the render path is verified in the real Next runtime; the no-key path no-ops
  cleanly. When Cowork adds `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS` (+ optional `EMAIL_FROM_NAME` /
  `EMAIL_REPLY_TO`) and `TEST_EMAIL_TO` to `.env.local`, run **`npm run test:email`** and confirm in
  the inbox: the email arrives (Gmail at least, ideally Outlook), the **Cyrillic** subject + body
  render, the **certificate attachment** opens as a valid 1080×1350 PNG (right name/strengths/tint,
  no tofu), and the **trial CTA shows only for the 3–5 / 6–9 bands**.
- **Brevo is a NEW data processor → Part-2 legal-review list (phase 2.01).** The results email sends
  the child's first name + parent email + strengths summary to Brevo. Add **Brevo DPA + EU data
  residency** to the IqUp legal/privacy review (alongside the consent/privacy wording). The branded
  `@iqup.mk` sender + SPF/DKIM/DMARC + the production `NEXT_PUBLIC_SITE_URL` are finalised in 2.06.
- **CRM routing + notification live-verify — DEFERRED PENDING BREVO CONFIG (phase 2.02).** Built,
  tested, no-op-clean without env. When Cowork: (1) creates the **two lists** → `BREVO_LEADS_LIST_ID` /
  `BREVO_MARKETING_LIST_ID`; (2) creates the **8 UPPERCASE attributes** (`CHILD_FIRST_NAME` text,
  `CHILD_AGE` number, `BAND` text, `LOCALE` text, `MARKETING_OPT_IN` boolean, `CONSENT_VERSION` text,
  `TOP_STRENGTHS` text, `SOURCE` text) — attributes that don't exist are silently ignored by the API;
  (3) sets `LEAD_NOTIFY_TO` (+ optional `LEAD_NOTIFY_FROM`); with `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS`
  (2.01) — submit a marketing-opt-in lead and a non-opt-in lead in both locales (`?dev=1`) and confirm:
  the contact appears with the right attributes; **opt-in → BOTH lists, non-opt-in → ops list only**; a
  re-submit **updates** (no duplicate); the notification arrives with the right fields and **no
  numbers/scores**; the lead still saved + the 2.01 results email still sent. Then delete the test
  contacts/leads. Full checklist in the 2.02 completion report §7.
- **CONSENT BOUNDARY for IqUp legal/privacy (phase 2.02).** No new processor (Brevo already on the
  list from 2.01), but the **operational "all leads" list (operational visibility, not marketing) vs the
  marketing/nurture list (opt-ins only)** distinction must be explicitly reviewed — a lead without
  marketing opt-in must never be marketed to. 2.03's nurture sequences run on the marketing list.
- **Native-MK review additions (phase 2.01):** the new **`Email` namespace** (subject, greeting,
  intro, certificate-attached line, trial heading/body/CTA, curious-mind ending, footer) — all
  provisional MK; the **footer identity line is flagged for IqUp legal** (tied to `CONSENT_VERSION`).
- **Nurture emails — Cowork build + reviews still open (phase 2.03).** The 8 templates + README are
  done (Code half); **the Cowork half builds + stages the Brevo automation** from
  `docs/email-templates/Part-2-Phase-03-nurture/README.md` (marketing-list trigger; `CHILD_AGE ≤ 9`
  trial split; `LOCALE` language split; ~Day 1/3/7 cadence; staging sender) and **keeps it paused
  until launch**. Open: **all nurture MK copy is provisional** (native-MK review; EN mirrors it), and
  the **footer legal/postal line + marketing wording is flagged for IqUp legal** (tied to
  `CONSENT_VERSION`, continuing the 2.01/2.02 legal-review list). **As of 2.05 the trial CTA points at the
  real `/trial` booking page** via the single `trialBookingUrl` helper (`src/lib/email/site-url.ts`,
  shared with the 2.01 email; the 8 HTML files were re-rendered). The trial-CTA link **host** is still the
  dev placeholder until **2.06** (`NEXT_PUBLIC_SITE_URL`) — re-run `npm run emails:nurture` + reload then.
- **Mobile Lighthouse Performance 91–92 (<95) — finalised in 1.11 (honest write-up).** Median-of-5 on
  this machine: mobile Perf **92/92/91** (landing mk/en, test); A11y/BP/SEO **100**; desktop **100**
  across the board, both locales. Gated by **LCP ≈ 3.3 s** (the hero explainer body text, which paints
  in the swap fallback — real-world LCP ~1.2 s, **CLS ~0**, **TBT 57–104 ms**) under the simulated
  slow-4G + 4× CPU throttle; the residual gap is the framework-JS baseline, expected to clear 95 on
  clean infra (Vercel, phase 2.06). Re-measure there. Not a real-world UX regression. **Closed as a
  documented, evidenced gap** (see the 1.11 report §2 + `docs/qa/Part-1-Phase-11/lighthouse-medians.json`).
- **Licensed Bibi art / official logo / official OG art** — drop into `public/bibi/`, the `Wordmark`
  component, and the OG image when provided. Never generate/redraw the characters. **Certificate swap
  (1.10):** set `BIBI_CERT_ART` in `src/components/result/bibi.ts` to the asset path — a one-line
  drop-in into the certificate's placeholder box, no layout change.
- **`centers.ts` data is PROVISIONAL (1.10)** — the 10 centres are seeded from `brand.md` §4, which
  flags that several **phone numbers/addresses vary across sources**; IqUp must verify each before
  launch (these power the trial CTA). Some entries carry a `verify` note.
- **Native-Macedonian copy review + IqUp sign-off** — all landing copy is draft. **Phase 1.07 adds
  more provisional MK to review:** every test question + option (the 36 items, MK verbatim from the
  1.04 spec), the `Test` chrome strings, and the generated stem alt-text in `visuals/lexicon.ts` — all
  Claude-drafted/transcribed and pending native-MK review (EN is the mirror and must stay equivalent).
  **Phase 1.08 adds the `Gate` + `Result` strings**, including the **draft consent + marketing wording**
  — provisional MK, and the consent/marketing wording also needs **IqUp legal sign-off** (it is tied to
  `CONSENT_VERSION = 'v1-draft-2026-06'` in `src/lib/leads/lead-mapping.ts`; bump the version when the
  wording is finalised). The `/privacy` page + the consent-link land in Part 2 (plain-text seam now).
  **Phase 1.10 adds more provisional MK:** the rewritten `Result` chrome strings, all §6 result/
  certificate copy in `src/content/results/` (MK verbatim from the 1.04 spec, EN mirror), and the
  centre city labels — all pending native-MK review (one §6A spatial descriptor was reworded from the
  mockup's "Thinks in 3D" to avoid a digit).
- ~~**`/test` language toggle drops `?age` mid-test**~~ — **FIXED in 1.11.** `LanguageToggle` now
  preserves the full path **and** query (via `useSyncExternalStore` reading `window.location.search`, so
  static pages aren't deopted), so switching MK↔EN keeps the child's `?age`. Asserted by
  `tests/e2e/parity.spec.ts`.
- **C-Q10 cube-net** is the spec's heaviest graphic; rendered as a simple inline net + isometric cubes
  whose per-variant face marks are decorative (scoring uses `correct`). Spec §7 offers an easy
  rotation/pattern substitution if a cleaner asset is wanted.
- **Reduced-motion reveal** (manual Show / "I'm ready", no timer) is implemented and code-verified; the
  timed reveal path was verified live (reduced-motion couldn't be emulated in the headless preview).
- **`NEXT_PUBLIC_SITE_URL`** unset → `metadataBase` falls back to `http://localhost:3000`; set the
  production domain in 2.06 so canonical/OG URLs are absolute.
- **Brand palette/type are the 1.03 PROVISIONAL placeholders** (WCAG-checked, token-based); the real
  IqUp brand files re-skin by editing `globals.css` + the two `next/font` calls only.
- **GitHub remote** — see the Phase 1.02 completion report for status.
- `src/app/favicon.ico` is the default placeholder until a brand asset lands.
- **Supabase (1.05):** transfer the project to an IqUp-controlled account before
  launch; migrate legacy → publishable/secret API keys then; spam/rate-limit
  hardening on the insert path is deferred to launch (2.04/2.07); final consent
  wording pending IqUp legal; `types.ts` is verified-hand-authored — regenerate via
  `npm run db:types` once linked from an environment with DB access.
- ~~**`.mcp.json`** points at the wrong Supabase project~~ — **FIXED in 1.11.** Its Supabase
  `project_ref` was corrected to the canonical EU leads project `cpxssfodboukznzaksnb` and **committed**
  (the file is tracked — the phase prompt's "untracked" was a mismatch; live code wins). A local
  Supabase-MCP convenience, not used by the build.

## Known issues

- None blocking. (`db:push` / `db:types` need a one-time `supabase login` + `link`;
  this machine's sandbox can't reach the Postgres port, so the migration was applied
  via the dashboard SQL editor.)
- **LHCI / Lighthouse:** on the **old Windows machine** `npm run lhci:mobile`/`lhci:desktop` failed because
  every Lighthouse child died on a temp-dir `EPERM` *after* the audit (chrome-launcher cleanup), which made
  LHCI discard the run; **`npm run lh:median`** (build + `npm run start`, then `npm run lh:median`) was the
  portable workaround. That `EPERM` was Windows-specific and likely does not recur on macOS, but LHCI was
  **not re-run during the 2026-06-19 macOS checkpoint** (a full Lighthouse sweep was out of scope) — re-verify
  before relying on it. The LHCI configs remain valid for clean infra / CI. Note: Playwright's Chromium
  binary must be installed once per machine (`npx playwright install chromium`) for the a11y/QA e2e suites.

## Suggested next phase

**2.05 — the real trial booking — DONE** (this phase): the result screen + the results email + the three
trial nurture emails all resolve from the single `trialBookingUrl` helper to the public `/trial` page, and
the `trial_cta_click` event (wired in 2.04) now measures real Call/Email/Directions/Viber-WhatsApp actions.
Next: **2.06** Vercel Pro + the iqup.mk subdomain + production `NEXT_PUBLIC_SITE_URL` + the
branded `@iqup.mk` sender (SPF/DKIM/DMARC) + **re-measure mobile Lighthouse on clean infra** (closes the
`/test` 86–88 watch-item), **2.07** pre-launch QA + go-live, **2.08** post-launch check.

**Cowork/deferred work to light up the built integrations:** (a) **2.04 second half** — create the GA4 /
Clarity / Meta Pixel accounts, set the three `NEXT_PUBLIC_*` ids, switch off Clarity auto-cookies, run the
live consent matrix (2.04 report §"For Cowork"). (b) **2.03 Cowork half** — build + stage the Brevo nurture
automation from `docs/email-templates/Part-2-Phase-03-nurture/README.md`, paused until launch. (c) Run the
deferred **2.01 + 2.02 live checks** once Cowork finishes the one Brevo setup (`npm run test:email`; the 2.02
§7 contact/notification checklist).

**Still-open pre-launch items (not Code tasks):** native-Macedonian copy review + IqUp sign-off of ALL
draft copy (landing, test, gate, result/certificate, consent/marketing wording); IqUp verification of
`centers.ts` phone/address data; licensed Bibi art + official logo + OG art + favicon; the real brand
palette/type; the **Phase 1.09 written completion report** is still missing (Lazar/Chat item — not
fabricated). Supabase account transfer + legacy→publishable key migration is Part-2 hardening.
