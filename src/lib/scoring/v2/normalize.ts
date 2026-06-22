/**
 * Raw → 0–100 index normalisation (spec Прилог B.2), verbatim. 50 = typical for
 * the age; every result is clamped to [8, 99] so the extremes never produce a
 * hard 0/100 or a NaN.
 *
 *   accuracy-based: index = clamp(round(20 + accuracy_weighted*75), 8, 99)
 *   span:           index = clamp(round(50 + (span − expected)*14),  8, 99)
 *   speed:          index = clamp(round(50 + (net_per_time − expected)*6), 8, 99)
 *
 * Per-age normalisation:
 *   • span and speed carry an explicit per-age `expected` term (Прилог B.1 / the
 *     PROVISIONAL speed table in norms);
 *   • the accuracy family folds age in via the ADAPTIVE difficulty — an older
 *     child starts at a higher level and faces harder reached items, and the raw
 *     score weights accuracy by reached-item difficulty. This mirrors WISC-style
 *     adaptive testing, where age enters through the basal/ceiling path.
 */
import {
  ACCURACY_BASE,
  ACCURACY_SCALE,
  INDEX_CLAMP_MAX,
  INDEX_CLAMP_MIN,
  SPAN_BASE,
  SPAN_SCALE,
  SPEED_BASE,
  SPEED_SCALE
} from '@/content/norms';

/** Round then clamp to the [8, 99] index range. Guards against NaN. */
export function clampIndex(value: number): number {
  if (Number.isNaN(value)) return INDEX_CLAMP_MIN;
  return Math.max(INDEX_CLAMP_MIN, Math.min(INDEX_CLAMP_MAX, Math.round(value)));
}

/** Accuracy-based index. `accuracyWeighted` is in [0, 1]. */
export function accuracyIndex(accuracyWeighted: number): number {
  return clampIndex(ACCURACY_BASE + accuracyWeighted * ACCURACY_SCALE);
}

/** Span index. `span` and `expected` are span lengths (number of tiles). */
export function spanIndex(span: number, expected: number): number {
  return clampIndex(SPAN_BASE + (span - expected) * SPAN_SCALE);
}

/** Speed index. `netPerTime` and `expected` are net-correct-per-reference-second. */
export function speedIndex(netPerTime: number, expected: number): number {
  return clampIndex(SPEED_BASE + (netPerTime - expected) * SPEED_SCALE);
}
