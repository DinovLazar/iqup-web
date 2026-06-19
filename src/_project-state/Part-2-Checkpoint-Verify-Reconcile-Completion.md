# Completion Report — New-Machine Checkpoint: Verify Build Green & Reconcile Project State

**Phase:** Part 2 — Checkpoint (verification + doc reconciliation only; not a feature phase)
**Date:** 2026-06-19
**Role:** Claude Code
**Machine:** macOS (`~/Projects/iqup-web` = `/Users/petarjakimov/Projects/iqup-web`)
**Scope guardrail honoured:** verification + documentation only, plus trivial test-environment setup. **No product copy, test questions, scoring, results, design tokens, Bibi assets, or Brevo/Supabase logic were changed.**

---

## 1. Build health — recorded verbatim

Run from a fast read-only auditor against the live repo:

| Check | Command | Result |
|---|---|---|
| Tests | `npm run test` (vitest) | ✅ **Test Files 24 passed (24); Tests 258 passed (258)** (~1.9s) |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | ✅ Clean — no output, no errors |
| Lint | `npm run lint` (eslint) | ✅ Clean — no errors, no warnings |
| Build | `npm run build` (`next build`) | ✅ Green — compiled, types checked, **13/13 static pages generated**; route table as expected (root, /test, /result, OG images across mk/en) |

**Overall: 🟢 GREEN.**

---

## 2. Accessibility + MK/EN parity smoke

### MK/EN i18n key parity — ✅ PERFECT
- `messages/mk.json` vs `messages/en.json`: **139 keys each**, full nested-path comparison, **zero** keys missing in either direction. Namespaces in parity: Meta, LanguageToggle, A11y, NotFound, Landing, Test, Gate, Result, Email.

