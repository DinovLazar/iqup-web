# IqUp-Web — File Map

> A live map of every meaningful file in the repo with a one-line description. **Code maintains this:** add a row whenever a file is created, update it when a file's purpose changes, remove it when a file is deleted. Keep each description to one line. (Generated build artifacts and `node_modules/` are omitted.)

---

## Root — canonical docs & config

| Path | Description |
|---|---|
| `project-instructions.md` | The project rulebook (four-Claudes model, phase workflow, quality bar). |
| `plan.md` | Full build spec for the finished site (§9 is the authoritative folder structure). |
| `phase-plan.md` | Living index of every phase and its status. |
| `brand.md` | IqUp brand source-of-truth (from phase 1.01). |
| `Decisions.md` | Append-only log of project decisions. |
| `AGENTS.md` | Canonical, tool-neutral rules for any coding agent. |
| `CLAUDE.md` | Claude Code entry point; defers to `AGENTS.md`. |
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
| `src/messages/mk.json` | Macedonian UI strings (Meta, Landing, Test, Gate, Result namespaces; default locale; draft). |
| `src/messages/en.json` | English UI strings (mirror of mk.json; draft). |
| `src/messages/messages.test.ts` | Vitest i18n parity suite (identical mk↔en key sets + matching `{placeholders}` + no empty strings). |

## App shell & components

