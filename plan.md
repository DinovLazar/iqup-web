# IqUp-Web — Plan (v2)

> The master spec for the finished site. This is **aspirational** — it describes what we're building, not the current state of the code. If this ever disagrees with the live code or `src/_project-state/current-state.md`, **the live code wins**; surface the mismatch to Lazar. The phase-by-phase breakdown lives in `phase-plan.md`.
>
> **Canonical source.** This file is the working English plan; the authoritative product spec is **`IQ UP Specifikacija v1.2`** (MK, 20.06.2026). Where this plan and the spec disagree, the spec wins — flag the gap. Section references like *(spec Дел 5)* / *(spec Прилог G)* point into that document. **v2 supersedes the v1 strengths-based "brain games" plan** (the v1 three-band ratio test, its 6-strength results, and the leads-with-results data model are rebuilt — see `src/_project-state/Part-3-Phase-00-Completion.md`).

---

## 1. What this is

A **free web application (lead magnet)** that gives parents a **professional, plain-language profile of their child's cognitive strengths and STEM readiness** (ages **5–13**) through an **adaptive, deterministic, no-AI** algorithm — and positions IqUp as serious education for developing the intellect, not just a place for play (spec Дел 1).

**It IS:** an educational *screening* of cognitive ability and STEM thinking, built on recognised paradigms (WISC-V, Raven's, KABC, computational thinking), with original tasks.

**It is NOT:** a clinical IQ test, a diagnosis, or a substitute for assessment by a licensed psychologist.

**Hard positioning rule (credibility + legal).** Never "clinical IQ", never an exact IQ number, never a diagnosis. We say **"cognitive profile / indicative range."** Results are shown as **bands + a pentagon + confidence labels — never a score, percentage, percentile, or rank.** Breaking this is a credibility and legal risk (spec 1.1).

**Two goals (spec 1.2):**
1. **Value for the parent** — a real, personalised evaluation: the reason to finish the test and trust IqUp.
2. **Growth for the brand** — the report subtly, expertly positions the IqUp methodology, with soft CTAs to a separate demo-class booking page.

**Success metrics / KPIs (spec 1.3):** completion rate (started → finished), form conversion (finished → contact left / PDF sent), CTA→demo (reports → demo-class click), and step-by-step drop-off.

---

## 2. Audiences

- **Parents (the buyer and the lead).** They want a real, trustworthy evaluation of their child and reassurance that IqUp is credible. Everything the parent sees is **plain language, no jargon** — never "neuroscience", "executive function", "cognitive domains" (spec Дел 0, Дел 12).
- **Children 5–13 (the test-takers).** It should feel like a game ("puzzle-brain" assembling piece by piece). Ages **5–7** get a parent who helps *technically* (reads, points) but not with the answers; **8+** can do it alone (spec 2.3, 7.4). To the child: only encouragement, never analytics, never times.

---

## 3. Information architecture

Standalone, mobile-first web app on a **subdomain** (e.g. `procena.iqup.mk`), also embeddable for landing pages and Meta ads (spec 2.1). Bilingual now (MK default at `/`, EN at `/en/`); SR/HR added in phase 2. Minimal navigation — this is a funnel.

```
MK (default)                              EN
/                  landing                /en
/test (slug TBD)   the assessment flow    /en/test
/result            on-screen summary       /en/result
/about (slug TBD)  about the test          /en/about
/privacy           privacy + consent      /en/privacy
```

(MK slugs are finalised with the native-Macedonian reviewer; EN mirrors them. Booking is a **separate page, out of scope** — the CTA links there with a `?grad={city}` parameter.)

---

## 4. Main user flow (spec 2.2)

| # | Step | What happens |
|---|---|---|
| 1 | **Landing** | Brand hero, value message, language choice, "Start assessment". |
| 2 | **Setup** | Enter the child's **age (5–13)** — for adaptive calibration — + short instructions. **No child name.** |
| 3 | **Test** | Adaptive sections per domain; silent time measurement; progress = a puzzle-brain assembling. |
| 4 | **Done** | "The test is finished" + a reward for the child (an "IqUp Explorer" badge). |
| 5 | **Form** | Parent first name (no surname), email, phone, city, child gender (optional), consents. Required for the report. |
| 6 | **Confirm** | On-screen result summary + "the report has been emailed". CTA → booking. |
| 7 | **Email** | The PDF report + a CTA to register for a demo class (to the booking page, with the city parameter). |

**Edge cases (spec 2.4):** abandon before the end → no personal data stored (everything is in memory until the form); invalid age (<5 or >13) → clear blocked message; interruption during the test → detect idle/tab-blur and exclude from analysis (Дел 8); retake → a new (procedurally generated) task set, compared locally (Дел 14.2).

---

## 5. The assessment — the centerpiece

### 5.1 Domain model: 8 signals → 5 indices (spec Дел 3)

A two-layer model: the engine measures **8 fine internal signals**; the parent sees **5 clean, plain-named indices**. Precise underneath, understandable on top.

**The 8 internal signals:**

| # | Signal | Measures | Paradigm |
|---|---|---|---|
| 1 | **Gf** · fluid reasoning | logic, patterns, abstraction | Raven's, Matrix Reasoning |
| 2 | **Gv** · visual-spatial | rotation, space | Block Design, Mental Rotation |
| 3 | **Gsm** · working memory | hold + sequence | Digit Span, Corsi |
| 4 | **Gs** · processing speed | fast accurate scanning | Symbol Search |
| 5 | **Attention** (derived) | consistency, omissions, impulsivity | derived from variability + errors (not a separate test) |
| 6 | **EF** · planning | planning, strategy | Tower of London |
| 7 | **Glr** · learning potential | how fast a new rule is learned | KABC Learning, paired-associate |
| 8 | **CT** · computational thinking | sequences, debug, loops, conditionals | Bebras, Code.org |

**The 5 parent-facing indices:**

| Index (what the parent sees) | Composed of |
|---|---|
| **Logical thinking** | Gf |
| **Spatial thinking** | Gv |
| **Memory & focus** | Gsm + derived Attention |
| **Planning & speed** | EF planning + Gs |
| **Learning & STEM thinking** | CT + Glr |

The report has **Part A — Cognitive profile** (indices 1–4) and **Part B — STEM readiness** (index 5). Indices are kept **conceptually clean** — we do not blend Gf/Gv/EF into one index for balance. The uneven number of signals per index (1 vs 2) is handled honestly via **per-domain confidence** (5.5), and the single-signal indices (Gf, Gv) get a few more adaptive items for stability (spec 3.2).

**Deferred to phase 2:** a **verbal** index (depends on language/reading — hard for 5–7 and across 4 languages). v1 is a deliberately **non-verbal, culture-fair** profile; the report says so honestly. A **causal/scientific-reasoning** domain is a phase-2 candidate (spec 20.2). **All tasks are original** within the recognised paradigms — never copied from WISC/Raven's/KABC (spec 3.3 / Прилог H).

### 5.2 Tasks by domain (spec Дел 4 / Прилог A)

All tasks are **digitally auto-scored** (choice, tap, ordering, tap-the-error), **procedurally generated** with a difficulty parameter, **no human and no AI**:

- **Gf** — 2×2/3×3 matrices + number/shape series, choose-from-4.
- **Gv** — mental rotation, spatial odd-one-out (SVG).
- **Gsm** — show-hide-repeat sequence (Corsi); forward for all ages, backward from 8.
- **Gs** — timed search for target symbols (the **only** visible timer); score = (correct − ½·errors)/time.
- **Attention** — derived from time variability + omissions + impulsive errors (no separate test; a real CPT is too long/unreliable on an unsupervised phone and risks mislabelling — spec Дел 4).
- **EF** — Tower of London to a goal state in minimum moves.
- **Glr** — symbol↔symbol pairs over several attempts (recall + learning slope).
- **CT** — sequencing, debug, loop, conditional, maze.

### 5.3 Adaptive engine (spec Дел 5)

Precision comes from being adaptive **per child** (basal/ceiling like WISC), not just per age. Each task has a **level 1–10** per domain; the start level is keyed to age; correct → level up, error → level down; a domain ends at a **ceiling** (e.g. 2 consecutive errors) or a max-item cap. Target **4–6 items per domain**.

**Determinism is non-negotiable:** identical answers → the identical path and result, always (seedable, no randomness in scoring, **no AI at runtime**). Length by age: 5–6 ≈ 8–10 min; 7–9 ≈ 12–14 min; 10–13 ≈ 16–18 min. Norms are calibrated **per exact age** (more precise than broad bands), though some task *formats* deliberately vary by age cluster within that per-year model (e.g. Gsm backward only from 8; parent-assisted mode for 5–7).

### 5.4 Scoring & norming (spec Дел 6)

Raw scores → a **0–100 index per exact age (5…13)** via the age norm; **50 = typical for the age**. Composite indices (configurable weights — Прилог B):

```
Logical          = Gf
Spatial          = Gv
Memory_and_focus = 0.7·Gsm + 0.3·Attention
Planning_speed   = 0.6·EF  + 0.4·Gs
Learning_STEM    = 0.5·CT  + 0.5·Glr
```

**Bands (indicative, for the parent):** 80–100 exceptionally developed for the age · 64–79 strongly developed · 45–63 solid for the age · <45 developing. **Time ≠ penalty** (except Gs): slow+accurate is not weaker; long pauses are excluded; only relative patterns within the same child matter, never absolute ms. **Per-domain confidence** (high/medium/low) accompanies each index, based on item count, answer consistency, and session validity (spec 6.5). **Seed values vs. real norms (6.6):** early results are clearly labelled **indicative reference values**, recalibrated into real norms as the anonymous dataset grows.

### 5.5 Validity, practice & extremes (spec Дел 7)

**Validity flags** (configurable thresholds) prevent a confident profile on garbage data: too-fast responses (RT < ~500ms), same-position bias (>60%), excessive idle gaps, chance-level accuracy, "smearing" the speed game. **Graduated outcomes:** a mild flag → normal report + a soft note; a strong flag → **no confident profile** ("results aren't representative — please retry in a calm moment" + Retry). Flags are stored anonymously (data quality); never shown negatively to the child. **Practice tasks** precede each new task type (an unscored "here's how" example; the first practice task also calibrates the device's baseline tap speed). **Extremes:** a ceiling ("reached the top for this age; room for bigger challenges") and a floor (gently "the tasks were too new for a moment" — never "failed/below average"). **Parent's role 5–7 (7.4):** a hard pre-start rule — help technically, but let the child choose the answer — with a checkbox confirmation and an optional parent-assisted mode (larger text, slower).

### 5.6 Timing (spec Дел 8)

Total and per-task time are captured — raw material for personalisation and the derived attention signal. Per-task → speed-accuracy style; variability → attention; total → drop-off analytics + a fatigue signal. **Silent measurement** (no visible per-task counters except the speed game); idle handling shows a gentle "all good? we're here" prompt (not a penalty, not a timer); times are **never shown to the child** and only relative patterns are used across devices.

### 5.7 Report engine — personalisation without AI (spec Дел 9)

Reports are **personalised, not boilerplate — deterministic, no AI**. The power = rich signals × a large module library × assembly logic. Three layers: **signals** (per task) → **derived features** (profile shape flat/spiky, index pairs, speed-accuracy style, memory asymmetry, ceiling, learning slope) → **module library + assembly** (each combination triggers a module: text + home activities + an IqUp program hook + a **dynamic demo CTA** tied to the child's growth area). The engine picks **top strength + growth area + style module + STEM bridge** → one assembled report; with enough modules, two children rarely get the same one. The **STEM bridge** links spatial + problem-solving to the STEM message **through narrative, not by changing an index formula** (indices stay clean). It describes an observed **solving style** (speed-accuracy, persistence, approach to new tasks) — deliberately **not** a speculative "learning style" (spec 9.5). Module structure, library seed: spec 9.2 / Прилог C.

### 5.8 Output: screen + PDF (spec Дел 10)

After the form: an on-screen confirmation summary (**pentagon + 5 bands + top strength + CTA**). The **PDF report is generated server-side** (deterministically from the scores) and emailed; **the PDF is not stored after sending** (spec 10.1, 14.1). Indices are presented as a **HYBRID**: the **pentagon** (whole picture) + a per-index **bar** + a **word label** (Developing · Solid · Strong · Exceptional) + an indicative range — **no hard number** (no false precision, no comparisons; consistent with "no clinical IQ"). PDF contents (10.3): the 5-index profile (pentagon + band), per-index confidence label, strength + growth area + 2–3 activities, Part B STEM readiness + the coding/robotics bridge, expert IqUp positioning, the demo CTA (with `?grad=` city), and the disclaimer. The PDF should look like a branded "IqUp Cognitive Profile" (puzzle-brain motif, logo palette) to encourage sharing.

### 5.9 Two deliverables

1. **The PDF report** — the professional cognitive profile above, **emailed, not stored**.
2. **A shareable Bibi certificate** — a child-facing, shareable keepsake using existing licensed Bibi art (decision B). **Bibi appears only on the certificate** — never inside the assessment, to protect test validity (the assessment stays a thin, character-free "explorer adventure" skin — spec 18.3).

---

## 6. Profile → IqUp programs (spec Дел 11)

Programs are **by age, not by domain**. Recommendation is three-layered (context for the team, not verbatim in the report): **age → program**; **base vs. PLUS** (strong/upper-age profile → PLUS; more modest/lower-age → base); **profile → message** (expert, plain, tied to strengths/growth areas). Mapping is informed by the IqUp methodology (STEM + coding + inquiry learning), used for accurate positioning, not to describe a class. Examples: Прилог E.

| Age | Base | PLUS |
|---|---|---|
| 5–6 | Мали истражувачи ПЛУС | — |
| 7–9 | Биби и Боби | Биби и Боби ПЛУС (8–10) |
| 10–13 | Оливер (10–12) | Оливер ПЛУС (11–13) |

---

## 7. Tone & copy for parents (spec Дел 12)

Expert and professional **but plain** — like the best educator, not a doctor with a diagnosis. A real picture (strengths *and* growth areas named clearly, no sugar-coating), **no attack** (growth areas are "room to grow", never "weakness/problem/behind"), **no jargon**, a subtle brand through positioning (not lesson narration), **for the parent** (to the child: only encouragement). Two language registers: precise technical terms inside the spec/code; plain, jargon-free language in everything a parent or child sees. Full MK copy: Прилог D.

---

## 8. Design system direction (spec Дел 18)

Bright, colourful, playful, child-appropriate — but crafted to feel **expert, not AI-generated**.

- **Palette (official, from the logo — spec 18.1 / Прилог G):** Magenta `#EC008C` (accent · Logical), Violet `#762D90` (primary action), Blue `#00B6F1` (Spatial), light-blue `#6FD0F6`, Teal `#00B9AD` (Memory & focus), Orange `#F7941D` (Planning & speed), Yellow `#FFC20E` (Learning & STEM), Grey `#999999` (neutral). The 5 indices are colour-coded by brand hue.
- **Type:** **Montserrat** — ExtraBold 800 headings, Bold 700 / SemiBold 600 labels, Regular/Medium 400/500 text. Cyrillic + Latin, free.
- **Signature motif:** the **puzzle-brain** from the logo — the assessment assembles a profile piece by piece; progress = the brain filling in; the pentagon = the assembled, coloured brain.
- **Scales (Прилог G):** spacing 4/8/12/16/24/32px; radius 12–18px on cards, 30px on badges; **≥44px tap targets** for children.
- **Look:** light backgrounds + gradient accents, wavy shapes, rounded badges, illustrated science icons; real photography of IqUp children on landing/report for authenticity; a thin "explorer adventure" theme skin — **no characters, no extra reading, inside the test** (validity is sacred).
- **Off the table:** generic identical cards / shadows-on-everything / emoji-decor / AI-template blandness; dark mode; anxious timers (except the speed game); anything that undercuts the expert, trustworthy feel.
- **Accessibility (18.5, WCAG 2.2 AA):** keyboard + focus-visible; contrast ≥ 4.5:1; never colour-only meaning; large tap targets; `prefers-reduced-motion`. Tokens: Прилог G (landed in code, Phase 3.01).

---

## 9. Tech stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Locale routing; server route(s) for the form, PDF, CAPI, anonymous-score write |
| Language | TypeScript | — |
| Styling | Tailwind CSS v4 | Brand tokens in `globals.css` (`@theme`) — Montserrat + the official palette (Phase 3.01) |
| Components | shadcn/ui (Radix) | Accessible primitives |
| Animation | Framer Motion | Light, kid-friendly; performance-budgeted |
| Icons | Lucide | — |
| Bilingual | next-intl | MK default at `/`, EN at `/en/`, hreflang (SR/HR in phase 2) |
| Assessment compute | **Client-side, deterministic, no AI** | The cognitive maths runs on the client; network only for form, PDF, analytics |
| **PDF report** | **`@react-pdf/renderer`** | Server-side, React-based, custom fonts + embedded SVG (Phase 3.01 decision) |
| **Pentagon chart** | **Custom SVG (no charting library)** | Must render identically on screen and in the PDF, be brand-styled + accessible (Phase 3.01 decision) |
| Content | Structured files in-repo | Task generators, norms, report modules — no CMS (a CMS is phase 3) |
| Anonymous scores | Supabase (EU region) | One table; no PII; never joinable to leads |
| Leads + email + campaigns | Brevo (EU/GDPR) | Stores leads, sends the transactional PDF email, runs city-segmented email/SMS |
| Ad tracking | **Meta CAPI (server-side)** | Server `Lead` on submit; dedup with the Pixel via `event_id` |
| Analytics | GA4 + Microsoft Clarity | Funnel events (Прилог F); consent-gated |
| Hosting | Vercel | Free to build; **Pro before launch** |
| Privacy + cookies | Consent banner + GDPR policy | IqUp legal sign-off |
| Booking | Separate page (out of scope) | CTA links with `?grad={city}` |
| Domain / DNS | Subdomain of iqup.mk | Decided at launch |

**No AI at runtime** — the engine, scoring, and report assembly are all deterministic. This is deliberate: for children's content, predictable, reviewed logic is safer and more defensible than anything generated on the fly.

---

## 10. File & folder structure (v2)

```
iqup-web/
├─ project-instructions.md  AGENTS.md  CLAUDE.md  brand.md
├─ plan.md  phase-plan.md  Decisions.md  README.md
├─ public/{bibi,og}/                    licensed Bibi art (certificate only) · OG images
└─ src/
   ├─ app/[locale]/                     landing · test · result · about · privacy · layout
   ├─ components/                       UI components
   ├─ content/
   │  ├─ tasks/                         the task bank (procedural generators + items)   [scaffolded 3.01]
   │  ├─ norms/                         age norms + scoring weights (seed)              [scaffolded 3.01]
   │  └─ report/                        report module library (copy)                    [scaffolded 3.01]
   ├─ lib/
   │  ├─ engine/                        adaptive basal/ceiling motor                    [scaffolded 3.01]
   │  ├─ scoring/                       raw→index scoring + composites                  (v1 present; rebuilt)
   │  ├─ validity/                      validity flags, timing, derived attention       [scaffolded 3.01]
   │  ├─ report/                        deterministic report assembly (no AI)           [scaffolded 3.01]
   │  ├─ pdf/                           server-side PDF report (@react-pdf/renderer)     [scaffolded 3.01]
   │  ├─ supabase/                      anonymous-scores client                         (present; schema rebuilt)
   │  └─ email/                         Brevo transport (present; mappings rebuilt)
   ├─ messages/                         next-intl strings: mk.json, en.json (+ sr/hr phase 2)
   └─ _project-state/                   current-state.md, file-map.md, 00_stack-and-config.md, reports
```

Carried over from v1 (the bilingual shell, Supabase/Brevo transport, consent layer, certificate render architecture) is detailed in `Part-3-Phase-00-Completion.md`.

---

## 11. Form, leads & integrations (spec Дел 13)

**Form fields:** `parent_first_name` (required, no surname), `email` (required, for the PDF), `phone` (required), `city` (required — routing + segmented campaigns), `child_gender` (optional), `consent_service` (required), `consent_parent` (required), `consent_marketing` (optional). **No child name.** Age is taken at the start. Consents are **separate, none pre-ticked**.

**Integrations:** **Brevo** (EU/GDPR) — store leads, send the transactional PDF email, run email+SMS campaigns by city. **Meta CAPI** — server-side `Lead` on form submit, deduped with the Pixel via `event_id` (server-side is more reliable, blocker-resistant). **GA4** — funnel events (Прилог F). **Booking page** — separate (out of scope); the CTA links there with `?grad={city}`.

---

## 12. Data model & privacy (spec Дел 14)

**Two separate stores that cannot be joined:**

| Store | Contents | Purpose |
|---|---|---|
| **A · Anonymous scores** | age, gender, city, language, the 8 signals + 5 indices, **date only** (no exact time). No name/email/phone. | statistics + norms |
| **B · Leads (Brevo)** | parent name, email, phone, city, gender, consents | report + campaigns |

The **PDF is not stored**. The two stores share **no key** (store A holds only a date, not an exact timestamp) → results stay unlinkable to identity. Progress-over-time is kept **locally on the device** (an anonymous browser profile; the retake seed/identifiers, not the content), so a retake generates a fresh set — no server-side longitudinal profile tied to identity (14.2).

**GDPR (14.3):** consent basis (separate for service vs. marketing); minimisation (no child name, no surname); a defined retention window (e.g. leads → delete after 24 months of inactivity); right to erasure/access; DPAs with Brevo + Meta; the data subject is the parent. **Low risk:** because results are unlinkable to identity, there's no profiling of children for marketing → likely no DPIA needed — but a lawyer approves the policy. EU data region throughout.

---

## 13. Admin panel (spec Дел 15)

IqUp-only, behind a strong login (2FA recommended), roles, access logging. Shows the **contacts** base (name, email, phone, city, age, gender, consents, time) — **no results**; **aggregate** statistics by age/gender/city from the **anonymous** base; filtering/segmentation + CSV export + Brevo sync (marketing export = consented contacts only). **No contact↔result link** by design — filtering a result back to a contact is intentionally unsupported, to keep results anonymous.

---

## 14. Legal & ethical protection (spec Дел 16)

The **"informative, not diagnostic"** line appears in **7 places**: landing footnote, pre-start screen, results screen, the PDF (top + bottom), the email, the "About the test" page, and the cookie banner. **Consents:** required (processing + report + policy), required (parent/guardian), optional (marketing) — separate, none pre-ticked. Privacy policy + Terms linked from the form and footer. Cookie banner is mandatory if GA4/Meta load (separate consent). A data note: "we don't store results linked to personal data." Child protection: constructive framing, never a harmful label. **Marketing guard:** in ads/landing, "assessment of cognitive strengths", **not** "IQ test". A lawyer approves the policy and consents for the MK + EU markets. Copy: Прилог D.

---

## 15. Localization (spec Дел 17)

Languages: **MK · SR · HR · EN**. Visual tasks (Gf, Gv, Gsm, Gs, EF, Glr, CT mazes) are language-neutral → only instructions/UI localise; CT text items are short and localised. QA: symbols/shapes in CT and spatial tasks reviewed for cultural clarity across all 4 markets. Because v1 is largely non-verbal, localisation is light and low-risk — a key reason 4 languages are feasible. **MK ships first (MVP); SR/HR/EN in phase 2.** Externalised strings (i18n), language switch, no RTL.

---

## 16. SEO & sharing

Traffic is paid, so SEO is light: clean titles/descriptions, `sitemap.xml`/`robots.txt`, bilingual **hreflang**. The sharing experience matters more — the landing and the **Bibi certificate** each get a well-designed **Open Graph image** (name-free) so shared links look on-brand and pull IqUp into parents' networks. The PDF itself is the primary shareable artefact.

---

## 17. Analytics events (spec Прилог F)

`test_start` (language) · `age_set` (age) · `section_complete` (domain, ms) · `test_complete` (total_ms) · `form_view` · `lead_submit` (city → Meta `Lead` with `event_id`) · `cta_booking_click` (city, source) · `retest_start`. The booked demo is measured on the (separate) booking page; here we measure `lead_submit` and `cta_booking_click`. All consent-gated and PII-free.

---

## 18. Technical & security (spec Дел 19)

Frontend SPA-style (within Next App Router); **all cognitive compute on the client, deterministic, no AI**. A light backend for: PDF generation, email (Brevo), Meta CAPI, the anonymous-score write. One anonymous-scores table. First load < 2.5s on 4G; procedural stimuli; lazy-load by section. HTTPS/HSTS; input sanitisation + validation; rate-limit + anti-bot on the form; **no API keys on the client** (Brevo/Meta server-side); no PII in analytics/logs. **Versioning (19.4):** the task bank, scoring algorithms, and report templates are versioned, and the version is stored with each anonymous record, so upgrades are tracked and results stay comparable. Environments: dev / staging / production; analytics + Meta off outside production.

---

## 19. Acceptance criteria & phases (spec Дел 20)

**Definition of Done (selected):** the adaptive engine gives a stable score for 4–6 tasks/domain and the same path for the same answers; the 5 indices compute and show **hybrid (pentagon + band, no number)**; the report engine gives visibly different reports for different profiles (5 test-profiles → 5 distinct reports); validity flags + extremes + time rules work; the form validates, sends the PDF, fires `Lead` (Meta) + GA4; only anonymous scores in the DB, PDF not stored, the stores don't join; 4 languages (or MK for MVP); WCAG AA; mobile passes iOS Safari + Android Chrome; a child reward; CTA → booking with `?grad=`.

**Phases (spec 20.2):**
- **Phase 1 · MVP** — MK; the 6 measured domains + CT + derived attention; adaptive + report engine; form; Brevo; anonymous scores; GA4; local progress; admin basics.
- **Phase 2** — SR/HR/EN; the verbal index; a causal-reasoning candidate domain; mature Meta CAPI; A/B; optional teaser.
- **Phase 3** — norm recalibration; a CMS for tasks/modules; SMS campaigns; a longitudinal progress-tracking platform (needs a privacy-model revision — accounts + consent to store children's cognitive data — a deliberate phase-3 decision, not a simple add-on).

**Recommendation (not a blocker):** a one-off offline review of the tasks by a psychologist + a small pilot before public launch.

---

## 20. What IqUp provides (spec Дел 21)

Logo + brand files (vector logo delivered, palette from the logo, Montserrat); class photos for landing/report; the booking-page URL (`{{BOOKING_URL}}`); the list of centres by city (for `city` + routing); Brevo / Meta / GA4 access (API keys, pixel ID, property ID); legal review of the policy + consents; SR/HR/EN translations (phase 2).

---

## 21. Appendices (in the spec)

A — Task bank: algorithms & examples · B — Scoring & norms (seed) · C — Report module library · D — Copy: consents, email, disclaimers · E — Program mapping · F — Analytics events · G — Design tokens · H — Scientific basis per domain (what each signal does **not** mean). The appendices are **turnkey** — the algorithms, formulas, norms, full MK copy, mappings, and tokens to build from.
