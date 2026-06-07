# AGENTS.md — IqUp-Web

Canonical rules for any coding agent working in this repository (Claude Code or otherwise). If you are an AI agent and you just opened this repo, read this file first, then the documents under "Read before you build."

---

## What this project is

IqUp-Web is a **marketing-campaign website** for IqUp, an in-person after-school STEM program for children 3–9 in North Macedonia. The centerpiece is a free, age-banded children's "brain games" test (3–13), framed with an IQ-test hook but delivering **strengths-based results, never a clinical score**. Its job: **collect parent leads + build brand awareness**. It's built for a client — hold a professional, client-ready bar.

Full spec: `plan.md`. Phase index: `phase-plan.md`.

## How this project is built

Work is split into numbered phases (`1.01`, `1.02`, … `2.01`, …). A non-technical operator (Lazar) hands you **one phase prompt file** (`Part-X-Phase-YY-Code.md`) at a time. Execute exactly that phase, then write a completion report. **One phase = one completion report = one git commit.** Never drift into other phases.

Other roles referenced in this repo: **Chat** (orchestrator/planner), **Design** (produces visual handovers you must read before building the matching screens), **Cowork** (manual setup — accounts, asset gathering, DNS). If a task is manual setup that belongs to Cowork or the human (creating an account, clicking a DNS record, uploading client assets), don't attempt it — flag it in your completion report.

## Read before you build

1. `project-instructions.md` — how the project runs.
2. `plan.md` — the full spec (the "why" and the target).
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

- **Honest framing.** The marketing headline may use the "IQ test" hook, but the experience and results are **strengths-based — never output a clinical IQ number, a total score, a percentile, or pass/fail.** Weaker areas are framed as "growing," never as failing or below average.
- **Bibi characters: existing licensed images only.** Never generate, redraw, or AI-create the "Svetot na Bibi" characters. Use only the official files in `public/bibi/` (gathered by Cowork). If an asset you need isn't there, flag it — never invent one.
- **Test questions: original only.** Items may be inspired by general task *types* (patterns, matrices, odd-one-out, sequences, memory) but must be written original. Never copy items from any proprietary or copyrighted test.
- **Children's data + GDPR.** Collect only what the funnel needs: parent email, child's first name, child's age, locale, strengths summary, consent, timestamp. **No surnames, birth dates, addresses, or any extra PII.** Supabase is EU-region. Consent is required before capture. Final legal sign-off on privacy/consent wording is IqUp's — not ours.

## Quality bar

- **Lighthouse 95+** (Performance, Accessibility, Best Practices, SEO) on mobile and desktop.
- **WCAG 2.2 AA** accessibility.
- **Mobile-first** — traffic is Facebook/Instagram ads (phones).
- **Copy** is plain, real-person language — no marketing fluff. Jargon stays inside code.
- Build, lint, and type-check must pass before a phase is done.

## Stack (locked)

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix) · Framer Motion · Lucide · next-intl (MK default at `/`, EN at `/en/`) · content as structured files in-repo (no CMS) · Supabase (EU) for leads · GA4 + Microsoft Clarity + Meta Pixel (Part 2) · Vercel (Pro before launch) · iubenda/Termly for privacy + cookie consent. Email/CRM/booking decided in Part 2; domain/DNS at launch. **No AI features at launch.** Pinned versions live in `00_stack-and-config.md`.

## Project structure

```
src/app/[locale]/        routes: page (landing), test/, result/, about/, privacy/, layout
src/components/          UI components
src/content/test/        question banks per band (MK/EN)
src/content/results/     strengths-profile templates (MK/EN)
src/lib/supabase/        Supabase client + lead insert
src/lib/scoring/         rule-based scoring + strengths mapping
src/messages/            next-intl strings: mk.json, en.json
public/bibi/             licensed Bibi image assets (from IqUp)
public/og/               Open Graph share images
docs/design-handovers/   Design handover files
src/_project-state/      current-state.md, file-map.md, 00_stack-and-config.md, completion reports
```

### Conventions
- **i18n:** every user-facing string lives in `src/messages/` (UI) or `src/content/` (questions, results), in both `mk` and `en`. Never hard-code user-facing text. MK is the default locale; EN is served at `/en/`. Every page emits hreflang.
- **Scoring:** rule-based only, in `src/lib/scoring/`. Each question maps to one or more strength areas; correct answers add to those strengths; compute top strengths at the end. No total or IQ value anywhere.
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

- Don't generate or redraw Bibi characters; don't copy proprietary test items.
- Don't output an IQ number, score, percentile, or pass/fail.
- Don't collect PII beyond the minimal fields listed above.
- Don't commit `.env*` or any secret.
- Don't add dark mode or heavy/janky animations (they hurt the trust feel and Lighthouse).
- Don't build screens that have a Design handover without reading the handover first.
- Don't open or work on more than one phase at a time.
- Don't do manual account/DNS setup that belongs to Cowork or the human — flag it instead.
