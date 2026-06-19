# Mac Setup — Completion Report

**Date:** 2026-06-19
**Run by:** Claude Code (new macOS machine — Apple Silicon / arm64, macOS Darwin 25.4)
**Task:** Clone `DinovLazar/iqup-web` onto Lazar's new Mac, stand up the toolchain, recreate the local env, smoke-test the build, and report the TRUE current state.

---

## 1. Toolchain — what was found and what was installed

Pre-flight (before touching anything):

| Tool | Pre-flight result | Action taken |
|---|---|---|
| `git` | ✅ Present — 2.50.1 (Apple Git-155); Xcode CLT already at `/Library/Developer/CommandLineTools` | None — no `xcode-select --install` needed |
| Homebrew | ⚠️ **Already installed** at `/opt/homebrew` (v6.0.2) but **not on PATH** (no `~/.zshrc` existed) | **Did NOT reinstall.** Wired it onto PATH via `eval "$(/opt/homebrew/bin/brew shellenv)"` appended to a new `~/.zshrc` |
| `gh` (GitHub CLI) | ⚠️ Appeared missing only because brew wasn't on PATH — actually **already installed**, v2.95.0 | None — already present and on a working brew |
| `fnm` (Node version manager) | ❌ Missing | `brew install fnm` → **fnm 1.39.0**; added `eval "$(fnm env --use-on-cd)"` to `~/.zshrc` |
| `node` / `npm` | ❌ Missing | `fnm install --lts` → **Node v24.17.0** (current LTS) + **npm 11.13.0**; set as fnm default |
| `pnpm` / `yarn` / `bun` | ❌ Missing | Not needed — repo uses npm (see §4) |

**Net new installs:** only `fnm` and Node v24.17.0. Everything else was already on the machine and was simply wired into the shell profile — nothing was reinstalled.

**Shell profile:** `~/.zshrc` did not exist; it was created with the Homebrew + fnm init lines so future terminals have `brew`, `node`, and `npm` on PATH automatically.

---

## 2. GitHub authentication

**Already authenticated — no web login flow was required.** `gh auth status` reported an active, keyring-stored login:

- Account: `petarjakimov11012011-cell`
- Protocol: HTTPS
- Token scopes: `gist`, `read:org`, `repo`, `workflow` (the `repo` scope covers private-repo clone)

The private repo cloned successfully under this account, confirming it has access to `DinovLazar/iqup-web`. No password or token was ever requested, pasted, or stored.

---

## 3. Clone result

```
gh repo clone DinovLazar/iqup-web ~/Projects/iqup-web
```

- `~/Projects` created (`mkdir -p`), repo cloned to **`~/Projects/iqup-web`** (`/Users/petarjakimov/Projects/iqup-web`).
- Default branch **`main`** checked out, up to date with `origin/main`.
- Working tree **clean** at clone time.
- HEAD: `c59cbdf feat: phase 2.03 (Code half) follow-up nurture emails — author + render templates`
- Remote: `https://github.com/DinovLazar/iqup-web.git`

---

## 4. Dependencies + Node version

- **Package manager: npm** (lockfile = `package-lock.json`; no pnpm/yarn/bun lockfile present).
- **Node version decision:** the repo pins **no** version (`.nvmrc`, `.node-version`, and `package.json` `engines` are all absent), so per the brief I installed the **current Node LTS = v24.17.0** via fnm. (Next.js 16.2.7 requires Node ≥ 20.9, so v24 is comfortably valid.)
- Install: `npm ci` → **1030 packages added**, completed cleanly.
- Notes (non-blocking): npm printed deprecation warnings for several `@react-email/*` sub-packages and reported `11 vulnerabilities (3 low, 6 moderate, 2 high)` from `npm audit`. **No `npm audit fix` was run** — that would change the lockfile/dependencies, which is out of scope for this task. Flagged here for a future maintenance pass.

---

## 5. `.env.local` status + missing secrets

- A committed template **`.env.local.example`** exists; I copied it to **`.env.local`** (confirmed **gitignored** via `git check-ignore`).
- I cross-checked the template against every `process.env.*` reference in `src/` + `scripts/`. The template covers **all** app variables. The only extras the code reads are `CI` and `NODE_ENV` — standard runtime built-ins set by the toolchain, not secrets, so they correctly do **not** belong in `.env.local`.
- **No values were fabricated** — every secret is blank, awaiting real values.

