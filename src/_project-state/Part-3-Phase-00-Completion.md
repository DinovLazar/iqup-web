# Part 3 · Phase 00 — Current-Build Audit (v2 transition) · Completion Report

**Type:** Read-only audit · **Branch:** `part-3.00-audit` · **Date:** 2026-06-21
**Repo state at audit:** local **level with `origin/main`** (0 ahead / 0 behind, not diverged). One untracked file present — `src/_project-state/Part-2-Phase-06-Cowork-HANDOFF.md` (a benign Vercel-deploy handoff note, no code, no secrets) — left untouched per Lazar's instruction. **No code/config/content/doc was changed; this report is the only new file.**

> Method: 6 parallel read-only sub-agents across the 18 areas, synthesised here. The live code is the source of truth.

---

## ⭐ Headline summary

**Rough split:** the build divides cleanly into a **plumbing/shell half that largely survives (~55%)** and an **assessment-core half that gets rebuilt (~45%)**.

- **Carries over (TRANSFERS / light MODIFY):** the whole infrastructure spine — Next 16 + React 19 + Tailwind v4 scaffold, the next-intl bilingual shell (MK-at-root / EN-at-`/en/`, leaf-level parity enforced by test), the page/route shells, the Supabase client split (anon + service-role), the Brevo REST transport + email-send orchestration patterns, the cookie-consent engine (deny-by-default, GDPR-sound), the GA4/Clarity loaders, the certificate **rendering architecture** (dual client `html-to-image` + server Satori), the contrast utility, and the durable test harness (i18n parity, consent, fixtures).
- **Gets rebuilt (REBUILD / heavy MODIFY):** everything downstream of "what the test actually is." The v1 engine is a **fixed, linear, per-band question array**; the v1 scoring is a **6-strength ratio model**; v2 is **adaptive**. That single change cascades through engine → scoring → content/item-bank → results visualization → data model → results email content.

**The 8 biggest-ticket rebuild items, in rough priority order:**

1. **Adaptive test engine** — replace `TestRunner.tsx` (3-phase linear state machine over a fixed array) with an adaptive runner: item selection, running ability estimation, stopping rule, likely async item fetch. *(REBUILD)*
2. **Scoring model** — replace `lib/scoring/score.ts` + `reconstruct.ts` (ratio → tier ranking) with the v2 model (IRT-style or rule-based-adaptive). *(REBUILD/DISCARD)*
3. **Item bank / content** — today's **36 hand-authored items** (10/12/14 across 3 bands) are far too few for an adaptive pool; needs a new authoring sprint + per-item difficulty/discrimination params. The **schema, taxonomy, and bilingual glyph/visual library transfer.** *(MODIFY schema, REBUILD content)*
4. **Results visualization** — there is **no chart in v1**; the "constellation" is badge/chip UI. v2's pentagon/radar needs a charting approach **added from scratch** (+ a library). *(REBUILD)*
5. **Data model** — Supabase pivots to an **anonymous-scores store**; the v1 `leads` PII table is a schema REBUILD. The **client/server connection setup TRANSFERS.** *(REBUILD schema, TRANSFERS setup)*
6. **Design token swap** — Rubik/Nunito → **Montserrat**, palette → official palette, plus a **"two-mood" system that does not exist yet** (current build is light-only, dark deliberately neutered). Centralised in one file (`globals.css`), so the swap is contained — but the mood system is net-new. *(MODIFY + build)*
7. **Meta Pixel → server CAPI + GA4 event rework** — Pixel is client-side today (`NEXT_PUBLIC_META_PIXEL_ID`, `fbevents.js`); v2 moves it server-side (DISCARD client loader, add `META_CAPI_ACCESS_TOKEN` secret). GA4 event vocabulary changes for an adaptive funnel. *(DISCARD client loader / MODIFY track.ts)*
8. **Certificate + results-email content** — certificate **architecture MODIFY** (swap the 6-strength chips/glyphs/copy for v2 domains; both render paths kept); `ResultsEmail.tsx` content REBUILD; nurture copy MODIFY. *(MODIFY/REBUILD content, keep pipeline)*

**Two planning-blocker flags up front:**
- **`plan.md` is still fully v1.** The phase brief says "see the updated `plan.md`," but `plan.md` was last touched in the Phase 1.02 scaffold commit and contains zero adaptive/cognitive/pentagon language. The v2 spec the phase plan will be written from **is not in the repo yet** — confirm where the canonical v2 spec lives before planning.
- **Production is not deployed.** Phase 2.06 (Vercel) is blocked on a GitHub-App-install gate only the `DinovLazar` account owner can clear. No prod URL, no prod env vars exist yet.

---

## Area-by-area inventory

### Area 1 — Stack & Scaffold · Verdict: **MODIFY**

**Exists.** `package.json`, `tsconfig.json` (strict, `@/*`→`./src/*`), `next.config.ts` (only wires next-intl), `eslint.config.mjs`, `postcss.config.mjs`, `components.json` (Tailwind-v4 CSS-first, non-standard style `"radix-nova"`), `vitest.config.ts`, `playwright.config.ts`.

