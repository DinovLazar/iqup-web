/**
 * Gsm — Memory span / Corsi block-tapping (spec Прилог A.3).
 *
 * A FIXED board of 6 scattered tiles is shown; a sequence of `span` tile ids is
 * revealed one tile at a time (700 ms/tile), then hidden; the child reproduces
 * the order by tapping. Forward for all ages; **backward from age 8** — the
 * engine decides which and passes `format` (`'forward'` | `'backward'`); we
 * HONOUR it. The span length IS the difficulty, and the v2 scoring layer reads
 * the longest correct span back off `meta.spanLength` + the item's `format`
 * (see `@/lib/scoring/v2/raw.ts` `maxCorrectSpan`), so both MUST be carried
 * faithfully on the Item.
 *
 * ── PROVISIONAL FLAGS ────────────────────────────────────────────────────────
 *  (1) tiles vs span. The spec fixes the board at SIX tiles (`tileCount = 6`),
 *      yet Прилог B.1 expects forward span up to 7 (age 13). A 7-long sequence
 *      of *distinct* tiles is impossible on a 6-tile board without revisiting a
 *      tile, so we ALLOW non-consecutive repeats in the presentation sequence
 *      (never two identical ids back-to-back — that would be ambiguous to tap).
 *      Revisiting the board would change the apparatus; flagged for review.
 *  (2) level→span mapping. The spec tabulates AGE→span (Прилог B.1), not
 *      LEVEL→span. The engine works in levels (1–10), so we map level→span via a
 *      monotonic-non-decreasing formula tuned to track the age-keyed start
 *      levels of `EXPECTED_SPAN_FORWARD` (age 5 starts L1 → span 4; age 13 starts
 *      L8 → span 7). This is a defensible default, not a spec-given table.
 */
import {makeRng, nextInt, type Rng} from '@/lib/engine/prng';
import type {Item, ItemFormat, ItemJudgment, Response} from '@/lib/engine/types';
import {arraysEqual, itemId} from './shared';
import type {GsmCorsiSpec} from './types';

/** Spec Прилог A.3: a six-tile board. */
const TILE_COUNT = 6;
/** Spec Прилог A.3: each tile is revealed for 700 ms. */
const REVEAL_MS = 700;

/**
 * A STABLE scattered layout of the 6 tiles in unit coordinates (0..1 on both
 * axes) — a loose 3×2 scatter, jittered off the grid so it reads as a board of
 * blocks rather than a table. Identical on every call (no rng). The renderer
 * (3.05) lays the tiles out at these positions.
 */
const TILE_LAYOUT: ReadonlyArray<{id: number; x: number; y: number}> = [
  {id: 0, x: 0.18, y: 0.22},
  {id: 1, x: 0.74, y: 0.16},
  {id: 2, x: 0.45, y: 0.4},
  {id: 3, x: 0.82, y: 0.58},
  {id: 4, x: 0.24, y: 0.72},
  {id: 5, x: 0.6, y: 0.82}
];

/**
 * Map an engine level (1–10) to a memory span. PROVISIONAL (flag 2 above):
 * `clamp(round(3 + level*0.5), 2, 9)`. Monotonic non-decreasing in level, and at
 * the age-keyed start levels it tracks `EXPECTED_SPAN_FORWARD`: L1→4 (age 5
 * expects 4), L8→7 (age 13 expects 7).
 */
export function spanForLevel(level: number): number {
  const raw = Math.round(3 + level * 0.5);
  return Math.max(2, Math.min(9, raw));
}

/**
 * Draw `span` tile ids from the 6-tile board, allowing non-consecutive repeats
 * (so spans > 6 are representable) but NEVER two identical consecutive ids.
 */
function drawSequence(span: number, rng: Rng): number[] {
  const seq: number[] = [];
  for (let i = 0; i < span; i++) {
    let next = nextInt(rng, 0, TILE_COUNT - 1);
    // Reroll while it duplicates the immediately preceding tile (ambiguous tap).
    while (i > 0 && next === seq[i - 1]) {
      next = nextInt(rng, 0, TILE_COUNT - 1);
    }
    seq.push(next);
  }
  return seq;
}

/** Build the Corsi judge: the tapped tile-id order must equal the solution exactly. */
function corsiJudge(answer: number[]) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const given = response.answer;
    if (!Array.isArray(given)) return {correct: false, credit: 0};
    const ok = arraysEqual(given as number[], answer);
    return {correct: ok, credit: ok ? 1 : 0};
  };
}

/**
 * Generate a Gsm (Corsi) item at `level` in the requested `format`. Pure given
 * the rng state. The presentation `sequence` is always in show-order; the
 * `solution.answer` is the tap-order the child must reproduce (reversed for the
 * backward condition).
 */
export function generateGsm(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('gsm.corsi', level, format, rng);
  const span = spanForLevel(level);
  const direction: 'forward' | 'backward' = format === 'backward' ? 'backward' : 'forward';

  const sequence = drawSequence(span, rng);
  // The tile-id order the child must TAP: same for forward, reversed for backward.
  const answer = direction === 'backward' ? [...sequence].reverse() : sequence;

  const payload: GsmCorsiSpec = {
    taskType: 'gsm.corsi',
    tiles: TILE_LAYOUT.map((t) => ({...t})),
    sequence,
    direction,
    revealMs: REVEAL_MS,
    interaction: {mode: 'tap-sequence', tileCount: TILE_COUNT, length: span, direction, revealMs: REVEAL_MS},
    solution: {answer}
  };

  return {
    id,
    domain: 'Gsm',
    level,
    // Pass the engine's format straight through — the scoring layer reads it
    // ('backward' vs else) alongside meta.spanLength (raw.ts maxCorrectSpan).
    format,
    payload,
    meta: {spanLength: span},
    judge: corsiJudge(answer)
  };
}

/** A stable, easy demonstrative Gsm item for the 3.05 practice screen. */
export function practiceGsm(): Item {
  return generateGsm(1, 'forward', makeRng('practice::Gsm'));
}
