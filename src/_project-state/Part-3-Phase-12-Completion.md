# Part 3 · Phase 3.12 — Completion report

**Phase:** Code — analytics + consent + Meta CAPI.
**Branch:** `phase-3.12-analytics-capi` (off `main`).
**Date:** 2026-06-24.
**Outcome:** Complete. The v2 funnel is now measurable the honest way. The **Appendix-F GA4 event set** fires on the v2 surfaces through the existing consent-gated GA loader, **PII-free + SCORE-free**. A new **server-side Meta CAPI `Lead`** fires on a successful submit with **hashed contact only + zero cognitive data**, gated server-side on the Marketing cookie consent, `after()`-isolated, never able to break the submit, and a logged no-op without its token. A single **`event_id`** dedups the server CAPI `Lead` with the (optional) browser Pixel `Lead`. The CAPI processor disclosure was added to the privacy copy (MK+EN, flagged for legal). typecheck + lint clean; `next build` green (route table unchanged); **737/737** tests pass (706 prior + 31 new). Fresh-context review **APPROVE-WITH-NITS** (the one substantive nit taken). Additive-only diff; **no frozen layer touched**. **Pushed, asking before merge.**

---

## Task 0 — sync + dependency gate (recorded findings)

- **Sync:** `git fetch` then `git status` → local `main` clean and up to date with `origin/main`. No uncommitted/ahead/diverged state. Branched `phase-3.12-analytics-capi` off `main`.
- **3.11 merge state:** `phase-3.11-certificate` is **already MERGED to `main`** (`e207157`). So 3.12 branches off a `main` that contains the certificate; the `// SEAM (3.11)` files were left untouched anyway. (Not a prerequisite either way.)
- **Dependency gate — GREEN:**
  - Consent + analytics layer (2.04): `src/lib/consent/`, `src/components/consent/` (incl. `ConsentRoot` in the locale layout), `src/lib/analytics/loaders/{ga,clarity,pixel}.ts`, `src/lib/analytics/track.ts`, the pixel loader's `// FUTURE(CAPI 2.x)` note — all present.
  - v2 funnel surfaces: `src/components/assessment/` (3.05), `src/components/report/ReportFlow.tsx` + `submitAssessment` with the `// SEAM (3.12)` marker (it lives at `ReportFlow.tsx` line 220 + `submit-assessment.ts`; the seam is wired in the action), `ResultsScreen.tsx` + `bookingUrlFor` (3.09) — all present.
  - Env scaffolding: `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_CLARITY_ID` / `NEXT_PUBLIC_META_PIXEL_ID` in `.env.local.example`; `META_CAPI_ACCESS_TOKEN` named in `00_stack-and-config.md` (now also added to `.env.local.example`).

---

## What shipped

**The v2 GA4 event set (Appendix F), PII-free + SCORE-free.** `track()`'s sanitiser allow-list is now `{age, section, locale, path}` — `band` is **dropped** (kept in the type only so the orphaned v1 callers compile). Events wired to the precise v2 transitions:

| Event | Where |
|---|---|
| `age_set` | `useAssessment.setAge` (carries `age`) |
| `test_start` | `useAssessment.finishPractice` when `domainIndex === 0` |
| `section_complete` | `useAssessment.answer` on each domain `done` (carries the domain id as `section`) |
| `test_complete` | `useAssessment.finalize` on the complete (valid/`gentle_note`) path |
| `form_view` | `ReportFlow` (ref-guarded; NOT on a refresh that re-reveals results) |
| `lead_submit` | `ReportFlow`, after `submitAssessment` returns `ok` |
| `cta_booking_click` | `ResultsScreen` CTA + the live `/trial` `TrialBooking` (replaces v1 `trial_cta_click`) |
| `retest_start` | `useAssessment.retry` |

`page_view` (2.04) is unchanged and still fires from `ConsentRoot` on client navigation.

**`src/lib/meta/capi.ts`** (`server-only`) — the Meta Conversions API `Lead`. Pure builders (`buildCapiUserData`, `buildCapiEventPayload`) + normalisers (`normalizeEmail`, `normalizePhoneE164Mk` → E.164 MK, `normalizeCity` → primary token, diacritics folded, lowercased+stripped, `normalizeCountry`) + `hashSha256`. `user_data` = SHA-256-hashed `em`/`ph`/`ct`/`country` + the non-hashed `client_ip_address`/`client_user_agent`/`fbp`/`fbc`; `custom_data` = the generic `{content_category:'assessment_lead'}` — **no cognitive data anywhere**. Graph `v21.0`; dataset id = the Pixel id; token = the secret `META_CAPI_ACCESS_TOKEN`; optional `META_CAPI_TEST_EVENT_CODE`. **Never throws; logged no-op without token/dataset id.**

