# Completion Report — Part 1 · Phase 1.10 · Results profile + shareable certificate

- **Phase ID + name:** Part 1 · Phase 1.10 — Results profile + shareable certificate
- **Executing Claude:** Code
- **Date completed:** 2026-06-13

---

## What shipped

The temporary `/result` placeholder is replaced by the **real payoff screen** — the warm strengths
profile the parent reads and the portrait certificate they download and share. The whole funnel is now
live end-to-end: **land → test → email gate → lead saved → real results + certificate.**

- **On-screen strengths profile** (`ResultView` island) — the "two moods, one scroll" layout from the
  1.09 mockups: a **playful zone** (reveal hero with the child's first name; a positive-only
  **strengths constellation** of three non-evaluative tiers — celebrated badges / "also strong" chip /
  "growing" chips; the certificate) flowing into a **calm zone** (a parent-facing §6 prose note + the
  band handoff). Built from the 1.04 spec §6 templates. **No score, IQ, %, bar, gauge, or rank anywhere.**
- **The shareable certificate** (`Certificate.tsx`, **1080×1350 portrait 4:5**) — child name + celebrated
  strengths + IqUp branding + a licensing-safe **Bibi placeholder**, with a **deterministic per-child
  tint** on a constant cream background. **Download PNG** (client-side `html-to-image`, fonts embedded)
  and **Share** (Web Share API file share + copy-the-landing-URL fallback). The child's name never
  leaves the browser.
- **Generic, name-free `/result` OG image** (`opengraph-image.tsx`, both locales, Cyrillic-safe).
- **Trial invite + center picker** (`TrialInvite`) for bands 3–5 & 6–9, over the new 10-center
  single-source module; band 10–13 ends cleanly with `CuriousMindEnding` (no trial).
- **Content modules** — `src/content/results/` (typed §6 copy + `getResultCopy`) and
  `src/content/centers.ts` (the 10 centers), both single-sourced and flagged provisional where relevant.
- **Task A filing sweep** — see below.

## Task A — filing the loose design handovers

- **Phase 1.09 was delivered as three loose HTML mockups at the repo root** (no written handover `.md`,
  no completion-report `.md`). Filed:
  - `Certificate.html` → `docs/design-handovers/Part-1-Phase-09-assets/Certificate.html`
  - `Result.html` → `docs/design-handovers/Part-1-Phase-09-assets/Result.html`
  - `Phase-09-Mockups.html` → `docs/design-handovers/Part-1-Phase-09-assets/Phase-09-Mockups.html`
  - **New** `docs/design-handovers/Part-1-Phase-09-assets/tokens.css` — the stylesheet the mockups
    `<link>`-reference (it was not in the drop) reconstructed from the live 1.03 tokens, so the filed
    mockups render for review.
  - **New** `docs/design-handovers/Part-1-Phase-09-Handover.md` — an **honest index** at the canonical
    path that points to the mockups (the real design source) and transcribes only what they literally
    contain. **No design decisions were fabricated.**
- **⚠ FLAG FOR LAZAR:** the **Phase 1.09 written completion report** (`Part-1-Phase-09-Completion.md`)
  was **not** in the drop and could not be located anywhere under the project folder. Nothing was
  fabricated to stand in for it. If you have it, drop it into the project root and it can be filed.
- **Phase 1.03 reconciled:** `docs/design-handovers/Part-1-Phase-03-Handover.md` and
  `src/_project-state/Part-1-Phase-03-Completion.md` both already exist in their canonical homes — no
  move needed.
- *(Pre-existing, out of Task A scope, noted not actioned:* there are three byte-identical copies of the
  1.04 content spec — `Part-1-Phase-04-Content-Spec.md` (root), `docs/Part-1-Phase-04-Content-Spec.md`,
  and the canonical `docs/content/Part-1-Phase-04-Content-Spec.md`. Left as-is per "only move/rename"; a
  future cleanup could drop the two non-canonical copies.)*

## Decisions made on the fly (with "why")
> Full detail in `Decisions.md` #58–#68. Summary:

- **#58 Task A:** filed the HTML mockups, reconstructed `tokens.css`, wrote an honest index Handover.md,
  flagged the missing 1.09 completion report — without fabricating a design spec.
- **#59 Copy split:** §6 substantive copy → `src/content/results/`; mockup chrome → `Result` i18n; the
  profile renders both (constellation visual + §6 parent prose).
