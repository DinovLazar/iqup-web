/**
 * Scoring types — the `TestResult` hand-off contract consumed by Phase 1.08
 * (email gate) and Phase 1.10 (results screen + certificate).
 *
 * Hard invariant (project rule + spec §3): there is **no total score and no IQ
 * number** anywhere in this contract. The only numbers are per-strength tallies
 * and a per-strength ratio (each strength judged on its own questions). Nothing
 * aggregates the strengths into a single figure.
 */
import type {BandKey} from '@/lib/bands';
import type {Locale} from '@/content/locale';
import type {StrengthCode} from '@/content/strengths';

/** A child's answers: question id → chosen option id. Missing = unanswered. */
export type Answers = Record<string, string | undefined>;

/**
 * Result tier for a strength, derived purely from its rank (spec §3):
 *  - `celebrated` — ranks #1 and #2 (the headline strengths)
 *  - `also`       — rank #3 ("also strong")
 *  - `growing`    — ranks #4–#6 (framed as "growing", never "weak")
 */
export type Tier = 'celebrated' | 'also' | 'growing';

/** Per-strength outcome — judged on that strength's own questions. */
export interface StrengthScore {
  code: StrengthCode;
  /** Questions in this band that feed this strength. */
  total: number;
  /** How many of those were answered correctly. */
  hits: number;
  /** hits / total, a value in [0, 1]. Per-strength only — never an overall. */
  ratio: number;
  /** 1 (strongest) … 6, fully deterministic via the fixed tie-break. */
  rank: number;
  tier: Tier;
}

/**
 * The full, typed result handed to the next phases.
 *
 * `strengths` is ordered by rank (index 0 = rank #1). `top1/top2/top3` and
 * `growing` are convenience projections of that ranking by strength code.
 */
export interface TestResult {
  /** Schema version — bumped if the contract changes (sessionStorage key too). */
  version: 1;
  band: BandKey;
  locale: Locale;
  /** All six strengths, ranked strongest → weakest. */
  strengths: StrengthScore[];
  /** Rank #1 and #2 — the celebrated headline strengths. */
  top1: StrengthCode;
  top2: StrengthCode;
  /** Rank #3 — "also strong". */
  top3: StrengthCode;
  /** Ranks #4–#6 — "growing". */
  growing: StrengthCode[];
  /** ISO timestamp, stamped at hand-off (NOT inside pure scoring). */
  completedAt?: string;
}
