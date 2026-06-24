import 'server-only';

/**
 * Statistics reader (Phase 3.13) — Store A (Supabase) only, AGGREGATE-ONLY.
 *
 * Queries `assessment_scores` via the SERVER-ONLY service-role client and returns
 * counts + distributions only. The raw per-row data is consumed inside this
 * function and NEVER handed to the caller/UI — `aggregateStats` collapses it into
 * the summary shape, which is all that is returned. No `id` is ever selected.
 *
 * This is the statistics HALF of the admin's two isolated data paths — it imports
 * nothing from the contacts / Brevo path and never calls Brevo.
 *
 * Resilient by design:
 *   * Supabase config unset → `getServiceRoleClient()` throws → caught → clean
 *     empty stats (`configured:false`). NEVER throws.
 *   * a query error → caught, logged, returns empty-but-configured stats.
 */
import {getServiceRoleClient} from '@/lib/supabase/server';
import {
  aggregateStats,
  emptyAggregateStats,
  type AggregateStats,
  type StatsRow
} from './aggregate';

/** Supabase page size for the windowed read. */
const BATCH = 1000;

/** Upper bound on rows aggregated per read (logged when exceeded — no silent cap). */
export const STATS_FETCH_CAP = 100_000;

/** The exact non-PII column projection (no `id`, no exact timestamp). */
const COLUMNS =
  'age, gender, city, language, validity, created_date, index_logical, index_spatial, index_memory_focus, index_planning_speed, index_learning_stem';

export async function readAggregateStats(): Promise<AggregateStats> {
  let supabase: ReturnType<typeof getServiceRoleClient>;
  try {
    supabase = getServiceRoleClient();
  } catch {
    // Supabase env unset (blank dev template) → clean "not configured" empty state.
    console.warn(JSON.stringify({event: 'admin-stats', status: 'skipped-no-config'}));
    return emptyAggregateStats(false);
  }

  const rows: StatsRow[] = [];
  let truncated = false;

  try {
    for (let from = 0; ; from += BATCH) {
      const {data, error} = await supabase
        .from('assessment_scores')
        .select(COLUMNS)
        // Newest first, so if the fetch cap is ever hit we keep the MOST RECENT
        // rows (matching the truncation label). The aggregator re-sorts its output,
        // so fetch order does not affect the displayed distributions.
        .order('created_date', {ascending: false})
        .range(from, from + BATCH - 1);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;

      rows.push(...(data as unknown as StatsRow[]));

      if (data.length < BATCH) break; // exhausted
      if (rows.length >= STATS_FETCH_CAP) {
        truncated = true;
        break;
      }
    }

    console.info(
      JSON.stringify({event: 'admin-stats', status: 'read', rows: rows.length, truncated})
    );
    // Only the SUMMARY leaves this function — the raw rows never escape.
    return {configured: true, truncated, ...aggregateStats(rows)};
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'admin-stats',
        status: 'failed',
        err: err instanceof Error ? err.message : String(err)
      })
    );
    // A failing query must never crash the admin — return a clean empty shape.
    return emptyAggregateStats(true);
  }
}
