/**
 * Derived ATTENTION signal (spec Дел 3.1 #5, Дел 4, Дел 6.1). Attention is NOT a
 * separate task (a real CPT is too long / unreliable on an unsupervised phone —
 * spec Дел 4); it is derived from response-time variability + omissions +
 * impulsive (too-fast-and-wrong) errors across the whole session.
 *
 * Spec 6.1 formula: `Внимание = 1 − норм. варијабилност − стапка импулсивни грешки`.
 *
 * Timing is **calibration-relative**: every response time is divided by the
 * device baseline (`calibrationBaselineMs`, measured by the first practice task —
 * spec 7.2) before variability is computed, so a slow device does not inflate
 * variability. The baseline is an input parameter; capturing it is 3.05.
 */
import {CONFIDENCE, REFERENCE_TAP_BASELINE_MS} from '@/content/norms';
import type {AttentionDerivation} from './types';

/** A minimal timed outcome — the only thing the attention derivation needs. */
export interface TimedOutcome {
  responseTimeMs: number;
  correct: boolean;
  omitted?: boolean;
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/**
 * Derive the raw attention signal in [0, 1] from the session's timed outcomes.
 *
 * - `normVariability` = the coefficient of variation (std / mean) of the
 *   calibration-relative response times of *answered* (non-omitted) items,
 *   clamped to [0, 1]. A child who answers at a steady pace → low variability →
 *   high attention.
 * - `impulsiveRate` = (too-fast-and-wrong answers + omissions) / all responses.
 *   "Too fast and wrong" = a response under the impulsive threshold that was
 *   incorrect (a careless click), the classic CPT commission-error analogue.
 *
 * Edge inputs (no responses, a single response, all-omitted) return a valid,
 * in-range value without NaN — asserted by the tests.
 */
export function deriveAttention(
  outcomes: readonly TimedOutcome[],
  calibrationBaselineMs: number
): AttentionDerivation {
  const n = outcomes.length;
  if (n === 0) {
    // No data → neutral-low attention raw of 0 (will normalise to the floor index).
    return {raw: 0, normVariability: 0, impulsiveRate: 0, n: 0};
  }

  // Shared fallback with raw.ts / features.ts so every timing-dependent signal
  // uses the same unit if a baseline is somehow missing (3.05 always supplies one).
  const baseline = calibrationBaselineMs > 0 ? calibrationBaselineMs : REFERENCE_TAP_BASELINE_MS;

  // Variability over answered items only, in calibration-relative units.
  const answered = outcomes.filter((o) => !o.omitted);
  const relTimes = answered.map((o) => o.responseTimeMs / baseline);
  let normVariability = 0;
  if (relTimes.length >= 2) {
    const mean = relTimes.reduce((a, b) => a + b, 0) / relTimes.length;
    if (mean > 0) {
      const variance =
        relTimes.reduce((a, b) => a + (b - mean) ** 2, 0) / relTimes.length;
      normVariability = clamp01(Math.sqrt(variance) / mean);
    }
  }

  // Impulsive errors + omissions, as a fraction of ALL responses.
  const impulsive = outcomes.filter(
    (o) => o.omitted || (!o.correct && o.responseTimeMs < CONFIDENCE.IMPULSIVE_MS)
  ).length;
  const impulsiveRate = clamp01(impulsive / n);

  const raw = clamp01(1 - normVariability - impulsiveRate);
  return {raw, normVariability, impulsiveRate, n};
}