Pinned versions: **next `16.2.7`**, **react/react-dom `19.2.4`** (exact), **typescript `^5`**, **tailwindcss `^4`** (v4 confirmed via `@tailwindcss/postcss`; *no* `tailwind.config.*` — tokens live in `globals.css`), **next-intl `^4.13.0`**, **framer-motion `^12.40.0`**, **lucide-react `^1.17.0`**, **radix-ui `^1.5.0`** (unified meta-package, not scoped `@radix-ui/*`), **shadcn CLI `^4.10.0`**, **zod `^4.4.3`**, **@react-email/components `1.0.12`** + **/render `2.0.8`**, **@supabase/supabase-js `^2.107.0`**, **html-to-image `1.11.13`**, **vitest `^4.1.8`**, **@playwright/test `1.61.0`**. `@fontsource/rubik` + `@fontsource/nunito-sans` are installed but **not imported in app code** (live fonts come via `next/font/google`); note the Satori email path *does* use the `@fontsource` woff buffers.

Scripts: `dev/build/start/lint(eslint)/typecheck(tsc --noEmit)/test(vitest run)`, `test:a11y`, `qa:screens`, `lhci:mobile|desktop`, `lh:median`, `db:push`, `db:types`, `test:insert`, `test:email`, `emails:nurture`.

**Notes for v2.**
- **No PDF library exists.** `html-to-image` is client PNG only. A v2 certificate **PDF** would need a new dep (`@react-pdf/renderer`, `jspdf`, or server Puppeteer).
- **No charting library exists.** A v2 radar/pentagon needs Recharts/nivo/visx/d3 added (or a hand-rolled SVG following the existing inline-SVG glyph pattern).
- `lucide-react ^1.17.0` and `radix-ui ^1.5.0` (unified package) are recent/cutting-edge — verify icon names and shadcn-add compatibility during v2 work. The `components.json` style `"radix-nova"` is non-standard and may limit default-registry `shadcn add`.
- Font + palette swaps are a single-file change (`globals.css` `@theme`); remove the dead `@fontsource` app deps when Rubik/Nunito retire (keep whatever the email Satori path still needs).

---

### Area 2 — i18n / Bilingual Shell · Verdict: **TRANSFERS**

**Exists.** `src/i18n/routing.ts` (`defineRouting`, locales `['mk','en']`, default `mk`, `localePrefix: 'as-needed'` → MK at `/`, EN at `/en/…`), `request.ts` (`getRequestConfig`, dynamic `../messages/${locale}.json`, falls back to `mk`), `navigation.ts` (`createNavigation` → typed `Link/redirect/usePathname/useRouter`), `src/proxy.ts` (Next-16 renamed middleware; `createMiddleware(routing)`, matcher excludes `api|_next|_vercel|*.*`). Messages: `src/messages/mk.json` + `en.json`, **12 identical top-level namespaces** (`Meta, LanguageToggle, A11y, NotFound, Landing, Test, Gate, Result, Email, Consent, Privacy, Trial`).

`messages.test.ts` enforces: full leaf-path parity MK↔EN, namespace spot-checks (Gate/Result/Email/Consent/Privacy/Trial), `{token}` placeholder consistency, no empty strings.

**Notes for v2.** Clean and complete; carries forward unchanged. Any new v2 namespace (e.g. `Assessment`, `Report`) must be added to **both** locales at once or the test fails, and will want its own spot-check block. SEO-safe URL structure is unaffected.

---

### Area 3 — Routing & Pages · Verdict: **TRANSFERS** (shells) / inner islands REBUILD

**Exists.** Route tree:

| Route | File | Purpose |
|---|---|---|
| `/{locale}` | `[locale]/page.tsx` | Landing (Header, Hero, HowItWorks, TrustCues, Reassurance, Footer), SSG |
| `/{locale}/test` | `[locale]/test/page.tsx` | Reads `?age=N` → `getBandForAge` → renders `TestRunner` island; no age → `AgePickerFallback`; `?dev=1` non-prod |
| `/{locale}/result` | `[locale]/result/page.tsx` | `ResultView` island reads `TestResult`+`LeadContext` from sessionStorage (guards direct access) |
| `/{locale}/trial` | `[locale]/trial/page.tsx` | Standalone trial-booking (reuses `TrialBooking`), SSG |
| `/{locale}/privacy` | `[locale]/privacy/page.tsx` | GDPR privacy + cookie policy; `CookieSettingsButton` island, SSG |
| `/{locale}/**` | `[locale]/[...rest]/page.tsx` | Catch-all → `notFound()` |
| non-locale | `app/not-found.tsx` | Global bilingual 404 (owns `<html>`) |
| `[locale]/layout.tsx` | — | `<html lang>`, fonts, `NextIntlClientProvider`, `ConsentRoot`; both locales pre-rendered |
| OG | `opengraph-image.tsx` ×3 (landing/result/trial) | Satori 1200×630, **name-free**, bilingual |

**Notes for v2.** The SSG-shell → client-island pattern is clean and stays; the **islands** (`TestRunner`, `ResultView`) are the rebuild surface. `TestResult` is already version-stamped (`version: 1`) — bump to `2` and migrate the sessionStorage key. No new top-level routes strictly required (a `/report` route is optional). Localized slugs (e.g. `/проба`) remain a known TODO, non-blocking.

---

### Area 4 — Test Engine (v1) · Verdict: **MIXED** (TRANSFER primitives / REBUILD orchestration+scoring)

