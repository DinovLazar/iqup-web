# IqUp-Web — File Map

> A live map of every meaningful file in the repo with a one-line description. **Code maintains this:** add a row whenever a file is created, update it when a file's purpose changes, remove it when a file is deleted. Keep each description to one line. (Generated build artifacts and `node_modules/` are omitted.)

---

## Root — canonical docs & config

| Path | Description |
|---|---|
| `project-instructions.md` | The project rulebook (four-Claudes model, phase workflow, quality bar). |
| `plan.md` | **v2 master spec** (Phase 3.01): the adaptive cognitive + STEM assessment, derived from `IQ UP Specifikacija v1.2`; §10 is the authoritative v2 folder structure. |
| `phase-plan.md` | Living index of every phase and its status. **Still v1 — pending the v2 phase plan** (Chat writes it). |
| `brand.md` | IqUp brand source-of-truth (from phase 1.01); **§6 visual identity confirmed in Phase 3.01** (official palette, Montserrat, puzzle-brain motif, tokens). |
| `Decisions.md` | Append-only log of project decisions. |
| `AGENTS.md` | Canonical, tool-neutral rules for any coding agent. **Updated to v2 (Phase 3.01)** — product/architecture specifics; process rules unchanged. |
| `CLAUDE.md` | Claude Code entry point; defers to `AGENTS.md`. **Updated to v2 (Phase 3.01).** |
| `README.md` | Project overview, how to run, where things live, guardrails. |
| `.gitignore` | Ignores `node_modules/`, `.next/`, `.env*`, build artifacts. |
| `package.json` | Dependencies and scripts (`dev`, `build`, `start`, `lint`, `typecheck`). |
| `package-lock.json` | npm lockfile (pinned dependency tree). |
| `tsconfig.json` | TypeScript config (`@/*` → `src/*`, strict mode, bundler resolution). |
| `next.config.ts` | Next.js config wrapped with the next-intl plugin (→ `src/i18n/request.ts`). |
| `eslint.config.mjs` | ESLint flat config (next core-web-vitals + TypeScript). |
| `postcss.config.mjs` | PostCSS config loading `@tailwindcss/postcss` (Tailwind v4). |
| `components.json` | shadcn/ui config (radix-nova style, neutral base, lucide icons). |
| `vitest.config.ts` | Vitest config (node env; `@/*`→`src/*` alias; runs `src/**/*.test.ts`). |
| `next-env.d.ts` | Next.js TypeScript ambient types (generated, git-ignored). |

## next-intl bilingual config

| Path | Description |
|---|---|
| `src/i18n/routing.ts` | Locale routing: `['mk','en']`, default `mk`, `localePrefix: 'as-needed'`. |
| `src/i18n/request.ts` | Per-request next-intl config; loads `src/messages/<locale>.json`. |
| `src/i18n/navigation.ts` | Locale-aware navigation APIs (`Link`, `redirect`, `usePathname`, …). |
| `src/proxy.ts` | Next.js 16 proxy (ex-middleware) applying next-intl locale routing. |
| `src/messages/mk.json` | Macedonian UI strings (Meta, Landing, Test, Gate, Result, Email, Consent, Privacy, Trial, **Assessment** [v2 flow, Phase 3.05] namespaces; default locale; MK provisional). |
| `src/messages/en.json` | English UI strings (mirror of mk.json incl. **Assessment**). |
| `src/messages/messages.test.ts` | Vitest i18n parity suite (identical mk↔en key sets + matching `{placeholders}` + no empty strings; required-key lists incl. the `Email`, `Consent` + `Privacy` namespaces). |

## App shell & components

| Path | Description |
|---|---|
| `src/app/[locale]/layout.tsx` | Root layout per locale: `<html lang>`, Rubik + Nunito Sans **+ Montserrat (v2 brand font, Phase 3.01)** via `next/font`, `metadataBase`, hreflang, NextIntlClientProvider, **+ `ConsentRoot`** (consent provider + banner + Manage dialog + page-view tracker — phase 2.04) wrapping all pages. |
| `src/app/[locale]/page.tsx` | The landing page (Server Component) — composes the landing sections; per-locale `generateMetadata` (title/description/canonical/hreflang/OG/Twitter). |
| `src/app/[locale]/opengraph-image.tsx` | Dynamic per-locale OG image (1200×630, `next/og` + Cyrillic Rubik woff from `@fontsource/rubik`). |
| `src/app/[locale]/not-found.tsx` | Localized 404 (1.11) — skip-link + header/footer + AA copy, rendered inside the locale layout (correct `<html lang>`). |
| `src/app/[locale]/[...rest]/page.tsx` | Catch-all (1.11): routes unmatched locale paths through `notFound()` → the localized 404 (avoids the global-not-found hydration mismatch). |
| `src/app/not-found.tsx` | Global 404 fallback (1.11) for Next's internal `/_not-found` — self-contained `<html>`, bilingual, skip-link, AA contrast. |
| `src/app/globals.css` | Tailwind v4 + the 1.03 brand tokens (palette, status, strengths, radii, shadows, motion) via `@theme inline`; reduced-motion reset; light-only (no `.dark`). **+ v2 brand primitives (Phase 3.01):** official palette (`--iq-*`, `--index-*`), `--font-brand` Montserrat, `rounded-card/-lg/-badge`, spacing + `--tap-min` (additive; v1 tokens kept). |
| `src/app/favicon.ico` | Default favicon (placeholder until brand asset lands). |
| `src/components/LanguageToggle.tsx` | Accessible MK/EN pill switcher; preserves the current path **and query string** (so a mid-test `?age` survives the switch — 1.11); label via prop. |
| `src/components/ui/button.tsx` | shadcn/ui Button primitive. |
| `src/components/ui/card.tsx` | shadcn/ui Card primitive (used by the hero + step/trust cards). |
| `src/components/ui/radio-group.tsx` | shadcn/ui RadioGroup primitive (design-system; consumed in 1.07). |
| `src/components/ui/label.tsx` | shadcn/ui Label primitive (used by the 1.08 gate form). |
| `src/components/ui/input.tsx` | shadcn/ui Input primitive (handover §B.5: 52px, error/focus states) — 1.08 gate. |
| `src/components/ui/checkbox.tsx` | shadcn/ui Checkbox primitive (unified `radix-ui`; consent + marketing) — 1.08 gate. |
| `src/lib/utils.ts` | `cn()` class-merge helper (clsx + tailwind-merge). |
| `src/lib/bands.ts` | Canonical age bands (`3-5`/`6-9`/`10-13`), `getBandForAge`/`getBand`/`isValidAge`, `BANDS`/`AGES`. |
| `src/lib/bands.test.ts` | Vitest unit tests for band boundaries + out-of-range. |

## Landing page (phase 1.06)

