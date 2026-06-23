/**
 * The **multi-tap-timed** interaction primitive — the Gs symbol-search field
 * (interaction `mode: 'multi-tap-timed'`). This is the ONE task with a visible
 * countdown (spec Дел 8 / brand §6): every other task is silently timed. The
 * child taps every target glyph before time runs out; tapping a marked cell
 * unmarks it. On time-up (or "Done") it submits the sorted marked-cell indices
 * (the canonical `Response.answer` for Gs) and reports `tappedCells` (the marked
 * count → the speed-gaming "smearing" flag).
 *
 * The countdown is intentionally calm: a shrinking bar + a seconds readout, ample
 * contrast, no red-alarm styling. `aria-live` is polite and coarse (announces at
 * the start + the final few seconds) so it informs without nagging.
 */
'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/utils';
import type {GsSymbolSearchSpec} from '@/content/tasks';
import {Glyph} from '../visuals/Glyph';

export function TapField({
  spec,
  targetLabel,
  timerLabel,
  doneLabel,
  onSubmit,
  reducedMotion = false,
  assist = false
}: {
  spec: GsSymbolSearchSpec;
  /** Localized "find this" caption naming the target glyph(s). */
  targetLabel: string;
  /** Localized countdown label (e.g. "Time left"). */
  timerLabel: string;
  /** Localized submit-early label. */
  doneLabel: string;
  /** Submits the marked indices + the marked-cell count (tappedCells). */
  onSubmit: (answer: number[], tappedCells: number) => void;
  reducedMotion?: boolean;
  assist?: boolean;
}) {
  const {cols, cells, targets, timeBudgetMs} = spec;
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [remainingMs, setRemainingMs] = useState(timeBudgetMs);
  const submittedRef = useRef(false);
  const markedRef = useRef(marked);
  useEffect(() => {
    markedRef.current = marked;
  }, [marked]);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const indices = [...markedRef.current].sort((a, b) => a - b);
    onSubmit(indices, markedRef.current.size);
  }, [onSubmit]);

  // The countdown drives the only visible timer in the whole flow.
  useEffect(() => {
    const startedAt =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    let raf = 0;
    const tick = () => {
      const elapsed =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        startedAt;
      const left = Math.max(0, timeBudgetMs - elapsed);
      setRemainingMs(left);
      if (left <= 0) {
        submit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [timeBudgetMs, submit]);

  const toggle = (index: number) => {
    if (submittedRef.current) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const pct = Math.max(0, Math.min(100, (remainingMs / timeBudgetMs) * 100));
  const tileSize = assist ? 64 : 52;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* The target legend — what to look for (shape + name, not colour-only). */}
      <div className="flex items-center gap-2 rounded-card bg-field px-3 py-2">
        <span className="text-sm font-semibold text-ink-soft">{targetLabel}</span>
        {targets.map((g, i) => (
          <Glyph key={i} glyph={g} size={28} />
        ))}
      </div>

      {/* The calm visible countdown. */}
      <div className="w-full max-w-sm">
        <div className="mb-1 flex items-center justify-between text-sm font-semibold text-ink-soft">
          <span>{timerLabel}</span>
          <span aria-live="polite" aria-atomic className="tabular-nums">
            {secondsLeft <= 5 ? `${secondsLeft}s` : ''}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-field">
          <div
            className={cn(
              'h-full rounded-full bg-iq-orange',
              !reducedMotion && 'transition-[width] duration-200 ease-linear'
            )}
            style={{width: `${pct}%`}}
            role="progressbar"
            aria-label={timerLabel}
            aria-valuemin={0}
            aria-valuemax={Math.round(timeBudgetMs / 1000)}
            aria-valuenow={secondsLeft}
          />
        </div>
      </div>

      {/* The search grid. */}
      <div
        className="grid gap-1.5"
        style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`}}
        role="group"
        aria-label={targetLabel}
      >
        {cells.map((g, i) => {
          const isMarked = marked.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isMarked}
              className={cn(
                'flex items-center justify-center rounded-lg border-2 bg-card transition-colors',
                'focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none',
                isMarked
                  ? 'border-iq-violet bg-iq-violet/10'
                  : 'border-border hover:border-iq-violet/50'
              )}
              style={{width: tileSize, height: tileSize}}
            >
              <Glyph glyph={g} size={tileSize - 18} />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={submit}
        className="flex min-h-tap w-full max-w-sm items-center justify-center rounded-card bg-iq-violet px-6 font-brand text-base font-semibold text-white transition-colors hover:bg-iq-violet/90 focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none"
      >
        {doneLabel}
      </button>
    </div>
  );
}
