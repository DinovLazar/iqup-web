'use client';

import {ArrowLeft} from 'lucide-react';

/**
 * Sticky progress header: a Back affordance, a continuous progress bar, and the
 * "Question X of Y" label announced to screen readers via an aria-live region
 * (so question changes are spoken). 44px touch targets throughout.
 */
export function ProgressHeader({
  current,
  total,
  backLabel,
  progressLabel,
  progressAria,
  onBack
}: {
  current: number;
  total: number;
  backLabel: string;
  progressLabel: string;
  progressAria: string;
  onBack: () => void;
}) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors outline-none hover:bg-secondary-tint hover:text-secondary-ink focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <div
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuetext={progressAria}
          className="h-3 flex-1 overflow-hidden rounded-full bg-secondary-tint"
        >
          <div
            className="h-full rounded-full bg-hero transition-[width] duration-500 ease-out"
            style={{width: `${percent}%`}}
          />
        </div>
      </div>
      <p
        className="pl-14 text-sm font-semibold text-ink-soft"
        aria-live="polite"
      >
        {progressLabel}
      </p>
    </div>
  );
}
