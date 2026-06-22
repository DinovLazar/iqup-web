/**
 * Per-domain RAW score computation from a domain's adaptive run (spec Дел 6.1).
 *
 *   Gf / Gv / CT / EF / Glr  accuracy weighted by reached-item difficulty
 *   Gsm                      max correct span length (forward + backward)
 *   Gs                       (correct − 0.5·errors) / time  → net per time
 *   Внимание (attention)     derived elsewhere (`@/lib/validity` deriveAttention)
 *
 * Seam note for 3.04: an item's `judge()` returns `credit` in [0, 1]. For the
 * accuracy domains credit = correctness/partial credit; for **EF** credit
 * encodes optimality `min_moves/moves` (+ planning efficiency) and for **Gs**
 * credit encodes the per-grid `(correct − 0.5·errors)/targets` already net of the
 * error penalty — so this layer stays generator-agnostic.
 */
import {REFERENCE_TAP_BASELINE_MS} from '@/content/norms';
import type {DomainRun, DomainRunItem} from '@/lib/engine';

/** Credit in [0, 1] for one item (partial credit if provided, else 0/1). */
export function creditOf(item: DomainRunItem): number {
  const c = item.judgment.credit;
  if (typeof c === 'number') return Math.max(0, Math.min(1, c));
  return item.judgment.correct ? 1 : 0;
}

/**
 * Accuracy weighted by reached-item difficulty: Σ(credit·level) / Σ(level), in
 * [0, 1]. Difficulty-weighting is how age folds in for the accuracy family (the
 * adaptive path gives older children harder reached items). Empty run → 0.
 */
export function weightedAccuracy(run: DomainRun): number {
  let num = 0;
  let den = 0;
  for (const it of run.items) {
    num += creditOf(it) * it.level;
    den += it.level;
  }
  return den > 0 ? num / den : 0;
}

/** Max correct span (Gsm), split by direction. Forward/backward from the item format. */
export function maxCorrectSpan(run: DomainRun): {
  overall: number;
  forward: number;
  backward: number;
} {
  let forward = 0;
  let backward = 0;
  for (const it of run.items) {
    if (!it.judgment.correct) continue;
    const span = it.item.meta?.spanLength ?? 0;
    if (it.item.format === 'backward') backward = Math.max(backward, span);
    else forward = Math.max(forward, span);
  }
  return {overall: Math.max(forward, backward), forward, backward};
}

/** Calibration-relative seconds for a response time (device-independent). */
export function effectiveSeconds(responseTimeMs: number, calibrationBaselineMs: number): number {
  const baseline = calibrationBaselineMs > 0 ? calibrationBaselineMs : REFERENCE_TAP_BASELINE_MS;
  return (responseTimeMs / 1000) * (REFERENCE_TAP_BASELINE_MS / baseline);
}

/**
 * Gs net-correct per reference-second: Σ(credit·targets) / Σ(effectiveSeconds).
 * Credit already nets the 0.5·error penalty (seam note above). Empty/zero-time → 0.
 */
export function gsNetPerTime(run: DomainRun, calibrationBaselineMs: number): number {
  let net = 0;
  let seconds = 0;
  for (const it of run.items) {
    if (it.response.omitted) continue;
    const targets = it.item.meta?.targetCount ?? 1;
    net += creditOf(it) * targets;
    seconds += effectiveSeconds(it.response.responseTimeMs, calibrationBaselineMs);
  }
  return seconds > 0 ? net / seconds : 0;
}

/**
 * Glr learning slope across attempts (spec 6.1 "наклон на учење"): mean credit on
 * the later attempts minus the earlier ones. Uses `meta.attempt` when present,
 * else splits the item order in half. Range roughly [−1, 1]; 0 if too few items.
 */
export function learningSlope(run: DomainRun): number {
  const items = run.items;
  if (items.length < 2) return 0;

  const withAttempt = items.filter((it) => typeof it.item.meta?.attempt === 'number');
  if (withAttempt.length >= 2) {
    const byAttempt = new Map<number, number[]>();
    for (const it of withAttempt) {
      const a = it.item.meta!.attempt as number;
      const list = byAttempt.get(a) ?? [];
      list.push(creditOf(it));
      byAttempt.set(a, list);
    }
    const attempts = [...byAttempt.keys()].sort((x, y) => x - y);
    const mean = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const first = mean(byAttempt.get(attempts[0])!);
    const last = mean(byAttempt.get(attempts[attempts.length - 1])!);
    return last - first;
  }

  // Fallback: first-half vs second-half credit by presentation order.
  const mid = Math.floor(items.length / 2);
  const firstHalf = items.slice(0, mid).map(creditOf);
  const secondHalf = items.slice(mid).map(creditOf);
  const mean = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
  return mean(secondHalf) - mean(firstHalf);
}

/** Mean calibration-relative response time over answered items (for solving style). */
export function meanRelativeRt(run: DomainRun, calibrationBaselineMs: number): number {
  const baseline = calibrationBaselineMs > 0 ? calibrationBaselineMs : REFERENCE_TAP_BASELINE_MS;
  const answered = run.items.filter((it) => !it.response.omitted);
  if (answered.length === 0) return 0;
  const sum = answered.reduce((s, it) => s + it.response.responseTimeMs / baseline, 0);
  return sum / answered.length;
}
