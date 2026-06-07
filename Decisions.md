# IqUp-Web — Decisions Log

Append-only record of project decisions. Newest entries go at the bottom. Each entry: date, the decision, and a short "why."

---

## Conventions

- **Append, don't edit.** Never rewrite or delete a past entry.
- **Reversing a decision?** Add a *new* entry that states the change and references the entry it replaces (e.g. "Supersedes 2026-06-07 #6").
- **Who appends:** Chat logs decisions made during planning and chat. Code appends any decision it had to make on its own during a phase — and also surfaces it in that phase's completion report so Chat can flag it to Lazar.

---

## Decisions

### 2026-06-07 — Seeded from intake + planning

1. The site is a marketing-campaign funnel, not a multi-page brochure site. *Why: the goal is leads + awareness, not a full company website.*
2. Honest framing — an IQ-test hook for the headline, but results are a strengths profile, never a clinical IQ number. *Why: a valid IQ score for young children online isn't possible or honest; protects parent trust and keeps us legally and ethically sound.*
3. The test covers ages 3–13, even though IqUp's program is 3–9. *Why: a wider net for leads and awareness.*
4. Three age bands — 3–5 (parent-assisted), 6–9 (mostly solo), 10–13 (solo). *Why: balances age-fit against the amount of content to write.*
5. The parent enters their email *before* results are shown. *Why: maximizes lead capture, the primary goal.*
6. Results = strengths profile + shareable certificate for all three bands; a free-trial invite for 3–5 and 6–9; 10–13 ends at the result. *Why: the certificate drives sharing and awareness; there's no program for 10–13, so no trial CTA.*
7. Bibi characters — existing licensed images only, never generated or redrawn. *Why: IP/license correctness; we don't recreate licensed characters.*
8. Test questions are original, inspired by general task types, never copied from a proprietary test. *Why: copyright safety.*
9. Languages — Macedonian default at `/`, English at `/en/`. *Why: North Macedonia market, MK-first.*
10. Stack locked — Next.js / TypeScript / Tailwind / shadcn-ui / Framer Motion / Lucide / next-intl, Supabase (EU), GA4 + Microsoft Clarity + Meta Pixel, Vercel, iubenda/Termly. *Why: fits a fast, interactive, bilingual lead funnel.*
11. Leads stored in Supabase, EU region. *Why: already connected, free tier, GDPR-appropriate data location.*
12. Two-part build — Part 1 builds locally, Part 2 integrates and launches. *Why: clean separation of building vs. going live.*
13. Two Design phases (foundation; results + certificate). *Why: iterate the look before locking it into code.*
14. Deferred to Part 2 — email service, CRM, trial-booking mechanic. Deferred to launch — domain + DNS. *Why: not needed for the local build.*
15. Repo `DinovLazar/iqup-web`, private. Local folder `C:\Users\user\Desktop\iqup-web`. *Why: client work.*
16. Replaced the usual Notion checklist with `CLAUDE.md` + `AGENTS.md`. *Why: agent-facing repo instructions are more useful for a Code-heavy build.*
17. Phase 1.01 is a Chat research phase producing `brand.md`. *Why: establish the brand source-of-truth before any building.*
18. No AI features at launch. *Why: rule-based scoring with templated strengths results is safer and more predictable for children than AI-generated copy.*

### 2026-06-07 — Phase 1.02 scaffold (Code)

19. **npm** is the package manager for the whole project (single `package-lock.json`). *Why: one lockfile, one toolchain; matches the scaffold brief and avoids mixed-manager drift.*
20. next-intl `localePrefix: 'as-needed'` — Macedonian served at `/` with no prefix, English at `/en`. *Why: MK is the default market locale and should own the clean root URL; only the secondary locale carries a prefix.*
21. Code self-reviews and verifies its own work each phase (via the `requesting-code-review` and `verification-before-completion` skills). Heavier external AI review (CodeRabbit / Codex) and branch-protection rules are **deferred** to a future pull-request workflow. *Why: keeps the solo local build fast now; formal PR review can be layered on when the repo opens up to more contributors.*
22. Repo structure follows `plan.md` §9, **not** the generic `project-repo-bootstrap` skill layout (`briefs/`, `reports/`, `status/`, `docs/architecture`, CodeRabbit/Codex PR setup). *Why: this project has its own canonical structure and doc set (`src/_project-state/`, `docs/design-handovers/`, `AGENTS.md` + `CLAUDE.md`); the brief explicitly overrides the bootstrap skill.*
