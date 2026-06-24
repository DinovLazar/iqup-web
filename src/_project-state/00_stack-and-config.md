# IqUp-Web — Stack & Config Log

> Append-only log of stack and configuration decisions. **Code appends here** whenever a dependency, version, or config choice is made or changed. Newest at the bottom.

---

## 2026-06-07 — Locked target stack (from planning)

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Components: shadcn/ui (Radix)
- Animation: Framer Motion
- Icons: Lucide
- Bilingual: next-intl (MK default, `/en/`)
- Content: structured files in the repo (no CMS)
- Lead database: Supabase (EU region)
- Analytics: GA4 + Microsoft Clarity
- Ad tracking: Meta Pixel (Part 2)
- Hosting: Vercel (Pro before launch)
- Privacy + cookies: iubenda or Termly
- Email / CRM / booking: decided in Part 2
- Domain / DNS: decided at launch (subdomain of iqup.mk)

**Pinned versions:** to be recorded at scaffold (phase 1.02) once packages are installed.

---

## 2026-06-07 — Phase 1.02 scaffold

Pinned versions actually installed at scaffold (exact resolved versions, not the
caret ranges in `package.json`):

| Package | Version |
|---|---|
| next | 16.2.7 |
| react | 19.2.4 |
| react-dom | 19.2.4 |
| next-intl | 4.13.0 |
| radix-ui (shadcn/Radix primitives) | 1.5.0 |
| shadcn (CLI) | 4.10.0 |
| tailwindcss | 4.3.0 |
| @tailwindcss/postcss | 4.3.0 |
| typescript | 5.9.3 |
| lucide-react | 1.17.0 |
| class-variance-authority | 0.7.1 |
| clsx | 2.1.1 |
| tailwind-merge | 3.6.0 |
| tw-animate-css | 1.4.0 |
| eslint | 9.39.4 |
| eslint-config-next | 16.2.7 |

**Toolchain:** Node v24.14.0 · npm 11.9.0 · git 2.53.0 · gh 2.93.0.

**Config decisions this phase:**
- Package manager: **npm** (single lockfile `package-lock.json`).
- next-intl `localePrefix: 'as-needed'` — MK at `/` (no prefix), EN at `/en`.
- Locale routing wired via `src/proxy.ts` (Next.js 16 renamed the `middleware`
  file convention to `proxy`; next-intl's `createMiddleware` is exported as the
  default and picked up by the proxy convention).
- next-intl request config at `src/i18n/request.ts`, loading messages from
  `src/messages/<locale>.json`; plugin wired in `next.config.ts` via
  `createNextIntlPlugin('./src/i18n/request.ts')`.
- shadcn/ui initialized with the `radix-nova` style on the `neutral` base color
  (framework default — no brand theming yet; that lands in the design phase).
- Tailwind CSS v4 (CSS-first config via `@import "tailwindcss"` in
  `src/app/globals.css`; no `tailwind.config.*` file).
- Next.js 16 builds with Turbopack by default; scripts are plain `next dev` /
  `next build` (no flags).

**Not installed yet (deferred to the phase that first needs them):**
- **Framer Motion** — in the target stack but not required by the shell. Add and
  pin when the first animated screen needs it.
- Supabase client, analytics, and Meta Pixel — Part 1.05 / Part 2.

**Scripts (`package.json`):**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type-check: `npm run typecheck` (`tsc --noEmit`)

---

## 2026-06-07 — Phase 1.05 Supabase leads pipeline

**Packages added (exact resolved versions):**

| Package | Version | Scope |
|---|---|---|
| @supabase/supabase-js | 2.107.0 | dependency |
| zod | 4.4.3 | dependency |
| server-only | 0.0.1 | dependency (build-time client/server tripwire) |
| supabase (CLI) | 2.105.0 | devDependency |
| tsx | 4.22.4 | devDependency (runs the TS test script) |

**Supabase project:** `iqup-web`, ref `cpxssfodboukznzaksnb`, region **`eu-central-1`**
(Frankfurt, AWS), Free plan. Legacy anon/service_role API keys in use (the new
publishable/secret key system is noted for a later migration).

**Security model (one line):** RLS enabled on `public.leads` with **no anon/
authenticated policies** + a defense-in-depth `revoke all … from anon, authenticated`,
so the public anon key can neither read nor write leads; **all inserts are
server-side** via the `service_role` key (bypasses RLS) through the validated
`insertLead()` helper. The service-role key lives only in `SUPABASE_SERVICE_ROLE_KEY`
(server env, never `NEXT_PUBLIC_`) and `server.ts` carries `import 'server-only'`.

**New scripts (`package.json`):**
- `npm run db:push` → `supabase db push --linked` (needs a one-time `supabase login` + `link`).
- `npm run db:types` → `supabase gen types --lang typescript --linked --schema public > src/lib/supabase/types.ts`.
- `npm run test:insert` → `tsx --conditions=react-server scripts/test-insert.ts` (the
  `--conditions=react-server` flag is required so the `server-only` import resolves).

**Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public),
`SUPABASE_SERVICE_ROLE_KEY` (server-only). Template in `.env.local.example`; real
values in git-ignored `.env.local`.

**Config notes:**
- `supabase/config.toml` committed (CLI default template, `project_id = "iqup-web"`,
  no secrets — uses `env(...)` substitution).
- Migration applied this session via the **dashboard SQL editor** (the sandbox cannot
  reach the Postgres port); `supabase db push` / `gen types` are wired for use once
  the project is linked from an environment with DB access.
