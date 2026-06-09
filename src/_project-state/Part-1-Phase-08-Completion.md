# Completion Report — Part 1 · Phase 1.08 · Email gate + lead capture

- **Phase ID + name:** 1.08 — Email gate + lead capture (Code)
- **Executing Claude:** Code
- **Date completed:** 2026-06-09

---

## What shipped

The funnel is now **whole, end-to-end**: land → test → give email → results. After the child
finishes the last question, a calm parent-facing **email gate** captures the parent's email, the
child's first name, and required consent; on submit it saves a **summary-only** lead to Supabase via
the existing `insertLead()` pipeline and sends the parent to a temporary results page.

- **The email gate** (`src/components/gate/EmailGate.tsx`) — a parent-mood form rendered at the
  runner's new `gate` phase (the `// HANDOFF (1.08)` seam). Fields: **parent email**, **child's first
  name** (Cyrillic + Latin both accepted), a **required consent** checkbox, and an **optional,
  unchecked** marketing opt-in, plus an off-screen **honeypot**. `age`, `band`, `locale` and the
  strengths summary are carried through (from the runner's in-memory `TestResult` + the `?age=N` the
  page already had) — never re-asked, never in the URL.
- **A server action** (`src/lib/leads/submit-lead.ts`, `'use server'`) — checks the honeypot first
  (a filled one returns a success-shaped result **without** inserting, so bots get no signal), then
  builds the snake_case lead and calls the existing service-role `insertLead()`. Everything is
  re-validated server-side by `leadSchema` (consent must be `true`, etc.); the client is never trusted.
- **Pure, isomorphic mapping** (`src/lib/leads/lead-mapping.ts`) — `TestResult` → the `top_strengths`
  **summary** the schema expects (`{top1, top2, top3, scores}`, where `scores` is each strength's
  per-strength accuracy ratio, number-only) and the band-key → `leadSchema` band-enum translation.
  Unit-tested in isolation (no Supabase needed).
- **Temporary `/[locale]/result`** (`src/app/[locale]/result/page.tsx` + `ResultPlaceholder.tsx`) — a
  Server-Component shell + a client island that reads the persisted `TestResult` + the post-gate lead
  context from sessionStorage and shows the child's first name and **top 3 strengths** (codes →
  bilingual display names). Clearly labelled **“Temporary preview”**; **no total, no IQ, no
  certificate**. Guards direct access (redirects home when either piece is missing). Carries a
  `// PLUGS INTO 1.10` seam.
- **Two UI primitives** (`src/components/ui/input.tsx`, `checkbox.tsx`) on the handover §B.5 spec,
  built on the already-installed unified `radix-ui` package — **no new dependency**.
- **Bilingual chrome**: new `Gate` and `Result` namespaces in `mk.json` + `en.json` with exact key
  parity (provisional MK, flagged).
- **Tests**: a `submit-lead` suite (mapping / honeypot / consent / no-IQ / unknown-key stripping),
  an i18n message-parity suite, and storage/lead-context guard suites. **73/73 green** (was 39).

### The lead the gate writes (verified live, then deleted)

```jsonc
{
  "email": "…",
  "child_first_name": "Ана",          // Cyrillic + Latin both accepted
  "child_age": 7,                       // carried from /test?age=N, not re-asked
  "band": "band-b",                     // 6-9 → band-b (see #50)
  "top_strengths": {                    // SUMMARY ONLY — number-only, .strict()
    "top1": "pattern", "top2": "logic", "top3": "spatial",
    "scores": { "pattern": 1, "logic": 1, "spatial": 1, "numeracy": 1, "memory": 1, "words_obs": 1 }
  },
  "locale": "mk",
  "consent": true,
  "consent_at": "…",                    // DB-side default
  "consent_version": "v1-draft-2026-06",
  "marketing_opt_in": false
}
```

**Invariant (verified live + by tests):** the serialized lead carries **no answers, no `iq`/`total`/
`percentile`/`grade`/pass-fail** field or string — only the strengths summary.

## Decisions made on the fly (with "why")

