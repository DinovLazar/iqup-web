# IqUp-Web — Plan

> The master spec for the finished site. This is **aspirational** — it describes what we're building, not the current state of the code. If this ever disagrees with the live code or `src/_project-state/current-state.md`, **the live code wins**; surface the mismatch to Lazar. The phase-by-phase breakdown lives in `phase-plan.md`.

---

## 1. Goals & success criteria

**Primary goals**
1. **Collect parent leads** — capture the parent's email (plus the child's first name + age + consent) on the way to the results.
2. **Build brand awareness** — give every parent a warm, shareable result and certificate that puts IqUp and the Bibi characters in front of their network.

**"Launched" means:**
- The bilingual site (MK default, EN at `/en/`) is live on a subdomain of iqup.mk.
- All three age-band tests work end-to-end.
- Leads save to Supabase and the results email sends.
- The certificate is generated and shareable.
- Facebook/Instagram ads point at the site; Meta Pixel + GA4 + Clarity fire.
- Cookie consent + privacy policy are live and reviewed by IqUp's side.
- Lighthouse 95+ (mobile + desktop) and WCAG 2.2 AA are met.
- Vercel is on the Pro plan.

---

## 2. About the project

IqUp (the client) runs an in-person after-school STEM program for children aged 3–9 in North Macedonia, with a full existing brand including the licensed "Svetot na Bibi" characters (a Macedonian animated series — existing images only, never redrawn). This site is a **marketing campaign**, not a company website: a free, age-banded "brain games" test for children 3–13, framed with an IQ-test hook but delivering encouraging, strengths-based results. It exists to generate parent leads and spread awareness of IqUp.

---

## 3. Audiences

- **Parents (the buyer and the lead).** They decide whether to give their email and whether to try IqUp. They want reassurance that their child is bright and that IqUp is credible and safe. Voice toward parents: warm, trustworthy, plain — no marketing fluff, no fake urgency.
- **Children 3–13 (the test-takers).** They want it to feel like a game. Voice toward children: playful, friendly, encouraging, age-appropriate. The 3–5 band is parent-assisted; 6–9 mostly solo; 10–13 solo.

---

## 4. Information architecture

Two mirrored locales: Macedonian at `/` (default), English at `/en/`. Minimal navigation — this is a funnel, not a brochure.

```
MK (default)                              EN
/                      landing            /en
/test                  the test flow      /en/test
/result                results + cert     /en/result
/about (MK slug TBD)   about + locations  /en/about
/privacy (MK slug TBD) privacy/consent    /en/privacy
```

(Exact MK slugs are finalized with the native-Macedonian reviewer; the English routes mirror them.)

---

## 5. Pages at launch

1. **Landing / start** — the hook headline, a one-line honest explainer, "how it works" in three steps, the age input that picks the band, and the start button. Light trust cues for parents.
2. **The test flow** — dynamic; renders the right band's questions one at a time, with a progress indicator and friendly transitions.
3. **Email gate** — appears after the last question, before results: parent email + child's first name + child's age + required parental-consent checkbox.
4. **Results + certificate** — the strengths profile on screen, the shareable certificate, and (for 3–5 and 6–9) the free-trial invite with the nearest center.
5. **About IqUp** — a short, trustworthy page about the program, with the list/link of locations.
6. **Privacy / consent** — the privacy policy and consent details (GDPR), reviewed by IqUp's side.
7. **(Optional) shared-certificate view** — a clean page a shared certificate link opens to, reinforcing the brand.

---

## 6. The test — assessment spec (the centerpiece)

**Three age bands**
- **3–5 — parent-led/assisted.** Pictures, matching, odd-one-out, shapes/colors, counting to about 5. Parent reads and taps with the child.
- **6–9 — mostly solo.** Simple patterns, short sequences, basic logic, sorting, light memory.
- **10–13 — solo.** Matrices, number/letter sequences, verbal and numerical reasoning, spatial rotation, working memory.

**Per band:** ~10–15 questions, 5–10 minutes. Every item is **original**, inspired only by general task *types* — never copied from a proprietary test.

**Question format:** a short stem (image and/or short text, image-first for the young bands) with 2–4 tappable options and one best answer. Large tap targets, friendly visuals, Bibi imagery where a suitable existing asset fits.

