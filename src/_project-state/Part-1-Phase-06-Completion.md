# Completion Report — Part 1 · Phase 1.06 · Landing Page

- **Phase ID + name:** 1.06 — Landing Page
- **Executing Claude:** Code
- **Date completed:** 2026-06-08

---

## What shipped

A complete, bilingual, mobile-first **landing page** replacing the placeholder, plus the
**code wiring of the 1.03 Design Foundation** (this was the first build phase to need it).

- **Brand foundation.** `src/app/globals.css` now carries the 1.03 handover tokens (brand
  palette, status, per-strength + chart slots, radii, `--shadow-hero`, `--ease-spring`, a
  `prefers-reduced-motion` reset) mapped through `@theme inline`. Fonts switched from Geist to
  **Rubik** (display/headings) + **Nunito Sans** (body), both Latin + Cyrillic, via `next/font`.
  The dead scaffold `.dark` block was removed (light-only site; `dark:` utilities stay inert via
  the kept `@custom-variant dark`).
- **Band logic (single source of truth).** `src/lib/bands.ts` — canonical band keys
  `3-5` / `6-9` / `10-13`, `BANDS`/`AGES`/`MIN_AGE`/`MAX_AGE`, `getBandForAge`, `getBand`,
  `isValidAge`. `src/lib/bands.test.ts` (Vitest) — 11 tests covering every boundary (3/5/6/9/10/13),
  out-of-range (2/14), non-integers, NaN/Infinity, full-range coverage, and band contiguity.
- **Landing page** (`src/app/[locale]/page.tsx`, Server Component) composed of
  `src/components/landing/`: `SiteHeader` (wordmark stand-in + language toggle, sticky),
  `Hero` (eyebrow · h1 hook · honest explainer · age picker card · trust row · decorative art),
  `AgeStart` (the one client island: age radiogroup grouped by band + gated Start CTA),
  `HowItWorks` (3 steps, Lucide icons), `TrustCues` (4 honest cues), `Reassurance` (verified
  brand line), `SiteFooter` (wordmark + line + toggle; /about + /privacy intentionally omitted),
  plus `Wordmark`, `HeroArt`, `Reveal`, `MotionProvider`. `LanguageToggle` upgraded to a 44px
  pill segmented control.
- **Copy** — all visible strings via next-intl in `src/messages/mk.json` + `en.json`
  (MK-first, EN mirror, exact key parity). Honest-IQ framing throughout (IQ/“brain-games” hook in
  the headline; the explainer + trust cues explicitly promise **no score, percentage, or IQ
  number**). Reuses verified brand phrases (“Ја будиме генијалноста во секое дете”, “Едукација која
  инспирира”, “Прва македонска едукативна франшиза за деца”). No “childit” placeholder text; no
  unverified franchise claims (the “85% enroll” figure is deliberately excluded).
- **Animation** — Framer Motion via **LazyMotion** (small `m` API): gentle, reduced-motion-safe
  entrance reveals on the hero art, the three steps, and the reassurance panel. The LCP-critical
  h1 + explainer render statically (no animation on the critical path).
- **SEO / OG (page-level)** — per-locale `generateMetadata` (title, description, canonical,
  hreflang `mk`/`en`/`x-default`, Open Graph, Twitter `summary_large_image`) and a **dynamic
  per-locale OG image** (`src/app/[locale]/opengraph-image.tsx`, 1200×630 via `next/og`) using the
  Cyrillic-capable Rubik woff from `@fontsource/rubik`. **Cyrillic renders correctly — verified by
  eye, no tofu** (both PNGs inspected), so no static fallback was needed.

## Quality results

**Build/lint/typecheck/tests:** `npm run build`, `npm run lint`, `npm run typecheck`, and
`npm test` (11/11) all clean.

**Lighthouse (final build, Chrome, headless):**

| Surface | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| MK desktop | **100** | **100** | **100** | **100** |
| EN desktop | **99** | **100** | **100** | **100** |
| MK mobile | 87* | **100** | **100** | **100** |
| EN mobile | 87* | **100** | **100** | **100** |

