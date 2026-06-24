# Part 3 · Phase 3.10 — Completion report

**Phase:** Code — the PDF report + email delivery.
**Branch:** `phase-3.10-pdf-report-email` (off `main`).
**Date:** 2026-06-24.
**Outcome:** Complete. On submit, the funnel now renders a branded, bilingual **"IQ UP! cognitive profile" PDF** in memory and emails it via Brevo (after-scheduled, fully isolated, no-op without a key) — the PDF is never stored. Build / lint / typecheck clean; **677/677** tests pass; the PDF was eyeballed in both locales (3 pages, clean Cyrillic); the real send path was exercised (logged no-key skip, no throw). Live delivery deferred-pending-key.

---

## What shipped

The `// SEAM (3.10)` in `submitAssessment` is wired: after the honeypot returns, the action `after()`-schedules an isolated `sendReportEmail({run, email, locale, city, generatedAt})`. The server recomputes the SAME `CognitiveProfile` (`buildProfile(run)`) and assembles the SAME `ReportContent` (`buildReport(profile, {locale, city, generatedAt})`) the on-screen screen rendered, renders the PDF + the cover email **in memory**, and sends one transactional email — then discards the PDF.

**PDF generator (`src/lib/pdf/`):**
- **`renderReportPdf({report, locale, bookingUrl}) → Promise<Buffer>`** (`render.tsx`) — the Node entry (`renderToBuffer`).
- **`ReportDocument.tsx`** — 3 A4 pages per the 3.08 PDF surface: cover (branded header + title + age/generated/city meta + the identity pentagon + the top-strength callout) → the five colour-coded indices (band **word** pill + confidence **word** + note) → narrative (overall profile = `overview` + `solvingStyle` · room-to-grow + activity · 2–3 home activities (dot markers, never ordinals) · STEM readiness + the **bridge** · IqUp positioning + matched program + the **clickable demo CTA carrying `?grad=`** · the disclaimer). Flat fills only; Montserrat embedded.
- **`IdentityPentagonPdf.tsx` / `Glyph.tsx`** — the pentagon (1:1 geometry of the on-screen `IdentityPentagon`) + the index glyphs, in react-pdf SVG primitives.
- **`model.ts`** — `buildReportPdfModel` + `flattenModelText`: the single content model the document lays out AND the tests scan (zero drift).
- **`pdf-copy.ts`** (self-contained PDF chrome + deterministic date/age formatters mirroring `ResultsScreen`), **`tokens.ts`** (literal-hex `--ix-*`/`--action*`/`--ink-*` mirror), **`fonts.ts`** + four committed **Montserrat** static TTFs (400/600/700/800, full Latin + Cyrillic), **`fixtures.ts`**, **`index.ts`**.

**Email:**
- **`src/emails/ReportEmail.tsx`** (React Email, 2.01 brand/layout) — greeting → "profile attached" → a worded top-strength teaser (from `ReportContent`, not messages) → demo CTA → IqUp identity footer. No number/IQ/%/rank, no child name.
- **`report-render.ts`** (`renderReportEmail → {html, text}`), **`types.ts`** (+ `ReportEmailChrome`/`ReportEmailProps`).

**Send path:** **`src/lib/email/send-report-email.ts`** (`server-only`, isolation mirrors 2.01) — validity gate (send `valid`/`gentle_note`, **skip+log `not_representative`**) → `buildReport` → render PDF + email → `sendTransactionalEmail` (tags `['report-email', locale]`). Never throws; logged no-op without `BREVO_API_KEY`/sender; PDF never stored.

**Seam wiring:** `submit-assessment.ts` gains an optional transient `report?: {run, generatedAt}` field (used only to build the emailed report — written to NEITHER store); `ReportFlow.tsx` passes `report: {run, generatedAt: submittedAt}`.

**i18n:** new **`ReportEmail`** namespace (MK + EN exact parity, MK provisional) — email chrome only.

**Config/docs:** `next.config.ts` (`outputFileTracingIncludes` for the fonts), `.gitignore` (sample-PDF dir), `package.json` (`report:sample` + `test:report-email`), `.env.local.example` (reuse note). Dev harnesses `scripts/render-report-sample.ts` + `scripts/test-report-email.ts`.

**Tests (+54 → 677):** `report-pdf.test.ts` (section presence, `?grad=` CTA, forbidden-token + no-stray-digit over the model AND the rendered document element tree, determinism, binary `%PDF-` smoke — both locales × valid/gentle_note), `pentagon-pdf.test.ts` (geometry parity + glyph-parse guard), `ReportEmail.test.ts` (HTML/text forbidden scan, teaser + CTA, no child name), `send-report-email.test.ts` (no-key/no-sender no-op, validity gate, in-memory attachment + tags, never-throws), `messages.test.ts` (`ReportEmail` parity + forbidden + no-digit).

