/**
 * Validity FLAGS as pure functions (spec Дел 7.1). Each detector takes the
 * flattened session outcomes and returns a {@link ValidityFlag} or `null`. They
 * never read the DOM or capture telemetry — the live capture is 3.05. Thresholds
 * come from `@/content/norms` (`VALIDITY`), where the spec-given and PROVISIONAL
 * values are documented.
 */
import {VALIDITY} from '@/content/norms';
import type {Domain, ItemScoringMeta, Response} from '@/lib/engine/types';
import type {ValidityFlag} from './types';

/** One answered (or omitted) item, flattened from the session run. */
export interface ResponseOutcome {
  domain: Domain;
  response: Response;
  correct: boolean;
  meta?: ItemScoringMeta;
}

/**
 * Too-fast answers (spec 7.1): RT < ~500ms counts; >30% of answers → STRONG,
 * otherwise a mild flag. Omissions are not "answers" and are excluded.
 */
export function detectTooFast(outcomes: readonly ResponseOutcome[]): ValidityFlag | null {
  const answered = outcomes.filter((o) => !o.response.omitted);
  if (answered.length === 0) return null;
  const fast = answered.filter((o) => o.response.responseTimeMs < VALIDITY.TOO_FAST_MS);
  if (fast.length === 0) return null;
  const rate = fast.length / answered.length;
  return {
    kind: 'too_fast',
    severity: rate > VALIDITY.TOO_FAST_STRONG_RATE ? 'strong' : 'mild',
    detail: {count: fast.length, total: answered.length, rate}
  };
}

/**
 * Same-position picking (spec 7.1): >60% of selections on one option position →
 * a STRONG flag (a clear "just tapping the same spot" pattern). Only responses
 * that carry a `selectedPosition` are considered.
 */
export function detectSamePosition(
  outcomes: readonly ResponseOutcome[]
): ValidityFlag | null {
  const positioned = outcomes.filter(
    (o) => !o.response.omitted && o.response.selectedPosition !== undefined
  );
  if (positioned.length === 0) return null;
  const counts = new Map<number, number>();
  for (const o of positioned) {
    const p = o.response.selectedPosition as number;
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  const maxFreq = Math.max(...counts.values());
  const rate = maxFreq / positioned.length;
  if (rate <= VALIDITY.SAME_POSITION_RATE) return null;
  return {
    kind: 'same_position',
    severity: 'strong',
    detail: {maxFreq, total: positioned.length, rate}
  };
}

/**
 * Excessive idle gaps (spec 7.1 / Дел 8): repeated long pauses are excluded from
 * time analysis; many of them → a (mild) flag. Counts responses whose idle gap
 * exceeded the exclusion threshold.
 */
export function detectIdleGaps(outcomes: readonly ResponseOutcome[]): ValidityFlag | null {
  const longGaps = outcomes.filter((o) => (o.response.idleMs ?? 0) > VALIDITY.IDLE_GAP_MS);
  if (longGaps.length < VALIDITY.IDLE_GAP_FLAG_COUNT) return null;
  return {
    kind: 'idle_gaps',
    severity: 'mild',
    detail: {count: longGaps.length, threshold: VALIDITY.IDLE_GAP_FLAG_COUNT}
  };
}

/**
 * Chance-level accuracy within a single domain (spec 7.1): if a domain has
 * enough items and its accuracy sits within a tolerance of chance (1 / option
 * count), the index it feeds gets LOWER confidence — not a session-wide strong
 * flag. Returns one (mild) flag per chance-level domain.
 */
export function detectChanceLevel(
  outcomes: readonly ResponseOutcome[]
): ValidityFlag[] {
  const byDomain = new Map<Domain, ResponseOutcome[]>();
  for (const o of outcomes) {
    const list = byDomain.get(o.domain) ?? [];
    list.push(o);
    byDomain.set(o.domain, list);
  }
  const flags: ValidityFlag[] = [];
  for (const [domain, list] of byDomain) {
    const answered = list.filter((o) => !o.response.omitted);
    if (answered.length < VALIDITY.CHANCE_MIN_ITEMS) continue;
    const accuracy = answered.filter((o) => o.correct).length / answered.length;
    // Use the option count from the items (default 4 → chance 0.25).
    const optionCount = answered[0]?.meta?.optionCount ?? 4;
    const chance = 1 / optionCount;
    if (Math.abs(accuracy - chance) <= VALIDITY.CHANCE_TOLERANCE) {
      flags.push({
        kind: 'chance_level',
        severity: 'mild',
        domain,
        detail: {accuracy, chance, items: answered.length}
      });
    }
  }
  return flags;
}

/**
 * "Smearing" the speed task (spec 7.1): on Gs, tapping ~all cells with low
 * accuracy is gaming → a STRONG flag on Gs. Uses the per-item tapped-cell count
 * vs the grid's cell count.
 */
export function detectSpeedGaming(
  outcomes: readonly ResponseOutcome[]
): ValidityFlag | null {
  const gs = outcomes.filter((o) => o.domain === 'Gs' && !o.response.omitted);
  if (gs.length === 0) return null;
  let totalTapped = 0;
  let totalCells = 0;
  for (const o of gs) {
    totalTapped += o.response.tappedCells ?? 0;
    totalCells += o.meta?.cellCount ?? 0;
  }
  if (totalCells === 0) return null;
  const tapRate = totalTapped / totalCells;
  const accuracy = gs.filter((o) => o.correct).length / gs.length;
  if (
    tapRate >= VALIDITY.SPEED_GAMING_TAP_RATE &&
    accuracy <= VALIDITY.SPEED_GAMING_MAX_ACCURACY
  ) {
    return {
      kind: 'speed_gaming',
      severity: 'strong',
      domain: 'Gs',
      detail: {tapRate, accuracy, items: gs.length}
    };
  }
  return null;
}

/** Run every detector and return all raised flags. */
export function detectAllFlags(outcomes: readonly ResponseOutcome[]): ValidityFlag[] {
  const flags: ValidityFlag[] = [];
  const tooFast = detectTooFast(outcomes);
  if (tooFast) flags.push(tooFast);
  const samePos = detectSamePosition(outcomes);
  if (samePos) flags.push(samePos);
  const idle = detectIdleGaps(outcomes);
  if (idle) flags.push(idle);
  flags.push(...detectChanceLevel(outcomes));
  const gaming = detectSpeedGaming(outcomes);
  if (gaming) flags.push(gaming);
  return flags;
}