| Path | Description |
|---|---|
| `src/components/landing/SiteHeader.tsx` | Sticky funnel header: wordmark stand-in (home link) + language toggle. |
| `src/components/landing/Hero.tsx` | Hero: eyebrow, h1 hook, honest explainer, age-picker card, trust row, decorative art; resolves age copy server-side. |
| `src/components/landing/AgeStart.tsx` | Client island: age radiogroup (3–13, grouped by band) + gated Start CTA → `/test?age=N`. |
| `src/components/landing/HowItWorks.tsx` | Three-step "how it works" (Lucide icons, numbered). |
| `src/components/landing/TrustCues.tsx` | Four honest parent trust cues. |
| `src/components/landing/Reassurance.tsx` | Reassurance strip with a verified IqUp brand line. |
| `src/components/landing/SiteFooter.tsx` | Footer (wordmark + line + toggle) **+ Privacy policy link (`/privacy`) + Cookie settings button** (re-opens the Manage dialog) — phase 2.04. /about/locations still later. |
| `src/components/landing/Wordmark.tsx` | `IQ UP!` wordmark stand-in (token-styled) — placeholder for the official logo. |
| `src/components/landing/HeroArt.tsx` | Abstract decorative hero visual (`aria-hidden`) — placeholder for licensed Bibi art (never generated). |
| `src/components/landing/Reveal.tsx` | Reduced-motion-safe entrance wrapper (Framer Motion `m`). |
| `src/components/landing/MotionProvider.tsx` | LazyMotion provider (`domAnimation`) wrapping the page. |

## Test engine (phase 1.07)

| Path | Description |
|---|---|
| `src/content/locale.ts` | Tiny shared `Locale`/`Localized` types (no i18n-runtime import) for content + scoring. |
| `src/content/strengths.ts` | The six strengths (spec §1): codes, 1.03 colour-token binding, bilingual display names; shared by scoring + 1.10. |
| `src/content/test/types.ts` | Content schema (spec §4, extended): `GlyphSpec`/`StemSpec` visual model, `TestOption`, `TestQuestion`, `BandContent`. |
| `src/content/test/band-3-5.ts` | Band 3–5 bank — 10 image-only items, transcribed verbatim from spec §5A. |
| `src/content/test/band-6-9.ts` | Band 6–9 bank — 12 text+image items, transcribed verbatim from spec §5B. |
| `src/content/test/band-10-13.ts` | Band 10–13 bank — 14 text+abstract items, transcribed verbatim from spec §5C. |
| `src/content/test/index.ts` | Question-bank registry: `TEST_CONTENT`, `getQuestionsForBand`, `ALL_QUESTIONS`. |
| `src/content/test/content.test.ts` | Vitest content-integrity suite (counts, distribution, one-strength-per-Q, MK/EN parity, reveal items). |
| `src/lib/scoring/types.ts` | `Answers`, `Tier`, `StrengthScore`, and the `TestResult` hand-off contract (no total, no IQ). |
| `src/lib/scoring/score.ts` | Deterministic `score(answers, band, locale)` per spec §3 + the fixed `TIE_BREAK_ORDER`; exports the shared `compareStrengthScores` + `tierForRank` (reused by `reconstruct.ts`). |
| `src/lib/scoring/reconstruct.ts` | `reconstructResult(scores, band, locale)` (2.01): re-derives the on-screen ranked `TestResult` from the lead's stored ratio summary, using the same comparator/tiers as `score()` (no new data). |
| `src/lib/scoring/reconstruct.test.ts` | Vitest: cross-checks `reconstructResult` reproduces `score()`’s exact ranking + tiers for every band × answer shape, plus determinism/edge cases. |
| `src/lib/scoring/storage.ts` | `TEST_RESULT_STORAGE_KEY` + `isTestResult`/`readTestResult` (the sessionStorage hand-off key + typed reader/guard). |
| `src/lib/scoring/storage.test.ts` | Vitest guard suite for `isTestResult` (valid/invalid persisted results). |
| `src/lib/scoring/index.ts` | Scoring public surface (`score`, `TIE_BREAK_ORDER`, `compareStrengthScores`, `tierForRank`, `reconstructResult`, `TEST_RESULT_STORAGE_KEY`, `isTestResult`, `readTestResult`, types). |
| `src/lib/scoring/score.test.ts` | Vitest scoring suite (ranking, tiers, determinism, no-total/no-IQ invariants). |
| `src/app/[locale]/test/page.tsx` | **v2 (Phase 3.05):** server shell for `/test` — per-locale metadata, reads `?age=N`, resolves the whole `Assessment` copy, mounts `AssessmentFlow`. (v1 `TestRunner` no longer mounted.) |
| `src/components/test/TestRunner.tsx` | **v1, orphaned (Phase 3.05):** no longer mounted at `/test`; kept intact until its v2 replacement lands (3.06). Client island: phases (start/running/gate), sessionStorage hand-off. |
| `src/components/test/QuestionView.tsx` | One question: strength chip, prompt (h1), stem, radio-group options, + the reveal mechanic (spec §7). |
| `src/components/test/OptionTile.tsx` | Accessible answer tile (Radix RadioGroup.Item) — image or text variant; icon+colour selected feedback. |
| `src/components/test/ProgressHeader.tsx` | Back affordance + progress bar + "Question X of Y" (aria-live). |
| `src/components/test/StartScreen.tsx` | Calm-play start screen: band pill, headline, meta, "Let's play" CTA. |
| `src/components/test/DevBar.tsx` | Dev-only band-jump + auto-finish bar (stripped in production). |
| `src/components/test/StrengthChip.tsx` | Colour-coded strength chip (icon dot + colour + name). |
| `src/components/test/copy.ts` | `TestCopy` type + `fillTemplate` (server-resolved chrome strings for the island). |
| `src/components/test/visuals/Glyph.tsx` | One puzzle glyph: Lucide for objects, original inline SVG for abstract/missing figures. |
| `src/components/test/visuals/StemVisual.tsx` | Composes glyphs into stems (sequence/grid/count/scene/…); `role="img"` + generated alt. |
| `src/components/test/visuals/lexicon.ts` | `toyVar`, default glyph colours, and locale-aware `stemAlt()` text-alternative generator. |
| `src/components/test/visuals/index.ts` | Visuals barrel (`Glyph`, `StemVisual`, `stemAlt`, `toyVar`). |
| **`src/components/assessment/` — the live v2 assessment flow (Phase 3.05)** | |
| `src/components/assessment/index.ts` | Public barrel: `AssessmentFlow`, `AssessmentCopy`, the hand-off key + types, the index↔domain mapping. |
| `src/components/assessment/AssessmentFlow.tsx` | The client island `/test` mounts: drives the flow per phase, renders the puzzle-brain + the current task, dev autopilot, the `// HANDOFF (3.06)` continue seam. |
| `src/components/assessment/useAssessment.ts` | The orchestrator hook: drives `createDomainController` across all domains, threads telemetry into each `Response`, assembles the `SessionRun`, runs validity, persists the hand-off, retry. |
| `src/components/assessment/types.ts` | Flow types + the index↔task-domain mapping (`REGION_DOMAINS`/`DOMAIN_REGION`/`REGION_HEX`) + `TaskRendererProps`/`AnswerTelemetry`. |
| `src/components/assessment/copy.ts` | `AssessmentCopy` contract (all localized chrome + per-`taskType` instructions) + `rendererCopy` slice helper. |
| `src/components/assessment/telemetry.ts` | `useItemTimer` (silent response-time + idle/blur capture, spec Дел 8) + `baselineFromTaps` (device calibration). |
| `src/components/assessment/session.ts` | The 3.06 hand-off: `generateSeed` (crypto), `persistHandoff`/`readHandoff` to the versioned `iqup.assessmentRun.v1` sessionStorage key (no PII). |
| `src/components/assessment/PuzzleBrain.tsx` | The puzzle-brain progress motif — 5 index-region pentagon pieces that fill (brand hue + check tab) when their domains complete; non-numeric. |
| `src/components/assessment/TaskFrame.tsx` | Shared task frame: instruction, bespoke-SVG stage, the quiet within-domain micro-indicator, action slot. |
| `src/components/assessment/interactions/SelectOneGrid.tsx` | The `select-one` primitive (Radix RadioGroup; keyboard, focus ring, icon+colour selected). |
| `src/components/assessment/interactions/TapField.tsx` | The Gs `multi-tap-timed` field — the ONLY visible countdown; reports marked indices + `tappedCells`. |
| `src/components/assessment/renderers/TaskRenderer.tsx` | Dispatcher: `TaskSpec.taskType` → its renderer. |
| `src/components/assessment/renderers/{GfTask,GvTask,GsmTask,GsTask,EfTask,GlrTask,CtTask}.tsx` | The seven task-type renderers (Gf matrix+series, Gv rotation, Gsm Corsi, Gs search, EF Tower of London, Glr paired-associate, CT 5 sub-types). |
| `src/components/assessment/renderers/ConfirmAction.tsx` | Shared confirm button (≥44px, violet primary, disabled-state non-colour-only). |
| `src/components/assessment/screens/{AgeSetup,ParentAssist,PracticeScreen,CompletionScreen,RetryScreen,ExplorerBadge}.tsx` | Flow screens: age setup (no name), 5–7 parent-assist gate, practice+calibration, completion, not-representative+retry, the "IQ UP! Explorer" badge. |
| `src/components/assessment/visuals/Glyph.tsx` | The language-neutral visual vocabulary: `Glyph`/`PolyShapeGlyph`/`DirectionArrow` + `COLOR_HEX` (bespoke SVG, literal hex). |
| `src/components/assessment/flow.test.ts` | Phase 3.05 flow tests: index↔domain mapping, calibration baseline, hand-off persistence, validity wiring, determinism + `buildProfile` smoke. |
| `.claude/launch.json` | Local preview launch config (dev/prod) for the Claude preview tool (no app effect). |

