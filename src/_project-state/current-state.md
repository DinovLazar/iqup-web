# IqUp-Web — Current State

> Live snapshot of the repo. **Code updates this at the end of every phase.** If this and the live code ever disagree, the live code wins.

**Last updated:** 2026-06-08 — after Phase 1.07 (test engine: content, scoring, runner, hand-off).

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

Installed and wired: **Next.js 16.2.7** (App Router, Turbopack) · **React 19.2.4** · **TypeScript 5.9.3** · **Tailwind CSS v4** (brand tokens from the 1.03 handover) · **shadcn/ui** (radix-nova style) · **next-intl 4.13.0** · **Framer Motion 12.40.0** (via LazyMotion) · **@fontsource/rubik 5.2.8** (OG-image font) · **@supabase/supabase-js 2.107.0** · **zod 4.4.3** · **server-only 0.0.1** · dev: **Vitest 4.1.8**, **supabase CLI 2.105.0**, **tsx 4.22.4**. Fonts: **Rubik** (display) + **Nunito Sans** (body) via `next/font/google` (Latin + Cyrillic). Exact pinned versions in `00_stack-and-config.md`.

Not installed yet (deferred to the phase that needs them): analytics / Microsoft Clarity / Meta Pixel.

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
- Locale routing works: `/` serves MK, `/en` serves EN, and `/mk` 307-redirects to the canonical `/` (next-intl `as-needed`).
- `/_not-found` is handled by Next.js's default.

## Components built

- `src/components/landing/` — `SiteHeader`, `Hero`, `AgeStart` (client island: age radiogroup +
  gated Start link), `HowItWorks`, `TrustCues`, `Reassurance`, `SiteFooter`, `Wordmark` (logo
  stand-in), `HeroArt` (abstract decorative placeholder for licensed Bibi art), `Reveal` +
  `MotionProvider` (LazyMotion entrance animation).
- `src/components/LanguageToggle.tsx` — accessible MK/EN **pill** switcher; preserves the current
  path (sets `NEXT_LOCALE` on switch); takes its label as a prop.
- `src/components/ui/` — `button.tsx`, `card.tsx` (used), `radio-group.tsx` + `label.tsx`
  (design-system primitives added per the handover; consumed in 1.07/1.08).
- `src/lib/bands.ts` — canonical band definitions (`3-5`/`6-9`/`10-13`), `getBandForAge`,
  `isValidAge`, `BANDS`/`AGES` (+ `bands.test.ts`, Vitest).
- `src/components/test/` — the runner island and its parts: `TestRunner` (phases + answers +
  hand-off + dev wiring), `QuestionView` (one question + reveal mechanic), `OptionTile`,
  `ProgressHeader`, `StartScreen`, `CompletionView`, `DevBar`, `StrengthChip`, `copy.ts`, and
  `visuals/` (`Glyph`, `StemVisual`, `lexicon`) — original inline-SVG + Lucide puzzle graphics.

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
- **1.08 plugs in** at the `// HANDOFF (1.08)` seam in `TestRunner`/`CompletionView` — it should
  intercept after completion (read the sessionStorage result) and call `insertLead()` from 1.05.
  **1.10 plugs in** by reading the same `TestResult` and rendering the strengths profile + certificate
  from the §6 templates (it imports the strengths taxonomy from `src/content/strengths.ts`).
- **Reveal mechanic** (spec §7) for the 5 memory items: "Ready?" → stimulus shown for `revealMs` →
  auto-hides → question; reduced-motion gets a manual Show / "I'm ready" path (no timer).
- **i18n:** a `Test` namespace in `mk.json` + `en.json` (exact key parity) holds the runner chrome;
  question/option content stays in `src/content/test/`.
- **Dev preview:** `/test?age=N&dev=1` (non-production only) shows a band-jump + auto-finish bar and a
  strengths summary on completion; forced off / stripped in production.

## Bilingual shell

