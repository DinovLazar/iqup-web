/**
 * Compute the eight signals (spec Дел 3.1 / 6.1) from a session run: per-domain
 * raw scores → per-age 0–100 indices, plus the derived attention signal.
 *
 * Timing-dependent signals (Gs, and attention's variability part) are
 * calibration-relative — the device baseline is `session.input.calibrationBaselineMs`.
 */
import {EXPECTED_SPAN_FORWARD, EXPECTED_SPEED_BY_AGE} from '@/content/norms';
import type {SessionRun} from '@/lib/engine';
import {deriveAttention} from '@/lib/validity/attention';
import type {AttentionDerivation} from '@/lib/validity';
import {toTimedOutcomes} from './collect';
import {accuracyIndex, spanIndex, speedIndex} from './normalize';
import {gsNetPerTime, maxCorrectSpan, weightedAccuracy} from './raw';
import type {Signal, SignalScore} from './types';

/** The accuracy-family domains (weighted accuracy → accuracy index). */
const ACCURACY_DOMAINS = ['Gf', 'Gv', 'CT', 'EF', 'Glr'] as const;

/** Result of {@link computeSignals}: the eight scores + the attention derivation. */
export interface SignalsResult {
  signals: Record<Signal, SignalScore>;
  /** Kept so the confidence layer can read attention's variability without recomputing. */
  attentionDerivation: AttentionDerivation;
}

/**
 * Compute all eight `SignalScore`s. Attention is derived from the whole session's
 * timing + errors (never a separate task). Extremes (a floor/ceiling run) still
 * yield in-range, NaN-free values because every index is clamped.
 */
export function computeSignals(session: SessionRun): SignalsResult {
  const {age, calibrationBaselineMs} = session.input;
  const out = {} as Record<Signal, SignalScore>;

  for (const domain of ACCURACY_DOMAINS) {
    const run = session.domains[domain];
    const raw = weightedAccuracy(run);
    out[domain] = {signal: domain, raw, index: accuracyIndex(raw), nItems: run.items.length};
  }

  // Gsm — max correct span vs the per-age forward expectation (Прилог B.1/B.2).
  const gsmRun = session.domains.Gsm;
  const span = maxCorrectSpan(gsmRun).overall;
  out.Gsm = {
    signal: 'Gsm',
    raw: span,
    index: spanIndex(span, EXPECTED_SPAN_FORWARD[age]),
    nItems: gsmRun.items.length
  };

  // Gs — net-correct per reference-second vs the per-age (PROVISIONAL) expectation.
  const gsRun = session.domains.Gs;
  const netPerTime = gsNetPerTime(gsRun, calibrationBaselineMs);
  out.Gs = {
    signal: 'Gs',
    raw: netPerTime,
    index: speedIndex(netPerTime, EXPECTED_SPEED_BY_AGE[age]),
    nItems: gsRun.items.length
  };

  // Attention — derived from the whole session (spec 6.1), normalised via the
  // accuracy-index form (its raw is a [0,1] quality).
  const derivation = deriveAttention(toTimedOutcomes(session), calibrationBaselineMs);
  out.attention = {
    signal: 'attention',
    raw: derivation.raw,
    index: accuracyIndex(derivation.raw),
    nItems: derivation.n
  };

  return {signals: out, attentionDerivation: derivation};
}
