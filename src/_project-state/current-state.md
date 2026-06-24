# IqUp-Web — Current State

> Live snapshot of the repo. **Code updates this at the end of every phase.** If this and the live code ever disagree, the live code wins.

**Last updated:** 2026-06-25 — **Phase 3.14 (Code): supporting pages + the honest-framing notice.** The site now has its two missing public pages and one honest reframe sourced from a single place. **The ONE shared honest-framing notice** is a new `Disclaimer` i18n namespace (`notice`/`provisional`/`ariaLabel`, MK + EN, MK provisional) rendered by ONE presentational, props-driven **`HonestNote`** component (`src/components/common/HonestNote.tsx`, `plain`|`inset` variants, muted `text-ink-soft` AA text) — textually consistent with the frozen `report.disclaimer.body` but surface-agnostic ("IqUp is informative and indicative … not a clinical assessment, an IQ score, or a diagnosis"). It is the single documented place clinical/IQ/diagnosis words may appear (only to negate them), proven by a dedicated permissive scan. It is wired (one source, resolved server-side, threaded as props per the repo's no-i18n-runtime-in-islands convention) onto **five chrome surfaces**: the **landing hero** footnote, the **assessment age-setup** screen (a parent-facing expectation line, via `AssessmentCopy.setup.notice`), the **certificate panel CHROME** (a brief line below the actions — the rasterised `CertificateArt` artboard is untouched), the **About page**, and the **privacy page**; the **frozen results screen + emailed PDF keep `report.disclaimer`** (verified unchanged). **New `/about-test` (+ `/en/about-test`)** ships: a public, **SSG, indexable** page in the locale layout (skip-link + header/footer, Montserrat headings + official palette, per-locale `generateMetadata` with canonical + hreflang + alternates), content-as-data (`src/content/about/{mk,en}.ts`, 4 sections — what-it-is / what-it-isn't / credibility-&-STEM-bridge / what-you-receive) + the `About` chrome namespace + a free-test/demo CTA; the "what it isn't" section leans on the shared notice (so the About content itself carries **no** clinical/IQ/diagnosis/number/score/rank words); MK slug `// TODO(mk-slug)`. It is **linked in the footer** (`Landing.footer.about`) next to Privacy; discoverability is the per-page `alternates` metadata + the footer link (the repo has **no generated `sitemap.ts`** — same as `/privacy`+`/trial`). **The `/privacy` content is brought to the v2 data model** additively (`src/content/privacy/{mk,en}.ts`): 4 new sections — **two unlinkable stores** (Supabase-EU anonymous results, no name/email/phone, day-level date only · Brevo-EU parent contacts · no shared key) · **emailed-not-stored PDF** via Brevo's pipeline · **the three parental consents** vs the cookie consent · **the internal back-office access surface** (the 3.13 admin — already merged, so described as the live picture) — plus rewritten what-we-collect/childrens-data/retention/processors lines (incl. the **on-device-only certificate child name**, never transmitted); the **cookie table + the 3.12 Meta CAPI disclosure are preserved verbatim**, MK↔EN structural parity is held, version bumped to **`privacy-v2-draft-2026-06`** (display-only; the stored consent version is a separate, unchanged string). It stays a **provisional GDPR baseline → flagged for IqUp legal**, introduces no score/IQ vocabulary. **No new dependency, no env var, no schema/store/write-path change** — content pages + a notice only. **Additive-only confirmed** (`git diff main --stat` = the new About page/content/notice + the additive privacy edit + the footer/i18n/state wiring; frozen-layer grep — engine/scoring/validity/report-engine/PDF/email-send/certificate-art/assessment-flow/`submitAssessment`/CAPI/both write paths/admin — returns **nothing**; `CertificateArt` untouched, `report.disclaimer` wording untouched). **Quality: typecheck + lint clean, `next build` green** (route table: `/[locale]/about-test` mk+en **SSG** added, indexable; `/report` stays **SSG + `noindex`**; everything else unchanged), **`npm test` 797/797 (77 files) = 775 prior + 22 new** (3 messages-parity/forbidden-scan, 8 About-content parity/forbidden, 11 honest-notice render + per-surface presence). **`@axe-core/playwright` axe-clean** on `/about-test` + re-scanned `/privacy`, both locales × mobile + desktop (8 scans, with the documented settle-wait). Browser-smoked `/about-test` + `/privacy` (both locales): on-brand Montserrat + palette, the shared notice renders (incl. clean MK Cyrillic, no tofu), mobile 375px no overflow, ≥44px CTA, **zero console errors**; the landing-hero + age-setup notices verified live too. Fresh-context self-review: **APPROVE-WITH-NITS, no must-fix** (nits noted: the cert-panel notice renders at 13px by design; About `meta.title` doubles as the H1; a harmless scan-scope asymmetry — all left as-is). **Flagged for Lazar / IqUp / Cowork:** the **whole v2 privacy narrative → IqUp legal**; **all new MK copy (About + the notice + the privacy v2 sections) → native-MK reviewer**; **the controller/DPO contact (`info@iqup.mk`) to confirm**; the `/about-test` **MK slug** is provisional. **Merge-state note:** the brief expected 3.11 + 3.13 to be *unmerged*, but **both are merged on `main`** (git log `104188f`/`a880663`) — so 3.09/3.10/3.11/3.12/3.13 are all merged, the certificate-panel disclaimer spot was wired (not deferred), and the privacy `internal-access` paragraph is current (not anticipatory). No deferred disclaimer spot. Independent calls #229–#237 in `Decisions.md`. See `Part-3-Phase-14-Completion.md`. **Branch `phase-3.14-supporting-pages` — pushed, awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.13 (Code): the admin base — IqUp's private back-office.** IqUp now has an internal `/admin` that READS the two existing stores through **two structurally isolated paths** and can never join them. **Auth (Supabase Auth via `@supabase/ssr@0.12.0`, the one new dependency, pinned):** invite-only email+password, cookie-based SSR sessions, **MFA-compatible** (completes a TOTP challenge when a factor is enrolled), a working sign-out, **no public signup**. The gate is **defense-in-depth** — the **proxy** (`src/proxy.ts` now dispatches `/admin/**` → a Supabase session refresh + redirect, everything else → the unchanged next-intl `createMiddleware`, so `/admin` is EXCLUDED from locale routing and public routing is untouched) **AND** a per-route `requireAdminUser()` in the gated group layout **plus** an independent `getAdminUser()`→401 in each CSV export handler. The admin lives **outside `[locale]`** (single-locale English, `noindex`, no nav link, no sitemap/hreflang, **no analytics/CAPI, no consent UI**) and owns its **own root layout** (`src/app/admin/layout.tsx` renders `<html>`; multiple-root-layouts — the static `admin` segment wins over the dynamic `[locale]`). **Contacts view (Store B / Brevo, read-only):** a `server-only` thin-`fetch` READ transport (`fetchContactsPage`, no SDK) + `fetchLeadContacts()` scoped to `BREVO_LEADS_LIST_ID`, mapping each contact through an **allow-list** (`toLeadContactRow`) that structurally drops **`TOP_INDEX`** and every cognitive field; a server-rendered **paginated, city-filterable** table (GET `<form>` + `<a>` page links, no client JS) showing parent/email/phone/city/age/gender/the **three consent flags**/source/date. **Statistics view (Store A / Supabase, aggregate-only):** a `server-only` `readAggregateStats()` via the **service-role** client that selects a **non-PII column projection (no `id`, no exact timestamp)**, pages newest-first to a logged cap, and **aggregates server-side — the raw rows never escape**; the view renders **completions-by-week + by age/gender/city/language/validity + anonymous band-by-index distributions** as accessible styled-`<div>` bars (no charting lib), every number a population stat. **Two independent CSV exports** (contacts from Brevo; aggregate stats from Supabase) — UTF-8 **+ BOM**, RFC-4180 escaping, **no joined file, no shared per-child key**. **Unlinkability proven by test** (`unlinkability.test.ts` scans actual import EDGES: contacts path ✗ stats/Supabase/scoring; stats path ✗ Brevo/contacts; no module imports both readers), plus **server-boundary** (service-role client is `server-only` + unreachable from any `'use client'` admin file), **aggregate-only** (no raw rows / PII keys in the stats output), **no-cognitive-field** (the contacts mapper/CSV/page never emit `TOP_INDEX`), **resilience** (both readers are clean no-ops without config + never throw), the **gate** (redirects to `/admin/login` unauthenticated — unconfigured AND configured-no-session AND failing-Supabase), and a **page-render smoke** (both views render empty + populated). **Additive only:** the ONLY modified tracked files are `src/proxy.ts` + `package.json`/`package-lock.json`; **frozen engine/scoring/validity/tasks/norms/report-engine/PDF/email-send/certificate/assessment-flow/`submit-assessment`/CAPI + both write paths untouched** (`git diff main --stat` confirms; frozen-layer grep returns nothing). **No new env var** (the admin reuses `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` for login, `SUPABASE_SERVICE_ROLE_KEY` for stats, `BREVO_API_KEY`/`BREVO_LEADS_LIST_ID` for contacts); **no schema migration, no new Store A column, no new Store B attribute, no change to either write path.** **Quality: typecheck + lint clean, `next build` green** (public route table UNCHANGED — `/report` SSG, `/test` dynamic; the new `/admin/**` routes are all dynamic), **`npm test` 775/775 (75 files) = 737 prior + 38 new.** Browser-smoked on this machine (blank env): the login renders the clean "not configured" state, `/admin`·`/admin/contacts`·`/admin/statistics` all redirect to `/admin/login` (the gate holds), **zero console errors**; the **gated views' live render is DEFERRED-pending-keys** (no Supabase session is possible with the blank template — proven instead by the page-render smoke + resilience tests). Fresh-context privacy review: **APPROVE, no must-fix** (one nit taken — the stats query now orders newest-first so the fetch-cap label is truthful). **Flagged for Lazar / IqUp / Cowork:** staff-account provisioning + disable-public-signups + confirm EU/Auth data residency (dashboard, code can't create accounts); **2FA enforcement** recommended (login is MFA-compatible; enrolling/enforcing is config); **GDPR retention / right-to-erasure tooling is deferred** (admin is read-only over contacts this phase); **`TOP_INDEX` intentionally hidden** from the contact list (kept as the silent segmentation field — IqUp to decide later whether staff may filter by it); the **anonymous band/index aggregates** were included on top of the required demographics (reviewable scope choice); **Brevo PII now visible in an internal tool** — confirm fit with the Brevo DPA / privacy review (no new processor, a new internal access surface). Independent calls #220–#228 in `Decisions.md`. See `Part-3-Phase-13-Completion.md`. **Branch `phase-3.13-admin-base` — pushed, awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.12 (Code): analytics + consent + Meta CAPI — the funnel becomes measurable, privately.** The v2 funnel now emits the **Appendix-F GA4 event set** through the existing 2.04 consent-gated GA loader, **PII-free AND score-free**: `age_set`/`test_start`/`section_complete`/`test_complete` fire at the exact `useAssessment` transitions; `form_view` (ref-guarded — never on a refresh-reveal) + `lead_submit` (after a successful submit) fire in `ReportFlow`; `cta_booking_click` fires on the results CTA **and** the live `/trial` surface (replacing the v1 `trial_cta_click`); `retest_start` on the retry path. `track()`'s sanitiser allow-list was **widened to `{age, section, locale, path}` and `band` DROPPED** (kept in the type only so orphaned v1 callers compile) — **no band/index/score/rank can reach GA4** (unit-asserted). A new **server-only `src/lib/meta/capi.ts`** fires a Meta Conversions API **`Lead`** on a successful submit at `// SEAM (3.12)`: **SHA-256-hashed `em`/`ph`/`ct`/`country`** (over normalised values — email trim+lowercase · phone→E.164 MK · city→primary token, diacritics-folded · country `mk`) + non-hashed `client_ip_address`/`client_user_agent`/`fbp`/`fbc`; `custom_data` is the generic `{content_category:'assessment_lead'}` — **zero cognitive data**. It is gated **server-side** on the **Marketing** grant read from the `iqup_consent` cookie (`cookies()` + the existing pure `parseConsent`, fail-closed — never a client flag), reads request IP/UA in request scope, then fires inside the **same `after()`-isolated, never-throws** pattern as the 3.10 report email (a slow/failing/unconfigured CAPI can never break the two writes, the reveal, or the redirect), and is a **logged no-op without `META_CAPI_ACCESS_TOKEN`/dataset id**. Graph API pinned **`v21.0`**; dataset id = the existing `NEXT_PUBLIC_META_PIXEL_ID`; optional `META_CAPI_TEST_EVENT_CODE`. **Dedup:** one client-minted `event_id` per submission (`crypto.randomUUID()`, `getRandomValues` fallback — no `Math.random`) is shared by the server CAPI `Lead` and the **optional** browser Pixel `Lead` (`firePixelLead` re-homed from the orphaned v1 `EmailGate` → `fbq('track','Lead',{},{eventID})`, no-op when the Pixel isn't loaded), so Meta deduplicates. **Consent Mode v2 verified already complete** in the 2.04 GA loader (`analytics_storage`←Analytics; `ad_storage`+`ad_user_data`+`ad_personalization`←Marketing) — no change. The **CAPI processor disclosure** (Marketing → server-side hashed transfer to Meta on submit) + a `_fbc` cookie row were added to `src/content/privacy/{mk,en}.ts` (MK provisional, **flagged for IqUp legal**); the full privacy page stays for 3.14. **Two-store unlinkability untouched:** CAPI reads only the submitted **lead fields (Store B inputs)** — never Store A/scores — and the transient inputs (`event_id`/`fbp`/`fbc`/the consent read) touch **neither store** and never reach a URL (proven by test). **No new dependency / Supabase write / Brevo call / schema change / processor on either store.** **Frozen engine/scoring/validity/tasks/norms/report-engine/PDF/email-send/certificate + the two-store write logic untouched** (`git diff main --stat` = additive analytics/CAPI seam fills + the privacy disclosure + env/state; frozen-layer grep returns nothing; v1 stays orphaned). **Quality: typecheck + lint clean, `next build` green (route table unchanged — `/report` SSG, `/test` dynamic), `npm test` 737/737 (67 files) = 706 prior + 31 new** (18 CAPI payload/hashing/no-cognition/no-op/never-throws, 6 Pixel-Lead dedup gating, 6 CAPI server-consent gating in `submit-assessment`, +1 net in the rewritten `track` PII/score-free suite). Browser-smoked the full funnel (`/test?age=8&dev=1` autopilot → completion badge → `/report` form) with **zero console errors** — the event wiring runs without throwing; **live GA4-realtime + Meta Events-Manager/Test-Events verification is DEFERRED-pending-Cowork** (needs the real `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `META_CAPI_ACCESS_TOKEN`; exact steps in `Part-3-Phase-12-Completion.md`). Fresh-context review: **APPROVE-WITH-NITS** — the one substantive nit taken (city diacritic-folding for CAPI match quality). **Flagged for Lazar / IqUp:** the CAPI processor disclosure → IqUp legal/privacy; the new MK copy → native-MK review. Independent calls #210–#219 in `Decisions.md`. See `Part-3-Phase-12-Completion.md`. **Branch `phase-3.12-analytics-capi` — pushed, awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.11 (Code): the shareable certificate — the artifact a parent shares (the awareness engine).** The `// SEAM (3.11)` is wired: the v2 results reveal now renders a **shareable "IQ UP! Explorer" certificate** inline. Built to the **3.08 certificate surface** (`docs/design-handovers/surfaces/Certificate.html` — present + usable) as **fresh v2 React code** (NOT imported from the orphaned v1 `result/Certificate.tsx`). **`src/components/report/CertificateArt.tsx`** is a pure, props-driven **1080×1350 (4:5)** artboard (`forwardRef` captured node, inline styles for faithful `html-to-image` raster): the **IQ UP! wordmark** (structural markup, not an i18n string) + the **"Explorer" reward stamp** (white on violet `--action`) + the **Bibi placeholder** (the ONLY Bibi slot; `BIBI_CERT_ART` one-line drop-in, still `null`) + the **top strength** (the index NAME pill read from `report.topStrength.name` + a warm child-facing `strengthLine` keyed by `IndexId`) + a **deterministic per-child accent from the top-strength index hue** + the **optional on-device name** + a "month year" keepsake date — **no band/score/%/rank/number** anywhere. The accent is applied ONLY as the light `-tint` under `-ink` text or `-ink` on the white card (never `-ink` on the saturated solid, which fails AA), so **AA holds across all five accents** (proven by `cert-accent.test.ts`). **`CertificatePanel.tsx`** (`'use client'`) is the wrapper at the seam: the panel intro + an **opt-in, OFF-by-default, on-device-only name field** (with a "stays on this device" note) + a responsive scaled preview + **Download** (`html-to-image`→PNG @1080×1350, embedding ONLY Montserrat latin+cyrillic via a filtered `getFontEmbedCSS`, with a 6s timeout→`skipFonts` fallback so it never hangs; MK Cyrillic renders with **no tofu**) + **Share** (Web Share API file-share with GENERIC name-free metadata; copy-link fallback → the **PII-free locale landing URL**). **The optional name NEVER leaves the device** — it lives only in component state + the in-browser image; it is written to NEITHER store, no URL/query string, no OG image, no analytics/network call (asserted by a no-leak source+attribute scan). A dedicated **name-free `/[locale]/report/opengraph-image.tsx`** (Cyrillic-safe Montserrat from the committed 3.10 TTFs; takes only `{locale}`) covers any raw `/report` link preview. Wired **inline** at `// SEAM (3.11)` via a new optional `certificate?: ReactNode` slot on `ResultsScreen` filled by `ReportFlow` — **no certificate route**; `// SEAM (3.10)` + `// SEAM (3.12)` untouched. New **`Certificate` i18n namespace** (MK + EN exact parity, MK provisional, gender-neutral `strengthLine`) — chrome only; report CONTENT stays in `buildReport`. **Determinism proven** (same `ReportContent` → byte-identical certificate; no `Date`/`Math.random` on the content path). **Honest framing proven** by a non-vacuous forbidden-token scan over the rendered certificate (5 indices × both locales, wordmark-stripped) + a no-stray-digit scan (only the keepsake date). **No new dependency** (`html-to-image` + `next/og` already installed); **no new Supabase write / Brevo call / CAPI event / schema change / processor.** **Frozen engine/scoring/validity/tasks/norms/report-engine + the two-store writes + `submitAssessment` data logic untouched** (`git diff main --stat` = additive only; v1 certificate left orphaned). **Quality: typecheck + lint clean, `next build` green (the new `/[locale]/report/opengraph-image` route added — mk + en; all others unchanged, `/report` stays SSG + noindex), `npm test` 706/706 (65 files) = 677 prior + 29 new (18 certificate render/leak/determinism, 9 accent AA + date, 2 messages).** Verified in the real runtime: the certificate renders in the results reveal in **both locales** with the per-child accent (teal/memory for the seeded run); the opt-in name prints "Стефанија"/Cyrillic with **no tofu**; the MK certificate chrome + `strengthLine` render clean Cyrillic; Download produces a valid PNG (this machine's headless preview can't rasterise SVG-embedded fonts, so it exercised the `skipFonts` fallback — whose PNG was confirmed to render MK Cyrillic cleanly; real browsers take the embedded-Montserrat path, as v1's html-to-image embedding shipped); mobile 375px no overflow; both OG routes return valid PNGs; no console errors. Fresh-context review: **APPROVE-WITH-NITS** — the one should-fix taken (the share/download error status now shows a distinct icon + neutral colour, not a green success check). **Flagged for Lazar / IqUp:** all new MK certificate copy is provisional → native-MK review; the **optional on-device child-name** field → IqUp legal/privacy review list (children's-name-adjacent, even though IqUp never processes it); the **licensed Bibi art** is still awaited (the certificate ships the placeholder + a one-line `BIBI_CERT_ART` drop-in). Independent calls #202–#209 in `Decisions.md`. See `Part-3-Phase-11-Completion.md`. **Branch `phase-3.11-certificate` — pushed, awaiting Lazar's yes to merge.** **(Note: phases 3.09 + 3.10 are now MERGED to `main` — git log `fbfda84` + `a6725d1`; the "awaiting Lazar's yes to merge" lines in the older entries below predate those merges.)** _Previous entry:_ **Phase 3.10 (Code): the PDF report + email delivery — a lead now receives something they keep.** The `// SEAM (3.10)` is wired: on submit, `submitAssessment` `after()`-schedules a fully-isolated **v2 report send** that renders a branded, bilingual **"IQ UP! cognitive profile" PDF** in memory and emails it via Brevo, then discards it (**never stored**). The PDF renders from the **SAME `buildReport(profile, {locale, city, generatedAt})`** the on-screen screen shows — the server recomputes the identical profile via `buildProfile(run)` from the completed `SessionRun`, passed on an **optional, transient `report` field** of the submit payload that touches **NEITHER store** (Store A's anonymous-score schema + the two-store unlinkability are unchanged; the run is request-scoped email input, discarded after send). **`src/lib/pdf/`** (`renderReportPdf` → a Node `Buffer` via `renderToBuffer`) builds the **3 A4 pages** of the 3.08 PDF surface: cover (branded header + title + age/generated/city meta + the **identity pentagon** reproduced 1:1 with react-pdf SVG from 3.09's exact geometry + the top-strength callout) → the **five colour-coded indices** (band **word** pill + confidence **word** + note) → narrative (overall profile = `overview` + `solvingStyle` · room-to-grow + activity · 2–3 home activities · STEM readiness + the coding/robotics **bridge** · IqUp positioning + matched **program** + the **clickable demo CTA carrying `?grad=`** · the disclaimer). **Montserrat (400/600/700/800, full Latin + Cyrillic)** is embedded from committed static TTFs (instanced from the variable font) — MK renders with **no tofu** (verified visually). A new **`src/emails/ReportEmail.tsx`** (React Email, mirroring 2.01 brand/layout) is the cover note — greeting → "profile attached" → a worded top-strength teaser → the demo CTA → the IqUp identity footer — **no number/IQ/%/score/rank, no child name**. The v2 send path **`src/lib/email/send-report-email.ts`** (`server-only`, isolation mirrors 2.01) gates by validity (**sends `valid` + `gentle_note`; skips + logs `not_representative`**), renders the PDF + email in memory, sends ONE transactional email via the existing `sendTransactionalEmail` (tags `['report-email', locale]`), **never throws**, and is a clean **logged no-op when `BREVO_API_KEY` is unset**. **Honest framing proven** by a non-vacuous forbidden-token + no-stray-digit scan over the rendered PDF model text AND the rendered email, both locales (the only digits are the child's **age** + the **generated date**); **determinism proven** (same `ReportContent` → same rendered text; the date formatter mirrors `ResultsScreen`, no `Date`/`Intl` on the content path). New **`ReportEmail` i18n namespace** (MK + EN exact parity, MK provisional) — the email CHROME only; the PDF's own chrome lives self-contained in `src/lib/pdf/pdf-copy.ts`; report CONTENT stays solely in `buildReport`. The report is **exactly 3 pages across the full content space** (verified: default, all-strong/all-floor, every solving style, both locales — `extremes` + decorative photo slots omitted, matching what neither surface shows; the page-3 narrative is tightened so the binding maximal case — 2 strong-pair sentences — still fits). **Frozen engine/scoring/validity/tasks/norms/report-engine + the 3.06 two-store writes/`submitAssessment` data logic untouched** (`git diff main --stat` = additive PDF/email/seam/i18n/env/state only). **Quality: typecheck + lint clean, `next build` green (route table unchanged — `/[locale]/report` now bundles the server send), `npm test` 670/670 (63 files) = 623 prior + 47 new (PDF content/determinism/binary, pentagon-geometry parity, email render, send-isolation/validity-gate, messages parity + forbidden-scan).** Verified in the real runtime: the `/report` route renders + reveals the form from a seeded run (MK + EN); the dev harness renders the 3-page PDF in both locales with clean Cyrillic; the **real send path logs `skipped-no-key` for both locales without throwing**. **Live delivery DEFERRED-pending-key** (this machine's `.env.local` is blank — set `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS` + `TEST_EMAIL_TO`, then `npm run test:report-email`). **Flagged for Lazar:** the matched-program names are real IqUp brand copy containing "Bibi & Bobi"/"Биби и Боби" as TEXT (not character artwork — the "no Bibi" rule targets imagery); the emailed PDF travels through Brevo's transactional pipeline (Brevo retention applies — add to the Part-2 legal review); MK copy provisional; the footer identity line is for IqUp legal; the demo-CTA host stays the `/trial` fallback until `NEXT_PUBLIC_BOOKING_URL` lands. Independent calls #194–#201 in `Decisions.md`. See `Part-3-Phase-10-Completion.md`. **Branch `phase-3.10-pdf-report-email` — awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.09 (Code): the on-screen results screen — the parent finally sees the profile.** The `// HANDOFF (3.09)` interstitial in the `/report` flow is replaced by the real **v2 results reveal** (MK at `/report`, EN at `/en/report`). After the form submits (or on a **refresh** that finds the persisted `iqup.leadContext.v2`), `ReportFlow` recomputes the profile client-side from `iqup.assessmentRun.v1`, calls the pure **`buildReport(profile, {locale, city, generatedAt})`** (3.07) — `city`/`generatedAt` from `leadContext.v2`, **no clock in the render path** — and renders **`ResultsScreen`** (a pure, presentational island). **Surface A per the 3.08 handover:** header (title + age/date meta over a band wave; the IqUp wordmark + MK/EN toggle stay in the global `SiteHeader`) · the **identity pentagon** (`IdentityPentagon` — a faithful port of the kit's `identityPentagon()`: the same whole five-kite, five-hue, magnitude-free shape & size for EVERY child — **never the 3.02 radar**) · the **five colour-coded index cards** (name + band **display WORD** pill + a confidence row = the confidence **WORD** + a non-numeric **3-pip** cue + `confidenceNote`; **no per-index "desc"** — that field doesn't exist in the real `ReportContent`, so the card consumes only real fields) · **top strength** · **what we noticed** (`overview.shape` + `pairs` + `solvingStyle`) · the **report-emailed** strip (presentational — `// SEAM (3.10)`, nothing sent yet) · the **violet demo CTA** · the **certificate entry** affordance (`// SEAM (3.11)` — no Bibi, no route) · the **disclaimer**. **Three validity states from `meta.validity`:** `valid` (normal) · `gentle_note` (a quieter inline note carrying the engine sentence) · `not_representative` (bespoke amber caveat + a **dimmed** pentagon + a single retry to `/test` that mirrors the 3.05 `RetryScreen`; in practice unreachable via the funnel — 3.05 routes that outcome to retry and never persists the run — so this state is defensive/PDF-parity/test-only). New **`bookingUrlFor(locale, cityKey)`** resolves the 3.07 `?grad` seam: `NEXT_PUBLIC_BOOKING_URL` else the localized `/trial`, always appending `?grad=<centre-id>` (stable slug, never a label) — **never a dead link**; documented in `.env.local.example` + `00_stack-and-config.md`. New **`Results` chrome i18n namespace** (MK + EN exact parity, MK provisional) — **chrome only**, report content stays in `buildReport`. The **v2 semantic token layer** the surfaces need (`--ix-*` ramps, `--action*`, `--band-*`, `--surface-2`, `--ink-head/-muted`, `--neutral`, `--line*`, `--r-*`, `--tap-comfort`, `--elev-*`, `--focus*`, `--dur-fast`) was lifted into `globals.css` (additive; `--ix-*`→`var(--iq-*)` keeps the official hues single-sourced; literals copied from the locked `tokens-v2.css`) plus the `.iq-results`-scoped component CSS. **Honest framing proven** (extended, non-vacuous forbidden-token scan over the **rendered** screen + the chrome, both locales × all three validity states — no number/%/score/IQ/rank/band-word/"level N"; the only digits are the child's age + the generation date). **Refresh re-reveals** results (no forced re-submit); direct access without a run still redirects to `/test`. **Frozen engine/scoring/validity/tasks/norms/report-engine + the 3.06 form/two-store writes/`submitAssessment` data logic untouched** (`git diff main --stat` = only additive results-screen work + env doc + i18n + two config edits). **Quality: typecheck + lint clean, `next build` green (21 routes, `/report` unchanged in the table), `npm test` 623/623 (59 files) = 596 prior + 27 new (6 `bookingUrlFor`, 19 results-screen/pentagon, 2 messages).** Verified end-to-end in the browser (autopilot → completion → form → submit → results, MK + EN): all five cards, top strength, what-we-noticed, the report-emailed strip, the demo CTA carrying `?grad=`, the certificate entry, the disclaimer, the identity pentagon; refresh re-reveals; mobile 375px no overflow; CTA 56px tap target; **no console errors**; **axe-clean both locales (16 passes, 0 violations)** after fixing one real AA contrast issue (the confidence label + disclaimer moved from `--ink-faint` 3.59:1 → `--ink-muted`). **The 3.08 design deliverables were landed on `main` first** (handover + `surfaces/` + `report-kit.js` + `tokens-v2.css` + mockups under `docs/design-handovers/`) so the dependency gate passed and the 3.09 diff stays additive. Fresh-context review: **no must-fix** (two a11y nits taken: caveat `role="status"`→`note`, dropped a misleading `aria-disabled` on the cert seam button). The PDF email (3.10), the certificate (3.11), and CAPI/GA4 (3.12) are left as seams — **nothing emailed / no Bibi / no tracking this phase**. Independent calls #185–#193 in `Decisions.md`; audit note in `Part-3-Phase-09-Audit.md`. See `Part-3-Phase-09-Completion.md`. **Branch `phase-3.09-results-screen` — awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.07 (Code): the report engine — deterministic report assembly.** The scores now become words. A new **content + logic** layer turns a finished `CognitiveProfile` (3.03) into the warm, parent-facing report the PDF (3.10) + on-screen results (3.09) will render — **no visual design, no PDF, no rendering** this phase. **`src/lib/report/`** exposes **`buildReport(profile, context) → ReportContent`**: **pure + deterministic** (same profile + same `context` → **byte-identical** output; **no clock** — the generated date is caller-supplied via `context.generatedAt` and day-level-truncated by string-slice, **no `Date`/`Math.random`**), **consuming `CognitiveProfile.features`** (profile shape · highest/lowest index · strong pairs · solving style · learning slope · ceiling/floor) **without recomputing any psychometric** — only presentational selection lives here (band→word, confidence→word, the learning-slope copy bucket, age→program, the all-strong/all-floor/ceiling/floor edge cases). The **`ReportContent`** contract (the seam 3.08 designs against): `meta` (age · locale · `normsVersion` · day-level date · validity treatment) · the **five `indices`** (parent name + band **display word** + confidence **word** + a plain-language confidence note) · `overview` (profile-shape + strong index-pair sentences) · `topStrength` · `growthArea` (kind framing + the **all-strong "next frontier"** and **all-floor gentle** variants) · 2–3 `homeActivities` · `solvingStyle` (observed + the kindly learning trajectory) · `stemReadiness` (+ the STEM **bridge** by variant) · `extremes` (positive ceiling / gentle floor) · `iqup` (positioning + **age→program** fit + demo CTA, **city carried**, booking-URL `?grad` left a documented `// SEAM`) · `disclaimer` (indicative-not-diagnostic + provisional-norms honesty). **`src/content/report/`** is the bilingual (**MK default + EN mirror, exact key parity, all MK PROVISIONAL**) module library: `bands` · `indices` · `narrative` (shape/pair/style/slope/extremes) · `stem` · `activities` (the home-activity bank keyed by **(index, age-cluster)**, ≥2 per cell) · `iqup` (the 4 in-scope programs + `AGE_TO_PROGRAM` 5–7→Magic Lab · 8–9→Magic Lab PLUS · 10–11→Oliver · 12–13→Oliver PLUS, **flagged for IqUp**) · `disclaimer` (+ validity notes). The 3.01 README placeholders in both folders are **replaced** with real docs (the scaffold's `mk·sr·hr·en` note corrected to the live MK+EN scope). **Honest framing holds (non-vacuously tested):** no digit/`%`/IQ/score/rank/"level N"/"below average"/"weak"/clinical-or-diagnostic token in any user-facing string MK **and** EN — the disclaimer alone may *negate* clinical/diagnostic terms (the required honest framing); bands only as the approved words, confidence only as high/medium/low + a note; **no child-name slot anywhere** (addresses "your child", gender-neutral MK); growth always kind. **Validity:** `valid` → clean report · `gentle_note` → a soft note · `not_representative` → a **clearly-caveated variant** (`caveated:true`; whether to send is the caller's call, 3.10). **Personalization proven** (varied profiles → near-total report uniqueness). **Frozen 3.03/3.04 layers untouched** (no tracked file modified — pure additions). **Quality: typecheck + lint clean, `next build` green (route table unchanged — pure libs, not yet wired), `npm test` 597/597 (57 files) = 572 prior + 25 new.** Fresh-context review: **APPROVE, no must-fix** (one MK typo `провер`→`проверка` fixed). Flagged for the parallel track: (a) the **age→program** mapping → IqUp to confirm; (b) the **disclaimer wording** → IqUp legal; (c) **all report MK copy** → native-MK reviewer. Independent calls #177–#184 in `Decisions.md`. See `Part-3-Phase-07-Completion.md`. **Branch `phase-3.07-report-engine` — awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.06 (Code): the parent form + the two-store data model — an anonymous test becomes a lead.** The assessment now has its lead-capture step: the completion badge's "continue to your report" (the resolved **`// HANDOFF (3.06)`** seam — `AssessmentFlow.onContinue` now `router.push('/report')`) lands on a new **`/report`** route (MK + EN, SSG shell + the **`ReportFlow`** client island). `ReportFlow` reads the persisted **`iqup.assessmentRun.v1`** (SSR-safe `useSyncExternalStore`, null server snapshot), **recomputes `buildProfile` CLIENT-SIDE** (results never depend on a server write), and renders the **parent form**: parent first name · email · phone · city (dropdown over the 10 `centers.ts` centres) · child gender (**optional**) · **three separate, none-pre-ticked consents** (process + guardian **required**, marketing **optional**) · an off-screen honeypot — **no child-name field anywhere**. On submit it builds two payloads sharing no key and calls a `'use server'` action (**`submitAssessment`**): honeypot first (filled → success-shaped, **no writes**) → re-validate the lead → **Store A** anonymous-score write via `after()` (isolated, non-blocking) + **Store B** Brevo lead upsert inline (isolated, **primary but non-trapping**; on failure logs the full lead, `// TODO(durability 3.16)`). **Results reveal even if either write fails**; it persists **`iqup.leadContext.v2`** (`{parentFirstName, city, submittedAt}` — no email/scores) and lands on a **minimal interstitial** that **3.09** replaces (`// HANDOFF (3.09)`; `// SEAM (3.10)` PDF email, `// SEAM (3.12)` CAPI/GA4 noted). **Store A** = a new **`assessment_scores`** table (migration `20260623120000`): age/gender/city/language + **8 signals + 5 indices** (`double precision` 0–100) + validity + norms_version + a **day-level `created_date DATE`**; **no PII**; **RLS on, no anon policies, anon grants revoked, service-role write only** (mirrors v1 `leads`); a new `server-only` helper writes it behind a `.strict()` zod schema that **rejects PII-shaped fields**; the row **id is never returned**. **Store B** = the v2 Brevo attributes (`PARENT_FIRST_NAME`/`PHONE`/`CITY`/`CHILD_AGE`/`CHILD_GENDER` (omit-when-null)/`LOCALE`/`CONSENT_PROCESS`/`CONSENT_GUARDIAN`/`MARKETING_OPT_IN`/`CONSENT_VERSION='v2-draft-2026-06'`/`TOP_INDEX` (single coarse English label)/`SOURCE='website-assessment'`); **operational list always, marketing list iff opt-in**; logged no-op when `BREVO_API_KEY` unset; the Brevo id **discarded**. **Unlinkability proven by test** (the two payloads share no unique key — only the coarse `city` bucket; day-level date; Brevo id discarded; anon payload PII-free). New **`Form`** i18n namespace (MK + EN exact parity, **MK provisional**). **v1 stays orphaned** (`EmailGate` not mounted, `insertLead` not called, v1 `leads` not dropped); **frozen engine/scoring/validity/tasks/norms untouched** (`git diff main --stat`). **Quality: typecheck + lint clean, `next build` green (21 routes; `/report` SSG, `robots:noindex`), `npm test` 572/572 (55 files) = 527 prior + 45 new.** Verified end-to-end in the browser (autopilot → completion → `/report` form MK + EN; validation focuses the first invalid field; a real submit reached the interstitial, persisted `leadContext.v2`, no PII in URL; Brevo logged `skipped-no-key`, Store A failed-isolated on the blank-template env and the parent still revealed; mobile 375px no overflow, ≥44px targets, no console errors). **Live Supabase + Brevo verification DEFERRED-pending-keys** (this machine's `.env.local` is the blank template; apply the migration via `npm run db:push` or the dashboard, then `npm run test:scores`). **Fresh-context review: GO, no blockers** (3 low nits → MK gender-label copy + privacyNote wording flagged for IqUp; MK forbidden-token stems added to the test). Independent calls #165–#176 in `Decisions.md`. See `Part-3-Phase-06-Completion.md`. **Branch `phase-3.06-form-data-model` — awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.05 (Code): the live assessment flow + task screens — the centerpiece comes alive.** The invisible 3.03 engine + 3.04 item bank now have a real, on-brand UI at **`/test`** (both locales), superseding the v1 `TestRunner` (v1 components + `/result`/gate/email left **intact but orphaned**, not deleted). New module **`src/components/assessment/`**: an orchestrator (`useAssessment`) drives `createDomainController` across the seven domains in order, injects `createTaskItemProvider()` in place of `fixtures.ts`, threads silent telemetry into each engine `Response`, and at session end assembles the `SessionRun`, runs the 3.03 validity functions over it, and persists a versioned hand-off (`iqup.assessmentRun.v1`, **no PII, never in the URL**) behind a clearly-marked **`// HANDOFF (3.06)`** seam (no form/Supabase/Brevo/results work). Flow: **age setup** (5–13, **no child name**) → **5–7 parent-assist** gate (technical-help-only + checkbox; 8+ solo) → per domain **practice** (`getPracticeItem`, the **first practice captures the device tap-baseline** via a median-of-5 calibration) → **one task at a time** → **completion + the "IQ UP! Explorer" badge**. All **seven task types render from `TaskSpec.interaction`** (Gf matrix/series + Gv rotation + CT loop/conditional = `select-one`; Gsm Corsi = `tap-sequence` show→hide→repeat with a reduced-motion manual path; Gs symbol-search = `multi-tap-timed`, **the only visible countdown**; EF Tower of London = `move-balls`; Glr paired-associate = `match-pairs`; CT sequence/maze = `order-steps`, debug = `tap-error`) — built off shared primitives (TaskFrame, SelectOneGrid, TapField, the bespoke-SVG Glyph vocabulary). The **puzzle-brain progress** assembles 5 index-region pentagon pieces (Logical←Gf · Spatial←Gv · Memory←Gsm · Planning←EF+Gs · Learning←CT+Glr), each filling with its brand hue + a check tab when all its domains complete — **no number / "N of M" / % / score anywhere**. Validity at end: **mild → gentle note** on completion; **strong → not-representative + working retry** (fresh seed → fresh item set). New **`Assessment` i18n namespace** (MK+EN exact parity, MK provisional) with per-`taskType` instructions + chrome. **No Bibi/characters** in the flow (badge is bespoke SVG). Telemetry captured: response time, idle/blur, selectedPosition (select-one only), Gs tappedCells, omissions, device baseline — `buildProfile(SessionRun)` runs clean on the assembled run (smoke). **Determinism:** `prng.ts`/crypto only, no `Math.random`; same age+seed+answers → byte-identical `SessionRun` (asserted). **A latent Phase 3.01 `globals.css` defect was fixed**: a long `=`-banner comment truncated the dev CSS parse, silently dropping every v2 brand token in `next dev` (prod was fine) — the whole v2 palette is now styled in dev too. **Quality: typecheck + lint clean, `next build` green (19 routes; `/test` dynamic), `npm test` 527/527 (50 files) = 514 prior + 13 new flow tests; v1 suites still green.** Verified end-to-end in the browser (setup → calibration → all 7 renderers via dev autopilot → badge; hand-off persisted with all 7 domains + `valid` outcome). Independent calls #155–#164 in `Decisions.md`; **Gate B was waived by the operator** — the 3.02 design handover does not exist, so the design was derived from `brand.md` §6 + `plan.md` (flagged: reconcile if a real 3.02 handover lands). See `Part-3-Phase-05-Completion.md`. **Branch `phase-3.05-assessment-flow` — awaiting Lazar's yes to merge.** _Previous entry:_ **Phase 3.04 (Code): the procedural item bank — the seven real task generators.** The 3.03 engine was running on fixtures; this phase ships the **real questions**, generated by code, as typed **language-neutral DATA** (no rendering — that's 3.05). **`src/content/tasks/`**: one procedural generator per generated domain — **Gf** (3×3 matrices + number series), **Gv** (mental rotation, polyomino), **Gsm** (Corsi span, forward/backward by age), **Gs** (timed symbol search), **EF** (Tower of London, BFS-exact min-moves), **Glr** (paired-associate, multi-attempt learning block), **CT** (5 sub-types: sequence/debug/loop/conditional/maze). (No verbal generator — deferred; **attention has no generator** — derived in scoring.) A **`TaskItemProvider`** (`createTaskItemProvider()`) implements the engine's `ItemProvider` + adds `getPracticeItem(domain)` — the production source 3.05 injects into `createDomainController` in place of `fixtures.ts` (**fixtures kept** for the engine's own tests). Every item carries a **typed content spec** (`TaskSpec`, discriminated by `taskType`) + the **`interaction` model as data** + a separated **`solution`** + a **`judge`** + the **exact `ItemScoringMeta`** v2 scoring reads (`spanLength`/`cellCount`/`targetCount`/`minMoves`/`attempt`/`optionCount`); `judge` returns `credit` net of penalty (#141). **Determinism end-to-end:** `prng.ts` only — **no `Math.random()`** (asserted by a source scan); the headline integration test drives a full session through the engine + real provider + v2 scoring and gets a **byte-identical `SessionRun` + `CognitiveProfile`** across two runs; different seeds → different item sets (new sets on retest). **`ItemFormat` honored** (Gsm forward-only <8, forward+backward ≥8). The **Glr multi-attempt** need is met with a **WeakMap-memoized learning block** keyed by the per-domain rng — the **one documented exception** to the pure-function contract, with **no engine/scoring/seam change** (the existing `meta.attempt` feeds `learningSlope`). **No forbidden tokens** (score/IQ/%/rank/"level N") in any content. **Quality: typecheck + lint clean, `next build` green (route table unchanged — pure content lib, not yet wired to a page), `npm test` 514/514 (49 files) = 420 prior + 94 new.** Fresh-context review: **PASS, no blockers**. Independent calls #143–#154 in `Decisions.md`; PROVISIONAL parameters (the per-level difficulty maps the spec underspecifies) flagged inline for the pilot/psychologist review. See `Part-3-Phase-04-Completion.md`. **Branch `phase-3.04-item-bank` pushed, NOT merged — awaiting Lazar's yes.** _Previous entry:_ **Phase 3.03 (Code): the v2 adaptive engine + scoring + validity (the deterministic logic layer).** Pure logic, **no UI / no item content / no persistence / no copy** — and **additive: all v1 scoring/engine/results code is untouched and every existing test still passes.** Built faithfully from the canonical `IQ UP Specifikacija v1.2 FINAL.pdf` (Дел 3/4/5/6/7/8 + Прилог A/B). **Seeded PRNG** (`src/lib/engine/prng.ts`) — **mulberry32** + xmur3 string hash + per-domain `deriveSeed` (independent streams) + `nextInt`/`pick`/`shuffle`; **no `Math.random()` anywhere on the path**; the same utility 3.04's generators will import. **Input seam** (`engine/types.ts`) — `Item`/`ItemProvider`/`Response`(+`ItemScoringMeta`) for 3.04. **Adaptive engine** (`engine/engine.ts`) — basal/ceiling per domain: start level by **exact age** (the spec's Gf curve 5→1…13→8, applied to all domains, PROVISIONAL for non-Gf), correct→up / error→down, **discontinue at 2 consecutive errors** or the per-domain cap (Gf/Gv 6, others 5, **+1 for the 10–13 extended battery**), **age-cluster format** (Gsm forward-only <8, forward+backward ≥8); exposed as a step-by-step `createDomainController` (for 3.05's live UI) **and** pure `runDomain`/`runSession` drivers (tests); emits a `SessionRun`. **Fixture providers + responders** (`engine/fixtures.ts`, shipped for 3.04 reuse). **v2 scoring** (`src/lib/scoring/v2/` — kept under `v2/` so **v1 stays separate & green**): `buildProfile(SessionRun)` → the **`CognitiveProfile`** output seam — per-domain raw → **per-exact-age 0–100** indices (Прилог B.2, clamp [8,99], 50=typical) → the **8 signals** (Gf, Gv, Gsm, Gs, **derived attention**, EF, Glr, CT; timing **calibration-relative** via a passed-in device baseline) → the **5 composite indices** (exact spec weights: Logical=Gf · Spatial=Gv · Memory&focus=0.7·Gsm+0.3·attention · Planning&speed=0.6·EF+0.4·Gs · Learning&STEM=0.5·CT+0.5·Glr) → **bands** (stable enum ≥80/64–79/45–63/<45, **no display words**) → **confidence** (high/med/low; index = weakest contributing signal) → **derived structural features** (profile shape, index pairs, solving style, memory asymmetry, learning slope, ceiling/floor) + the **validity outcome** + session/version metadata. **Validity** (`src/lib/validity/`, pure functions) — the 5 flags (too-fast / same-position / idle / chance-level / Gs-smearing), the **derived attention** signal (`1 − normVariability − impulsiveRate`, calibration-relative), and the **graduated-outcome policy** (mild → `gentle_note`; strong → `not_representative`/retry); **telemetry capture + retry UI explicitly left to 3.05**. **Seed norms** (`src/content/norms/index.ts`, **PROVISIONAL**, `NORMS_VERSION='seed-2026-06-PROVISIONAL'`) — start levels, span norms (B.1, range-midpoints), B.2 coefficients, band cutoffs, caps+ceiling, and the threshold sets the spec leaves as *method only* (confidence, validity, features, the per-age **speed expectation** + calibration reference) — all flagged for the recommended psychologist review. **Determinism proven:** fixed (age, seed, responses) → byte-identical path + identical `CognitiveProfile`; different seeds change the path; domain order is independent. **Hard invariants tested:** time is never a penalty off Gs; ceiling/floor stay in-range & NaN-free; the module **renders no user-facing number/%/IQ/rank string** (raw 0–100 carried internally for Store A + bands + pentagon). **Quality: typecheck + lint clean, `next build` green (route table unchanged — the engine/scoring are pure libs not yet wired to a page), `npm test` 420/420 (40 files) = 292 pre-existing + 128 new.** Fresh-context spec-invariant review: **PASS-WITH-NITS, no blockers** (two nits fixed — attention zero-baseline fallback, floor-extreme comment). Independent calls #130–#142 in `Decisions.md`; see `Part-3-Phase-03-Completion.md`. **Branch `phase-3.03-engine-scoring` pushed, NOT merged — awaiting Lazar's yes.** _Previous entry:_ **Phase 3.01 (Code): the repo onto v2 footing.** The first phase of **Part 3 (the v2 rebuild)** — a **foundation phase only, no feature logic**. The canonical docs are now v2: **`plan.md` is rewritten as the v2 master spec** — the adaptive **cognitive + STEM assessment** for ages **5–13** (**8 internal signals → 5 parent-facing indices**: Logical · Spatial · Memory & focus · Planning & speed · Learning & STEM; an **adaptive basal/ceiling engine**, **fully deterministic, no AI at runtime**; results as **bands + a pentagon + confidence labels, never a score/%/IQ/rank**; two deliverables — a **server-side PDF report** (emailed, **not stored**) + a **shareable Bibi certificate**; **two unlinkable data stores** — anonymous scores in Supabase + leads in Brevo; Meta **CAPI** server-side) — **derived faithfully from the canonical `IQ UP Specifikacija v1.2` PDF** (no ready-made v2 markdown existed; Lazar's spec is the ground truth). **`brand.md` §6 is updated DRAFT→CONFIRMED** (official palette `#EC008C`…`#999999`, **Montserrat**, the puzzle-brain motif, design-token scales). **`CLAUDE.md` + `AGENTS.md` updated to v2** (product/architecture; **all process rules kept**). The confirmed **brand primitives are wired into code, additive & non-breaking**: **Montserrat** via `next/font` (Cyrillic+Latin) + the **official palette/index hues + radius (card 14/18, badge 30) + spacing (4–32) + ≥44px tap** tokens added to `globals.css` — **every v1 token left in place** (Rubik/Nunito, the yellow `--primary`, the `--strength-`/`--chart-` sets), so the v1 UI renders **unchanged** and migrates component-by-component later. **`@react-pdf/renderer@4.5.1` added + smoke-tested on React 19** (valid PDF); **no charting library** (pentagon = custom SVG). The v2 **engine/report folder skeleton** is scaffolded (READMEs only): `src/lib/{engine,validity,report,pdf}` + `src/content/{tasks,norms,report}`. The stray v1 Vercel-deploy handoff doc was deleted. **Quality all green & unchanged: typecheck + lint clean, 292 vitest (28 files), `next build` green (route table identical).** No schema/route/i18n change. Net-new v2 env var noted (not yet wired): **`META_CAPI_ACCESS_TOKEN`**. **`phase-plan.md` is still v1 — pending the v2 phase plan** (Chat writes it). See `Part-3-Phase-01-Completion.md` (and the v1→v2 inventory in `Part-3-Phase-00-Completion.md`). _Previous entry:_ **Phase 2.05 (Code): the real trial-booking mechanic.** The trial CTA now has a working endpoint. A single shared **`TrialBooking`** client component (native city `<select>`, no geolocation → chosen centre + one-tap **Call / Email (name-free `mailto:`) / Get directions (verified-or-derived Maps search link) / optional Viber-WhatsApp**, AA-accessible, PII-free consent-gated `trial_cta_click`) is reused by **two surfaces**: a new public bilingual **`/trial` (+ `/en/trial`)** SSG page (in the locale layout, name-free, per-locale metadata + canonical/hreflang + generic name-free OG, slug `// TODO(mk-slug)`) and the **result screen** (bands 3–5 / 6–9, inline — old `// TODO(booking 2.05)` picker/seam removed; band 10–13 untouched). Every trial CTA now resolves from **one** `trialBookingUrl(locale, utmCampaign?)` helper (`site-url.ts`): the results email + the three trial nurture emails (`welcome-trial`/`trial-invite`/`nudge`) point at `/trial` (`welcome-general` keeps its general site-root link). `centers.ts` stays the single source — additive only (optional **unset** `viber?`/`whatsapp?`, derived Maps search via `mapsUrlFor`, no value changes, PROVISIONAL kept). New `Trial` i18n namespace (exact MK/EN parity, MK provisional). **Contact-only — no new PII / Supabase write / Brevo call / schema change / processor / dependency.** Deliberate test changes (flagged): `ResultsEmailProps.siteUrl` → `trialUrl` + the trial-URL assertions now target `/trial`. A latent 1.10 AA contrast defect (chosen-centre contact line, 3.39:1) was exposed by the new `/trial` selected-state axe scan and fixed (`text-ink-soft`). Quality: **292 vitest** (28 files) + build/lint/typecheck clean; `/trial` axe-clean both locales (empty + selected); fresh-context review **PASS** (no blockers). Booking link host is the dev placeholder until 2.06; centre data + Viber/WhatsApp + exact pins + MK slug pending. See `Part-2-Phase-05-Code-Completion.md`. _Previous entry:_ **Phase 2.04 (Code half): analytics, tracking & a GDPR-grade consent layer + the bilingual `/privacy` page.** The funnel is now measurable **with consent**, the honest way: a custom, first-party, **deny-by-default cookie-consent system** (accessible bottom banner — equal-weight **Accept all / Reject / Manage** — + a Radix Manage dialog with per-category toggles **un-pre-ticked by default**, backed by the first-party `iqup_consent` cookie `COOKIE_CONSENT_VERSION='cookies-v1-2026-06'`, ~6-month Lax/Secure, re-openable from the footer **and** `/privacy`), three **consent-gated trackers** (GA4 + Microsoft Clarity behind the **Analytics** category; Meta Pixel behind **Marketing**) that **load nothing and set no cookie until their category is granted** and are a clean **no-op when their `NEXT_PUBLIC_*` id is unset**, a PII-free **`track()`** helper (sanitised to `{band, locale, path}`) wired into four funnel seams (`test_start`/`test_complete`/`generate_lead`+Pixel `Lead`/`trial_cta_click`) + `page_view` on client navigation (via `usePathname()`, never `useSearchParams()`), and the site's first **`/privacy` (+ `/en/privacy`)** page (SSG, bilingual structured content + a real cookie table, a provisional GDPR baseline flagged for IqUp legal). The cookie/tracking consent is **entirely separate** from the lead's parental consent — no coupling, rename, or re-version. The **lead pipeline, emails, CRM, notification, and Supabase schema are untouched.** Quality bars: `build`/`lint`/`typecheck` clean; **289 vitest** (28 files); **28 Playwright consent e2e** (the headline network-assertion proof: zero tracker requests before consent on landing/`/test`/`/privacy` both locales, all three load on Accept, nothing on Reject); mobile Lighthouse A11y/BP/SEO **100** on every surface incl. `/privacy` (mobile Perf 91/93/92 landing/en/privacy; `/test` 86–88 — the documented noise-dominated mobile-Perf metric, re-measure on Vercel in 2.06); desktop **100** across the board; fresh-context review **PASS** (its one should-fix — Accept/Reject equal salience — fixed). Live tracker verification is **deferred-pending-Cowork** (the three account ids). Live delivery is **deferred-pending-config**. _Previous entry:_ **new-machine checkpoint** (verification + doc reconciliation only, no product code changed): the build was re-verified green on macOS after the project moved from Windows (`C:\Users\user\Desktop\iqup-web`) to macOS (`~/Projects/iqup-web`), and the project-state docs (`phase-plan.md`, this file, `file-map.md`) were reconciled to the live repo. Verbatim results: **258/258 vitest tests pass** (24 files), typecheck clean, lint clean, production `next build` green (13/13 pages); MK/EN i18n parity perfect (139 keys each). The `@axe-core/playwright` WCAG 2.2 AA suite needs Playwright's Chromium binary installed first (`npx playwright install chromium` — a one-time per-machine step); with that done, 16/26 scans pass and **10 are timing-flaky on this faster machine** — axe scans mid-`animate-in` entrance fade and reads the strength chips' settled-fine tokens composited at ~36% opacity (a transient false-positive `color-contrast`, NOT a shipped defect: a 700 ms settle-wait makes all 26 pass). Logged as a **finding** for Lazar (Decisions.md #107) with a recommended `scan()` settle-wait fix — left unfixed here because altering tests is out of scope this pass. See `Part-2-Checkpoint-Verify-Reconcile-Completion.md`. _The last feature phase remains Phase 2.03 (follow-up nurture emails — Code half)._ The lead lifecycle's final content piece now exists as version-controlled, bilingual **nurture email templates** — a warm welcome (trial + general) and two gentle trial nudges (trial band) — authored as React Email components that **reuse the 2.01 brand/layout**, personalised purely by **Brevo merge tags** (child first name with a graceful fallback; age/locale are branch conditions only — nothing new collected or stored) and rendered to **8 static HTML files** (`docs/email-templates/Part-2-Phase-03-nurture/`) the Cowork half loads into Brevo. No certificate attached; no new route/dependency/schema; **258 tests** green; route table unchanged. The app funnel is unchanged. Previously, after Phase 2.02 (CRM contact routing + new-lead notification): the instant a lead saves, the same isolated `after()` work now fans out **three** side-effects: the 2.01 results email, **a Brevo Contacts upsert** (the parent becomes a CRM contact by email, on an operational "all leads" list always + a marketing/nurture list **only on `marketing_opt_in`**), and **an internal new-lead notification** to IqUp's team — each fully isolated (any one failing/slow/unconfigured can never break the save, the redirect, or the others), and each a logged no-op until its Brevo env lands. Nothing stored changed (no schema/column, no Brevo id persisted — Supabase stays the system of record). Live delivery is **deferred-pending-config** (build/typecheck/lint/test all verified; 190 tests). _(Previously: after Phase 2.01 — the funnel reached the parent's inbox with a warm bilingual results email + attached certificate via Brevo, deferred-pending-key. After Phase 1.11 — Part 1 complete: the whole funnel land → test → gate → lead saved → strengths profile + certificate, with a WCAG 2.2 AA pass, a median-of-5 Lighthouse sweep, and a cross-device matrix.)_

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
- `src/app/[locale]/test/page.tsx` — the **v2 assessment** (phase 3.05): a Server Component shell that
  reads `?age=N`, resolves the whole `Assessment` copy server-side, and mounts the `AssessmentFlow`
  client island (age setup → parent-assist → practice/calibration → the seven adaptive task domains →
  completion + the Explorer badge; validity-gated retry; the `// HANDOFF (3.06)` persistence seam).
  Per-locale `generateMetadata`. **Dynamic route** (reads searchParams). Supersedes the v1 `TestRunner`,
  which is left intact but no longer mounted (v1 `/result`/gate/email kept until 3.06/3.09/3.10).
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

