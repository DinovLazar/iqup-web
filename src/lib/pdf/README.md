# `src/lib/pdf/` — server-side PDF report (Phase 3.10)

Generates the branded, bilingual **"IQ UP! cognitive profile"** PDF server-side,
deterministically from a `ReportContent` (the 3.07 engine's output), and hands it
to the email send (spec Дел 10). The PDF is **rendered in memory, emailed, and
never stored** (the two-store privacy model — Дел 14).

**Library: `@react-pdf/renderer`.** The five-index **identity pentagon** is
reproduced with react-pdf SVG primitives from the EXACT geometry of the on-screen
`IdentityPentagon` (3.09), so the printed shape matches the screen.

## Entry point

`renderReportPdf({ report, locale, bookingUrl }) → Promise<Buffer>` — Node-only
(react-pdf + embedded Montserrat). Renders the same `buildReport(...)` output the
on-screen results screen shows, so the two can never disagree.

## Layout (3 A4 pages, per the 3.08 PDF surface)

1. **Cover** — branded header → title + age/generated/city meta → the identity
   pentagon → the top-strength callout.
2. **The five indices** — each a hue rail + glyph + name + band **word** pill +
   confidence **word** + note. No numbers, no per-axis magnitude.
3. **Narrative + next steps** — overall profile (shape + solving style) · room to
   grow (+ activity) · activities at home · STEM readiness + the coding/robotics
   bridge · IqUp positioning + matched program + the clickable demo CTA (carries
   `?grad=`) · the full disclaimer + provisional-norms note.

## Files

- `render.tsx` — `renderReportPdf` (the Node entry, `renderToBuffer`).
- `ReportDocument.tsx` — the 3-page `Document`.
- `IdentityPentagonPdf.tsx` / `Glyph.tsx` — the pentagon + index glyphs in react-pdf SVG.
- `model.ts` — `buildReportPdfModel` + `flattenModelText`: the single content model
  both the document and the tests read (zero drift).
- `pdf-copy.ts` — the localized PDF chrome + the deterministic age/date formatters
  (the date formatter mirrors `ResultsScreen` exactly).
- `tokens.ts` — literal-hex mirror of the v2 `--ix-*` / `--action*` / `--ink-*`
  palette (react-pdf can't resolve `var(--…)`).
- `fonts.ts` + `fonts/*.ttf` — Montserrat 400/600/700/800 (full Latin + Cyrillic),
  registered as base64 data URIs; hyphenation disabled.
- `fixtures.ts` — `CognitiveProfile` / `ReportContent` fixtures for the tests + harnesses.

## Honest framing

No number / %, / IQ / score / rank anywhere — bands + confidence are **words**;
the only digits are the child's **age** and the **generated date**. No Bibi /
characters (Bibi is the certificate, 3.11). Proven by a forbidden-token + no-stray-
digit scan over the rendered text in `report-pdf.test.ts`.

## Dev harness

`npm run report:sample` renders sample PDFs (valid + gentle_note, both locales) to
`docs/qa/Part-3-Phase-10/` (gitignored) for eyeballing.
