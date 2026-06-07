# IqUp-Web — Current State

> Live snapshot of the repo. **Code updates this at the end of every phase.** If this and the live code ever disagree, the live code wins.

**Last updated:** 2026-06-07 — after Phase 1.05 (leads table + Supabase wiring).

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

Installed and wired: **Next.js 16.2.7** (App Router, Turbopack) · **React 19.2.4** · **TypeScript 5.9.3** · **Tailwind CSS v4** · **shadcn/ui** (radix-nova style, neutral base) · **next-intl 4.13.0** · **@supabase/supabase-js 2.107.0** · **zod 4.4.3** · **server-only 0.0.1** · dev: **supabase CLI 2.105.0**, **tsx 4.22.4**. Exact pinned versions in `00_stack-and-config.md`.

Not installed yet (deferred to the phase that needs them): Framer Motion, analytics/Pixel.

## Routes / pages built

- `src/app/[locale]/page.tsx` — a **temporary** bilingual placeholder landing page (site name + a localized "in progress" line + the language toggle). Real landing content arrives in phase 1.06.
- Locale routing works: `/` serves MK, `/en` serves EN, and `/mk` 307-redirects to the canonical `/` (next-intl `as-needed`).
- `/_not-found` is handled by Next.js's default.

## Components built

- `src/components/LanguageToggle.tsx` — accessible MK/EN switcher that preserves the current path (sets the `NEXT_LOCALE` cookie when switching).
- `src/components/ui/button.tsx` — shadcn/ui Button (from scaffold; not yet used on a page).

## Bilingual shell

- next-intl wired: `routing.ts` (locales `mk`/`en`, default `mk`, `localePrefix: 'as-needed'`), `request.ts` (loads `src/messages/<locale>.json`), `navigation.ts`, and `src/proxy.ts` (Next 16 middleware convention).
- Per-locale `<html lang>` and basic hreflang alternates (`mk` → `/`, `en` → `/en`, `x-default` → `/`).
- UI strings in `src/messages/mk.json` and `src/messages/en.json`.

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

`docs/design-handovers/`, `public/bibi/`, `public/og/`, `src/content/test/`, `src/content/results/`, `src/lib/scoring/` — each tracked with a `.gitkeep`. (`src/lib/supabase/` now holds real files.)

## Quality checks (Phase 1.05)

- `npm run build`, `npm run lint`, `npm run typecheck` — all clean (new server
  modules stay out of the client bundle).
- **`npm run test:insert` — live, all checks passed:** `insertLead()` inserts;
  service-role reads back (name trimmed, `marketing_opt_in` defaulted false); **anon
  key denied read + insert** (`permission denied`); cleanup leaves the table empty.
- A 4-lens adversarial security review ran over the implementation; RLS and
  key-leak lenses clean, and the one zod finding was empirically disproven (zod 4
  `z.object` strips unknown keys) with `.strict()` added to the summary schema anyway.

_(Phase 1.02 baseline still holds: both locales prerender, language toggle works.)_

## Open carryover items

- **GitHub remote** — see the Phase 1.02 completion report for status.
- **Brand font** — the scaffold uses Geist with the `latin` + `cyrillic` subsets, so Macedonian renders in Geist (not a system fallback). The final brand typeface is still a design-phase (1.03) decision.
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

**1.07 — Scoring** (rule-based strengths → produces the `top_strengths` summary the
`leads` schema expects) and/or **1.08 — Email gate** (the form + submit route that
calls `insertLead()`). The lead-storage plumbing they depend on is done and verified.
