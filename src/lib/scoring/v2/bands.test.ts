import {describe, expect, it} from 'vitest';
import {bandFor} from './bands';

describe('bandFor (spec 6.4 cutoffs)', () => {
  it('assigns the right band at the exact edges', () => {
    // ≥80 exceptional
    expect(bandFor(80)).toBe('exceptional');
    expect(bandFor(79)).toBe('strong');
    // 64–79 strong
    expect(bandFor(64)).toBe('strong');
    expect(bandFor(63)).toBe('solid');
    // 45–63 solid
    expect(bandFor(45)).toBe('solid');
    expect(bandFor(44)).toBe('developing');
  });

  it('covers the clamped extremes', () => {
    expect(bandFor(99)).toBe('exceptional');
    expect(bandFor(8)).toBe('developing');
    expect(bandFor(100)).toBe('exceptional');
    expect(bandFor(0)).toBe('developing');
  });

  it('returns a stable enum with no display words', () => {
    const bands = [bandFor(90), bandFor(70), bandFor(50), bandFor(30)];
    expect(bands).toEqual(['exceptional', 'strong', 'solid', 'developing']);
    for (const b of bands) expect(b).not.toMatch(/[0-9%]/);
  });
});
