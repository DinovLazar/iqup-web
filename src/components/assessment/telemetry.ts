/**
 * Silent timing + telemetry capture for the live flow (spec Дел 8). Everything
 * here is read by the scoring + validity layers and is captured WITHOUT a visible
 * counter (the only visible timer is the Gs countdown, which the Gs renderer owns
 * separately). Times are never shown to the child.
 *
 *  - response time: wall-clock from when an item became answerable to the answer;
 *  - idle / blur gaps: time the tab was hidden or the page lost focus during the
 *    item, accrued and reported on `idleMs` (excluded from time analysis + feeds
 *    the idle validity flag);
 *  - the device tap-baseline: the median tap latency captured by the first
 *    practice (spec 7.2), so downstream timing is read as calibration-relative
 *    patterns, not raw milliseconds.
 *
 * Determinism note: these are runtime measurements, NOT on the engine's
 * deterministic item-selection path (which keys only off age + seed + answers).
 * The baseline + per-item times flow into scoring, never into which item appears.
 */
import {useCallback, useEffect, useRef} from 'react';

/** A monotonic clock that does not jump on system-clock changes. */
function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * Tracks one item's elapsed answerable time and any idle/blur gaps. Call
 * `start()` when the item becomes answerable (after a Corsi reveal, after the
 * instruction is shown), then `stop()` to read `{responseTimeMs, idleMs}`.
 * Idle accrues whenever the document is hidden / the window is blurred.
 */
export function useItemTimer() {
  const startedAt = useRef<number | null>(null);
  const idleMs = useRef(0);
  const blurAt = useRef<number | null>(null);

  useEffect(() => {
    function onHide() {
      if (document.visibilityState === 'hidden') blurAt.current = now();
      else if (blurAt.current !== null) {
        idleMs.current += now() - blurAt.current;
        blurAt.current = null;
      }
    }
    function onBlur() {
      if (blurAt.current === null) blurAt.current = now();
    }
    function onFocus() {
      if (blurAt.current !== null) {
        idleMs.current += now() - blurAt.current;
        blurAt.current = null;
      }
    }
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const start = useCallback(() => {
    startedAt.current = now();
    idleMs.current = 0;
    blurAt.current = null;
  }, []);

  const stop = useCallback((): {responseTimeMs: number; idleMs: number} => {
    const began = startedAt.current ?? now();
    // Settle any open blur gap so a tab-away at the moment of answering counts.
    if (blurAt.current !== null) {
      idleMs.current += now() - blurAt.current;
      blurAt.current = null;
    }
    const total = Math.max(0, Math.round(now() - began));
    const idle = Math.min(total, Math.round(idleMs.current));
    // Response time excludes the idle/blur gaps (spec Дел 8: gaps are excluded).
    return {responseTimeMs: Math.max(0, total - idle), idleMs: idle};
  }, []);

  return {start, stop};
}

/** The reference baseline used if calibration somehow produced nothing usable. */
export const FALLBACK_BASELINE_MS = 600;

/**
 * Reduce a set of raw tap latencies (ms) to a single device baseline: the median
 * (robust to one stray slow/fast tap), clamped to a sane range so a child who
 * dawdles or double-taps during calibration cannot distort downstream scoring.
 * Returns the fallback when there is no usable sample.
 */
export function baselineFromTaps(latenciesMs: readonly number[]): number {
  const usable = latenciesMs.filter((m) => Number.isFinite(m) && m > 0);
  if (usable.length === 0) return FALLBACK_BASELINE_MS;
  const sorted = [...usable].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  // Clamp: a real per-tap baseline lives roughly between 150ms and 2s.
  return Math.round(Math.min(2000, Math.max(150, median)));
}
