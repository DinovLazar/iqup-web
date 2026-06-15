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
