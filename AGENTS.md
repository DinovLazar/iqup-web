# AGENTS.md — IqUp-Web

Canonical rules for any coding agent working in this repository (Claude Code or otherwise). If you are an AI agent and you just opened this repo, read this file first, then the documents under "Read before you build."

---

## What this project is

IqUp-Web is a **free web application (lead magnet)** for IqUp, an in-person after-school STEM program in North Macedonia. The centerpiece is an **adaptive cognitive + STEM assessment for children aged 5–13** that produces a **professional, plain-language cognitive profile** — built on recognised paradigms (WISC-V, Raven's, KABC, computational thinking) with original tasks. Its job: **collect parent leads + build brand awareness**, and position IqUp as serious education for developing the intellect. It's built for a client — hold a professional, client-ready bar.

**Core mechanics:** the engine measures **8 internal signals → 5 parent-facing indices** (Logical · Spatial · Memory & focus · Planning & speed · Learning & STEM) via an **adaptive, basal/ceiling engine** that is **fully deterministic — no AI at runtime**. **Two deliverables:** a professional **PDF report** (emailed, not stored) and a **shareable Bibi certificate**.

**Hard positioning rule (non-negotiable):** never a score, percentage, percentile, or IQ number — results are **bands + a pentagon + confidence labels** only. We say "cognitive profile / indicative range", never "clinical IQ" or a diagnosis.

> **v2.** This is the v2 product (the adaptive assessment). It supersedes the v1 strengths-based "brain games" test; parts of the v1 build are being rebuilt — see `src/_project-state/Part-3-Phase-00-Completion.md`. Full spec: `plan.md` (English) + the canonical `IQ UP Specifikacija v1.2` (MK). Phase index: `phase-plan.md`.

## How this project is built

Work is split into numbered phases (`1.01`, `1.02`, … `2.01`, …). A non-technical operator (Lazar) hands you **one phase prompt file** (`Part-X-Phase-YY-Code.md`) at a time. Execute exactly that phase, then write a completion report. **One phase = one completion report = one git commit.** Never drift into other phases.

Other roles referenced in this repo: **Chat** (orchestrator/planner), **Design** (produces visual handovers you must read before building the matching screens), **Cowork** (manual setup — accounts, asset gathering, DNS). If a task is manual setup that belongs to Cowork or the human (creating an account, clicking a DNS record, uploading client assets), don't attempt it — flag it in your completion report.

## Read before you build

1. `project-instructions.md` — how the project runs.
2. `plan.md` — the full v2 spec (the "why" and the target; the canonical source is `IQ UP Specifikacija v1.2`).
3. `phase-plan.md` — where this phase sits and what it depends on.
4. `brand.md` — brand source of truth: colors, type, voice, Bibi usage. *(Exists from phase 1.01 onward.)*
5. `Decisions.md` — decisions already made; don't contradict them.
6. `src/_project-state/current-state.md` — what already exists in the repo.
7. **Your phase prompt file**, and **any Design handover it references** (`docs/design-handovers/Part-X-Phase-YY-Handover.md`).

If a doc and the live code disagree, the live code wins — note the mismatch in your completion report.

## Golden rules

- **Execute one phase only.** Meet the phase prompt's Definition of Done exactly.
- **End every phase by updating project state:** update `src/_project-state/current-state.md`, add/adjust rows in `file-map.md`, append any stack/config change to `00_stack-and-config.md`, and write the completion report (copy `src/_project-state/Part-X-Phase-YY-Completion.template.md`, rename to the real phase number e.g. `Part-1-Phase-02-Completion.md`, fill it in).
- **Log decisions.** Any choice you make without an explicit instruction goes in `Decisions.md` *and* in the completion report's "decisions made on the fly" section.
- **One commit per phase**, message naming the phase (e.g. `Phase 1.06: landing page`).
- **No shortcuts, no "TODO later"** when the real fix is in reach. If you hit a genuine tradeoff, state it.

## Product & content guardrails (non-negotiable)

- **Honest framing (positioning rule).** Results are an **indicative cognitive profile — never a score, percentage, percentile, IQ number, rank, or diagnosis.** The hybrid presentation is **pentagon + per-index band + word label (Developing/Solid/Strong/Exceptional) + confidence label**, no hard number. Growth areas are "room to grow", never "weakness/problem/behind". The "informative, not diagnostic" line must appear in the 7 required places (spec Дел 16). This is a credibility *and* legal rule — breaking it is unacceptable.
- **No AI at runtime.** The adaptive engine, scoring, and report assembly are **deterministic** — same answers → same path and result. Personalisation comes from rich signals × a large module library × assembly logic, **not** generation. No AI-written copy for children.
- **Bibi characters: existing licensed images only, and only on the certificate.** Never generate, redraw, or AI-create the "Svetot na Bibi" characters; use only the official files in `public/bibi/`. **Bibi appears on the shareable certificate only — never inside the assessment** (validity). If an asset isn't there, flag it — never invent one.
- **Test tasks: original only, within recognised paradigms.** Tasks are procedurally generated and original, inspired by general task *types* (matrices, mental rotation, Corsi span, Tower of London, paired-associate, Bebras-style CT). **Never copy items** from WISC / Raven's / KABC or any proprietary test.
- **Children's data + GDPR (two unlinkable stores).** **Store A — anonymous scores** (age, gender, city, language, 8 signals + 5 indices, **date only**): no name/email/phone, in Supabase (EU). **Store B — leads** (parent first name, email, phone, city, gender, consents) in Brevo. The two **must never be joinable** (no shared key; store A has only a date). **No child name, no surname.** The **PDF is not stored.** Separate, none-pre-ticked consents are required before capture. Final legal sign-off on privacy/consent wording is IqUp's — not ours.

## Quality bar

- **Lighthouse 95+** (Performance, Accessibility, Best Practices, SEO) on mobile and desktop.
- **WCAG 2.2 AA** accessibility.
- **Mobile-first** — traffic is Facebook/Instagram ads (phones).
- **Copy** is plain, real-person language — no marketing fluff. Jargon stays inside code.
- Build, lint, and type-check must pass before a phase is done.

## Stack (locked)

Next.js (App Router) · TypeScript · Tailwind CSS v4 (**Montserrat + the official IqUp palette** — brand tokens in `globals.css`) · shadcn/ui (Radix) · Framer Motion · Lucide · next-intl (MK default at `/`, EN at `/en/`; SR/HR in phase 2) · content as structured files in-repo (no CMS) · **Supabase (EU) for anonymous scores** · **Brevo (EU) for leads + the transactional PDF email + campaigns** · **`@react-pdf/renderer`** for the server-side PDF report · **a custom SVG pentagon (no charting library)** · **Meta CAPI (server-side)** + GA4 + Microsoft Clarity, consent-gated · Vercel (Pro before launch). Domain/DNS at launch (subdomain of iqup.mk). **The assessment compute, scoring, and report assembly are client/server-side deterministic — no AI at runtime.** Pinned versions live in `00_stack-and-config.md`.

## Project structure

```
src/app/[locale]/        routes: page (landing), test/, result/, about/, privacy/, layout
src/components/          UI components
src/content/tasks/       the task bank (procedural generators + items)
src/content/norms/       age norms + scoring weights (seed)
src/content/report/      report module library (copy: strengths/growth/style/STEM modules)
src/lib/engine/          adaptive basal/ceiling engine (deterministic, no AI)
src/lib/scoring/         raw→index scoring + the 5 composite indices
src/lib/validity/        validity flags, timing, derived attention signal, confidence labels
src/lib/report/          deterministic report assembly (no AI)
src/lib/pdf/             server-side PDF report (@react-pdf/renderer)
src/lib/supabase/        anonymous-scores client (no PII)
src/lib/email/           Brevo transport (transactional PDF email + campaigns)
src/messages/            next-intl strings: mk.json, en.json (+ sr/hr phase 2)
public/bibi/             licensed Bibi image assets (certificate only)
public/og/               Open Graph share images
docs/design-handovers/   Design handover files
src/_project-state/      current-state.md, file-map.md, 00_stack-and-config.md, completion reports
```
*(Some v1 folders — `src/content/test/`, `src/content/results/` — still exist and are rebuilt/retired as v2 phases land; see `Part-3-Phase-00-Completion.md`.)*

### Conventions
- **i18n:** every user-facing string lives in `src/messages/` (UI) or `src/content/` (tasks, report modules), in both `mk` and `en` (SR/HR phase 2). Never hard-code user-facing text. MK is the default locale; EN is served at `/en/`. Every page emits hreflang. Visual tasks are language-neutral (only instructions/UI localise).
- **Engine & scoring:** **deterministic, no AI**, in `src/lib/engine/` + `src/lib/scoring/`. The adaptive engine selects items by basal/ceiling; scoring normalises raw → a 0–100 index per exact age and composes the 5 indices. Same answers → same path and result, always. **No total, no IQ number, no rank anywhere** — output is bands + pentagon + confidence labels.
- **Report:** assembled deterministically in `src/lib/report/` from `src/content/report/` modules — no AI generation. To the parent: plain language, no jargon; growth areas never framed as deficits.
- **Components:** prefer shadcn/ui primitives for anything interactive (forms, dialog, progress, radio) so accessibility comes for free.

## Commands

Settled at scaffold (phase 1.02) and recorded in `00_stack-and-config.md`. Expected baseline (Next.js):
- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Type-check: `npm run typecheck` (`tsc --noEmit`)

Run the build, lint, and type-check before marking any phase done.

## Security

- **Never commit secrets.** Supabase keys and any API keys go in `.env.local` (git-ignored). Use environment variables; never hard-code keys.
- Server-only secrets stay in server code / server routes — never shipped to the client bundle.

## What NOT to do

- Don't generate or redraw Bibi characters; don't copy proprietary test items; don't put Bibi inside the assessment (certificate only).
- Don't output an IQ number, score, percentage, percentile, or rank — and don't call it a diagnosis or "clinical IQ".
- Don't introduce AI at runtime — the engine, scoring, and report must stay deterministic.
- Don't make the two data stores joinable (no shared key); don't store the PDF; don't collect a child name/surname or any PII beyond the listed fields.
- Don't commit `.env*` or any secret; keep API keys (Brevo/Meta) server-side only.
- Don't add dark mode or heavy/janky animations (they hurt the trust feel and Lighthouse); no anxious timers except the one speed game.
- Don't build screens that have a Design handover without reading the handover first.
- Don't open or work on more than one phase at a time.
- Don't do manual account/DNS setup that belongs to Cowork or the human — flag it instead.