## Item bank — procedural task generators (phase 3.04 — Code)

- **`src/content/tasks/`** — seven generators producing typed, **language-neutral** item DATA (no UI):
  `gf.ts` (matrices + number series), `gv.ts` (mental rotation), `gsm.ts` (Corsi span), `gs.ts` (timed
  symbol search), `ef.ts` (Tower of London + BFS solver), `glr.ts` (paired-associate), `ct.ts` (5 CT
  sub-types). Each exports `generate<Domain>(level, format, rng): Item` + `practice<Domain>(): Item`.
- **`provider.ts`** — `createTaskItemProvider()` → the engine's `ItemProvider` + `getPracticeItem(domain)`;
  the production source 3.05 injects into `createDomainController`. `fixtures.ts` kept for engine tests.
- **`types.ts`** — the `TaskSpec` discriminated union (the 3.05 rendering contract): every `payload`
  carries `taskType` + `interaction` (input model as data) + a separated `solution` + the v2 scoring
  `meta`. **`glyphs.ts`** token catalogs + polyomino geometry; **`shared.ts`** id builder + the generic
  `correctAnswerFor`/`wrongAnswerFor` oracle (keyed off `interaction.mode`); **`index.ts`** the barrel;
  **`README.md`** documents the seam + determinism + the PROVISIONAL parameter list.
