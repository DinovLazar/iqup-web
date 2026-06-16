# Follow-up nurture emails — Part 2 · Phase 2.03 (hand-off to the Cowork half)

This folder holds the **eight rendered, Brevo-ready HTML email templates** for the
automated follow-up ("nurture") sequence that runs on the **marketing list** — the
list a lead joins **only** when they ticked the marketing opt-in (the 2.02 consent
gate). The **Code half (2.03)** authored + rendered these; the **Cowork half**
builds and stages the automation in Brevo from this README.

> **The automation stays PAUSED until launch.** Build it, load these templates,
> wire the branches, but do not switch it live until IqUp signs off (copy, legal
> footer, sender, domain). See "Before you go live" at the end.

These emails are **brand-and-text only — they do NOT attach the certificate**
(that is only the one-time 2.01 results email). They reuse the 2.01 results-email
brand and layout, so they feel like the same family.

---

## 1. The files → which email is which

Four templates, each in Macedonian (`.mk`) and English (`.en`):

| File | Email | Track | Sent at |
|---|---|---|---|
| `welcome-trial.mk.html` / `welcome-trial.en.html` | **Welcome (trial)** | Trial (age ≤ 9) | ~Day 1 |
| `trial-invite.mk.html` / `trial-invite.en.html` | **Trial invite** | Trial (age ≤ 9) | ~Day 3 |
| `nudge.mk.html` / `nudge.en.html` | **Nudge** | Trial (age ≤ 9) | ~Day 7 |
| `welcome-general.mk.html` / `welcome-general.en.html` | **Welcome (general)** | General (age ≥ 10) | ~Day 1 (then ends) |

To re-generate them after a copy change: `npm run emails:nurture` (writes all eight
here). Brevo **auto-generates the plain-text version** from the HTML — you do not
need to author or paste a text part.

---

## 2. Subject line + preview (pre-header) text

Paste these into each Brevo email's **Subject** and **Preview text** fields (the
preview text is also embedded in the HTML as a hidden pre-header, but Brevo's field
is what most inboxes show).

### welcome-trial
- **EN** — Subject: `Welcome to the IqUp family` · Preview: `Your child’s strengths are in your inbox — and a free trial class is waiting.`
- **MK** — Subject: `Добредојдовте во семејството на IqUp` · Preview: `Силните страни на вашето дете се во вашето сандаче — а ве чека и бесплатен пробен час.`

### welcome-general
- **EN** — Subject: `Welcome to the IqUp family` · Preview: `Your child’s strengths are in your inbox — and there’s more to come.`
- **MK** — Subject: `Добредојдовте во семејството на IqUp` · Preview: `Силните страни на вашето дете се во вашето сандаче — а следува и повеќе.`

### trial-invite
- **EN** — Subject: `What an IqUp class feels like` · Preview: `A story, hands-on discovery, and something your child creates — come and see.`
- **MK** — Subject: `Како изгледа еден час во IqUp` · Preview: `Приказна, истражување со раце и нешто што вашето дете го создава — дојдете да видите.`

### nudge
- **EN** — Subject: `Whenever you’re ready` · Preview: `No rush — your child’s free trial class is still here for you.`
- **MK** — Subject: `Секогаш кога сте подготвени` · Preview: `Без брзање — бесплатниот пробен час за вашето дете сè уште ве чека.`

---

## 3. The Brevo automation — trigger + branch conditions (exact)

### Entry trigger
- **A contact is ADDED to the marketing list** → `BREVO_MARKETING_LIST_ID`
  (the list 2.02 fills **only** on `marketing_opt_in === true`).
