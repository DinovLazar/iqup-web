import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import {generateGlr, pairsForLevel, practiceGlr} from './glr';
import {correctAnswerFor, wrongAnswerFor} from './shared';
import type {GlrPairedSpec} from './types';

/** One Glr item from a FRESH rng (→ attempt 1, pairs regenerated from stream prefix). */
function gen(level: number, seed: string | number) {
  return generateGlr(level, 'standard', makeRng(seed));
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

const spec = (item: ReturnType<typeof gen>) => item.payload as GlrPairedSpec;

describe('Glr determinism + variety', () => {
  it('two separate rng instances with the same seed → byte-identical first item', () => {
    expect(ser(gen(4, 'seed-1'))).toBe(ser(gen(4, 'seed-1')));
  });
  it('different seed → different pairs', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) seen.add(JSON.stringify(spec(gen(4, `seed-${s}`)).pairs));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('Glr multi-attempt sharing (the learning block)', () => {
  it('3 calls on the SAME rng → attempt 1,2,3 and an IDENTICAL learned set', () => {
    const rng = makeRng('block-x');
    const a = generateGlr(4, 'standard', rng);
    const b = generateGlr(4, 'standard', rng);
    const c = generateGlr(4, 'standard', rng);

    expect(a.meta?.attempt).toBe(1);
    expect(b.meta?.attempt).toBe(2);
    expect(c.meta?.attempt).toBe(3);
    expect(spec(a).attempt).toBe(1);
    expect(spec(b).attempt).toBe(2);
    expect(spec(c).attempt).toBe(3);

    // The learned pair set is stable across attempts.
    const pa = JSON.stringify(spec(a).pairs);
    expect(JSON.stringify(spec(b).pairs)).toBe(pa);
    expect(JSON.stringify(spec(c).pairs)).toBe(pa);
  });

  it('level adapts between calls but the block keeps its original pair count', () => {
    const rng = makeRng('block-adapt');
    const a = generateGlr(1, 'standard', rng); // block created at level 1 → 4 pairs
    const b = generateGlr(9, 'standard', rng); // level rose, but the block is fixed
    expect(spec(a).pairs.length).toBe(4);
    expect(spec(b).pairs.length).toBe(4);
    expect(JSON.stringify(spec(b).pairs)).toBe(JSON.stringify(spec(a).pairs));
  });

  it('trial ORDER may differ across attempts even though pairs are identical', () => {
    const rng = makeRng('block-order');
    const orders = new Set<string>();
    for (let i = 0; i < 6; i++) {
      const item = generateGlr(9, 'standard', rng); // 8 pairs → ample ordering entropy
      orders.add(spec(item).trials.map((t) => t.cue).join(','));
    }
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('Glr answer correctness', () => {
  it('judge(correctAnswerFor) → correct, credit 1; judge(wrongAnswerFor) → credit 0, incorrect', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `corr-${s}-${level}`);
        const right = item.judge({itemId: item.id, answer: correctAnswerFor(item), responseTimeMs: 1000});
        expect(right.correct).toBe(true);
        expect(right.credit).toBe(1);
        const wrong = item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1000});
        expect(wrong.correct).toBe(false);
        expect(wrong.credit).toBe(0);
      }
    }
  });

  it('an omitted response scores credit 0, incorrect', () => {
    const item = gen(3, 'omit');
    const j = item.judge({itemId: item.id, answer: undefined, responseTimeMs: 0, omitted: true});
    expect(j).toEqual({correct: false, credit: 0});
  });

  it('a half-right answer → credit ≈ 0.5', () => {
    // 6 pairs at L5; answer half the trials correctly, half with a wrong option.
    const item = gen(5, 'half');
    const p = spec(item);
    const pairCount = p.interaction.pairCount;
    const half = Math.floor(pairCount / 2);
    const answer = p.solution.answer.map((correct, i) => {
      if (i < half) return correct;
      return p.trials[i].options.find((o) => o !== correct) ?? correct;
    });
    const j = item.judge({itemId: item.id, answer, responseTimeMs: 1000});
    expect(j.credit).toBeCloseTo(half / pairCount, 5);
  });
});

describe('Glr trial / solution structure', () => {
  it("each trial's options contain its correct target; solution.answer[i] is the cue's pair", () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(7, `struct-${s}`);
      const p = spec(item);
      const lookup = new Map(p.pairs.map((pr) => [pr.cue, pr.target]));
      p.trials.forEach((trial, i) => {
        expect(p.solution.answer[i]).toBe(lookup.get(trial.cue));
        expect(trial.options).toContain(p.solution.answer[i]);
        expect(trial.options.length).toBe(p.interaction.optionCount);
      });
    }
  });
});

describe('Glr difficulty sanity', () => {
  it('first-attempt pairs.length (fresh rng per level) is non-decreasing in level', () => {
    let prev = 0;
    for (let level = 1; level <= 10; level++) {
      const n = spec(gen(level, `diff-${level}`)).pairs.length;
      expect(n).toBe(pairsForLevel(level));
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
    expect(spec(gen(1, 'a')).pairs.length).toBe(4);
    expect(spec(gen(10, 'b')).pairs.length).toBe(8);
  });
});

describe('Glr scoring meta + practice', () => {
  it('meta.attempt is present + numeric; meta.optionCount === pairCount', () => {
    for (let level = 1; level <= 10; level++) {
      const item = gen(level, `meta-${level}`);
      expect(typeof item.meta?.attempt).toBe('number');
      expect(item.meta?.optionCount).toBe(spec(item).interaction.pairCount);
    }
  });
  it('practice item is stable', () => {
    expect(ser(practiceGlr())).toBe(ser(practiceGlr()));
    expect(practiceGlr().level).toBe(1);
    expect(practiceGlr().meta?.attempt).toBe(1);
  });
});

describe('Glr honest framing', () => {
  it('payload carries no forbidden tokens', () => {
    const forbidden = /score|percent|percentile|\bIQ\b|rank|diagnos/i;
    for (let level = 1; level <= 10; level++) {
      const json = JSON.stringify(spec(gen(level, `forbidden-${level}`)));
      expect(json).not.toMatch(forbidden);
    }
  });
});
