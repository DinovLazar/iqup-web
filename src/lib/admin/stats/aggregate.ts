/**
 * Aggregate-only statistics over Store A (Phase 3.13) — anonymous population stats.
 *
 * ISOMORPHIC + pure (no `server-only`): turns raw `assessment_scores` rows into
 * COUNTS and DISTRIBUTIONS only — never an individual child's row, never a
 * per-contact profile, never anything that places a contact next to a score. This
 * is the allowed use of Store A (the anonymous, PII-free store).
 *
 * It imports nothing from the contacts / Brevo path — the statistics data path is
 * isolated from the contacts data path (the unlinkability invariant). The only
 * cross-module imports are the pure scoring band-cutoff (`bandFor`) and the centre
 * list (to label the city slug Store A stores) — neither touches Store B.
 */
import {bandFor} from '@/lib/scoring/v2';
import type {Band, IndexId} from '@/lib/scoring/v2';
import {getCenter} from '@/content/centers';

/**
 * The exact (non-PII) columns the stats reader selects from `assessment_scores`.
 * No `id`, no signals beyond what the distributions need — just the demographics,
 * validity, the day-level date, and the five 0–100 indices.
 */
export interface StatsRow {
  readonly age: number;
  readonly gender: string | null;
  readonly city: string;
  readonly language: string;
  readonly validity: string;
  readonly created_date: string;
  readonly index_logical: number;
  readonly index_spatial: number;
  readonly index_memory_focus: number;
  readonly index_planning_speed: number;
  readonly index_learning_stem: number;
}

/** One bucket of a distribution. */
export interface Bucket {
  readonly key: string;
  readonly count: number;
}

/** The per-index band breakdown (the anonymous band distribution in aggregate). */
export interface IndexBandDistribution {
  readonly index: IndexId;
  readonly label: string;
  readonly bands: readonly Bucket[];
}

/** The full aggregate-only statistics shape the stats view renders. */
export interface AggregateStats {
  /** Whether Supabase was configured (false → clean empty state). */
  readonly configured: boolean;
  /** True when the row count exceeded the reader's fetch cap (some rows excluded). */
  readonly truncated: boolean;
  readonly total: number;
  readonly byAge: readonly Bucket[];
  readonly byGender: readonly Bucket[];
  readonly byCity: readonly Bucket[];
  readonly byLanguage: readonly Bucket[];
  readonly byValidity: readonly Bucket[];
  /** Completions per ISO week (Monday start, YYYY-MM-DD), ascending. */
  readonly completionsByWeek: readonly Bucket[];
  /** Anonymous band distribution per parent-facing index. */
  readonly indexBands: readonly IndexBandDistribution[];
}

/** The five parent-facing indices + their `StatsRow` column + a short stats label. */
const INDEX_META: ReadonlyArray<{
  id: IndexId;
  label: string;
  column: keyof StatsRow;
}> = [
  {id: 'logical', label: 'Logical', column: 'index_logical'},
  {id: 'spatial', label: 'Spatial', column: 'index_spatial'},
  {id: 'memory_focus', label: 'Memory & focus', column: 'index_memory_focus'},
  {id: 'planning_speed', label: 'Planning & speed', column: 'index_planning_speed'},
  {id: 'learning_stem', label: 'Learning & STEM', column: 'index_learning_stem'}
];

/** Bands ordered low → high for legible bars. */
const BAND_ORDER: readonly Band[] = ['developing', 'solid', 'strong', 'exceptional'];

/** Ages the assessment covers (always shown, even at zero). */
const AGES = [5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

/** The Monday (ISO week start) of a YYYY-MM-DD date, as YYYY-MM-DD (UTC). */
export function isoWeekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay(); // 0=Sun … 6=Sat
  const shiftToMonday = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + shiftToMonday);
  return date.toISOString().slice(0, 10);
}

/** Resolve a Store A city slug to a human label (centre English city), or the slug. */
function cityLabel(slug: string): string {
  const center = getCenter(slug);
  return center ? center.city.en : slug;
}

function countBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

/** Map → buckets sorted by count desc, then key asc (stable, legible ordering). */
function bucketsByCountDesc(map: Map<string, number>): Bucket[] {
  return [...map.entries()]
    .map(([key, count]) => ({key, count}))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/**
 * Aggregate raw rows into counts + distributions. PURE: the input rows are consumed
 * into summaries and never returned — the caller hands the UI only this summary.
 */
export function aggregateStats(
  rows: readonly StatsRow[]
): Omit<AggregateStats, 'configured' | 'truncated'> {
  const total = rows.length;

  // By age — fixed 5..13 ordering, including zero-count ages.
  const ageMap = countBy(rows, (r) => String(r.age));
  const byAge: Bucket[] = AGES.map((age) => ({
    key: String(age),
    count: ageMap.get(String(age)) ?? 0
  }));

  // By gender — null collapses into "unspecified".
  const byGender = bucketsByCountDesc(
    countBy(rows, (r) => (r.gender == null || r.gender === '' ? 'unspecified' : r.gender))
  );

  const byCity = bucketsByCountDesc(countBy(rows, (r) => cityLabel(r.city)));
  const byLanguage = bucketsByCountDesc(countBy(rows, (r) => r.language));
  const byValidity = bucketsByCountDesc(countBy(rows, (r) => r.validity));

  // Completions per ISO week, ascending by week start.
  const weekMap = countBy(rows, (r) => isoWeekStart(r.created_date));
  const completionsByWeek = [...weekMap.entries()]
    .map(([key, count]) => ({key, count}))
    .sort((a, b) => a.key.localeCompare(b.key));

  // Anonymous band distribution per index.
  const indexBands: IndexBandDistribution[] = INDEX_META.map(({id, label, column}) => {
    const bandMap = new Map<Band, number>();
    for (const row of rows) {
      const value = row[column] as number;
      const band = bandFor(value);
      bandMap.set(band, (bandMap.get(band) ?? 0) + 1);
    }
    return {
      index: id,
      label,
      bands: BAND_ORDER.map((band) => ({key: band, count: bandMap.get(band) ?? 0}))
    };
  });

  return {
    total,
    byAge,
    byGender,
    byCity,
    byLanguage,
    byValidity,
    completionsByWeek,
    indexBands
  };
}

/** The empty aggregate (unconfigured Supabase or no rows) — a clean, valid shape. */
export function emptyAggregateStats(configured: boolean): AggregateStats {
  return {
    configured,
    truncated: false,
    total: 0,
    byAge: AGES.map((age) => ({key: String(age), count: 0})),
    byGender: [],
    byCity: [],
    byLanguage: [],
    byValidity: [],
    completionsByWeek: [],
    indexBands: INDEX_META.map(({id, label}) => ({
      index: id,
      label,
      bands: BAND_ORDER.map((band) => ({key: band, count: 0}))
    }))
  };
}