- npm flagged 2 moderate advisories in **dev-only** deps (CLI/tsx tree); not shipped
  to production. `audit fix --force` would introduce breaking changes — not applied.

---

## 2026-06-08 — Phase 1.06 landing page + design-foundation wiring

**Packages added (exact resolved versions):**

| Package | Version | Scope |
|---|---|---|
| framer-motion | 12.40.0 | dependency (entrance animation, used via `LazyMotion` + `m`) |
| @fontsource/rubik | 5.2.8 | dependency (Cyrillic Rubik woff read by the OG image generator) |
| vitest | 4.1.8 | devDependency (unit test runner) |

**Fonts:** switched the app from Geist to **Rubik** (display/headings) + **Nunito Sans** (body)
via `next/font/google`, subsets `['latin','cyrillic']`. Rubik is preloaded with `display: 'swap'`;
Nunito Sans is `display: 'swap'` with **`preload: false`** (it isn't the LCP element, so it must not
compete with the heading font for critical bandwidth). Both expose CSS vars
(`--font-rubik`, `--font-nunito-sans`) mapped to `--font-display` / `--font-sans` in `globals.css`.

**Design tokens:** `globals.css` `:root` replaced the scaffold's neutral oklch tokens with the
1.03 handover's brand hex tokens (surfaces, brand→semantic, status, per-strength + chart slots,
radii, `--shadow-hero`, `--ease-spring`) mapped through `@theme inline`; added a
`prefers-reduced-motion` reset; **removed the dead `.dark` block** (light-only site — `dark:`
utilities stay inert via the kept `@custom-variant dark`).

**New script (`package.json`):** `npm test` → `vitest run`. Config: `vitest.config.ts`
(node environment, `include: ['src/**/*.test.ts']`).

**shadcn components added via CLI:** `card`, `radio-group`, `label` (radix-nova style, importing
from the unified `radix-ui` package). `card` is in use; `radio-group` + `label` are design-system
primitives for 1.07/1.08.

**Animation:** Framer Motion is loaded through a `LazyMotion` provider with the `domAnimation`
feature set and the `m` component (smaller than the full `motion` import), gated on
`prefers-reduced-motion`, and kept off the LCP path.

**OG image:** `src/app/[locale]/opengraph-image.tsx` uses `next/og` `ImageResponse` (1200×630) with
Rubik latin + cyrillic `.woff` buffers read from `@fontsource/rubik/files` via `fs` — Cyrillic
renders correctly (verified visually). Hex values are inlined there by necessity (satori cannot
resolve CSS theme tokens) — the one documented exception to the no-hardcoded-hex rule.

**Env:** `NEXT_PUBLIC_SITE_URL` (optional) feeds `metadataBase`; falls back to
`http://localhost:3000` when unset (set the real domain in 2.06).

**Perf note:** mobile Lighthouse Performance ~87 (<95) — gated by the brand heading web-font under
the simulated slow-4G + 4× CPU throttle on a modest machine; real-world LCP ~1.2 s. Optimizations
applied (LazyMotion, trimmed animation, body-font not preloaded, server-resolved island copy). See
`Part-1-Phase-06-Completion.md`; finalize in 1.11.

---

## 2026-06-08 — Phase 1.07 test engine

**No new dependencies.** The runner reuses the already-installed stack: `radix-ui` (RadioGroup),
`lucide-react` (object icons + UI glyphs), `tw-animate-css` (`animate-in` question entrances), and
`framer-motion`'s `useReducedMotion` hook (reveal timer branch — no `LazyMotion`/`MotionProvider`
needed in the runner). Vitest unchanged as the test runner.

