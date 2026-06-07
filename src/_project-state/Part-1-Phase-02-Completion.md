# Completion Report — Part 1 · Phase 1.02 · Scaffold + Bilingual Shell

- **Phase ID + name:** 1.02 — Scaffold + bilingual shell
- **Executing Claude:** Code
- **Date completed:** 2026-06-07

---

## What shipped

A working Next.js project on the machine that serves both languages and has the
project's full skeleton, state-tracking files, and agent rulebooks in place.

- **Bilingual shell (next-intl):** Macedonian at `/` (default, no prefix) and
  English at `/en`, using `localePrefix: 'as-needed'`. Verified live: `/` →
  `<html lang="mk">` + MK copy; `/en` → `<html lang="en">` + EN copy; `/mk`
  307-redirects to the canonical `/` and sets the `NEXT_LOCALE` cookie.
- **App shell:** `src/app/[locale]/layout.tsx` (per-locale `<html lang>`, fonts,
  basic hreflang alternates, `NextIntlClientProvider`, static rendering via
  `setRequestLocale` + `generateStaticParams`) and a **temporary** bilingual
  placeholder landing page (`src/app/[locale]/page.tsx`) — site name + a
  localized "in progress" line + the language toggle. All copy lives in the
  message files; nothing user-facing is hard-coded.
- **Accessible `LanguageToggle`** (`src/components/LanguageToggle.tsx`): a `nav`
  with an aria-labelled list of real, focusable links (autonyms "Македонски" /
  "English"), the active locale marked `aria-current`, switching locale while
  preserving the current path.