| Path | Description |
|---|---|
| `src/app/[locale]/layout.tsx` | Root layout per locale: `<html lang>`, Rubik + Nunito Sans (`next/font`), `metadataBase`, hreflang, NextIntlClientProvider. |
| `src/app/[locale]/page.tsx` | The landing page (Server Component) — composes the landing sections; per-locale `generateMetadata` (title/description/canonical/hreflang/OG/Twitter). |
| `src/app/[locale]/opengraph-image.tsx` | Dynamic per-locale OG image (1200×630, `next/og` + Cyrillic Rubik woff from `@fontsource/rubik`). |
| `src/app/[locale]/not-found.tsx` | Localized 404 (1.11) — skip-link + header/footer + AA copy, rendered inside the locale layout (correct `<html lang>`). |
| `src/app/[locale]/[...rest]/page.tsx` | Catch-all (1.11): routes unmatched locale paths through `notFound()` → the localized 404 (avoids the global-not-found hydration mismatch). |
| `src/app/not-found.tsx` | Global 404 fallback (1.11) for Next's internal `/_not-found` — self-contained `<html>`, bilingual, skip-link, AA contrast. |
| `src/app/globals.css` | Tailwind v4 + the 1.03 brand tokens (palette, status, strengths, radii, shadows, motion) via `@theme inline`; reduced-motion reset; light-only (no `.dark`). |
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
| `src/components/landing/SiteFooter.tsx` | Minimal footer (wordmark + line + toggle); /about + /privacy intentionally omitted. |
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
| `src/lib/scoring/score.ts` | Deterministic `score(answers, band, locale)` per spec §3 + the fixed `TIE_BREAK_ORDER`. |
| `src/lib/scoring/storage.ts` | `TEST_RESULT_STORAGE_KEY` + `isTestResult`/`readTestResult` (the sessionStorage hand-off key + typed reader/guard). |
| `src/lib/scoring/storage.test.ts` | Vitest guard suite for `isTestResult` (valid/invalid persisted results). |
| `src/lib/scoring/index.ts` | Scoring public surface (`score`, `TIE_BREAK_ORDER`, `TEST_RESULT_STORAGE_KEY`, `isTestResult`, `readTestResult`, types). |
| `src/lib/scoring/score.test.ts` | Vitest scoring suite (ranking, tiers, determinism, no-total/no-IQ invariants). |
| `src/app/[locale]/test/page.tsx` | Server shell for `/test`: per-locale metadata, `?age=N`→band, runner mount (passes `age` + resolved `gateCopy`), age-picker fallback. |
| `src/components/test/TestRunner.tsx` | Client island: phases (start/running/**gate**), answers, sessionStorage hand-off, dynamic-imported `EmailGate`, dev preview wiring. |
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
| `.claude/launch.json` | Local preview launch config (dev/prod) for the Claude preview tool (no app effect). |

## Email gate + lead capture (phase 1.08)

| Path | Description |
|---|---|
| `src/components/gate/EmailGate.tsx` | The parent-facing email-gate form island (email, child name, required consent, optional marketing, honeypot); validates, calls the submit action, persists lead-context, navigates to `/result`. |
| `src/components/gate/copy.ts` | `GateCopy` type + `fillName` (server-resolved gate chrome strings). |
| `src/lib/leads/lead-mapping.ts` | Pure/isomorphic mapping: `LEAD_BAND_BY_KEY`, `toTopStrengths` (summary), `buildLeadInput`, `CONSENT_VERSION`, `GateSubmission`/`SubmitResult` types. |
| `src/lib/leads/submit-lead.ts` | `'use server'` `submitLead` action: honeypot check → `buildLeadInput` → existing service-role `insertLead()`; returns a typed friendly result. |
| `src/lib/leads/submit-lead.test.ts` | Vitest suite: band map, summary-only/no-IQ, consent-false rejected, honeypot no-insert, unknown-key stripping, action control flow. |
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
| `src/content/centers.ts` | The 10 IqUp centres (single source, from brand.md §4) — `Center`, `CENTERS`, `getCenter`, `IQUP_CONTACT_URL`. PROVISIONAL (verify phones/addresses). |
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
| `src/components/result/TrialInvite.tsx` | Trial invite (bands 3–5 / 6–9): city picker + chosen-centre card + working contact CTAs (`// TODO(booking 2.05)`). |
| `src/components/result/CuriousMindEnding.tsx` | Band 10–13 close (no trial) — §6 closing + signoff. |
| `src/components/result/bibi.ts` | Bibi art drop-in swap point (`BIBI_CERT_ART = null` → placeholder until licensed art lands). |
| `src/components/result/copy.ts` | `ResultChrome` type — the server-resolved on-screen chrome handed to `ResultView`. |
| `src/lib/a11y/contrast.ts` | WCAG relative-luminance + contrast-ratio helpers (used by the certificate AA test). |
| `src/app/[locale]/result/opengraph-image.tsx` | Generic, name-free per-locale `/result` OG image (`next/og`, 1200×630, Cyrillic Rubik). |

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
| `.env.local.example` | Committed env template (placeholders only) for the three Supabase keys. |

## QA tooling (phase 1.11 — dev-only, not in the app bundle)

| Path | Description |
|---|---|
| `lighthouserc.mobile.cjs` | Lighthouse CI mobile config (median-of-5, fixed simulated slow-4G + 4× CPU, `Accept-Language: mk`) against the prod build. |
| `lighthouserc.desktop.cjs` | Lighthouse CI desktop config (median-of-5, desktop preset). |
| `scripts/lh-median.mjs` | Windows-tolerant Lighthouse median runner (`npm run lh:median`) — calls Lighthouse directly and reads each report despite the post-run temp-dir `EPERM` that makes LHCI discard runs on this machine. Writes `docs/qa/Part-1-Phase-11/lighthouse-medians.json`. |
| `playwright.config.ts` | Playwright config (mobile + desktop projects) for the axe + screenshot QA; runs against the dev server. |
| `tests/e2e/fixtures.ts` | Shared e2e fixtures: valid `TestResult`/`LeadContext` per band (for injecting `/result` states) + helpers. |
| `tests/e2e/a11y.spec.ts` | `@axe-core/playwright` WCAG scans across every route × state × locale (§5); asserts zero serious/critical. |
| `tests/e2e/parity.spec.ts` | Asserts the language switch preserves full path + query (`?age` survives MK↔EN). |
| `tests/e2e/screenshots.spec.ts` | Device-matrix screenshots, no-horizontal-overflow checks, and certificate download/share-fallback on mobile. |
| `.claude/agents/{perf-auditor,a11y-auditor,parity-auditor,device-qa}.md` | Version-controlled, scoped auditor subagent definitions (Workstreams A–D) for repeatable re-runs. |
| `docs/qa/Part-1-Phase-11/` | Evidence record: `lighthouse-medians.json`, `axe-summary.{mobile,desktop}.json`, and `<project>/*.png` device screenshots. |

## Project-state docs

| Path | Description |
|---|---|
| `src/_project-state/current-state.md` | Live snapshot of the repo, updated every phase. |
| `src/_project-state/file-map.md` | This file. |
| `src/_project-state/00_stack-and-config.md` | Append-only stack + config log with pinned versions. |
| `src/_project-state/Part-X-Phase-YY-Completion.template.md` | Reusable completion-report template. |
| `src/_project-state/Part-1-Phase-02-Completion.md` | Phase 1.02 completion report. |
| `src/_project-state/Part-1-Phase-05-Completion.md` | Phase 1.05 completion report. |
| `src/_project-state/Part-1-Phase-06-Completion.md` | Phase 1.06 completion report. |
| `src/_project-state/Part-1-Phase-07-Completion.md` | Phase 1.07 completion report. |
| `src/_project-state/Part-1-Phase-08-Completion.md` | Phase 1.08 completion report. |
| `src/_project-state/Part-1-Phase-10-Completion.md` | Phase 1.10 completion report. |
| `src/_project-state/Part-1-Phase-11-Completion.md` | Phase 1.11 completion report (parity + a11y + performance finalisation). |

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
