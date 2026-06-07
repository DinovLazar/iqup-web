# IqUp-Web — Phase Plan

> The living index of every phase. Update the **Status** column as completion reports land (Chat does this when Lazar pastes a report back). One phase = one completion report = one git commit per executing Claude session. Phase numbering: `1.01`, `1.02`, … then `2.01`, …

**Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Part 1 — Build everything locally

| # | Phase | Type | Status | Scope |
|---|---|---|---|---|
| 1.01 | Brand research | Chat | `[ ]` | Deep-dive IqUp (global + MK), the Bibi license, locations, voice, colors, logo → produce `brand.md`. |
| 1.02 | Scaffold + bilingual shell | Code | `[ ]` | Next.js/TS/Tailwind/shadcn project, next-intl (MK default, `/en/`), repo init, reserved folders, state files, `CLAUDE.md` + `AGENTS.md` placed in repo. |
| 1.03 | Design: foundation | Design | `[ ]` | Tokens (brand colors/type), landing + test-screen look, core components → handover. Chat proposes the direction in chat first. |
| 1.04 | Test content + scoring | Chat | `[ ]` | Question banks for all 3 bands (MK/EN), scoring rules, strengths-profile templates → content spec for Code. |
| 1.05 | Supabase + schema | Code + Cowork | `[ ]` | Create the Supabase project (EU region), the leads table, dev keys. |
| 1.06 | Landing page | Code | `[ ]` | Hook headline, how-it-works, age input → band, start CTA, mobile-first, basic SEO/OG. Uses 1.03. |
| 1.07 | Test engine | Code | `[ ]` | Question runner for all 3 bands: render, progress, answers, rule-based scoring. Uses 1.03 + 1.04. |
| 1.08 | Email gate + capture | Code | `[ ]` | Pre-results form (email, child name, age, consent) → save to Supabase, then reveal results. Uses 1.05. |
| 1.09 | Design: results + certificate | Design | `[ ]` | Visual for the results screen + shareable certificate (Bibi art) → handover. Chat proposes the direction in chat first. |
| 1.10 | Results + certificate | Code | `[ ]` | On-screen strengths profile; downloadable/shareable certificate; trial CTA (3–5/6–9), plain end (10–13). Uses 1.04 + 1.09. |
| 1.11 | Parity + a11y + performance | Code | `[ ]` | Full MK/EN parity, language switch, WCAG 2.2 AA, Lighthouse 95+, device QA. |

---

## Part 2 — Integrations + launch

| # | Phase | Type | Status | Scope |
|---|---|---|---|---|
| 2.01 | Email service + results email | Code | `[ ]` | Pick/wire the email tool (Brevo rec), send results + certificate to the inbox on submit. |
| 2.02 | CRM / lead routing + notify | Code | `[ ]` | Route leads to IqUp's tool/lists; alert IqUp on each new lead. |
| 2.03 | Follow-up sequence | Cowork + Code | `[ ]` | Welcome + trial-invite emails (3–5/6–9); newsletter handling. |
| 2.04 | Analytics + Pixel + consent | Code | `[ ]` | GA4, Clarity, Meta Pixel with consent mode; cookie banner + privacy policy; IqUp legal review. |
| 2.05 | Trial-booking mechanic | Code | `[ ]` | How the trial CTA works (link/form to IqUp). |
| 2.06 | Vercel Pro + domain + DNS | Cowork + Code | `[ ]` | Upgrade to Pro, connect the iqup.mk subdomain, SSL, production env vars. |
| 2.07 | Pre-launch QA + go live | Code + Chat | `[ ]` | Full bilingual/device QA, verify leads/Pixel/consent, end-to-end test, launch. |
| 2.08 | Post-launch check | Code | `[ ]` | Confirm leads flowing, Pixel firing, analytics working; quick-fix buffer. |

---

## Critical path & dependencies

- **1.01 → 1.02:** the brand research informs scaffold choices and the design.
- **1.03 (design foundation)** before the build screens (1.06, 1.07).
- **1.04 (content)** before the test engine (1.07).
- **1.05 (Supabase)** before lead capture (1.08).
- **1.09 (results/cert design)** before the results build (1.10).
- **All of Part 2** needs Part 1 complete **plus** the four deferred decisions: email service, CRM, trial-booking mechanic, and domain/DNS.

**Parallel track (Cowork, start now):** gathering the Bibi assets, logo, brand colors/fonts, the locations list, IqUp's email/CRM tool, DNS control, and the trial-booking method; plus lining up the native-Macedonian copy reviewer and IqUp's legal/privacy reviewer. These feed 1.01, 1.03, 1.04, and Part 2.

---

> **Note:** the number of Part 1 phases (11) favors thoroughness. If any feel too granular during the build, two adjacent Code phases can be merged into one commit — log the merge in `Decisions.md`.