- **next-intl wiring:** `src/i18n/routing.ts`, `request.ts`, `navigation.ts`,
  `src/proxy.ts` (Next 16's renamed middleware), and the plugin in
  `next.config.ts`. UI strings in `src/messages/mk.json` + `en.json`.
- **Directory skeleton (plan.md §9):** `docs/design-handovers/`, `public/bibi/`,
  `public/og/`, `src/content/test/`, `src/content/results/`,
  `src/lib/supabase/`, `src/lib/scoring/`, `src/_project-state/` — each empty one
  tracked with a `.gitkeep`.
- **Agent rulebooks + state docs:** `AGENTS.md` + `CLAUDE.md` at root;
  `Decisions.md` extended with the four Phase-1.02 decisions; the project-state
  files moved into `src/_project-state/` with `00_stack-and-config.md` (pinned
  versions appended), `current-state.md` and `file-map.md` populated, a reusable
  `Part-X-Phase-YY-Completion.template.md`, and this report. `README.md` replaced
  with a project-specific one.

**Quality gates (all re-run after the review fixes):** `npm run build` → exit 0,
both locales prerendered as static HTML, proxy active; `npm run lint` → clean;
`npm run typecheck` → clean.

## Exact versions pinned

| Package | Version |
|---|---|
| next | 16.2.7 |
| react / react-dom | 19.2.4 |
| next-intl | 4.13.0 |
| radix-ui (shadcn/Radix) | 1.5.0 |
| shadcn (CLI) | 4.10.0 |
| tailwindcss / @tailwindcss/postcss | 4.3.0 |
| typescript | 5.9.3 |
| lucide-react | 1.17.0 |
| eslint / eslint-config-next | 9.39.4 / 16.2.7 |

**Node:** v24.14.0 · **npm:** 11.9.0 · **git:** 2.53.0 · **gh:** 2.93.0.
Framer Motion is **not** installed yet (in the target stack but not needed by the
shell). Full list in `00_stack-and-config.md`.

## Decisions made on the fly (with "why")

> Also logged in `Decisions.md` (#19–22) where they were explicit phase
> decisions. The items below include both those and incidental implementation
> choices, per the "no silent changes" rule.

1. **Completed an existing partial scaffold rather than starting from an empty
   folder.** The project folder already contained a create-next-app + shadcn
   scaffold and a drafted doc set (AGENTS.md, CLAUDE.md, Decisions.md, the state
   files) from earlier work — but next-intl was installed-but-unwired, the
   `[locale]` structure / messages / middleware / toggle were missing, the state
   files sat loose at the repo root, and there was no git repo. I audited what
   existed, kept what was correct, and built/fixed the rest. *Why: the live work
   was sound; re-running create-next-app would have thrown it away. (Per the
   "live code wins" rule.)*
2. **`src/proxy.ts` instead of `src/middleware.ts`.** Next.js 16 renamed the
   `middleware` file convention to `proxy`; next-intl's `createMiddleware` is
   exported as the default and picked up by the proxy convention. *Why: required
   by Next 16; verified against the current Next.js and next-intl docs.*
3. **`localePrefix: 'as-needed'`** (MK at `/`, EN at `/en`). *Why: specified by
   the brief; MK is the default market locale and owns the clean root URL.*
4. **Loaded the `cyrillic` font subset** (Geist `['latin','cyrillic']`). *Why:
   Macedonian is the default locale, so its own script should render in the font
   rather than a system fallback. The final brand typeface is still a 1.03
   design decision; this is just correct subsetting of the scaffold default.*
5. **Basic hreflang via the Metadata API** (`alternates.languages`, relative
   URLs). *Why: the brief asked for basic hreflang now; full SEO (absolute URLs
   via `metadataBase`, per-page canonicals) is a later phase.*
6. **Kept the shadcn `radix-nova` / neutral default theme**, including its inert
   `.dark` token block. *Why: no design decisions this phase; the `.dark` class
   is never applied, so no dark mode is actually present. Whether to keep those
   tokens is a 1.03 design-system call.*
7. **npm as the package manager.** *Why: single lockfile; matches the brief.*

## Surprises / off-spec changes

- **The biggest surprise is #1 above:** the folder was a partially-built 1.02,
  not an empty directory. The stack chosen by that earlier work is on very recent
  majors — **Next.js 16, React 19, Tailwind CSS v4** — which the brief's "use the
  latest versions" sanctions, but it's worth knowing the scaffold is on the
  bleeding edge.
- **Self-review found one real defect, now fixed:** a circular CSS custom
  property. The shadcn `globals.css` mapped the Tailwind token `--font-sans` to
  `var(--font-sans)`, and the Geist next/font variable was also named
  `--font-sans`, producing a self-referential `:root { --font-sans:
  var(--font-sans) }` that made the `html { font-family }` rule inert (masked
  only because `<body>` re-defined the variable). Fixed by giving Geist a
  distinct `--font-geist-sans` variable, mapping the token to it, and moving the
  font variables onto `<html>`. Verified in the compiled CSS
  (`html{font-family:var(--font-geist-sans)}`, no self-reference).
- **Two doc-vs-reality fixes in AGENTS.md** (also from review): it now points to
  `Part-X-Phase-YY-Completion.template.md` as the report source, and to
  `npm run typecheck` instead of the raw `npx tsc --noEmit`.
- **`plan.md` §9 vs. reality (surfaced, not changed):** §9 lists a
  `tailwind.config.*` file "(settled at scaffold)", but Tailwind v4 uses
  CSS-first config in `src/app/globals.css` with no config file (logged in
  `00_stack-and-config.md`). Per the "live code wins, surface the mismatch" rule,
  I'm flagging it here rather than editing the canonical `plan.md` — Chat can
  update the spec if desired.

## Files written / updated

**Created this phase:** `src/i18n/routing.ts`, `src/i18n/request.ts`,
`src/i18n/navigation.ts`, `src/proxy.ts`, `src/app/[locale]/layout.tsx`,
`src/app/[locale]/page.tsx`, `src/components/LanguageToggle.tsx`,
`src/messages/mk.json`, `src/messages/en.json`, all reserved-folder `.gitkeep`s,
`src/_project-state/Part-1-Phase-02-Completion.md` (this file).
**Modified:** `next.config.ts` (next-intl plugin), `src/app/globals.css` (font
token fix), `AGENTS.md` (two fixes), `Decisions.md` (#19–22), `README.md`
(rewritten). **Moved into `src/_project-state/`:** `00_stack-and-config.md`
(+ pinned versions), `current-state.md` (rewritten), `file-map.md` (populated),
and the completion template (renamed to `…template.md`).
Full inventory in `file-map.md`.

## Tests run + results

- `npm run build` — **exit 0**; `/[locale]` → `/mk` + `/en` prerendered as
  static HTML; `ƒ Proxy (Middleware)` active.
- `npm run lint` — **clean** (no errors/warnings).
- `npm run typecheck` (`tsc --noEmit`) — **clean**.
- Live dev-server checks: `/` (MK), `/en` (EN), `/mk`→307→`/` with
  `NEXT_LOCALE=mk`; hreflang `<link>`s present (mk→/, en→/en, x-default→/);
  `<html>` carries the Geist font classes; no `console.log`/`TODO`/`@ts-ignore`
  in `src/`; no `.env`/secret files in the tree.
- A 4-lens adversarial review (next-intl correctness · DoD compliance ·
  docs/guardrails · cleanliness/a11y/security) ran over the scaffold; all real
  findings were fixed or are explicitly deferred (below).

## GitHub status

`gh` is authenticated as **DinovLazar** (scopes: repo, workflow). This phase
makes a single commit — `chore: scaffold bilingual Next.js shell (Phase 1.02)`
— and creates + pushes the private repo **DinovLazar/iqup-web** via
`gh repo create … --private --source=. --push`. (If the push is reported as
failing for any reason, the local commit still stands and the remote can be
created outside this session.)

## Blocked / carryover items

- **Framer Motion** — install + pin when the first animated screen needs it.
- **Cyrillic-capable *brand* font** — the scaffold uses Geist (latin+cyrillic);
  the final typeface is a 1.03 design decision.
- **`metadataBase` + per-page hreflang** — the shared layout currently hardcodes
  home-route alternates; correct for the only page now, but the SEO/page phases
  should derive alternates from the pathname.
- **Localized `not-found.tsx`** — optional polish; invalid locales currently hit
  Next's default 404.
- **`src/app/favicon.ico`** — default placeholder until a brand asset lands
  (Cowork).
- **Local dev note:** an unrelated app on the machine occupies port 3000, so the
  IqUp dev server runs on 3001 — harmless, just expect the port bump.

## What's next

**Phase 1.03 — Design: foundation** (brand tokens from `brand.md`, the landing +
test-screen look, core components → a handover in `docs/design-handovers/`). Per
`project-instructions.md`, Chat proposes the visual direction in chat first.
