'use client';

import {useEffect, useMemo, useSyncExternalStore} from 'react';
import type {Locale} from '@/content/locale';
import type {StrengthCode} from '@/content/strengths';
import {Link, useRouter} from '@/i18n/navigation';
import {
  TEST_RESULT_STORAGE_KEY,
  isTestResult,
  type TestResult
} from '@/lib/scoring';
import {
  LEAD_CONTEXT_STORAGE_KEY,
  isLeadContext,
  type LeadContext
} from '@/lib/leads/lead-context';
import {Button} from '@/components/ui/button';
import {StrengthChip} from '@/components/test/StrengthChip';

/** Copy for the temporary result placeholder (resolved server-side). */
export interface ResultCopy {
  badge: string;
  /** Template with `{name}`. */
  heading: string;
  intro: string;
  topStrengthsLabel: string;
  note: string;
  home: string;
}

/** No-op subscribe — the hand-off is read once after mount and never changes. */
const subscribe = () => () => {};

/**
 * Snapshot the two sessionStorage entries as one stable string (a JSON array of
 * the two raw entries). Returning a value-stable string (sessionStorage doesn't
 * change here) keeps `useSyncExternalStore` from looping; the parse happens in a
 * memo. `null` on the server / during hydration (getServerSnapshot), so the
 * first client paint matches the server (neutral state) — no hydration mismatch.
 */
function readSnapshot(): string {
  try {
    return JSON.stringify([
      window.sessionStorage.getItem(TEST_RESULT_STORAGE_KEY),
      window.sessionStorage.getItem(LEAD_CONTEXT_STORAGE_KEY)
    ]);
  } catch {
    return '[null,null]';
  }
}

function parseEntry<T>(raw: unknown, guard: (v: unknown) => v is T): T | null {
  if (typeof raw !== 'string' || raw === '') return null;
  try {
    const value: unknown = JSON.parse(raw);
    return guard(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * TEMPORARY result stand-in (Phase 1.08). Reads the persisted `TestResult` and
 * the post-gate lead context from sessionStorage and shows the child's first
 * name + their top 3 strengths (codes → bilingual display names). NO total, NO
 * IQ, NO certificate — strengths only, clearly labelled as a placeholder.
 *
 * PLUGS INTO 1.10: this island is replaced by the real strengths profile +
 * shareable certificate. 1.10 reads the SAME hand-off (`iqup.testResult.v1` +
 * `iqup.leadContext.v1`) and renders the spec §6 templates from
 * `src/content/results/`. The access guard and the no-total/no-IQ rule below
 * carry over unchanged.
 */
export function ResultPlaceholder({
  locale,
  copy
}: {
  locale: Locale;
  copy: ResultCopy;
}) {
  const router = useRouter();
  // `null` on the server / during hydration; the raw snapshot on the client.
  const snapshot = useSyncExternalStore<string | null>(
    subscribe,
    readSnapshot,
    () => null
  );

  const view = useMemo(() => {
    if (snapshot === null) return null; // not yet read on the client
    let entries: unknown;
    try {
      entries = JSON.parse(snapshot);
    } catch {
      return null;
    }
    if (!Array.isArray(entries)) return null;
    const result: TestResult | null = parseEntry(entries[0], isTestResult);
    const context: LeadContext | null = parseEntry(entries[1], isLeadContext);
    if (!result || !context) return null;
    return {
      name: context.childFirstName,
      top: [result.top1, result.top2, result.top3] as StrengthCode[]
    };
  }, [snapshot]);

  // Guard: /result is only reachable after the gate. Once read on the client and
  // either piece is missing → home. This protects lead capture (no deep-linking
  // past the gate) and is the natural fallback after sessionStorage clears.
  const missing = snapshot !== null && view === null;
  useEffect(() => {
    if (missing) router.replace('/');
  }, [missing, router]);

  // Brief neutral state while reading sessionStorage / redirecting.
  if (!view) return <div className="min-h-[40vh]" aria-hidden />;

  const heading = copy.heading.replace(/\{name\}/g, view.name);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-10 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warning-tint)] px-3 py-1 text-xs font-bold tracking-wide text-[var(--warning-ink)] uppercase">
        {copy.badge}
      </span>

      <h1 className="font-display text-3xl font-extrabold text-balance text-ink">
        {heading}
      </h1>
      <p className="text-pretty text-ink-soft">{copy.intro}</p>

      <div className="w-full rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <p className="mb-3 text-xs font-bold tracking-wide text-ink-soft uppercase">
          {copy.topStrengthsLabel}
        </p>
        <ol className="flex flex-col gap-3">
          {view.top.map((code, i) => (
            <li key={code} className="flex items-center gap-3">
              <span className="w-5 font-display text-lg font-bold text-ink-soft">
                {i + 1}
              </span>
              <StrengthChip code={code} locale={locale} />
            </li>
          ))}
        </ol>
      </div>

      <p className="text-pretty text-sm text-ink-soft">{copy.note}</p>

      <Button asChild variant="ghost" className="font-semibold text-secondary-ink">
        <Link href="/">{copy.home}</Link>
      </Button>
    </div>
  );
}
