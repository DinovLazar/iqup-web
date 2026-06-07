# Part 1 · Phase 1.03 — Design Foundation · Handover

**For:** Claude Code (build directly from this — tokens → components → screens)
**Status:** Complete. **Every brand value below is a PROVISIONAL placeholder**, chosen to pass WCAG 2.2 AA and hold together as a system so the real IqUp assets drop in without a redesign.

**Companion files (in this project):**
- `tokens.css` — runtime source of truth for the mockups (all CSS custom properties).
- `Design Foundation.html` — visual showcase of every token + component (open this first).
- `Landing.html` — tappable landing mockup (MK default, EN toggle).
- `Test.html` — tappable test flow (start / question / between; mockup-only band switcher).

**The organizing idea — two moods, one site.** One token set, applied **calm** for parent surfaces (landing above the fold, the email gate) and **playful** for child surfaces (test, results). Same components, same tokens — calmer or louder. Per-screen placement on the calm↔play spectrum: Landing ≈ 25% → play · Test start ≈ 70% · Test question ≈ 75% · Between-questions ≈ 90%.

---

## A · Design tokens

### A.1 Colour — brand anchors (placeholder)

| Token | Hex | Role |
|---|---|---|
| `--hero` | `#FFC83D` | Hero / Primary — Bibi yellow, joy. **Fill only**; text never on yellow except `--hero-ink`. |
| `--hero-strong` | `#F4B000` | Pressed / deeper yellow. |
| `--hero-tint` | `#FFF3D1` | Soft yellow wash. |
| `--hero-ink` | `#2A2440` | The dark ink that always rides on yellow. |
| `--secondary` | `#1E88C7` | Brand blue — clever / STEM / calm. Large text & UI fills (3:1). |
| `--secondary-strong` | `#11689E` | White-text buttons / links needing 4.5:1. |
| `--secondary-tint` | `#E3F1FB` | Soft blue wash. |
| `--secondary-ink` | `#0E5278` | Blue text on white / on tint. |
| `--accent-coral` | `#FF7A59` | Friendly warm accent. |
| `--accent-grape` | `#7A5AF0` | Friendly cool accent / magic-spark motif. |

### A.2 Colour — neutrals (warm-tinted)

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#FFFFFF` | Page base (the trustworthy light foundation). |
| `--canvas` | `#FBF8F3` | Soft warm canvas behind cards. |
| `--surface` | `#FFFFFF` | Card / sheet. |
| `--ink` | `#241F36` | Primary text (15.4:1 on white). |
| `--ink-soft` | `#5A5570` | Secondary text (7.1:1). |
| `--ink-faint` | `#8A8499` | Placeholder / tertiary (3.6:1 — large/UI only). |
| `--line` | `#ECE8E1` | Hairline borders. |
| `--line-strong` | `#DAD5CC` | Dividers / input borders. |
| `--field` | `#F6F4F0` | Input fill. |

### A.3 Colour — status

| Role | Solid | Tint | Ink (text) |
|---|---|---|---|
| Success | `#1E9E5A` | `#E2F4E8` | `#136138` |
| Info | `#1E88C7` | `#E3F1FB` | `#0E5278` |
| Warning | `#E5920F` | `#FCEFD6` | `#7A4E06` |
| Error | `#D7263D` | `#FBE4E7` | `#951323` |

Focus ring: `--ring #1E88C7` on `--ring-offset #FFFFFF`.

### A.4 Colour — per-strength accents (define now; results screens in Phase 1.09)

Each strength: **solid** (icons/dots, ≥3:1) · **tint** (chip bg) · **ink** (text on tint, ≥4.5:1).

| Strength | Token base | Solid | Tint | Ink |
|---|---|---|---|---|
| Pattern recognition | `--strength-pattern` | `#5B5BD6` | `#ECEBFB` | `#3A33AE` |
| Logical reasoning | `--strength-logic` | `#2E7DD1` | `#E4F0FB` | `#18558F` |
| Memory | `--strength-memory` | `#E05A8A` | `#FCE7EF` | `#A8295C` |
| Spatial thinking | `--strength-spatial` | `#109B8E` | `#DDF3F0` | `#0A625A` |
| Numeracy | `--strength-numeracy` | `#E08A12` | `#FCEFD6` | `#8A5206` |
| Observation / verbal | `--strength-verbal` | `#2E9E58` | `#E2F4E8` | `#1A6638` |

### A.5 Contrast — every intended pairing (WCAG 2.2 AA confirmed)

AA targets: **4.5:1** body · **3:1** large text (≥24px / ≥18.66px bold) & UI.

