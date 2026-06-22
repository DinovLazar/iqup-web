import {describe, expect, it} from 'vitest';
import {INDEX_CLAMP_MAX, INDEX_CLAMP_MIN} from '@/content/norms';
import {accuracyIndex, clampIndex, spanIndex, speedIndex} from './normalize';

describe('clampIndex', () => {
  it('rounds to the nearest integer', () => {
    expect(clampIndex(49.4)).toBe(49);
    expect(clampIndex(49.6)).toBe(50);
  });

  it('clamps to [8, 99]', () => {
    expect(clampIndex(-100)).toBe(INDEX_CLAMP_MIN);
    expect(clampIndex(0)).toBe(INDEX_CLAMP_MIN);
    expect(clampIndex(1000)).toBe(INDEX_CLAMP_MAX);
  });

  it('never returns NaN', () => {
    expect(clampIndex(NaN)).toBe(INDEX_CLAMP_MIN);
  });
});

describe('accuracyIndex (Прилог B.2: 20 + acc*75)', () => {
  it('maps 0 → 20 (the formula base, before clamp)', () => {
    expect(accuracyIndex(0)).toBe(20);
  });

  it('maps 1 → 95', () => {
    expect(accuracyIndex(1)).toBe(95);
  });

  it('maps 0.4 → 50 (≈ typical)', () => {
    expect(accuracyIndex(0.4)).toBe(50);
  });
});

describe('spanIndex (Прилог B.2: 50 + (span − expected)*14)', () => {
  it('a typical span → 50', () => {
    expect(spanIndex(5, 5)).toBe(50);
  });

  it('one above expected → 64', () => {
    expect(spanIndex(6, 5)).toBe(64);
  });

  it('well below expected clamps to the floor', () => {
    expect(spanIndex(0, 7)).toBe(INDEX_CLAMP_MIN);
  });
});

describe('speedIndex (Прилог B.2: 50 + (net − expected)*6)', () => {
  it('a typical rate → 50', () => {
    expect(speedIndex(0.7, 0.7)).toBe(50);
  });

  it('faster than expected raises the index', () => {
    expect(speedIndex(2.7, 0.7)).toBe(62); // 50 + 2*6
  });

  it('never NaN for zero time-derived rate', () => {
    expect(Number.isNaN(speedIndex(0, 0.7))).toBe(false);
  });
});