> Appended to `Decisions.md` as **#49–#57**. **Numbering note:** the brief said "continue from #48",
> but `Decisions.md` already had 48 entries (the last is the 1.07 Lucide-icons decision), so new
> entries start at **#49**. Calling each out — no silent ratifications.

- **#49 Exact age carried into the gate, not re-collected.** Added an `age` prop to `TestRunner`,
  threaded from the `?age=N` the `/test` page already validates; the lead's `child_age` comes from it.
  Reconciles `plan.md` §13 (the leads table stores the child's age) without a second age question.
- **#50 Band-vocabulary mapping made explicit** (`LEAD_BAND_BY_KEY`: `3-5→band-a`, `6-9→band-b`,
  `10-13→band-c`). The canonical keys are `3-5/6-9/10-13` (`bands.ts`) but the `leads` table predates
  them and uses `band-a/b/c`; this is the same 1:1 youngest→oldest map as decision #38, localized to
  the lead path so neither module is redefined.
- **#51 `top_strengths.scores` = per-strength accuracy ratio (0–1, 2-dp), all six codes.** A
  normalized "how strong" figure per strength — a complete, number-only summary that carries no
  question-level data and no aggregate/IQ/total (honours decisions #25/#29).
- **#52 Submit path: typed `GateSubmission` → `'use server'` `submitLead` → honeypot → `insertLead()`.**
  The client builds a typed payload (not raw `FormData`) and the action re-validates everything with
  the existing `leadSchema`; no new write path — the service-role `insertLead()` stays the only one.
- **#53 `CONSENT_VERSION = 'v1-draft-2026-06'`** stamped on every lead, tied to the provisional
  consent wording. Bump it (and add a new consent string) when IqUp legal finalises the wording.
- **#54 Temporary `/result` + the `iqup.leadContext.v1` hand-off.** On `{ok:true}` the gate persists a
  minimal `{childFirstName, age, submittedAt}` (no email, no strengths) to sessionStorage and
  navigates to `/result`; its presence is the "gate completed" signal, and `/result` redirects home
  without it (protecting lead capture + a natural fallback once the tab's session clears).
- **#55 Marketing opt-in is a separate, unchecked checkbox; honeypot is the only spam guard.**
  Reaffirms decision #27 (consent ≠ marketing). Rate-limiting / heavier abuse-hardening stays deferred
  to launch (2.04/2.07), as already tracked.
- **#56 No new dependency for the checkbox.** The brief anticipated adding `@radix-ui/react-checkbox`,
  but the repo already uses the **unified `radix-ui` package** (the other primitives import from it),
  which re-exports `Checkbox` — so the new `Checkbox`/`Input` primitives added **zero** dependencies.
- **#57 `EmailGate` is code-split (`next/dynamic`) and the temporary `CompletionView` was removed.**
  The gate is only reached after the whole test, so its JS (form + checkbox + the action binding)
  loads at the `gate` phase instead of in the initial `/test` bundle (a measured mobile-perf win — see
  below). `CompletionView.tsx` was deleted (superseded by the gate) and its now-orphaned
  `Test.completion` copy pruned from `TestCopy`, `resolveCopy`, and both message files.

## Surprises / off-spec changes

- **`CompletionView` removed, as the brief expected.** The 1.07 completion view was always a
  placeholder; the gate supersedes it. Deleting it left `Test.completion` copy orphaned — pruned
  (caught by the fresh-context review; see below). The old `complete` runner phase is now `gate`.
- **No `react-hook-form`.** Per the brief, the form is a controlled React form with a small server
  action — no form library added.
- **Privacy Policy is plain text, by design.** The `/privacy` page is a Part 2 task, so the consent
  line's "See our Privacy Policy" renders as text with a documented `// TODO(privacy-page)` seam — a
  genuine cross-phase seam, not a dead link.
- **Contrast fix during verification:** three small-text spots used `text-ink-faint` (#8a8499, 3.6:1
  = large/UI-only per the handover); switched to `text-ink-soft` (7.1:1) for AA on the gate's privacy
  note and the `/result` label + rank numbers.
- **Lighthouse SEO port artifact (not a bug):** on the prod test server (port 3100) the canonical
  audit deducted because `metadataBase` defaults to `http://localhost:3000` (≠ the serving origin);
  re-running on the origin-matched server returns **SEO 100** with zero failures. In production this
  is set correctly via `NEXT_PUBLIC_SITE_URL` (already a tracked 2.06 item).
- **Screenshots:** as in 1.07, the local preview screenshot tool times out in this environment;
  visuals/a11y were verified via **accessibility-tree snapshots + computed-style inspection** instead.

## Files written / updated

**New — leads + gate logic:** `src/lib/leads/{lead-mapping,submit-lead,lead-context}.ts`,
`src/lib/leads/{submit-lead,lead-context}.test.ts`.
**New — gate + result UI:** `src/components/gate/{EmailGate.tsx,copy.ts}`,
`src/components/result/ResultPlaceholder.tsx`, `src/app/[locale]/result/page.tsx`,
`src/components/ui/{input,checkbox}.tsx`.
**New — tests:** `src/lib/scoring/storage.test.ts`, `src/messages/messages.test.ts`.
**Updated:** `src/lib/scoring/storage.ts` (+`isTestResult`/`readTestResult`) and `index.ts` (re-export);
`src/components/test/TestRunner.tsx` (`gate` phase, `age`+`gateCopy` props, dynamic `EmailGate`,
docstring); `src/app/[locale]/test/page.tsx` (`age`+`resolveGateCopy` wiring; pruned `completion`);
`src/components/test/copy.ts` (pruned `completion`); `src/messages/mk.json`+`en.json` (new `Gate`+
`Result` namespaces; pruned `Test.completion`).
**Removed:** `src/components/test/CompletionView.tsx` (superseded by the gate).
**Docs/state:** this report; updated `current-state.md`, `file-map.md`, `00_stack-and-config.md`,
`Decisions.md`.

## Tests run + results

- `npm run build` ✓ · `npm run typecheck` ✓ · `npm run lint` ✓ (one `react-hooks/set-state-in-effect`
  finding fixed by switching `/result` to `useSyncExternalStore`) · `npm test` ✓ **73/73**.
- **New suites:** `submit-lead.test.ts` (band map; `top_strengths` is `{top1,top2,top3,scores}`,
  number-only, no per-question/IQ/total; `consent:false` rejected; honeypot → no insert, success
  return; unknown keys stripped; the action calls `insertLead` with the built payload and maps a DB
  failure to a friendly `{ok:false}`); `messages.test.ts` (exact MK↔EN key parity + matching
  `{placeholders}` + no empty strings); `storage.test.ts` + `lead-context.test.ts` (the `/result`
  access guards).
- **Live funnel (dev for `?dev=1` fast-finish, both locales):** landing → test → gate → submit →
  `/result` showing name + top 3. **EN** (age 7 → `band-b`, Cyrillic "Ана") and **MK** (age 11 →
  `band-c`, Latin "Marko", marketing opt-in **on**) both inserted a real row with the **summary only**
  (band correctly mapped, `consent_version` stamped, `marketing_opt_in` honoured) — verified by
  reading the row back, then **every test row deleted** (table left at 0). Anon read+write still
  **denied** (re-ran `npm run test:insert`).
- **Validation/a11y (live):** empty submit → three field errors, `aria-invalid` + `aria-describedby`
  set, **focus moved to the first invalid field**; invalid email → "Enter a valid email address.";
  consent checkbox keyboard-operable; honeypot off-screen (`-9999px`), `tabIndex -1`, inside an
  `aria-hidden` parent (absent from the a11y tree). `/result` direct-visit with empty sessionStorage →
  **redirects home**.
- **Mobile (375px):** no horizontal overflow (scrollWidth = viewport); submit 343×**56px**, email
  input **52px**, consent label row **137px** tall (the ≥44px target; the 24×24 box meets WCAG 2.2 AA
  target size); CLS ~0.
- **Lighthouse** (production `next start`; the gate lives inside the `/test` route, so that route is
  the measurable surface — the gate/`/result` content states sit behind sessionStorage/interaction and
  can't be cold-loaded, so they were verified structurally as above):

  | Run | Perf | A11y | Best-Practices | SEO |
  |---|---|---|---|---|
  | `/test` desktop | 100 | 100 | 100 | 100\* |
  | `/test` mobile | 88 | 100 | 100 | 100\* |

  \*SEO = **100** on the origin-matched server; the prod-port run showed 91 purely from the
  `metadataBase` localhost-port artifact (see Surprises). Mobile Perf **88** is **at the documented
  web-font-gated baseline** (LCP-dominated, CLS ~0) — code-splitting the gate (#57) moved it from a
  first reading of 84 back to baseline, so **no regression**; the final perf sweep stays 1.11.

## Fresh-context review

A fresh-context review subagent independently verified the implementation against this brief and the
contracts. **Outcome: PASS — zero blockers.** All 12 checks held: lead payload conforms to
`leadSchema`; summary-only + no-IQ/no-total (lead, gate, and `/result`); band map exact; consent
gating + honeypot behave; service-role-only write (no client writes; anon unused); `/result` guard
works; AA accessibility on the form; exact MK/EN parity; no PII in the URL; canonical modules reused;
clean seam wiring. **One should-fix — the orphaned `Test.completion` copy — has been fixed** (pruned
from `TestCopy`/`resolveCopy`/both JSON files; docs reconciled). Remaining nits were either dev-only
(the `?dev=1` strengths summary still uses muted mono text — stripped in production) or cosmetic
(consent focus via `getElementById`, which is the more robust choice through the wrapper) — left as-is.

## Blocked / carryover items

- **Provisional MK pending native review:** all new `Gate`/`Result` strings, including the draft
  consent + marketing wording. EN is the mirror and must stay equivalent.
- **IqUp legal sign-off pending:** the consent + marketing wording and the `CONSENT_VERSION`
  (`v1-draft-2026-06`) it is tied to. Bump the version when the wording is finalised.
- **`/privacy` page + the consent link** land in Part 2 (the reference is a documented text seam now).
- **`/result` is temporary** — 1.10 replaces the island with the real strengths profile + certificate
  at the `// PLUGS INTO 1.10` seam, reading the same `TestResult` + `iqup.leadContext.v1` hand-off.
- **Abuse-hardening beyond the honeypot** (rate limiting) stays deferred to launch (2.04/2.07).
- **Carried forward from 1.07:** mobile Lighthouse Performance (web-font-gated) → 1.11; licensed Bibi
  art / official logo / OG art; Supabase account transfer + legacy→publishable/secret key migration
  before launch; `NEXT_PUBLIC_SITE_URL` (also fixes the canonical port artifact above) in 2.06; the
  `/test` language-toggle-drops-`?age` polish; the untracked `.mcp.json` pointing at the wrong project.

### Notes for the native-Macedonian reviewer
Every Macedonian string added this phase is **provisional, Claude-drafted** and needs review for
natural, parent-appropriate tone: the `Gate` heading/intro/preview, the field labels + error
messages, the **consent** and **marketing** wording (also pending legal), the privacy note, and the
`Result` placeholder strings. EN is the mirror.

### Notes for IqUp
The lead stores **only the strengths summary** — never the child's answers, and **no IQ/score/total**
anywhere (lead, gate, or results). The consent checkbox is mandatory and separate from the optional,
unchecked marketing opt-in; both wordings are **drafts awaiting your legal sign-off**, tracked by
`CONSENT_VERSION`. Data stays in the EU Supabase project; the account transfer + key migration before
launch remain on the carryover list.

## What's next

**1.09 (Design) → 1.10 (Build) — Results + certificate:** replace the temporary `/result` island at
the `// PLUGS INTO 1.10` seam with the real strengths profile + shareable certificate, reading the
same `TestResult` (`iqup.testResult.v1`) + lead context (`iqup.leadContext.v1`) and the spec §6
templates (`src/content/results/`). **1.11** finalises the mobile performance sweep.
