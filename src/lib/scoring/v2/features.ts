/**
 * Derived structural features (spec Дел 9.1 / §6.6) — pure derivations the report
 * engine (3.07) maps to prose. NO copy here: 3.07 stays a pure text layer because
 * the structure is computed here.
 *
 * Features: profile shape (flat/spiky) + spread, highest/lowest index, notable
 * index pairs (strong clusters + large gaps), the observed speed–accuracy solving
 * style (spec 9.5 — a real observation, never a speculative "learning style"),
 * memory forward/backward asymmetry, the Glr learning slope, and the ceiling/floor
 * extremes per domain.
 */
import {FEATURES, REFERENCE_TAP_BASELINE_MS} from '@/content/norms';
import type {Domain, SessionRun} from '@/lib/engine';
import {learningSlope, maxCorrectSpan} from './raw';
import type {
  DerivedFeatures,
  IndexId,
  IndexPair,
  Signal,
  SignalScore,
  SolvingStyle
} from './types';
import {INDICES} from './types';

/** Highest/lowest index by value (ties broken by canonical INDICES order). */
function extremaIndex(values: Record<IndexId, number>): {high: IndexId; low: IndexId} {
  let high: IndexId = INDICES[0];
  let low: IndexId = INDICES[0];
  for (const idx of INDICES) {
    if (values[idx] > values[high]) high = idx;
    if (values[idx] < values[low]) low = idx;
  }
  return {high, low};
}

/** All unordered index pairs that satisfy a predicate, as `IndexPair`s. */
function pairsWhere(
  values: Record<IndexId, number>,
  predicate: (a: IndexId, b: IndexId, delta: number) => boolean
): IndexPair[] {
  const out: IndexPair[] = [];
  for (let i = 0; i < INDICES.length; i++) {
    for (let j = i + 1; j < INDICES.length; j++) {
      const a = INDICES[i];
      const b = INDICES[j];
      const delta = Math.abs(values[a] - values[b]);
      if (predicate(a, b, delta)) out.push({a, b, delta});
    }
  }
  return out;
}

/** Session-wide mean calibration-relative RT + overall accuracy (for solving style). */
function sessionTiming(session: SessionRun): {meanRelRt: number; accuracy: number} {
  const baseline =
    session.input.calibrationBaselineMs > 0
      ? session.input.calibrationBaselineMs
      : REFERENCE_TAP_BASELINE_MS;
  let rtSum = 0;
  let answered = 0;
  let correct = 0;
  for (const run of Object.values(session.domains)) {
    for (const it of run.items) {
      if (it.response.omitted) continue;
      rtSum += it.response.responseTimeMs / baseline;
      answered += 1;
      if (it.judgment.correct) correct += 1;
    }
  }
  return {
    meanRelRt: answered > 0 ? rtSum / answered : 0,
    accuracy: answered > 0 ? correct / answered : 0
  };
}

function solvingStyle(meanRelRt: number, accuracy: number): SolvingStyle {
  const fast = meanRelRt > 0 && meanRelRt < FEATURES.FAST_REL_RT;
  const accurate = accuracy >= FEATURES.ACCURATE_MIN;
  if (fast && accurate) return 'fast_accurate';
  if (!fast && accurate) return 'reflective_accurate';
  if (fast && !accurate) return 'fast_errors';
  return 'balanced';
}

/** Compute every derived feature. */
export function deriveFeatures(
  session: SessionRun,
  _signals: Record<Signal, SignalScore>,
  indexValues: Record<IndexId, number>
): DerivedFeatures {
  const valuesList = INDICES.map((i) => indexValues[i]);
  const indexSpread = Math.max(...valuesList) - Math.min(...valuesList);
  const {high, low} = extremaIndex(indexValues);

  const strongPairs = pairsWhere(
    indexValues,
    (a, b) => indexValues[a] >= FEATURES.STRONG_PAIR_MIN && indexValues[b] >= FEATURES.STRONG_PAIR_MIN
  );
  const gapPairs = pairsWhere(indexValues, (_a, _b, delta) => delta >= FEATURES.GAP_PAIR_MIN);

  const {meanRelRt, accuracy} = sessionTiming(session);

  // Memory asymmetry: forward − backward, only when backward was measured.
  const span = maxCorrectSpan(session.domains.Gsm);
  const memoryAsymmetry =
    session.input.age >= 8 && span.backward > 0 ? span.forward - span.backward : null;

  const ceilingDomains: Domain[] = [];
  const floorDomains: Domain[] = [];
  for (const run of Object.values(session.domains)) {
    if (run.reachedCeilingExtreme) ceilingDomains.push(run.domain);
    if (run.reachedFloorExtreme) floorDomains.push(run.domain);
  }

  return {
    profileShape: indexSpread >= FEATURES.SPIKY_SPREAD ? 'spiky' : 'flat',
    indexSpread,
    highestIndex: high,
    lowestIndex: low,
    strongPairs,
    gapPairs,
    solvingStyle: solvingStyle(meanRelRt, accuracy),
    memoryAsymmetry,
    learningSlope: learningSlope(session.domains.Glr),
    ceilingDomains,
    floorDomains
  };
}
