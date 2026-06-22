import {describe, expect, it} from 'vitest';
import type {Domain, ItemScoringMeta, Response} from '@/lib/engine/types';
import {
  detectAllFlags,
  detectChanceLevel,
  detectIdleGaps,
  detectSamePosition,
  detectSpeedGaming,
  detectTooFast,
  type ResponseOutcome
} from './flags';

function out(
  domain: Domain,
  correct: boolean,
  response: Partial<Response>,
  meta?: ItemScoringMeta
): ResponseOutcome {
  return {
    domain,
    correct,
    meta,
    response: {itemId: 'x', answer: null, responseTimeMs: 1500, ...response}
  };
}

describe('detectTooFast (spec 7.1)', () => {
  it('silent when all answers are at a normal pace', () => {
    const outcomes = Array.from({length: 5}, () => out('Gf', true, {responseTimeMs: 1500}));
    expect(detectTooFast(outcomes)).toBeNull();
  });

  it('mild when some but ≤30% are too fast', () => {
    const outcomes = [
      out('Gf', true, {responseTimeMs: 200}),
      ...Array.from({length: 9}, () => out('Gf', true, {responseTimeMs: 1500}))
    ];
    const flag = detectTooFast(outcomes);
    expect(flag?.severity).toBe('mild');
  });

  it('strong when >30% are too fast', () => {
    const outcomes = [
      out('Gf', true, {responseTimeMs: 200}),
      out('Gf', true, {responseTimeMs: 200}),
      out('Gf', true, {responseTimeMs: 1500})
    ];
    const flag = detectTooFast(outcomes);
    expect(flag?.severity).toBe('strong');
  });
});

describe('detectSamePosition (spec 7.1)', () => {
  it('strong when >60% of picks are the same position', () => {
    const outcomes = [
      out('Gf', true, {selectedPosition: 0}),
      out('Gf', true, {selectedPosition: 0}),
      out('Gf', true, {selectedPosition: 0}),
      out('Gf', true, {selectedPosition: 1})
    ];
    expect(detectSamePosition(outcomes)?.severity).toBe('strong');
  });

  it('silent for a varied spread of positions', () => {
    const outcomes = [
      out('Gf', true, {selectedPosition: 0}),
      out('Gf', true, {selectedPosition: 1}),
      out('Gf', true, {selectedPosition: 2}),
      out('Gf', true, {selectedPosition: 3})
    ];
    expect(detectSamePosition(outcomes)).toBeNull();
  });
});

describe('detectIdleGaps (spec 7.1 / Дел 8)', () => {
  it('flags repeated long idle gaps', () => {
    const outcomes = Array.from({length: 3}, () => out('Gf', true, {idleMs: 30_000}));
    expect(detectIdleGaps(outcomes)?.kind).toBe('idle_gaps');
  });

  it('silent for a couple of short pauses', () => {
    const outcomes = [out('Gf', true, {idleMs: 1000}), out('Gf', true, {idleMs: 30_000})];
    expect(detectIdleGaps(outcomes)).toBeNull();
  });
});

describe('detectChanceLevel (spec 7.1)', () => {
  it('flags a domain sitting at chance (≈25% for 4 options)', () => {
    // 4 items, 1 correct → 25% accuracy = chance.
    const outcomes = [
      out('Gf', true, {}, {optionCount: 4}),
      out('Gf', false, {}, {optionCount: 4}),
      out('Gf', false, {}, {optionCount: 4}),
      out('Gf', false, {}, {optionCount: 4})
    ];
    const flags = detectChanceLevel(outcomes);
    expect(flags).toHaveLength(1);
    expect(flags[0].domain).toBe('Gf');
  });

  it('does not flag clearly above-chance performance', () => {
    const outcomes = Array.from({length: 5}, () => out('Gf', true, {}, {optionCount: 4}));
    expect(detectChanceLevel(outcomes)).toHaveLength(0);
  });

  it('does not flag too-short domains', () => {
    const outcomes = [out('Gf', false, {}, {optionCount: 4}), out('Gf', false, {}, {optionCount: 4})];
    expect(detectChanceLevel(outcomes)).toHaveLength(0);
  });
});

describe('detectSpeedGaming (spec 7.1)', () => {
  it('flags smearing: ~all cells tapped with low accuracy', () => {
    const outcomes = [
      out('Gs', false, {tappedCells: 19}, {cellCount: 20, targetCount: 6}),
      out('Gs', false, {tappedCells: 20}, {cellCount: 20, targetCount: 6})
    ];
    expect(detectSpeedGaming(outcomes)?.severity).toBe('strong');
  });

  it('silent for a normal, selective Gs run', () => {
    const outcomes = [
      out('Gs', true, {tappedCells: 6}, {cellCount: 20, targetCount: 6}),
      out('Gs', true, {tappedCells: 7}, {cellCount: 20, targetCount: 6})
    ];
    expect(detectSpeedGaming(outcomes)).toBeNull();
  });
});

describe('detectAllFlags', () => {
  it('returns nothing for a clean session', () => {
    const outcomes = Array.from({length: 5}, () => out('Gf', true, {responseTimeMs: 1500}));
    expect(detectAllFlags(outcomes)).toEqual([]);
  });
});
