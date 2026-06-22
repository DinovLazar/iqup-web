/**
 * Deterministic FIXTURE item-providers + responders for testing the engine and
 * scoring without the real item bank (3.04). These are stubs with a known
 * correct answer and known scoring metadata at every level, so a scripted
 * response sequence has a hand-checkable outcome.
 *
 * Shipped (not test-only) because 3.04 reuses them to test its generators
 * against the same engine contract.
 */
import {nextInt, type Rng} from './prng';
import {
  type Domain,
  type Item,
  type ItemFormat,
  type ItemJudgment,
  type ItemProvider,
  type ItemScoringMeta,
  type Response
} from './types';

/** The sentinel "correct" answer the fixture items expect. */
export const FIXTURE_CORRECT = 'correct';
/** A wrong answer for the fixture items. */
export const FIXTURE_WRONG = 'wrong';

/** Fixture payload — opaque to the engine, read only by the fixture's `judge`. */
interface FixturePayload {
  correctAnswer: string;
  options: string[];
}

/** Build the scoring metadata a fixture item exposes for each domain. */
function metaFor(domain: Domain, level: number): ItemScoringMeta {
  const optionCount = 4;
  switch (domain) {
    case 'Gsm':
      // Span grows with level; the provider maps level→span (3.04 owns the real
      // mapping). Fixture convention: spanLength = level + 2.
      return {spanLength: level + 2, optionCount};
    case 'Gs':
      // A grid whose target/cell counts grow with level.
      return {cellCount: 16 + level, targetCount: 4 + level, optionCount};
    case 'EF':
      // Tower of London known minimum moves grow with level (spec: 2→5).
      return {minMoves: 1 + level, optionCount};
    case 'Glr':
      return {optionCount};
    default:
      return {optionCount};
  }
}

/**
 * A fixture provider. Every item's correct answer is {@link FIXTURE_CORRECT};
 * the per-item id embeds a draw from the domain's PRNG stream so it is unique
 * AND reproducible (which also proves the engine threads the rng correctly).
 */
export function makeFixtureProvider(): ItemProvider {
  return {
    getItem(domain: Domain, level: number, format: ItemFormat, rng: Rng): Item {
      const tag = nextInt(rng, 0, 1_000_000);
      const payload: FixturePayload = {
        correctAnswer: FIXTURE_CORRECT,
        options: [FIXTURE_CORRECT, 'w1', 'w2', 'w3']
      };
      const meta = metaFor(domain, level);
      return {
        id: `${domain}-L${level}-${format}-${tag}`,
        domain,
        level,
        format,
        payload,
        meta,
        judge(response: Response): ItemJudgment {
          if (response.omitted) return {correct: false, credit: 0};
          const correct = response.answer === payload.correctAnswer;
          return {correct, credit: correct ? 1 : 0};
        }
      };
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Responder helpers (test-side answer sources)
// ─────────────────────────────────────────────────────────────────────────────

/** Options for building a fixture response (telemetry defaults are sensible). */
export interface RespondOptions {
  responseTimeMs?: number;
  idleMs?: number;
  selectedPosition?: number;
  omitted?: boolean;
  tappedCells?: number;
}

/** Build a correct response with optional telemetry. */
export function correctResponse(item: Item, opts: RespondOptions = {}): Response {
  return {
    itemId: item.id,
    answer: FIXTURE_CORRECT,
    responseTimeMs: opts.responseTimeMs ?? 1500,
    // `selectedPosition` is opt-in: leaving it unset keeps the same-position-bias
    // flag silent for ordinary sessions (it is exercised explicitly in tests).
    ...(opts.selectedPosition !== undefined ? {selectedPosition: opts.selectedPosition} : {}),
    ...(opts.idleMs !== undefined ? {idleMs: opts.idleMs} : {}),
    ...(opts.omitted ? {omitted: true} : {}),
    ...(opts.tappedCells !== undefined ? {tappedCells: opts.tappedCells} : {})
  };
}

/** Build a wrong response with optional telemetry. */
export function wrongResponse(item: Item, opts: RespondOptions = {}): Response {
  return {
    itemId: item.id,
    answer: FIXTURE_WRONG,
    responseTimeMs: opts.responseTimeMs ?? 1500,
    ...(opts.selectedPosition !== undefined ? {selectedPosition: opts.selectedPosition} : {}),
    ...(opts.idleMs !== undefined ? {idleMs: opts.idleMs} : {}),
    ...(opts.omitted ? {omitted: true} : {}),
    ...(opts.tappedCells !== undefined ? {tappedCells: opts.tappedCells} : {})
  };
}

/** A responder that always answers correctly. */
export function alwaysCorrect(opts: RespondOptions = {}) {
  return (item: Item): Response => correctResponse(item, opts);
}

/** A responder that always answers incorrectly. */
export function alwaysWrong(opts: RespondOptions = {}) {
  return (item: Item): Response => wrongResponse(item, opts);
}

/** A responder that is correct while `item.level <= threshold`, else wrong. */
export function correctUpToLevel(threshold: number, opts: RespondOptions = {}) {
  return (item: Item): Response =>
    item.level <= threshold ? correctResponse(item, opts) : wrongResponse(item, opts);
}

/**
 * A responder driven by an explicit boolean script (true = correct). Reuses the
 * last value once exhausted, so a short script can drive a longer domain.
 */
export function scripted(script: readonly boolean[], opts: RespondOptions = {}) {
  let i = 0;
  return (item: Item): Response => {
    const ok = script[Math.min(i, script.length - 1)] ?? false;
    i += 1;
    return ok ? correctResponse(item, opts) : wrongResponse(item, opts);
  };
}
