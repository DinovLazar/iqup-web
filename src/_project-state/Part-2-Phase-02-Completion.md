# Completion Report — Part 2 · Phase 2.02 · CRM contact routing + new-lead notification (Brevo Contacts)

- **Phase ID + name:** 2.02 — CRM contact routing + new-lead notification
- **Executing Claude:** Code
- **Date completed:** 2026-06-16

---

## What shipped

When a parent submits the gate and the lead saves, the same isolated `after()` work that 2.01 added now fans out **three** side-effects instead of one. Nothing in the land → test → gate → save → result funnel changed, and **nothing new is stored** — this only *adds* two more side-effects after the lead is saved.

- **A 3-way fan-out orchestrator** (`src/lib/leads/after-lead.ts`, `runAfterLead`): the single `after()` callback now runs (1) the 2.01 results email, (2) the Brevo contact upsert, and (3) the internal new-lead notification — each wrapped in an `isolate` try/catch inside `Promise.allSettled`, so one failing (even a **synchronous** throw), slow, or unconfigured side-effect can never affect the lead save, the `/result` redirect, or the other two. `submitLead` now schedules `after(() => runAfterLead(...))` and passes only data it already has plus the saved row's `created_at` as the timestamp.
- **Brevo contact upsert** (`src/lib/email/{brevo-contacts,contact-mapping,upsert-lead-contact}.ts`): a thin typed `fetch` client (no SDK, mirrors 2.01's `brevo.ts`) → `POST /v3/contacts` with **`updateEnabled: true`** (upsert by email — a re-take updates, never duplicates/4xx). **Stateless: the returned contact id is discarded — no schema change, no new column, no id persisted.** Eight documented UPPERCASE attributes; **the consent gate** (the headline guardrail) adds every lead to the operational "all leads" list always and the marketing/nurture list **iff `marketing_opt_in === true`**. No-op + logged when `BREVO_API_KEY` is unset; a missing/invalid list id is skipped (the contact still upserts).
- **Internal new-lead notification** (`src/lib/email/{lead-notification,send-lead-notification}.ts`): an **English-only** ops alert to IqUp, sent through the **existing** transactional `sendTransactionalEmail` (no new tool, no Slack/Telegram), tagged `['lead-notification', band, locale]`, to a comma-separated `LEAD_NOTIFY_TO`, from `LEAD_NOTIFY_FROM || EMAIL_FROM_ADDRESS`. It carries child first name, parent email, child age (**worded**), band (human label), locale, marketing opt-in (Yes/No), consent version, timestamp, and the "parent already received their strengths profile + certificate" line. **No raw answers, no score/IQ/%/rank/number** in the visible content. No-op + logged when its env is unset.
- **Config / env seam:** `.env.local.example` gains `BREVO_LEADS_LIST_ID`, `BREVO_MARKETING_LIST_ID`, `LEAD_NOTIFY_TO`, `LEAD_NOTIFY_FROM` (grouped + commented; `BREVO_API_KEY`/`EMAIL_FROM_ADDRESS` reused, not duplicated).
- **No new dependencies.** Everything reuses the existing `fetch` + transactional client.

## Decisions made on the fly (with "why")

All logged in `Decisions.md` (#89–#96). Summary:

- **#89** — The 2.01 `after()` hook became a single `runAfterLead` fan-out (`isolate` + `Promise.allSettled`); `submitLead` captures `insertLead()`'s `created_at` as the timestamp. *Extend, don't duplicate; one isolation layer guarantees siblings/save/redirect are untouched even on a synchronous throw; the DB `created_at` is authoritative and stores nothing new.*
- **#90** — Brevo Contacts client is a thin `fetch` mirror of `brevo.ts` (no SDK), `updateEnabled: true` upsert-by-email, tolerant of `204` (update) vs `201 {id}` (create); the id is discarded — Supabase stays the system of record.
- **#91** — Eight UPPERCASE attributes (names + types documented for §7), with a **digit-free human `BAND` label** (never `band-a/b/c`).
- **#92** — `TOP_STRENGTHS` uses **English** strength names regardless of locale (the `LOCALE` attribute records the parent's language) — one consistent CRM/segmentation vocabulary.
- **#93** — The notification is **English-only** (internal ops alert, not parent-facing copy; locale is a field).
- **#94** — No-number guardrail, split by surface: the **notification body** keeps the strict no-digit tripwire (age worded; email/consent-version/timestamp masked in the test, exactly as 2.01 masked URLs/emails); the **contact attributes** get the score-WORD guard but not a blanket digit ban (`CHILD_AGE`/`CONSENT_VERSION` legitimately contain digits).
- **#95** — Safe list-id parsing: unset/blank → `null` silently; present-but-invalid → `null` + a `list-config-invalid` log; the upsert runs for whichever lists parsed.
- **#96** — The operational-vs-marketing consent boundary is escalated to IqUp legal/privacy; no new processor (Brevo already on the list from 2.01).

## Surprises / off-spec changes

- **None material.** The Brevo `/v3/contacts` contract was confirmed against current Brevo docs ([Create a contact](https://developers.brevo.com/reference/create-contact), [Manage your contacts](https://developers.brevo.com/docs/synchronise-contact-lists)): `POST`, `api-key` header, body `{email, attributes (UPPERCASE), listIds: number[], updateEnabled}`. The one implementation nuance worth noting: Brevo returns **`201 {id}` on create but `204 No Content` on update** (when `updateEnabled` triggers), so the client tolerates an empty body (a blind `response.json()` would have thrown on the update path).
- **No doc/live-code disagreements.** The phase's stated contract matched the live docs and the 2.01 pattern.
- **One latent edge, out of scope (flagged by the review):** a child first name containing a digit would put a digit in the *internal* notification subject. Names are free-text (`leadSchema` allows 1–60 chars), this is an internal ops alert (not parent-facing, not a score), and it is not a 2.02 regression — left as-is.

## Files written / updated

**New:** `src/lib/email/{lead-summary,lead-summary.test,brevo-contacts,brevo-contacts.test,contact-mapping,contact-mapping.test,upsert-lead-contact,upsert-lead-contact.test,lead-notification,lead-notification.test,send-lead-notification,send-lead-notification.test}.ts`, `src/lib/leads/{after-lead,after-lead.test}.ts`, `src/_project-state/Part-2-Phase-02-Completion.md`.

**Updated:** `src/lib/leads/submit-lead.ts` (schedules `runAfterLead`, captures `created_at`) + `submit-lead.test.ts` (after-lead fan-out scheduling + honeypot-never-routes), `.env.local.example` (the four new vars), and the state docs (`current-state.md`, `file-map.md`, `00_stack-and-config.md`, `Decisions.md`).

**Untouched (statelessness verified):** the lead schema, `insert-lead.ts`, the Supabase migrations, the gate, the results screen, and the i18n message namespaces (the notification is internal English-only, so `messages.test.ts` did not change).

## Tests run + results

- `npm run build` (Turbopack) — **clean** (compiled, TypeScript pass, 13 static pages; **route table unchanged** — the new logic is server-side, not routes).
- `npm run typecheck` (`tsc --noEmit`) — **clean (exit 0)**.
- `npm run lint` (eslint) — **clean (0 errors, 0 warnings)**.
- `npm test` (Vitest) — **190/190 green** (up from 136). New suites:
  - `lead-summary` — band-label coverage, digit-free, `band-a/b/c` → human-label mapping.
  - `brevo-contacts` (mocked `fetch`) — endpoint/header/`content-type`, body shape (UPPERCASE attributes, integer `listIds`, `updateEnabled: true`), `201 {id}` vs `204 {}`, non-2xx → `BrevoContactsError`, no forbidden tokens in attributes.
  - `contact-mapping` (pure) — attribute mapping, human BAND label, English `TOP_STRENGTHS`, **the consent gate** (opt-in → both lists; non-opt-in → ops only; null ids handled), forbidden-word guard over attributes.
  - `upsert-lead-contact` (mocked client + stubbed env) — no-key skip, consent gate end-to-end, invalid list id skipped (upsert still runs), never throws on client rejection.
  - `lead-notification` (pure) — recipient parsing (incl. comma-separated), every required field present, the no-number guard (masks email/consent/timestamp, worded age) over text + tag-stripped HTML.
  - `send-lead-notification` (mocked brevo + stubbed env) — no-key/no-recipients/no-sender skips, recipients parsed, from override, tags `['lead-notification', band, locale]`, never throws on send rejection.
  - `after-lead` — all three side-effects scheduled with the right args; **async + synchronous throw isolation**; never propagates.
  - `submit-lead` (updated) — fan-out scheduled with the saved lead + `created_at`; **honeypot never inserts and never routes**; insert failure never routes.

## Live-verify once Brevo is configured (DEFERRED-PENDING-CONFIG)

This phase ships green without live Brevo. **Cowork** completes the one Brevo account so 2.01 **and** 2.02 light up together. Checklist:

1. In Brevo, create the **two lists** and record their integer ids → `BREVO_LEADS_LIST_ID`, `BREVO_MARKETING_LIST_ID`.
2. In Brevo (Contacts → Settings → **Contact attributes**), create each **UPPERCASE attribute** with the right type — attributes that don't already exist are silently ignored by the API, so this step is required for the data to land:
   - `CHILD_FIRST_NAME` (text), `CHILD_AGE` (number), `BAND` (text), `LOCALE` (text), `MARKETING_OPT_IN` (boolean), `CONSENT_VERSION` (text), `TOP_STRENGTHS` (text), `SOURCE` (text).
3. Confirm an internal **notify-to** address (a central IqUp inbox or distribution list) → `LEAD_NOTIFY_TO` (comma-separated for several; optional `LEAD_NOTIFY_FROM` to override the sender).
4. Ensure `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS` are set (2.01's items).
5. Submit a real test lead (use `?dev=1` to reach the gate fast) in each of: a **marketing-opt-in** lead and a **non-opt-in** lead, **both locales**. Confirm:
   - the contact appears in Brevo with the right attributes (human BAND label, English `TOP_STRENGTHS`, `SOURCE = website-quiz`, correct `MARKETING_OPT_IN`/`CONSENT_VERSION`);
   - the **opt-in** contact is on **both** lists; the **non-opt-in** contact is on the **ops list only**;
   - a re-submit with the **same email updates** the contact (no duplicate);
   - the **notification email** arrives at `LEAD_NOTIFY_TO` with the right fields and **no numbers/scores**;
   - the lead still saved and the parent still got their 2.01 results email — nothing regressed.
6. Delete the test contacts/leads afterwards (leave Brevo + the table clean).

## Definition of Done checklist

- [x] On a saved (non-honeypot) lead, the contact is **upserted** into Brevo by email (`updateEnabled: true`) with the documented UPPERCASE attributes, on the **ops list always** and the **marketing list iff `marketing_opt_in === true`**.
- [x] An internal **new-lead notification** sends to `LEAD_NOTIFY_TO` (child first name, parent email, age, band, locale, opt-in, consent version, timestamp + "parent already got results"), with **no numbers/scores**.
- [x] Both new side-effects run in the **same `after()` work** as the 2.01 email, each **fully isolated + never-throwing**; with env unset each **no-ops + logs**; the **honeypot never routes or notifies**.
- [x] **Nothing stored changed** — no schema change, no new column, no Brevo id persisted; the funnel, gate, and results screen are byte-for-byte unchanged.
- [x] Tests green: `brevo-contacts`, `contact-mapping` (incl. consent-gate), `notification`, orchestration isolation, forbidden-token coverage. `build` + `typecheck` + `lint` + `test` all clean.
- [x] `.env.local.example` documents the new vars (grouped/commented); `00_stack-and-config.md` records "no new dep" + the new env/config; `file-map.md` + `current-state.md` updated; on-the-fly decisions logged in `Decisions.md`.
- [x] **Legal-review note** (below): Brevo-as-processor already on the Part-2 legal list (2.01); the **operational-list-vs-marketing-list consent boundary** explicitly flagged.
- [x] **Fresh-context review subagent** run; verdict recorded (below).
- [x] Completion report written (this file). **One git commit** for the phase.

## Legal-review note

**No new data processor** is introduced — Brevo was already added to the Part-2 legal-review list in 2.01 (Brevo DPA + EU data residency). What 2.02 **does** add for the reviewer is the **consent boundary**: every lead is placed on an **operational "all leads" list** (operational visibility / the team's ability to follow up — *not* a marketing action), but a lead is placed on the **marketing / nurture list only when `marketing_opt_in === true`** (decision #27). A lead without marketing opt-in must never be marketed to; 2.03's nurture sequences run on the marketing list this phase populates. This operational-vs-marketing distinction is the single most important guardrail in the phase and is flagged for IqUp's legal/privacy reviewer alongside the existing consent/privacy wording sign-off.

## Fresh-context review

A fresh-context review subagent re-verified the §5 guardrails against the whole diff with no prior context (it read every new module + the diff, ran the suites, and re-derived the masking + consent logic by hand). **Verdict: all 6 guardrails PASS — zero blockers, zero should-fixes.** Confirmed: only a summary leaves the app (no raw answers); no score/IQ/%/rank/number in attributes or the notification (the notification test's masking is non-vacuous — a stray raw digit would still fail); the consent gate is the single list-assembly point and a non-opt-in lead can never receive the marketing id; each side-effect is isolated and never-throwing (incl. a synchronous throw) and the email is still scheduled via `after()`; the honeypot returns before the fan-out; the endpoint is `api.brevo.com`, the API key is only ever a header, every log line carries only band/locale/status (+ non-PII `list`/`err`), and all server modules are `server-only` (the pure ones correctly are not); and `git diff --stat` confirms no schema/column/Brevo-id is persisted.

Two **nits**, both non-blocking and intentional/out-of-scope: (1) `UpsertContactResult.id` is returned but unused — correct for statelessness (it documents the create response; nothing is persisted); (2) a child name containing a digit would put a digit in the *internal* notification subject — a latent free-text edge on an internal ops alert, not a 2.02 regression. No action taken on either.

## What's next

**2.03 — the marketing-opt-in-gated follow-up sequences.** This phase only *populates* the lists 2.03 will use; 2.03 builds the nurture / follow-up automations that run on the **marketing list** (opt-ins only — the consent gate carries through). Then 2.04 analytics/Pixel/Clarity/consent banner + the `/privacy` page; **2.05 the real trial booking** (`// TODO(booking 2.05)` seam — update the results email's trial-CTA link target then); 2.06 Vercel Pro + domain + production `NEXT_PUBLIC_SITE_URL` + the branded `@iqup.mk` sender with SPF/DKIM/DMARC (and re-measure mobile Lighthouse on clean infra). **Run the deferred 2.01 + 2.02 live checks together once Cowork finishes the one Brevo setup** (`npm run test:email` for the results email; the §7 contact/notification checklist above for 2.02).
