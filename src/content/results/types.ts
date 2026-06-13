/**
 * Result / strengths-profile copy types.
 *
 * Source of truth: Phase 1.04 content spec §6 (`docs/content/Part-1-Phase-04-
 * Content-Spec.md`). This module owns the *substantive* parent-/kid-facing result
 * copy; the on-screen chrome (tier labels, buttons, picker labels) lives in the
 * `Result` next-intl namespace, and the six strength names/colours come from
 * `@/content/strengths` (the single taxonomy).
 *
 * HARD RULE (project guardrail + spec §6): no user-facing string here may contain
 * a score, IQ number, percentage, rank, or any deficit ("weak"/"below"/"fail")
 * language. The "growing" tier is always framed as potential. Enforced by
 * `results.test.ts`.
 */
import type {Localized} from '@/content/locale';
import type {StrengthCode} from '@/content/strengths';

/** Per-strength result copy (spec §6A) + the short constellation-badge descriptor. */
export interface StrengthResultBlurb {
  /** §6A celebrated blurb — the warm, parent-facing sentence shown for a top strength. */
  readonly celebrated: Localized;
  /** §6A growing fragment — positive ("blossoming"/"growing"), never a deficit. */
  readonly growing: Localized;
  /** Short descriptor for the celebrated badge in the constellation (1.09 mockup; provisional). */
  readonly short: Localized;
}

export type StrengthResultCopy = Readonly<
  Record<StrengthCode, StrengthResultBlurb>
>;

/**
 * The §6B/§6C wrapper templates, per locale. Slot variables (filled at runtime):
 *  - `{child}`     — child's first name (from the lead context)
 *  - `{top1_name}` `{top2_name}` `{top3_name}` — strength display names
 *  - `{growing_list}` — the remaining display names, joined naturally
 *  - `{center}`    — the chosen IqUp centre (TrialInvite fills this)
 */
export interface ResultTemplates {
  /** §6B kid-facing celebration (all bands — plays first). */
  readonly kidCelebration: string;
  /** §6B parent-facing headline. `{child}` `{top1_name}` `{top2_name}`. */
  readonly headline: string;
  /** §6B "also strong" line. `{top3_name}`. */
  readonly alsoStrong: string;
  /** §6B "growing" line. `{growing_list}`. */
  readonly growingLine: string;
  /** §6B trial CTA (bands 3–5 / 6–9). `{child}` `{center}`. */
  readonly trialCta: string;
  /** §6B closing (band 10–13, no program). `{child}`. */
  readonly closing: string;
  /** §6C certificate body line (kid-facing). `{child}` `{top1_name}` `{top2_name}`. */
  readonly certificate: string;
}
