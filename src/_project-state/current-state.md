# IqUp-Web — Current State

> Live snapshot of the repo. **Code updates this at the end of every phase.** If this and the live code ever disagree, the live code wins.

**Last updated:** 2026-06-07 — after Phase 1.02 (scaffold + bilingual shell).

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

Installed and wired: **Next.js 16.2.7** (App Router, Turbopack) · **React 19.2.4** · **TypeScript 5.9.3** · **Tailwind CSS v4** · **shadcn/ui** (radix-nova style, neutral base) · **next-intl 4.13.0**. Exact pinned versions in `00_stack-and-config.md`.

Not installed yet (deferred to the phase that needs them): Framer Motion, Supabase client, analytics/Pixel.

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

- None yet. (Supabase = phase 1.05; analytics/Pixel/email = Part 2.)

## Reserved folders (created, awaiting content)

`docs/design-handovers/`, `public/bibi/`, `public/og/`, `src/content/test/`, `src/content/results/`, `src/lib/supabase/`, `src/lib/scoring/` — each tracked with a `.gitkeep`.

## Quality checks (Phase 1.02)

- `npm run build` — passes clean (both locales prerendered as static).
- `npm run lint` — clean.
- `npm run typecheck` — clean.
- Routes + language toggle verified against the running dev server.

## Open carryover items

- **GitHub remote** — see the Phase 1.02 completion report for status.
- **Brand font** — the scaffold uses Geist with the `latin` + `cyrillic` subsets, so Macedonian renders in Geist (not a system fallback). The final brand typeface is still a design-phase (1.03) decision.
- `src/app/favicon.ico` is the default placeholder until a brand asset lands.

## Known issues

- None.

## Suggested next phase

**1.03 — Design: foundation** (brand tokens, landing + test-screen look, core components → handover).