### Accessibility (axe / WCAG 2.2 AA) — ran, with one finding (see §4)
- The suite (`npm run test:a11y` → `playwright test tests/e2e/a11y.spec.ts`, 26 scans = 13 states × mobile/desktop) first failed to launch because Playwright's Chromium binary was not downloaded on the fresh machine. Installing it (`npx playwright install chromium`) is a one-time per-machine setup step (not a dependency change) and was done.
- After install: **16/26 pass; 10 report a *serious* `color-contrast` violation** on the "test first question" and "result band" states (both viewports). **Root cause traced to a test-timing artifact, not a real UI defect — see Finding F-1 (§4).** The a11y run used Homebrew Node (the only `node` on the audit shell's PATH); the canonical toolchain is fnm Node 24 (Decisions #104). The build/test/lint/typecheck in §1 are green regardless.

### Lighthouse — not run (out of scope)
- `lighthouserc.mobile.cjs` / `lighthouserc.desktop.cjs` present and well-formed. A full Lighthouse sweep was out of scope for this checkpoint. Note: the old Windows machine's LHCI `EPERM` workaround note was de-Windows-ified in `current-state.md` / `file-map.md`; LHCI itself was **not** re-verified on macOS (flagged in the docs to re-verify before relying on it).

---

## 3. Doc mismatches found and how each was reconciled

| # | Mismatch (doc vs. live repo) | Reconciliation |
|---|---|---|
| 1 | **`phase-plan.md`: every phase Status was `[ ]`** despite 14 phases done. | Set Status `[x]` for **1.01–1.11** (Part 1 complete) and **2.01, 2.02, 2.03** (completion reports present). **2.04–2.08 left `[ ]`** (not started). |
| 2 | **`current-state.md` "Last updated: 2026-06-16"** — stale; predated the macOS move (commit a845c1a, 2026-06-19) and this checkpoint. | Refreshed to **2026-06-19**, with the Windows→macOS move + this checkpoint summarised; verbatim build/parity results and the a11y finding folded in. |
| 3 | **`current-state.md` "Known issues" called LHCI "on this Windows machine"** with a Windows-specific `EPERM`. | Reworded: the `EPERM` was Windows-specific, likely won't recur on macOS, but was **not re-verified** this pass; `lh:median` kept as the portable fallback; added the per-machine `npx playwright install chromium` note. |
| 4 | **`file-map.md` was missing three completion reports that exist on disk:** `Part-1-Phase-03-Completion.md`, `Part-1-Phase-04-Completion.md`, `Part-1-Phase-05-Cowork-Completion.md`. | Added all three with one-line descriptions, in order. (Auditor C had reported file-map as fully current; this caught what it missed.) |
| 5 | **`file-map.md` lacked entries for the new checkpoint report and the untracked `Mac-Setup-Completion.md`.** | Added both. |
| 6 | **`file-map.md` line for `scripts/lh-median.mjs`** described it as "Windows-tolerant … on this machine." | Reworded to "portable … (worked around a Windows-specific `EPERM` on the old machine)." |

`file-map.md` was otherwise accurate: all Part 2 email/Brevo/Supabase/nurture files (2.01–2.03) are present and correctly listed; no orphaned entries for deleted files were found.

> Note on 1.01 & 1.09: neither has a formal completion report (1.01 Brand research produced `brand.md`; 1.09 Design produced the mockups in `docs/design-handovers/Part-1-Phase-09-assets/`, with a filed handover noting the written report wasn't delivered). Both are genuinely done and gate later completed phases, so both are marked `[x]` — this matches how the repo already treats them.

---

## 4. Findings that need Lazar's attention

### F-1 — a11y suite is timing-flaky on the faster macOS machine (NOT a shipped a11y defect)
- **Symptom:** 10/26 axe scans report a *serious* `color-contrast` violation on the "test first question" + all "result band" states (both viewports).
- **Root cause (traced conclusively):** those states wrap their content in a `tw-animate-css` `animate-in fade-in-0 slide-in-from-bottom-2 duration-300` **entrance fade** (`QuestionView.tsx:121`; the result island animates similarly). `scan()` analyses immediately after the element appears — i.e. **mid-fade, ~opacity 0.36** — so axe measures the strength-chip tokens *composited toward the page background*. The settled UI uses `--strength-*-ink` on `--strength-*-tint` (e.g. `#3a33ae` on `#ecebfb`, ≈9:1, passes); mid-fade axe sees `#b8b4db` on `#f6f3f6` = 1.8:1.
- **Proof:** (a) the observed faded colours are exactly the tokens at ~36% alpha; (b) **adding a 700 ms settle-wait before the scan → all 26 pass** (verified, then reverted — this pass does not modify tests). `prefers-reduced-motion` does **not** fix it (the fade is a CSS `animate-in` utility, not a `useReducedMotion`-gated Framer Motion animation — verified by forcing `reducedMotion: 'reduce'`, then reverted).
- **Why it appeared now:** the new Mac renders fast enough to scan before the fade finishes; the old Windows machine was slow enough to miss the window. Phase 1.11's reported AA pass was on the slower machine.
- **Recommended fix (a real test change → Lazar's call, deliberately NOT done here):** make `scan()` wait for entrance animations to settle before analysing — await `getAnimations()` draining / an `animationend`, or a short `waitForTimeout`. This strengthens determinism without weakening coverage. Logged as Decisions #107.

### F-2 — LHCI not re-verified on macOS (informational)
- The LHCI `EPERM` failure was Windows-specific and likely gone on macOS, but Lighthouse was out of scope here and not run. Re-verify `npm run lhci:mobile` / `:desktop` before relying on LHCI; `npm run lh:median` remains the portable fallback.

### F-3 — per-machine setup step (informational)
- `npx playwright install chromium` must be run once on each new machine before the a11y / screenshot e2e suites can run. Worth adding to the machine-setup checklist.

No real product bug or missing deliverable surfaced. The shipped funnel and all unit/integration tests are healthy.

---

## 5. Handover filing outcome
- **Phase 1.03 design handover was already correctly filed** at `docs/design-handovers/Part-1-Phase-03-Handover.md`. No move was needed — confirmed in place. (The 1.09 handover + assets are also present in the same directory.)

---

## 6. Independent decisions made in this pass (surfaced, not silently ratified)
1. **Installed Playwright's Chromium binary** (`npx playwright install chromium`) — treated as a permitted one-time test-environment setup step, not a dependency change (nothing in `package.json` changed). Without it the a11y suite cannot run at all.
2. **Ran the a11y experiment (force reduced-motion; add a settle-wait) to diagnose F-1, then fully reverted both** — `tests/e2e/a11y.spec.ts` and `playwright.config.ts` show **no diff**. Done only to trace root cause; left unchanged per the "don't alter tests in this pass" guardrail.
3. **Marked 1.01 and 1.09 `[x]` despite no formal completion report** — both are genuinely complete (brand.md / filed mockups) and gate later done phases; this matches how the repo already treats them. Flagged here for visibility.
4. **Did not touch `00_stack-and-config.md`** — no stack/config changed in this checkpoint (it is append-only for real config changes); the per-machine Playwright-install note was recorded in `current-state.md` instead.
5. **Did not re-log the Windows→macOS move in Decisions.md** — already logged as #104/#105 by the setup brief; appended only the new checkpoint entries (#106, #107).

---

## 7. Definition of Done
- [x] Full test suite run; result recorded verbatim (**258/258 passing**, 24 files). Typecheck, lint, production build all green.
- [x] a11y + MK/EN parity smoke run; results recorded; the a11y flakiness listed as a **finding** (F-1), not silently fixed.
- [x] `phase-plan.md`, `current-state.md`, `file-map.md` now match the live repo.
- [x] Phase 1.03 design handover confirmed filed at `docs/design-handovers/`.
- [x] `Decisions.md` updated (#106, #107).
- [x] Every independent decision surfaced explicitly (§6).
- [ ] Changes committed — **pending** (commit message ready: `chore: verify build on macOS and reconcile project-state docs`); **push only if Lazar approves.**
- [x] Completion report written (this file).

---

## 8. For Lazar
Paste this report back into the Claude **Chat** session so the next phase can be opened. Key takeaways:
- Build is **green on macOS** (258/258 tests, typecheck, lint, build) and MK/EN parity is perfect.
- The state docs now tell the truth (phase-plan statuses, current-state snapshot, file-map).
- **One finding to decide on (F-1):** the a11y suite is timing-flaky on the fast Mac due to scanning mid-entrance-fade — the shipped UI passes AA; the fix is a one-line settle-wait in the test, which I left for you because altering tests was out of scope here.
- Nothing is committed yet — say the word and I'll commit (and push only if you approve).
