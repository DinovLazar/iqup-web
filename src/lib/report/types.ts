/**
 * The `ReportContent` output contract (spec Дел 9 / 10.3) — the finished,
 * parent-facing prose for ONE locale that Phase 3.08 designs against and 3.09
 * (results screen) / 3.10 (PDF) render. Produced by `buildReport(profile, ctx)`.
 *
 * HARD RULES held by the assembly + content layers and asserted by the tests:
 *   • NO numbers anywhere — no digit, `%`, "IQ", "score", "rank", "level N".
 *   • Bands appear only as the approved display WORDS; confidence only as the
 *     high/medium/low words + a plain-language note.
 *   • The report addresses the PARENT as "your child" — there is NO child-name
 *     slot anywhere. Copy reads naturally gender-neutral in Macedonian.
 *   • Growth is always kind; ceiling is positive; floor is gentle; the
 *     disclaimer is indicative-not-diagnostic and norms are provisional.
 */
import type {Locale} from '@/content/locale';
import type {ProgramId} from '@/content/report';
import type {Band, Confidence, IndexId, SolvingStyle} from '@/lib/scoring/v2';
import type {ValidityOutcome} from '@/lib/validity';

/** The input context. Age comes from the profile; this carries the rest. */
export interface ReportContext {
  readonly locale: Locale;
  /**
   * The chosen centre's stable slug (from `LeadContextV2.city`, Phase 3.06).
   * Carried into the CTA and the booking-URL `?grad=` seam — never rendered as
   * prose here.
   */
  readonly city: string;
  /**
   * Available for a future gender-agreement pass (spec) — NOT required for the
   * MVP and not relied on. Copy is gender-neutral by default.
   */
  readonly gender?: string;
  /**
   * Caller-supplied generation time (ISO). Truncated to a DAY-level date for
   * `meta.generatedDate`. Supplied by the caller so `buildReport` stays pure and
   * deterministic (the engine never reads the clock). `null`/omitted → no date.
   */
  readonly generatedAt?: string;
}

/** How the session's validity is surfaced to the parent (spec 7.1). */
export interface ValidityTreatment {
  readonly outcome: ValidityOutcome;
  /** A soft note (gentle_note) or a strong caveat (not_representative); else null. */
  readonly note: string | null;
  /** True for `not_representative` — the whole report is the caveated variant.
   *  Whether to SEND it is the caller's decision (3.10), not the engine's. */
  readonly caveated: boolean;
}

export interface ReportMeta {
  readonly age: number;
  readonly locale: Locale;
  readonly normsVersion: string;
  /** Day-level generated date (`YYYY-MM-DD`) or null when the caller omits it. */
  readonly generatedDate: string | null;
  readonly validity: ValidityTreatment;
}

/** One of the five indices, fully resolved to display strings. */
export interface ReportIndex {
  readonly id: IndexId;
  readonly name: string;
  readonly band: Band;
  /** The approved band display WORD (never a number/range). */
  readonly bandLabel: string;
  readonly confidence: Confidence;
  /** The approved confidence display WORD (High / Medium / Low). */
  readonly confidenceLabel: string;
  /** A plain-language sentence about what that confidence means for the reading. */
  readonly confidenceNote: string;
}

/** The standout strength, described as it looks in a child. */
export interface ReportStrength {
  readonly index: IndexId;
  readonly name: string;
  readonly bandLabel: string;
  readonly body: string;
}

/** Which growth framing fired (drives downstream tone). */
export type GrowthVariant = 'standard' | 'all_strong' | 'all_floor';

/** The growth area, framed kindly — never a deficit. */
export interface ReportGrowth {
  readonly index: IndexId;
  readonly name: string;
  readonly variant: GrowthVariant;
  readonly body: string;
  /** A supporting "try this" line (empty for the all-floor variant). */
  readonly activity: string;
}

/** A home activity drawn from the (index, age-cluster) bank. */
export interface ReportActivity {
  readonly index: IndexId;
  readonly title: string;
  readonly body: string;
}

/** Personalised overview lines (profile shape + any strong index pairs). */
export interface ReportOverview {
  readonly shape: string;
  /** Zero or more index-pair narration sentences. */
  readonly pairs: readonly string[];
}

/** The observed solving style + the kindly-framed learning trajectory. */
export interface ReportSolvingStyle {
  readonly style: SolvingStyle;
  readonly body: string;
  /** The learning-trajectory sentence (the Glr slope, framed kindly). */
  readonly learning: string;
}

/** STEM readiness + the narrative bridge to coding / robotics. */
export interface ReportStem {
  readonly body: string;
  readonly bridge: string;
}

/** The IqUp positioning + program-fit + demo CTA. */
export interface ReportIqup {
  readonly positioning: string;
  /** The age→program "natural next step" line (program name filled in). */
  readonly programFit: string;
  readonly programId: ProgramId;
  readonly programName: string;
  readonly demoCta: string;
  /**
   * The chosen centre slug, carried through. The final booking URL
   * (`/booking?grad=${city}`) is built by the rendering surface — see the
   * SEAM comment in `assemble.ts`.
   */
  readonly city: string;
}

/** Optional ceiling / floor extreme notes (null when none fired). */
export interface ReportExtremes {
  readonly ceiling: string | null;
  readonly floor: string | null;
}

export interface ReportDisclaimer {
  readonly body: string;
  readonly provisional: string;
}

/** The finished, parent-facing report for one locale. No numbers anywhere. */
export interface ReportContent {
  readonly meta: ReportMeta;
  readonly indices: readonly ReportIndex[];
  readonly overview: ReportOverview;
  readonly topStrength: ReportStrength;
  readonly growthArea: ReportGrowth;
  readonly homeActivities: readonly ReportActivity[];
  readonly solvingStyle: ReportSolvingStyle;
  readonly stemReadiness: ReportStem;
  readonly extremes: ReportExtremes;
  readonly iqup: ReportIqup;
  readonly disclaimer: ReportDisclaimer;
}