**Scoring (rule-based, no AI):** each question maps to one or more **strength areas** (e.g. pattern recognition, logical reasoning, memory, spatial thinking, numeracy, observation/verbal). Correct/best answers build up the relevant strengths. **There is no total score and no IQ number.** At the end we compute the child's standout strengths.

**Results = a strengths profile.** A short, warm message naming the child's top strengths (templated copy per strength and band), framed entirely positively — even weaker areas are described as "growing," never as failing or below average. No pass/fail, no ranking, no number.

**Certificate.** Existing Bibi artwork + the child's first name + a line like "completed the IqUp brain games" + their top strengths + IqUp branding. Downloadable (image/PDF) and shareable, bilingual. This is the awareness engine.

**Handoff by band.** 3–5 and 6–9 results invite the parent to a free trial class at their nearest IqUp center; the 10–13 result ends at the strengths profile + certificate (no program for that age).

---

## 7. Design system direction

Firmed up by `brand.md` (phase 1.01) and the two Design phases. Principles:
- **Mobile-first** — ad traffic is overwhelmingly phones.
- **Playful but clean** — bright and friendly for kids, calm and trustworthy for parents.
- **Brand-led** — colors, type, and Bibi imagery come from IqUp's existing brand.
- **Big, obvious controls** — large tap targets and clear progress for young children and parents on phones.
- **Off the table:** dark mode, heavy animations that hurt load time, anything that undercuts the "trustworthy" feel.

---

## 8. Tech stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Locale routing; a server route handles the lead insert |
| Language | TypeScript | — |
| Styling | Tailwind CSS | Brand tokens from `brand.md` |
| Components | shadcn/ui (Radix) | Accessible primitives (dialog, form, progress, radio) |
| Animation | Framer Motion | Light, kid-friendly transitions; budget for performance |
| Icons | Lucide | — |
| Bilingual | next-intl | MK default at `/`, EN at `/en/`, hreflang |
| Content | Structured files in the repo | Question banks + result templates as data; no CMS |
| Lead database | Supabase (EU region) | Leads table; EU region for GDPR |
| Analytics | GA4 + Microsoft Clarity | Behavior + heatmaps/recordings |
| Ad tracking | Meta Pixel | Wired in Part 2, with consent mode |
| Hosting | Vercel | Free to build; **Pro before launch** (commercial) |
| Privacy + cookies | iubenda or Termly | GDPR policy + consent banner; IqUp legal sign-off |
| Email / CRM / booking | Decided in Part 2 | Brevo is the current recommendation for email |
| Domain / DNS | Decided at launch | Subdomain of iqup.mk |

**No AI at launch** — scoring is rule-based and results are templated, which is safer and more predictable for children than AI-generated copy.

---

## 9. File & folder structure

```
iqup-web/
├─ project-instructions.md   AGENTS.md   CLAUDE.md   brand.md
├─ plan.md   phase-plan.md   Decisions.md   README.md
├─ package.json  tsconfig.json  next.config.*  tailwind.config.*   (settled at scaffold)
├─ docs/
│  └─ design-handovers/                 Part-X-Phase-YY-Handover.md
├─ public/
│  ├─ bibi/                             licensed Bibi image assets (from IqUp)
│  └─ og/                               Open Graph share images
└─ src/
   ├─ app/
   │  └─ [locale]/
   │     ├─ page.tsx                    landing
   │     ├─ test/                       the test flow
   │     ├─ result/                     results + certificate
   │     ├─ about/                      about IqUp + locations
   │     ├─ privacy/                    privacy + consent
   │     └─ layout.tsx
   ├─ components/                       UI components
   ├─ content/
   │  ├─ test/                          question banks per band (MK/EN)
   │  └─ results/                       strengths templates (MK/EN)
   ├─ lib/
   │  ├─ supabase/                      client + lead insert
   │  └─ scoring/                       rule-based scoring + strengths mapping
   ├─ messages/                         next-intl strings: mk.json, en.json
   └─ _project-state/
      ├─ current-state.md
      ├─ file-map.md
      ├─ 00_stack-and-config.md
      └─ Part-X-Phase-YY-Completion.md
```

`docs/design-handovers/` and `src/_project-state/` are **reserved** and created in the scaffold phase (1.02).

---

## 10. Integrations

