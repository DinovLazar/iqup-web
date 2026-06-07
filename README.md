# IqUp-Web

Bilingual (Macedonian / English) marketing-campaign website for **IqUp**, an
in-person after-school STEM program for children in North Macedonia. The
centerpiece is a free, age-banded children's "brain games" test (ages 3–13),
framed with an IQ-test hook but delivering **strengths-based results, never a
clinical score**. Its job: collect parent leads and build brand awareness.

> Built for a client. Hold a professional, client-ready bar throughout.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) ·
next-intl (MK default at `/`, EN at `/en`) · Supabase (Part 1.05) · Vercel.
Exact pinned versions live in
[`src/_project-state/00_stack-and-config.md`](src/_project-state/00_stack-and-config.md).

## Getting started

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000/ — Macedonian (default locale)
- http://localhost:3000/en — English

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |

## How this project is built

Work is split into numbered phases (`1.01`, `1.02`, … `2.01`, …). **One phase =
one completion report = one git commit.** If you're an AI agent working in this
repo, read **[`AGENTS.md`](AGENTS.md)** first for the canonical rules
(`CLAUDE.md` adds Claude-Code-specific notes).

## Where things live

| Path | What |
|---|---|
| [`plan.md`](plan.md) | Full build spec for the finished site |
| [`phase-plan.md`](phase-plan.md) | The living index of every phase |
| [`brand.md`](brand.md) | Brand source of truth |
| [`Decisions.md`](Decisions.md) | Append-only decisions log |
| [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) | Agent rulebooks |
| `src/_project-state/` | Live state: `current-state.md`, `file-map.md`, stack log, completion reports |
| `docs/design-handovers/` | Design handovers Code reads before building screens |
| `src/app/[locale]/` | Locale-routed pages |
| `src/i18n/` | next-intl routing, request, and navigation config |
| `src/messages/` | UI strings (`mk.json`, `en.json`) |

## Guardrails (non-negotiable)

- **Honest framing** — strengths-based results only; never an IQ number, score,
  percentile, or pass/fail.
- **Bibi characters** — existing licensed images only; never generated or redrawn.
- **Test questions** — original only; inspired by general task types, never copied.
- **Children's data + GDPR** — minimal fields, parental consent, EU-region data.
- **Never commit secrets** — `.env*` is git-ignored; use environment variables.

Full details in [`AGENTS.md`](AGENTS.md).
