/**
 * Aggregate-statistics CSV export (Phase 3.13) — Store A (Supabase) only.
 *
 * ISOMORPHIC + pure (no `server-only`): turns the AGGREGATE shape into a tidy
 * long-format CSV (`category, key, count`) — population counts/percentages only,
 * never a per-child row. This is one of TWO separate exports; it shares no
 * per-child key with the contacts CSV. There is no joined export.
 */
import {toCsv} from '../csv';
import type {AggregateStats} from './aggregate';

/** The aggregate-stats CSV columns. */
export const STATS_CSV_HEADER = ['category', 'key', 'count'] as const;

export function statsToCsv(stats: AggregateStats): string {
  const rows: Array<[string, string, number]> = [];

  rows.push(['total', 'completions', stats.total]);
  for (const b of stats.byAge) rows.push(['age', b.key, b.count]);
  for (const b of stats.byGender) rows.push(['gender', b.key, b.count]);
  for (const b of stats.byCity) rows.push(['city', b.key, b.count]);
  for (const b of stats.byLanguage) rows.push(['language', b.key, b.count]);
  for (const b of stats.byValidity) rows.push(['validity', b.key, b.count]);
  for (const b of stats.completionsByWeek) rows.push(['week', b.key, b.count]);
  for (const dist of stats.indexBands) {
    for (const band of dist.bands) {
      rows.push(['index_band', `${dist.index}:${band.key}`, band.count]);
    }
  }

  return toCsv(STATS_CSV_HEADER, rows);
}