- **Determinism + scoring-meta fidelity proven:** `prng.ts` only (no `Math.random()`, asserted);
  byte-identical `SessionRun` + `CognitiveProfile` across two runs (`integration.test.ts`); each `meta`
  is exactly what `scoring/v2` + `validity` read. **94 new tests** (514 total). Glr uses a WeakMap
  learning block (the one documented pure-function exception; no seam change). PROVISIONAL per-level
  difficulty maps flagged inline + in `Decisions.md` #143–#154.

## Report engine — deterministic report assembly (phase 3.07 — Code)

- **`src/lib/report/`** — the pure, deterministic assembly (no AI, no UI, no PDF):
  - **`types.ts`** — the **`ReportContent`** output contract (the seam 3.08 designs against / 3.09 + 3.10
    render) + **`ReportContext`** (`{locale, city, gender?, generatedAt?}`; age comes from the profile).
  - **`select.ts`** — the pure presentational selection: `growthVariant` (standard / all_strong / all_floor),
    `learningBucket` (the PROVISIONAL Glr-slope copy buckets), `stemBridgeVariant`, `indexPairVariant`,
    `activityIndices` + `selectActivities` (seed-rotated draw from the bank), `dayLevel` (ISO→`YYYY-MM-DD`
    by string-slice, **never constructs a `Date`**). Reads `CognitiveProfile.features`; recomputes nothing.
  - **`assemble.ts`** — **`buildReport(profile, context)`**: features → fired modules → the assembled
    `ReportContent`. Maps band→word, confidence→word+note, age→program; handles validity + edge cases;
    fills `{program}`/`{index}` slots; leaves the booking URL a `// SEAM (booking URL)`.
  - **`index.ts`** barrel; **`report.test.ts`** (determinism byte-for-byte, forbidden-token scan over the
    assembled prose MK+EN, approved-words-only, no placeholder leak, all-strong/all-floor/ceiling/floor,
    validity, age→program coverage, personalization diversity); **`README.md`** rewritten.
