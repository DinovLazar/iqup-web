# CLAUDE.md — IqUp-Web

This is the entry point for **Claude Code** working in this repo.

## Read this first
**`AGENTS.md` holds the full, canonical project rules — read it now; everything in it applies to you.** This file is a short pointer plus a few Claude-specific notes. The two are kept in sync; if they ever conflict, `AGENTS.md` wins.

## What this is (v2)
An **adaptive cognitive + STEM assessment for children 5–13** (a lead-magnet web app): **8 internal signals → 5 parent-facing indices**, an adaptive basal/ceiling engine that is **deterministic — no AI at runtime**. Two deliverables: a **PDF report** (emailed, not stored) + a **shareable Bibi certificate**. This supersedes the v1 "brain games" test — see `Part-3-Phase-00-Completion.md`. Canonical spec: `plan.md` + `IQ UP Specifikacija v1.2`.

## The essentials (full versions in AGENTS.md)
- **One phase at a time. One phase = one completion report = one git commit.** Execute only the phase prompt you were handed; read any Design handover it references before building those screens.
- **End every phase by updating state:** `src/_project-state/current-state.md`, `file-map.md`, `00_stack-and-config.md`, and a filled-in completion report. Log any unprompted decision in `Decisions.md`.
- **Honest framing (hard rule):** never a score, percentage, percentile, IQ number, rank, or diagnosis — results are **bands + a pentagon + confidence labels** only. Growth areas, never deficits.
- **Deterministic, no AI at runtime:** the engine, scoring, and report assembly are reproducible; personalisation is signals × module library × assembly logic.
- **Bibi characters:** existing licensed images only (`public/bibi/`) — never generate or redraw them, and **only on the certificate** (never inside the assessment).
- **Tasks:** original only — procedurally generated within recognised paradigms (matrices, rotation, Corsi, Tower of London, paired-associate, Bebras CT), never copied from a real test.
- **Children's data + GDPR:** **two unlinkable stores** — anonymous scores (no PII, EU Supabase) + leads (parent name/email/phone/city/gender/consents, Brevo); no child name/surname; the PDF is not stored; separate none-pre-ticked consents before capture.
- **Quality bar:** Lighthouse 95+, WCAG 2.2 AA, mobile-first, no shortcuts. Build, lint, and type-check must pass before a phase is done.
- **Never commit secrets** (`.env.local` is git-ignored; Brevo/Meta keys stay server-side).

## Where things are
- Spec: `plan.md` · Phases: `phase-plan.md` · Brand: `brand.md` · Decisions: `Decisions.md` · Live state: `src/_project-state/current-state.md` · Rules of the road: `project-instructions.md`.
- Project root on the operator's machine: `~/Projects/iqup-web` (macOS; was `C:\Users\user\Desktop\iqup-web` on the old Windows machine).

## Working style for Claude Code
- **Use subagents to parallelize.** When a phase has independent, non-conflicting tasks (e.g. building several unrelated components, writing tests while a page is scaffolded, producing both the `mk` and `en` content sets), dispatch subagents to work them in parallel, then integrate. Don't parallelize tasks that share state or depend on each other's output.
- **Use the latest Claude Code features** available to you.
- **Read the relevant skills before building** (e.g. the frontend-design skill for UI work, and any document skills when a phase produces files) — they encode environment-specific best practices.
- **Verify before claiming done:** run the build / lint / type-check, confirm the phase's Definition of Done is actually met, then write the completion report.
