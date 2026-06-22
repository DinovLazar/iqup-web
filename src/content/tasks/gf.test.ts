import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import {generateGf, practiceGf} from './gf';
import {correctAnswerFor, wrongAnswerFor} from './shared';
import type {GfMatrixSpec, GfSeriesSpec} from './types';

function gen(level: number, seed: string | number) {
  return generateGf(level, 'standard', makeRng(seed));
}

/** A serialisable projection (drops the judge closure) for byte-identity checks. */
function ser(item: ReturnType<typeof gen>) {
  return JSON.stringify({id: item.id, domain: item.domain, level: item.level, format: item.format, payload: item.payload, meta: item.meta});
}

describe('Gf determinism + variety', () => {
  it('same (level, format, seed) → byte-identical item', () => {
    expect(ser(gen(4, 'seed-1'))).toBe(ser(gen(4, 'seed-1')));
  });
  it('different seed → different item at the same level', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) seen.add(ser(gen(4, `seed-${s}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('Gf answer correctness', () => {
  it('the declared correct option satisfies the rule; the wrong oracle fails', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `corr-${s}-${level}`);
        const correct = correctAnswerFor(item) as number;
        expect(item.judge({itemId: item.id, answer: correct, responseTimeMs: 1000}).correct).toBe(true);
        expect(item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1000}).correct).toBe(false);
      }
    }
  });

  it('series options actually continue the rule (correct option = next term)', () => {
    for (let s = 0; s < 100; s++) {
      const item = gen(2, `series-${s}`);
      if ((item.payload as {taskType: string}).taskType !== 'gf.series') continue;
      const p = item.payload as GfSeriesSpec;
      // The visible terms + the correct option are consistent with +k arithmetic at level 2.
      const vals = p.sequence.filter((x): x is number => x !== null);
      const d = vals[1] - vals[0];
      expect(vals[2] - vals[1]).toBe(d);
      expect(p.options[p.solution.answer]).toBe(vals[vals.length - 1] + d);
    }
  });

  it('matrix distractors each differ from the correct cell', () => {
    for (let s = 0; s < 100; s++) {
      const item = gen(7, `matrix-${s}`);
      if ((item.payload as {taskType: string}).taskType !== 'gf.matrix') continue;
      const p = item.payload as GfMatrixSpec;
      const correct = p.options[p.solution.answer];
      const others = p.options.filter((_, i) => i !== p.solution.answer);
      for (const o of others) {
        expect(o).not.toEqual(correct);
      }
      expect(p.cells[p.missingIndex]).toBeNull();
    }
  });
});

describe('Gf difficulty sanity', () => {
  it('matrix transformations are non-decreasing in level', () => {
    // Sample the matrix transformation count per level (averaged over seeds).
    const byLevel: number[] = [];
    for (let level = 1; level <= 10; level++) {
      let maxT = 0;
      for (let s = 0; s < 40; s++) {
        const item = gen(level, `diff-${level}-${s}`);
        if ((item.payload as {taskType: string}).taskType === 'gf.matrix') {
          maxT = Math.max(maxT, (item.payload as GfMatrixSpec).solution.transformations);
        }
      }
      byLevel[level] = maxT;
    }
    expect(byLevel[2]).toBeLessThanOrEqual(byLevel[6]);
    expect(byLevel[6]).toBeLessThanOrEqual(byLevel[10]);
  });
});

describe('Gf scoring meta + practice', () => {
  it('every item carries optionCount meta matching its options', () => {
    for (let level = 1; level <= 10; level++) {
      const item = gen(level, `meta-${level}`);
      const oc = (item.payload as GfMatrixSpec | GfSeriesSpec).interaction.optionCount;
      expect(item.meta?.optionCount).toBe(oc);
      expect(oc).toBeGreaterThanOrEqual(4);
    }
  });
  it('practice item is stable and easy', () => {
    expect(ser(practiceGf())).toBe(ser(practiceGf()));
    expect(practiceGf().level).toBe(1);
  });
});