- **`src/content/report/`** — the bilingual (MK default + EN mirror, exact key parity, **all MK PROVISIONAL**)
  module library: **`bands.ts`** (band display words + confidence words/notes), **`indices.ts`** (per-index
  name/strength/growth/activity + the next-frontier & gentle-floor variants), **`narrative.ts`**
  (profile-shape · index-pair · solving-style · learning-slope · extremes), **`stem.ts`** (STEM intro +
  bridge variants), **`activities.ts`** (the **(index, age-cluster)** home-activity bank, ≥2 per cell),
  **`iqup.ts`** (the 4 in-scope programs + `AGE_TO_PROGRAM` + `programForAge` + positioning/program-fit/CTA),
  **`disclaimer.ts`** (indicative-not-diagnostic + provisional-norms + validity notes), **`types.ts`** +
  **`index.ts`** + **`report-content.test.ts`** (MK/EN parity + non-vacuous forbidden-token + coverage +
  age→program) + **`README.md`** rewritten. **25 new tests** (597 total). Consumes the frozen 3.03
  `CognitiveProfile`; touches no frozen file. PROVISIONAL: the age→program partition, the learning-slope
  thresholds, the disclaimer wording, and all MK copy — flagged in `Decisions.md` #177–#184.

## On-screen results screen (phase 3.09 — Code)