- **#60 Reveal hero:** §6 kid celebration as eyebrow + mockup title/lede as chrome.
- **#61 Rename:** `ResultPlaceholder` → `ResultView` (deleted the placeholder); rewrote the `Result`
  i18n namespace and updated `messages.test.ts` (no silent rename).
- **#62 Library:** `html-to-image` (no `modern-screenshot` fallback needed — it worked).
- **#63 Tint + AA:** frame top1→top2 tints / flourish top1 / constant cream → AA holds for every tint by
  construction; decorative medallion glyphs exempt (name always present as AA text).
- **#64 Reworded** the `spatial` short descriptor "Thinks in 3D" → "Pictures shapes in space" (no digit).
- **#65 Built solo** (shared-state components) + ran the required fresh-context review at the end.
- **#66 Certificate smoke** = pure-model tests (no jsdom dep); live capture is the render proof.
- **#67 Trial CTA** = working `tel:`/`mailto:` + contact form behind `// TODO(booking 2.05)`.
- **#68 `centers.ts`** is the single source, flagged PROVISIONAL, with a reserved `mapsUrl` field.

## Surprises / off-spec changes
- The 1.09 "handover" was HTML mockups, not a `.md` — the mockups are extremely complete (live reference
  implementations with all copy + tier logic + the tint rule), so they served as the authoritative
  visual spec directly. (See Task A.)
- The mockups referenced a `tokens.css` that was never delivered (so they rendered unstyled until the
  reconstruction).
- The mockups' `cele` slider explores 1–3 celebrated strengths, but the real scoring contract fixes the
  tiers at celebrated = top1/top2 (2), also = top3 (1), growing = #4–#6 (3); the build follows the real
  fixed tiers, so the certificate shows the 2 celebrated strengths that §6C names.

## Files written / updated

**New — content & data**
- `src/content/results/{types,strength-copy,templates,index}.ts` + `results.test.ts`
- `src/content/centers.ts` + `centers.test.ts`
- `src/lib/a11y/contrast.ts`

**New — result UI** (`src/components/result/`)
- `ResultView.tsx`, `ResultHero.tsx`, `StrengthsConstellation.tsx`, `ParentNote.tsx`,
  `CertificateCard.tsx`, `Certificate.tsx`, `certificate-model.ts` + `certificate-model.test.ts`,
  `StrengthGlyph.tsx`, `TrialInvite.tsx`, `CuriousMindEnding.tsx`, `bibi.ts`, `copy.ts`

**New — routes**
- `src/app/[locale]/result/opengraph-image.tsx`

**Updated**
- `src/app/[locale]/result/page.tsx` (real shell: resolves chrome, mounts `ResultView`, adds footer)
- `src/messages/{mk,en}.json` (rewritten `Result` namespace) + `src/messages/messages.test.ts`
- `package.json` / `package-lock.json` (`html-to-image` 1.11.13)
- `src/_project-state/{current-state,file-map,00_stack-and-config}.md`, `Decisions.md`

**Deleted**
- `src/components/result/ResultPlaceholder.tsx` (replaced by `ResultView.tsx`)
- `src/content/results/.gitkeep` (folder now holds real files)

**Filed (Task A)** — see the Task A section.

## Certificate generation, tint, and Bibi swap

- **Approach:** real DOM `Certificate` component at fixed 1080×1350 → `html-to-image` `toBlob`
  (`width/height 1080×1350`, `pixelRatio 1` → exact Instagram-portrait output) after
  `await document.fonts.ready` (so the self-hosted Cyrillic Rubik/Nunito Sans embed). Download =
  object-URL anchor; Share = `navigator.canShare({files})` → `navigator.share`, else copy the landing
  URL. **`modern-screenshot` fallback was not needed.**
- **Tint rule (deterministic):** frame gradient blends `top1-tint → top2-tint`; the name flourish + art
  use the top1/top2 solids; a single celebrated strength falls back to `top1-tint → lighter mix`. The
  background is a **constant cream `#FFFBF2`, never tinted**.
- **AA verification:** because all body text sits on the constant cream and the only text-over-tint is
  the celebrated chips (`--strength-*-ink` on `--strength-*-tint`), AA holds for *every* tint the rule
  can produce. `certificate-model.test.ts` asserts ink-on-tint ≥ 4.5:1 for all six strengths (min
  5.61:1) and cream-bg text ≥ 4.5:1 (≥ 3:1 for the large date line only). Decorative medallion glyphs
  are exempt from 1.4.11 (the strength name is always present beside them as AA text).
