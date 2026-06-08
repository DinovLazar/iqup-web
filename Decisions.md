# IqUp-Web — Decisions Log

Append-only record of project decisions. Newest entries go at the bottom. Each entry: date, the decision, and a short "why."

---

## Conventions

- **Append, don't edit.** Never rewrite or delete a past entry.
- **Reversing a decision?** Add a *new* entry that states the change and references the entry it replaces (e.g. "Supersedes 2026-06-07 #6").
- **Who appends:** Chat logs decisions made during planning and chat. Code appends any decision it had to make on its own during a phase — and also surfaces it in that phase's completion report so Chat can flag it to Lazar.

---

## Decisions

### 2026-06-07 — Seeded from intake + planning

1. The site is a marketing-campaign funnel, not a multi-page brochure site. *Why: the goal is leads + awareness, not a full company website.*
2. Honest framing — an IQ-test hook for the headline, but results are a strengths profile, never a clinical IQ number. *Why: a valid IQ score for young children online isn't possible or honest; protects parent trust and keeps us legally and ethically sound.*
3. The test covers ages 3–13, even though IqUp's program is 3–9. *Why: a wider net for leads and awareness.*
4. Three age bands — 3–5 (parent-assisted), 6–9 (mostly solo), 10–13 (solo). *Why: balances age-fit against the amount of content to write.*
5. The parent enters their email *before* results are shown. *Why: maximizes lead capture, the primary goal.*
6. Results = strengths profile + shareable certificate for all three bands; a free-trial invite for 3–5 and 6–9; 10–13 ends at the result. *Why: the certificate drives sharing and awareness; there's no program for 10–13, so no trial CTA.*
7. Bibi characters — existing licensed images only, never generated or redrawn. *Why: IP/license correctness; we don't recreate licensed characters.*
8. Test questions are original, inspired by general task types, never copied from a proprietary test. *Why: copyright safety.*
9. Languages — Macedonian default at `/`, English at `/en/`. *Why: North Macedonia market, MK-first.*
10. Stack locked — Next.js / TypeScript / Tailwind / shadcn-ui / Framer Motion / Lucide / next-intl, Supabase (EU), GA4 + Microsoft Clarity + Meta Pixel, Vercel, iubenda/Termly. *Why: fits a fast, interactive, bilingual lead funnel.*
11. Leads stored in Supabase, EU region. *Why: already connected, free tier, GDPR-appropriate data location.*
12. Two-part build — Part 1 builds locally, Part 2 integrates and launches. *Why: clean separation of building vs. going live.*
13. Two Design phases (foundation; results + certificate). *Why: iterate the look before locking it into code.*
14. Deferred to Part 2 — email service, CRM, trial-booking mechanic. Deferred to launch — domain + DNS. *Why: not needed for the local build.*
15. Repo `DinovLazar/iqup-web`, private. Local folder `C:\Users\user\Desktop\iqup-web`. *Why: client work.*
16. Replaced the usual Notion checklist with `CLAUDE.md` + `AGENTS.md`. *Why: agent-facing repo instructions are more useful for a Code-heavy build.*
17. Phase 1.01 is a Chat research phase producing `brand.md`. *Why: establish the brand source-of-truth before any building.*
18. No AI features at launch. *Why: rule-based scoring with templated strengths results is safer and more predictable for children than AI-generated copy.*

### 2026-06-07 — Phase 1.02 scaffold (Code)

19. **npm** is the package manager for the whole project (single `package-lock.json`). *Why: one lockfile, one toolchain; matches the scaffold brief and avoids mixed-manager drift.*
20. next-intl `localePrefix: 'as-needed'` — Macedonian served at `/` with no prefix, English at `/en`. *Why: MK is the default market locale and should own the clean root URL; only the secondary locale carries a prefix.*
21. Code self-reviews and verifies its own work each phase (via the `requesting-code-review` and `verification-before-completion` skills). Heavier external AI review (CodeRabbit / Codex) and branch-protection rules are **deferred** to a future pull-request workflow. *Why: keeps the solo local build fast now; formal PR review can be layered on when the repo opens up to more contributors.*
22. Repo structure follows `plan.md` §9, **not** the generic `project-repo-bootstrap` skill layout (`briefs/`, `reports/`, `status/`, `docs/architecture`, CodeRabbit/Codex PR setup). *Why: this project has its own canonical structure and doc set (`src/_project-state/`, `docs/design-handovers/`, `AGENTS.md` + `CLAUDE.md`); the brief explicitly overrides the bootstrap skill.*