## Email gate + lead capture (phase 1.08)

| Path | Description |
|---|---|
| `src/components/gate/EmailGate.tsx` | The parent-facing email-gate form island (email, child name, required consent, optional marketing, honeypot); validates, calls the submit action, persists lead-context, navigates to `/result`. |
| `src/components/gate/copy.ts` | `GateCopy` type + `fillName` (server-resolved gate chrome strings). |
| `src/lib/leads/lead-mapping.ts` | Pure/isomorphic mapping: `LEAD_BAND_BY_KEY` + **`BAND_KEY_BY_LEAD`** (inverse, for 2.01), `toTopStrengths` (summary), `buildLeadInput`, `CONSENT_VERSION`, `GateSubmission`/`SubmitResult` types. |
| `src/lib/leads/submit-lead.ts` | `'use server'` `submitLead` action: honeypot check → `buildLeadInput` → service-role `insertLead()` → **`after(() => runAfterLead(...))`** (2.02: fire-and-forget fan-out of all three post-save side-effects, never blocks/affects the save; passes the saved row's `created_at` as the timestamp); returns a typed friendly result. |
| `src/lib/leads/submit-lead.test.ts` | Vitest suite: band map, summary-only/no-IQ, consent-false rejected, honeypot no-insert/no-route, unknown-key stripping, action control flow + after-lead fan-out scheduling. |
| `src/lib/leads/after-lead.ts` | **(2.02)** `runAfterLead(lead)` — the single `after()` callback: fans out the results email (2.01) + Brevo contact upsert (2.02) + internal notification (2.02), each in an `isolate` try/catch inside `Promise.allSettled` (one failure, even synchronous, never blocks the others or propagates). `server-only`. |
| `src/lib/leads/after-lead.test.ts` | Vitest (mocks the 3 collaborators): all three scheduled with the right args; async + synchronous throw isolation; never propagates. |
| `src/lib/leads/lead-context.ts` | `iqup.leadContext.v1` sessionStorage hand-off (`LeadContext` + `isLeadContext`/read/write) — the "gate completed" signal for `/result`. |
| `src/lib/leads/lead-context.test.ts` | Vitest guard suite for `isLeadContext`. |
| `src/app/[locale]/result/page.tsx` | The real `/result` Server shell (SSG): per-locale metadata, resolves `ResultChrome` server-side, mounts `ResultView`, renders header + footer (phase 1.10). |

## Results profile + certificate (phase 1.10)

| Path | Description |
|---|---|
| `src/content/results/types.ts` | Types for the result/strengths-profile copy (`StrengthResultBlurb`, `ResultTemplates`). |
| `src/content/results/strength-copy.ts` | Per-strength §6A blurbs (celebrated + growing) + short badge descriptor, MK verbatim / EN mirror (provisional). |
| `src/content/results/templates.ts` | §6B/§6C wrapper templates per locale (kid celebration, headline, also/growing lines, trial CTA, closing, certificate). |
| `src/content/results/index.ts` | `getResultCopy(result, name, locale)` accessor + `joinNames`/`fillSlots`; assembles celebrated/also/growing copy from the ranked `TestResult`. |
| `src/content/results/results.test.ts` | Vitest: §6 coverage (strength×tier×locale), MK/EN parity, no-forbidden-token (no digits/%/score/rank/deficit), `getResultCopy` assembly. |
| `src/content/centers.ts` | The 10 IqUp centres (single source, from brand.md §4) — `Center` (now + optional `viber?`/`whatsapp?`, unset), `CENTERS`, `getCenter`, `mapsUrlFor` (verified-or-derived Maps search link), `viberHref`/`whatsappHref`. PROVISIONAL (verify phones/addresses). |
| `src/content/centers.test.ts` | Vitest centers integrity (10 centres, required fields, unique ids/emails, https contact URL). |
| `src/components/result/ResultView.tsx` | The real results client island (replaces `ResultPlaceholder` at the `// PLUGS INTO 1.10` seam): reads the hand-off, guards direct access, renders profile + certificate + band handoff. |
| `src/components/result/ResultHero.tsx` | Reveal hero (playful): kid-celebration eyebrow, name-highlighted title, no-scores lede. |
| `src/components/result/StrengthsConstellation.tsx` | Three non-evaluative tiers — celebrated badges, also chip, growing chips (no charts/numbers). |
| `src/components/result/ParentNote.tsx` | Parent-facing §6 prose: headline + celebrated blurbs + also/growing lines. |
| `src/components/result/CertificateCard.tsx` | Scaled certificate preview + Download (html-to-image PNG) + Share (Web Share + copy-link fallback). |
| `src/components/result/Certificate.tsx` | The 1080×1350 portrait certificate artboard (per-child tint, Bibi placeholder, chips, wordmark, date) — capture-safe inline styles. |
| `src/components/result/certificate-model.ts` | Pure certificate logic: deterministic tint rule, name sizing, date format, strength list (Vitest-friendly). |
| `src/components/result/certificate-model.test.ts` | Vitest: tint determinism + AA contrast (every tint the rule can produce) + sizing/date/list. |
| `src/components/result/StrengthGlyph.tsx` | Per-strength inline-SVG glyph (shared by constellation + certificate; capture-safe). |
| `src/components/result/TrialInvite.tsx` | Trial invite (bands 3–5 / 6–9): §6 heading/intro (`{center}` slot) + the shared `TrialBooking` mechanism inline (phase 2.05; old picker/seam removed). |
| `src/components/trial/TrialBooking.tsx` | **Shared** trial-booking mechanism (client island, phase 2.05): native city `<select>` (no geolocation) → chosen-centre card + Call / Email (name-free mailto) / Get directions / optional Viber-WhatsApp + PII-free `trial_cta_click`. Reused by `/trial` + `TrialInvite`. |
| `src/components/trial/resolve-copy.ts` | Server resolver for the `Trial` namespace → `TrialBookingCopy` (shared by the `/trial` page + the result page, so picker/action labels are single-sourced). |
| `src/components/result/CuriousMindEnding.tsx` | Band 10–13 close (no trial) — §6 closing + signoff. |
| `src/components/result/bibi.ts` | Bibi art drop-in swap point (`BIBI_CERT_ART = null` → placeholder until licensed art lands). |
| `src/components/result/copy.ts` | `ResultChrome` type — the server-resolved on-screen chrome handed to `ResultView`. |
| `src/lib/a11y/contrast.ts` | WCAG relative-luminance + contrast-ratio helpers (used by the certificate AA test). |
| `src/app/[locale]/result/opengraph-image.tsx` | Generic, name-free per-locale `/result` OG image (`next/og`, 1200×630, Cyrillic Rubik). |
| `src/app/[locale]/trial/page.tsx` | The public `/trial` (+ `/en/trial`) SSG booking page (phase 2.05): per-locale metadata + hreflang, name-free heading/intro + the shared `TrialBooking` (no band). Slug provisional (`// TODO(mk-slug)`). |
| `src/app/[locale]/trial/opengraph-image.tsx` | Generic, name-free per-locale `/trial` OG image (`next/og`, 1200×630, Cyrillic Rubik — mirrors `/result`). |

## Supabase leads pipeline (phase 1.05)

| Path | Description |
|---|---|
| `supabase/config.toml` | Supabase CLI project config (default template; `project_id = "iqup-web"`; no secrets). |
| `supabase/.gitignore` | Ignores CLI working files (`.branches`, `.temp`) and local env files. |
| `supabase/migrations/20260607204206_create_leads.sql` | Creates `public.leads` (12 cols + CHECK constraints), `created_at DESC` index, enables RLS with no anon policies, revokes anon/authenticated grants. |
| `src/lib/supabase/server.ts` | Server-only service-role client (`getServiceRoleClient()`); `import 'server-only'` guard; reads `SUPABASE_SERVICE_ROLE_KEY`. |
| `src/lib/supabase/client.ts` | Browser anon client (`createBrowserSupabaseClient()`), for future non-leads use; reads the public anon key. |
| `src/lib/supabase/types.ts` | Typed `Database` for the `leads` schema (mirrors `supabase gen types`; verified against the live schema). |
| `src/lib/validation/lead.ts` | zod 4 `leadSchema` + `topStrengthsSchema` (`.strict()`) and `Lead` / `LeadInput` types; the validation source of truth. |
| `src/lib/leads/insert-lead.ts` | `insertLead(input: unknown)` — validates every field, then inserts via the service-role client (server-only). |
| `scripts/test-insert.ts` | Throwaway live end-to-end test (`npm run test:insert`): insert via `insertLead()`, service read, anon read+insert blocked, cleanup. |
| `.env.local.example` | Committed env template (placeholders only): the three Supabase keys + the 2.01 email vars (`BREVO_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`, `TEST_EMAIL_TO`, `NEXT_PUBLIC_SITE_URL`) + the 2.02 CRM/notification vars (`BREVO_LEADS_LIST_ID`, `BREVO_MARKETING_LIST_ID`, `LEAD_NOTIFY_TO`, `LEAD_NOTIFY_FROM`). |

## QA tooling (phase 1.11 — dev-only, not in the app bundle)

| Path | Description |
|---|---|
| `lighthouserc.mobile.cjs` | Lighthouse CI mobile config (median-of-5, fixed simulated slow-4G + 4× CPU, `Accept-Language: mk`) against the prod build. |
| `lighthouserc.desktop.cjs` | Lighthouse CI desktop config (median-of-5, desktop preset). |
| `scripts/lh-median.mjs` | Portable Lighthouse median runner (`npm run lh:median`). Default sweep + output (`docs/qa/Part-1-Phase-11/`) unchanged; phase-2.04 added opt-in env knobs: `LH_OUT_DIR`, `LH_INCLUDE_PRIVACY`, `LH_ONLY="/url:ff:runs"`. |
| `playwright.config.ts` | Playwright config (mobile + desktop projects) for the axe + screenshot QA; runs against the dev server. |
| `tests/e2e/fixtures.ts` | Shared e2e fixtures: valid `TestResult`/`LeadContext` per band (for injecting `/result` states) + helpers. |
| `tests/e2e/a11y.spec.ts` | `@axe-core/playwright` WCAG scans across every route × state × locale (§5); asserts zero serious/critical. |
| `tests/e2e/parity.spec.ts` | Asserts the language switch preserves full path + query (`?age` survives MK↔EN). |
| `tests/e2e/screenshots.spec.ts` | Device-matrix screenshots, no-horizontal-overflow checks, and certificate download/share-fallback on mobile. |
| `.claude/agents/{perf-auditor,a11y-auditor,parity-auditor,device-qa}.md` | Version-controlled, scoped auditor subagent definitions (Workstreams A–D) for repeatable re-runs. |
| `docs/qa/Part-1-Phase-11/` | Evidence record: `lighthouse-medians.json`, `axe-summary.{mobile,desktop}.json`, and `<project>/*.png` device screenshots. |

## Results email — Brevo + React Email + server certificate (phase 2.01)

| Path | Description |
|---|---|
| `src/lib/email/brand.ts` | Literal-hex mirror of the `globals.css` brand tokens (`BRAND`, `STRENGTH_HEX`, `strengthHex`) — for Satori + React Email, which can't resolve CSS vars. |
| `src/lib/email/brevo.ts` | Thin typed Brevo transactional client (`server-only`): `sendTransactionalEmail(params, apiKey)` → `POST /v3/smtp/email`; throws typed `BrevoError` on non-2xx. No SDK. |
| `src/lib/email/brevo.test.ts` | Vitest (mocked `fetch`): endpoint, `api-key` header, body + attachment shape, non-2xx throws `BrevoError`. |
| `src/lib/email/send-results-email.ts` | `server-only` orchestrator: reconstruct ranking → `getResultCopy` → render certificate PNG + email HTML/text → Brevo send. Internally try/caught (never throws); logged no-op when `BREVO_API_KEY` unset. |
| `src/lib/email/send-results-email.test.ts` | Vitest (mocked brevo/cert/render + stubbed env): no-key skip, isolation (never throws), Brevo payload + attachment + tags, same-content-as-screen, locale site URL. |
| `src/lib/email/certificate-image.tsx` | `server-only` Satori certificate renderer (`renderCertificatePng`) — 1080×1350 PNG via `next/og`, Rubik + Nunito Sans (Cyrillic), per-child tint, Bibi placeholder (`BIBI_CERT_ART`). |
| `src/lib/email/certificate-image.test.ts` | Vitest: valid PNG signature + size for Cyrillic/Latin/single-strength samples; different children → different bytes. |
| `src/emails/types.ts` | Shared seam: `EmailChrome` + `ResultsEmailProps` (orchestrator resolves, template consumes). |
| `src/emails/ResultsEmail.tsx` | React Email template (`@react-email/components`): greeting → strengths profile (from `getResultCopy`) → certificate-attached line → trial CTA (3–5/6–9) / curious-mind ending (10–13) → footer. Literal-hex brand, web-safe fonts, mobile-first. |
| `src/emails/render.ts` | `renderResultsEmail(props)` → `{html, text}` via `@react-email/render`. |
| `src/emails/ResultsEmail.test.ts` | Vitest per band × locale: child name + strengths copy present, no forbidden tokens in visible text, trial CTA present (3–5/6–9) / absent (10–13), absolute links. |
| `scripts/test-email.ts` | Dev-only live-delivery check (`npm run test:email`): drives the real orchestrator per band × locale to `TEST_EMAIL_TO`. Refuses prod/CI; reports no-key skip. |
| `scripts/email-runtime/tsconfig.json` | Script-only tsconfig aliasing `server-only`→empty so `test:email` runs under `tsx` without `--conditions=react-server` (which would break the React Email renderer's `react-dom/server`). |
| `scripts/email-runtime/empty.ts` | The empty stub the alias above points at. |
| `docs/qa/Part-2-Phase-01/` | QA evidence: a rendered sample certificate PNG (Cyrillic) + sample email HTML (en 3–5 with trial CTA, mk 10–13 ending). |

## CRM contact routing + new-lead notification (phase 2.02)

| Path | Description |
|---|---|
| `src/lib/email/lead-summary.ts` | Shared, pure presentation helpers (no `server-only`): the `SavedLead` `after()`-context shape + the digit-free human `BAND_LABEL`/`bandLabelFor` (never `band-a/b/c`). Imported by both 2.02 tracks. |
| `src/lib/email/lead-summary.test.ts` | Vitest: band-label coverage, digit-free, and the `band-a/b/c` → human-label mapping. |
| `src/lib/email/brevo-contacts.ts` | `server-only` thin typed Brevo Contacts client: `upsertContact(params, apiKey)` → `POST /v3/contacts` (`api-key` header, `updateEnabled`); throws typed `BrevoContactsError` on non-2xx; tolerates `204` (update). No SDK; no contact id persisted. |
| `src/lib/email/brevo-contacts.test.ts` | Vitest (mocked `fetch`): endpoint, header, body shape (UPPERCASE attributes, integer listIds, `updateEnabled:true`), `201 {id}` vs `204 {}`, non-2xx throws, no forbidden tokens in attributes. |
| `src/lib/email/contact-mapping.ts` | Pure `SavedLead` → Brevo upsert payload: 8 UPPERCASE attributes, `CONTACT_SOURCE`, and `contactListIds` — **the consent gate** (ops list always; marketing list iff `marketingOptIn`). No `server-only`. |
| `src/lib/email/contact-mapping.test.ts` | Vitest (pure): attribute mapping, human BAND label, English `TOP_STRENGTHS`, the consent gate (opt-in → both lists; non-opt-in → ops only), forbidden-word guard over attributes. |
| `src/lib/email/upsert-lead-contact.ts` | `server-only` contact-upsert orchestrator: reads `BREVO_API_KEY` + the two list-id envs (safe parse), builds the payload, calls `upsertContact`; internally try/caught (never throws); no-op + log when `BREVO_API_KEY` unset. |
| `src/lib/email/upsert-lead-contact.test.ts` | Vitest (mocked client + stubbed env): no-key skip, consent gate end-to-end, invalid list id skipped (upsert still runs), never throws on client rejection. |
| `src/lib/email/lead-notification.ts` | Pure internal new-lead notification builder (no `server-only`): `buildLeadNotificationContent` (English subject + HTML + text), `parseNotifyRecipients`, `ageInWords` (worded age), `localeLabel`. |
| `src/lib/email/lead-notification.test.ts` | Vitest (pure): recipient parsing (incl. comma-separated), every required field present, and the no-number guard (masks email/consent-version/timestamp, worded age) over text + tag-stripped HTML. |
| `src/lib/email/send-lead-notification.ts` | `server-only` notification orchestrator: reads `BREVO_API_KEY` + `LEAD_NOTIFY_TO` + `LEAD_NOTIFY_FROM`/`EMAIL_FROM_ADDRESS`, sends via the existing `sendTransactionalEmail` (tags `['lead-notification', band, locale]`); never throws; no-op + log when unconfigured. |
| `src/lib/email/send-lead-notification.test.ts` | Vitest (mocked brevo + stubbed env): no-key/no-recipients/no-sender skips, recipients parsed, from override, tags, never throws on send rejection. |

## Follow-up nurture emails (phase 2.03 — Code half)

| Path | Description |
|---|---|
| `src/lib/email/site-url.ts` | Pure shared seam: `siteUrlFor(locale)` (locale-prefixed site base) + `trialBookingUrl(locale, utmCampaign?)` — **the single trial target** (`/trial` + optional UTM) for the results email, the three trial nurture emails, and the on-screen surface (phase 2.05, decision #119). |
| `src/emails/nurture/copy.ts` | Bilingual (MK+EN) copy for all four nurture emails (subject/preview/heading/greeting/intro/body/cta/footer) + the `MERGE` tags + the legal/postal line; reuses the 2.01 `Email.footer` identity/signoff. No numbers; child-name merge tag with a graceful fallback. MK provisional. |
| `src/emails/nurture/links.ts` | The single link source: per-email `UTM_CAMPAIGN`, `withUtm`, and `ctaHref` — trial emails via `trialBookingUrl` (`/trial`); `welcome-general` keeps its general site-root link (phase 2.05). |
| `src/emails/nurture/styles.ts` | Shared style objects — a faithful reuse of the 2.01 `ResultsEmail` presentation (literal-hex brand, web-safe fonts, same container/button/footer). Not a parallel design system. |
| `src/emails/nurture/NurtureLayout.tsx` | Shared shell (Html/Head/Preview/Body/Container) — wordmark stand-in header + the legally-required marketing footer (identity, transparency line, legal+postal, `{{ unsubscribe }}`, signoff). |
| `src/emails/nurture/NurtureBody.tsx` | Renders one email's data (intro → body → CTA) inside `NurtureLayout`; `ctaKind:'trial'` → the pill CTA button, `ctaKind:'general'` → a quiet link (welcome-general, no trial CTA). |
| `src/emails/nurture/WelcomeTrial.tsx` | `welcome-trial` template (trial track, age ≤ 9) — thin wrapper over `NurtureBody`; takes only `locale`. |
| `src/emails/nurture/WelcomeGeneral.tsx` | `welcome-general` template (general track, age ≥ 10; NO trial CTA) — thin wrapper; takes only `locale`. |
| `src/emails/nurture/TrialInvite.tsx` | `trial-invite` template (trial track; the §2 story→discovery→create lesson + trial CTA) — thin wrapper; takes only `locale`. |
| `src/emails/nurture/Nudge.tsx` | `nudge` template (trial track; gentle final note + trial CTA) — thin wrapper; takes only `locale`. |
| `src/emails/nurture/render.ts` | `renderNurtureEmail(key, locale)` → Brevo-ready HTML (no JSX, so the `.test.ts` can import it); `finalizeMergeTags` restores the literal quotes React escapes inside `{{ }}`. |
| `src/emails/nurture/copy.test.ts` | Vitest: MK/EN parity (same emails/footer keys/body length/ctaKind), every slot present, personalisation (CHILD_FIRST_NAME merge tag; no CHILD_AGE), CTA split, and no forbidden tokens (digit/%/score-IQ-rank, EN+MK) — with a non-vacuous self-check. |
| `src/emails/nurture/render-smoke.test.ts` | Vitest over the rendered HTML: merge tag with literal quotes, unsubscribe + identity + postal address, per-email UTM, trial-CTA present (trial emails) / absent (welcome-general), no forbidden tokens (masking URLs/wordmark/legal line). |
| `scripts/render-nurture.mts` | `npm run emails:nurture` — renders the four templates × 2 locales → 8 static HTML files in `docs/email-templates/Part-2-Phase-03-nurture/` (same script-local tsconfig as 2.01's `test:email`). |
| `docs/email-templates/Part-2-Phase-03-nurture/` | The 8 rendered Brevo-ready HTML templates + `README.md` (the authoritative Cowork hand-off: file→step mapping, subjects/preview, exact Brevo trigger/branch conditions, link/sender notes). |

## Analytics, consent layer + `/privacy` (phase 2.04 — Code half)

| Path | Description |
|---|---|
| `src/lib/consent/constants.ts` | `COOKIE_CONSENT_VERSION` (`cookies-v1-2026-06`), `CONSENT_COOKIE_NAME` (`iqup_consent`), ~6-month max-age — distinct from the lead `CONSENT_VERSION`. |
| `src/lib/consent/types.ts` | `ConsentCategory`/`ConsentState`/`StoredConsent` types (cookie/tracking consent — separate from lead consent). |
| `src/lib/consent/state.ts` | Pure deny-by-default state machine: `DENIED_CONSENT`, `acceptAllState`/`rejectAllState`/`toConsentState`, `buildStoredConsent`. |
| `src/lib/consent/cookie.ts` | Pure + DOM cookie helpers: `serializeConsent`/`parseConsent` (version-mismatch → null), `readConsentCookie`/`writeConsentCookie` (Path=/, SameSite=Lax, Secure in prod). |
| `src/lib/consent/ConsentProvider.tsx` | Cookie-backed `useSyncExternalStore` provider + `useConsent()` hook (deny-by-default; banner post-hydration; no setState-in-effect). |
| `src/lib/consent/consent.test.ts` | Vitest: default-denied, accept/reject/set-preferences, cookie round-trip, **version-bump invalidation**. |
| `src/components/consent/copy.ts` | `ConsentCopy` type — server-resolved banner + Manage dialog chrome (passed to the client islands as props). |
| `src/components/consent/ConsentBanner.tsx` | Non-modal bottom banner: equal-styling **Accept all / Reject** + **Manage**; ≥44px; transform-only motion-safe entrance; renders post-hydration. |
| `src/components/consent/ConsentManageDialog.tsx` | Radix Dialog Manage panel: Necessary (always-on) + Analytics + Marketing toggles **un-pre-ticked** + Save; ESC/overlay close. |
| `src/components/consent/CookieSettingsButton.tsx` | Re-opens the Manage dialog (footer + `/privacy`); consumes `useConsent().openManage`. |
| `src/components/consent/ConsentRoot.tsx` | The locale-layout island: `ConsentProvider` + (dynamic) banner + (dynamic) dialog + page-view tracker (`usePathname()`) + the `syncTrackers(consent)` effect. |
| `src/lib/analytics/env.ts` | Reads the three PUBLIC tracker ids from `process.env.NEXT_PUBLIC_*` + a dev-only no-id notice. |
| `src/lib/analytics/runtime.ts` | Live consent snapshot + per-loader idempotency flags + the `window` (`gtag`/`dataLayer`/`clarity`/`fbq`) global type augmentations. SSR-safe. |
| `src/lib/analytics/track.ts` | `track(event, params?)` — PII-free (sanitised to `{band,locale,path}`), per-category GA/Pixel routing, no-op without consent/env/SDK. |
| `src/lib/analytics/sync.ts` | `syncTrackers(consent)` — load on grant (GA+Clarity / Pixel), re-signal denied/`revoke` on withdrawal; called by `ConsentRoot`. |
| `src/lib/analytics/loaders/ga.ts` | GA4 `gtag.js` injection + Consent Mode defaults-denied→update + `revokeGa`; env-gated; never throws. |
| `src/lib/analytics/loaders/clarity.ts` | Microsoft Clarity injection + `consentv2` signal + revoke; env-gated; notes Cowork disables auto-cookies. |
| `src/lib/analytics/loaders/pixel.ts` | Meta Pixel `fbevents.js` injection + `consent grant`→init→PageView + `revokePixel`; env-gated; `// FUTURE(CAPI 2.x)` note. |
| `src/lib/analytics/track.test.ts` | Vitest: no-op without consent/env, per-category routing, **PII-free payload** assertion (no name/email/age keys). |
| `src/lib/analytics/sync.test.ts` | Vitest: deny-by-default (no scripts injected), idempotent injection, withdrawal re-signalling. |
| `src/content/privacy/types.ts` | Typed privacy-content shape: `PrivacyBlock`/`PrivacySection`/`CookieRow`/`PrivacyContent`. |
| `src/content/privacy/mk.ts` | MK privacy policy (provisional GDPR baseline; provisional MK) + cookie table. |
| `src/content/privacy/en.ts` | EN privacy policy (mirror) + cookie table. |
| `src/content/privacy/index.ts` | `getPrivacyContent(locale)` accessor. |
| `src/content/privacy/privacy.test.ts` | Vitest: MK/EN structural parity (sections + cookie rows) + forbidden-vocab (no score/IQ words; digits allowed; no IqUp false-positive). |
| `src/app/[locale]/privacy/page.tsx` | The `/privacy` (+ `/en/privacy`) SSG page: per-locale metadata + hreflang, structured policy + cookie `<table>` (keyboard-focusable scroll region), Cookie-settings button. |
| `tests/e2e/consent.spec.ts` | Playwright: the headline deny-by-default network assertion (both locales), Accept-loads/Reject-off, banner a11y + equal-style + ESC, `/privacy` axe + lang + skip-link + footer re-open. |
| `docs/qa/Part-2-Phase-04/lighthouse-medians.json` | 2.04 Lighthouse medians (landing/en/test/privacy mobile + desktop). |

## v2 footing — scaffold (phase 3.01)

> New folders, READMEs only — implementation lands in later v2 phases. (`src/lib/scoring/` already existed and is unchanged.)

| Path | Description |
|---|---|
| `src/lib/engine/README.md` | Adaptive basal/ceiling engine (deterministic, no AI) — spec Дел 5. |
| `src/lib/validity/README.md` | Validity flags, timing, the derived attention signal, per-domain confidence — spec Дел 7–8. |
| `src/lib/report/README.md` | Deterministic report-assembly engine (no AI) — spec Дел 9. |
| `src/lib/pdf/README.md` | Server-side PDF report via `@react-pdf/renderer`; pentagon = custom SVG — spec Дел 10. |
| `src/content/tasks/README.md` | The item bank seam doc (3.04 generators → 3.05 renderer) — spec Дел 4 / Прилог A. _(See the `src/content/tasks/*` file rows below for the shipped generators.)_ |
| `src/content/norms/README.md` | Age norms + scoring weights (seed) — spec Дел 6 / Прилог B. |
| `src/content/report/README.md` | Report module library (copy: strengths/growth/style/STEM modules) — spec Дел 9.2 / Прилог C. |

## v2 engine + scoring + validity (phase 3.03)

> The deterministic, no-AI logic layer — pure code, no UI/content/persistence. v1 scoring (rows above) is untouched; v2 imports nothing from it.

| Path | Description |
|---|---|
| `src/lib/engine/prng.ts` | Seedable PRNG: mulberry32 + xmur3 string hash + `deriveSeed` (per-domain streams) + `nextInt`/`pick`/`shuffle`. The utility 3.04 reuses. |
| `src/lib/engine/prng.test.ts` | Vitest: PRNG determinism, seed independence, helper bounds. |
| `src/lib/engine/types.ts` | INPUT seam: `Item`/`ItemProvider`/`Response`/`ItemScoringMeta` + `Domain`/`AgeCluster`/`ItemFormat`/levels (spec Дел 3/5). |
| `src/lib/engine/engine.ts` | Adaptive basal/ceiling motor: start level by age, ±level, discontinue/cap, format selection; `createDomainController` (step API) + `runDomain`/`runSession`; emits `SessionRun`. |
| `src/lib/engine/engine.test.ts` | Vitest: start levels, stepping, ceiling/cap, format, extended battery, controller, determinism (byte-identical path; seed changes path; domain independence). |
| `src/lib/engine/fixtures.ts` | Deterministic stub `ItemProvider` + responders (`alwaysCorrect`/`alwaysWrong`/`correctUpToLevel`/`scripted`) for engine/scoring tests; reused by 3.04. |
| `src/lib/engine/index.ts` | Engine public surface (types + PRNG + engine API). |
| `src/lib/engine/README.md` | Both seams (input/output) documented for 3.04 / 3.07 / 3.09 (updated 3.03). |
| `src/lib/scoring/v2/types.ts` | OUTPUT seam: `Signal`/`IndexId`/`Band`/`Confidence`/`DerivedFeatures`/`CognitiveProfile` (consumed by 3.05/3.06/3.07/3.09). |
| `src/lib/scoring/v2/weights.ts` | The 5 composite-index weights (spec 6.3) — the single named home. |
| `src/lib/scoring/v2/normalize.ts` | Прилог B.2 raw→index formulas (accuracy/span/speed) + `clampIndex` [8,99]. |
| `src/lib/scoring/v2/raw.ts` | Per-domain raw scores from a `DomainRun` (weighted accuracy, max span, Gs net/time, learning slope, mean RT) + the credit/calibration seam. |
| `src/lib/scoring/v2/collect.ts` | Flatten a `SessionRun` into validity/attention input shapes. |
| `src/lib/scoring/v2/signals.ts` | The 8 signals: raw → per-age index, incl. derived attention + calibration-relative timing. |
| `src/lib/scoring/v2/bands.ts` | `bandFor(value)` — the spec 6.4 cutoffs as a stable enum (no display words). |
| `src/lib/scoring/v2/confidence.ts` | Per-signal confidence (item count + consistency + validity) + weakest-link index confidence (spec 6.5; PROVISIONAL thresholds). |
| `src/lib/scoring/v2/indices.ts` | `compositeValue` — weighted-sum index value from the signal indices. |
| `src/lib/scoring/v2/features.ts` | Derived structural features (profile shape, pairs, solving style, memory asymmetry, learning slope, ceiling/floor) — spec 9.1. |
| `src/lib/scoring/v2/profile.ts` | `buildProfile(SessionRun)` → `CognitiveProfile` (assembles signals→indices→bands→confidence→features→validity + versions). |
| `src/lib/scoring/v2/index.ts` | v2 scoring public surface. |
| `src/lib/scoring/v2/README.md` | Pipeline, the no-user-facing-numbers rule, per-age normalization, v1 separation. |
| `src/lib/scoring/v2/{normalize,bands,composite,confidence,features,profile}.test.ts` | Vitest: B.2 math, band edges, the 5 composites, confidence reachability, features, golden sessions + invariants + no-numbers-leak + determinism. |
| `src/lib/validity/types.ts` | Validity types: flag kinds/severity, `ValidityOutcome`/`ValiditySummary`, `AttentionDerivation`. |
| `src/lib/validity/attention.ts` | Derived attention `raw = clamp(1 − normVariability − impulsiveRate, 0, 1)`, calibration-relative (spec 6.1). |
| `src/lib/validity/flags.ts` | The 5 validity flags as pure detectors (too-fast/same-position/idle/chance-level/speed-gaming) — spec 7.1. |
| `src/lib/validity/policy.ts` | Graduated-outcome policy (mild→gentle_note, strong→not_representative) + `evaluateValidity`. |
| `src/lib/validity/index.ts` | Validity public surface. |
| `src/lib/validity/{attention,flags,policy}.test.ts` | Vitest: attention edge inputs, each flag fires/silent, the graduated policy. |
| `src/lib/validity/README.md` | Validity layer overview (updated 3.03). |
| `src/content/norms/index.ts` | Seed norms (PROVISIONAL): start levels, span (B.1), B.2 coefficients, band cutoffs, caps+ceiling, validity/confidence/feature thresholds, speed table + calibration ref; `NORMS_VERSION`. |
| `src/content/norms/norms.test.ts` | Vitest: norm-table coverage, span/speed monotonicity, caps, extended battery. |
| `src/content/tasks/provider.ts` | `createTaskItemProvider()` → the engine's `ItemProvider` + `getPracticeItem(domain)`; the production item source (3.04). |
| `src/content/tasks/types.ts` | `TaskSpec` discriminated union (the 3.05 rendering contract): per-task `payload` + `interaction` (input model as data) + separated `solution`. |
| `src/content/tasks/glyphs.ts` | Language-neutral token catalogs (`Glyph`/`ColorToken`/`Direction`) + polyomino geometry (`rotate`/`mirrorH`/`randomAsymmetricShape`). |
| `src/content/tasks/shared.ts` | Item id builder, equality helpers, the generic `correctAnswerFor`/`wrongAnswerFor` oracle (keyed off `interaction.mode`). |
| `src/content/tasks/gf.ts` | Gf generator: 3×3 matrices + number/shape series (Прилог A.1). Reference template. |
| `src/content/tasks/gv.ts` | Gv generator: mental rotation over polyomino shapes (A.2; 90/180/270°). |
| `src/content/tasks/gsm.ts` | Gsm generator: Corsi span, forward/backward by `ItemFormat` (A.3); `meta.spanLength`. |
| `src/content/tasks/gs.ts` | Gs generator: timed symbol search (A.4); `meta.cellCount`+`targetCount`, credit net of penalty. |
| `src/content/tasks/ef.ts` | EF generator: Tower of London + exhaustive BFS solver (A.5); `meta.minMoves`. |
| `src/content/tasks/glr.ts` | Glr generator: paired-associate, WeakMap-memoized multi-attempt learning block (A.6); `meta.attempt`. |
| `src/content/tasks/ct.ts` | CT generator: 5 sub-types (sequence/debug/loop/conditional/maze) + shared grid simulator (A.8 + Дел 4). |
| `src/content/tasks/index.ts` | Item-bank public surface (`@/content/tasks`): provider, types, generators, oracle. |
| `src/content/tasks/{gf,gv,gsm,gs,ef,glr,ct}.test.ts` | Vitest per generator: determinism, format, answer correctness, difficulty sanity, scoring-meta, practice, no-forbidden-token. |
| `src/content/tasks/provider.test.ts` | Vitest: provider contract over all domains, no-`Math.random` source scan, whole-bank no-forbidden-token. |
| `src/content/tasks/integration.test.ts` | Vitest (headline): full session through engine + real provider + v2 scoring → byte-identical `SessionRun` + `CognitiveProfile`; variety; Gsm format by age; Glr slope. |
| `src/content/tasks/README.md` | The 3.04→3.05 seam doc: provider, content-spec contract, determinism guarantee, PROVISIONAL parameters. |

## Project-state docs

| Path | Description |
|---|---|
| `src/_project-state/current-state.md` | Live snapshot of the repo, updated every phase. |
| `src/_project-state/file-map.md` | This file. |
| `src/_project-state/00_stack-and-config.md` | Append-only stack + config log with pinned versions. |
| `src/_project-state/Part-X-Phase-YY-Completion.template.md` | Reusable completion-report template. |
| `src/_project-state/Part-1-Phase-02-Completion.md` | Phase 1.02 completion report. |
| `src/_project-state/Part-1-Phase-03-Completion.md` | Phase 1.03 completion report (design foundation). |
| `src/_project-state/Part-1-Phase-04-Completion.md` | Phase 1.04 completion report (test content + scoring). |
| `src/_project-state/Part-1-Phase-05-Completion.md` | Phase 1.05 completion report. |
| `src/_project-state/Part-1-Phase-05-Cowork-Completion.md` | Phase 1.05 Cowork-half completion report (Supabase project + schema setup). |
| `src/_project-state/Part-1-Phase-06-Completion.md` | Phase 1.06 completion report. |
| `src/_project-state/Part-1-Phase-07-Completion.md` | Phase 1.07 completion report. |
| `src/_project-state/Part-1-Phase-08-Completion.md` | Phase 1.08 completion report. |
| `src/_project-state/Part-1-Phase-10-Completion.md` | Phase 1.10 completion report. |
| `src/_project-state/Part-1-Phase-11-Completion.md` | Phase 1.11 completion report (parity + a11y + performance finalisation). |
| `src/_project-state/Part-2-Phase-01-Completion.md` | Phase 2.01 completion report (results email: Brevo + React Email + server certificate). |
| `src/_project-state/Part-2-Phase-02-Completion.md` | Phase 2.02 completion report (CRM contact routing + new-lead notification). |
| `src/_project-state/Part-2-Phase-03-Code-Completion.md` | Phase 2.03 completion report (follow-up nurture emails — Code half). |
| `src/_project-state/Part-2-Phase-04-Code-Completion.md` | Phase 2.04 completion report (analytics, consent layer + `/privacy`). |
| `src/_project-state/Part-2-Checkpoint-Verify-Reconcile-Completion.md` | New-machine checkpoint report (2026-06-19): verify build green on macOS + reconcile project-state docs. |
| `src/_project-state/Part-3-Phase-00-Completion.md` | Part 3 Phase 00 audit: v1→v2 build inventory + verdicts (read-only). |
| `src/_project-state/Part-3-Phase-01-Completion.md` | Part 3 Phase 01: repo onto v2 footing (docs + brand tokens + react-pdf + scaffold). |
| `src/_project-state/Mac-Setup-Completion.md` | Windows→macOS machine-setup work log (operator setup; repo move + toolchain install). |

## Design handovers

| Path | Description |
|---|---|
| `docs/design-handovers/Part-1-Phase-03-Handover.md` | 1.03 Design Foundation: tokens, type, components, landing + test layout. |
| `docs/design-handovers/Part-1-Phase-09-Handover.md` | 1.09 Results + Certificate handover — an honest index pointing at the delivered HTML mockups (the written handover was not delivered; see the file's note). |
| `docs/design-handovers/Part-1-Phase-09-assets/` | The delivered 1.09 mockups (`Result.html`, `Certificate.html`, `Phase-09-Mockups.html`) + a reconstructed `tokens.css` (review aid) + `sample-certificates/` (a live PNG rendered by the 1.10 build). |

## Reserved folders (tracked, filled in later phases)

| Path | Description |
|---|---|
| `public/bibi/.gitkeep` | Licensed Bibi image assets (gathered by Cowork) — still awaiting; `HeroArt` + the certificate placeholder stand in until then. |
| `public/og/.gitkeep` | Static OG images (not needed — the OG image is generated dynamically per locale). |

*(`src/lib/supabase/.gitkeep` was removed in phase 1.05, `src/content/test/.gitkeep` + `src/lib/scoring/.gitkeep` in phase 1.07, and `src/content/results/.gitkeep` in phase 1.10, now that those folders hold real files.)*

*(Phase 1.11 deleted the two non-canonical duplicate copies of the 1.04 content spec — `Part-1-Phase-04-Content-Spec.md` (repo root) and `docs/Part-1-Phase-04-Content-Spec.md`. The canonical `docs/content/Part-1-Phase-04-Content-Spec.md` is unchanged. No code referenced the deleted paths; the only live doc references already point at the canonical copy.)*