- **Bibi swap path:** `src/components/result/bibi.ts` exports `BIBI_CERT_ART` (currently `null` →
  abstract placeholder). Set it to the asset path (e.g. `/bibi/certificate.png`) when the licensed art
  lands — it drops into the same 336×336 box with no layout change. **Never generated or redrawn.**

## Tests run + results

- **`npm run typecheck`** (`tsc --noEmit`) — clean.
- **`npm run lint`** (eslint) — clean.
- **`npm test`** (vitest) — **98/98 passing** (10 files). New suites: `results` (per strength×tier×locale
  coverage, MK/EN slot parity, **no forbidden tokens** — asserts no digits/%/score/rank/deficit words in
  EN+MK, plus digit-free assembled output), `centers` (10 centers, required fields, unique ids/emails,
  https contact URL), `certificate-model` (tint determinism + **AA contrast for every tint** + name
  sizing/date/strength-list), and the updated `messages.test.ts` (rewritten `Result` namespace).
- **`npm run build`** (next build, Turbopack) — clean; 13 static pages incl. `/mk/result`, `/en/result`,
  and both `/result/opengraph-image` routes; `/[locale]/result` prerendered **SSG**.
- **Live verification (dev preview — the screenshot tool worked this phase):**
  - All **3 bands × both locales** render the profile; the a11y tree + computed styles confirm the
    structure. Bands 3–5 & 6–9 show the trial invite + city picker (all 10 centers); band 10–13 shows
    the curious-mind ending (no trial). No console errors/warnings; no hydration mismatch.
  - **Direct-access guard:** clearing sessionStorage and visiting `/result` redirects to `/`.
  - **Certificate capture:** Download produced a valid **1080×1350 PNG** (≈223 KB, Cyrillic embedded, no
    tofu). Per-child tint confirmed visually (Ива spatial+verbal = teal→green; Марко pattern+spatial =
    indigo→teal). A sample PNG is saved at
    `docs/design-handovers/Part-1-Phase-09-assets/sample-certificates/certificate-mk-band-3-5-Ива.png`.
- **A11y method:** AA contrast verified numerically (`contrast.ts` + test); keyboard/labels/focus and
  reduced-motion verified via the a11y tree + the `Reveal`/`MotionProvider` reduced-motion path; the
  certificate image is `aria-hidden` but its content (names) is duplicated as on-page AA text.
- **Lighthouse:** not re-run this phase (carried the documented ~87 mobile-perf baseline; the final perf
  sweep is Phase 1.11).
- **Fresh-context review subagent:** **zero blockers.** Its three should-fixes were all fixed: a second
  cream gradient hex promoted to a named `CERT_CREAM_EDGE` constant; a stale test-filename in a docblock
  corrected; the MK `linkCopied` string aligned with the EN "site link" qualifier.

## New dependency
- **`html-to-image` 1.11.13** (dependency, pinned exact via `--save-exact`). Recorded in
  `00_stack-and-config.md`. No fallback library was added.

## Blocked / carryover items
- **Provisional MK (native review):** the rewritten `Result` chrome + all `src/content/results/` §6
  copy + the center city labels (MK verbatim from the spec / mockup, EN mirror).
- **`centers.ts` data:** PROVISIONAL — IqUp must verify phone numbers/addresses before launch (brand.md
  §4 flags variance; some entries carry a `verify` note).
- **Bibi certificate art:** still a placeholder — swap via `BIBI_CERT_ART` when the licensed asset lands.
- **Phase 1.09 written completion report:** not located — flagged above for Lazar.
- **Mobile Lighthouse Performance ~87** and the full a11y/perf finalisation remain Phase 1.11.
- **Out of scope (Part 2, already seamed):** the results email (2.01 — OG/share are name-free for it);
  real trial booking (2.05 — `// TODO(booking 2.05)`); the `/privacy` page + live consent link.

## What's next
**Suggested next phase: 1.11 (parity + a11y + performance finalisation)** — the mobile-perf sweep, a
full WCAG 2.2 AA pass over the new result/certificate surfaces, and MK/EN parity polish, ahead of the
Part 2 email (2.01) and booking (2.05) work.
