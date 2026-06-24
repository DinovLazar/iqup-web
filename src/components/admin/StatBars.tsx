import type {Bucket} from '@/lib/admin/stats/aggregate';

/**
 * A simple, accessible horizontal bar distribution (Phase 3.13). No charting
 * library is in the stack and none is added — the bars are styled `<div>`s. The bar
 * track is decorative (`aria-hidden`); the label + count/percentage carry the data
 * for screen readers. Every number here is a POPULATION count/percentage of the
 * anonymous Store A — never an individual child's score.
 */
export function StatBars({
  buckets,
  total,
  emptyLabel = 'No data yet.'
}: {
  buckets: readonly Bucket[];
  total: number;
  emptyLabel?: string;
}) {
  const hasData = buckets.some((b) => b.count > 0);
  if (!hasData) {
    return <p className="text-sm text-ink-soft">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <ul className="space-y-1.5">
      {buckets.map((bucket) => {
        const pct = total > 0 ? Math.round((bucket.count / total) * 100) : 0;
        const width = Math.round((bucket.count / max) * 100);
        return (
          <li
            key={bucket.key}
            className="grid grid-cols-[7rem_1fr_5.5rem] items-center gap-2 text-sm sm:grid-cols-[9rem_1fr_6rem]"
          >
            <span className="truncate text-ink" title={bucket.key}>
              {bucket.key}
            </span>
            <span
              aria-hidden="true"
              className="h-3 overflow-hidden rounded-full bg-canvas"
            >
              <span
                className="block h-3 rounded-full bg-[var(--iq-blue)]"
                style={{width: `${width}%`}}
              />
            </span>
            <span className="text-right tabular-nums text-ink-soft">
              {bucket.count} ({pct}%)
            </span>
          </li>
        );
      })}
    </ul>
  );
}
