import type {Metadata} from 'next';
import type {ReactNode} from 'react';

import {readAggregateStats} from '@/lib/admin/stats/read-stats';
import type {Bucket} from '@/lib/admin/stats/aggregate';
import {StatBars} from '@/components/admin/StatBars';

export const metadata: Metadata = {
  title: 'Statistics · IqUp Admin',
  robots: {index: false, follow: false}
};

export const dynamic = 'force-dynamic';

/** Capitalise a band key for display (developing → Developing). */
function bandLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function StatCard({title, children}: {title: string; children: ReactNode}) {
  return (
    <section className="rounded-lg border border-border bg-white p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-soft">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function AdminStatisticsPage() {
  const stats = await readAggregateStats();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Statistics</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Anonymous population statistics from Supabase (Store A). Aggregate only —
            no individual result is shown.
          </p>
        </div>
        {stats.configured && stats.total > 0 ? (
          // CSV download served by a route handler — a plain anchor, not `<Link>`
          // (Link would attempt an RSC navigation and break the file download).
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/admin/statistics/export"
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iq-violet)]"
          >
            Export CSV
          </a>
        ) : null}
      </div>

      {!stats.configured ? (
        <p className="rounded-lg border border-border bg-white p-4 text-sm text-ink-soft">
          Supabase is not configured (the Store A connection is unset), so there are
          no statistics to show yet.
        </p>
      ) : stats.total === 0 ? (
        <p className="rounded-lg border border-border bg-white p-4 text-sm text-ink-soft">
          No completed assessments recorded yet.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg border border-border bg-white px-5 py-4">
              <p className="text-3xl font-extrabold text-[var(--iq-violet)] tabular-nums">
                {stats.total}
              </p>
              <p className="text-sm text-ink-soft">completed assessments</p>
            </div>
            {stats.truncated ? (
              <p className="self-center text-sm text-ink-soft">
                Showing the most recent {stats.total} records (fetch cap reached).
              </p>
            ) : null}
          </div>

          <StatCard title="Completions over time (by week)">
            <StatBars
              buckets={stats.completionsByWeek as readonly Bucket[]}
              total={stats.total}
            />
          </StatCard>

          <div className="grid gap-4 md:grid-cols-2">
            <StatCard title="By age">
              <StatBars buckets={stats.byAge} total={stats.total} />
            </StatCard>
            <StatCard title="By gender">
              <StatBars buckets={stats.byGender} total={stats.total} />
            </StatCard>
            <StatCard title="By city">
              <StatBars buckets={stats.byCity} total={stats.total} />
            </StatCard>
            <StatCard title="By language">
              <StatBars buckets={stats.byLanguage} total={stats.total} />
            </StatCard>
            <StatCard title="By validity">
              <StatBars buckets={stats.byValidity} total={stats.total} />
            </StatCard>
          </div>

          <StatCard title="Band distribution by index (anonymous, aggregate)">
            <div className="grid gap-5 md:grid-cols-2">
              {stats.indexBands.map((dist) => (
                <div key={dist.index}>
                  <h3 className="mb-2 text-sm font-semibold text-ink">{dist.label}</h3>
                  <StatBars
                    buckets={dist.bands.map((b) => ({
                      key: bandLabel(b.key),
                      count: b.count
                    }))}
                    total={stats.total}
                  />
                </div>
              ))}
            </div>
          </StatCard>
        </div>
      )}
    </section>
  );
}
