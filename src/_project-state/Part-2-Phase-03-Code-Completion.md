# Completion Report — Part 2 · Phase 2.03 (Code half) · Follow-up nurture emails

- **Phase ID + name:** 2.03 (Code half) — Follow-up nurture emails: author + render the templates
- **Executing Claude:** Code
- **Date completed:** 2026-06-16

---

## What shipped

The **content half** of the lead lifecycle's final piece: the automated follow-up ("nurture")
emails that run on the marketing list (the list 2.02 fills **only** on `marketing_opt_in`). Authored
as version-controlled, bilingual React Email templates that **reuse the 2.01 results-email brand +
layout**, then rendered to plain HTML the Cowork half loads into Brevo. **The app funnel does not
change; nothing new is collected or stored.**

- **Four templates × MK + EN → 8 rendered HTML files** in `docs/email-templates/Part-2-Phase-03-nurture/`:
  - `welcome-trial` (trial track, age ≤ 9) — thank-you + "your strengths profile & certificate are
    already in your inbox" + a soft trial mention + "a couple more notes coming".
  - `welcome-general` (general track, age ≥ 10) — thank-you + certificate reminder, **no trial CTA**,
    a quiet "explore IqUp" link; rolls into general sends.
  - `trial-invite` (trial track) — the heart: the §2 story → hands-on discovery → create lesson,
    Bibi/Bobi/Oliver-led, + the trial CTA.
  - `nudge` (trial track) — a light, no-pressure final note + the trial CTA once more.
- **Brand + layout** = a faithful reuse of the 2.01 email (literal-hex `src/lib/email/brand.ts`,
  web-safe fonts, same container/button/footer, mobile-first) + a wordmark stand-in header. **No
  parallel email design system.** **No certificate attached** (that is only the 2.01 email).
- **Personalisation = Brevo merge tags only**, using only attributes Brevo already stores from 2.02:
  `CHILD_FIRST_NAME` (greeted with a graceful `default:` fallback), and `CHILD_AGE` / `LOCALE` as
  **branch conditions only** — the child's age is **never shown**. **No new data, no new attribute.**
- **Guardrails (tested):** no numbers/scores anywhere; unsubscribe + legal sender identity + postal
  address in every footer; UTM-tagged links with per-email campaigns; trial CTA in welcome-trial /
  trial-invite / nudge and **absent** in welcome-general.
- **Tooling:** a new render script `scripts/render-nurture.mts` (`npm run emails:nurture`), a shared
  pure `src/lib/email/site-url.ts` seam (so the 2.01 + nurture trial CTAs stay identical), two Vitest
  suites, and the authoritative **README** hand-off for the Cowork half.