- next-intl wired: `routing.ts` (locales `mk`/`en`, default `mk`, `localePrefix: 'as-needed'`), `request.ts` (loads `src/messages/<locale>.json`), `navigation.ts`, and `src/proxy.ts` (Next 16 middleware convention).
- Per-locale `<html lang>` and hreflang alternates (`mk` → `/`, `en` → `/en`, `x-default` → `/`); landing also sets per-locale canonical + OG.
- UI strings in `src/messages/mk.json` and `src/messages/en.json` (Meta + Landing namespaces; exact key parity). **All landing copy is draft pending native-MK review.**

## Integrations wired

- **Supabase leads pipeline (phase 1.05) — live & verified.** The `leads` table
  exists in the EU project (`cpxssfodboukznzaksnb`, `eu-central-1`) with RLS enabled,
  no anon policies, and anon grants revoked. Server-side path: `insertLead(input)`
  (`src/lib/leads/insert-lead.ts`) validates with the zod `leadSchema`
  (`src/lib/validation/lead.ts`) and inserts via the service-role client
  (`src/lib/supabase/server.ts`). A browser anon client (`client.ts`) exists for
  future non-leads use. Proven end-to-end by `npm run test:insert` (anon is denied
  read + write; service-role insert/read/cleanup works; table left empty).
  **The email-gate form + submit route (1.08) just need to call `insertLead()`.**
- analytics / Pixel / email = Part 2.

## Reserved folders (created, awaiting content)

`public/bibi/` (licensed Bibi art — still awaiting; `HeroArt` is an abstract placeholder until it lands), `public/og/` (no static OG needed — the OG image is dynamic), `src/content/results/` — tracked with a `.gitkeep` (strengths-profile templates land in 1.10). (`src/lib/supabase/`, `src/content/test/`, `src/lib/scoring/`, and `docs/design-handovers/` now hold real files.)

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

- **Mobile Lighthouse Performance ~87 (<95)** — documented reason (web-font-gated LCP on simulated
  slow-4G + framework JS baseline + noisy machine); real-world perf is good. Finalize in 1.11.
- **Licensed Bibi art / official logo / official OG art** — drop into `public/bibi/`, the `Wordmark`
  component, and the OG image when provided. Never generate/redraw the characters.
- **Native-Macedonian copy review + IqUp sign-off** — all landing copy is draft. **Phase 1.07 adds
  more provisional MK to review:** every test question + option (the 36 items, MK verbatim from the
  1.04 spec), the `Test` chrome strings, and the generated stem alt-text in `visuals/lexicon.ts` — all
  Claude-drafted/transcribed and pending native-MK review (EN is the mirror and must stay equivalent).
- **`/test` language toggle drops `?age` mid-test** — `LanguageToggle` uses `usePathname` (query-less),
  so switching MK/EN during the test returns to the age picker rather than preserving the age. Minor;
  carry the age across the locale switch in a later polish pass if desired.
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
- **`.mcp.json` (untracked)** points at the wrong Supabase project
  (`jkceucgiurcfgltfhvin`); unused by the build — correct or delete it.

## Known issues

- None blocking. (`db:push` / `db:types` need a one-time `supabase login` + `link`;
  this machine's sandbox can't reach the Postgres port, so the migration was applied
  via the dashboard SQL editor.)

## Suggested next phase

**1.08 — Email gate:** intercept at the `// HANDOFF (1.08)` seam (after test completion, before
results), capture the parent email/consent, read the `TestResult` from `sessionStorage`
(`iqup.testResult.v1`), and call `insertLead()` from 1.05 (storing only the `top_strengths` summary,
never raw answers). And/or **1.10 — Results + certificate:** read the same `TestResult`, import the
strengths taxonomy from `src/content/strengths.ts`, and render the strengths profile + shareable
certificate from the 1.04 spec §6 templates (create `src/content/results/`). Both now have a clean,
typed hand-off to build on; the test engine, band definitions, and lead plumbing are done and verified.
