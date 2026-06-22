import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import {rotate, shapeEquals} from './glyphs';
import {generateGv, practiceGv} from './gv';
import {correctAnswerFor, wrongAnswerFor} from './shared';
import type {GvRotationSpec} from './types';

function gen(level: number, seed: string | number) {
  return generateGv(level, 'standard', makeRng(seed));
}

/** A serialisable projection (drops the judge closure) for byte-identity checks. */
function ser(item: ReturnType<typeof gen>) {
  return JSON.stringify({id: item.id, domain: item.domain, level: item.level, format: item.format, payload: item.payload, meta: item.meta});
}

describe('Gv determinism + variety', () => {
  it('same (level, format, seed) → byte-identical item', () => {
    expect(ser(gen(4, 'seed-1'))).toBe(ser(gen(4, 'seed-1')));
  });
  it('different seed → different item at the same level', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) seen.add(ser(gen(4, `seed-${s}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('Gv answer correctness', () => {
  it('the declared correct option is the true rotation; the wrong oracle fails', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `corr-${s}-${level}`);
        const correct = correctAnswerFor(item) as number;
        expect(item.judge({itemId: item.id, answer: correct, responseTimeMs: 1000}).correct).toBe(true);
        expect(item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1000}).correct).toBe(false);
      }
    }
  });

  it('correct option shape equals rotate(base, rotationDeg); no distractor matches it', () => {
    for (let s = 0; s < 100; s++) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `rot-${s}-${level}`);
        const p = item.payload as GvRotationSpec;
        const expected = rotate(p.base, p.rotationDeg);
        const correctOption = p.options[p.solution.answer];

        // The correct option is tagged 'rotation' and truly equals the rotation.
        expect(correctOption.kind).toBe('rotation');
        expect(shapeEquals(correctOption.shape, expected)).toBe(true);

        // NO distractor shape equals the correct rotation.
        const distractors = p.options.filter((_, i) => i !== p.solution.answer);
        for (const d of distractors) {
          expect(shapeEquals(d.shape, expected)).toBe(false);
        }

        // All four option shapes are mutually distinct (exactly one true answer).
        for (let i = 0; i < p.options.length; i++) {
          for (let j = i + 1; j < p.options.length; j++) {
            expect(shapeEquals(p.options[i].shape, p.options[j].shape)).toBe(false);
          }
        }
      }
    }
  });

  it('every item has exactly four options with the expected distractor kinds', () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(5, `kinds-${s}`);
      const p = item.payload as GvRotationSpec;
      expect(p.options).toHaveLength(4);
      const kinds = p.options.map((o) => o.kind).sort();
      expect(kinds).toEqual(['mirror', 'other', 'rotation', 'wrong-angle']);
      expect([90, 180, 270]).toContain(p.rotationDeg);
    }
  });
});

describe('Gv difficulty sanity', () => {
  it('base.cells.length is non-decreasing across levels', () => {
    const byLevel: number[] = [];
    for (let level = 1; level <= 10; level++) {
      // Cell count is a deterministic function of level (not seed), but sample
      // a few seeds to confirm stability.
      let count = -1;
      for (let s = 0; s < 10; s++) {
        const p = gen(level, `diff-${level}-${s}`).payload as GvRotationSpec;
        if (count === -1) count = p.base.cells.length;
        expect(p.base.cells.length).toBe(count);
      }
      byLevel[level] = count;
    }
    for (let level = 2; level <= 10; level++) {
      expect(byLevel[level]).toBeGreaterThanOrEqual(byLevel[level - 1]);
    }
  });
});

describe('Gv scoring meta + practice', () => {
  it('every item carries optionCount meta === 4', () => {
    for (let level = 1; level <= 10; level++) {
      const item = gen(level, `meta-${level}`);
      const p = item.payload as GvRotationSpec;
      expect(item.meta?.optionCount).toBe(4);
      expect(p.interaction.optionCount).toBe(4);
    }
  });
  it('practice item is stable and easy', () => {
    expect(ser(practiceGv())).toBe(ser(practiceGv()));
    expect(practiceGv().level).toBe(1);
  });
});

describe('Gv honest framing — no forbidden tokens', () => {
  it('payload never serialises a score/IQ/percentile/rank or "level N"', () => {
    for (let s = 0; s < 40; s++) {
      for (let level = 1; level <= 10; level++) {
        const json = JSON.stringify((gen(level, `tok-${s}-${level}`).payload as GvRotationSpec));
        expect(json).not.toMatch(/\b(IQ|score|percentile|rank)\b/i);
        expect(json).not.toMatch(/level\s*\d/i);
      }
    }
  });
});