\* **Mobile Performance is below 95 — precise reason (not a real-world regression).** The score is
gated almost entirely by **LCP under Lighthouse’s simulated slow-4G + 4× CPU throttle**. The LCP
element is the static `<h1>`; its **observed (real) LCP is ~1.2 s** and every asset finishes
downloading in <200 ms on a normal connection (CLS ~0). Under the throttled simulation the LCP is
projected to ~3.3 s because the Rubik **brand heading web-font** competes for the simulated
1.6 Mbps link with the ~210 KiB framework JS baseline (React 19 + Next 16 + next-intl 4 +
Framer-Motion + Radix). The dev/CI machine here is also modest (Lighthouse `benchmarkIndex` ≈ 1300)
and **noise-dominated**: the same build measured anywhere from 68 to 90 depending on concurrent
load. Optimizations already applied: LazyMotion (small motion bundle), animations trimmed and kept
off the LCP path, body font (Nunito Sans) **not preloaded** so it doesn’t compete with the heading
font, and the client islands ship **no translation runtime** (copy resolved server-side). The
remaining gap is the framework + brand-web-font baseline, which is inherent to the locked stack.
**Recommendation:** re-measure on clean infra / PageSpeed Insights, and let **Phase 1.11** (the
dedicated parity + a11y + performance sweep) finalize — that phase can decide whether a heavier
intervention (e.g. dropping a web-font weight/subset, or system-font headings) is worth it.

**Accessibility (WCAG 2.2 AA — Lighthouse a11y = 100 on all four; manually verified):** semantic
`header`/`main`/`footer`, exactly one `h1`, skip link, every control labelled, visible
`:focus-visible` rings, tap targets ≥44 px (age chips 48 px, toggle 44 px, CTA 56 px), the age
selector is a keyboard/SR-operable Radix radiogroup, decorative art is `aria-hidden`, reduced-motion
honoured globally + per component. Measured contrast (samples): h1 ink/canvas 14.97:1, explainer
6.68:1, eyebrow 7.31:1, step-number dark-ink-on-yellow 9.53:1, active toggle white-on-blue 6.0:1 —
all pass AA.

**MK/EN parity:** exact key parity; both locales render fully with correct hreflang, per-locale
canonical, og:locale, and OG image. **Functional:** selecting an age enables the Start CTA which
links to `/test?age=N` with the correct locale prefix (e.g. `/en/test?age=7`, `/test?age=9` on MK);
no dead links.

## Decisions made on the fly (with “why”) — also added to `Decisions.md`

1. **Age picker = exact-age chips grouped by band (not band cards), carrying `age`.** Handover §B.4
   specified three band *cards*; the phase prompt + DoD + plan.md §13 + the 1.08 email gate require
   the **exact age**. Reconciled by rendering an accessible radiogroup of ages 3–13 visually grouped
   under the three band labels (big targets, band-aware as the handover intends) that selects an
   exact age; the band derives via `getBandForAge`. *Why: honours both the handover’s UX intent and
   the carry-the-exact-age requirement; the leads table stores child age.*
2. **Canonical band keys `3-5`/`6-9`/`10-13`.** The 1.04 content spec was absent, so these become
   canonical; 1.07/1.08 must adopt them. *Why: a single source of truth in `src/lib/bands.ts`.*
3. **Applied the full 1.03 design foundation (tokens + Rubik/Nunito Sans) this phase** and removed
   the dead `.dark` block. *Why: 1.06 is the first build phase that needs the foundation; there is
   no separate “foundation build” phase.*
4. **Vitest** added as the project test runner (none existed). *Why: needed for `bands.test.ts`;
   standard for the stack; reused by 1.07 scoring.*
5. **Server-first islands.** `AgeStart` + `LanguageToggle` receive their copy as props (resolved
   server-side) instead of calling `useTranslations` client-side. *Why: matches the “small client
   island” goal and keeps translation runtime off the client.*
6. **Framer Motion via LazyMotion + trimmed animation set**, h1/explainer left static. *Why: keep
   entrance motion within the performance budget and off the LCP path.*
