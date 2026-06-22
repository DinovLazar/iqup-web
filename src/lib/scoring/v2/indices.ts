/**
 * Composite index VALUES (spec 6.3) — a weighted sum of the contributing signal
 * indices, rounded. Band + confidence are attached by the profile assembler.
 */
import {COMPOSITE_WEIGHTS} from './weights';
import type {IndexId, Signal, SignalScore} from './types';

/** The 0–100 composite value for an index, from the signal indices + weights. */
export function compositeValue(
  index: IndexId,
  signals: Record<Signal, SignalScore>
): number {
  let sum = 0;
  for (const {signal, weight} of COMPOSITE_WEIGHTS[index]) {
    sum += signals[signal].index * weight;
  }
  return Math.round(sum);
}