### Secrets still to fill in (and where each comes from)

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API | Project ref `cpxssfodboukznzaksnb`, region eu-central-1 (Frankfurt). Public. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API | Public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API | **Server-only secret** — bypasses RLS; never expose to the browser. |
| `BREVO_API_KEY` | Brevo dashboard → SMTP & API → API Keys | Server-only. Powers results email (2.01) + contact upsert (2.02). |
| `EMAIL_FROM_ADDRESS` | Brevo (a verified sender) | Sender of the results email. |
| `EMAIL_FROM_NAME` | Decided by IqUp/Cowork | Display name on the results email. |
| `EMAIL_REPLY_TO` | Optional | Omit to reply to the From address. |
| `TEST_EMAIL_TO` | A test inbox you own | Dev-only target for `npm run test:email`. Never a real parent. |
| `BREVO_LEADS_LIST_ID` | Brevo → Contacts → Lists (integer id) | Operational "all leads" list. Missing → that list is skipped. |
| `BREVO_MARKETING_LIST_ID` | Brevo → Contacts → Lists (integer id) | Marketing/nurture list (opt-ins only). Missing → skipped. |
| `LEAD_NOTIFY_TO` | An internal IqUp inbox / distribution list | Recipient of the new-lead notification. Unset → no-op. |
| `LEAD_NOTIFY_FROM` | Optional (a verified Brevo sender) | Overrides `EMAIL_FROM_ADDRESS` on the internal notification. |
| `NEXT_PUBLIC_SITE_URL` | Set at launch (Phase 2.06) | **Left commented-out on this dev machine** — see §8. |

Until these land, the app runs normally: each missing key makes its side-effect a logged no-op by design.

---

## 6. Smoke check — typecheck + build

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | ✅ **Pass**, exit 0, no errors |
| Production build | `npm run build` (`next build`) | ✅ **Pass** (after the `.env.local` fix in §8) — compiled, TypeScript clean, all 13 static pages prerendered, full route table emitted |

