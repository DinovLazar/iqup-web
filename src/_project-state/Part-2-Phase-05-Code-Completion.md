# Part 2 · Phase 2.05 — Trial-booking mechanic (Code) — Completion Report

**Date:** 2026-06-19 · **Branch:** `phase-2.05-trial-booking` · **Status:** built, verified, pushed (merge pending Lazar's yes).

---

## What shipped

The free trial class — IqUp's dominant conversion action — now has a real, working endpoint. The temporary `// TODO(booking 2.05)` seam on the result screen and the placeholder trial URLs in every email are gone.

- **One shared `TrialBooking` mechanism** (`src/components/trial/TrialBooking.tsx`) — a client island that is the single home for the city picker + one-tap contact actions, reused by BOTH surfaces. A parent picks their city from an accessible native `<select>` (no geolocation), then sees their chosen centre's name + address + named contact and a row of real actions:
  - **Call** → `tel:` to the centre's phone (whitespace stripped).
  - **Email** → a **name-free** `mailto:` with a provisional bilingual subject + body inviting the parent to share the child's age + a preferred time (no child name anywhere).
  - **Get directions** → the centre's `mapsUrl` when present, else a **derived Google Maps search link** (`mapsUrlFor`), in a new tab (`rel="noopener noreferrer"`).
  - **Viber / WhatsApp** → rendered **only when** a centre carries the number (zero render today — none are set).
  Copy is resolved server-side from the new `Trial` namespace (`resolveTrialBookingCopy`) and passed as plain-string props, so the island ships no translation runtime.
- **The public booking page** (`src/app/[locale]/trial/page.tsx`) — SSG, in the `[locale]` layout (skip-link + header/footer + per-locale `<html lang>`), per-locale `generateMetadata` (title/description/canonical/hreflang), **name-free, collects nothing**. Body = band-agnostic heading + honest intro ("trials are booked directly with your nearest IqUp center") + the shared `TrialBooking` (no band). MK `/trial`, EN `/en/trial`. Slug provisional (`// TODO(mk-slug)`). Generic name-free per-locale OG image (`trial/opengraph-image.tsx`, mirrors `/result`).
- **Result-screen rewire** — `TrialInvite.tsx` (bands 3–5 / 6–9) now renders the shared `TrialBooking` **inline** (passing the resolved `band`), keeping the §6 heading/intro + the `{center}` slot (filled via an `onSelectCenter` callback). The old inline picker/seam was removed. **Band 10–13 (`CuriousMindEnding`) is untouched.**
- **One trial target everywhere** — a single `trialBookingUrl(locale, utmCampaign?)` helper (`src/lib/email/site-url.ts`) built on `siteUrlFor` + `/trial` + optional UTM. The results email (`send-results-email.ts`) and the three trial nurture links (`welcome-trial` / `trial-invite` / `nudge`) all resolve from it; `welcome-general` keeps its general "explore IqUp" site-root link. The 8 nurture HTML files were re-rendered.
- **Analytics** — `track('trial_cta_click', {band?, locale, path})` fires client-side on each real action on both surfaces, PII-free, consent-gated (the existing 2.04 `track()`); the result screen passes `band`, the public page omits it.
- **i18n** — new `Trial` namespace (page heading/intro, picker label, 4 action labels, name-free mailto subject/body, reassure line, meta + OG), exact MK/EN parity; all new MK provisional. `Result.trial` slimmed to `{heading, nearestCenter}` (the rest moved to `Trial`).

## Decisions made on the fly (appended to `Decisions.md`, #115–#123)

- **#115** — the pre-resolved direction (direct-contact booking mechanic, chosen in chat).
- **#116/#117** — one shared component for both surfaces; the `{center}` slot preserved via an `onSelectCenter` callback (keeps the component surface-agnostic).
- **#118** — `centers.ts` additive only: optional unset `viber?`/`whatsapp?`, derived Maps search link, no value changes, PROVISIONAL kept.
- **#119** — the single `trialBookingUrl` helper; `welcome-general` stays trial-CTA-free.
- **#120** — **renamed `ResultsEmailProps.siteUrl` → `trialUrl`** (it now holds the booking URL) — drove the deliberate test changes.
- **#121** — removed `IQUP_CONTACT_URL` + the contact-form fallback (superseded).
- **#122** — fixed a latent AA contrast defect on the chosen-centre contact line (see below).
- **#123** — `/trial` provisional slug + generic name-free OG image.

## Surprises / off-spec / live-vs-doc mismatches

- **DELIBERATE test changes (not silent):**
  - `send-results-email.test.ts` — the trial-URL assertion changed from the locale root (`https://iqup.example/en`) to the booking page (`https://iqup.example/en/trial`; mk root → `/trial`), exactly as the brief instructed.
  - `ResultsEmail.test.ts` — the `SITE_URL` test constant (→ `TRIAL_URL = …/mk/trial`) and the trial-button href assertions were updated for the renamed `trialUrl` prop + the new `/trial` target.
- **Renamed `siteUrl` → `trialUrl`** on `ResultsEmailProps` (#120) — the prop now unambiguously holds the trial booking URL rather than a misleadingly-named site root. Touched `emails/types.ts`, `ResultsEmail.tsx`, `send-results-email.ts`, and the two tests.
- **Latent AA contrast defect found + fixed (#122):** the chosen-centre contact line was `text-ink-faint` (#8a8499) on `bg-canvas` = **3.39:1** at 12px (below 4.5:1). It existed in the 1.10 `TrialInvite` card but the `/result` axe scans never selected a city, so the card never rendered and it was never caught; the new `/trial` selected-state axe scan exposed it. Changed to `text-ink-soft` (#5a5570, ~6.5:1) in the shared component — which hardens the result screen too.
- The results email keeps **no UTM** (it had none in 2.01 — "preserve existing"); only the nurture links carry UTM.

## Files written / updated

**New:** `src/components/trial/TrialBooking.tsx`, `src/components/trial/resolve-copy.ts`, `src/app/[locale]/trial/page.tsx`, `src/app/[locale]/trial/opengraph-image.tsx`, `src/_project-state/Part-2-Phase-05-Code-Completion.md`.

**Updated:** `src/content/centers.ts` (+test), `src/components/result/{TrialInvite.tsx,ResultView.tsx,copy.ts}`, `src/app/[locale]/result/page.tsx`, `src/lib/email/{site-url.ts,send-results-email.ts}` (+test), `src/emails/{types.ts,ResultsEmail.tsx}` (+`ResultsEmail.test.ts`), `src/emails/nurture/links.ts`, `src/messages/{mk,en}.json`, `src/messages/messages.test.ts`, `tests/e2e/a11y.spec.ts`, `docs/email-templates/Part-2-Phase-03-nurture/*.html` (re-rendered), `Decisions.md`, `src/_project-state/{current-state.md,file-map.md}`.

## Tests run + results

- **Vitest:** `npm test` → **292/292 pass** (28 files; up from 289 — added centers-helper tests + the `Trial` parity block).
- **`npm run typecheck`** clean · **`npm run lint`** clean · **`npm run build`** green (`/mk/trial` + `/en/trial` + their OG images prerendered SSG).
- **Email render/smoke:** the nurture render-smoke + results-email tests pass under `npm test`; `npm run emails:nurture` re-rendered the 8 HTML files — verified the three trial emails now point at `/trial` (+ `/en/trial`) with UTM, `welcome-general` still points at the site root.
- **Accessibility:** added `/trial` (empty + city-selected states, both locales) to the Playwright axe set — **all pass** (`npx playwright test a11y -g "trial booking" --project=mobile` → 2/2; the selected-state scan is what caught + verified the #122 contrast fix). Live structural verification in the dev preview: page renders in both locales, labelled `<select>` over all 10 centres, selecting a city reveals the name-free `mailto:`, `tel:`, and derived Maps-search actions; no console errors; `<select>` 52px target. (The preview **screenshot** tool still produces the documented broken-sliver output on this machine — verified structurally via the a11y tree + computed-style/href inspection, consistent with prior phases.)
- **Fresh-context adversarial review** (delegated, strongest model, read-only): **CLEAN** — no guardrail violations, no correctness bugs. Its one "confirm" note (the result screen embeds the mechanic inline rather than linking to `/trial`) is exactly the brief's intent ("the parent still books without leaving the result screen").

## Blocked / carryover items

- **Booking link host is the dev placeholder until 2.06** — `NEXT_PUBLIC_SITE_URL` unset → `http://localhost:3000`; set the production iqup.mk subdomain in 2.06.
- **Centre contact data still PROVISIONAL** — IqUp must verify each phone + email + address before launch (the data powers conversions).
- **Exact map pins, the MK slug, and Viber/WhatsApp numbers are pending** — directions use the honest derived search link; the slug is `/trial` (`// TODO(mk-slug)`); Viber/WhatsApp buttons stay hidden until Cowork supplies numbers (then they appear automatically).

## For Cowork

1. **Verify each centre's real phone + email** (`src/content/centers.ts` — still PROVISIONAL).
2. **Confirm whether each centre uses Viber and/or WhatsApp and supply the numbers** (E.164, e.g. `+38970…`) → set `viber?`/`whatsapp?` on the centre and the button appears automatically.
3. **Supply exact Google Maps place links** for `mapsUrl` if precise pins are wanted instead of the derived search link.
4. **Native-MK review** of the new `Trial` namespace (`src/messages/mk.json` → `Trial`; EN mirrors it).

**No new legal item** — the mechanic is contact-only, collects nothing, and adds no processor.

## What's next

**2.06** — Vercel Pro + the iqup.mk subdomain + production `NEXT_PUBLIC_SITE_URL` + a branded `@iqup.mk` sender (SPF/DKIM/DMARC) + re-measure mobile Lighthouse on clean infra (closes the `/test` 86–88 watch-item). Then **2.07** pre-launch QA + go-live, **2.08** post-launch check.