| Foreground | On | Use | Ratio | Verdict |
|---|---|---|---|---|
| `#241F36` ink | `#FFFFFF` | Body text | 15.4:1 | ✓ AAA |
| `#5A5570` ink-soft | `#FFFFFF` | Secondary text | 7.1:1 | ✓ AAA |
| `#8A8499` ink-faint | `#FFFFFF` | Placeholder / UI (large only) | 3.6:1 | ✓ AA (L/UI) |
| `#2A2440` hero-ink | `#FFC83D` | Text on yellow CTA | 9.3:1 | ✓ AAA |
| `#FFFFFF` white | `#11689E` | Text on blue button | 6.0:1 | ✓ AA |
| `#FFFFFF` white | `#1E88C7` | Large text / UI fill | 3.9:1 | ✓ AA (L/UI) |
| `#FFFFFF` white | `#D7263D` | Text on destructive | 5.0:1 | ✓ AA |
| `#0E5278` secondary-ink | `#E3F1FB` | Eyebrow / chip text | 8.4:1 | ✓ AAA |
| `#136138` success-ink | `#E2F4E8` | Trust / success text | 7.6:1 | ✓ AAA |
| `#3A33AE` strength-ink | `#ECEBFB` | Strength chip text (typ.) | 8.6:1 | ✓ AAA |
| `#1E88C7` ring | `#FFFFFF` | Focus ring vs surface | 3.9:1 | ✓ AA (UI) |

> **Rule of thumb:** yellow and the lighter `--secondary` are fills or carry dark ink / large UI only — never small light text. White body text uses `--secondary-strong`, not `--secondary`.

### A.6 Typography

- **Display / headings:** **Rubik** — soft-cornered, warm but grown-up. Weights 500 / 600 / 700 / 800. **Cyrillic: ✓ full** (latin, latin-ext, cyrillic, cyrillic-ext).
- **Body:** **Nunito Sans** — humanist, highly legible. Weights 400 / 600 / 700. **Cyrillic: ✓ full**.
- **Rejected:** Baloo 2 (Indic + Latin, **no Cyrillic**) and Fredoka (Latin + Hebrew, **no Cyrillic**). Confirm any future swap renders cyrillic-ext before adopting.
- **Loading intent:** 2 families · woff2 · `font-display: swap` · cyrillic+latin subsets only · ~5 weights total — within the Lighthouse 95 budget. Self-host or `next/font` to avoid layout shift.

| Step | Size (rem / px) | Line-height | Weight | Token |
|---|---|---|---|---|
| Display | 2.5 / 40 (clamp → 56–64 desktop) | 1.1 | 800 | `--t-display` |
| H1 | 1.75 / 28 | 1.15 | 700 | `--t-h1` |
| H2 | 1.5 / 24 | 1.2 | 700 | `--t-h2` |
| H3 | 1.25 / 20 | 1.3 | 700 | `--t-h3` |
| Body L | 1.125 / 18 | 1.55 | 400 | `--t-body-lg` |
| Body | 1 / 16 | 1.6 | 400 | `--t-body` |
| Body S | 0.875 / 14 | 1.5 | 600 | `--t-body-sm` |
| Caption | 0.8125 / 13 | 1.4 | 600 | `--t-caption` (min; never <12px) |

### A.7 Spacing · radius · elevation · motion · breakpoints

- **Spacing (4px base):** `--sp-1…24` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px.
- **Radius:** `--radius-sm 8` · `--radius-md 12` · **`--radius` (base) 16** · `--radius-lg 20` · `--radius-xl 28` · `--radius-pill 999`.
- **Elevation:** `--shadow-xs/sm/md/lg` (soft, neutral) + `--shadow-hero` (warm yellow glow under primary CTA) + `--shadow-focus`.
- **Motion:** `--dur-fast 140ms` · `--dur-base 240ms` · `--dur-slow 400ms` · `--dur-celebrate 700ms`. Easing: `--ease-out`, `--ease-in-out`, `--ease-spring` (gentle overshoot for reward). **Reduced motion:** a global `@media (prefers-reduced-motion: reduce)` rule collapses all animation/transition to ~0ms; all content renders in its end-state regardless.
- **Breakpoints (mobile-first):** designed to **390px** primary · `--sm 480` · `--md 768` · `--lg 1024` · `--xl 1280`.

---

## A.8 Code-ready — Tailwind v4 `@theme` + shadcn semantic mapping

> ⚠ **Confirm the exact shadcn variable list against the repo's live `globals.css` before mapping — the live setup wins.** The mapping below assumes the standard shadcn token set. Note `--primary` is **yellow**, so `--primary-foreground` is **dark ink** (not white).

