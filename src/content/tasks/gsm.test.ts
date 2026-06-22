import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import type {ItemFormat} from '@/lib/engine/types';
import {generateGsm, practiceGsm, spanForLevel} from './gsm';
import {correctAnswerFor, wrongAnswerFor} from './shared';
import type {GsmCorsiSpec} from './types';

function gen(level: number, seed: string | number, format: ItemFormat = 'forward') {
  return generateGsm(level, format, makeRng(seed));
}

/** A serialisable projection (drops the judge closure) for byte-identity checks. */
function ser(item: ReturnType<typeof gen>) {
  return JSON.stringify({id: item.id, domain: item.domain, level: item.level, format: item.format, payload: item.payload, meta: item.meta});
}

const payloadOf = (item: ReturnType<typeof gen>) => item.payload as GsmCorsiSpec;

describe('Gsm determinism + variety', () => {
  it('same (level, format, seed) → byte-identical item', () => {
    expect(ser(gen(4, 'seed-1'))).toBe(ser(gen(4, 'seed-1')));
    expect(ser(gen(6, 'seed-1', 'backward'))).toBe(ser(gen(6, 'seed-1', 'backward')));
  });
  it('different seed → different item at the same level', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) seen.add(ser(gen(6, `seed-${s}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('Gsm format honoring', () => {
  it("forward: direction='forward' and solution = presentation order", () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(5, `fwd-${s}`, 'forward');
      const p = payloadOf(item);
      expect(p.direction).toBe('forward');
      expect(item.format).toBe('forward');
      expect(p.interaction.direction).toBe('forward');
      expect(p.solution.answer).toEqual(p.sequence);
    }
  });
  it("backward: direction='backward' and solution = reversed presentation order", () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(7, `bwd-${s}`, 'backward');
      const p = payloadOf(item);
      expect(p.direction).toBe('backward');
      expect(item.format).toBe('backward');
      expect(p.interaction.direction).toBe('backward');
      expect(p.solution.answer).toEqual([...p.sequence].reverse());
    }
  });
});

describe('Gsm answer correctness', () => {
  it('the declared correct tap-order is judged correct; the empty/wrong oracle fails', () => {
    for (const format of ['forward', 'backward'] as const) {
      for (let s = 0; s < 40; s++) {
        for (let level = 1; level <= 10; level++) {
          const item = gen(level, `corr-${format}-${s}-${level}`, format);
          const correct = correctAnswerFor(item) as number[];
          expect(item.judge({itemId: item.id, answer: correct, responseTimeMs: 1000}).correct).toBe(true);
          // wrongAnswerFor returns [] for tap-sequence → reproduces nothing.
          expect(item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1000}).correct).toBe(false);
        }
      }
    }
  });
  it('an omitted response is never correct', () => {
    const item = gen(5, 'omit');
    expect(item.judge({itemId: item.id, answer: [], responseTimeMs: 0, omitted: true}).correct).toBe(false);
  });
  it('a backward solution is wrong for a forward item (direction actually matters)', () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(8, `dir-${s}`, 'forward');
      const p = payloadOf(item);
      const reversed = [...p.sequence].reverse();
      // Only meaningful when reversing changes the order (it does once length>1
      // and the sequence isn't a palindrome). Skip the rare palindrome.
      if (arraysShallowEqual(reversed, p.sequence)) continue;
      expect(item.judge({itemId: item.id, answer: reversed, responseTimeMs: 1000}).correct).toBe(false);
    }
  });
});

function arraysShallowEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

describe('Gsm sequence integrity', () => {
  it('no two consecutive identical tile ids; ids are valid board tiles', () => {
    for (const format of ['forward', 'backward'] as const) {
      for (let s = 0; s < 60; s++) {
        for (let level = 1; level <= 10; level++) {
          const p = payloadOf(gen(level, `seq-${format}-${s}-${level}`, format));
          expect(p.tiles).toHaveLength(6);
          expect(p.interaction.tileCount).toBe(6);
          for (let i = 0; i < p.sequence.length; i++) {
            expect(p.sequence[i]).toBeGreaterThanOrEqual(0);
            expect(p.sequence[i]).toBeLessThan(6);
            if (i > 0) expect(p.sequence[i]).not.toBe(p.sequence[i - 1]);
          }
        }
      }
    }
  });
});

describe('Gsm difficulty sanity', () => {
  it('spanForLevel is monotonic non-decreasing with the expected table', () => {
    const expected = [4, 4, 5, 5, 6, 6, 7, 7, 8, 8]; // L1..L10
    for (let level = 1; level <= 10; level++) {
      expect(spanForLevel(level)).toBe(expected[level - 1]);
      if (level > 1) expect(spanForLevel(level)).toBeGreaterThanOrEqual(spanForLevel(level - 1));
    }
  });
  it('meta.spanLength matches the presentation length and is non-decreasing in level', () => {
    let prev = 0;
    for (let level = 1; level <= 10; level++) {
      const item = gen(level, `span-${level}`);
      const span = item.meta?.spanLength as number;
      expect(span).toBe(payloadOf(item).interaction.length);
      expect(span).toBe(payloadOf(item).sequence.length);
      expect(span).toBeGreaterThanOrEqual(prev);
      prev = span;
    }
  });
});

describe('Gsm scoring meta fidelity', () => {
  it('meta.spanLength is a present number and item.format passes through', () => {
    for (const format of ['forward', 'backward'] as const) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `meta-${format}-${level}`, format);
        expect(typeof item.meta?.spanLength).toBe('number');
        expect(item.meta?.spanLength).toBe(spanForLevel(level));
        // raw.ts maxCorrectSpan keys off item.format ('backward' vs else).
        expect(item.format).toBe(format);
      }
    }
  });
});

describe('Gsm practice', () => {
  it('practice item is stable, easy, and forward', () => {
    expect(ser(practiceGsm())).toBe(ser(practiceGsm()));
    expect(practiceGsm().level).toBe(1);
    expect(practiceGsm().format).toBe('forward');
    expect(payloadOf(practiceGsm()).direction).toBe('forward');
  });
});

describe('Gsm honest framing', () => {
  it('payload carries no forbidden tokens (score/percentile/rank/IQ/level N)', () => {
    const forbidden = /(\bIQ\b|score|percent(ile)?|\brank\b|level\s*\d)/i;
    for (const format of ['forward', 'backward'] as const) {
      for (let level = 1; level <= 10; level++) {
        const json = JSON.stringify(payloadOf(gen(level, `tok-${format}-${level}`, format)));
        expect(json).not.toMatch(forbidden);
      }
    }
  });
});
