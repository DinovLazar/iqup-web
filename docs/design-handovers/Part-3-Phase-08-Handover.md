# Part 3 · Phase 3.08 — Design: Results screen · PDF report · Bibi certificate · Handover

**For:** Claude Code (builds **3.09** results, **3.10** PDF, **3.11** certificate).
**Status:** Design complete. Built entirely on the **locked v2 system** (`assessment/tokens-v2.css`, Montserrat, the five index hues, the puzzle-brain). No new brand identity. Macedonian copy is provisional pending native review. **Bibi & IqUp photography are licensed assets Cowork supplies** — every Bibi here is a marked placeholder.

**Companion files (in this project — Lazar to place in the repo):**
- `Phase-08-Mockups.html` — the showcase framing all three surfaces with specs/states/a11y. **Open this first.**
- `surfaces/Results.html` — Surface A, the live results screen (`?lang=mk|en`, `?validity=valid|gentle_note|not_representative`).
- `surfaces/Report.html` — Surface B, the 3-page A4 PDF mirror (`?lang=`, `?photo=empty|filled`). Print-ready.
- `surfaces/Certificate.html` — Surface C, the 1080×1350 certificate + its screen (`?lang=`, `?state=named|unnamed`, `?name=`, `?embed=1`).
- `surfaces/OG.html` — the name-free 1200×630 Open Graph share image (`?lang=`, `?embed=1`).
- `surfaces/report-kit.js` — **shared source of truth**: `IqReport.identityPentagon()`, the five `INDEXES`, `icon()`, and a full sample `ReportContent` (MK + EN).

> **Law 1 — no number, ever.** No IQ / % / score / percentile / rank / level / gauge / axis / progress-or-level bar on any surface. Bands are **words**; the pentagon is **identity, not magnitude**.
> **Law 2 — Bibi only on the certificate**, always a placeholder; never generated, redrawn, or recreated.

---

## 0 · The shared visual language

Three tones over **one spine**: **credible** (results) → **formal** (PDF) → **joyful** (certificate).

| Carried from `/test` | How it shows up on these surfaces |
|---|---|
| **Montserrat** (single typeface, Cyrillic+Latin) | All three. Hierarchy by weight 400/600/700/800, not a second font. |
| **Five index hues** `--ix-*` | Fills/accents only (pentagon, card rails, PDF rails). **Never text** — text uses `--ink-*` / the darkened `*-ink`. |
| **Violet action** `--action` | Every primary CTA, the top-strength callout, the certificate ribbon. |
| **Puzzle-brain** | Resolves into the **identity pentagon** (§1) — the hero of results + PDF cover. |
| **Wave-band + blob skin** | Thin chrome only: the results header wave, the certificate/OG decoration. No gradients. |

The results screen runs in the **Insight mood** (`data-mood="insight"`: calm white, hue barely present, violet + ink dominant). The certificate is the one **Explorer-energy** surface (full-saturation, the brain-derived celebration, Bibi).

---

## 1 · The identity pentagon — `IqReport.identityPentagon(opts)`

The single most important new decision. **It replaces the assessment kit's `pentagon()` radar chart**, which encodes magnitude per axis and is **forbidden** on these surfaces.

- **What it is:** a regular pentagon, one vertex per index at its fixed axis angle (-90/-18/54/126/198, matching the brain). The shape is split into **five kites**, each centred on one vertex and filled with that index's `--ix-*` hue; white seams from the centre; an ink (`--ink-head`) outline. Vertex labels = the index short-name only.
- **The rule (non-negotiable):** **same shape, same size for every child.** It never grows, shrinks, fills part-way, or carries spokes/rings/axes/dots. Two different children → identical geometry; only their **words on the cards** differ. It is an identity graphic.
- **Filter-free:** flat `<polygon>` + `<line>` only → drops 1:1 into `@react-pdf/renderer` (`Svg/Polygon/Line`). For react-pdf, pass concrete hexes instead of `var(--ix-*)`.
- **API:** `identityPentagon({ size, lang:'mk'|'en', labels:true, dim:[codes] })`. `dim` lowers saturation of named wedges — used **only** for the gentle `not_representative` read (still whole, still same size).
- **A11y:** graphical object ≥3:1; honest `aria-label` ("five areas, one whole shape"); meaning is never colour-only (every area is also a word on a card).

