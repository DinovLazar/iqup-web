# IqUp-Web — Current State

> Live snapshot of the repo. **Code updates this at the end of every phase.** If this and the live code ever disagree, the live code wins.

**Last updated:** 2026-06-09 — after Phase 1.08 (email gate + lead capture: gate form, server-action submit, temporary `/result`). The funnel is now complete end-to-end: land → test → email gate → results.

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
  Now passes the exact `age` and the resolved gate copy to the runner (phase 1.08).
- `src/app/[locale]/result/page.tsx` — the **temporary results page** (phase 1.08): a Server Component
  shell + a client island (`ResultPlaceholder`) that reads `iqup.testResult.v1` + `iqup.leadContext.v1`
  from sessionStorage and shows the child's first name + top 3 strengths (clearly a placeholder; **no
  total/IQ/certificate**). Guards direct access (redirects home if either key is missing). Per-locale
  `generateMetadata`. **Static (SSG)** route. 1.10 replaces the island at the `// PLUGS INTO 1.10` seam.
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
- `src/components/result/` — `ResultPlaceholder` (the 1.08 temporary results island).
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
- analytics / Pixel / email = Part 2.

## Reserved folders (created, awaiting content)

`public/bibi/` (licensed Bibi art — still awaiting; `HeroArt` is an abstract placeholder until it lands), `public/og/` (no static OG needed — the OG image is dynamic), `src/content/results/` — tracked with a `.gitkeep` (strengths-profile templates land in 1.10). (`src/lib/supabase/`, `src/content/test/`, `src/lib/scoring/`, and `docs/design-handovers/` now hold real files.)

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

- **Mobile Lighthouse Performance ~87 (<95)** — documented reason (web-font-gated LCP on simulated
  slow-4G + framework JS baseline + noisy machine); real-world perf is good. Finalize in 1.11.
- **Licensed Bibi art / official logo / official OG art** — drop into `public/bibi/`, the `Wordmark`
  component, and the OG image when provided. Never generate/redraw the characters.
- **Native-Macedonian copy review + IqUp sign-off** — all landing copy is draft. **Phase 1.07 adds
  more provisional MK to review:** every test question + option (the 36 items, MK verbatim from the
  1.04 spec), the `Test` chrome strings, and the generated stem alt-text in `visuals/lexicon.ts` — all
  Claude-drafted/transcribed and pending native-MK review (EN is the mirror and must stay equivalent).
  **Phase 1.08 adds the `Gate` + `Result` strings**, including the **draft consent + marketing wording**
  — provisional MK, and the consent/marketing wording also needs **IqUp legal sign-off** (it is tied to
  `CONSENT_VERSION = 'v1-draft-2026-06'` in `src/lib/leads/lead-mapping.ts`; bump the version when the
  wording is finalised). The `/privacy` page + the consent-link land in Part 2 (plain-text seam now).
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

**1.09 (Design) → 1.10 (Build) — Results + certificate:** replace the temporary `/result` island at
the `// PLUGS INTO 1.10` seam in `src/components/result/ResultPlaceholder.tsx` with the real strengths
profile + shareable certificate. It reads the same hand-off the gate already produces — the persisted
`TestResult` (`iqup.testResult.v1`) + the lead context (`iqup.leadContext.v1`, `{childFirstName, age,
submittedAt}`) — and imports the strengths taxonomy from `src/content/strengths.ts`, building from the
1.04 spec §6 templates (create `src/content/results/`). **1.11** finalises the mobile-perf sweep.
The whole funnel (land → test → email gate → lead saved → results) is now wired and verified.