7. **Body font (Nunito Sans) not preloaded.** *Why: it isn’t the LCP element; preloading it made it
   compete with the heading font for critical bandwidth (measurably worse TBT/LCP).*
8. **LanguageToggle pill + unique header/footer landmark labels** (`LanguageToggle.footerLabel`).
   *Why: 44 px targets per handover §B.7; unique nav names satisfy the landmark-unique a11y rule.*
9. **shadcn `radio-group.tsx` + `label.tsx` added now but unused this phase.** *Why: design-system
   primitives per the handover build order (B.1–B.7); consumed in 1.07 (answer tiles, B.2) and 1.08
   (form labels, B.5). `AgeStart` uses the raw Radix primitive directly because the shadcn
   `RadioGroupItem` renders a fixed dot and accepts no children — unsuitable for the age-chip tiles.*

## Surprises / off-spec changes

- **Missing-input flags (from §0):**
  - **Licensed Bibi art absent** (`public/bibi/` has only `.gitkeep`). Per the rules I did **not**
    generate or redraw characters — `HeroArt` is an abstract, on-brand decorative placeholder
    (`aria-hidden`). **Swap in the official Bibi art here when available.**
  - **Official IqUp logo absent.** `Wordmark` renders a token-styled `IQ UP!` stand-in (header,
    footer, OG image). **Replace with the official logo when available.**
  - **OG art absent** → built the dynamic per-locale OG image (Cyrillic verified). Replace the copy
    with official OG art later if desired.
  - **1.03 companion mockups** (`Landing.html`, `tokens.css`) referenced by the handover are **not
    in the repo** — built from the handover’s spec text (§A tokens, §C landing layout).
- **Brand palette is the handover’s PROVISIONAL placeholder** (WCAG-checked). Everything references
  theme tokens (no hardcoded hex in components; the OG image is the one documented exception), so
  the real IqUp brand files re-skin the site by editing `globals.css` only.
- **All landing copy is DRAFT**, pending native-Macedonian review and IqUp sign-off. The EN copy was
  run through the humanizer pass.
- **`metadataBase` falls back to `http://localhost:3000`** when `NEXT_PUBLIC_SITE_URL` is unset →
  set the real domain in Phase 2.06.

## Files written / updated
See `file-map.md` for the full list. New: `src/lib/bands.ts`, `src/lib/bands.test.ts`,
`vitest.config.ts`, `src/app/[locale]/opengraph-image.tsx`, `src/components/landing/*` (Wordmark,
HeroArt, Reveal, MotionProvider, SiteHeader, Hero, AgeStart, HowItWorks, TrustCues, Reassurance,
SiteFooter), `src/components/ui/{card,radio-group,label}.tsx`. Modified: `src/app/globals.css`,
`src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/components/LanguageToggle.tsx`,
`src/messages/{mk,en}.json`, `package.json`.

## Tests run + results
- `npm run build` — clean (7 static routes incl. per-locale OG images).
- `npm run lint` — clean. `npm run typecheck` — clean. `npm test` — 11/11 pass.
- Lighthouse — see the table above. Functional + a11y + parity verified via the live server.
- Fresh-context code review (separate subagent) — **no blockers, no should-fix**; the nice-to-haves
  it raised (dead `groupLabel` key, the §B.4 deviation, the two unused shadcn primitives) are
  addressed/documented here.

## Blocked / carryover items
- **Mobile Lighthouse Performance ~87 (<95)** — documented above; revisit on clean infra in 1.11.
- **Licensed Bibi art, official logo, official OG art** — drop in when provided (Cowork/IqUp).
- **Native-Macedonian copy review + IqUp sign-off** — all landing copy is draft.
- **`NEXT_PUBLIC_SITE_URL`** — set the production domain in 2.06 so canonical/OG URLs are absolute.
- Carryovers from prior phases still stand (Supabase ownership transfer, GitHub remote, `.mcp.json`).

## What’s next
**1.07 — Test engine** (uses `src/lib/bands.ts` keys + the 1.04 content when present) and/or
**1.08 — Email gate** (reuses the `age` carried by the Start CTA and `insertLead()` from 1.05).