**Config changes:**
- `vitest.config.ts`: added a `resolve.alias` mapping `@` → `./src` (via `fileURLToPath`), so the new
  content/scoring tests use the same `@/…` imports as the app (Vitest doesn't read tsconfig paths).
- `src/app/globals.css`: added a tokenised `--toy-*` puzzle palette (red/blue/yellow/green/purple/
  orange/pink/teal/neutral) for the test graphics — *content* colours, referenced only via tokens.
- `.claude/launch.json` (new, dev-tooling only): `dev` + `prod` configs for the local preview tool;
  no effect on the app build.

**Routing:** `/[locale]/test` is a **dynamic** route (`ƒ`) — it reads `?age=N` from `searchParams`,
which opts the segment out of static prerender (expected; the landing stays static).

**Lighthouse (`/test`, production `next start`):** A11y / Best-Practices / SEO = **100** on mobile +
desktop, both locales; Performance **desktop 100** both locales, **mobile 88–97** (at/above the
landing's documented ~87 web-font-gated baseline — same root cause, no regression). Finalize in 1.11.

---

## 2026-06-09 — Phase 1.08 email gate + lead capture

**No new dependencies.** The gate reuses the already-installed stack: the unified **`radix-ui`**
package (the new `Checkbox` primitive imports `Checkbox` from it — the brief had anticipated adding
`@radix-ui/react-checkbox`, but the unified package already re-exports it, so **zero** deps added),
`lucide-react` (Lock / Loader2 / Check icons), `zod`/`@supabase/supabase-js` (the existing leads
pipeline), and React 19 built-ins. Vitest unchanged.

**New UI primitives (shadcn radix-nova style):** `src/components/ui/input.tsx` (handover §B.5: 52px,
2px border, `--field` fill, focus → white + blue ring, `aria-invalid` error state) and
`src/components/ui/checkbox.tsx` (radix `Checkbox`, `data-[state=checked]` → `--secondary` fill +
white check). Both reference tokens only — no hardcoded hex.

**New routes / structure:**
- `/[locale]/result` — a **static (SSG)** route: a Server-Component shell + a client island
  (`ResultPlaceholder`) that reads sessionStorage on the client (`useSyncExternalStore`, so no
  hydration mismatch and no `set-state-in-effect` lint violation) and guards direct access. Temporary
  (1.10 replaces the island). Per-locale `generateMetadata` (title/description/canonical/hreflang/OG).
- `src/lib/leads/{lead-mapping,submit-lead,lead-context}.ts` — the gate's logic layer.
  `submit-lead.ts` is a `'use server'` action; `lead-mapping.ts` + `lead-context.ts` are pure/
  isomorphic (no `server-only` import) so they run on the client and in Vitest.

**Server action:** `submitLead` (`'use server'`) is the gate's submit entry point; it builds the lead
and calls the existing service-role `insertLead()` — the anon key still never writes leads.

**Code-splitting:** `TestRunner` loads `EmailGate` via `next/dynamic` (`ssr:false`), keeping the
gate's JS out of the initial `/test` bundle until the `gate` phase (a measured mobile-perf win:
`/test` mobile Performance returned to the ~88 web-font-gated baseline).

**Env:** unchanged — the gate writes through the existing `SUPABASE_SERVICE_ROLE_KEY` /
`NEXT_PUBLIC_SUPABASE_URL` path from 1.05. (`NEXT_PUBLIC_SITE_URL` remains unset → `metadataBase`
falls back to `http://localhost:3000`; this also surfaces as a local Lighthouse SEO canonical
artifact when the prod server runs on a different port — resolved by setting the real domain in 2.06.)

**Lighthouse (`/test` route — hosts the gate; production `next start`):** Desktop **100/100/100/100**;
mobile **Perf 88** / A11y 100 / BP 100. SEO is 100 on the origin-matched server (the port-mismatch
canonical artifact above aside). The gate + `/result` content states sit behind sessionStorage/
interaction (not cold-loadable by Lighthouse) and were verified structurally (a11y tree, computed
contrast, head metadata). Final perf sweep stays 1.11.

---

## 2026-06-13 — Phase 1.10 results profile + shareable certificate

**Package added (exact resolved version, pinned without a caret):**

| Package | Version | Scope |
|---|---|---|
| html-to-image | 1.11.13 | dependency (client-side certificate → PNG capture) |

Installed with `npm install html-to-image --save-exact` (pinned exact, no `^`). No
fallback library was needed — `html-to-image` rendered the certificate faithfully
in this Next 16 / React 19 / Tailwind v4 stack (verified live; see below). The
brief's `modern-screenshot` fallback was therefore **not** used.

**Certificate generation:** the certificate is a real DOM component
(`src/components/result/Certificate.tsx`) rendered at a fixed **1080 × 1350**
(portrait 4:5, Instagram-native). `CertificateCard.tsx` captures the
un-transformed node with `html-to-image` `toBlob` (`width:1080, height:1350,
pixelRatio:1` → exact 1080×1350 output), after `await document.fonts.ready` so the
self-hosted Cyrillic Rubik/Nunito Sans embed (no tofu). Download = object-URL
anchor click; Share = Web Share API file share with a copy-the-landing-URL
fallback. The child's name never leaves the browser; no server, no URL.

**New OG route:** `src/app/[locale]/result/opengraph-image.tsx` (`next/og`,
1200×630, Cyrillic Rubik woff from `@fontsource/rubik` — same setup as the landing
OG). **Generic + name-free** by design (children's-data minimisation). The
decorative spark is a CSS-drawn rotated square (not a glyph) so satori never
fetches a fallback font (keeps the build warning-free).

**Routing:** `/[locale]/result` stays **static (SSG)** — Server-Component shell +
`ResultView` client island (the island replaced `ResultPlaceholder`; reads the
same `iqup.testResult.v1` + `iqup.leadContext.v1` hand-off, same direct-access
guard). `/[locale]/result/opengraph-image` prerenders for both locales.

**No token changes** — the result UI extends the existing 1.03 `--strength-*`,
`--hero*`, `--secondary*`, `--ink*`, radius, shadow, and motion tokens in
`globals.css`. The certificate's constant cream (`#FFFBF2`) and the OG image's
inlined hexes are the only literal colours (documented build-artifact exceptions,
same rationale as the landing OG). Vitest unchanged.

---

## Phase 1.11 — QA tooling (dev-only) + a11y/perf config notes

**New devDependencies (pinned exact via `--save-exact`; NOT in the app bundle):**

| Package | Exact version | Purpose |
|---|---|---|
| `@lhci/cli` | 0.15.1 | Repeatable median-of-5 Lighthouse vs the production build (`lhci:mobile` / `lhci:desktop`). |
| `@playwright/test` | 1.61.0 | Headless-Chromium e2e: axe scans + reliable screenshots + the device matrix. |
| `@axe-core/playwright` | 4.11.3 | Programmatic WCAG (axe) scans wired into Playwright. |

Browser: only Chromium installed (`npx playwright install chromium`).

**New npm scripts:** `test:a11y` (axe), `qa:screens` (device matrix + screenshots),
`lhci:mobile` / `lhci:desktop` (LHCI median-of-5), `lh:median` (Windows-tolerant
local median runner). `npm test` is unchanged (Vitest only) — the Playwright e2e
suite runs via its own scripts, so unit CI is unaffected.

**How an operator re-runs each (copy-paste):**
- Accessibility scan: `npm run build` → in one terminal `npm run start`, in another `npm run test:a11y`.
- Screenshots / device matrix: `npm run qa:screens` (starts its own dev server).
- Lighthouse (clean infra / CI): `npm run lhci:mobile` then `npm run lhci:desktop`.
- Lighthouse (this Windows machine): `npm run build` → `npm run start` (one terminal) → `npm run lh:median` (another).

**LHCI vs `lh:median` (Windows EPERM):** on this machine every Lighthouse child
process dies on an `EPERM` while chrome-launcher removes its temp profile dir
*after* the audit completes — which makes LHCI mark the (otherwise valid) run
"failed" and discard it. `scripts/lh-median.mjs` calls the Lighthouse CLI directly
(`node node_modules/lighthouse/cli/index.js …`), writes each report, and reads it
back regardless of that post-run cleanup error. The LHCI configs are kept as the
canonical, clean-infra/CI artifact (they encode the same fixed mobile preset).

**Font config (perf):** **unchanged typefaces** — Rubik (display, preloaded) +
Nunito Sans (body, `preload:false`), both Latin+Cyrillic, `display:'swap'` with
next/font's `size-adjust` metric-matched fallback (CLS ~0). The Lighthouse trace
showed the mobile LCP element is the hero **explainer `<p>` (body text)**, which
paints immediately in the swap fallback — so no font change improves it; the
remaining gap is framework-JS execution under the 4× CPU throttle (see the 1.11
completion report's performance verdict). The one shipped perf change is making
`html-to-image` a **dynamic import** in `CertificateCard.tsx` (loads on the
certificate download/share, not in the initial `/result` bundle).

**Config note:** added a catch-all `src/app/[locale]/[...rest]/page.tsx` (calls
`notFound()`) so unmatched locale routes render the localized `[locale]/not-found.tsx`
inside the locale layout — fixing a hydration mismatch the global `not-found.tsx`
caused for locale-prefixed unknown URLs. `next.config.ts` is unchanged.

---

## 2026-06-15 — Phase 2.01 results email (Brevo + React Email + server certificate)

**Packages added (exact resolved versions, pinned without a caret):**

| Package | Version | Scope |
|---|---|---|
| @react-email/components | 1.0.12 | dependency (the email template components) |
| @react-email/render | 2.0.8 | dependency (render the template → HTML + plain text) |
| @fontsource/nunito-sans | 5.2.7 | dependency (Cyrillic Nunito Sans `.woff` for the Satori certificate body font) |

Installed with `npm install --save-exact`. **No SDK for Brevo** — the client is a thin
typed `fetch` POST to `https://api.brevo.com/v3/smtp/email` (lower weight, mockable). The
certificate PNG reuses the already-present **`next/og`** (Satori) + **`@fontsource/rubik`**;
**no `@resvg/resvg-js` fallback was needed** — `ImageResponse.arrayBuffer()` yields the PNG
bytes directly (verified in Vitest and in the live Next runtime). The npm install emitted
deprecation warnings for React Email's *individual* sub-packages (`@react-email/head`,
`button`, …) — expected, as they are consolidated into `@react-email/components`, which is
the only one imported. `npm audit` reports pre-existing dev-tree advisories only; not changed.

**New env vars (server-only except `NEXT_PUBLIC_SITE_URL`):** `BREVO_API_KEY`,
`EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`, optional `EMAIL_REPLY_TO`, dev-only `TEST_EMAIL_TO`,
and the existing carryover `NEXT_PUBLIC_SITE_URL` (dev fallback `http://localhost:3000`).
Names (no values) added to `.env.local.example`. **Graceful degradation:** with `BREVO_API_KEY`
unset the send is a logged no-op and the funnel runs normally.

**The send mechanism:** `submitLead` schedules `after(() => sendResultsEmail(...))` (`after`
from `next/server`) once the lead insert resolves — so the parent's redirect is never delayed
and the work still completes on serverless. The orchestrator is internally try/caught and never
throws. The Satori certificate + React Email render run in the Node server runtime (server
action / route handler), where `next/og` and `react-dom/server` both work — **verified live**
via a temporary route handler returning real HTML + a valid 1080×1350 PNG.

**Brand hex inlined:** `src/lib/email/brand.ts` mirrors the `globals.css` tokens as literal hex
(Satori + email clients can't resolve `var(--…)`) — the same documented exception as the OG
routes. No new visual direction; the certificate matches `Certificate.tsx` within Satori's CSS
subset (flexbox only, no grid/`color-mix`; soft mixes precomputed).

**New scripts (`package.json`):**
- `npm run test:email` → `tsx --tsconfig scripts/email-runtime/tsconfig.json scripts/test-email.ts`.
  A dev-only live-delivery check that drives the real orchestrator per band × locale to
  `TEST_EMAIL_TO`. **It refuses to run in production / CI.** It does **not** use
  `--conditions=react-server` (the way `test:insert` does) because that condition blocks
  `react-dom/server`, which the React Email renderer needs; instead `scripts/email-runtime/
  tsconfig.json` aliases the `server-only` import to an empty stub (`paths`), so the script
  runs `react-dom/server` + `next/og` exactly as the real Next runtime does.

**Vitest:** unchanged config. New server-only modules are unit-tested by mocking `server-only`
per file (`vi.mock('server-only', () => ({}))`) — the established repo pattern (no global
config change). `next/og`'s `ImageResponse` renders PNG bytes under Vitest directly.

---

## 2026-06-16 — Phase 2.02 CRM contact routing + new-lead notification (Brevo Contacts)

**No new dependencies.** The Brevo Contacts client is a thin typed `fetch` POST to
`https://api.brevo.com/v3/contacts` (mirrors the 2.01 `brevo.ts` transactional client — no SDK),
and the internal new-lead notification is a small inline-styled HTML + plain-text builder sent
through the **existing** `sendTransactionalEmail` (2.01). No image/render libs, no Slack/Telegram
tool. Vitest unchanged (`npm test` stays Vitest-only; 190 tests, up from 136).

**New env vars (all SERVER ONLY; names only in `.env.local.example`):**
- `BREVO_LEADS_LIST_ID` — integer id of the operational "all leads" Brevo list (every successful
  lead). Missing/invalid → that list is skipped (the contact still upserts).
- `BREVO_MARKETING_LIST_ID` — integer id of the marketing/nurture list; a lead is added **only**
  when `marketing_opt_in === true`. Missing/invalid → skipped.
- `LEAD_NOTIFY_TO` — internal recipient(s) for the new-lead alert (comma-separated allowed).
- `LEAD_NOTIFY_FROM` *(optional)* — overrides `EMAIL_FROM_ADDRESS` as the alert's From.
- **Reuses** `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS` from 2.01 (not duplicated). **Graceful
  degradation:** with `BREVO_API_KEY` unset, the contact upsert AND the notification each log a
  structured no-op and the funnel is unaffected — live verification waits for Cowork's Brevo setup
  (one setup lights up 2.01 + 2.02 together; see the 2.02 completion report's §7 checklist).

**Brevo Contacts request shape (verified against current Brevo docs, developers.brevo.com):**
`POST /v3/contacts`, headers `api-key` + `content-type: application/json` + `accept: application/json`,
body `{ email, attributes: {UPPERCASE keys}, listIds: number[], updateEnabled: true }`. `updateEnabled`
makes it an **upsert by email** (re-takes update, never duplicate/4xx). Create → `201 {id}`; update →
`204 No Content` (the client tolerates the empty body). **Stateless:** the returned id is discarded —
no schema change, no new column, no Brevo id persisted (Supabase remains the system of record).

**Brevo contact attributes to create (Contacts → Settings → Contact attributes) — Cowork, §7:**
`CHILD_FIRST_NAME` (text), `CHILD_AGE` (number), `BAND` (text), `LOCALE` (text), `MARKETING_OPT_IN`
(boolean), `CONSENT_VERSION` (text), `TOP_STRENGTHS` (text), `SOURCE` (text). Attributes that don't
already exist in Brevo are ignored by the API, so this step is required for the data to land.

**The send mechanism (extends 2.01, no new processor):** `submitLead` now schedules
`after(() => runAfterLead(...))` — a single fan-out (`src/lib/leads/after-lead.ts`) of three isolated
side-effects (results email + contact upsert + notification), each never-throwing, run via
`Promise.allSettled` so the parent's redirect is never delayed and the serverless `after()` work
completes. The honeypot path returns before `after()`, so bots never route or notify.

---

## 2026-06-16 — Phase 2.03 follow-up nurture emails (Code half)

**No new dependencies.** The four nurture templates reuse the **already-installed** 2.01 email
stack: `@react-email/components` 1.0.12 + `@react-email/render` 2.0.8 (templates + render), and the
literal-hex brand tokens in `src/lib/email/brand.ts`. No image/render libs (these emails attach
**no certificate**), no Brevo SDK, no analytics/Slack tools. Vitest unchanged (`npm test` stays
Vitest-only; **258 tests**, up from 190 — +68 from `copy.test.ts` + `render-smoke.test.ts`). The
render smoke runs under the **default** Vitest env (the templates import no `server-only`, like
2.01's `ResultsEmail.test.ts`).

**New script (`package.json`):**
- `npm run emails:nurture` → `tsx --tsconfig scripts/email-runtime/tsconfig.json scripts/render-nurture.mts`.
  Renders the four templates × 2 locales → 8 static HTML files in
  `docs/email-templates/Part-2-Phase-03-nurture/`. Runs under the **same script-local tsconfig the
  2.01 `test:email` uses** (aliases `server-only`→empty so `@react-email/render` + `react-dom/server`
  work under `tsx`; NOT `--conditions=react-server`, which blocks `react-dom/server` — decision #87).
  Pure render-to-file (no Brevo key, no send), safe to run anywhere; Brevo auto-generates the
  plain-text part from the HTML.

**Shared seam (no behaviour change):** `siteUrlFor` was extracted from `send-results-email.ts` (2.01)
into a new pure `src/lib/email/site-url.ts` and 2.01 now imports it, so the 2.01 results email and the
2.03 nurture emails resolve their trial-CTA target from one place (decision #97). The trial-CTA link
host is baked from `NEXT_PUBLIC_SITE_URL` at render time (dev placeholder `http://localhost:3000` when
unset — finalised in 2.06); the booking target is behind a `// TODO(booking 2.05)` seam in
`src/emails/nurture/links.ts`.

**Env vars:** unchanged — reuses the existing `NEXT_PUBLIC_SITE_URL`. The nurture personalisation +
list routing use Brevo attributes/lists already documented in 2.01/2.02 (`CHILD_FIRST_NAME`,
`CHILD_AGE`, `LOCALE`, `BREVO_MARKETING_LIST_ID`); **no new env var, no schema change, nothing stored.**

**No new app route** — the route table is unchanged (verified in `next build`).

---

## Phase 2.04 — analytics, consent layer + `/privacy` (Code half)

**No new dependencies.** GA4 (`gtag.js`), Microsoft Clarity, and Meta Pixel are loaded by first-party,
consent-gated, env-gated injection modules (`src/lib/analytics/loaders/*`) — **no SDK / npm package**.
The Manage dialog reuses **Radix Dialog from the already-installed unified `radix-ui` package** (the
same package the RadioGroup primitives use — `import {Dialog} from 'radix-ui'`), not a new
`@radix-ui/react-dialog`. Cookie I/O is a small in-repo `document.cookie` helper. Vitest unchanged
(`npm test` stays Vitest-only; **289 tests**, up from 258 — consent state machine, `track()`, sync,
`/privacy` parity/vocab, the `Consent`/`Privacy` namespace checks). Playwright e2e gained
`tests/e2e/consent.spec.ts` (28 cases incl. the headline deny-by-default network assertion).

**New env vars (PUBLIC — they ship in the client bundle; NOT secrets):** documented in
`.env.local.example`. Each tracker loads ONLY after its consent category is granted AND its id is set;
unset → that tracker never loads (graceful, logged no-op) and the banner/cookie still work.
- `NEXT_PUBLIC_GA4_ID` — GA4 measurement id (`G-…`) — Analytics category.
- `NEXT_PUBLIC_CLARITY_ID` — Microsoft Clarity project id — Analytics category (Cowork must also
  switch OFF Clarity auto-cookies so it obeys the `consentv2` signal).
- `NEXT_PUBLIC_META_PIXEL_ID` — Meta Pixel / dataset id — Marketing category.

**Consent constants:** `COOKIE_CONSENT_VERSION = 'cookies-v1-2026-06'` + cookie `iqup_consent`
(`Path=/; SameSite=Lax; Secure` in prod; ~6-month max-age) in `src/lib/consent/constants.ts` —
**distinct from** the lead's `CONSENT_VERSION` (`src/lib/leads/lead-mapping.ts`); the two never couple.

**New app route:** `/privacy` (+ `/en/privacy`) — **SSG**. The static/dynamic split is otherwise
unchanged (verified in `next build`: `/test` stays the only dynamic funnel route; the consent island
does not opt any static page into dynamic rendering — no `useSearchParams`, page views via
`usePathname()`). The banner + Manage dialog are `next/dynamic` (ssr:false) code-split off every page's
initial bundle.

**QA tooling:** `scripts/lh-median.mjs` gained opt-in env knobs (`LH_OUT_DIR`, `LH_INCLUDE_PRIVACY`,
`LH_ONLY`) — its default 1.11 sweep + output path are unchanged. `playwright.config.ts` `webServer`
now sets dummy `NEXT_PUBLIC_*` tracker ids so the consent e2e can exercise the post-Accept injection
path (deny-by-default still holds with them set — that is the headline guarantee proven).

**i18n:** new `Consent` + `Privacy` namespaces (+ `Gate.consent.privacy*` and
`Landing.footer.{privacy,cookieSettings,legalNavLabel}` keys), parity-clean in both locales.

---

## 2026-06-21 — Phase 3.01 repo onto v2 footing (Code)

> First phase of **Part 3 (the v2 rebuild)**. Foundation only — docs + brand tokens + the PDF library + the engine/report folder skeleton. **No feature logic.** Additive and non-breaking: the v1 UI, tokens, and tests are untouched and still green (typecheck/lint clean, **292 vitest** unchanged, `next build` green).

**Package added (exact resolved version, pinned without a caret):**

| Package | Version | Scope |
|---|---|---|
| @react-pdf/renderer | 4.5.1 | dependency (server-side PDF report — spec Дел 10) |

Installed with `npm install @react-pdf/renderer --save-exact`. **Smoke-tested** against the live **React 19.2.4** stack (a throwaway `scripts/_pdf-smoke.mjs` rendered a one-page PDF → valid `%PDF` buffer; deleted after). Decision #125. **No charting library added** — the 5-index pentagon is a **custom SVG** (decision #124). `npm audit fix` (non-breaking) cleared a transitive `hono` **high** advisory react-pdf introduced (in serve-static/Lambda/CORS paths we never invoke); the remaining **2 production advisories** (`postcss`/`next`, pre-existing) are only fixable by a breaking Next downgrade — not applied (decision #129).

**Fonts — Montserrat added via `next/font/google`** (decision #126): variable font, subsets `['latin','cyrillic']`, `display:'swap'`, `preload:false`, exposed as `--font-montserrat`. Covers ExtraBold 800 / Bold 700 / SemiBold 600 / Regular-Medium 400–500 (spec Прилог G). The v1 **Rubik + Nunito Sans remain** the live UI fonts and are migrated onto Montserrat component-by-component in later v2 phases.

**Design tokens (`src/app/globals.css`) — additive v2 brand primitives** (the official IqUp palette + scales, spec §18 / Прилог G), placed in a clearly-marked block; **every v1 token left intact**:
- **Palette** (`:root` raw vars + `@theme inline` `--color-*` utilities): `--iq-magenta #EC008C`, `--iq-violet #762D90`, `--iq-blue #00B6F1`, `--iq-blue-2 #6FD0F6`, `--iq-teal #00B9AD`, `--iq-orange #F7941D`, `--iq-yellow #FFC20E`, `--iq-grey #999999`; plus the 5 index aliases (`--index-logical/spatial/memory/planning/learning`).
- **Type:** `--font-brand` → Montserrat.
- **Radius** (`@theme inline`): `--radius-card` 14px, `--radius-card-lg` 18px, `--radius-badge` 30px (→ `rounded-card`/`rounded-card-lg`/`rounded-badge`). **Spacing** 4/8/12/16/24/32 (`--space-1..8`; Tailwind v4's default scale already yields these). **Tap target** `--tap-min`/`--spacing-tap` = 44px (→ `min-h-tap`, `p-tap`, …).
- **Not built here:** the higher-level semantic / "two-mood" token system (comes out of Design phase 3.02). Primitives only.
- *(Build gotcha fixed in-phase: a comment containing the literal `*/` token (`--strength-*/--chart-*`) prematurely closed the CSS comment and broke the Turbopack build; reworded.)*

**New folders scaffolded** (READMEs only — implementation in later phases): `src/lib/engine/`, `src/lib/validity/`, `src/lib/report/`, `src/lib/pdf/`, `src/content/tasks/`, `src/content/norms/`, `src/content/report/`. (`src/lib/scoring/` already existed — left untouched.)

**Net-new env var documented for v2 (not yet wired):** `META_CAPI_ACCESS_TOKEN` (server-only secret) — for the server-side Meta Conversions API (spec Дел 13). To be added to `.env.local.example` + Vercel when CAPI is implemented. Also note `NEXT_PUBLIC_META_PIXEL_ID` becomes server-scoped once the Pixel moves to CAPI.

**No app route changed** (route table identical in `next build`). **No new app dependency beyond `@react-pdf/renderer`.**

---

## Phase 3.06 — the parent form + the two-store data model (Code)

**No new runtime dependency** (Supabase + Brevo clients already exist). **No new env var** — Store A reuses `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; Store B reuses `BREVO_API_KEY` + `BREVO_LEADS_LIST_ID` + `BREVO_MARKETING_LIST_ID` (the same vars 2.01/2.02 documented). The Brevo path is a logged no-op when `BREVO_API_KEY` is unset; the Store A write throws-then-is-swallowed when the Supabase vars are unset.

**New Supabase migration:** `supabase/migrations/20260623120000_create_assessment_scores.sql` — Store A (`assessment_scores`): age/gender/city/language + the 8 signals + 5 indices (`double precision`, 0–100) + validity + norms_version + a day-level `created_date DATE`. RLS enabled, no anon policies, `revoke all … from anon, authenticated`, service-role write only (mirrors the v1 `leads` table). **Apply via `npm run db:push` (once linked) or the dashboard SQL editor** — NOT applied from the sandbox (Postgres unreachable; `.env.local` here is the blank template). Hand-authored types added to `src/lib/supabase/types.ts` (regenerate with `npm run db:types` when linked).

**New throwaway live-verification script:** `npm run test:scores` (`scripts/test-anonymous-score.ts`, `tsx --conditions=react-server`) — the Store A RLS proof (anon denied read+write, service-role insert/read, day-level date, cleanup), mirroring `npm run test:insert`. Requires the migration applied + live keys → DEFERRED-pending-Cowork.

**New Brevo contact attributes (Store B, v2):** `PARENT_FIRST_NAME`, `PHONE`, `CITY`, `CHILD_AGE`, `CHILD_GENDER` (omitted when null), `LOCALE`, `CONSENT_PROCESS`, `CONSENT_GUARDIAN`, `MARKETING_OPT_IN`, `CONSENT_VERSION` (`v2-draft-2026-06`), `TOP_INDEX` (coarse English label), `SOURCE` (`website-assessment`). Cowork must create these attributes in Brevo (parallel to the 2.02 set).

**New app route:** `/[locale]/report` (SSG shell + `ReportFlow` island), `robots: noindex`. New i18n namespace **`Form`** (MK + EN, exact parity, MK provisional).

---

## 2026-06-23 — Phase 3.09 on-screen results screen (Code)

**No new runtime dependency.** The results screen renders via React + inline SVG; the rendered-screen test uses `react-dom/server` (already present) under Vitest's Node env — no jsdom/RTL added.

**New env var (PUBLIC — ships in the client bundle, NOT a secret):** `NEXT_PUBLIC_BOOKING_URL` — the real IqUp demo-class booking URL for the results-screen CTA. The CTA appends the chosen centre as `?grad=<centre-id>`. **When UNSET, the CTA falls back to the localized `/trial` page** (via `trialBookingUrl`), so it is never a dead link. Documented in `.env.local.example` (next to `NEXT_PUBLIC_SITE_URL`). Pending the real IqUp booking flow.

**globals.css (additive):** lifted the 3.02 v2 SEMANTIC token layer (`--ix-*` `-soft/-tint/-ink` ramps, `--action*`, `--band-*`, `--surface-2`, `--ink-head/-muted`, `--neutral`, `--line*`, `--r-sm/-md/-lg/-xl/-badge/-pill`, `--tap-comfort`, `--elev-raise/-cta`, `--focus/-ring`, `--dur-fast`) from `docs/design-handovers/assessment/tokens-v2.css` — `--ix-*`→`var(--iq-*)` keeps the official hues single-sourced; only new ramp/ink/surface values carry literals. Plus the `.iq-results`-scoped results-screen CSS. All additive; every v1 + 3.01 token untouched.

**New i18n namespace `Results`** (MK + EN, exact parity, MK provisional) — results-screen CHROME only (report content stays in `buildReport`).

**Config edits:** `eslint.config.mjs` ignores `docs/**` (vendored design-handover reference surfaces incl. `report-kit.js` are browser JS to PORT, not app source); `vitest.config.ts` include widened to `src/**/*.test.{ts,tsx}` for the results-screen render test.

**3.08 design deliverables landed on `main`** (separate commit, before the 3.09 branch): the `Part-3-Phase-08-Handover.md` + `surfaces/{Results,Report,Certificate,OG}.html` + `report-kit.js` + `assessment/tokens-v2.css` + `Phase-08-Mockups.html` (under `docs/design-handovers/`) + `Part-3-Phase-08-Completion.md`. Reference only (HTML/JS to PORT, not imported/built).

---

## 2026-06-24 — Phase 3.10 PDF report + email delivery (Code)

**No new npm dependency.** `@react-pdf/renderer@4.5.1` + `@react-email/*` were already installed (3.01/2.01). The PDF generator + the v2 report email reuse them.

**New committed font assets:** `src/lib/pdf/fonts/Montserrat-{Regular,SemiBold,Bold,ExtraBold}.ttf` (weights 400/600/700/800) — static instances of the upstream Montserrat variable font (`fonttools varLib.instancer`), each carrying the FULL Latin + Cyrillic glyph set so the MK report renders with no tofu. Registered with `@react-pdf/renderer`'s `Font.register` as base64 data URIs (read via `process.cwd()`); hyphenation disabled globally. **These TTFs are a runtime dependency — committed (not gitignored).**

**next.config.ts (additive):** `outputFileTracingIncludes` traces `./src/lib/pdf/fonts/*.ttf` into the `/[locale]/report` route bundle so a standalone production build ships the fonts.

**New npm scripts:** `report:sample` (renders sample PDFs → `docs/qa/Part-3-Phase-10/` for eyeballing) and `test:report-email` (drives the REAL v2 send path to `TEST_EMAIL_TO`; refuses prod/CI; no-op-clean without `BREVO_API_KEY`). Both run via the existing `scripts/email-runtime/tsconfig.json` (maps `server-only` → empty stub so `react-dom/server` + react-pdf run as in the real Next runtime).

**No new env.** The v2 report email REUSES the 2.01 Brevo vars (`BREVO_API_KEY`, `EMAIL_FROM_ADDRESS`, optional `EMAIL_FROM_NAME` / `EMAIL_REPLY_TO`) and `TEST_EMAIL_TO`. Same no-key → logged no-op (`{event:'report-email', status:'skipped-no-key'}`). Live delivery DEFERRED pending the Brevo key (like 2.01).

**New i18n namespace `ReportEmail`** (MK + EN, exact parity, MK provisional) — the report email's CHROME only. The PDF's own chrome lives self-contained in `src/lib/pdf/pdf-copy.ts` (NOT in `messages`); the report CONTENT stays solely in `buildReport`.

**.gitignore (additive):** `/docs/qa/Part-3-Phase-10/` (dev-only sample PDFs; each embeds ~1.5MB Montserrat).

**Seam wired:** `submitAssessment` gains an optional transient `report?: { run, generatedAt }` field; on submit it `after()`-schedules `sendReportEmail` (honeypot returns before it; fully isolated; never throws). The run is request-scoped email input — written to NEITHER store; two-store unlinkability + Store A schema unchanged.

---

## 2026-06-24 — Phase 3.11 shareable certificate (Code)

**No new npm dependency.** The certificate reuses `html-to-image@1.11.13` (client-side PNG, from 1.10) and `next/og` (the share OG image, as used by the landing + `/result` OG). Nothing added to `package.json`.

**No new env. No new store write / Brevo call / CAPI event / GA4-Clarity event / schema change / migration / processor.** The certificate is client-only and reads just the already-built `ReportContent`; the optional on-device child name is never transmitted anywhere.

**Font reuse:** the new `/[locale]/report/opengraph-image.tsx` loads the SAME committed Montserrat TTFs as the 3.10 PDF (`src/lib/pdf/fonts/Montserrat-{SemiBold,ExtraBold}.ttf`) for the Cyrillic-safe OG image — no new asset. The client download embeds Montserrat by FILTERING the page's live `@font-face` set (via html-to-image's `getFontEmbedCSS`) down to the two Montserrat (latin + cyrillic) faces, then `toBlob({fontEmbedCSS})`; a **6s timeout falls back to `skipFonts`** so the export never hangs (the live page declares ~23 `@font-face` rules — Rubik + Nunito Sans + dev fonts × subsets — and embedding all of them stalls the rasterised SVG; the fallback still renders Cyrillic cleanly, verified).

**New i18n namespace `Certificate`** (MK + EN, exact parity, MK provisional) — the certificate CHROME + the per-`IndexId` warm `strengthLine` + the OG copy. Report CONTENT (the strength NAME) stays in `buildReport`; the "IQ UP!" wordmark is structural markup, not a string.

**New OG route in the build:** `/[locale]/report/opengraph-image` (mk + en) — generic, name-free, auto-wired to `/report`'s metadata by Next's file convention (mirrors `/result` + `/trial`). All other routes unchanged; `/report` stays SSG + `robots: noindex`.

**Seam wired:** the certificate renders **inline** at `// SEAM (3.11)` — `ResultsScreen` gains an optional `certificate?: ReactNode` slot that `ReportFlow` fills with `<CertificatePanel>`. No certificate route. `// SEAM (3.10)` + `// SEAM (3.12)` untouched. **Scoped `.iqc-*` CSS** appended to `globals.css` (panel chrome only; the artwork uses inline styles for html-to-image fidelity; uses only DEFINED tokens).
