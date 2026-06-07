# CLAUDE.md — IqUp-Web

This is the entry point for **Claude Code** working in this repo.

## Read this first
**`AGENTS.md` holds the full, canonical project rules — read it now; everything in it applies to you.** This file is a short pointer plus a few Claude-specific notes. The two are kept in sync; if they ever conflict, `AGENTS.md` wins.

## The essentials (full versions in AGENTS.md)
- **One phase at a time. One phase = one completion report = one git commit.** Execute only the phase prompt you were handed; read any Design handover it references before building those screens.
- **End every phase by updating state:** `src/_project-state/current-state.md`, `file-map.md`, `00_stack-and-config.md`, and a filled-in completion report. Log any unprompted decision in `Decisions.md`.
- **Honest framing:** strengths-based results only — never an IQ number, score, percentile, or pass/fail.
- **Bibi characters:** existing licensed images only (`public/bibi/`) — never generate or redraw them.
- **Test questions:** original only — inspired by general task types, never copied from a real test.
- **Children's data + GDPR:** minimal fields only (parent email, child first name, age, locale, strengths summary, consent, timestamp); EU-region Supabase; consent before capture.
- **Quality bar:** Lighthouse 95+, WCAG 2.2 AA, mobile-first, no shortcuts. Build, lint, and type-check must pass before a phase is done.
- **Never commit secrets** (`.env.local` is git-ignored; use env vars).

## Where things are
- Spec: `plan.md` · Phases: `phase-plan.md` · Brand: `brand.md` · Decisions: `Decisions.md` · Live state: `src/_project-state/current-state.md` · Rules of the road: `project-instructions.md`.
- Project root on the operator's machine: `C:\Users\user\Desktop\iqup-web`.

## Working style for Claude Code
- **Use subagents to parallelize.** When a phase has independent, non-conflicting tasks (e.g. building several unrelated components, writing tests while a page is scaffolded, producing both the `mk` and `en` content sets), dispatch subagents to work them in parallel, then integrate. Don't parallelize tasks that share state or depend on each other's output.
- **Use the latest Claude Code features** available to you.
- **Read the relevant skills before building** (e.g. the frontend-design skill for UI work, and any document skills when a phase produces files) — they encode environment-specific best practices.
- **Verify before claiming done:** run the build / lint / type-check, confirm the phase's Definition of Done is actually met, then write the completion report.
