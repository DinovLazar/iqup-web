# Part 3 · Phase 3.11 — Completion report

**Phase:** Code — the shareable certificate (the awareness engine).
**Branch:** `phase-3.11-certificate` (off `main`).
**Date:** 2026-06-24.
**Outcome:** Complete. The v2 results reveal now renders a **shareable "IQ UP! Explorer" certificate** inline at `// SEAM (3.11)` — bilingual MK/EN, with the top strength in warm child-facing language, a deterministic per-child accent, an opt-in **on-device-only** child name, download (PNG) + share, and a dedicated **name-free** OG image. No scores anywhere. Build / lint / typecheck clean; **706/706** tests pass (677 prior + 29 new); verified live in both locales (clean Cyrillic, no tofu). Additive-only diff; no frozen layer touched. **Pushed, asking before merge.**

---

## Task 0 — sync + dependency gate (recorded findings)

- **Sync:** `git fetch` + `git status` clean; local `main` even with `origin/main` (0/0). Branched `phase-3.11-certificate` off `main`.
- **3.10 merge state (observed):** **phase 3.10 is MERGED to `main`** — `git log` shows `a6725d1 Merge phase 3.10 …` and `4da52a9 feat: phase 3.10 …`; **3.09 is also merged** (`fbfda84 Merge phase 3.09 …`). So contrary to the prompt's "3.10 likely still unmerged" note, both prior phases are on `main` already — there are **no pending conflicting branches**, and the seam edit was kept surgical regardless. (The "awaiting Lazar's yes to merge" lines in the older `current-state.md` entries predate those merges; a note was added.)
- **Dependency gate — all GREEN:**
  - 3.09: `ResultsScreen.tsx` + `ReportFlow.tsx` exist and contain the `// SEAM (3.11)` certificate-entry marker; the v2 token layer (`--ix-*` / `--action*` / `--ink-*` / `--band-*` + radius/tap tokens) is in `globals.css`.
  - 3.07: `buildReport` + the `ReportContent` contract exist (the top-strength source).
  - 3.08: **the certificate surface EXISTS and is usable** — `docs/design-handovers/surfaces/Certificate.html` (a 1080×1350 4:5 "Surface C" with the IQ UP! wordmark, the "IQ UP! Explorer" reward, a clearly-marked Bibi placeholder box, the optional browser-only name field, and a per-child accent). Built to it (Task 1 path: **build to the surface**, recorded as decision #202).
  - `html-to-image@1.11.13` installed; `BIBI_CERT_ART` placeholder mechanism present (`src/components/result/bibi.ts`, still `null`).

---

## What shipped

**`CertificateArt.tsx`** — a pure, props-driven **1080×1350 (4:5)** artboard (`forwardRef`, inline styles for faithful `html-to-image` capture). Renders: the **IQ UP! wordmark** (structural IQ/UP/! markup), the per-child-accent **"Certificate"** tag, the **"★ Explorer" reward stamp** (white on violet `--action`), the **Bibi placeholder** (the ONLY Bibi slot — abstract licensing-safe silhouette + "Bibi goes here"; a one-line `BIBI_CERT_ART` swap renders the real art with no layout change), the **top strength** (the index NAME pill from `report.topStrength.name` + a warm child-facing `strengthLine`), the **optional on-device name** ("Awarded to …", shown only when added), and a **"month year" keepsake date**. Deterministic confetti + waves; no `Date`/`Math.random` on the content path.

**`cert-model.ts`** — pure logic: `certAccent(topIndex)` (the per-child accent tokens, drawn from `INDEX_META`'s top-strength hue), `certMonthYear(date, locale)` (static month table, no clock), and the deterministic confetti table + hues.

**`CertificatePanel.tsx`** (`'use client'`) — the wrapper injected at the seam: the panel intro, the **opt-in (off-by-default) on-device-only name field** with a "stays on this device, never sent/stored" note, a responsive scaled preview (the captured node stays un-transformed at 1080×1350), and **Download** + **Share**.
- **Download** = `html-to-image` → PNG @ 1080×1350, after `document.fonts.ready`, embedding **only Montserrat (latin + cyrillic)** via a filtered `getFontEmbedCSS`, with a **6s timeout → `skipFonts` fallback** so the UI never hangs.
- **Share** = the Web Share API file-share with **generic, name-free** metadata (`title: reward`, `text: og.tagline`); the copy-link fallback writes the **PII-free locale landing URL** (`/` or `/en`).

**`/[locale]/report/opengraph-image.tsx`** — a generic, **name-free** 1200×630 OG image for the results/share surface (Cyrillic-safe Montserrat from the committed 3.10 TTFs; v2 violet/brand tokens; takes only `{locale}`). Auto-wired to `/report`'s metadata by Next's file convention (mirrors `/result` + `/trial`).

**Wiring:** `ResultsScreen` gained an optional `certificate?: ReactNode` slot rendered at `// SEAM (3.11)` (else the lightweight entry affordance, keeping the screen pure for the 3.09 render test); `ReportFlow` fills it with `<CertificatePanel report locale copy={certificateCopy} />`; `page.tsx` resolves the new `Certificate` namespace server-side.

**i18n:** the new **`Certificate`** namespace (MK + EN, exact parity, MK provisional) — chrome + per-`IndexId` warm `strengthLine` + the OG copy. Report CONTENT (the strength name) stays in `buildReport`; the "IQ UP!" wordmark is structural markup, not a string.

---

## Definition of Done — evidence

- [x] **Task 0 passed** — sync clean; dependency gate green; the 3.08 certificate-surface finding (present + usable) and the 3.10 merge state (merged) recorded above.
- [x] **v2-branded shareable certificate renders** in `src/components/report/`, built to the 3.08 surface, bilingual MK/EN, "IQ UP! Explorer" framing, the top strength in warm child-facing language, deterministic per-child accent from the top-strength hue. (Verified live, both locales — screenshots in the session.)
- [x] **No scores anywhere** — `certificate.test.tsx` runs a non-vacuous forbidden-token scan over the rendered certificate (5 indices × both locales, wordmark stripped) + a no-stray-digit scan (only the keepsake date). The only "IQ" is the brand wordmark (rendered as markup, allowed).
- [x] **Optional on-device-only name** — off by default (toggle), carries the "stays on this device" note, proven **never transmitted**: the no-leak test asserts the cert code calls no `submitAssessment`/`fetch`/`track`/`sendBeacon`/`gtag|clarity|fbq`/`URLSearchParams`, the name never appears in any HTML attribute, the share metadata is generic, and the copy-link writes only `window.location.origin`.
- [x] **Download produces a valid PNG** at 1080×1350 with Montserrat embedded (latin+cyrillic filter) and **no tofu** in MK Cyrillic — eyeballed via the rendered PNG (the `skipFonts` fallback PNG, exercised by this machine's headless renderer, was confirmed to render MK Cyrillic cleanly; real browsers take the embedded-Montserrat path — see "renderer note").
- [x] **Share** uses the Web Share API file-share with a copy-link fallback to an on-brand, PII-free preview (the locale landing).
- [x] **Dedicated name-free OG image** at `/[locale]/report/opengraph-image` — both locale routes return valid PNGs (`curl` → HTTP 200, `image/png`, PNG magic, ~55–57KB). No child name/PII in the image or its URL (takes only `{locale}`).
- [x] **Bibi placeholder** renders cleanly; the real-asset drop-in is one line (`BIBI_CERT_ART` in `src/components/result/bibi.ts`), no layout change.
- [x] **Wired at `// SEAM (3.11)`**; the full v2 results flow works end-to-end in both locales; `// SEAM (3.10)` + the 3.10 code untouched (only `// SEAM (3.11)` filled).
- [x] **Determinism proven** — same `ReportContent` → byte-identical certificate markup (test); no `Date`/`Math.random` on the content path.
- [x] **AA contrast holds across every accent** — `cert-accent.test.ts` verifies ink-on-tint ≥4.5, ink-on-white ≥4.5, white-on-violet ≥4.5, and the constant card text ≥4.5, for all five hues; plus a guard proving the raw accent solid behind text WOULD fail AA (documents why it's never used that way).
- [x] **`Certificate` namespace, exact MK/EN parity** (parity test green), MK provisional; report content not duplicated into messages.
- [x] **Frozen layers + two-store writes + `submitAssessment` data logic untouched** — `git diff main --stat` is additive only (15 files: 7 new + 8 surgical edits); the frozen-layer guard grep returns nothing; v1 certificate untouched; **no new Supabase write / Brevo call / CAPI event / GA4-Clarity event / schema change / processor / dependency.**
- [x] **typecheck / lint / build clean; full `npm test` green — 706/706 (65 files) = 677 prior + 29 new.**
- [x] **A fresh-context review was run** — verdict **APPROVE-WITH-NITS**; its one should-fix was taken (see below).
- [x] **State + decisions updated** — `current-state.md`, `file-map.md`, `00_stack-and-config.md` updated; decisions #202–#209 logged; MK copy flagged for native review; the optional-name note flagged for IqUp legal/privacy; branch **pushed**; **asking before merge.**

---

## Independent decisions (logged #202–#209 in `Decisions.md`)

- **#202** — Built to the existing 3.08 certificate surface as fresh v2 code (v1 orphaned).
- **#203** — Wired via an optional `certificate?: ReactNode` slot on `ResultsScreen` (keeps it pure + the 3.09 render test green); rendered **inline**, no certificate route.
- **#204** — Per-child accent is the top-strength index hue, used ONLY as `-tint`+`-ink` or `-ink`-on-white (never `-ink` on the raw solid → AA); the reward stamp + wordmark badge are white-on-violet.
- **#205** — `strengthLine` keyed by `IndexId` in the namespace; the strength NAME comes from `buildReport`; the wordmark is structural markup (keeps `Certificate.*` clear of `\biq\b`).
- **#206** — Keepsake date is "month year" from `meta.generatedDate` (the only cert digit); MK `strengthLine` uses gender-neutral "Со <adj> <noun>!" phrasing.
- **#207** — Download embeds only Montserrat (latin+cyrillic) via a filtered `getFontEmbedCSS`, with a 6s timeout → `skipFonts` fallback (the page declares ~23 font faces; embedding all stalls the SVG).
- **#208** — Share metadata is generic/name-free; copy-link → PII-free landing URL; a name-free `/report` OG covers raw-link previews.
- **#209** — No new dependency; no store write / Brevo / CAPI / analytics / schema / processor.

## Fresh-context review

**Verdict: APPROVE-WITH-NITS.** All hard rules (honesty, no-leak, determinism, additive, parity, AA) hold and are well-tested.
- **Should-fix (TAKEN):** the share/download status line always rendered a green success checkmark even when `copy.shareError` fired. Fixed — the status now tracks an `error` flag and renders an `Info` icon + neutral `--ink-muted` colour for errors vs the `Check` + success colour for "link copied".
- **Nits (acknowledged, not changed):** the `/report` OG sits on a `noindex` route the share button doesn't link to (it copies the landing, which has its own OG) — kept for consistency with `/result` + `/trial` and to cover raw `/report` shares; long single-word names (≤24 chars) wrap rather than clip (ample vertical space); `role="img"` collapses the cert to its generic label so the on-screen name isn't announced (intentional — reinforces the no-leak posture).

## Renderer note (download font embedding)

This machine's headless preview Chromium **cannot rasterise SVG-embedded fonts** — `toBlob` with ANY embedded `@font-face` stalls, while `skipFonts` resolves in ~120ms. The filter was verified to correctly produce the 2 Montserrat (latin+cyrillic) faces (76KB), so in real browsers (where v1's html-to-image embedding shipped and was verified in 1.10) the download takes the **embedded-Montserrat** path. The 6s-timeout `skipFonts` fallback guarantees the export never hangs; its PNG was confirmed to render MK Cyrillic cleanly (no tofu). Net: best-case embedded Montserrat in real browsers, always a fast clean Cyrillic capture otherwise.

## Needs Lazar / IqUp

- **Native-MK review** of all new `Certificate` copy (provisional) — especially the gender-neutral `strengthLine` set.
- **Legal/privacy review** of the optional **on-device child-name** field + its note. It is children's-name-adjacent even though IqUp **never** processes it (it never leaves the device); add to the Part-2 legal review list alongside the consent/processor items.
- **Licensed Bibi art** is still awaited (Cowork). The certificate ships the placeholder; dropping the art is one line (`BIBI_CERT_ART = '/bibi/certificate.png'`).
- **Two now-merged branches:** 3.09 + 3.10 are on `main`; this branch is `phase-3.11-certificate`, pushed and **awaiting your yes to merge**.

## How to re-verify locally

```bash
npm run typecheck && npm run lint && npm test && npm run build
# Live: npm run dev → drive /test?age=8&dev=1 to a completed run, submit the form,
# then the results reveal renders the certificate. Toggle the optional name,
# click Download/Share. OG: curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
#   http://localhost:3000/report/opengraph-image
```
