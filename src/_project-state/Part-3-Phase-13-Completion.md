# Completion Report — Part 3 · Phase 3.13 · The admin base

- **Phase ID + name:** 3.13 — The admin base (internal back-office: login + contacts + statistics + CSV export)
- **Executing Claude:** Code
- **Date completed:** 2026-06-24

---

## What shipped

A private, internal **`/admin` back-office** for IqUp — a secure login, a read-only view of the lead contacts, the anonymous aggregate statistics, and two CSV exports — **built so the two data stores can never be joined**, structurally.

**1. Auth gate (Supabase Auth, invite-only, MFA-compatible).**
- `@supabase/ssr@0.12.0` (the one new dependency, pinned) wires cookie-based SSR sessions: a browser client (`src/lib/admin/auth/client.ts`), a server client + per-route gate (`server.ts`), and the session refresh for the proxy (`middleware.ts`). Login uses the **anon key + the user session** — never the service-role key.
- **Login** at `/admin/login`: email + password; it **completes a TOTP MFA challenge when a factor is enrolled** (`getAuthenticatorAssuranceLevel` → `mfa.challenge` → `mfa.verify`). Working **sign-out** (`/admin/auth/signout`). **No public signup** path exists.
- **Defense in depth:** the **proxy** redirects unauthenticated `/admin/**` (except the login) to `/admin/login`, **and** the gated group layout calls `requireAdminUser()`, **and** each CSV export route handler independently calls `getAdminUser()` → 401.

**2. next-intl coexistence.** `src/proxy.ts` now dispatches `/admin/**` → `updateAdminSession` and everything else → the unchanged `createMiddleware(routing)`. `/admin` is **excluded from locale routing**; public locale routing is unchanged (verified by build + smoke). The admin is **outside `[locale]`** and owns its own root layout (`src/app/admin/layout.tsx` renders `<html>` — multiple-root-layouts; the static `admin` segment wins over the dynamic `[locale]`).

**3. Contacts view (Store B / Brevo, read-only).** A `server-only` thin-`fetch` READ transport (`fetchContactsPage`, no SDK, paged) + `fetchLeadContacts()` scoped to `BREVO_LEADS_LIST_ID`. A server-rendered, **paginated, city-filterable** table (a plain GET `<form>` + `<a>` page links — no client JS) showing parent first name, email, phone, **city**, child age, child gender, the **three consent flags**, source, and the contact date. **`TOP_INDEX` and every cognitive field are dropped by an allow-list mapper.** Clean empty state when `BREVO_API_KEY` is unset; never throws.

**4. Statistics view (Store A / Supabase, aggregate-only).** A `server-only` `readAggregateStats()` via the **service-role** client. It selects a **non-PII column projection (no `id`, no exact timestamp)**, pages newest-first to a logged cap, and **aggregates server-side — the raw rows never escape the reader**. The view renders **completions over time (by ISO week)**, distributions by **age / gender / city / language / validity**, and the **anonymous band distribution per index**, as accessible styled-`<div>` bars (no charting library added). Every number is a population statistic. Clean empty state without Supabase config; never throws.

**5. Two independent CSV exports.** A **contacts CSV** (from Brevo) and an **aggregate-stats CSV** (from Supabase), each behind its own gated route handler, UTF-8 **+ BOM** (Cyrillic-safe in Excel), RFC-4180 escaping. **No joined export; no shared per-child key.**

**6. Guardrail tests (38 new).** The unlinkability proof (import-edge isolation), the server-only/service-role boundary proof + no-cognitive-field proof, the aggregate-only proof, the resilience proof, the auth-gate proof, the CSV proof, the contacts-mapping proof, and a page-render smoke (both views, empty + populated).

---

## Task 0 — repo sync + dependency gate (findings)