## Decisions made on the fly (with "why")
> All also appended to `Decisions.md` (#97–#103). No silent ratifications.

- **#97 — Shared trial-CTA seam.** Extracted `siteUrlFor` from `send-results-email.ts` (2.01) into a
  new pure `src/lib/email/site-url.ts`; 2.01 now imports it. So the 2.01 email + the four nurture
  emails resolve the trial-CTA target from ONE place (the brief: "2.05 updates both in one place"). A
  no-behaviour-change refactor — the 2.01 `send-results-email.test.ts` still passes.
- **#98 — `finalizeMergeTags` (quote restoration).** A throwaway probe showed `@react-email/render`
  HTML-escapes `"`→`&quot;` in text content, which would have shipped a broken `default: &quot;…&quot;`
  filter to Brevo. The render helper restores the literal quotes **only inside `{{ … }}` spans**; the
  smoke test asserts the literal-quote tag and that no `&quot;` remains inside a tag.
- **#99 — Meaningful empty-name default + generic greeting.** Used `default: "your child"` /
  `"вашето дете"` (not the brief's `""` example) so an absent name reads naturally; the greeting is
  generic (`Hello,` / `Здраво,`) because we collect no parent name (GDPR minimisation, #85).
- **#100 — welcome-general's general link + identical trial label.** welcome-general carries a quiet
  link with its own `nurture-welcome-general` UTM (so every email has a UTM-tagged link) but **no trial
  CTA**; the three trial emails share one identical trial-CTA label (matching 2.01) — a clean
  presence/absence tripwire.
- **#101 — Latin legal entity + reused footer tagline/signoff.** `IKUP d.o.o.` stays Latin in both
  locales (registered form; the brand renders in Latin throughout the MK site) — a stable, assertable
  legal token; only the street/city is localized. The footer identity tagline + signoff are reused
  from the 2.01 `Email.footer` messages (single source).
- **#102 — No-number guardrail split by surface (continuing #94).** Message copy gets the full digit +
  score-word ban; the footer legal/postal line gets the forbidden-WORD ban only (a postal address has
  digits). The render-smoke masks the legal line + URLs + the brand wordmark `IQ UP!` ("IQ" = the brand
  name, not a score) before the digit ban.
- **#103 — Main-session build + delegated review; render smoke under default Vitest.** The four
  templates share the layout/brand/footer/copy contract (shared-state main-session work per CLAUDE.md);
  the independent unit — the end-to-end fresh-context guardrail review — was delegated. The smoke needs
  no script-local tsconfig (the templates import no `server-only`, like 2.01's `ResultsEmail.test.ts`).

## Surprises / off-spec changes

- **The brief's `default: ""` example does NOT "render verbatim into the HTML."** React escapes the
  `"` inside the filter (only the `{{ }}` braces survive). This is the central technical finding of the
  phase; the fix (#98) keeps the documented Brevo syntax while making the whole tag render correctly.
- **Touched one 2.01 file** (`send-results-email.ts`) for the shared `siteUrlFor` seam (#97). This is a
  no-behaviour-change refactor in service of the brief's "keep them identical / 2.05 updates both in
  one place" requirement — not a funnel change. Verified by the still-green 2.01 test.
- **welcome-general needed a (non-trial) link** to satisfy "every outbound link is UTM-tagged" + the
  "four campaigns appear on the right emails" check without a trial CTA (#100).
- The `docs/email-templates/` committed HTML currently bakes the dev placeholder `http://localhost:3000`
  (because `NEXT_PUBLIC_SITE_URL` is unset locally) — by design, documented for the 2.06 re-render.

## Files written / updated

**New (Code):**
- `src/lib/email/site-url.ts` — shared pure `siteUrlFor` seam.
- `src/emails/nurture/copy.ts` — bilingual copy + `MERGE` tags + legal line.
- `src/emails/nurture/links.ts` — UTM + `ctaHref` (trial-CTA seam).
- `src/emails/nurture/styles.ts` — shared style objects (reuse of 2.01).
- `src/emails/nurture/NurtureLayout.tsx` — shell + legally-required footer.
- `src/emails/nurture/NurtureBody.tsx` — intro/body/CTA renderer.
- `src/emails/nurture/{WelcomeTrial,WelcomeGeneral,TrialInvite,Nudge}.tsx` — the four templates (locale-only).
- `src/emails/nurture/render.ts` — `renderNurtureEmail` + `finalizeMergeTags`.
- `src/emails/nurture/copy.test.ts`, `src/emails/nurture/render-smoke.test.ts` — guardrail tests.
- `scripts/render-nurture.mts` — the `emails:nurture` render script.
- `docs/email-templates/Part-2-Phase-03-nurture/` — 8 rendered HTML files + `README.md`.

**Updated:**
- `src/lib/email/send-results-email.ts` — imports the shared `siteUrlFor` (private copy removed).
- `package.json` — added the `emails:nurture` script (no dependency change).
- `Decisions.md` (#97–#103), `src/_project-state/{current-state,file-map,00_stack-and-config}.md`.

## Tests run + results

- `npm test` → **258 passed** (24 files; up from 190 — +68 from the two new suites). Vitest-only.
- `npm run typecheck` → exit 0.
- `npm run lint` → exit 0.
- `npm run build` → exit 0; **route table unchanged** (no new routes).
- `npm run emails:nurture` → wrote all 8 HTML files; re-running produces no drift.
- **Forbidden-token test proven non-vacuous** by the fresh-context reviewer (injected `you scored 7` →
  both `copy.test.ts` and `render-smoke.test.ts` went red → reverted).

## Legal-review note

This is the phase the **real marketing copy** is authored. **All nurture MK copy is provisional**
(native-MK review pending; EN mirrors it). The **footer legal/sender-identity + postal address line
and the marketing wording remain IqUp-legal-pending** — flagged for the IqUp legal/privacy reviewer,
tied to `CONSENT_VERSION` (continuing the 2.01/2.02 legal-review list: Brevo DPA + EU residency + the
consent/marketing boundary). No new data processor is introduced. The marketing-list trigger means
these emails only ever reach `marketing_opt_in === true` contacts (the consent gate from 2.02 / #96).

## Definition of Done checklist

- [x] Four nurture templates in MK + EN (8 rendered HTML files), reusing the 2.01 brand/layout, mobile-first; **no certificate attached**.
- [x] Personalisation via Brevo merge tags only (graceful empty-name fallback), using only `CHILD_FIRST_NAME` (+ branch-only `CHILD_AGE` / `LOCALE`) — **no new data**.
- [x] **No numbers/scores** in any email (copy + rendered HTML), tested; the child's age is never shown.
- [x] **Unsubscribe + sender identity + postal address** in every footer; trial CTA present in welcome-trial / trial-invite / nudge, **absent** in welcome-general; all links **UTM-tagged** with per-email campaigns.
- [x] Trial CTA points at the same target as the 2.01 email, behind a `// TODO(booking 2.05)` seam; README flags the 2.05 / 2.06 updates.
- [x] `copy.ts` MK/EN parity + forbidden-token test green; render smoke test green; `npm test` Vitest-only + green; build / typecheck / lint clean; **route table unchanged**; **no new dependency**; nothing stored / no schema change.
- [x] README written: file→step mapping, subjects/preview, exact Brevo trigger + branch conditions (marketing-list trigger; `CHILD_AGE ≤ 9` trial split; `LOCALE` language split), link/sender notes, plain-text auto-gen note.
- [x] Fresh-context review subagent run; verdict recorded. State docs updated; on-the-fly decisions logged + surfaced. Completion report written; one commit.

## Fresh-context review verdict

**APPROVE-WITH-NITS.** A fresh-context reviewer (no session history) independently re-derived all ten
guardrails against the working-tree diff and verified them by reading + re-running (reproducible HTML,
non-vacuous forbidden-token test, no behaviour change to 2.01, no new data/dep/route). No Critical or
Important issues. Three minor nits, two applied: **M1** — hardened the `finalizeMergeTags` doc comment
to note it handles quote escaping only (a `default:` value must contain no raw `&`/`<`/`>`); **M2** —
clarified the README's "general newsletter" line as a future reference. **M3** (the committed HTML
bakes the localhost placeholder) is by-design and documented for the 2.06 re-render — no change.

## What's next

The **2.03 Cowork half** builds + stages the automation in Brevo from
`docs/email-templates/Part-2-Phase-03-nurture/README.md`: load the 8 templates, wire the **marketing-
list trigger** (never the ops list), the `CHILD_AGE ≤ 9` trial split + `LOCALE` language split, the
~Day 1/3/7 cadence, and the staging sender — and keep the automation **paused until launch** (pending
native-MK review, IqUp legal sign-off, the 2.06 branded sender + final domain, and the 2.05 booking
link). Then 2.04 (analytics/Pixel/consent + `/privacy`), 2.05 (real booking), 2.06 (Vercel Pro +
domain + `@iqup.mk` sender + SPF/DKIM/DMARC).