---

## 2 · Surface A — the results screen (build 3.09)

Mobile-first (390px), Insight mood. Single scroll. **Desktop ≥880px:** two columns — sticky pentagon + header left, the card stack right.

**Order & blocks (top → bottom):**
1. **Header** over a soft `--band-1` wave: IqUp wordmark, MK/EN toggle, plain-language title (`"Профилот на вашето дете"` / `"Your child's profile"` — never "IQ"/"score"), age + generated-date meta. Wave edge into white.
2. **Hero — the completed identity pentagon** + one caption line ("colour shows the area, not a score").
3. **Five index cards** — one per index, in `meta.indices` order. Anatomy: hue left-rail (4px) + tinted icon chip · index **name** (`--ink-head` bold) · **band word** pill (hue-tint bg, `*-ink` text) · one-line **description** (`--ink-muted`) · a divider · a **secondary** confidence row = neutral label `Confidence: high|medium|low` + a 3-pip mark (not colour-only) + the one-sentence `confNote`.
4. **"Where your child shines"** — violet `--action-tint` callout: `topStrength` name + framing sentence.
5. **"What we noticed"** — `--surface-2` panel: `overview` + `solvingStyle`.
6. **"Report emailed" confirmation** — success-tinted strip.
7. **Trial CTA** — violet "Book a free trial class", carries `iqup.city`; routes to the booking page.
8. **Certificate entry** — a tappable card to Surface C.
9. **Disclaimer footnote** — small `--ink-faint`, the "informative, not diagnostic" line.

**States:** `validity` ∈ `valid` (default) · `gentle_note` · `not_representative`. The last shows a **soft amber banner** ("this may not have been the calmest attempt — try again") above the cards — never alarming, never a failure; the profile still renders. (`gentle_note` is reserved for a quieter inline treatment; mock currently treats it as `valid` chrome — Code wires the engine flag.)

**A11y:** text ≥4.5:1; colour never sole carrier (band word + confidence word always present); `focus-visible` violet ring; targets ≥44px (CTA 56px); reduced-motion respected; **no timers**.

---

## 3 · Surface B — the PDF report (build 3.10)

**Three A4 pages (210×297mm), margins 15mm.** Formal, generous whitespace, flat fills. **No Bibi, no characters.** Block-by-block against `ReportContent`:

**Page 1 — cover/summary:** wordmark + "Thinking report" kick · title + `meta.age` + `meta.generatedOn` + `iqup.city` · the **identity pentagon** · `topStrength` (violet callout) · **optional photo slot #1** (cover, ~46mm). Footer "Informative, not a diagnosis".

**Page 2 — the five indices:** `p2` intro line, then each `indices[i]`: 7mm hue **rail** + tinted icon · **name** + **band word** pill · plain-language `desc` paragraph · `Confidence: <conf>` + `confNote`. Colour-coded to the hue.

**Page 3 — narrative + next steps:** `overview` · `growthArea` (+ its `activity`) · `homeActivities` (numbered 2–3) · `stemReadiness` in a spatial-tinted card with the **`bridge`** to coding/robotics · **optional photo slot #2** (STEM, ~30mm) · `iqup` positioning + matched `program` + `cta` (carries city) in a violet card · the **full `disclaimer`** + `honesty` note (the one place "not a diagnosis / not clinical" is allowed). Footer.

**Photo slots:** two, clearly marked. **Empty = a dashed box** that looks intentional (the page is complete without it) so 3.10 isn't blocked on photography; **filled = the same footprint** with the image. Real photos arrive via Cowork.

**@react-pdf/renderer constraints (honour exactly):** flexbox layout only; **solid flat fills — no gradients, shadows, or filters**; the **filter-free** pentagon vector; **Montserrat must be embedded** (Cyrillic + Latin, weights 400/600/700/800) or the MK report won't render.

**Type (print units):** cover H1 30pt / section H2 15pt / block head 11pt / body 10.5pt·1.6 / small + confidence 8.5–9pt / footer 8pt.

---

