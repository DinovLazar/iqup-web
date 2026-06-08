import {PartyPopper} from 'lucide-react';
import type {Locale} from '@/content/locale';
import {STRENGTHS} from '@/content/strengths';
import type {TestResult} from '@/lib/scoring';
import type {TestCopy} from './copy';
import {StrengthChip} from './StrengthChip';

/**
 * Deliberately temporary "test complete" view. This is where the flow ends for
 * Phase 1.07: the result is already computed and saved to sessionStorage.
 *
 * HANDOFF (1.08): the email gate intercepts here — between test completion and
 * the results screen — to capture the parent's email before Phase 1.10 renders
 * the strengths profile from the persisted `TestResult`. Nothing sensitive is in
 * the URL; the result lives only in sessionStorage.
 */
export function CompletionView({
  copy,
  dev,
  result,
  locale
}: {
  copy: TestCopy;
  dev: boolean;
  result: TestResult | null;
  locale: Locale;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-hero-tint text-hero-strong">
        <PartyPopper className="size-10" aria-hidden />
      </span>

      <h1 className="max-w-md font-display text-3xl font-extrabold text-ink text-balance">
        {copy.completion.title}
      </h1>
      <p className="max-w-md text-lg text-ink-soft text-pretty">
        {copy.completion.body}
      </p>
      <p className="text-sm font-semibold text-secondary-ink">{copy.completion.note}</p>

      {/* Dev-only: a plain summary of the computed strengths so the full flow can
          be verified end-to-end. Gated on the `dev` flag → never in production. */}
      {dev && result ? (
        <div className="mt-6 w-full max-w-md rounded-2xl border border-dashed border-input bg-canvas p-4 text-left">
          <p className="mb-3 text-xs font-bold tracking-wide text-ink-faint uppercase">
            dev · computed TestResult ({result.band} · {result.locale})
          </p>
          <ol className="flex flex-col gap-2">
            {result.strengths.map((s) => (
              <li key={s.code} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-5 font-mono text-ink-faint">{s.rank}.</span>
                  <StrengthChip code={s.code} locale={locale} />
                </span>
                <span className="font-mono text-xs text-ink-soft">
                  {s.hits}/{s.total} ({s.ratio.toFixed(2)}) · {s.tier}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-faint">
            top: {STRENGTHS[result.top1].name.en} + {STRENGTHS[result.top2].name.en}
          </p>
        </div>
      ) : null}
    </div>
  );
}
