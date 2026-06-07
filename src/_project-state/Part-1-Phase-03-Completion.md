# Part 1 · Phase 1.03 — Design Foundation · Completion Report

**Phase:** 1.03 — Design: Foundation (tokens, components, landing, test question screen)
**Status:** ✅ Complete
**Date:** 2026-06-07
**Note on brand values:** **All IqUp brand-visual values remain PROVISIONAL** pending IqUp's official assets (logo, exact colours, fonts, licensed Bibi art). The system was built so the real values drop in **without a redesign**.

---

## 1. Summary

Delivered the complete visual DNA for IqUp-Web and the look of the two first-touch screens, organized around the approved **"two moods, one site"** idea — one token set applied *calm* for parents and *playful* for children.

**Artifacts produced (in this project):**

| File | What it is |
|---|---|
| `tokens.css` | Single source of truth — all design tokens as CSS custom properties (runtime for the mockups, mirrored 1:1 in the handover). |
| `Design Foundation.html` | Visual showcase of every token + component, with the two screens embedded in device frames. **Start here.** |
| `Landing.html` | Live, tappable landing mockup — mobile-first, responsive to desktop, MK default with working EN toggle. |
| `Test.html` | Live, tappable test flow — start / question / between states, with a mockup-only band switcher (3–5 / 6–9 / 10–13). |
| `docs/Part-1-Phase-03-Handover.md` | Consolidated A–D handover for Claude Code — human-readable tables **and** the Tailwind v4 `@theme` + shadcn mapping. |

> The session could not write to the local repo at `C:\Users\user\Desktop\iqup-web`, so all files live in this project. **Lazar:** place `docs/Part-1-Phase-03-Handover.md` at `docs/design-handovers/` and this report at `src/_project-state/` in the repo. The mockups can be previewed as-is or copied into a sandbox route.

**Definition of Done:**
- [x] Complete named token system (colour incl. per-strength; type w/ Cyrillic-capable families + scale; spacing; radius; shadow; motion; breakpoints) — tables **and** code block mapped onto Tailwind v4 `@theme` + shadcn semantics.
- [x] Every intended colour pairing stated with its use and **confirmed AA-passing** on placeholders.
- [x] Core component specs with all states, a11y notes, ≥44px targets; shadcn primitives noted.
- [x] Landing layout spec + mobile mockup + desktop mockup, with placeholder logo/Bibi frames.
- [x] Test question-screen spec + mobile mockup + start-of-test + between-question states.
- [x] Logo + Bibi handled as labelled placeholder frames with real-asset specs; nothing redrawn/generated.
- [x] Results / certificate screens correctly **excluded** (deferred to 1.09); strength colours still defined.
- [x] Consolidated handover + this completion report.

---

## 2. Decisions I made (review & adjust freely — all provisional)

| # | Decision | One-line reason |
|---|---|---|
| 1 | **Display font = Rubik** (not Baloo 2 / Fredoka) | Both "friendly" candidates **lack Cyrillic**; Rubik is soft-rounded *and* has full Cyrillic + cyrillic-ext — warm but grown-up. |
| 2 | **Body font = Nunito Sans** | Humanist, highly legible at length, full Cyrillic — reads parent-trustworthy. |
| 3 | **Hero yellow = `#FFC83D`** | Your pick — joyful Bibi yellow; used as a fill, dark ink only on top (9.3:1). |
| 4 | **Secondary blue = `#1E88C7`, with `#11689E` for white-text** | Your pick for the brand blue; the base only clears 3:1 with white, so a darker variant carries white body text at 6:1. |
| 5 | **Six strength colours** (indigo/blue/rose/teal/amber/green) | Distinct, cheerful, harmonious; each given solid + tint + ink so results stay AA later. |
| 6 | **Neutrals are warm-tinted** (e.g. `--canvas #FBF8F3`) | A faint warm cast reads friendlier than clinical cool greys, while staying "mostly white". |
| 7 | **Age input = three big band cards** | The band (not exact age) drives the test; large distinct targets beat a stepper for small fingers / parents on phones. |
| 8 | **Progress = continuous bar + "Прашање X / Y" + %** | Your pick; rewarding, legible, scales cleanly to 10–15 steps. |
| 9 | **`--radius` base = 16px**, generous rounding throughout | Matches the "soft, friendly, big tap targets" direction. |
| 10 | **Motion = light + spring reward**, global reduced-motion reset | Gentle question transitions + a ~1s "✦ Браво!" celebration; everything renders in end-state under reduced-motion. |
| 11 | **Primary mobile width = 390px** | iPhone-class; FB/IG ad traffic is overwhelmingly mobile. |
| 12 | **shadcn map: `--primary` = yellow ⇒ `--primary-foreground` = dark ink** | Brand-accurate, but inverts shadcn's usual light-on-primary assumption — flagged for Code. |
| 13 | **Provisional MK copy written for both mockups, EN mirror via toggle** | Lets us stress-test Cyrillic string lengths now; final MK must come from a native reviewer. |
| 14 | **Logo `IQ UP!` wordmark + Bibi dashed placeholder frames** | No confirmed logo / licensed art yet; frames carry real-asset specs so PNG/SVG drop straight in. Nothing character-like drawn. |
| 15 | **Calm↔play placement chosen per screen** (Landing ~25%, Test start ~70%, question ~75%, between ~90%) | Makes the "two moods" dial concrete and reviewable. |

---

## 3. Quality bar — how each was met

- **WCAG 2.2 AA** — 11 stated pairings, all confirmed (table in §A.5 of the handover); focus-visible rings (3px, ≥3:1); feedback uses icon + colour, never colour alone; tap targets ≥44px everywhere (most far larger).
- **Lighthouse 95+ context** — 2 self-hostable families, woff2, `font-display: swap`, cyrillic+latin subsets only, ~5 weights; no heavy decorative animation; SVG icons. Flag: web fonts are the main budget line — load via `next/font` to avoid CLS.
- **Mobile-first** — designed to 390px, single-column by default, widening only at `md+`.
- **Cyrillic-first** — both mockups default to Macedonian; verified the layout holds with realistic MK strings (which run longer than EN); the EN toggle makes the comparison live.

---

## 4. Open items / hand-offs

1. **IqUp to confirm** the real logo, exact brand hexes, final fonts, and supply **licensed Bibi art** to the placeholder specs (sizes/ratios in the handover §C/D and showcase §8).
2. **Native MK reviewer** to finalize all Macedonian copy (currently provisional placeholder).
3. **Code** to confirm the shadcn variable list against the live `globals.css` before pasting the `@theme` block (the live setup wins).
4. **Phase 1.09** to design the results + certificate screens using the strength tokens defined here.
