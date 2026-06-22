import {describe, expect, it} from 'vitest';
import {
  deriveSeed,
  hashSeed,
  makeRng,
  mulberry32,
  nextInt,
  pick,
  shuffle,
  toSeedInt
} from './prng';

function take(rng: () => number, n: number): number[] {
  return Array.from({length: n}, () => rng());
}

describe('mulberry32 PRNG', () => {
  it('is deterministic: the same seed yields the same stream', () => {
    expect(take(mulberry32(12345), 5)).toEqual(take(mulberry32(12345), 5));
  });

  it('different seeds diverge', () => {
    expect(take(mulberry32(1), 5)).not.toEqual(take(mulberry32(2), 5));
  });

  it('produces floats in [0, 1)', () => {
    const rng = mulberry32(7);
    for (const v of take(rng, 200)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('hashSeed / toSeedInt', () => {
  it('hashSeed is deterministic and a uint32', () => {
    const a = hashSeed('hello');
    expect(a).toBe(hashSeed('hello'));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(a)).toBe(true);
  });

  it('different strings hash differently', () => {
    expect(hashSeed('a')).not.toBe(hashSeed('b'));
  });

  it('toSeedInt passes numbers through (uint32) and hashes strings', () => {
    expect(toSeedInt(42)).toBe(42);
    expect(toSeedInt('42')).toBe(hashSeed('42'));
    expect(toSeedInt('42')).not.toBe(42);
  });
});

describe('makeRng', () => {
  it('a string seed and its hashed int seed give the same stream', () => {
    expect(take(makeRng('child-token'), 5)).toEqual(take(makeRng(hashSeed('child-token')), 5));
  });
});

describe('deriveSeed', () => {
  it('is deterministic per (seed, label)', () => {
    expect(deriveSeed(99, 'Gf')).toBe(deriveSeed(99, 'Gf'));
  });

  it('different labels give independent sub-seeds', () => {
    expect(deriveSeed(99, 'Gf')).not.toBe(deriveSeed(99, 'Gv'));
  });

  it('different base seeds give different sub-seeds for the same label', () => {
    expect(deriveSeed(1, 'Gf')).not.toBe(deriveSeed(2, 'Gf'));
  });
});

describe('helpers', () => {
  it('nextInt stays within [min, max] inclusive', () => {
    const rng = makeRng(5);
    for (let i = 0; i < 500; i++) {
      const v = nextInt(rng, 3, 9);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(9);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('nextInt can hit both bounds', () => {
    const rng = makeRng(123);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) seen.add(nextInt(rng, 0, 1));
    expect(seen).toEqual(new Set([0, 1]));
  });

  it('nextInt throws when max < min', () => {
    expect(() => nextInt(makeRng(1), 5, 4)).toThrow();
  });

  it('pick is deterministic and never picks outside the array', () => {
    const arr = ['a', 'b', 'c', 'd'];
    expect(pick(makeRng(1), arr)).toBe(pick(makeRng(1), arr));
    expect(arr).toContain(pick(makeRng(7), arr));
  });

  it('pick throws on an empty array', () => {
    expect(() => pick(makeRng(1), [])).toThrow();
  });

  it('shuffle is deterministic, a permutation, and does not mutate the input', () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const a = shuffle(makeRng(2), arr);
    const b = shuffle(makeRng(2), arr);
    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
