/**
 * Per-index confidence labels (spec 6.5): derived from (a) the number of tasks
 * that fed it, (b) answer consistency, and (c) session validity. The exact
 * thresholds are PROVISIONAL (spec gives the method, not numbers — see
 * `CONFIDENCE` in `@/content/norms`).
 *
 * Model:
 *   score = 0
 *   nItems ≥ HIGH_MIN → +2 ; ≥ MED_MIN → +1
 *   consistency ≥ CONSISTENCY_MIN → +1
 *   validity: chance-level on the signal → score capped at 0;
 *             session 'gentle_note' → capped at 1; 'not_representative' → 0
 *   score ≥ 2 → high ; == 1 → medium ; else low
 *
 * An index's confidence is the WEAKEST of its contributing signals (an index is
 * only as trustworthy as its least-trusted component — uneven signal counts are
 * reported honestly here, never hidden by mixing — spec 3.2).
 */
import {CONFIDENCE} from '@/content/norms';
import type {DomainRun} from '@/lib/engine';
import type {ValidityOutcome} from '@/lib/validity';
import type {Confidence} from './types';

/** Answer consistency from a domain run: 1 − (correctness flips)/(n−1), in [0,1]. */
export function reversalConsistency(run: DomainRun): number {
  const n = run.items.length;
  if (n < 2) return 0;
  let flips = 0;
  for (let i = 1; i < n; i++) {
    if (run.items[i].judgment.correct !== run.items[i - 1].judgment.correct) flips++;
  }
  return Math.max(0, 1 - flips / (n - 1));
}

/** Inputs for one signal's confidence. */
export interface SignalConfidenceInput {
  nItems: number;
  /** Answer consistency in [0, 1]. */
  consistency: number;
  /** Was this signal's domain flagged chance-level? */
  chanceLevel: boolean;
  /** The session-wide validity outcome. */
  sessionOutcome: ValidityOutcome;
}

/** Compute one signal's confidence label. */
export function signalConfidence(input: SignalConfidenceInput): Confidence {
  let score = 0;
  if (input.nItems >= CONFIDENCE.HIGH_MIN_ITEMS) score += 2;
  else if (input.nItems >= CONFIDENCE.MED_MIN_ITEMS) score += 1;
  if (input.consistency >= CONFIDENCE.CONSISTENCY_MIN) score += 1;

  if (input.sessionOutcome === 'not_representative') score = 0;
  if (input.chanceLevel) score = Math.min(score, 0);
  if (input.sessionOutcome === 'gentle_note') score = Math.min(score, 1);

  return score >= 2 ? 'high' : score === 1 ? 'medium' : 'low';
}

const RANK: Record<Confidence, number> = {low: 0, medium: 1, high: 2};

/** An index's confidence = the weakest of its contributing signals. */
export function weakestConfidence(labels: readonly Confidence[]): Confidence {
  if (labels.length === 0) return 'low';
  return labels.reduce((worst, c) => (RANK[c] < RANK[worst] ? c : worst), 'high' as Confidence);
}