**Exists.** `src/components/test/`: `TestRunner.tsx`, `StartScreen.tsx`, `QuestionView.tsx`, `OptionTile.tsx`, `ProgressHeader.tsx`, `StrengthChip.tsx`, `DevBar.tsx`, `copy.ts`; `visuals/` (`Glyph.tsx`, `StemVisual.tsx`, `lexicon.ts`, `index.ts`). `src/lib/scoring/` (`score.ts`, `reconstruct.ts`, `storage.ts`, `types.ts`, `index.ts`), `src/lib/bands.ts`.

**How it works.** `TestRunner` is a 3-phase machine `start → running → gate`; state `{phase, index, answers: Record<qId,optId>, result}`. Questions come from `getQuestionsForBand(band)` — **a fixed, ordered array** for the age band; **no shuffle, no branching, linear**. `QuestionView` renders the current item; `mechanic: 'reveal'` (memory items) runs intro→show(`revealMs`)→answer; others go straight to options (`OptionTile` = Radix `RadioGroup.Item`). At the last question → `score()` → `gate` (EmailGate). `ProgressHeader` is presentational (`current/total`, `aria-live`).

**v1 scoring (6-strength ratio).** Per strength: `ratio = hits/total`; sort desc with fixed `TIE_BREAK_ORDER` (pattern>logic>memory>spatial>numeracy>words_obs); tiers ranks 1–2 `celebrated`, 3 `also`, 4–6 `growing`. Output `TestResult{version:1, band, locale, strengths[], top1/2/3, growing[]}` — **no aggregate score, no IQ**.

**Reuse map.**
| Piece | Verdict |
|---|---|
| `OptionTile`, `ProgressHeader`, `StartScreen` | **TRANSFER** (generic, no scoring coupling) |
| `Glyph`, `StemVisual`, `lexicon` | **TRANSFER** — the most valuable reusable asset; data-driven, bilingual, accessible, decoupled |
| `StrengthChip` | **TRANSFER** if 6-taxonomy kept, else MODIFY |
| `QuestionView` | **MODIFY** (generalise mechanics; reveal logic reusable) |
| `DevBar` | **MODIFY** (auto-fill modes are v1) |
| `storage.ts`, `types.ts`, `bands.ts` | **MODIFY** (version bump; bands may become difficulty metadata not set-selectors) |
| `TestRunner` | **REBUILD** (adaptive state machine) |
| `score.ts` | **DISCARD/REBUILD** |
| `reconstruct.ts` | **DISCARD/REBUILD** (must match new scoring contract used by the email path) |

**Notes for v2.** Biggest rebuild cost is the adaptive `TestRunner` (item selection / ability estimation / stopping rule / async fetch). Keep the `gate` boundary stable: if v2 `TestResult` still surfaces `{top…, band, locale}`-shaped fields, EmailGate keeps working. Clear stale v1 sessionStorage tokens on v2 session start.

---

### Area 5 — Question Banks / Content (v1) · Verdict: **MODIFY schema / REBUILD content / TRANSFER taxonomy+visuals**

**Exists.** `src/content/test/` (`types.ts`, `index.ts`, `band-3-5.ts`, `band-6-9.ts`, `band-10-13.ts`) + `src/content/strengths.ts`.

| Band | Items | Distribution |
|---|---|---|
| 3–5 | 10 | pattern 2, spatial 2, numeracy 2, words_obs 2, memory 1, logic 1 |
| 6–9 | 12 | 2 each (balanced) |
| 10–13 | 14 | pattern 3, logic 3, memory 2, spatial 2, numeracy 2, words_obs 2 |
| **Total** | **36** | 5 reveal/memory items total |

`TestQuestion` = `{id, band, strength (ONE per item), prompt{en,mk}, options[3–4], correct, stem? (inline StemSpec composed of Glyph primitives), mechanic?:'reveal', revealMs?, asset?(coarse hint)}`. **Visual stems are inline objects, not external file refs.** The 6 strengths (`strengths.ts`): `pattern, logic, memory, spatial, numeracy, words_obs` — each `{code, token(CSS var), name{en,mk}, whatItIs}`.

**Notes for v2.** 36 items is far too few for adaptive — a new authoring sprint is needed. **Schema is near-ready:** add `difficulty` (b), optional `discrimination` (a), `exposure` — all existing fields survive. Taxonomy maps cleanly to cognitive+STEM (pattern→sequences/algebra-readiness, logic→deduction, memory→working memory, spatial→geometry/rotation, numeracy→arithmetic, words_obs→verbal); consider relabelling `words_obs` display while keeping the code for storage continuity. Bilingual text baked into every field is a genuine asset. Preserve/expand the reveal (working-memory) mechanic.

---

### Area 6 — Results / Strengths Profile (v1) · Verdict: **REBUILD** (reuse specific primitives)

**Exists.** `src/app/[locale]/result/page.tsx` (SSG shell, no PII in URL) + `src/components/result/`: `ResultView` (island; reads `TestResult`+`LeadContext`, redirects home if missing), `ResultHero` (name-highlighted h1, "no scores" lede), `StrengthsConstellation` (the main viz — three non-evaluative tiers Celebrated/Also-Strong/Growing as **badges/chips, no bars/gauges/radar/numbers**), `StrengthGlyph` (6 inline SVG glyphs, `currentColor`, survive image capture), `ParentNote` (parent-facing prose card), `TrialInvite` (bands 3-5/6-9, inline `TrialBooking`), `CuriousMindEnding` (band 10-13), `CertificateCard`, `copy.ts`, `bibi.ts`. Content: `src/content/results/` (`types.ts`, `index.ts` `getResultCopy()`+`fillSlots`/`joinNames`, `templates.ts`, `strength-copy.ts`).

