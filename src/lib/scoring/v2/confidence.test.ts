import {describe, expect, it} from 'vitest';
import type {DomainRun} from '@/lib/engine';
import {reversalConsistency, signalConfidence, weakestConfidence} from './confidence';

/** Minimal DomainRun carrying only the correctness sequence the helper reads. */
function runWith(correctness: boolean[]): DomainRun {
  return {
    domain: 'Gf',
    startLevel: 1,
    endedBy: 'cap',
    reachedCeilingExtreme: false,
    reachedFloorExtreme: false,
    items: correctness.map((correct, i) => ({
      // Only `judgment.correct` is read by reversalConsistency.
      item: {id: `i${i}`, domain: 'Gf', level: 1, format: 'standard', payload: null, judge: () => ({correct})},
      response: {itemId: `i${i}`, answer: null, responseTimeMs: 1000},
      judgment: {correct},
      level: 1
    }))
  };
}

describe('reversalConsistency', () => {
  it('is 1 for a perfectly steady run', () => {
    expect(reversalConsistency(runWith([true, true, true, true]))).toBe(1);
  });

  it('is 0 for a fully alternating run', () => {
    expect(reversalConsistency(runWith([true, false, true, false]))).toBe(0);
  });

  it('is 0 for fewer than two items (cannot assess)', () => {
    expect(reversalConsistency(runWith([true]))).toBe(0);
  });
});

describe('signalConfidence', () => {
  it('high: enough items + consistent + valid session', () => {
    expect(
      signalConfidence({nItems: 5, consistency: 1, chanceLevel: false, sessionOutcome: 'valid'})
    ).toBe('high');
  });

  it('medium: few items, low consistency', () => {
    expect(
      signalConfidence({nItems: 3, consistency: 0.2, chanceLevel: false, sessionOutcome: 'valid'})
    ).toBe('medium');
  });

  it('low: too few items and inconsistent', () => {
    expect(
      signalConfidence({nItems: 2, consistency: 0, chanceLevel: false, sessionOutcome: 'valid'})
    ).toBe('low');
  });

  it('a gentle-note session caps a strong signal at medium', () => {
    expect(
      signalConfidence({nItems: 6, consistency: 1, chanceLevel: false, sessionOutcome: 'gentle_note'})
    ).toBe('medium');
  });

  it('a not-representative session forces low', () => {
    expect(
      signalConfidence({nItems: 6, consistency: 1, chanceLevel: false, sessionOutcome: 'not_representative'})
    ).toBe('low');
  });

  it('chance-level accuracy forces low even with many items', () => {
    expect(
      signalConfidence({nItems: 6, consistency: 1, chanceLevel: true, sessionOutcome: 'valid'})
    ).toBe('low');
  });
});

describe('weakestConfidence', () => {
  it('returns the lowest of the contributing labels', () => {
    expect(weakestConfidence(['high', 'medium'])).toBe('medium');
    expect(weakestConfidence(['high', 'low', 'medium'])).toBe('low');
    expect(weakestConfidence(['high', 'high'])).toBe('high');
  });

  it('defaults to low for no contributors', () => {
    expect(weakestConfidence([])).toBe('low');
  });
});
