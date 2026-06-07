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
