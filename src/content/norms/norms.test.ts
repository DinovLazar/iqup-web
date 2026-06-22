import {describe, expect, it} from 'vitest';
import {DOMAINS} from '@/lib/engine/types';
import {
  DOMAIN_CAPS,
  EXPECTED_SPAN_FORWARD,
  EXPECTED_SPEED_BY_AGE,
  MAX_AGE,
  MIN_AGE,
  NORMS_VERSION,
  START_LEVEL_BY_AGE,
  expectedSpanBackward,
  maxItemsFor
} from './index';

const AGES = Array.from({length: MAX_AGE - MIN_AGE + 1}, (_, i) => MIN_AGE + i);

describe('seed norms coverage', () => {
  it('marks itself PROVISIONAL via the version string', () => {
    expect(NORMS_VERSION).toMatch(/PROVISIONAL/);
  });

  it('start levels cover every age 5–13 and match the spec Gf table', () => {
    const expected = [1, 2, 2, 3, 4, 5, 6, 7, 8];
    expect(AGES.map((a) => START_LEVEL_BY_AGE[a])).toEqual(expected);
  });

  it('forward span norms cover every age and are non-decreasing', () => {
    const spans = AGES.map((a) => EXPECTED_SPAN_FORWARD[a]);
    expect(spans).toHaveLength(9);
    for (let i = 1; i < spans.length; i++) expect(spans[i]).toBeGreaterThanOrEqual(spans[i - 1]);
  });

  it('backward span is null under 8 and forward−2 from 8', () => {
    expect(expectedSpanBackward(7)).toBeNull();
    expect(expectedSpanBackward(8)).toBe(EXPECTED_SPAN_FORWARD[8] - 2);
    expect(expectedSpanBackward(13)).toBe(EXPECTED_SPAN_FORWARD[13] - 2);
  });

  it('speed norms cover every age and are non-decreasing', () => {
    const speeds = AGES.map((a) => EXPECTED_SPEED_BY_AGE[a]);
    for (let i = 1; i < speeds.length; i++) expect(speeds[i]).toBeGreaterThanOrEqual(speeds[i - 1]);
  });
});

describe('domain caps', () => {
  it('every domain has a min/max in the 4–6 target range', () => {
    for (const d of DOMAINS) {
      expect(DOMAIN_CAPS[d].min).toBeGreaterThanOrEqual(4);
      expect(DOMAIN_CAPS[d].max).toBeGreaterThanOrEqual(DOMAIN_CAPS[d].min);
      expect(DOMAIN_CAPS[d].max).toBeLessThanOrEqual(6);
    }
  });

  it('Gf/Gv get more items than the default (single-signal stability)', () => {
    expect(DOMAIN_CAPS.Gf.max).toBeGreaterThan(DOMAIN_CAPS.Gsm.max);
    expect(DOMAIN_CAPS.Gv.max).toBeGreaterThan(DOMAIN_CAPS.Gsm.max);
  });

  it('the 10–13 cluster runs the extended battery (+1)', () => {
    expect(maxItemsFor('CT', '8-9')).toBe(DOMAIN_CAPS.CT.max);
    expect(maxItemsFor('CT', '10-13')).toBe(DOMAIN_CAPS.CT.max + 1);
  });
});