### 2026-06-07 — Phase 1.05 leads table + Supabase wiring (Code)

23. **The project starts on Lazar's personal Supabase account — transfer ownership to an IqUp-controlled account before launch.** *Why: convenient to build now; real parent data only arrives at launch, so the transfer must happen before then. (Carried over from the Cowork sub-phase.)*
24. **Supabase region `eu-central-1` (Frankfurt).** *Why: EU-hosted data residency for children's/parent PII, satisfying the GDPR requirement.*
25. **Summary-only storage — the `leads` table never stores a child's individual answers,** only the computed `top_strengths` summary. *Why: GDPR data minimization; the raw answers are not needed downstream.*
26. **All lead inserts are server-side only via the service-role key; RLS is enabled on `leads` with no anon/authenticated policies (plus a defense-in-depth `revoke`), so the public anon key can neither read nor write leads.** *Why: protects children's PII — the anon key ships in client code and must not be able to dump or write leads. Verified live (anon gets `permission denied`).*
27. **Separate, optional `marketing_opt_in` field, distinct from the required `consent`.** *Why: parental consent to submit is mandatory and must be `true`; a newsletter opt-in is a separate, optional choice used in Part 2. Final consent/marketing wording is IqUp's legal sign-off; `consent_version` records which wording was shown.*
28. **Plain `@supabase/supabase-js` (not `@supabase/ssr`).** *Why: no Supabase Auth/sessions are used; a stateless service-role client + plain anon client are correct and simpler.*
29. **zod 4 with a deliberate strip/strict split:** `leadSchema` strips unknown keys (zod-4 default, verified) so the lead is still saved cleanly if an anti-spam honeypot field rides along; `topStrengthsSchema` is `.strict()` with a number-only `scores` map so raw answers cannot be smuggled into the summary. *Why: balances forgiving form handling against strict data-minimization on the one field that could carry raw answers.*
30. **Migration applied via the Supabase dashboard SQL editor (browser), and `types.ts` hand-authored + verified against the live schema,** rather than `supabase db push` / `gen types`. *Why: the build sandbox cannot reach the Postgres port; the dashboard editor was the planned fallback and the types were verified column-by-column and proven by the passing live test. Regenerate types via `npm run db:types` once linked from an environment with DB access.*

### 2026-06-08 — Phase 1.06 landing page (Code)

