import {readAggregateStats} from '@/lib/admin/stats/read-stats';
import {statsToCsv} from '@/lib/admin/stats/stats-csv';
import {csvResponse} from '@/lib/admin/csv';
import {getAdminUser} from '@/lib/admin/auth/server';

export const dynamic = 'force-dynamic';

/**
 * Aggregate-statistics CSV export (Phase 3.13) — Store A only. Independently gated.
 * One of two SEPARATE exports — population counts/distributions only, no per-child
 * row, no shared per-child key with the contacts export, no joined file.
 */
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return new Response('Unauthorized', {status: 401});
  }

  const stats = await readAggregateStats();
  const csv = statsToCsv(stats);

  return csvResponse('iqup-statistics.csv', csv);
}