**Notes for v2.** **There is no radar/spider/pentagon chart anywhere in v1** — the "constellation" is pure badge UI. Reuse: `StrengthGlyph` (TRANSFER, extend with domain icons), `ResultHero` (TRANSFER, copy only), `ParentNote` (MODIFY), the sessionStorage-read+redirect guard pattern, and the `fillSlots`/`joinNames` utilities. **Main rebuild target:** `StrengthsConstellation` → the v2 pentagon/radar; plus `ResultView` orchestration (new multi-domain result shape, not top1/2/3 tiers) and the `content/results/` copy layer.

---

### Area 7 — Certificate (v1) · Verdict: **MODIFY** (strongest carry-over candidate)

**Exists.** `Certificate.tsx` (fixed **1080×1350** portrait, pure HTML/CSS div tree built for faithful raster capture), `CertificateCard.tsx` (renders full-size off-screen + scaled 272px preview; **Download** + **Share** buttons trigger lazy-loaded `html-to-image`; awaits `document.fonts.ready` for Cyrillic), `certificate-model.ts` (`certificateTint`, `certNameSize`, `formatCertDate`, `certificateStrengthList`) + its test (AA contrast for all 6 tints, name sizing, date, list join), `src/lib/email/certificate-image.tsx` (**server** Satori/`next-og` PNG for email attachment; CSS vars impossible in Satori so colours are precomputed hex from `lib/email/brand.ts`; embedded woff fonts), `result/opengraph-image.tsx` (**name-free** generic OG), `bibi.ts` (`BIBI_CERT_ART = null` swap-point; licensed art not yet placed → abstract `PlaceholderArt`).

Visual anatomy: cream radial bg → per-child gradient frame (blend of the two celebrated strength tints) → keyline → 12 deterministic confetti → eyebrow → 336×336 Bibi/placeholder box → child first name (104/78/60px tiered by length) + flourish underline → body line → divider → "SHINES AT" + celebrated strength chips (per-tint, glyph+name) → wordmark + locale date.

**Notes for v2.** **Carries over intact:** the 1080×1350 geometry, the **dual render architecture** (client `html-to-image` + server Satori), cream constant bg + AA model, per-child gradient framing, the `BIBI_CERT_ART` drop-in, name-responsive sizing, locale date, confetti, the name-free OG image. **Changes for v2:** the bottom-third strength chips (6-strength → v2 domains), the body-line template copy, new domain glyphs in `StrengthGlyph`, the `STRENGTH_HEX` table + glyph paths in `certificate-image.tsx`, and `certificate-model.test.ts` token set. If v2 wants a certificate **PDF**, that's a net-new dep (Area 1).

---

### Area 8 — Form / Lead Capture (v1) · Verdict: **REBUILD** (reuse the UX/pipeline pattern)

**Exists.** `src/components/gate/EmailGate.tsx` (4 fields + honeypot, inline + ARIA validation, calls `submitLead` server action), `gate/copy.ts`, `src/lib/validation/lead.ts` (Zod `leadSchema`), `src/lib/leads/` (`lead-mapping.ts` `buildLeadInput`/`toTopStrengths`/`CONSENT_VERSION='v1-draft-2026-06'`, `submit-lead.ts` server action, `insert-lead.ts` service-role write, `lead-context.ts` sessionStorage handoff `{childFirstName, age, submittedAt}` — **no email/strengths**, `after-lead.ts` `Promise.allSettled` fan-out).

Form fields: `email` (`z.email().max(254)`), `childFirstName` (`trim().min(1).max(60)`), `consent` (required, `z.literal(true)`), `marketing` (optional, default off), `company` (honeypot). Carried-not-shown: `childAge`, `band`, `locale`, `topStrengths` (top1/2/3 + ratio map), `consent_version`.

**Save path:** client validate → `submitLead(submission)` → honeypot check → `buildLeadInput` (snake_case) → `insertLead` runs `leadSchema.parse` server-side → `supabase.from('leads').insert(...).select('id, created_at')` via **service-role** client (anon blocked by RLS) → schedule `after(runAfterLead)` (results email + Brevo upsert + notification, isolated) → return `{ok}` → client `writeLeadContext` → navigate `/result`.

**Notes for v2.** Supabase becomes an **anonymous-scores store** → the whole `leads` PII contract is a REBUILD (`lead.ts` schema, `lead-mapping.ts`, the table). **Reuse the patterns:** EmailGate's two-checkbox consent + ARIA + honeypot + server-action + sessionStorage-handoff (MODIFY field set), the `submit-lead` honeypot→validate→insert→`after()` shape, and the `after-lead` fan-out. Bump `CONSENT_VERSION` when v2 gate copy is finalised.

---

### Area 9 — Supabase · Verdict: **MODIFY** (setup TRANSFERS / schema REBUILD)

