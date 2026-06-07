import {describe, it, expect} from 'vitest';

import {
  AGES,
  BANDS,
  BAND_KEYS,
  MAX_AGE,
  MIN_AGE,
  getBandForAge,
  isValidAge
} from './bands';

describe('getBandForAge', () => {
  it('maps the 3–5 band at both boundaries', () => {
    expect(getBandForAge(3)).toBe('3-5');
    expect(getBandForAge(5)).toBe('3-5');
  });

  it('maps the 6–9 band at both boundaries', () => {
    expect(getBandForAge(6)).toBe('6-9');
    expect(getBandForAge(9)).toBe('6-9');
  });

  it('maps the 10–13 band at both boundaries', () => {
    expect(getBandForAge(10)).toBe('10-13');
    expect(getBandForAge(13)).toBe('10-13');
  });

  it('returns null below the supported range', () => {
    expect(getBandForAge(2)).toBeNull();
  });

  it('returns null above the supported range', () => {
    expect(getBandForAge(14)).toBeNull();
  });

  it('returns null for non-integer ages', () => {
    expect(getBandForAge(5.5)).toBeNull();
  });

  it('returns null for NaN / non-finite input', () => {
    expect(getBandForAge(Number.NaN)).toBeNull();
    expect(getBandForAge(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('maps every supported age 3–13 to exactly one band', () => {
    for (let age = MIN_AGE; age <= MAX_AGE; age++) {
      const key = getBandForAge(age);
      expect(key).not.toBeNull();
      expect(BAND_KEYS).toContain(key);
    }
  });
});

describe('band definitions', () => {
  it('cover the full range contiguously with no gaps or overlaps', () => {
    expect(BANDS[0].minAge).toBe(MIN_AGE);
    expect(BANDS[BANDS.length - 1].maxAge).toBe(MAX_AGE);
    for (let i = 1; i < BANDS.length; i++) {
      expect(BANDS[i].minAge).toBe(BANDS[i - 1].maxAge + 1);
    }
  });

  it('expose AGES as the inclusive list of supported ages', () => {
    expect(AGES[0]).toBe(MIN_AGE);
    expect(AGES[AGES.length - 1]).toBe(MAX_AGE);
    expect(AGES).toHaveLength(MAX_AGE - MIN_AGE + 1);
  });
});

describe('isValidAge', () => {
  it('accepts the boundaries and rejects out-of-range / non-integers', () => {
    expect(isValidAge(3)).toBe(true);
    expect(isValidAge(13)).toBe(true);
    expect(isValidAge(2)).toBe(false);
    expect(isValidAge(14)).toBe(false);
    expect(isValidAge(7.2)).toBe(false);
  });
});