- **NEVER** trigger from the operational "all leads" list (`BREVO_LEADS_LIST_ID`).
  That list exists for IqUp's own operational visibility, not marketing — a lead
  who did not opt in is on it but must **never** receive these emails. This is the
  consent boundary flagged for IqUp legal (decisions #27 / #96).

### Branch conditions
The sequence branches on two contact attributes Brevo already stores (2.02). **No
new attribute is needed.**

1. **Trial eligibility — branch on `CHILD_AGE`:**
   - `CHILD_AGE` **is at most `9`** → **Trial track** (welcome-trial → trial-invite → nudge).
   - else (`CHILD_AGE` **is `10` or more**) → **General track** (welcome-general, then ends).
   - The child's age is used **only** as this branch condition — it is **never shown** in any email.
2. **Language — branch on `LOCALE`:**
   - `LOCALE` **equals `mk`** → send the `.mk.html` template.
   - `LOCALE` **equals `en`** → send the `.en.html` template.

### Workflow shape (plain steps)

```
Trigger: contact added to the marketing list (BREVO_MARKETING_LIST_ID)
  │
  ├─ wait ~1 day
  │
  ├─ IF CHILD_AGE ≤ 9  ── TRIAL TRACK ───────────────────────────────
  │     • send Welcome (trial)      → welcome-trial.{mk|en}.html
  │     • wait until ~Day 3
  │     • send Trial invite         → trial-invite.{mk|en}.html
  │     • wait until ~Day 7
  │     • send Nudge                → nudge.{mk|en}.html
  │     • end
  │
  └─ ELSE (CHILD_AGE ≥ 10) ── GENERAL TRACK ─────────────────────────
        • send Welcome (general)    → welcome-general.{mk|en}.html
        • end   (no trial CTA; these contacts simply stay on the marketing list
                 for future general sends — no separate newsletter is built yet)
```

Within each "send" step, pick the `.mk` or `.en` file by the `LOCALE` branch above.
The day offsets (~1 / ~3 / ~7) are the intended cadence — adjust to taste, but keep
the order and the "gentle, no-pressure" spacing.

---

## 4. Personalization (merge tags — already in the HTML)

The templates are personalized **only** by Brevo merge tags, filled by Brevo at
send time. Nothing is hard-coded and **no new data is needed** — only attributes
2.02 already stores:

- **Child's first name:** `{{ contact.CHILD_FIRST_NAME | default: "your child" }}`
  (EN) / `… | default: "вашето дете" }}` (MK). The `default:` filter is a **graceful
  empty-name fallback** — an absent name reads naturally ("…with your child."), never
  "Hi ,". Confirm these attribute names exist in Brevo (2.02 already requires them).
- The child's **age** and **locale** are used **only** as the branch conditions above
  — never rendered.

---

## 5. Links — UTM tags, the trial CTA, and the update notes

- **Every outbound link is UTM-tagged** so 2.04's GA4 can attribute nurture-driven
  visits: `utm_source=brevo`, `utm_medium=email`, and a **per-email** `utm_campaign`:
  | Email | `utm_campaign` |
  |---|---|
  | welcome-trial | `nurture-welcome-trial` |
  | welcome-general | `nurture-welcome-general` |
  | trial-invite | `nurture-trial-invite` |
  | nudge | `nurture-nudge` |
- **Trial CTA** ("Find your nearest centre" / "Најдете го најблискиот центар") is the
  same target the **2.01 results email's trial CTA** uses (the site, via the shared
  `siteUrlFor` seam) — kept identical so both update together. It appears in
  **welcome-trial / trial-invite / nudge**; **welcome-general has NO trial CTA** (just
  a quiet "Explore the world of IqUp" link).
- **The link host is baked from `NEXT_PUBLIC_SITE_URL`** at render time (same source
  as 2.01). If it was unset when these were rendered, the links currently point at the
  dev placeholder `http://localhost:3000`.
  - **2.06 (domain):** once the production domain + `NEXT_PUBLIC_SITE_URL` are final,
    **re-run `npm run emails:nurture`** and reload the templates so the links are real
    (or confirm/replace the link host directly in Brevo). **Confirm the link before
    going live.**
  - **2.05 (booking):** when the real trial-booking flow lands, the trial CTA should
    point at it. It is behind a `// TODO(booking 2.05)` seam in
    `src/emails/nurture/links.ts` (and the shared `src/lib/email/site-url.ts`) — update
    there and re-render, and the 2.01 email + these nurture emails update **in one place**.

---

## 6. Sender + unsubscribe + legal footer

- **Sender:** use the available **staging sender** for now (the same Brevo sender 2.01
  uses, from `EMAIL_FROM_ADDRESS`). The branded **`@iqup.mk` sender + SPF/DKIM/DMARC**
  is set up in **2.06** — switch to it before launch.
- **Unsubscribe:** every footer carries Brevo's `{{ unsubscribe }}` tag. Make sure the
  list/automation has a working unsubscribe configured so the tag resolves. Marketing
  email **legally requires** a working unsubscribe.
- **Legal sender identity + postal address** (in every footer):
  `IKUP d.o.o. · Todor Aleksandrov No. 4 · 1000 Skopje, North Macedonia`
  (MK localizes the street/city). This line + the marketing wording is **provisional,
  flagged for IqUp legal** (tied to the consent version) — confirm before go-live.

---

## 7. Before you go live (checklist for Cowork / IqUp)

- [ ] Marketing list exists and `BREVO_MARKETING_LIST_ID` points at it (2.02). The
      automation triggers from **this** list only.
- [ ] `CHILD_AGE` (number), `LOCALE` (text), `CHILD_FIRST_NAME` (text) attributes
      exist on contacts (2.02 already requires these).
- [ ] All eight templates loaded; subjects + preview text set (§2); plain-text left to
      Brevo's auto-generation.
- [ ] Branches wired exactly as §3 (age ≤ 9 split; `mk`/`en` split); cadence ~1 / ~3 / ~7 days.
- [ ] Links confirmed (2.06 domain) and pointed at the real booking flow (2.05) when ready.
- [ ] Branded `@iqup.mk` sender + SPF/DKIM/DMARC (2.06); working unsubscribe configured.
- [ ] **MK copy reviewed by a native speaker; footer/legal + marketing wording signed
      off by IqUp legal.** (All MK in these templates is provisional; EN mirrors it.)
- [ ] Send a test of each email to an inbox you own; confirm Cyrillic renders, the
      name merge tag + its fallback work, the unsubscribe + address show, and the trial
      CTA appears only in the trial-track emails.
- [ ] Only then un-pause the automation.