**Exists.** `src/lib/supabase/client.ts` (anon browser client; "FUTURE use only" — never called in v1 funnel because RLS blocks anon), `server.ts` (singleton service-role client, `server-only` tripwire, `persistSession:false`), `types.ts` (hand-maintained `Database`, regenerate via `npm run db:types`). `supabase/config.toml` (`project_id="iqup-web"`, Postgres 17; **no region in config** — EU region is a dashboard setting). One migration `20260607204206_create_leads.sql`.

`leads` table: `id uuid PK default gen_random_uuid()`, `created_at timestamptz default now()`, `email text NN`, `child_first_name text NN`, `child_age smallint NN CHECK 3–13`, `band text NN CHECK in (band-a,band-b,band-c)`, `top_strengths jsonb NN`, `locale text NN CHECK in (mk,en)`, `consent boolean NN CHECK =true`, `consent_at timestamptz default now()`, `consent_version text NN`, `marketing_opt_in boolean NN default false`. **RLS enabled, zero policies**, plus `REVOKE ALL … FROM anon, authenticated` (defense-in-depth); index `leads_created_at_idx (created_at DESC)`. Env names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

**Notes for v2.** Client/server split, `server-only` tripwire, anon-vs-service-role discipline all transfer. New `anonymous_scores` table (session token, age band, domain scores, timestamp, optional consent) — the `band`/`locale` CHECK patterns are reusable. Regenerate `types.ts` after the new migration (don't hand-edit). **Confirm EU region on the dashboard** (not recorded in repo; GDPR requirement). Per the handoff doc the cloud project ref is `cpxssfodboukznzaksnb` (eu-central-1) — verify.

---

### Area 10 — Brevo · Verdict: **TRANSFERS** transport / **MODIFY** attribute mapping

**Exists.** `src/lib/email/brevo.ts` (thin transactional client, single `fetch` POST to `…/v3/smtp/email`, no SDK, typed `BrevoError`, `server-only`, **never reads env** — apiKey passed in), `brevo-contacts.ts` (POST `…/v3/contacts`, handles 201 new / 204 update), `contact-mapping.ts` (pure; builds the 8-attribute payload + resolves list IDs; **marketing-consent gate enforced here**), `upsert-lead-contact.ts` (orchestrator, reads env, swallows errors).

8 UPPERCASE attributes: `CHILD_FIRST_NAME`(text), `CHILD_AGE`(number), `BAND`(text, digit-free label), `LOCALE`(text), `MARKETING_OPT_IN`(bool), `CONSENT_VERSION`(text), `TOP_STRENGTHS`(text, top-2 EN names), `SOURCE`(text, `'website-quiz'`). Two lists via `BREVO_LEADS_LIST_ID` (all leads) + `BREVO_MARKETING_LIST_ID` (opt-in only). Env: `BREVO_API_KEY`, the two list IDs, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` (fallback `'IqUp'`), `EMAIL_REPLY_TO`, `LEAD_NOTIFY_TO`, `LEAD_NOTIFY_FROM`. **Graceful no-op** when `BREVO_API_KEY` unset (warns, funnel continues).

**Notes for v2.** Transport (`brevo.ts`/`brevo-contacts.ts`) fully reusable. `contact-mapping.ts` → MODIFY/REBUILD attributes to v2 domains (e.g. swap `BAND`/`TOP_STRENGTHS` for domain fields); `CHILD_FIRST_NAME/CHILD_AGE/LOCALE/MARKETING_OPT_IN/CONSENT_VERSION/SOURCE` carry over. List IDs + consent-gate pattern transfer. **Brevo dashboard state (lists, API key, the 8 attributes) is unverified** — confirm before trusting (per 2.06 handoff). Brevo silently ignores attributes that don't exist.

---

### Area 11 — Email Templates · Verdict: **MODIFY** (transport TRANSFERS / content REBUILD)

**Exists.** `src/emails/ResultsEmail.tsx` (React Email; greeting→intro→headline→celebrated strengths→also/growing lines→certificate-attached note→trial invite OR curious-mind ending by band; inline hex BRAND), `render.ts` (`@react-email/render`, uses `createElement` so it runs in Vitest), `types.ts`. `src/emails/nurture/` — 4 emails (`WelcomeTrial`, `WelcomeGeneral`, `TrialInvite`, `Nudge`) over shared `NurtureBody`/`NurtureLayout`; `copy.ts` (bilingual + Brevo merge tags `{{ contact.CHILD_FIRST_NAME }}` / `{{ unsubscribe }}`; no-digit guardrail tested), `links.ts` (UTM-tagged CTAs), `styles.ts`, `render.ts` (+`finalizeMergeTags`). Senders `src/lib/email/`: `send-results-email.ts` (reconstruct ratio→copy→cert PNG→render→send), `send-lead-notification.ts` + `lead-notification.ts` (internal alert, English-only, age-in-words), `lead-summary.ts`, `brand.ts` (hex tokens), `site-url.ts` (`NEXT_PUBLIC_SITE_URL`, fallback localhost), `certificate-image.tsx`.

**Triggers.** On lead-save `after()` fan-out (non-blocking): results email + internal notification + Brevo contact upsert. The 4 nurture emails are rendered to static HTML and **sent by Brevo automations**, not by the app.

**Notes for v2.** TRANSFER: `brevo*`, `send-lead-notification`/`lead-notification`, `brand`, `site-url`, the `NurtureLayout` shell + 4-email/2-track structure, `links.ts` UTM sourcing, the orchestrator pattern (env-checks/no-op/error-swallow/`after()`). REBUILD: `ResultsEmail.tsx` content + `types.ts` (multi-domain, no band-branch), `send-results-email.ts` steps 1–2 (`reconstructResult`/`getResultCopy` are v1). MODIFY: nurture `copy.ts` body refs ("strengths profile", "certificate", "Bibi…", "brain games"); subjects/footer reusable. `certificate-image.tsx` follows the cert taxonomy change.

---

### Area 12 — Analytics & Consent · Verdict: consent **TRANSFERS** / analytics **MODIFY** / Pixel client **DISCARD**

**Exists (Phase 2.04).** `src/lib/analytics/` (`env.ts`, `runtime.ts`, `sync.ts`, `track.ts`, `loaders/{ga,clarity,pixel}.ts`) + `src/lib/consent/` (`ConsentProvider.tsx`, `state.ts`, `cookie.ts`, `constants.ts`, `types.ts`) + `src/components/consent/` (`ConsentRoot`, `ConsentBanner`, `ConsentManageDialog`, `CookieSettingsButton`, `copy.ts`).

Three trackers, **all consent-gated, client-side, deny-by-default**, injected by `syncTrackers(consent)` on mount + every change: GA4 (`NEXT_PUBLIC_GA4_ID`, Consent Mode v2), Clarity (`NEXT_PUBLIC_CLARITY_ID`, `consentv2`, auto-cookies off), Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`, marketing category). GA4 events (v1): `page_view`, `test_start`, `test_complete`, `generate_lead`, `trial_cta_click` (Pixel maps `PageView`/`Lead`). **Params sanitised to `{band, locale, path}` only** — all PII stripped; `track()` SSR-safe, never throws.