```css
/* globals.css */
:root {
  /* ---- surfaces ---- */
  --background: #FFFFFF;            --foreground: #241F36;
  --card: #FFFFFF;                 --card-foreground: #241F36;
  --popover: #FFFFFF;              --popover-foreground: #241F36;
  --muted: #F6F4F0;                --muted-foreground: #5A5570;

  /* ---- brand → semantic ---- */
  --primary: #FFC83D;              --primary-foreground: #2A2440; /* dark ink on yellow */
  --secondary: #11689E;            --secondary-foreground: #FFFFFF;
  --accent: #FFF1CC;               --accent-foreground: #2A2440;
  --destructive: #D7263D;          --destructive-foreground: #FFFFFF;

  /* ---- lines / focus ---- */
  --border: #ECE8E1;  --input: #DAD5CC;  --ring: #1E88C7;
  --radius: 1rem;

  /* ---- brand extras (not in shadcn core) ---- */
  --hero: #FFC83D; --hero-strong: #F4B000; --hero-tint: #FFF3D1; --hero-ink: #2A2440;
  --secondary-brand: #1E88C7; --secondary-tint: #E3F1FB; --secondary-ink: #0E5278;
  --accent-coral: #FF7A59; --accent-grape: #7A5AF0;
  --canvas: #FBF8F3; --field: #F6F4F0;
  --success: #1E9E5A; --warning: #E5920F; --info: #1E88C7;

  /* ---- strengths → chart slots (results, 1.09) ---- */
  --chart-1: #5B5BD6; /* pattern */
  --chart-2: #2E7DD1; /* logic   */
  --chart-3: #E05A8A; /* memory  */
  --chart-4: #109B8E; /* spatial */
  --chart-5: #E08A12; /* numeracy*/
  --chart-6: #2E9E58; /* verbal  */
  --strength-pattern: #5B5BD6;  --strength-pattern-tint: #ECEBFB;  --strength-pattern-ink: #3A33AE;
  --strength-logic:   #2E7DD1;  --strength-logic-tint:   #E4F0FB;  --strength-logic-ink:   #18558F;
  --strength-memory:  #E05A8A;  --strength-memory-tint:  #FCE7EF;  --strength-memory-ink:  #A8295C;
  --strength-spatial: #109B8E;  --strength-spatial-tint: #DDF3F0;  --strength-spatial-ink: #0A625A;
  --strength-numeracy:#E08A12;  --strength-numeracy-tint:#FCEFD6;  --strength-numeracy-ink:#8A5206;
  --strength-verbal:  #2E9E58;  --strength-verbal-tint:  #E2F4E8;  --strength-verbal-ink:  #1A6638;
}

@theme {
  /* expose tokens + fonts to Tailwind utilities */
  --color-background: var(--background);  --color-foreground: var(--foreground);
  --color-primary: var(--primary);        --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);    --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);            --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);          --color-destructive: var(--destructive);
  --color-border: var(--border);          --color-ring: var(--ring);

  --font-display: "Rubik", system-ui, sans-serif;
  --font-sans: "Nunito Sans", system-ui, sans-serif;

  --radius-sm: .5rem; --radius-md: .75rem; --radius-lg: 1.25rem; --radius-xl: 1.75rem;

  --ease-spring: cubic-bezier(.34,1.4,.64,1);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important; animation-iteration-count: 1 !important;
    transition-duration: .001ms !important; scroll-behavior: auto !important;
  }
}
```

---

## B · Core components

For each: anatomy · sizes · states · a11y. **Minimum tap target 44×44px everywhere.**

### B.1 Buttons — `shadcn: Button`
- **Variants:** primary (yellow fill, dark ink, `--shadow-hero`), secondary (`--secondary-strong` fill, white text), ghost/tertiary (transparent, 2px `--line-strong` inset, blue label).
- **Sizes:** sm 44px · base 48px · lg 56px (the landing/test CTA).
- **States:** default · hover (darken + −2px lift) · focus-visible (3px `--ring`, 3px offset) · active (settle to 0) · disabled (`--line-strong` fill, `--ink-faint` text, no shadow). Loading: spinner replaces label, keep width.
- **A11y:** primary contrast 9.3:1; never rely on colour alone for disabled (also lowers contrast + `aria-disabled`).

### B.2 Answer option / tile — `shadcn: RadioGroup` (custom-styled)
- **Anatomy:** rounded surface (`--radius-lg`), holds an image (SVG/PNG) and/or short text; 2–4 per question. Image tiles ≥120px square (2-col grid); text tiles ≥60px tall with a letter key (stacked).
- **States:** unselected (2px `--line`) · hover (blue border, −2px lift) · focus-visible (3px ring) · selected (`--secondary` border + `--secondary-tint`) · correct (green border + `--success-tint` + check badge + gentle `pop`).
- **A11y:** labelled radio group, arrow-key navigable; feedback uses icon + colour, not colour alone; targets far exceed 44px.

