/**
 * Aggregate-only statistics spec (Phase 3.13).
 *
 * Proves the stats are population counts/distributions only — never a per-child
 * row, never PII (Store A holds none), never anything that places a contact next to
 * a score. The aggregator consumes rows and returns only the summarised shape.
 */
import {describe, it, expect} from 'vitest';

import {
  aggregateStats,
  emptyAggregateStats,
  isoWeekStart,
  type StatsRow
} from './aggregate';

function row(partial: Partial<StatsRow>): StatsRow {
  return {
    age: 8,
    gender: 'female',
    city: 'aerodrom',
    language: 'mk',
    validity: 'valid',
    created_date: '2026-06-15',
    index_logical: 70,
    index_spatial: 50,
    index_memory_focus: 85,
    index_planning_speed: 30,
    index_learning_stem: 64,
    ...partial
  };
}

const rows: StatsRow[] = [
  row({}),
  row({age: 8, gender: 'male', city: 'veles', language: 'en', index_logical: 85}),
  row({age: 10, gender: null, validity: 'not_representative', index_logical: 30}),
  row({age: 8, created_date: '2026-06-22'})
];

describe('aggregateStats', () => {
  const agg = aggregateStats(rows);

  it('counts the total and demographic distributions', () => {
    expect(agg.total).toBe(4);
    // age 8 appears 3×, age 10 once.
    expect(agg.byAge.find((b) => b.key === '8')?.count).toBe(3);
    expect(agg.byAge.find((b) => b.key === '10')?.count).toBe(1);
    // gender null collapses into "unspecified".
    expect(agg.byGender.find((b) => b.key === 'unspecified')?.count).toBe(1);
    expect(agg.byGender.find((b) => b.key === 'female')?.count).toBe(2);
    // city slug resolved to a human label.
    expect(agg.byCity.find((b) => b.key.includes('Aerodrom'))?.count).toBe(3);
    expect(agg.byLanguage.find((b) => b.key === 'en')?.count).toBe(1);
    expect(agg.byValidity.find((b) => b.key === 'not_representative')?.count).toBe(1);
  });

  it('buckets index values into the four bands', () => {
    const logical = agg.indexBands.find((d) => d.index === 'logical');
    const byBand = Object.fromEntries(logical!.bands.map((b) => [b.key, b.count]));
    // logical values: 70 (strong), 85 (exceptional), 30 (developing), 70 (strong)
    expect(byBand.exceptional).toBe(1);
    expect(byBand.strong).toBe(2);
    expect(byBand.developing).toBe(1);
    expect(byBand.solid).toBe(0);
  });

  it('groups completions per ISO week (ascending)', () => {
    // 2026-06-15 is a Monday → week start 2026-06-15 (3 rows); 06-22 → next week (1).
    const weeks = agg.completionsByWeek;
    expect(weeks[0]).toEqual({key: '2026-06-15', count: 3});
    expect(weeks[1]).toEqual({key: '2026-06-22', count: 1});
  });

  it('returns ONLY a summarised shape — no raw rows, no PII keys', () => {
    const keys = Object.keys(agg);
    expect(keys.sort()).toEqual(
      [
        'byAge',
        'byCity',
        'byGender',
        'byLanguage',
        'byValidity',
        'completionsByWeek',
        'indexBands',
        'total'
      ].sort()
    );
    const serialised = JSON.stringify(agg).toLowerCase();
    for (const piiToken of ['email', 'phone', 'parent', 'first_name', '@']) {
      expect(serialised).not.toContain(piiToken);
    }
    // No raw row object survived (a raw row would carry `index_logical`).
    expect(serialised).not.toContain('index_logical');
  });
});

describe('isoWeekStart', () => {
  it('returns the Monday of the given date', () => {
    expect(isoWeekStart('2026-06-15')).toBe('2026-06-15'); // Monday
    expect(isoWeekStart('2026-06-21')).toBe('2026-06-15'); // Sunday → prior Monday
    expect(isoWeekStart('2026-06-22')).toBe('2026-06-22'); // next Monday
  });
});

describe('emptyAggregateStats', () => {
  it('is a clean, valid zero shape carrying the configured flag', () => {
    const empty = emptyAggregateStats(false);
    expect(empty.configured).toBe(false);
    expect(empty.total).toBe(0);
    expect(empty.indexBands).toHaveLength(5);
    expect(empty.byCity).toEqual([]);
  });
});