| Integration | What it does | Phase |
|---|---|---|
| Supabase | Stores each lead (email, child first name, age, band, top-strengths summary, consent, locale, timestamp) | Part 1 (1.05, 1.08) |
| Email service | Sends the results + certificate to the parent's inbox; powers follow-ups | Part 2 (2.01, 2.03) |
| CRM / notification | Routes leads to IqUp's tool/lists; alerts IqUp on each new lead | Part 2 (2.02) |
| Meta Pixel | Measures the Facebook/Instagram ads, with consent | Part 2 (2.04) |
| GA4 + Clarity | Behavior analytics + heatmaps/recordings | Part 2 (2.04) |
| Consent + privacy | Cookie-consent banner + GDPR privacy policy | Part 2 (2.04) |
| Trial booking | The mechanic behind the trial CTA (link/form to IqUp) | Part 2 (2.05) |

---

## 11. SEO & sharing

Traffic is paid, so this is light: clean titles/descriptions, a tidy `sitemap.xml` and `robots.txt`, and **bilingual hreflang**. The sharing experience matters more than search rank — the landing page and the certificate each get a well-designed **Open Graph image** so shared links look good and pull the brand into parents' networks.

---

## 12. Bilingual approach

next-intl with **Macedonian as the default** at `/` and **English at `/en/`**. Every line of UI copy, every question, and every result template exists in both languages, kept in `src/messages/` and `src/content/`. hreflang tags on every page. A **native-Macedonian reviewer** checks all copy and all questions before launch (Cowork/client task).

---

## 13. Lead-capture mechanics

- **One capture point:** the email gate, shown after the last question and **before** results.
- **Fields:** parent email, child's first name, child's age (sets the band), required parental-consent checkbox, locale (captured automatically).
- **On submit:** save to Supabase, then reveal the on-screen results + certificate. (In Part 2, the same submit also triggers the results email and any nurture sequence.)
- Part 1 is fully demoable without an email service — the results show on screen and the certificate downloads; emailing a copy is added in Part 2.

---

## 14. Privacy & children's data

- **Data minimization:** we collect only what the funnel needs (above). No surnames, no birth dates, no addresses.
- **Parental consent:** a required, clearly worded consent checkbox; the parent is the account-holder and the one giving the email.
- **EU data:** the Supabase project is in an EU region.
- **Consent + cookies:** GA4 and the Pixel only fire after consent (consent mode + banner).
- **Legal sign-off is IqUp's.** We provide a solid GDPR baseline, but final review of the privacy/consent wording is IqUp's (or their lawyer's) — we are not lawyers.

---

## 15. AI features

None at launch. The test is scored by fixed rules and the results are templated. This is deliberate: for children's content, predictable, reviewed copy is safer and more trustworthy than anything generated on the fly.

---

## 16. Automation

- **Results email** (Part 2): on submit, send the strengths profile + certificate to the parent.
- **Nurture sequence** (Part 2): a short welcome + trial-invite sequence for the 3–5 and 6–9 bands; newsletter handling for those who opt in.
- **Owner notification** (Part 2): alert IqUp on each new lead.
- Part 1 has **no automations** — it captures and stores, nothing more.

---

## 17. Acceptance criteria — "launched"

- [ ] Bilingual site live on the iqup.mk subdomain (MK default, EN at `/en/`)
- [ ] All three band tests work end-to-end on mobile and desktop
- [ ] Lead saves to Supabase; results email sends
- [ ] Certificate generates and shares (download + share buttons; good OG image)
- [ ] Trial CTA works for 3–5 and 6–9; 10–13 ends cleanly at the result
- [ ] GA4, Clarity, and Meta Pixel verified firing (with consent)
- [ ] Cookie consent + privacy policy live and reviewed by IqUp's side
- [ ] Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO (mobile + desktop)
- [ ] WCAG 2.2 AA
- [ ] All copy + questions reviewed by a native-Macedonian speaker
- [ ] Vercel on the Pro plan

---

## 18. Pre-build parallel-track tasks (Cowork-led — start now)

- Gather from IqUp: licensed Bibi image files, logo, brand colors/fonts, the full locations list, their existing email/CRM tool, who controls iqup.mk's DNS, and their preferred trial-booking method.
- Line up a native-Macedonian copy reviewer and IqUp's legal/privacy reviewer.
