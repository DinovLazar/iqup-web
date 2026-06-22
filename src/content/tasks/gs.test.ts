import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import {generateGs, practiceGs} from './gs';
import {correctAnswerFor, wrongAnswerFor} from './shared';
import type {GsSymbolSearchSpec} from './types';

function gen(level: number, seed: string | number) {
  return generateGs(level, 'standard', makeRng(seed));
}

/** A serialisable projection (drops the judge closure) for byte-identity checks. */
function ser(item: ReturnType<typeof gen>) {
  return JSON.stringify({
    id: item.id,
    domain: item.domain,
    level: item.level,
    format: item.format,
    payload: item.payload,
    meta: item.meta
  });
}

function specOf(item: ReturnType<typeof gen>) {
  return item.payload as GsSymbolSearchSpec;
}

describe('Gs determinism + variety', () => {
  it('same (level, format, seed) → byte-identical item', () => {
    expect(ser(gen(4, 'seed-1'))).toBe(ser(gen(4, 'seed-1')));
  });
  it('different seed → different item at the same level', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) seen.add(ser(gen(4, `seed-${s}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('Gs answer correctness', () => {
  it('the full correct tap-set → {correct:true, credit:1}; [] → {correct:false, credit:0}', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `corr-${s}-${level}`);
        const correct = correctAnswerFor(item) as number[];
        const cj = item.judge({itemId: item.id, answer: correct, responseTimeMs: 1000});
        expect(cj).toEqual({correct: true, credit: 1});
        // The generic wrong oracle for multi-tap-timed is [] (see shared.ts).
        const wj = item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1000});
        expect(wj).toEqual({correct: false, credit: 0});
      }
    }
  });

  it('empty / omitted responses score zero', () => {
    const item = gen(5, 'omit-1');
    expect(item.judge({itemId: item.id, answer: [], responseTimeMs: 1000})).toEqual({correct: false, credit: 0});
    expect(item.judge({itemId: item.id, answer: undefined, responseTimeMs: 1000, omitted: true})).toEqual({
      correct: false,
      credit: 0
    });
  });

  it('dropping one target → credit < 1 and correct false', () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(5, `partial-${s}`);
      const correct = correctAnswerFor(item) as number[];
      if (correct.length < 2) continue;
      const partial = correct.slice(0, correct.length - 1);
      const j = item.judge({itemId: item.id, answer: partial, responseTimeMs: 1000});
      expect(j.correct).toBe(false);
      expect(j.credit).toBeLessThan(1);
      expect(j.credit).toBeGreaterThanOrEqual(0);
    }
  });

  it('tapping a non-target adds a false-tap penalty (credit drops vs full correct)', () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(5, `false-${s}`);
      const spec = specOf(item);
      const correct = correctAnswerFor(item) as number[];
      // Find a non-target cell to tap.
      const targetSet = new Set(spec.targetPositions);
      const cellCount = spec.cols * spec.rows;
      let nonTarget = -1;
      for (let i = 0; i < cellCount; i++) {
        if (!targetSet.has(i)) {
          nonTarget = i;
          break;
        }
      }
      expect(nonTarget).toBeGreaterThanOrEqual(0);
      const withFalse = [...correct, nonTarget];
      const j = item.judge({itemId: item.id, answer: withFalse, responseTimeMs: 1000});
      expect(j.correct).toBe(false);
      expect(j.credit).toBeLessThan(1);
    }
  });
});

describe('Gs field integrity', () => {
  it('targetPositions cells are all a target glyph; elsewhere are non-targets; count matches', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `field-${s}-${level}`);
        const spec = specOf(item);
        const targets = new Set(spec.targets);
        const targetPosSet = new Set(spec.targetPositions);

        expect(spec.targetPositions.length).toBe(item.meta?.targetCount);
        expect(spec.cells.length).toBe(spec.cols * spec.rows);
        // solution.answer mirrors targetPositions exactly.
        expect(spec.solution.answer).toEqual(spec.targetPositions);
        // targetPositions are sorted ascending + distinct.
        for (let i = 1; i < spec.targetPositions.length; i++) {
          expect(spec.targetPositions[i]).toBeGreaterThan(spec.targetPositions[i - 1]);
        }
        // Every planted cell is a target glyph; every other cell is a non-target.
        spec.cells.forEach((glyph, idx) => {
          if (targetPosSet.has(idx)) expect(targets.has(glyph)).toBe(true);
          else expect(targets.has(glyph)).toBe(false);
        });
      }
    }
  });
});

describe('Gs difficulty sanity', () => {
  it('meta.cellCount and meta.targetCount are non-decreasing in level', () => {
    let prevCells = 0;
    let prevTargets = 0;
    for (let level = 1; level <= 10; level++) {
      const item = gen(level, `diff-${level}`);
      const cells = item.meta?.cellCount as number;
      const targets = item.meta?.targetCount as number;
      expect(cells).toBeGreaterThanOrEqual(prevCells);
      expect(targets).toBeGreaterThanOrEqual(prevTargets);
      prevCells = cells;
      prevTargets = targets;
    }
  });

  it('cellCount stays within the spec range [18, 28]', () => {
    for (let level = 1; level <= 10; level++) {
      const cells = gen(level, `range-${level}`).meta?.cellCount as number;
      expect(cells).toBeGreaterThanOrEqual(18);
      expect(cells).toBeLessThanOrEqual(28);
    }
  });

  it('timeBudgetMs stays within the spec range [20000, 25000]', () => {
    for (let level = 1; level <= 10; level++) {
      const budget = specOf(gen(level, `budget-${level}`)).timeBudgetMs;
      expect(budget).toBeGreaterThanOrEqual(20000);
      expect(budget).toBeLessThanOrEqual(25000);
    }
  });
});

describe('Gs scoring meta', () => {
  it('every item carries numeric cellCount + targetCount meta', () => {
    for (let level = 1; level <= 10; level++) {
      const item = gen(level, `meta-${level}`);
      expect(typeof item.meta?.cellCount).toBe('number');
      expect(typeof item.meta?.targetCount).toBe('number');
      // interaction.timeBudgetMs mirrors the payload budget.
      const spec = specOf(item);
      expect(spec.interaction.timeBudgetMs).toBe(spec.timeBudgetMs);
    }
  });
});

describe('Gs practice', () => {
  it('practice item is stable and easy', () => {
    expect(ser(practiceGs())).toBe(ser(practiceGs()));
    expect(practiceGs().level).toBe(1);
  });
});

describe('Gs honest framing', () => {
  it('payload carries no forbidden tokens (score/percentile/rank/IQ/level N)', () => {
    const forbidden = /(\bIQ\b|score|percent(ile)?|\brank\b|level\s*\d)/i;
    for (let level = 1; level <= 10; level++) {
      const json = JSON.stringify(specOf(gen(level, `tok-${level}`)));
      expect(json).not.toMatch(forbidden);
    }
  });
});