**`src/lib/analytics/pixel-lead.ts`** (client) — `firePixelLead(eventId)` (re-homed from the orphaned v1 `EmailGate`): fires `fbq('track','Lead',{},{eventID})` only when Marketing is granted + the Pixel id is set + `fbq` is present; `readFbCookies()` reads `_fbp`/`_fbc`.

**`submitAssessment` — the `// SEAM (3.12)` fire.** Added a transient `meta?: {eventId,fbp?,fbc?,eventSourceUrl?}` field (touches neither store). It server-reads the **Marketing** grant from the `iqup_consent` cookie (`cookies()` + the existing pure `parseConsent`, fail-closed), reads the request IP/UA in request scope, then `after()`-schedules an **isolated** `sendMetaCapiLead` (mirrors the 3.10 report-email isolation). It reads **only** the lead fields (Store B inputs) + the transient match data — never Store A / any score.

**Dedup.** `ReportFlow` mints one `event_id` per submission (`crypto.randomUUID()`, with a `getRandomValues` fallback — no `Math.random`), passes it to the server CAPI `Lead` (via `meta`) and to the browser Pixel `Lead` (`firePixelLead`). Meta dedups by `event_id` + `event_name`. The Pixel stays optional (CAPI alone carries the Lead when it isn't loaded).

**Consent Mode v2** — verified **already complete** in the 2.04 GA loader (`analytics_storage` ← Analytics; `ad_storage` + `ad_user_data` + `ad_personalization` ← Marketing; defaults-denied → update). No change needed.

**Privacy disclosure** — a CAPI processor line added to the existing processor list in `src/content/privacy/{mk,en}.ts` (Marketing → server-side hashed transfer to Meta on submit; MK provisional; flagged `FLAG(IqUp legal)`), plus a `_fbc` cookie-table row (the dedup helper reads `_fbp`/`_fbc`). The full privacy page is left to 3.14.

---

## Definition of Done — evidence

- [x] **Task 0** — sync clean; gate GREEN; 3.11 observed merged to `main`.
- [x] **Appendix-F GA4 set fires on the v2 surfaces** at the points above, through the consent-gated GA loader.
- [x] **`track()` PII-free + score-free** with `{age,section,locale,path}`; the unit test asserts `band`/`index`/`score`/`rank` + PII are all dropped, and that the only number allowed is `age`.
- [x] **`page_view` verified firing on v2 routes** (unchanged 2.04 tracker); booking CTA standardised to `cta_booking_click` across the results CTA + the live `/trial` surface.
- [x] **CAPI `Lead` fires server-side on success** with hashed `em`/`ph`/`ct`/`country` + ip/ua + `fbp`/`fbc`, the shared `event_id`, no cognitive data; `after()`-isolated; never throws; logged no-op without token/dataset id — all proven by `capi.test.ts` + `submit-assessment.test.ts`.
- [x] **Dedup** — server CAPI + browser Pixel share one `event_id`; the Pixel `Lead` is re-homed to `ReportFlow` and no-ops when not loaded.
- [x] **CAPI gated server-side on Marketing consent** (cookie) — tested: granted → built/fired; not-granted / no-cookie / no-meta → not fired.
- [x] **Consent Mode v2 complete** (verified already present from 2.04).
- [x] **"Nothing loads/sends before consent" holds on a v2 surface** — the 2.04 consent e2e gained an Accept-loads-trackers assertion on the v2 `/test` assessment (and `/test`/`/en/test` were already in the deny-by-default loop).
- [x] **CAPI processor disclosure** added (MK+EN, MK provisional) + flagged for IqUp legal; full policy left to 3.14.
- [x] **Two-store unlinkability + no-cognition-to-third-parties proven** by test; no new Supabase write / Brevo call / schema change / processor on either store; the transient CAPI inputs touch neither store and never appear in a URL.
- [x] **Additive-only** — `git diff main --stat` is additions + the seam fills; frozen-layer grep returns nothing; v1 stays orphaned.
- [x] **typecheck + lint + `next build` clean; full `npm test` green** — see counts below.
- [x] **Fresh-context review run** — verdict + the should-fix taken, recorded below.
- [x] **Live verification correctly scoped as deferred-pending-Cowork** — steps below.
- [x] **State + decisions updated** — `current-state.md`, `file-map.md`, `00_stack-and-config.md` (Graph `v21.0` + the new `META_CAPI_*` env), `Decisions.md` #210–#219.

---

## Quality (verbatim)

- **typecheck:** `tsc --noEmit` — clean.
- **lint:** `eslint` — clean.
- **tests:** `vitest run` — **737 passed (67 files)** = **706 prior + 31 new** across: `capi.test.ts` (new, 18), `pixel-lead.test.ts` (new, 6), `submit-assessment.test.ts` (+6 CAPI gating), `track.test.ts` (rewritten — net +1 vs prior).
- **build:** `next build` — green; route table unchanged (`/report` SSG, `/test` dynamic).
- **Browser smoke (this machine, `.env.local` blank):** drove `/test?age=8&dev=1` autopilot through age setup → calibration → all 7 task domains → the completion badge → `/report` form. The full funnel ran with **zero console errors/warnings**, proving the `age_set`/`test_start`/`section_complete`/`test_complete` + `form_view` wiring executes without throwing. (Live GA/Meta delivery is deferred — see below — because no real ids exist on this machine.)

---

## Fresh-context review

**Verdict: APPROVE-WITH-NITS.** All eight hard guardrails verified PASS (no cognition to GA/Meta; no PII to GA; two-store unlinkability untouched; server-side consent gate; resilience/never-throws/no-op; dedup `event_id`; no secrets committed; additive-only / v1 orphaned).
- **NIT taken:** `normalizeCity` stripped diacritics (`Štip` → `tip`), lowering CAPI `ct` match quality. Now NFD-folds diacritics first (`Štip` → `stip`, `Kičevo` → `kicevo`); a test asserts it.
- **NITs noted, not changed:** the `{ok:false}` arm of `AssessmentSubmitResult` is defensive/currently-dead (a 3.06 contract, intentionally kept); a stale "no email sent yet" comment on the 3.10 emailed strip in `ResultsScreen` (pre-existing, cosmetic, frozen render area — left untouched).

---

## Needs Lazar / IqUp

- **CAPI processor disclosure → IqUp legal/privacy.** New copy in `src/content/privacy/{mk,en}.ts` (the Meta Conversions API line + the `_fbc` cookie row), flagged `FLAG(IqUp legal)`. Provisional.
- **New MK copy → native-MK review** (the MK CAPI disclosure line is provisional).
- **Cowork config:** create the Meta CAPI access token and set `META_CAPI_ACCESS_TOKEN` (+ optionally `META_CAPI_TEST_EVENT_CODE`) and the real `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` in Vercel.

---

## Deferred live verification (run once the real ids land — Cowork/Lazar)

1. Set `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` (+ optional `META_CAPI_TEST_EVENT_CODE`) in `.env.local` / Vercel.
2. **GA4:** open GA4 → Admin → DebugView (or Realtime). Drive `/test?age=8` → complete → submit the form (accept Analytics consent first). Confirm `age_set`, `test_start`, `section_complete` (×7), `test_complete`, `form_view`, `lead_submit`, `cta_booking_click`, `retest_start` arrive — with **no** `band`/score/index parameter on any event.
3. **Meta CAPI:** in Events Manager → your dataset → **Test events**, paste the `TEST####` code into `META_CAPI_TEST_EVENT_CODE`, accept **Marketing** consent, submit the form. Confirm one server `Lead` lands with hashed match keys and **no** custom cognitive data.
4. **Dedup:** with the Pixel also loaded (Marketing granted), confirm Events Manager shows the server + browser `Lead` **deduplicated** by `event_id` (one Lead, "Received from: Server and Browser").
5. **No-op proof:** unset `META_CAPI_ACCESS_TOKEN` → submit → server log shows `{"event":"meta-capi","status":"skipped-no-config"}` and nothing is sent.

---

## How to re-verify locally

```bash
npm run typecheck && npm run lint && npm test && npm run build
# Funnel smoke: npm run dev → /test?age=8&dev=1 → autopilot finish → continue →
#   the /report form renders (form_view). Submit reveals results; with blank env
#   the server logs meta-capi 'skipped-no-config' and report-email 'skipped-no-key'.
# e2e (needs chromium + dev server): npx playwright test tests/e2e/consent.spec.ts
```
