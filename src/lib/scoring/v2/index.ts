/**
 * Public surface of the v2 scoring layer. Import from `@/lib/scoring/v2`.
 *
 * The headline entry point is {@link buildProfile}: a `SessionRun` (from
 * `@/lib/engine`) → the `CognitiveProfile` that 3.05 / 3.06 / 3.07 / 3.09
 * consume. This module returns DATA ONLY — no user-facing number/%/IQ/rank
 * string. Kept under `scoring/v2/` so the still-wired v1 strengths scorer
 * (`@/lib/scoring`) is untouched.
 */
export * from './types';
export {buildProfile, SCORING_VERSION} from './profile';
export {computeSignals, type SignalsResult} from './signals';
export {compositeValue} from './indices';
export {bandFor} from './bands';
export {COMPOSITE_WEIGHTS, type SignalWeight} from './weights';
export {accuracyIndex, spanIndex, speedIndex, clampIndex} from './normalize';
export {
  signalConfidence,
  weakestConfidence,
  reversalConsistency,
  type SignalConfidenceInput
} from './confidence';
export {deriveFeatures} from './features';
export {toResponseOutcomes, toTimedOutcomes} from './collect';
export {
  creditOf,
  weightedAccuracy,
  maxCorrectSpan,
  gsNetPerTime,
  learningSlope,
  effectiveSeconds,
  meanRelativeRt
} from './raw';
