# Part 3 · Phase 06 · Code — The parent form + the two-store data model — Completion Report

**Phase:** 3.06 (Code) · **Branch:** `phase-3.06-form-data-model` (off `main`) · **Date:** 2026-06-23
**One-line:** An anonymous test becomes a lead — the completion badge now leads into a parent form that writes two deliberately unlinkable stores (anonymous scores → Supabase, the lead → Brevo) and reveals results without ever trapping the parent.

---

## Repo sync ritual

`git fetch` → `git status`: local `main` clean and up to date with `origin/main` (no anomalies). Branched `phase-3.06-form-data-model` off `main`. All work on the branch; **not merged** — awaiting Lazar's yes.

---

## Form-integration choice (the decision the brief asked me to make)

**A dedicated route `/report` (SSG shell + a `ReportFlow` client island), not an in-flow `AssessmentFlow` step.** (Decision #165.) The completion screen's "continue to your report" (`onContinue`) now `router.push('/report')` — the resolved `// HANDOFF (3.06)` seam. Rationale: it mirrors the established `/result` / `/trial` / `/privacy` SSG-shell-plus-island pattern, keeps the large assessment island focused, gives the form its own route/guard/metadata, and lets Phase 3.09 replace the interstitial in place. `/report` was chosen over `/result` because v1 `/result` is still mounted/orphaned this phase; `plan.md` §3 reserves `/result` for the eventual v2 summary, so a later cleanup can reconcile.

---

## What shipped

### Store A — Supabase `assessment_scores` (anonymous scores, NO PII)
- **Migration** `supabase/migrations/20260623120000_create_assessment_scores.sql`. Columns: `id uuid` (internal only, never returned), `age smallint (5–13)`, `gender text` (nullable, `female`/`male`/`unspecified`), `city text`, `language text (mk/en)`, the **8 signals** (`signal_gf…signal_ct`, `double precision`, 0–100), the **5 indices** (`index_logical…index_learning_stem`, `double precision`, 0–100), `validity text (valid/not_representative)`, `norms_version text`, and **`created_date date default current_date`** (day-level only — the unlinkability measure). **Security mirrors v1 `leads` exactly:** RLS enabled, **no anon policies**, `revoke all … from anon, authenticated`, service-role write only.
- **Write path** `src/lib/scores/insert-anonymous-score.ts` (`server-only`): re-validates with `anonymousScoreSchema` (`.strict()` — rejects any PII-shaped field) then inserts via the service-role client. The row **id is intentionally never `.select()`ed/returned** (unlinkability).
- **Pure mapper + schema** `src/lib/scores/anonymous-score.ts`: `buildAnonymousScore(profile, {city, gender, language})` reads the derived 0–100 numbers off the `CognitiveProfile`; `validity` collapses the 3-outcome enum to the 2-value flag (`gentle_note` → `valid`).
- **Types** added to `src/lib/supabase/types.ts` (hand-authored, mirrors the migration).

### Store B — Brevo lead (the v2 attribute set)
- **Pure schema + mapper** `src/lib/leads/assessment-lead.ts`: `assessmentLeadSchema` + `buildAssessmentLeadUpsert`. Attributes: `PARENT_FIRST_NAME`, `PHONE`, `CITY` (centre English label), `CHILD_AGE`, `CHILD_GENDER` (**omitted when null**), `LOCALE`, `CONSENT_PROCESS`, `CONSENT_GUARDIAN`, `MARKETING_OPT_IN`, `CONSENT_VERSION='v2-draft-2026-06'`, `TOP_INDEX` (the single coarse English label, e.g. `Logical thinking` — **no numbers/bands**), `SOURCE='website-assessment'`. Upsert by email (`updateEnabled:true`).
- **Orchestrator** `src/lib/leads/upsert-assessment-lead.ts` (`server-only`): operational list always, marketing list iff opt-in; logged no-op when `BREVO_API_KEY` unset; **never throws**; the returned Brevo contact id is **discarded**; on failure logs the full lead under a `lead-recover` marker (`// TODO(durability 3.16)`). Reuses the existing `upsertContact` transport.

### The action + the form
- **`src/lib/leads/submit-assessment.ts`** (`'use server'`): honeypot first (no writes for bots) → re-validate the lead → Store A via `after()` (isolated, non-blocking) + Store B inline (isolated, **primary, non-trapping**). Two payloads, **no shared key**. Reuses the `isolate` / `Promise.allSettled`-shaped isolation idiom.
- **`src/components/report/ReportFlow.tsx`** (client island): reads `iqup.assessmentRun.v1` via the SSR-safe `useSyncExternalStore` idiom (null server snapshot), **recomputes `buildProfile` client-side** (results never depend on a server write), renders the form (parent first name · email · phone · city dropdown · optional gender · **3 separate, none-pre-ticked consents** · honeypot — **no child-name field**), submits both stores, persists `iqup.leadContext.v2`, and lands on the **minimal interstitial**. Results reveal even if a write fails. WCAG 2.2 AA: associated labels, `aria-invalid`/`aria-describedby`, focus-to-first-invalid, ≥44px targets, keyboard checkboxes.
- **`src/app/[locale]/report/page.tsx`**: SSG shell (skip-link + header/footer), resolves the `Form` namespace, `robots: noindex`, per-locale metadata.
- **`src/lib/leads/lead-context-v2.ts`**: `iqup.leadContext.v2` = `{parentFirstName, city, submittedAt}` — the minimal 3.09 hand-off (no email, no scores).
- **Seams placed:** `// HANDOFF (3.09)` (results reveal), `// SEAM (3.10)` (PDF email), `// SEAM (3.12)` (Meta CAPI + GA4) — built but not implemented here.

### i18n
- New **`Form`** namespace in `mk.json` + `en.json` (exact key parity, asserted; **MK provisional**). `messages.test.ts` extended: Form key parity + an EN+MK forbidden-token scan (non-vacuous) + a no-child-name invariant.

### v1 disposition
- v1 **orphaned cleanly**: `EmailGate` not mounted, `insertLead` not called from the v2 path, the v1 `leads` table not dropped. The frozen engine/scoring/validity/tasks/norms layers are **untouched** (`git diff main --stat`).

---

## The Store A schema + Store B attributes, as built

**Store A `assessment_scores`:** `id`(internal), `age`, `gender?`, `city`, `language`, `signal_gf/gv/gsm/gs/attention/ef/glr/ct`, `index_logical/spatial/memory_focus/planning_speed/learning_stem`, `validity`, `norms_version`, `created_date`(DATE).

**Store B Brevo:** `PARENT_FIRST_NAME`, `PHONE`, `CITY`, `CHILD_AGE`, `CHILD_GENDER`(when set), `LOCALE`, `CONSENT_PROCESS`, `CONSENT_GUARDIAN`, `MARKETING_OPT_IN`, `CONSENT_VERSION`, `TOP_INDEX`, `SOURCE`.

---

## Unlinkability proof

The two stores share **no unique join key**, proven by `submit-assessment.test.ts`:
- Each store receives its **own** payload (passed independently to the two writers).
- The anonymous payload carries **no PII** (no email/name/phone — asserted on the serialized payload).
- Neither payload carries an `id`, `created_at`, `submittedAt`, `correlationId`, or `sessionId`; the **only** overlapping key is the coarse `city` bucket (never a unique id; gender uses different key names, locale vs language differ).
- Store A's `id` is never returned by `insertAnonymousScore` (no `.select()`); Brevo's contact id is **discarded** by `upsertAssessmentLead`.
- Store A carries only a **day-level `DATE`** (no timestamp), verified day-level in the live script's regex check.

---

## Quality (verbatim)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — **572 passed (55 files)** = 527 prior + 45 new (`anonymous-score`, `insert-anonymous-score`, `assessment-lead`, `upsert-assessment-lead`, `submit-assessment` + `messages.test` Form/forbidden-token/no-child-name additions). v1 suites still green.
- `npm run build` — green, **21 routes**; `/[locale]/report` is **SSG**, `robots: noindex`.
- **Browser verification** (dev server): autopilot → completion → `/report` form in **MK and EN**; empty-submit shows all 6 field errors and focuses the first invalid field; a real submit (Марија / parent@example.com / phone / Ohrid / female + both required consents) reached the interstitial, persisted `iqup.leadContext.v2` (no PII), and left **no PII in the URL** (`/report`, empty querystring). Brevo logged `skipped-no-key`; the Store A write **failed-isolated** on the blank-template env and the parent still revealed results — confirming non-trapping isolation. Mobile 375px: no horizontal overflow, select min-height 44px, submit 56px, no console errors.

## Fresh-context review
Dispatched a fresh-context review subagent — **verdict GO, no blockers** (rule-by-rule PASS on unlinkability, PII handling, honest framing, isolation/non-trapping, consent→list, a11y, hydration safety, frozen layers, v1 orphaning). Three low-severity NITS, none gating: (1) MK gender-label semantic blur (Друго vs Не сакам да кажам) — already flagged for IqUp; (2) the forbidden-token test was EN-token-only against MK strings — **fixed** (added MK score/rank stems, non-vacuous); (3) `privacyNote` wording — flagged for IqUp legal alongside the consent draft.

## Independent decisions (Decisions.md #165–#176)
165 form integration = `/report` route · 166 Store A numeric = `double precision` · 167 validity 3→2 collapse · 168 city = slug (A) / English label (Brevo) · 169 Brevo primary-inline + Store A `after()`, both isolated · 170 genuinely non-trapping (no error banner) · 171 gender value set female/male/unspecified + null · 172 `CHILD_GENDER` omit-when-null · 173 new `iqup.leadContext.v2` · 174 `CONSENT_VERSION_V2` + `TOP_INDEX` + `SOURCE` · 175 `/report` noindex · 176 migration not applied live + live verification deferred.

## Carryover
- **`// TODO(durability 3.16)`** — the Brevo lead write is log-only-recoverable on failure; replace with real retry/queue durability at launch hardening (3.16/3.17).
- **Migration not applied live + live Brevo/Supabase verification DEFERRED-pending-keys** — this machine's `.env.local` is the blank template (no Supabase/Brevo keys) and the sandbox can't reach Postgres. Apply `20260623120000_create_assessment_scores` via `npm run db:push` (once linked) or the dashboard SQL editor, then run `npm run test:scores` (the live RLS proof) and a live Brevo upsert. Cowork must also create the new v2 Brevo attributes.
- **MK copy is provisional** — needs a native review pass (the whole `Form` namespace).
- **Flagged for IqUp legal/product:** the 3 draft consent strings + `CONSENT_VERSION_V2`; the `TOP_INDEX` segmentation attribute; the optional-gender value set (female/male/unspecified + "prefer not to say"); the `privacyNote` wording.
- **`/report` vs `/result` IA:** v1 `/result` stays mounted/orphaned; reconcile the v2 results route naming in a later cleanup.

## Process
Branch `phase-3.06-form-data-model` off `main`; one commit (this report included); pushed; **not merged** — awaiting Lazar's explicit yes (then PR-or-direct-merge per branch protection, then delete the branch).