## 4 · Surface C — the Bibi certificate (build 3.11)

**1080×1350 (4:5).** Joyful, full-saturation, feed-ready. The certificate **screen** wraps the artwork with the optional name field + download/share + MK/EN.

**Artwork:** playful violet+yellow inset frame · wave bands (logic-tint top, memory-tint bottom) + brand-hue confetti (centre kept clear) · header (wordmark + "Certificate" pill) · the **"IQ UP!" ribbon + "EXPLORER/ИСТРАЖУВАЧ"** title · the **Bibi placeholder box** (420×420, marked "Bibi goes here / licensed art drops in later") · the **name block** · footer (city·date + "From the world of Bibi · IqUp"). **No bands, scores, indices, or pentagon-as-data.**

**Optional child name (DECIDED — browser-only):** a friendly input on the screen; copy states the name **stays on this device — never stored, sent, or put in a URL/OG image**. **Named:** name is the hero (64px violet), "Awarded to …". **Unnamed:** the name block collapses to a generic celebratory line; the layout stays balanced. Both shown in the mockup.

**A11y:** AA contrast on the chrome/screen; the Bibi box carries a placeholder `aria-label`; targets ≥44px; reduced-motion safe; no timers.

---

## 5 · Surface C′ — the Open Graph share image

**1200×630, generic + name-free by rule** (`surfaces/OG.html`). IqUp wordmark · "Become an Explorer / Стани Истражувач" · one line ("a free thinking adventure for kids 5–13") · a Bibi-placeholder medallion. The personalised name **never** appears here — it lives only in the sharer's browser. Bilingual (MK default).

---

## 6 · Tokens used (no new identity)

Five index ramps `--ix-{logic,spatial,memory,planning,learning}` + `-soft/-tint/-ink`; `--action(/-hover/-tint/-ink/-soft)`; ink `--ink/-head/-muted/-faint`, `--neutral`; surfaces `--bg/--surface/--surface-2/--band-1/2/3/--field/--line/--line-strong`; status `--success/-tint/-ink`, `--warning/-tint/-ink`; type `--font-brand` (400/600/700/800); radius `--r-md/-lg/-xl/-badge/-pill`; space `--space-*`; tap `--tap-min 44 / --tap-comfort 56`; focus `--focus / --focus-ring`. Full mapping table in `Phase-08-Mockups.html` §5.

---

## 7 · ReportContent contract (what the surfaces render)

`identityPentagon` needs nothing from content (it's identity). Everything else maps to the 3.07 engine object — see `IqReport.SAMPLE` in `report-kit.js` for the exact MK/EN shape: `meta{age,locale,generatedOn,validity}` · `indices[5]{code,band,conf,desc,confNote}` (band → a display **word** via `BAND`, conf → a **word** via `CONF`) · `overview` · `topStrength{code,…}` · `growthArea{code,…,activity}` · `homeActivities[]` · `solvingStyle{…,trajectory}` · `stemReadiness{…,bridge}` · `extremes` · `iqup{…,program,city,cta}` · `disclaimer{…,honesty}`. All strings are `{mk,en}`.

---

## 8 · Build order
1. **3.09 Results:** port `Results.html` to React/Insight-mood; bind `ReportContent`; wire `identityPentagon` (concrete hues), the five cards (band **word** + secondary confidence), the validity states, the trial CTA (city), the certificate entry. Verify: no numbers, AA, focus, reduced-motion, MK/EN reflow.
2. **3.10 PDF:** build the 3 pages in `@react-pdf/renderer`; embed Montserrat (MK+EN); render the filter-free pentagon; implement the two optional photo slots with the intentional empty fallback. Verify: 3 pages exactly, no Bibi, flat fills only.
3. **3.11 Certificate:** build the 1080×1350 artwork + screen; the **browser-only** name field (never persisted/sent); named + unnamed layouts; the Bibi placeholder slot; export; the **name-free** OG image. Verify: no data/pentagon, Bibi placeholder only, name never leaves the browser.

*Palette & Montserrat are locked. Macedonian copy provisional pending native review. Bibi + IqUp photography are licensed assets Cowork delivers; all instances here are marked placeholders.*