- **Sync:** `git fetch` + `git status` → local `main` == `origin/main`, working tree **clean** (no unexpected state). Branch **`phase-3.13-admin-base`** created off `main`. All work on that branch.
- **`phase-3.12` merge state (observe + report):** **MERGED to `main`** — `git log` shows `a880663 Merge phase 3.12 — analytics + consent + Meta CAPI`. (The "awaiting Lazar's yes to merge" line in `current-state.md`'s 3.12 entry was stale; live code wins.) 3.13 is independent of analytics either way.
- **Dependency gate — GREEN:**
  - **Store A present:** `supabase/migrations/20260623120000_create_assessment_scores.sql` (RLS on, no anon policies, `revoke all … from anon, authenticated`, service-role write only) + the `server-only` write helper `src/lib/scores/insert-anonymous-score.ts` behind a `.strict()` zod schema. ✓
  - **Store B present:** `src/lib/email/brevo.ts` (transactional) + `brevo-contacts.ts` (contacts upsert) + the 3.06/2.02 contact helpers (`src/lib/leads/assessment-lead.ts`, `upsert-assessment-lead.ts`). ✓
  - **Supabase clients present:** `src/lib/supabase/server.ts` (service-role, `import 'server-only'`) + `src/lib/supabase/client.ts` (anon). ✓
  - **Env names present** in `00_stack-and-config.md` / `.env.local.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`, `BREVO_LEADS_LIST_ID` (scopes the contacts read), `BREVO_MARKETING_LIST_ID`. ✓
  - **3.06 effectively on `main`:** yes (everything 3.07–3.12 built on it). ✓

No prerequisite was missing; nothing was re-implemented.

---

## The unlinkability evidence (the point of the phase)

- **Two isolated data paths.** `src/lib/admin/contacts/*` reads Brevo only; `src/lib/admin/stats/*` reads Supabase Store A only. They are separate modules; **no module imports both readers** (no joined path). Proven by `unlinkability.test.ts`, which scans the actual **import edges** (not prose): the contacts path's imports never include `stats`/`supabase/server`/`scoring`; the stats path's never include `contacts`/`brevo`/`email`.
- **Aggregate-only statistics.** `readAggregateStats()` consumes raw rows internally and returns **only the summarised shape** (`aggregate.test.ts` asserts the output keys are exactly the distribution keys, with no raw row and no PII token). No `id` is selected; no matching/correlation logic exists.
- **No cognitive result in the contact list.** The `toLeadContactRow` mapper reads a fixed allow-list and never copies the raw attributes object; `FORBIDDEN_CONTACT_ATTRIBUTES = ['TOP_INDEX']`. Asserted at runtime (`contact-fields.test.ts`: the mapped row + CSV never contain the `TOP_INDEX` value) and statically (`server-boundary.test.ts`: the contacts page renders no `top_index`/score/band/index/signal token).
- **Two separate exports.** `iqup-contacts.csv` (Brevo) and `iqup-statistics.csv` (Supabase) are distinct files from distinct paths; the stats CSV is purely categorical (`category,key,count`). No joined file is produced anywhere.
- **Service-role stays server-side.** `src/lib/supabase/server.ts` carries `import 'server-only'`; the stats reader sits behind it; **no `'use client'` admin file imports a server reader / the service-role client / Brevo** (asserted by `server-boundary.test.ts`). The admin login uses the anon key + the user session.
- **The gate holds.** `middleware.test.ts` asserts `/admin/**` redirects to `/admin/login` when unconfigured, when configured-with-no-session, and when Supabase fails (never throws).

---

## Decisions made on the fly (with "why") — Decisions.md #220–#228

- **#220** — Admin outside `[locale]` with its own root layout; the next-intl middleware integrated in `src/proxy.ts` (the live Next 16 convention), NOT the `src/middleware.ts` the prompt named.
- **#221** — Defense-in-depth gate: proxy + `requireAdminUser` (gated layout) + independent `getAdminUser` (each export route handler).
- **#222** — `@supabase/ssr@0.12.0` pinned; anon key + session for login, service-role for stats; the in-range `supabase-js` 2.107→2.108.2 bump noted.
- **#223** — Two structurally isolated reader modules, proven by an import-edge guardrail test; no module imports both readers.
- **#224** — Contacts allow-list mapper drops `TOP_INDEX`/cognitive fields by construction.
- **#225** — Stats are aggregate-only: non-PII projection (no `id`), server-side aggregation, only the summary shape returned.
- **#226** — Logged fetch caps (contacts 5k / stats 100k); the stats query orders newest-first so the cap keeps the most recent rows (review nit).
- **#227** — Server-rendered city filter + pagination (no client JS); CSV exports are route handlers (anchor download + the one documented `eslint-disable @next/next/no-html-link-for-pages`); two separate exports.
- **#228** — Invite-only password login that completes a TOTP challenge when a factor is enrolled; no public signup; clean "not configured" state with blank env.

(Full text + "why" for each in `Decisions.md`.)

## Surprises / off-spec changes

- **`src/middleware.ts` does not exist** — the repo's live convention is `src/proxy.ts` (Next.js 16 renamed the file convention). The admin session refresh was integrated there. (Live code wins; flagged here per the no-silent-decisions rule.)
- **No root `app/layout.tsx` exists** — next-intl puts `<html>` in `[locale]/layout.tsx`. The admin therefore ships its own root layout as a sibling subtree (multiple-root-layouts). The build confirms this is valid and leaves the public route table unchanged.
- **One `eslint-disable`** on the statistics Export-CSV anchor — a CSV download served by a route handler needs a plain `<a>`, not `<Link>` (which would attempt an RSC navigation and break the file download). Documented inline.

## Files written / updated

**New (admin surface + readers + tests):** see the "Admin back-office (phase 3.13)" section of `file-map.md` for the full annotated list. Summary:
- `src/lib/admin/auth/{env,client,server,middleware}.ts` (+ `middleware.test.ts`)
- `src/lib/admin/contacts/{contact-fields,brevo-contacts-read,read-contacts,contacts-csv}.ts` (+ `contact-fields.test.ts`)
- `src/lib/admin/stats/{aggregate,read-stats,stats-csv}.ts` (+ `aggregate.test.ts`)
- `src/lib/admin/{csv}.ts` (+ `csv.test.ts`, `unlinkability.test.ts`, `server-boundary.test.ts`, `resilience.test.ts`, `page-render.test.tsx`)
- `src/app/admin/layout.tsx`, `login/{page.tsx,AdminLoginForm.tsx}`, `(authed)/{layout,page}.tsx`, `(authed)/contacts/{page.tsx,export/route.ts}`, `(authed)/statistics/{page.tsx,export/route.ts}`, `auth/signout/route.ts`
- `src/components/admin/{AdminShell,AdminNav,StatBars}.tsx`

**Modified (the only non-admin code edit + deps + state):**
- `src/proxy.ts` — dispatch `/admin/**` to the Supabase gate; next-intl for everything else.
- `package.json` / `package-lock.json` — `@supabase/ssr@0.12.0` (only new dep).
- `.env.local.example`, `00_stack-and-config.md`, `file-map.md`, `current-state.md`, `Decisions.md`, this report.

## Tests run + results (verbatim)

- `npm run typecheck` → **clean** (exit 0).
- `npm run lint` → **clean** (0 problems).
- `npm run build` → **green.** Public route table UNCHANGED — `/[locale]` (mk/en) ●, `/[locale]/report` ● (SSG), `/[locale]/test` ƒ (dynamic), privacy/result/trial + OG images unchanged. New `/admin/**` routes all dynamic (ƒ): `/admin`, `/admin/login`, `/admin/contacts`, `/admin/contacts/export`, `/admin/statistics`, `/admin/statistics/export`, `/admin/auth/signout`.
- `npm test` → **775 passed (75 files)** = 737 prior + **38 new** (admin: 4 middleware-gate, 8 contact-fields/CSV, 7 aggregate, 2 csv, 3 unlinkability, 4 server-boundary, 4 resilience, 4 page-render — plus the prior-suite count is unchanged).
- **Additive-only:** `git diff main --stat` modifies only `package.json`, `package-lock.json`, `src/proxy.ts`. Frozen-layer grep (engine/scoring/validity/report/pdf/tasks/norms/email-send/brevo-write/certificate/assessment/submit-assessment/meta) returns **nothing**.
- **Browser smoke (this machine, blank `.env.local`):** `/admin/login` renders the clean "not configured" state (on-brand Montserrat, IqUp violet) with **zero console warnings/errors**; `/admin`, `/admin/contacts`, `/admin/statistics` each redirect to `/admin/login` (the gate holds). **WCAG 2.2 AA on the login surface:** skip-link/focus-visible/labelled fields/AA contrast (violet on white ≈ 8:1).
- **Fresh-context privacy review:** **APPROVE, no must-fix.** All eight criteria PASS with file:line evidence (two isolated paths · aggregate-only · no cognitive field · two separate exports · service-role server-side · gate holds · additive-only · resilience). One nit taken (stats query newest-first so the fetch-cap label is truthful); one nit noted (the contacts row React `key` uses an index fallback — harmless).

## Blocked / carryover items

- **Live verification of the gated views is DEFERRED-pending-keys.** This machine's `.env.local` is the blank template, so no Supabase session is possible and the gate (correctly) blocks the contacts/statistics views in a browser. Their rendering is instead proven by the **page-render smoke** (empty + populated) + the **resilience** tests. To verify live: set the real Supabase + Brevo env, create an invite-only staff account in the Supabase dashboard, sign in, and confirm the contacts table (from the operational lead list) + the aggregate stats + both CSV downloads.

## Flags (for Lazar / IqUp / Cowork — surface, don't decide)

- **Staff account provisioning (Cowork/dashboard):** disable public signups in Supabase Auth settings; create the IqUp staff account(s) invite-only; confirm **EU region / Auth data residency**. Code cannot create real accounts.
- **2FA enforcement:** the login is MFA-compatible; **enforcing** it org-wide (and enrolling factors) is a config decision — recommended.
- **GDPR retention / right-to-erasure tooling is deferred** — the admin is read-only over contacts this phase; flag erasure/retention as a future phase.
- **`TOP_INDEX` is intentionally hidden** from the contact list (kept as the silent segmentation field) — IqUp to decide later whether staff should be able to filter by it.
- **The anonymous band/index aggregates were included** in the stats view (on top of the required demographics) — a reviewable scope choice.
- **Brevo PII now visible in an internal tool:** confirm this fits the Brevo DPA / the privacy review in flight (no new processor, but a new internal access surface to existing PII).

## What's next

- Lazar's explicit **yes** to merge `phase-3.13-admin-base` → `main` (branch pushed; **merge NOT performed**).
- Then the next Part-3 phase per `phase-plan.md` (3.14 privacy page / 3.16 durability + Supabase account transfer are the named upcoming items).