---

## Task 0 — sync + dependency gate

Sync clean (on `main`, up to date with `origin/main`, tree clean). Gate green: 3.06 (`/report` + `ReportFlow` + the `// SEAM (3.10)` marker), 3.07 (`buildReport` + `ReportContent`/`ReportContext`), 3.08 (handover + `surfaces/` + `report-kit.js` + `tokens-v2.css`), **3.09 (`ResultsScreen`/`IdentityPentagon`/`index-meta` + the v2 token layer) all present on `main`.** Branched `phase-3.10-pdf-report-email` off `main`.

---

## Definition of Done

- [x] Task 0 passed (sync clean; 3.06/3.07/3.08/3.09 present on `main`).
- [x] `src/lib/pdf/` generates a branded, bilingual "IQ UP! cognitive profile" PDF from `ReportContent`, matching the 3.08 PDF surface.
- [x] The PDF renders from the SAME `buildReport(profile, {locale, city, generatedAt})` as the screen (server recomputes the profile via `buildProfile(run)`; gender omitted).
- [x] All sections present: pentagon + five indices (band word + confidence word/note) + top strength + growth + 2–3 home activities + STEM + bridge + IqUp positioning + the clickable demo CTA carrying `?grad=` + the disclaimer.
- [x] Montserrat (Cyrillic + Latin) embedded; Macedonian renders with **no tofu** (visually verified).
- [x] The bilingual email (React Email) renders HTML + plain text, mirrors 2.01, carries the demo CTA + IqUp footer, and contains **no number/score/IQ/%/rank and no child name**.
- [x] The v2 send path renders the PDF in memory, attaches it via `sendTransactionalEmail`, **never throws**, is a clean logged no-op when `BREVO_API_KEY` is unset; the PDF is **never stored**.
- [x] The `// SEAM (3.10)` is wired: `after()`-scheduled, honeypot returns before it, isolated from the reveal + the two writes; the reveal still works with the send unconfigured.
- [x] Validity send-gate: sends `valid` + `gentle_note`; **skips (logs) `not_representative`**.
- [x] The profile reaches the server **without** changing the Store A payload/schema or weakening unlinkability (transient `report.run`, written to neither store).
- [x] Honest-framing proven by a non-vacuous forbidden-token scan over the rendered PDF text (model **and** rendered document tree) + the rendered email, both locales; the only digits are age + generated date.
- [x] Determinism proven: same `ReportContent` → same rendered text, both locales; no `Date`/`Math.random` on the content path.
- [x] New `ReportEmail` i18n strings, exact MK/EN parity (parity test green), MK provisional; report content not duplicated into messages.
- [x] Frozen engine/scoring/validity/tasks/norms/report-engine + the 3.06 two-store writes/`submitAssessment` data logic untouched (`git diff main --stat` = additive only); v1 untouched.
- [x] `typecheck`/`lint`/`build` clean; full `npm test` **677/677** (623 prior + 54 new); the dev harness renders sample PDFs.
- [x] A fresh-context review was run; its one must-fix (stray list ordinals) was taken (now dot markers + a rendered-tree digit test).
- [x] Independent calls logged (#194–#201); `current-state.md` + `file-map.md` + `00_stack-and-config.md` updated; `.env.local.example` updated; branch **pushed**; **asking Lazar before merging.**

---

## Verification

- **Static:** `npm run typecheck`, `npm run lint`, `npm run build` clean (route table unchanged; `/[locale]/report` now bundles the server send + the traced fonts). `npm test` → **677/677** (63 files). `git diff main --stat` = additive PDF/email/seam/i18n/env/state only; **no frozen layer touched**.
- **PDF (dev harness, both locales):** `npm run report:sample` → `docs/qa/Part-3-Phase-10/` (gitignored). Eyeballed: 3 A4 pages exactly; branded cover + the identity pentagon (same shape) + age/generated/city; the five colour-coded indices with band-word pills + confidence words/notes; the narrative + the violet demo CTA; the disclaimer; **Macedonian Cyrillic renders cleanly, no tofu.** Verified 3 pages across the full content space (default, all-strong, all-floor, every solving style, both locales).
- **Real send path:** `npm run test:report-email` (with `TEST_EMAIL_TO`, no key) drove the REAL `sendReportEmail` for both locales → `{"event":"report-email","status":"skipped-no-key","locale":…}`, no throw. **Live delivery DEFERRED-pending-key** (this machine's `.env.local` is blank — set `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS` + `TEST_EMAIL_TO`, then re-run to confirm inbox delivery + the Cyrillic subject/body + the PDF attachment opening with the right sections).
- **Route (real runtime):** seeded a real `iqup.assessmentRun.v1` and loaded `/report` (MK + EN) — the route renders and reveals the form from the run; the form fields fill. (The Radix consent checkboxes don't respond to this environment's synthetic events, so the literal click-through-submit couldn't be driven here; the submit→after()→send path is covered by the unit suite and the harness above, and the reveal/submit data logic is 3.09's unchanged path plus the additive seam.)

---

## Decisions (logged #194–#201 in `Decisions.md`)

194 Montserrat as static TTFs instanced from the variable font (full Cyrillic; data-URI register; font tracing) · 195 the profile reaches the server as the transient `report.run` on the submit payload, written to neither store · 196 PDF chrome self-contained in `pdf-copy.ts` (not messages); date formatter mirrors `ResultsScreen` · 197 single content model (`buildReportPdfModel`/`flattenModelText`) drives both the document and the tests · 198 page 3 omits `extremes` + photo slots, surfaces `overview`+`solvingStyle`, tightened to exactly 3 pages · 199 the matched-program line IS rendered though program names contain textual "Bibi/Боби" (brand text, not artwork) · 200 dropped numeric page numbers + brand year + the `↳` glyph (digit-clean scan; font coverage) · 201 sample PDFs gitignored (size); fonts committed.

---

## Flag in the completion report (for Chat → Lazar)

- **3.08 PDF-surface gap:** none — the 3.08 handover's §3 PDF surface + `Report.html` were complete and faithfully implemented. The handover's optional **photo slots** (empty dashed boxes for future IqUp photography) were **omitted from the delivered PDF** so a real parent never receives a placeholder box, and the latent **`extremes`** framing was omitted (neither surface renders it; the 3.08 page has no slot) — both decisions #198.
- **Textual "Bibi" in program names (confirm intent):** the matched-program names from the frozen 3.07 engine are real IqUp brand copy — e.g. "Bibi & Bobi's Magic Laboratory" / "Магичната лабораторија на Биби и Боби". They render as the program pill on PDF page 3. The "no Bibi in the PDF" rule targets Bibi character **artwork/illustrations** (there are none); this is brand **text**. Flagged for Lazar to confirm it's acceptable to show the program name (decision #199) — the alternative is dropping the baked-in "age→program fit".
- **Privacy / legal review:** the emailed PDF carries the child's cognitive profile (bands, strengths) through **Brevo's transactional pipeline** as an attachment — transient and **not stored by us**, but Brevo's transactional retention applies. Add this PDF-attachment detail to the Part-2 Brevo legal-review item (from 2.01). (`plan.md` §14's "the PDF is not stored after it's emailed" = *our* storage.)
- **Provisional copy:** the email's MK copy + the PDF chrome MK copy are provisional (native-MK review); the email **footer identity/legal line** is for IqUp legal (tied to the consent version) — consistent with 2.01.
- **Demo-CTA host** stays the `/trial` fallback until `NEXT_PUBLIC_BOOKING_URL` (and the production site URL) land (3.16).
- **Independent calls** surfaced: the profile-to-server payload shape (transient `report.run`); the email body content; the PDF chrome living in `pdf-copy.ts` (not messages) — all in `Decisions.md` #194–#201.

---

## Outputs

- Code: `src/lib/pdf/*` (the PDF document + `renderReportPdf` + model/tokens/fonts/chrome/fixtures), `src/lib/pdf/fonts/*.ttf`, `src/emails/{ReportEmail.tsx,report-render.ts}` + `types.ts`, `src/lib/email/send-report-email.ts`, the `submit-assessment.ts` seam + `ReportFlow.tsx` wiring, `src/messages/{mk,en}.json` (`ReportEmail`), `next.config.ts`, `package.json`, `.gitignore`, the two dev-harness scripts.
- Tests: `src/lib/pdf/{report-pdf,pentagon-pdf}.test.ts`, `src/emails/ReportEmail.test.ts`, `src/lib/email/send-report-email.test.ts`, `src/messages/messages.test.ts` (extended).
- Docs/config: `.env.local.example`, `src/lib/pdf/README.md`; `Decisions.md` (#194–#201); `current-state.md`, `file-map.md`, `00_stack-and-config.md`; this report.