The full test suite was **not** run (per the brief — that's the next phase).

---

## 7. TRUE current state (read-only review)

Reviewed: `current-state.md` (last updated 2026-06-16, after Phase 2.03 Code half), the Part-2 completion reports (2.01 / 2.02 / 2.03-Code), `phase-plan.md`, and the tail of `Decisions.md`.

> ⚠️ **Doc drift to flag:** `phase-plan.md`'s **Status column still shows every phase as `[ ]` (not started)** — for both Part 1 and Part 2 — even though the code has Part 1 fully built and Part 2.01–2.03 shipped. The status column was simply never ticked as reports landed. **Trust `current-state.md` + the completion reports over `phase-plan.md`'s status column.**

### (a) Which phases are actually complete *in the code*?

- **Part 1 (1.01 → 1.11): COMPLETE.** `current-state.md` states "Part 1 complete" after 1.11 (full MK/EN parity, language switch, WCAG 2.2 AA, median-of-5 Lighthouse, cross-device matrix). Completion reports are filed for 1.02–1.08, 1.10, 1.11; 1.01 (brand research) lives in `brand.md` and 1.09 (results/cert design) lives as `docs/design-handovers/Part-1-Phase-09-Handover.md` — both are Chat/Design deliverables, not `_project-state` reports, so their absence from that folder is expected.
- **Part 2:**
  - **2.01 (results email): built + unit-tested** in the repo; live send deferred-pending-key.
  - **2.02 (CRM routing + new-lead notification): built + unit-tested**; live delivery deferred-pending-config.
  - **2.03 (follow-up nurture emails): only the CODE half is done** — bilingual nurture templates authored + rendered to 8 static HTML files for the Cowork half to load into Brevo. The **Cowork half (loading them into Brevo) is not done.**
  - **2.04–2.08: not started** (analytics/Pixel/consent, trial-booking, Vercel Pro+domain, pre-launch QA, post-launch).

### (b) Is the Brevo work (2.01 + 2.02) implemented-and-tested, or only specced?

**Implemented and unit-tested in the repo — but NOT yet live-verified.** Both phases are fully built code with green unit tests (the reports cite 190 tests green at 2.02, 258 at 2.03) covering the orchestration, the Brevo contact upsert, the notification, and the no-number/consent guardrails. What remains is **live end-to-end verification**, which is **deferred pending Brevo configuration**: the API key, the two list IDs, the verified sender, and the internal notify recipient are all still blank (see §5). Until those land, every Brevo side-effect is a deliberate logged no-op and the funnel is unaffected. So: *more than specced — it's coded and tested — but the live Brevo send/upsert has never been exercised on real keys.*

### (c) Is the Phase 1.03 design handover filed?

✅ **Yes — present.** `docs/design-handovers/Part-1-Phase-03-Handover.md` exists (16 KB). (The Phase 1.09 handover is also present.)

---

## 8. Doc + `Decisions.md` changes (committed) and off-spec choices

**Committed** (local only — **not pushed**) as `a845c1a` — *"chore: switch local dev path to macOS, refresh env scaffold"*:

- `project-instructions.md` — local-folder path updated `C:\Users\user\Desktop\iqup-web` → `~/Projects/iqup-web` (3 occurrences).
- `CLAUDE.md` — "Project root on the operator's machine" updated to `~/Projects/iqup-web` (noting the old Windows path).
- `Decisions.md` — appended a dated **2026-06-19** section with entries **#104** (the Windows→macOS machine switch + new canonical path) and **#105** (the `NEXT_PUBLIC_SITE_URL` env choice below).

### Decisions I made on my own (no silent changes — every off-spec choice surfaced)

1. **`AGENTS.md` was left unchanged.** The brief listed it among the three docs to update, but `AGENTS.md` contains **no local-path / Windows-path reference at all** — there was nothing to change. Editing it would have meant inventing a line. Flagged rather than forced.
2. **`NEXT_PUBLIC_SITE_URL` is commented-out (genuinely unset) in `.env.local`, not present-with-empty-value.** Copying the template verbatim left it as `NEXT_PUBLIC_SITE_URL=` (empty string), which **broke `next build`**: `src/app/[locale]/layout.tsx` and `src/lib/email/site-url.ts` use `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`, and `??` catches `undefined` but **not** `''`, so `new URL('')` threw `ERR_INVALID_URL` at prerender. Commenting the line makes the var truly unset, restoring the documented "unset → falls back to `http://localhost:3000`" dev behaviour. **No value was invented** (it's a public URL, not a secret), and **only the gitignored `.env.local` was touched** — product code and the `.env.local.example` template were left exactly as they were. Logged as Decision #105.
3. **Homebrew + `gh` were NOT reinstalled.** Both turned out to be already installed (brew just wasn't on PATH). Per the "check before installing" guardrail, I only wired brew/fnm into a freshly-created `~/.zshrc`.
4. **`npm audit fix` was not run** despite 11 reported vulnerabilities — fixing them would alter dependencies/lockfile, which is out of scope here. Noted for a future maintenance phase.
5. **This completion report was not committed.** The brief scoped the commit to "only these doc changes" (the path updates + `Decisions.md`), so the report is left as an untracked file to be pasted back into Chat. Commit it later if you want it version-controlled like the other `_project-state` reports.

---

## Definition of Done — checklist

- [x] `~/Projects/iqup-web` cloned from `DinovLazar/iqup-web`, clean tree, `main` checked out.
- [x] Toolchain in place: git, Node v24.17.0 (LTS), npm; `gh auth status` authenticated.
- [x] Dependencies installed (`npm ci`); typecheck + production build pass.
- [x] `.env.local` exists (gitignored) with correct variable names; missing-secret list + sources above.
- [x] Plain-language true-state summary written, answering (a), (b), (c).
- [x] Local-folder path updated in the docs that carry it (`project-instructions.md`, `CLAUDE.md`; `AGENTS.md` had none); machine switch logged in `Decisions.md`; doc changes committed (**not pushed**).
- [x] Completion report written to `src/_project-state/Mac-Setup-Completion.md`.

---

## Open items for Lazar / next phase

1. **Fill in the secrets in §5** (Supabase keys + the Brevo set) to enable live email/CRM behaviour.
2. **Push?** The doc commit `a845c1a` is local only. Tell me if you want it pushed to `origin/main` (or onto a branch + PR).
3. **Run the deferred live Brevo checks** once keys land: `npm run test:email` (2.01) and the 2.02 contact/notification checklist — that closes out the "implemented-but-not-live-verified" gap from question (b).
4. **Finish Phase 2.03's Cowork half** (load the 8 rendered nurture HTML files into Brevo).

> **Lazar — paste this report back into the Claude Chat session** so Chat can update its picture and propose the next phase.
