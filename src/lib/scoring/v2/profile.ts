/**
 * Assemble the `CognitiveProfile` (spec Дел 6) from a `SessionRun`:
 *   signals → indices (composite values + bands + confidence) → derived features
 *   + the validity outcome + session/version metadata.
 *
 * Returns DATA ONLY — no user-facing number/%/IQ/rank string is rendered here.
 */
import {NORMS_VERSION} from '@/content/norms';
import {toSeedInt, type SessionRun} from '@/lib/engine';
import {evaluateValidity} from '@/lib/validity';
import {bandFor} from './bands';
import {toResponseOutcomes} from './collect';
import {
  reversalConsistency,
  signalConfidence,
  weakestConfidence
} from './confidence';
import {deriveFeatures} from './features';
import {compositeValue} from './indices';
import {computeSignals} from './signals';
import {
  INDICES,
  type CognitiveProfile,
  type Confidence,
  type IndexId,
  type IndexScore,
  type Signal,
  type SignalScore
} from './types';
import {COMPOSITE_WEIGHTS} from './weights';

/** Bump when the scoring pipeline changes (spec 19.4 versioning). */
export const SCORING_VERSION = 'v2-scoring-0.1.0';

/** Build the full profile from an engine session run. */
export function buildProfile(session: SessionRun): CognitiveProfile {
  const {signals, attentionDerivation} = computeSignals(session);

  // Validity first — the outcome + chance-level domains feed confidence.
  const validity = evaluateValidity(toResponseOutcomes(session));
  const chanceSet = new Set(validity.chanceLevelDomains);

  // Per-signal confidence.
  const signalConf = {} as Record<Signal, Confidence>;
  for (const signal of Object.keys(signals) as Signal[]) {
    if (signal === 'attention') {
      signalConf.attention = signalConfidence({
        nItems: signals.attention.nItems,
        consistency: 1 - attentionDerivation.normVariability,
        chanceLevel: false,
        sessionOutcome: validity.outcome
      });
      continue;
    }
    const run = session.domains[signal];
    signalConf[signal] = signalConfidence({
      nItems: run.items.length,
      consistency: reversalConsistency(run),
      chanceLevel: chanceSet.has(signal),
      sessionOutcome: validity.outcome
    });
  }

  // Composite indices: value + band + (weakest-of-contributors) confidence.
  const indexValues = {} as Record<IndexId, number>;
  const indices = {} as Record<IndexId, IndexScore>;
  for (const index of INDICES) {
    const value = compositeValue(index, signals);
    indexValues[index] = value;
    const contributors = COMPOSITE_WEIGHTS[index].map((w) => signalConf[w.signal]);
    indices[index] = {
      index,
      value,
      band: bandFor(value),
      confidence: weakestConfidence(contributors)
    };
  }

  const features = deriveFeatures(session, signals, indexValues);

  return {
    version: 2,
    session: {
      age: session.input.age,
      seed: session.input.seed,
      seedInt: toSeedInt(session.input.seed),
      calibrationBaselineMs: session.input.calibrationBaselineMs,
      engineVersion: session.engineVersion,
      scoringVersion: SCORING_VERSION,
      normsVersion: NORMS_VERSION
    },
    signals: signals as Record<Signal, SignalScore>,
    indices,
    features,
    validity
  };
}