31. **Age picker = exact-age chips grouped by band (not band cards), and the Start CTA carries `age` (not `band`).** The 1.03 handover §B.4 specified three band *cards*; the 1.06 phase prompt, its Definition of Done, plan.md §13, and the 1.08 email gate all require the **exact child age**. Reconciled by rendering an accessible radiogroup of ages 3–13 visually grouped under the three band labels (big targets, band-aware as the handover intends); the band derives from the age via `getBandForAge`. *Why: honours both the handover's UX intent and the carry-the-exact-age requirement (the leads table stores the child's age; the email gate reuses it).*
32. **Canonical band keys `3-5` / `6-9` / `10-13`** defined in `src/lib/bands.ts`. *Why: the 1.04 content spec was absent, so these become the project-wide source of truth; 1.07/1.08 must adopt them.*
33. **The full 1.03 design foundation (brand tokens + Rubik/Nunito Sans fonts) was wired in 1.06**, and the dead scaffold `.dark` block removed. *Why: 1.06 is the first build phase that needs the foundation — there is no separate "foundation build" phase. The palette/type are the handover's PROVISIONAL placeholders, referenced only via tokens so the real IqUp brand files re-skin by editing `globals.css` + the two `next/font` calls.*
34. **Vitest is the project unit-test runner.** *Why: none existed; needed for `bands.test.ts`; standard for the stack; reused by 1.07 scoring.*
35. **Client islands (`AgeStart`, `LanguageToggle`) receive their copy as props (resolved server-side) instead of calling `useTranslations` client-side; Framer Motion is loaded via `LazyMotion`; entrance animation is trimmed and kept off the LCP path; the body font is not preloaded.** *Why: keep the client bundle and main-thread work small and entrance motion within the performance budget (the locked stack's framework + brand-web-font baseline still leaves mobile Lighthouse Performance ~87 under throttling — documented for the 1.11 perf sweep).*
36. **Dynamic per-locale OG image via `next/og` (Cyrillic Rubik from `@fontsource/rubik`), no static fallback.** *Why: the Cyrillic glyphs render correctly (verified visually), so the preferred dynamic approach was kept rather than a static placeholder.*
37. **Placeholders, never generated:** `HeroArt` is an abstract decorative stand-in for the missing licensed Bibi art, and `Wordmark` is a token-styled `IQ UP!` stand-in for the missing official logo. *Why: the assets weren't in the repo and the rules forbid generating/redrawing Bibi characters; both are flagged for swap-in.*

### 2026-06-08 — Phase 1.07 test engine (Code)

38. **Content is keyed by the canonical `BandKey` (`3-5`/`6-9`/`10-13`), with the spec's `band-a/b/c` mapped 1:1 onto them; question ids use a short `a-q01`/`b-q01`/`c-q01` prefix tracing to the spec's item labels (A-Q01, …).** *Why: the phase prompt requires reusing `src/lib/bands.ts` and never redefining the bands; the letter prefix keeps each item traceable to spec §5 without re-introducing the `band-a` vocabulary as a band definition.*
39. **The content schema (spec §4) was extended with a typed `GlyphSpec`/`StemSpec` visual model, so every stem graphic and image option is *data* rather than per-question bespoke JSX.** *Why: the spec invites Code to own the final implementation; data-driven visuals keep the banks self-describing and let the content-integrity tests assert structure.*
40. **The shared strengths module carries the six codes, the 1.03 colour-token binding (`words_obs`→`verbal`), the bilingual display *names* (spec §1), and an English-only `whatItIs`.** The warm bilingual *celebrated/growing* blurbs (spec §6) are deliberately NOT included. *Why: spec §1 provides bilingual names but only an English "what it is"; the §6 blurbs are parent/child result copy owned by Phase 1.10 (`src/content/results/`), so duplicating them here would pull 1.10 scope (and unreviewed MK) into the taxonomy.*
41. **A tokenised `--toy-*` puzzle palette was added to `globals.css`** (red/blue/yellow/green/purple/orange/pink/teal/neutral) for the test graphics, each rendered with a shared `--ink` outline. *Why: a "red circle" must read as red — these are *content* colours, not chrome — but kept as tokens so no literal hex appears in components.*
42. **End-of-test hand-off persists the computed `TestResult` to `sessionStorage` under `iqup.testResult.v1`; `completedAt` is stamped at hand-off, NOT inside `score()`.** *Why: `sessionStorage` (not the URL/localStorage) keeps child data out of the address bar while surviving the navigation into 1.08; keeping the timestamp out of pure scoring preserves determinism for the tests.*
43. **Added a calm-play Start screen and a clearly-temporary Completion view (handover §D), and the `TestResult` contract = `{version, band, locale, strengths[](code/total/hits/ratio/rank/tier), top1/top2/top3, growing[], completedAt?}` with NO total/IQ field.** *Why: the runner flow benefits from a start state that sets the "no right/wrong" tone; the phase ends at "test complete → result handed off"; the contract is what 1.08/1.10 consume.*
44. **Dev preview = `?dev=1` gated to `NODE_ENV !== 'production'`:** a `DevBar` (jump to any band + auto-finish correct/mixed/wrong) plus a dev-only strengths summary on the completion view. *Why: lets all three bands + the computed result be verified without answering 36 questions; forced off (a no-op) in production.*
45. **Runner motion uses `tw-animate-css` `animate-in` utilities (already in the stack) for question entrances, and framer-motion's `useReducedMotion` hook only to pick the timed-vs-manual reveal path — no `MotionProvider`/`LazyMotion` in the runner; no new deps.** *Why: CSS-based entrances respect the global `prefers-reduced-motion` reset automatically and avoid LazyMotion strict-mode coupling; the reveal timer genuinely needs to branch on reduced motion.*
46. **Vitest gained a `@/*`→`src/*` alias (`vitest.config.ts`).** *Why: the new content/scoring modules use the app's `@/` imports; Vitest doesn't read tsconfig paths on its own.*
47. **The runner column is `max-w-xl` (~576px) rather than the handover §D's 420px.** *Why: a 420px column can't hold the 3-column image-option grids on desktop; mobile stays full-bleed 2-col. Minor, usability-driven deviation from the handover.*
48. **Object icons come from Lucide (endorsed by spec §7); the abstract puzzle figures and the few objects Lucide lacks (duck, sock, shoe, butterfly, ball, balloon, block) are original lightweight inline SVG. Image stems get a locale-aware generated text alternative (`stemAlt`).** *Why: leverages the locked icon set for recognisable objects while keeping full control of the puzzle-critical figures; the generated alt (draft MK) satisfies WCAG 1.1.1 for the graphic stems.*