- **The `/report` flow now reveals the real v2 results** (replacing the 3.06 interstitial). New
  presentational components in `src/components/report/`:
  - **`ResultsScreen.tsx`** — Surface A (handover §2): header (title + age/date meta + wave) · identity
    pentagon · five colour-coded index cards (band WORD pill + confidence WORD + 3-pip cue + note) ·
    top strength · what-we-noticed · report-emailed strip (`// SEAM (3.10)`) · violet demo CTA ·
    certificate entry (`// SEAM (3.11)`) · disclaimer. Pure (props: `report`/`copy`/`locale`/`bookingUrl`),
    no storage/hooks/`Date` → renders under Vitest's Node env. `formatGeneratedDate` is a deterministic
    `YYYY-MM-DD` → "23 June 2026" formatter (static month tables, no `Date`/`Intl`).
  - **`IdentityPentagon.tsx`** — a faithful React/SVG port of the kit's `identityPentagon()` (viewBox
    410×360, cx 205, cy 176, R 110, angles −90/−18/54/126/198; five kites + white seams + ink outline;
    `dim` lowers wedge opacity for the caveated read). The SAME shape & size for every child (identity,
    not magnitude); fills with `var(--ix-*)`; filter-free so it drops into `@react-pdf/renderer` (3.10).
  - **`index-meta.ts`** — `INDEX_META`/`INDEX_ORDER` keyed by the real `IndexId` (`logical`/`spatial`/
    `memory_focus`/`planning_speed`/`learning_stem`) → angle, hue slug, short label (MK/EN), card glyph.
  - **`results-copy.ts`** — the `ResultsCopy` chrome contract (resolved in `report/page.tsx` from the
    `Results` namespace; `{age}`/`{date}` read raw + interpolated in the island).
