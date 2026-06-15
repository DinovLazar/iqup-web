# Completion Report — Part 2 · Phase 2.01 · Results email (Brevo + React Email + server-rendered certificate)

- **Phase ID + name:** 2.01 — Results email
- **Executing Claude:** Code
- **Date completed:** 2026-06-15

---

## What shipped

When a parent submits the gate and the lead saves, they now receive **one warm, bilingual transactional email** with the child's strengths profile in the body and the certificate attached. Nothing in the existing land → test → gate → result funnel changed behaviour — this only *adds* a send after the lead is saved.

- **`submitLead` hook** (`src/lib/leads/submit-lead.ts`): after `insertLead()` resolves, it schedules `after(() => sendResultsEmail(...))` (`after` from `next/server`). The send runs after the response is sent (parent's `/result` redirect is never delayed; the work still completes on serverless). The honeypot path returns *before* this — **bots never send**.
- **Orchestrator** (`src/lib/email/send-results-email.ts`, `server-only`): reproduces the on-screen ranking from the lead's stored ratio summary → assembles the §6 body copy → renders the certificate PNG + base64-encodes it → renders the email to HTML + text → sends via Brevo. The **entire function is internally try/caught and never throws**; with `BREVO_API_KEY` unset it logs `skipped-no-key` and returns.
- **Brevo client** (`src/lib/email/brevo.ts`, `server-only`): a thin typed `fetch` POST to `https://api.brevo.com/v3/smtp/email` (`api-key` header), body `{sender, to, subject, htmlContent, textContent, attachment:[{content:<base64>, name:'certificate.png'}], replyTo?, tags:['results-email', band, locale]}`. Throws a typed `BrevoError` on non-2xx. **No SDK.**
- **React Email template** (`src/emails/ResultsEmail.tsx` + `render.ts`): greeting → strengths profile (from `getResultCopy`) → "your certificate is attached" → **trial CTA button for bands 3–5 / 6–9 only** / **curious-mind ending for band 10–13** → IqUp identity + contact footer. Rendered to HTML + plain text. Literal-hex brand tokens, web-safe email fonts, mobile-first.
- **Certificate image** (`src/lib/email/certificate-image.tsx`, `server-only`): `renderCertificatePng({childFirstName, celebrated, locale, date?})` → a 1080×1350 PNG via `next/og` (Satori), Rubik + Nunito Sans (Cyrillic), deterministic per-child tint, the licensing-safe **Bibi placeholder** (driven by `BIBI_CERT_ART`) — visually faithful to the on-screen `Certificate.tsx`. The name is rendered **in memory, server-side, attached** — never stored, never in a URL.
- **Determinism bridge** (`src/lib/scoring/reconstruct.ts`): `reconstructResult(scores, band, locale)` re-derives the exact on-screen ranked `TestResult` from the lead's stored `top_strengths.scores`, reusing `score()`'s shared comparator + tier logic — so the email is the byte-identical content the screen showed, with **no new data persisted**.
- **i18n:** a new **`Email` namespace** (chrome only) in `mk.json` + `en.json` (exact parity, enforced by `messages.test.ts`). All MK provisional; the footer identity line is flagged for IqUp legal.
- **Dev check:** `npm run test:email` — drives the real orchestrator per band × locale to `TEST_EMAIL_TO`; refuses to run in production / CI; reports the no-key skip.
- **Deps added (pinned exact):** `@react-email/components@1.0.12`, `@react-email/render@2.0.8`, `@fontsource/nunito-sans@5.2.7`. Env var **names** added to `.env.local.example`.

## Decisions made on the fly (with "why")

All logged in `Decisions.md` (#82–#88). Summary:

- **#82** — Reproduce the ranking from the stored ratio summary via `reconstructResult` (refactored `score.ts` to share `compareStrengthScores` + `tierForRank`) rather than persist anything new; a cross-check test proves the 2-dp rounding preserves the ranking. *Honours "no new data in the lead payload" while guaranteeing email==screen.*
- **#83** — `Email` namespace = chrome only; body copy from `getResultCopy` (single source). Chrome avoids even *negated* forbidden words so the forbidden-token test stays a clean tripwire.
- **#84** — The cert is a **new Satori renderer**, not a reuse of the DOM component: literal hex, flexbox-only, precomputed mixes, `✦`→inline SVG sparkle (fonts lack U+2726), radial vignette→constant cream, SVG children as keyed arrays (Satori crashes on a Fragment-only SVG child). Tint derived internally from the celebrated codes. Bibi via `BIBI_CERT_ART`.
- **#85** — Cert reads face labels from the `Result.certificate` messages JSON; the email `to` carries only `{email}` (the recipient is the parent; we collect no parent name).
- **#86** — Parallelised the two independent UI/render tracks (email template, Satori certificate) via subagents against typed contracts; built the integration spine (Brevo client + orchestrator + the `after()` hook) + foundation in-session (consistent with decision #65). Fresh-context review ran at the end.
- **#87** — `test:email` runs under a script-local tsconfig that aliases `server-only`→empty rather than `--conditions=react-server` (which blocks `react-dom/server`, needed by React Email).
- **#88** — **Brevo as a new data processor** surfaced (not silently ratified) → added to the Part-2 legal-review list (Brevo DPA + EU residency).

## Surprises / off-spec changes

- **`--conditions=react-server` is incompatible with React Email.** The brief's sibling `test:insert` uses that flag to neutralise `server-only`, but it also forces `react-dom/server` into its react-server stub, which throws — and `@react-email/render` needs `react-dom/server`. I verified the **real Next server runtime is fine** (a temporary route handler rendered real HTML + a valid 1080×1350 PNG in the running dev server, then removed it), and switched the *script* to a tsconfig `paths` alias for `server-only` instead. Live code/runtime won over the assumed flag.
- **No `@resvg/resvg-js` fallback needed.** `ImageResponse.arrayBuffer()` yields the PNG bytes directly under both Vitest and the Next runtime (the brief flagged resvg as a possible fallback; it wasn't required — zero new image deps).
- **Satori quirks** (Fragment-as-SVG-child crash, missing `✦` glyph, no `color-mix`/grid/radial-var) were worked around in the renderer (decision #84) — the certificate still matches the on-screen design (verified by rendering a real Cyrillic sample, saved under `docs/qa/Part-2-Phase-01/`).
- No doc/live-code disagreements beyond the `--conditions` point above.

## Files written / updated

**New:** `src/lib/email/{brand,brevo,brevo.test,send-results-email,send-results-email.test,certificate-image,certificate-image.test}.{ts,tsx}`, `src/emails/{types.ts,ResultsEmail.tsx,render.ts,ResultsEmail.test.ts}`, `src/lib/scoring/{reconstruct.ts,reconstruct.test.ts}`, `scripts/test-email.ts`, `scripts/email-runtime/{tsconfig.json,empty.ts}`, `src/_project-state/Part-2-Phase-01-Completion.md`, `docs/qa/Part-2-Phase-01/{certificate-mk-6-9-Марко.png,email-en-3-5.html,email-mk-10-13.html}`.

**Updated:** `src/lib/leads/submit-lead.ts` (+ `submit-lead.test.ts`), `src/lib/leads/lead-mapping.ts` (`BAND_KEY_BY_LEAD`), `src/lib/scoring/{score.ts,index.ts}`, `src/messages/{en,mk}.json` (`Email` namespace) + `messages.test.ts`, `package.json` (`test:email` + 3 deps), `.env.local.example`, and the state docs (`current-state.md`, `file-map.md`, `00_stack-and-config.md`, `Decisions.md`).

## Tests run + results

- `npm run build` (Turbopack) — **clean** (compiled, TypeScript pass, 13 static pages; route table unchanged — the email is server-side logic, not a route).
- `npm run typecheck` (`tsc --noEmit`) — **clean (exit 0)**.
- `npm run lint` (eslint) — **clean (0 errors, 0 warnings)**.
- `npm test` (Vitest) — **136/136 green** (up from 98). New suites: `reconstruct` (cross-checks `score()`’s ranking for every band × answer shape + determinism/edges), `brevo` (mocked `fetch`: endpoint, `api-key` header, payload + attachment shape, non-2xx → `BrevoError`), `send-results-email` (no-key skip, never-throws isolation, Brevo payload + attachment + tags, same-content-as-screen, locale URL), `ResultsEmail` (band × locale: name + strengths copy present, no forbidden tokens in visible text, trial CTA present 3–5/6–9 & absent 10–13, absolute links), `certificate-image` (valid PNG signature + size for Cyrillic/Latin/single-strength, different children → different bytes), and `messages.test.ts` (the `Email` namespace).
- **Live render proof (real Next runtime):** a temporary `GET /api/emailcheck` route returned `{ok:true, htmlLen:6206, textLen:669, pngLen:103486, pngIsValid:true}` — confirming `renderResultsEmail` + `renderCertificatePng` run in the server-action/route runtime the `after()` callback uses. Route removed before commit.
- **Visual proof:** rendered a real certificate for "Марко" (MK, pattern+logic) — Cyrillic renders with **no tofu**, correct per-child tint, both celebrated chips with glyphs, IQUP wordmark + "15 јуни 2026". Saved at `docs/qa/Part-2-Phase-01/certificate-mk-6-9-Марко.png`.

## Live-delivery result — DEFERRED PENDING KEY

`BREVO_API_KEY` is **not yet in `.env.local`** (Cowork's item). Per the brief's §7.4 contingency:
- The **no-key path no-ops cleanly**: `npm run test:email` ran all six band × locale samples and each logged `{event:'results-email', status:'skipped-no-key', …}` without throwing; the funnel is unaffected.
- The **send path is proven against mocks** (the `brevo` + `send-results-email` suites) and the **render path is proven in the real Next runtime** (above).
- **To complete the live check once the key lands:** add `BREVO_API_KEY` + `EMAIL_FROM_ADDRESS` (+ optional `EMAIL_FROM_NAME` / `EMAIL_REPLY_TO`) and `TEST_EMAIL_TO` to `.env.local`, then run **`npm run test:email`**. Confirm in the inbox: the email arrives (Gmail at least, ideally Outlook), the Cyrillic subject + body render, `certificate.png` opens as a valid 1080×1350 PNG (right name/strengths/tint, no tofu), and the trial CTA shows only for the 3–5 / 6–9 bands.

## Definition of Done checklist

- [x] Brevo send wired into `submitLead` via `after()`; fully isolated (failure never affects the save/redirect); no-op + logged when `BREVO_API_KEY` unset; honeypot path never sends.
- [x] React Email `ResultsEmail` — bilingual, fed by `src/content/results/` (single source); greeting + strengths profile + "certificate attached" + trial CTA (3–5/6–9 only) + identity/contact footer; HTML + plain text; absolute links via `NEXT_PUBLIC_SITE_URL` (dev fallback).
- [x] Server-rendered certificate PNG (`next/og`/Satori), parameterised by name + strengths + tint + locale, Cyrillic-safe, attached, visually faithful within Satori's limits; name in memory, never stored, never in a URL.
- [x] On-screen and emailed result are the **same content** per locale, reproduced from data the action already has (no new lead payload, no numbers shown).
- [x] `Email` namespace added to both locales with exact parity; `messages.test.ts` green.
- [x] **No score / IQ / % / rank / bar** in the email or certificate (forbidden-token coverage extended + passing).
- [x] Unit tests (Brevo client, template × band × locale, certificate bytes, parity, reconstruction) green; `build` + `typecheck` + `lint` + `test` clean.
- [x] `npm run test:email` exists and is production/CI-safe; live delivery **deferred-pending-key** with run instructions (above).
- [x] New deps appended to `00_stack-and-config.md`; `file-map.md` + `current-state.md` updated; on-the-fly decisions logged in `Decisions.md`; **Brevo-as-processor** recorded + added to the legal-review list.
- [x] Part-2 seams intact: CRM/list routing left for 2.02; nurture left for 2.03; trial CTA link target noted to update in 2.05; production sender + SPF/DKIM/DMARC + production `NEXT_PUBLIC_SITE_URL` left for 2.06.
- [x] Fresh-context review subagent run; guardrails re-verified (see below).
- [x] Completion report written (this file). One git commit for the phase.

## Fresh-context review

A fresh-context review subagent re-verified the §5 guardrails against the whole diff with no prior context (it independently rendered all six band × locale email variants, expanded the forbidden-token regex, and enumerated the reachable per-band ratios to prove the rounding can't change the ranking). **Verdict: all 10 guardrails satisfied — zero blockers, zero should-fixes.** Confirmed: the only `fetch` is the Brevo POST; nothing new is persisted; the name/email never enter a URL; the structured logs omit name + email (band/locale/status only); the send is fully isolated from lead capture; the honeypot never sends; trial CTA gated 3–5/6–9; certificate uses the `BIBI_CERT_ART` placeholder; i18n parity holds; Part-2 seams intact; `server-only` + env-side secrets correct.

Three non-blocking **nits**: (1) a no-op `mix(cream, cream, 1)` in the certificate caption background — **fixed** to `BRAND.cream`; (2) the `brand.ts` hex mirror has no automated drift test vs `globals.css` — left as-is, consistent with the existing OG-image inlined-hex precedent (a future parity test would harden it); (3) `EMAIL_FROM_NAME || 'IqUp'` falls back on empty string — intended.

## What's next

**2.02 — CRM / lead notification / list routing.** Route the saved lead into a CRM / contact list and notify the team (the `tags: ['results-email', band, locale]` on each send help segment later). Then 2.03 follow-ups (marketing-opt-in-gated), 2.04 analytics/Pixel/consent + `/privacy`, **2.05 the real trial booking** (update the email's trial-CTA link target then), 2.06 Vercel Pro + domain + production `NEXT_PUBLIC_SITE_URL` + the branded `@iqup.mk` sender with SPF/DKIM/DMARC — and **run the deferred `npm run test:email` live check once `BREVO_API_KEY` lands**.
