# Phase 3.09 Audit Report — v2 Results Screen

## 1. ReportContent Contract

### Complete ReportContent Structure

**ReportContent** (top-level contract):
- `meta: ReportMeta`
- `indices: readonly ReportIndex[]` — five indices in canonical order
- `overview: ReportOverview`
- `topStrength: ReportStrength`
- `growthArea: ReportGrowth`
- `homeActivities: readonly ReportActivity[]` — 2–3 activities
- `solvingStyle: ReportSolvingStyle`
- `stemReadiness: ReportStem`
- `extremes: ReportExtremes`
- `iqup: ReportIqup`
- `disclaimer: ReportDisclaimer`

**ReportMeta** (src/lib/report/types.ts:52–59):
- `age: number`
- `locale: Locale`
- `normsVersion: string`
- `generatedDate: string | null` — YYYY-MM-DD or null (never a timestamp; caller-supplied, day-truncated)
- `validity: ValidityTreatment` — **NOT a string**, but a structured object:
  - `outcome: ValidityOutcome` — enum: `'valid' | 'gentle_note' | 'not_representative'`
  - `note: string | null` — soft/strong caveat or null
  - `caveated: boolean` — true ONLY for `not_representative`

**ReportIndex** (src/lib/report/types.ts:62–73):
- `id: IndexId` — the five indices; uses `id` not `code` (cf. kit's `code`)
- `name: string` — display name (e.g. "Logical thinking")
- `band: Band` — stable enum (not a display word)
- `bandLabel: string` — approved display WORD (e.g. "Strongly developed")
- `confidence: Confidence` — enum: `'high' | 'medium' | 'low'`
- `confidenceLabel: string` — approved display WORD (e.g. "High", "Medium", "Low")
- `confidenceNote: string` — one-sentence plain-language confidence note

**NOTE — Missing per-index description:** The handover's index card wants "name + band word + plain description + confidence word + confidence note", but `ReportIndex` has NO per-index description field. The card must decide: should the description line map to `confidenceNote` (which contains guidance), drop the line, or be sourced from a new field? **This is ambiguous in the current contract.** → FLAG

**ReportStrength** (src/lib/report/types.ts:76–81):
- `index: IndexId`
- `name: string`
- `bandLabel: string`
- `body: string` — narrative framing (e.g. "Logical thinking leads — your child…")

**ReportGrowth** (src/lib/report/types.ts:87–94):
- `index: IndexId`
- `name: string`
- `variant: GrowthVariant` — enum: `'standard' | 'all_strong' | 'all_floor'`
- `body: string` — kind framing (never a deficit)
- `activity: string` — supporting "try this" line (empty for `all_floor`)

**ReportActivity** (src/lib/report/types.ts:97–101):
- `index: IndexId`
- `title: string`
- `body: string`

**ReportOverview** (src/lib/report/types.ts:104–108):
- `shape: string` — profile shape prose (flat/spiky)
- `pairs: readonly string[]` — zero or more index-pair narration sentences

**ReportSolvingStyle** (src/lib/report/types.ts:111–116):
- `style: SolvingStyle` — enum: `'reflective_accurate' | 'fast_accurate' | 'fast_errors' | 'balanced'`
- `body: string`
- `learning: string` — learning-trajectory sentence (Glr slope, kindly framed)

**ReportStem** (src/lib/report/types.ts:119–122):
- `body: string`
- `bridge: string` — narrative to coding/robotics

**ReportIqup** (src/lib/report/types.ts:125–138):
- `positioning: string`
- `programFit: string` — age→program "natural next step" line (program name filled in via `{program}` placeholder)
- `programId: ProgramId`
- `programName: string` — display name of the recommended program
- `demoCta: string` — demo CTA copy
- `city: string` — chosen centre slug (used in booking URL as `/booking?grad=${city}`)

**ReportExtremes** (src/lib/report/types.ts:141–144):
- `ceiling: string | null`
- `floor: string | null`

**ReportDisclaimer** (src/lib/report/types.ts:146–149):
- `body: string` — "informative, not diagnostic"
- `provisional: string` — norms caveat

### Surface A ↔ ReportContent Mapping

| Handover Section | ReportContent Field(s) | Notes |
|---|---|---|
| Header (age + date meta) | `meta.age`, `meta.generatedDate` | Renders locale-aware formatted date |
| Pentagon hero + caption | N/A (pure identity graphic) | Identity shape is invariant; never encodes magnitude |
| Five index cards (name + band + description + confidence row) | `indices[i]` (id, name, bandLabel) + **MISSING description** + confidenceLabel + confidenceNote | **FLAG: no per-index description field** |
| "Where your child shines" (top strength callout) | `topStrength` (name, bandLabel, body) | Violet tinted |
| "What we noticed" (overview + solving style) | `overview.shape`, `overview.pairs`, `solvingStyle.body`, `solvingStyle.learning` | Surface-2 panel |
| Validity state (valid / gentle_note / not_representative) | `meta.validity.outcome` + `meta.validity.caveated` | Outcome determines banner state; `caveated=true` → dim pentagon via `dim` param |
| Trial CTA (city) | `iqup.city` | Used to build `/booking?grad=${city}` |
| Certificate entry card | N/A | Link to 3.11 surface |
| Disclaimer | `disclaimer.body`, `disclaimer.provisional` | Small print |

---

## 2. buildReport Signature & Validity Outcomes

**Location:** `src/lib/report/assemble.ts:76–209`

**Signature:**
```typescript
export function buildReport(
  profile: CognitiveProfile,
  context: ReportContext
): ReportContent
```

**ReportContext** (src/lib/report/types.ts:21–40):
```typescript
export interface ReportContext {
  readonly locale: Locale;                  // 'mk' | 'en'
  readonly city: string;                    // stable centre slug
  readonly gender?: string;                 // optional (not used in MVP)
  readonly generatedAt?: string;            // ISO timestamp (caller-supplied; day-truncated to YYYY-MM-DD)
}
```

**ValidityOutcome** (src/lib/validity/types.ts:30–33):
```typescript
export type ValidityOutcome =
  | 'valid'                 // no flags
  | 'gentle_note'           // mild flag(s) → normal report + soft note
  | 'not_representative';   // strong flag(s) → withhold confident profile + retry
```

**Determinism:** Pure + isomorphic. No clock reads; no randomness. Same profile + context → byte-identical output. `generatedAt` is caller-supplied so the engine never reads `new Date()`.

---

## 3. buildProfile Signature & Type Values

**Location:** `src/lib/scoring/v2/profile.ts:36–97`

**Signature:**
```typescript
export function buildProfile(session: SessionRun): CognitiveProfile
```

**Output:** `CognitiveProfile` with:
- `version: 2`
- `session: SessionMeta`
- `signals: Record<Signal, SignalScore>` — 8 signals
- `indices: Record<IndexId, IndexScore>` — 5 indices with value, band, confidence
- `features: DerivedFeatures`
- `validity: ValiditySummary`

**IndexId enum** (src/lib/scoring/v2/types.ts:35–49):
```typescript
export type IndexId =
  | 'logical'        // Gf
  | 'spatial'        // Gv
  | 'memory_focus'   // 0.7·Gsm + 0.3·attention
  | 'planning_speed' // 0.6·EF + 0.4·Gs
  | 'learning_stem'; // 0.5·CT + 0.5·Glr
```

**Band enum** (src/lib/scoring/v2/types.ts:55):
```typescript
export type Band = 'exceptional' | 'strong' | 'solid' | 'developing';
```
(Stable ENUM, NOT display words; band→word mapping happens in `buildReport`)

**Confidence enum** (src/lib/scoring/v2/types.ts:58):
```typescript
export type Confidence = 'high' | 'medium' | 'low';
```

**SolvingStyle enum** (src/lib/scoring/v2/types.ts:91–95):
```typescript
export type SolvingStyle =
  | 'reflective_accurate'  // slower, high accuracy
  | 'fast_accurate'        // fast, high accuracy
  | 'fast_errors'          // fast, more errors (impulsive)
  | 'balanced';
```

---

## 4. ReportFlow Seam Analysis

**Location:** `src/components/report/ReportFlow.tsx` (full 530 lines)

### Key Locations & Patterns:

**HANDOFF (3.09) comment** (line 129–131):
```typescript
// HANDOFF (3.09): the results reveal replaces this interstitial. It will read
// the persisted run (`iqup.assessmentRun.v1`) + `iqup.leadContext.v2` and
// recompute the profile CLIENT-SIDE — no server round-trip, no score in the URL.
```
This marks where the interstitial (currently rendered when `step === 'done'`) will be replaced by the 3.09 results reveal component.

### Client-Side Profile Recomputation:

**Lines 38–44** — Persisted run retrieval (sessionStorage):
```typescript
function readRawHandoff(): string {
  try {
    return window.sessionStorage.getItem(ASSESSMENT_RESULT_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}
```
**Storage key:** `'iqup.assessmentRun.v1'` (from `src/components/assessment/session`, not defined in ReportFlow)

**Lines 75–93** — useSyncExternalStore pattern (SSR-safe):
```typescript
const raw = useSyncExternalStore<string | null>(
  subscribe,  // no-op: persisted run never mutates
  readRawHandoff,  // client snapshot
  () => null   // server snapshot (null during pre-hydration)
);
const profile = useMemo(() => {
  if (!raw) return null;
  try {
    const handoff = JSON.parse(raw) as AssessmentHandoff;
    return buildProfile(handoff.run);  // ← recomputes CognitiveProfile client-side
  } catch {
    return null;
  }
}, [raw]);
```

### Lead Context (v2) Persistence:

**Lines 227–231** — After form submit (on success OR network error):
```typescript
writeLeadContextV2({
  parentFirstName: nextName,
  city,
  submittedAt: new Date().toISOString()  // ← ISO timestamp
});
```
**Storage key:** `'iqup.leadContext.v2'` (from `src/lib/leads/lead-context-v2.ts`)

**LeadContextV2 shape** (src/lib/leads/lead-context-v2.ts:18–25):
```typescript
export type LeadContextV2 = {
  parentFirstName: string;
  city: string;
  submittedAt: string;  // ISO timestamp string
};
```

### Direct-Access Guard:

**Lines 114–121** — Redirect if run is missing:
```typescript
const missing = raw !== null && profile === null;
useEffect(() => {
  if (missing) router.replace('/test');
}, [missing, router]);
```
Pre-hydration (`raw === null`) → do nothing. Resolved but absent/corrupt (`raw` set, profile null) → redirect to assessment.

### Interstitial Rendering:

**Lines 128–142** — Minimal interstitial:
```typescript
if (step === 'done') {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 py-10 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-secondary-tint">
        <Sparkles className="size-8 text-secondary-ink" aria-hidden />
      </span>
      <h1 className="font-brand text-2xl font-extrabold text-balance text-ink">
        {copy.interstitial.title}
      </h1>
      <p className="text-pretty text-ink-soft">{copy.interstitial.body}</p>
    </div>
  );
}
```
**This is where 3.09 replaces with the full results reveal.**

### Locale Handling:

**Line 72** — Locale passed as prop from server:
```typescript
export function ReportFlow({locale, copy}: {locale: Locale; copy: FormCopy})
```
**Server-side locale resolution** happens in `/report/page.tsx` (Phase 3.06).

---

## 5. Surface A — Handover Document & Mocks

**Location:** `docs/design-handovers/Part-3-Phase-08-Handover.md` (§1–2)

### Section Order (1–9):

1. **Header** — IqUp wordmark + MK/EN toggle + title + age + generated date (soft `--band-1` wave)
2. **Pentagon hero** — identity shape + one caption line (colour/area, not score)
3. **Five index cards** — in `meta.indices` order (logical, spatial, memory, planning, learning)
4. **Top strength callout** — "Where your child shines" (violet tint)
5. **Overview + solving style** — "What we noticed" (surface-2 panel)
6. **Report emailed confirmation** — success-tinted strip
7. **Trial CTA** — "Book a free trial class" (carries `iqup.city`)
8. **Certificate entry** — tappable card to Surface C
9. **Disclaimer footnote** — small "informative, not diagnostic"

### Identity Pentagon Geometry

**API:** `identityPentagon(opts)` (src/doc/report-kit.js:72–130)

**Parameters:**
- `size?: number` — px (default 320; square viewBox 410×360)
- `lang?: 'mk' | 'en'` (default 'mk')
- `labels?: boolean` (default true)
- `dim?: string[]` — array of index codes to render at low saturation (only for `not_representative`)

**Geometry Constants (viewBox 410×360):**
- Center: `cx=205`, `cy=176`
- Radius: `R=110`
- Five vertex angles (from -90°, clockwise): `-90° / -18° / 54° / 126° / 198°`

**Visual construction:**
- Five kites: one per index, filled with that index's hue
- White seams (6px stroke) from centre to each vertex
- Ink outline (3.5px, `--ink-head`) around the pentagon
- Vertex labels: index short-name (optional, lang-specific)
- `dim` state: affected kites rendered at `opacity: 0.32` (rest at `1`)

**A11y:** `aria-label` ("five areas, one whole shape"); colour never sole carrier (words on cards provide meaning).

### Index Mapping (kit CODES → IndexId)

**report-kit.js INDEXES** (lines 30–41):
```javascript
[
  { code: 'logic',    label: {mk, en}, short: {mk, en}, angle: -90 },
  { code: 'spatial',  label: {mk, en}, short: {mk, en}, angle: -18 },
  { code: 'memory',   label: {mk, en}, short: {mk, en}, angle: 54 },
  { code: 'planning', label: {mk, en}, short: {mk, en}, angle: 126 },
  { code: 'learning', label: {mk, en}, short: {mk, en}, angle: 198 }
]
```

**ReportContent IndexId** (src/lib/scoring/v2/types.ts:35–49):
```typescript
'logical' | 'spatial' | 'memory_focus' | 'planning_speed' | 'learning_stem'
```

**MAPPING:**
| kit code | IndexId | Pentagon angle | Hue |
|---|---|---|---|
| `logic` | `logical` | -90° (top) | `--ix-logic` (#EC008C magenta) |
| `spatial` | `spatial` | -18° | `--ix-spatial` (#00B6F1 blue) |
| `memory` | `memory_focus` | 54° | `--ix-memory` (#00B9AD teal) |
| `planning` | `planning_speed` | 126° | `--ix-planning` (#F7941D orange) |
| `learning` | `learning_stem` | 198° (bottom) | `--ix-learning` (#FFC20E yellow) |

**FLAG — Code mismatch:** Kit uses short forms (`logic`, `memory`, `planning`, `learning`); IndexId uses full forms (`logical`, `memory_focus`, `planning_speed`, `learning_stem`). The mapping must be exact in the rendering surface.

### Validity-State Treatments

**Valid** (default):
- No banner
- Pentagon at full saturation
- Five cards render normally

**Gentle note** (reserved for quieter inline treatment):
- Soft note (not showing as banner in current mock; builder wires it)
- Pentagon at full saturation
- Cards render normally

**Not representative** (strong flag):
- Soft **amber banner** above cards: "This may not have been the calmest attempt — try again"
- Pentagon dimmed: all five wedges at `opacity: 0.32`
- Same overall shape size (identity, not magnitude)
- Cards render normally
- **Never alarming; profile still renders**

---

## 6. Tokens — Existing vs. Required

### Existing Tokens in globals.css (src/app/globals.css)

**Index hues (primitives):**
- `--iq-magenta` (#EC008C)
- `--iq-blue` (#00B6F1)
- `--iq-teal` (#00B9AD)
- `--iq-orange` (#F7941D)
- `--iq-yellow` (#FFC20E)

**Index aliases:**
- `--index-logical`, `--index-spatial`, `--index-memory`, `--index-planning`, `--index-learning`

**Action (violet):**
- `--iq-violet` (#762D90)
- `--hero`, `--hero-strong`, `--hero-tint`, `--hero-ink`
- `--secondary`, `--secondary-tint`, `--secondary-ink`

**Ink tokens:**
- `--ink`, `--ink-soft`, `--ink-faint`

**Spacing:**
- `--space-1` through `--space-8` (4px–32px)
- `--tap-min` (44px)

**Radius:**
- `--radius-card`, `--radius-card-lg`, `--radius-badge`

**Motion:**
- `--ease-out`, `--ease-spring`

### Missing Tokens (needed for 3.09)

From `docs/design-handovers/assessment/tokens-v2.css`:

**Index ramps (soft/tint/ink variants):**
```
--ix-logic-soft, --ix-logic-tint, --ix-logic-ink
--ix-spatial-soft, --ix-spatial-tint, --ix-spatial-ink
--ix-memory-soft, --ix-memory-tint, --ix-memory-ink
--ix-planning-soft, --ix-planning-tint, --ix-planning-ink
--ix-learning-soft, --ix-learning-tint, --ix-learning-ink
```

**Action ramps:**
```
--action-hover, --action-tint, --action-ink, --action-soft
```

**Additional surfaces & semantics:**
```
--band-1, --band-2, --band-3 (wave-band tints)
--surface-2 (off-white inner panels)
--ink-head, --ink-muted (additional ink levels)
--neutral (borders / disabled)
--line, --line-strong (dividers)
--field (input fill)
--success, --success-tint, --success-ink
--warning, --warning-tint, --warning-ink
```

**Radius:**
```
--r-sm, --r-md, --r-lg, --r-xl, --r-badge, --r-pill
```

**Motion:**
```
--dur-fast (should map to 140ms from tokens-v2.css line 114)
```

**Tap target:**
```
--tap-comfort (56px)
```

**Mood system:**
```
--mood-display, --mood-sub, --mood-body, --mood-gap, --mood-pad (Insight mood specifically)
```

### ADD-LIST for globals.css

Insert these into `:root` after the v2 primitives block (after line 91):

```css
  /* ---- Index hue ramps (full -soft/-tint/-ink for each) ---- */
  --ix-logic:        #EC008C;
  --ix-logic-soft:   #F47CC2;
  --ix-logic-tint:   #FBDDEF;
  --ix-logic-ink:    #A8005E;

  --ix-spatial:      #00B6F1;
  --ix-spatial-soft: #74D2F7;
  --ix-spatial-tint: #DAF1FC;
  --ix-spatial-ink:  #0A6A8C;

  --ix-memory:       #00B9AD;
  --ix-memory-soft:  #6FD3CC;
  --ix-memory-tint:  #D9F3F0;
  --ix-memory-ink:   #07655E;

  --ix-planning:     #F7941D;
  --ix-planning-soft:#FBC07A;
  --ix-planning-tint:#FDEBD3;
  --ix-planning-ink: #97550A;

  --ix-learning:     #FFC20E;
  --ix-learning-soft:#FFDD78;
  --ix-learning-tint:#FFF2CC;
  --ix-learning-ink: #806100;

  /* ---- Action ramps (violet + variants) ---- */
  --action:          #762D90;
  --action-hover:    #5E2274;
  --action-tint:     #EFE4F4;
  --action-ink:      #5E2274;
  --action-soft:     #B98FCB;

  /* ---- Ink levels ---- */
  --ink-head:        #3B4757;
  --ink-muted:       #5A6675;

  /* ---- Surfaces (wave-band tints) ---- */
  --band-1:          #F0F8FB;
  --band-2:          #EAF5F7;
  --band-3:          #FAFCFC;
  --surface-2:       #FAFCFC;

  /* ---- Lines & structure ---- */
  --neutral:         #999999;
  --line:            #ECEFF2;
  --line-strong:     #D8DEE4;
  --field:           #F4F7F9;

  /* ---- Status (success, warning already exist; ensure present) ---- */
  /* (Success/warning/error already in globals.css; verify they match tokens-v2.css) */

  /* ---- Radius scale additions ---- */
  --r-sm:            10px;
  --r-md:            12px;
  --r-lg:            18px;
  --r-xl:            26px;
  --r-pill:          999px;

  /* ---- Motion/duration ---- */
  --dur-fast:        140ms;
  --dur-base:        240ms;

  /* ---- Tap targets ---- */
  --tap-comfort:     56px;

  /* ---- Elevation (shadows for floated elements) ---- */
  --elev-raise:      0 6px 20px rgba(33, 37, 41, 0.08);
  --elev-cta:        0 8px 22px rgba(118, 45, 144, 0.26);

  /* ---- Focus ring ---- */
  --focus:           #762D90;
  --focus-ring:      0 0 0 3px rgba(118, 45, 144, 0.45);
```

**NOTE:** Exact values from `docs/design-handovers/assessment/tokens-v2.css` (lines 26–105). Where an official v2 primitive exists (e.g., `--iq-magenta` → map to `--ix-logic`), use the alias. For entirely new ramp tokens (soft/tint/ink variants), copy the literal hex from tokens-v2.css.

---

## 7. CTA & Centre Helpers

### Email URL Helpers

**Location:** `src/lib/email/site-url.ts`

**siteUrlFor(locale: Locale): string**
- Returns locale-prefixed site base: `${baseUrl}/en` for EN, `${baseUrl}` for MK
- Base from `process.env.NEXT_PUBLIC_SITE_URL` (or `http://localhost:3000` if unset)

**trialBookingUrl(locale: Locale, utmCampaign?: string): string**
- Returns `/trial` or `/en/trial` + optional Brevo UTM tags
- When `utmCampaign` given: appends `utm_source=brevo`, `utm_medium=email`, `utm_campaign={value}`
- **For 3.09 on-screen CTA:** omit the campaign (no UTM)
- **SEAM (3.09):** Results screen builds `/booking?grad=${city}` at render time; engine only carries `city`

### Centre Structure & Mapping

**Location:** `src/content/centers.ts`

**Center interface** (lines 18–44):
```typescript
export interface Center {
  readonly id: string;              // stable slug: 'aerodrom', 'karpos', 'veles', …
  readonly city: Localized;          // {mk, en} for picker
  readonly name: Localized;          // full name (e.g. "IQ UP! Аеродром – Скопје")
  readonly address: string;          // Macedonian street address
  readonly phone: string;            // public phone
  readonly email: string;            // city-specific @iqup.mk
  readonly contact: string;          // local contact name
  readonly mapsUrl: string;          // Google Maps place link (empty until verified)
  readonly viber?: string;           // optional E.164 number
  readonly whatsapp?: string;        // optional E.164 number
  readonly verify?: string;          // optional verification note
}
```

**10 Centres:**
1. `aerodrom` — Skopje – Aerodrom
2. `karpos` — Skopje – Karpoš
3. `veles` — Veles
4. `stip` — Štip
5. `ohrid` — Ohrid
6. `kicevo` — Kičevo
7. `kavadarci` — Kavadarci
8. `prilep` — Prilep
9. `gevgelija` — Gevgelija
10. `strumica` — Strumica

**Stable key field:** `id` (not a numeric index; used as dropdown value and in `?grad=` seam)

**City slug mapping:** `city` field maps to choice in form (Phase 3.06); persisted to `LeadContextV2.city` and used in booking URL.

### New Helper for 3.09

**Signature needed (not yet in site-url.ts):**
```typescript
export function bookingUrlFor(locale: Locale, cityKey: string): string {
  return `${siteUrlFor(locale)}/booking?grad=${cityKey}`;
}
```
(The engine carries `city`, surface appends it; this helper centralizes the `?grad=` seam.)

---

## 8. i18n Structure & Namespaces

**Location:** `src/messages/` (mk.json, en.json)

**Structure:** Nested JSON; leaf keys → strings. Parity test in `messages.test.ts` enforces:
- Exact same set of keys in both locales
- Same placeholders per key (e.g., `{program}`, `{index}`)
- No empty strings
- No forbidden tokens (iq, score, rank, %) in specific namespaces

**Existing namespaces** (from messages.test.ts checks):
- `Gate` — email gate (Phase 2.01)
- `Result` — results screen chrome (Phase 1.10 v1)
- `Email` — results email (Phase 2.01)
- `Consent` — consent banner/manage (Phase 2.04)
- `Privacy` — privacy policy (Phase 2.04)
- `Trial` — trial booking page (Phase 2.05)
- `Form` — parent report form (Phase 3.06) — **tested for no child-name & no forbidden tokens**
- `A11y` — accessibility strings (generic)

**How a client island consumes translations:**
- Server resolves copy: `const t = await getTranslations({locale, namespace: 'Form'})`
- Passes resolved strings as props to client island (e.g., `<ReportFlow copy={copy} />`)
- Island is **i18n-runtime free**; only receives pre-resolved strings

**For 3.09 Results screen**, add new namespaces (e.g., `Results` or expand `Result` with v2 fields):
- Pentagon caption + card labels
- Validity banner text (not_representative)
- Trial CTA copy
- Disclaimer
- Any other rendered chrome

**Parity maintenance:** Add test in `messages.test.ts` to verify all 3.09 keys are present in both locales.

---

## 9. Forbidden-Token Test Pattern

**Location:** `src/lib/report/report.test.ts` (lines 142–217)

**Scan pattern (EN + MK):**
```typescript
const FORBIDDEN_EN =
  /\b(scores?|iq|ranked|ranking|rank|percent|percentile|points?|grades?|weak|weaker|weakness|fail|failed|failure|below\s+average|deficits?)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен|просек)/i;
```

**Non-vacuous test:** The test verifies the regex fires on a bad sample before applying it:
```typescript
expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);
```

**Applied to:**
1. All parent-facing prose (indices, overview, strengths, growth, activities, style, STEM, extremes, IqUp, disclaimer)
2. Collected via `collectProse(report)` (lines 125–140)
3. Also checked: no digits (`/\d/`), no `%`

**For 3.09 extension:**
- Collect all rendered strings on the results screen (chrome + ReportContent prose)
- Apply the same FORBIDDEN_EN/MK + digit/% checks
- Add test case: `no numbers or forbidden tokens on the rendered results screen`

---

## 10. v1 Code to Avoid (Orphaned)

**v1 Result Page & Components (DO NOT TOUCH):**
- `/src/app/[locale]/result/page.tsx` — v1 results page (Phase 1.10)
  - Mounted at `/result` (stays for backward compatibility)
  - Reads v1 `TestResult` from sessionStorage
  - Renders via `ResultView` (v1)
  - Will be deprecated when 3.09 is live

**v1 Result Components:**
- `/src/components/result/ResultView.tsx` — v1 island
- `/src/components/result/ResultHero.tsx`
- `/src/components/result/StrengthsConstellation.tsx` — v1 constellation (5-spoke radar)
- `/src/components/result/CertificateCard.tsx`
- `/src/components/result/TrialInvite.tsx`
- `/src/components/result/ParentNote.tsx`
- `/src/components/result/CuriousMindEnding.tsx`

**v1 Email Gate (Phase 2.01):**
- `/src/components/gate/EmailGate.tsx` — deprecated email-required gate

**v1 Strength Tokens & Copy:**
- `/src/content/strengths.ts` — v1 six-strength model (unused in v2)

**Why avoid:** v1 uses a different data model (six strengths, radar chart encoding magnitude). v2 is orthogonal. Do not refactor or reuse v1 components.

---

## BUILD-CRITICAL FLAGS

1. **Field-name mismatch — IndexId in ReportIndex:**
   - ReportIndex uses `id` field (e.g., `'logical'`)
   - Handover kit uses `code` field (e.g., `'logic'`)
   - Mapping: `logic↔logical`, `spatial↔spatial`, `memory↔memory_focus`, `planning↔planning_speed`, `learning↔learning_stem`
   - **Must ensure surface correctly maps between them.**

2. **Missing per-index description in ReportIndex:**
   - Handover wants "name + band word + description + confidence"
   - ReportIndex has NO description field; only `name`, `bandLabel`, `confidenceLabel`, `confidenceNote`
   - **Decide:** Should card drop the description line, use `confidenceNote`, or add a new field?
   - **This ambiguity blocks clear surface implementation.**

3. **ValidityTreatment is an object, not a string:**
   - `meta.validity` is a structured `ValidityTreatment {outcome, note, caveated}`
   - Surface must read `outcome` to determine UI state (valid/gentle_note/not_representative)
   - `caveated: true` triggers pentagon dimming (`dim` param with all five codes)
   - **Do not flatten to a string.**

4. **Token ADD-LIST must be inserted to globals.css:**
   - Index ramps (soft/tint/ink) — 15 tokens
   - Action ramps — 4 tokens
   - Surfaces & semantics — 10+ tokens
   - Motion/radius/tap — 6+ tokens
   - **Without these, index cards, pentagon, validity states, and CTA styling have no colour/spacing/motion reference.**

5. **Determinism — no Date/Math.random in render:**
   - `generatedDate` is day-truncated by engine; surface must never call `new Date()` or re-derive it
   - Profile recomputed client-side from persisted run; same run → byte-identical profile
   - Pentagon is identity-only; no per-child variation
   - **Render must be deterministic and reproducible.**

---

**Audit complete.** Phase 3.09 builder has all contracts, types, mapping tables, token lists, and critical caveats to implement the on-screen results reveal.