- **`ReportFlow.tsx`** wires it at the seam: reads `iqup.leadContext.v2` (refresh-safe via
  `useSyncExternalStore`), reveals results on `submittedCtx ?? persistedLead`, calls `buildReport` +
  `bookingUrlFor`, leaves `// SEAM (3.10)/(3.11)/(3.12)`. The form + `submitAssessment` data logic is
  unchanged except the reveal.
- **`bookingUrlFor(locale, cityKey)`** in `src/lib/email/site-url.ts` — `NEXT_PUBLIC_BOOKING_URL` else
  localized `/trial`, always `?grad=<centre-id>`. New env var documented.
- **Tokens:** the 3.02 v2 semantic layer (`--ix-*` ramps, `--action*`, `--band-*`, `--surface-2`,
  `--ink-head/-muted`, `--neutral`, `--line*`, `--r-*`, `--tap-comfort`, `--elev-*`, `--focus*`,
  `--dur-fast`) + the `.iq-results` component CSS were added to `globals.css` (additive; `--ix-*`→`--iq-*`).
- **i18n:** new `Results` chrome namespace (MK + EN parity, MK provisional). **Tests:** `results-screen.test.tsx`
  (rendered-screen forbidden-token scan both locales × 3 validity states, validity rendering, CTA `?grad=`,
  pentagon identity), `site-url.test.ts` (`bookingUrlFor`), `messages.test.ts` (Results parity + forbidden).
  **27 new tests (623 total).** Touches no frozen layer; v1 `/result` untouched.

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