Cookie model: categories `necessary`(always)/`analytics`/`marketing`; default both false; first-party cookie `iqup_consent` (JSON, `SameSite=Lax; Secure`, ~183-day); version `cookies-v1-2026-06`; non-modal banner (equal-weight Accept/Reject) + Radix focus-trapped Manage dialog; SSR-hidden to avoid CLS; **cookie consent kept separate from lead/parental consent**.

**Notes for v2.** `lib/consent/` + `components/consent/` TRANSFER intact (product-agnostic, i18n copy). `loaders/ga.ts`+`clarity.ts` TRANSFER. **`loaders/pixel.ts` → DISCARD client loader** (there's already a `// FUTURE(CAPI 2.x)` marker at ~line 47): move to server CAPI, add secret `META_CAPI_ACCESS_TOKEN`, route `Lead` via a server action/route (ideal point: the existing `runAfterLead` `after()` hook), drop `revokePixel`/`markPixelLoaded` from `runtime.ts`/`sync.ts`. `track.ts` MODIFY: new `TrackEvent` union + `ROUTES` table for the adaptive funnel (e.g. `assessment_start/complete`, `question_answered{domain}`, `result_viewed`) and expand the sanitize whitelist (e.g. `domain`, `age_band`). Both analytics `.test.ts` MODIFY.

---

### Area 13 — Deployment / Vercel · Verdict: **TRANSFERS** (deploy itself **BLOCKED**)

**Exists.** **No `vercel.json`** (no custom routes/headers/rewrites — so no CSP/HSTS at edge today). `next.config.ts` minimal. `.env.local.example` (complete, 16 documented vars). `lighthouserc.mobile.cjs` (median-of-5, slow-4G+4×CPU, URLs `/`,`/en`,`/test`,`/en/test`, **no score assertions**) + `…desktop.cjs` (`/`,`/en`). LHCI runs locally vs `next start`, measurement-only (no CI gate).

**Deploy status (from 2.06 handoff):** **not deployed.** Vercel account = Petar (Free/Hobby). Blocker: repo is under `DinovLazar` (personal GitHub account); Vercel's GitHub App can only be installed by that account owner; the machine login (`petarjakimov11012011-cell`) is an admin collaborator but can't install it; the offered "clone" flow (forks into Petar's account, drifts) was declined. Fix: DinovLazar owner installs Vercel's app on `iqup-web`, then Petar's Vercel imports it. **No prod URL assigned** (`iqup-web.vercel.app` in the handoff is only an example); no hardcoded `*.vercel.app` in source. `NEXT_PUBLIC_SITE_URL` falls back to `localhost:3000`, used as `metadataBase` (layout) and email CTAs (`site-url.ts`).

**Notes for v2.** `next.config.ts` + LHCI configs TRANSFER (update URL set for v2 routes). Set real `NEXT_PUBLIC_SITE_URL` before any CAPI call (needs `event_source_url`). Add `META_CAPI_ACCESS_TOKEN` to Vercel env. Consider adding `vercel.json` CSP once the client Pixel is removed (smaller allowlist). Deploy blocker is independent of the v2 pivot and still open.

---

### Area 14 — Tests · Verdict: **MIXED** (durable infra tests TRANSFER / v1-logic tests REBUILD)

**Exists. 33 test files = 28 Vitest unit + 5 Playwright e2e.** Grouped:

| Group | Files | Verdict |
|---|---|---|
| Engine / scoring | `scoring/score`, `scoring/storage`, `scoring/reconstruct` | **V1-TIED → REBUILD** (ratio model, tier names, top1/2/3; reconstruct may partly survive if v2 keeps a stored-score model) |
| Results copy | `content/results/results` | **V1-TIED → REBUILD** (no-IQ guardrail pattern reusable) |
| Certificate | `result/certificate-model`, `email/certificate-image` | **V1-TIED → REBUILD/MODIFY** (PNG-signature checks generic; tint-seed asserts v1) |
| Form / leads | `leads/lead-context`, `leads/after-lead`, `leads/submit-lead` | **MODIFY** (fan-out durable; band/`toTopStrengths` asserts v1) |
| Email/Brevo infra | `email/brevo`, `brevo-contacts`, `send-results-email`, `send-lead-notification`, `lead-notification`, `lead-summary`, `contact-mapping`, `upsert-lead-contact` | **DURABLE → TRANSFERS** (content fields shift, harness survives) |
| Email content | `emails/ResultsEmail`, `nurture/copy`, `nurture/render-smoke` | **V1-TIED → REBUILD** |
| i18n / messages | `messages/messages` | **DURABLE → TRANSFERS** |
| Content / banks | `content/test/content`, `content/centers` | **MIXED** (centers durable; bank shape pattern transfers, counts/codes are v1) |
| Privacy prose | `content/privacy/privacy` | **DURABLE** (no-score vocab guardrail) |
| Analytics / consent | `consent/consent`, `analytics/sync`, `analytics/track` | **DURABLE → TRANSFERS** (track.ts asserts MODIFY for new events) |
| Bands | `lib/bands` | **MODIFY** (age→band may change) |
| E2e infra | `consent.spec`, `parity.spec`, `fixtures.ts` | **DURABLE → TRANSFERS** (fixtures need v2 `makeTestResult`) |
| E2e v1 flows | `a11y.spec`, `screenshots.spec` | **MODIFY** (route list + screenshot regen) |

**Notes for v2.** A **no-IQ/no-score forbidden-word regex** runs through tests in every group — **preserve it** in v2 equivalents; it encodes the product's hardest guardrail. Fixtures + `TestResult` carry `version:1` / key `iqup.testResult.v1` — bump + migrate.

---

### Area 16 — Project-State Docs · Verdict: **TRANSFERS** (process; content is v1, append as v2 lands)

**Exists.** 21 files in `src/_project-state/`: 3 core (`current-state.md`, `file-map.md`, `00_stack-and-config.md`), 1 template, 10 Part-1 reports (1.02–1.11), 5 Part-2 reports (2.01, 2.02, 2.03-Code, 2.04-Code, 2.05-Code), the 2.06 handoff, plus `Part-2-Checkpoint-Verify-Reconcile-Completion.md` and `Mac-Setup-Completion.md`. **Most recent documented: Phase 2.05 (Code), 2026-06-19.** Pending: 2.06 (blocked), 2.07, 2.08.

**Notes for v2.** Core docs are v1-accurate to 2.05 and will need updates as v2 phases land; `00_stack-and-config.md` is append-only. 2.06 has a handoff but no completion report (pre-existing open work).

---

### Area 17 — Repo Agent Docs · Verdict: **ALL V1 — pending v2 updates (DO NOT EDIT in this phase)**

**Exists.** `CLAUDE.md` (pointer + Claude notes), `AGENTS.md` (canonical rules), `project-instructions.md` (dev spec, scoring, framing, structure), `phase-plan.md` (1.02–2.08; 1.02–2.05 done), `plan.md` (full product brief), `brand.md` (brand/programs/tone). **Zero references to adaptive/cognitive/STEM-assessment/ages-5–13 anywhere.**

**Notes for v2 (when authorised, not now).**
- `AGENTS.md` + `project-instructions.md` (highest priority): product description (3-band 6-strength → adaptive), scoring guardrails, result framing (drop celebrated/also/growing tier language), age ranges, question-sourcing rules. The no-IQ/no-score rule persists.
- **`plan.md` needs a full v2 rewrite** — §6 (assessment spec) and the strengths-profile/handoff sections are entirely v1. **⚠️ The brief's "see the updated `plan.md`" does not match the repo:** `plan.md` was last edited in the Phase 1.02 scaffold commit (`1483ec7`) and is fully v1 (the "STEM program ages 3–9" line refers to IqUp's *in-person classes*, not the assessment). **The canonical v2 spec is not in the repo** — locate it before writing the v2 phase plan.
- `phase-plan.md`: append the v2 phase sequence once defined.
- `CLAUDE.md`/`brand.md`: minor — children's-data fields if they change; brand/5-programs likely stable.

---

### Area 18 — Anything Else Notable

- **Half-finished Part 2:** 2.06 (Vercel deploy) entirely incomplete — no project, no prod env vars, GitHub-App-install blocker open. 2.07/2.08 not started.
- **Anticipated pivot already marked in code:** `// FUTURE(CAPI 2.x)` in `loaders/pixel.ts` flags exactly where the server CAPI hook belongs.
- **Dead/unused:** `@fontsource/rubik` + `@fontsource/nunito-sans` are installed but unused by app code (live fonts via `next/font/google`); the Satori email path uses woff buffers — confirm which before removing. `src/lib/supabase/client.ts` (anon) is "FUTURE use only" and never called in the v1 funnel.
- **Naming smell for v2:** `NEXT_PUBLIC_META_PIXEL_ID` becomes a misnomer once Pixel moves server-side — should be re-scoped from `NEXT_PUBLIC_` to a server secret (value no longer needs to ship to the browser).
- **`scraps/` + `docs/`** hold design screenshots, content, design-handovers, email-templates, qa — design reference, not shipped code.

---

## 🐞 Bugs & risks (noted, not touched)

1. **Planning blocker — `plan.md` is stale v1.** The phase brief points at an "updated `plan.md`" that doesn't exist in the repo. The v2 phase plan has no in-repo canonical spec to build from. *(Highest risk to the next phase.)*
2. **Production is undeployed and blocked.** 2.06 GitHub-App-install gate (only `DinovLazar` owner can clear). No prod URL / prod env. Every "go-live" item depends on this.
3. **`NEXT_PUBLIC_SITE_URL` empty-string foot-gun.** Handoff warns the build breaks on `new URL('')` — the var must be a real URL or **unset**, never empty.
4. **No charting + no PDF libraries.** v2's pentagon/radar and any certificate-PDF both require new deps not in `package.json` today.
5. **"Two-mood" token system does not exist.** Current build is light-only with dark-mode deliberately neutered (`@custom-variant dark` no-op). v2's mood system is net-new (CSS attribute strategy + provider + Tailwind variant), not a token tweak.
6. **EU-region not verifiable from the repo.** `config.toml` records no region; GDPR EU residency is a dashboard setting — must be confirmed before v2 stores children's scores.
7. **Brevo dashboard state unverified.** Lists, API key, and the 8 contact attributes are assumed, not confirmed in-repo; attributes that don't exist are silently dropped by Brevo.
8. **`CONSENT_VERSION` is a draft** (`'v1-draft-2026-06'`) — must be finalised/bumped when v2 gate copy and data model land.
9. **Cutting-edge pins** — `next 16.2.7`, `react 19.2.4`, `lucide-react ^1.17.0`, unified `radix-ui ^1.5.0`, `components.json` style `"radix-nova"`: verify charting/PDF/shadcn-add compatibility against these during v2.
10. **No edge security headers** (no `vercel.json`/CSP/HSTS) — worth adding alongside the Pixel→CAPI move.

*(No functional bugs were found in v1 logic during the read; the risks above are transition/operational.)*

---

## 🔑 Env-var inventory (names + purpose only — no values)

| Name | Purpose | Public/Secret | Required? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client + server clients) | Public | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client init; RLS blocks anon reads/writes) | Public | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key; bypasses RLS; server lead-write only | **Secret** | Required (write path) |
| `BREVO_API_KEY` | Brevo transactional + contacts API | **Secret** | Optional (graceful no-op) |
| `EMAIL_FROM_ADDRESS` | Verified sender on results + notification | **Secret** | Optional (email no-ops) |
| `EMAIL_FROM_NAME` | Sender display name (code fallback `'IqUp'`) | **Secret** | Optional |
| `EMAIL_REPLY_TO` | Reply-To on results email | **Secret** | Optional |
| `TEST_EMAIL_TO` | Dev-only inbox for `npm run test:email` (refuses in prod) | **Secret** (dev) | Optional (script only) |
| `BREVO_LEADS_LIST_ID` | "All leads" Brevo list ID | **Secret** | Optional |
| `BREVO_MARKETING_LIST_ID` | Marketing/nurture list ID (opt-in only) | **Secret** | Optional |
| `LEAD_NOTIFY_TO` | Comma-sep internal new-lead recipients | **Secret** | Optional (no-op when unset) |
| `LEAD_NOTIFY_FROM` | Override From on internal alert (falls back to `EMAIL_FROM_ADDRESS`) | **Secret** | Optional |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL — `metadataBase` + email CTAs (fallback `localhost:3000`) | Public | Required in prod (never empty string) |
| `NEXT_PUBLIC_GA4_ID` | GA4 Measurement ID (`G-…`); no-op when unset | Public | Optional |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID; no-op when unset | Public | Optional |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel/dataset ID; no-op when unset *(v2: re-scope to server secret for CAPI)* | Public | Optional |
| `NODE_ENV` | Standard Next.js built-in (dev guards) — not in `.env.local.example` | n/a | Built-in |
| *`META_CAPI_ACCESS_TOKEN`* | **Net-new for v2** — server Conversions API token (not yet in repo) | **Secret** | v2 (to add) |

---

## Definition-of-Done check

- [x] Repo synced — level with `origin/main`; unexpected untracked file reported to Lazar, left untouched per his call.
- [x] All 18 areas inventoried (exists / verdict / notes).
- [x] Headline summary + bugs/risks list + env-var inventory (names only, no secrets).
- [x] Test suite mapped (33 files) and classified v1-tied vs durable.
- [x] Report written to `src/_project-state/Part-3-Phase-00-Completion.md`, copy-paste-ready for Chat.
- [x] No code/config/content/doc changed other than this report.
- [ ] Working branch `part-3.00-audit` committed & pushed *(next step).*
- [ ] **Ask Lazar before merging to `main`** — not merging unilaterally.