### B.3 Progress indicator — `shadcn: Progress`
- Continuous bar (12px, pill) with yellow gradient fill + label "Прашање X / Y" + percentage. Fill animates `--dur-slow`.
- **A11y:** `role="progressbar"` with `aria-valuenow/min/max` and an accessible label; rewarding but not noisy; scales to any 10–15 step length.

### B.4 Age input — band picker — `shadcn: RadioGroup`
- **Pattern (decision):** three large band cards (3–5 / 6–9 / 10–13), each ≥64px tall with an age glyph, label + sub-label, and a check affordance. Chosen over a numeric stepper because the **band**, not the exact age, drives the test, and big distinct targets suit small fingers + parents on phones.
- **States:** default · hover (blue border, −1px lift) · selected (3px ring + `--secondary-tint` + filled check). Selecting enables the Start CTA (gated).

### B.5 Form field + checkbox — `shadcn: Form · Input · Checkbox`
- **Input:** 52px tall, 2px `--line-strong` border, `--field` fill, `--radius-md`. Focus: blue border + `--shadow-focus` + white fill. Error: `--error` border + `--error-ink` hint. **Always a visible `<label>`** (never placeholder-only).
- **Checkbox (consent):** generous 26px box, 8px radius; whole label row is the ≥44px target; checked fills `--secondary-strong` with a white check. Calm, honest, non-pushy tone for the children's-data consent moment.

### B.6 Card / surface — `shadcn: Card`
- White surface, 1px `--line`, `--radius-lg` (20px), `--shadow-md`. The universal container across both moods.

### B.7 Language toggle (existing MK/EN)
- Pill segmented control; `aria-pressed` per option; 44px min targets; MK default and visually first. Live in both mockups.

---

## C · Landing layout spec (calm end) — `Landing.html`

Single-column mobile (390px), widening to a 2-col hero at `md+`. Top→bottom:
1. **Top bar** — logo placeholder (`IQ UP!`) + language toggle. Sticky, translucent.
2. **Hero** — eyebrow ("Бесплатно · 5–10 минути") · hook headline ("Колку е **бистро** твоето дете?", IQ/brain-games hook) · honest one-line explainer (strengths, **no score**) · the **age-band picker card** with gated **Start CTA** + "no sign-up to begin" reassurance · trust row (free / 5–10 min / no score). Bibi placeholder frame sits in the hero aside on desktop.
3. **How it works** — 3 numbered steps (pick age → play 10 questions → get a profile), each a card with a flat icon.
4. **Reassurance strip** — "We awaken the genius in every child" gradient panel + "From the world of Bibi · IqUp".
5. **Footer** — minimal (privacy / about / contact + language). This is a funnel, not a brochure.

CTA target: `Test.html?band={band}&lang={lang}`.

## D · Test question-screen spec (play end) — `Test.html`

Centered single column (max 420px on desktop, full-bleed on mobile). Three states:
- **Start** — Bibi placeholder, band pill, encouraging headline ("Спремни за авантура?"), honest "no right or wrong" line, meta (count / minutes / certificate), big **Let's play** CTA.
- **Question** — sticky progress header (back + continuous bar + "Прашање X / Y" + %), a **strength chip** (colour-coded by strength token), the **stem** (image-led for young bands — e.g. a visual sequence puzzle; more text/abstract for 10–13), then 2–4 **answer tiles** anchored in the thumb zone. One clear thing per screen.
- **Between** — answer → 220ms reveal of the correct tile → ~1s "✦ Браво!" interstitial that slides the next question in. All instant under reduced-motion.

The mockup includes a **mockup-only band switcher** to compare a 3–5 image question with a 10–13 text question. **Band differences:** 3–5 = picture-only stems & tiles, parent-assisted; 6–9 = mixed image/sequence; 10–13 = text/number/logic, abstract, no images required.

---

## Out of scope (deferred to Phase 1.09)
Results screen and shareable certificate are **not** designed here. Strength colours are defined now so they stay consistent when those screens are built.

## Build order for Code
1. Drop the `:root` + `@theme` block into `globals.css` (after confirming shadcn names against the live file).
2. Wire fonts (Rubik + Nunito Sans) via `next/font` with cyrillic+latin subsets.
3. Build components B.1–B.7 on shadcn primitives.
4. Build the Landing (C) then the Test (D), mobile-first, MK default at `/`, EN at `/en/`.
5. Verify AA, focus-visible, 44px targets, and reduced-motion before sign-off.