`public/bibi/` (licensed Bibi art — still awaiting; `HeroArt` and the certificate's `BIBI_CERT_ART` placeholder stand in until it lands), `public/og/` (no static OG needed — the OG image is dynamic). (`src/content/results/`, `src/lib/supabase/`, `src/content/test/`, `src/lib/scoring/`, `src/content/tasks/` (now the real item bank, 3.04), `src/lib/engine/`, `src/lib/validity/`, `src/content/norms/`, `src/lib/report/` + `src/content/report/` (now the real report engine, 3.07), and `docs/design-handovers/` now hold real files.) Still awaiting content: `src/lib/pdf/`.

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

**3.04 — the procedural item bank — DONE** (this phase): the seven generators + the `TaskItemProvider`
are the production item source, proven to plug into the 3.03 engine + scoring deterministically (byte-identical
`SessionRun` + `CognitiveProfile`). Next: **3.05 — the live assessment flow + task screens.** 3.05 injects
`createTaskItemProvider()` into `createDomainController`, renders each `TaskSpec` (per its `taskType` +
`interaction`) against the 3.02 design, captures the telemetry the validity/scoring layers consume
(response time, idle/blur, selected position, Gs tapped-cell count, the device tap-baseline from a practice
task), enforces the Gsm reveal timing + the Gs visible countdown, shows the practice screen
(`getPracticeItem`), and wires the per-`taskType` localized instruction copy (i18n). The 3.04 README is the
seam doc for it.

_Earlier:_ **2.05 — the real trial booking — DONE**: the result screen + the results email + the three
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
