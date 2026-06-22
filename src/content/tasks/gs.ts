/**
 * Gs — Processing speed (spec Прилог A.4): timed symbol search, the ONLY timed
 * task in the battery. A grid of glyphs is shown; the child taps every target
 * glyph before the time budget runs out. The clock itself is captured at runtime
 * by 3.05 — this generator only carries the budget (`timeBudgetMs`) and the
 * target set (`targetPositions`). The v2 scoring layer (`gsNetPerTime`) then
 * computes `(correct − 0.5·errors)/time` from the judged `credit` × `targetCount`
 * over the captured effective seconds.
 *
 * Scoring-meta fidelity contract (read before touching `meta`):
 *  - `gsNetPerTime` (scoring/v2/raw.ts) reads `meta.targetCount` and `creditOf`;
 *  - `detectSpeedGaming` (validity/flags.ts) reads `response.tappedCells` and
 *    `meta.cellCount`.
 * So every Gs item MUST carry BOTH `cellCount` AND `targetCount` in `meta`.
 *
 * Credit (Decisions #136, #141): `credit = (correct − 0.5·errors)/targets`
 * clamped to [0, 1] — already net of the 0.5·error penalty, so the scoring layer
 * stays generator-agnostic. The full correct tap-set → credit 1; `[]` → credit 0.
 * The known ~46 Gs floor artifact (#136) is OUT OF SCOPE here.
 *
 * ── PROVISIONAL (flagged) ──────────────────────────────────────────────────
 * The spec gives the grid size as a by-age range (18–28 cells) and the budget as
 * a range (20–25s), but NOT a per-level table. The exact level→(cellCount,
 * targetCount, timeBudgetMs) mappings below are PROVISIONAL: chosen monotonic in
 * level and inside the spec ranges, pending a norming/UX review.
 */
import {makeRng, pick, shuffle, type Rng} from '@/lib/engine/prng';
import type {Item, ItemFormat, ItemJudgment, Response} from '@/lib/engine/types';
import {GLYPHS, type Glyph} from './glyphs';
import {itemId} from './shared';
import type {GsSymbolSearchSpec} from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * PROVISIONAL — total cells, monotonic in level, inside the spec 18–28 range.
 * Factored into cols×rows below (so the realised cellCount = cols*rows).
 */
function cellCountFor(level: number): number {
  return clamp(16 + 2 * level, 18, 28);
}

/**
 * Factor a target cell count into cols×rows. cols ∈ {5,6}; rows = round(n/cols);
 * the realised cellCount = cols*rows, re-clamped into [18,28].
 */
function gridFor(level: number): {cols: number; rows: number; cellCount: number} {
  const target = cellCountFor(level);
  const cols = target % 6 === 0 || target >= 24 ? 6 : 5;
  let rows = Math.round(target / cols);
  let cellCount = cols * rows;
  // Keep the realised count inside the spec range.
  while (cellCount < 18) {
    rows += 1;
    cellCount = cols * rows;
  }
  while (cellCount > 28) {
    rows -= 1;
    cellCount = cols * rows;
  }
  return {cols, rows, cellCount};
}

/**
 * PROVISIONAL — number of planted target cells, monotonic in level, never more
 * than 45% of the grid (so the field always has a clear non-target majority).
 */
function targetCountFor(level: number, cellCount: number): number {
  return clamp(3 + level, 3, Math.floor(cellCount * 0.45));
}

/** PROVISIONAL — time budget (ms), monotonic in level, inside the spec 20–25s. */
function timeBudgetFor(level: number): number {
  return clamp(20000 + level * 500, 20000, 25000);
}

/** Build the multi-tap-timed judge for a fixed target set + target count. */
function symbolSearchJudge(targetPositions: number[], targetCount: number) {
  const targetSet = new Set(targetPositions);
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const taps = Array.isArray(response.answer) ? (response.answer as number[]) : [];
    const unique = new Set(taps);
    let correctTaps = 0;
    let falseTaps = 0;
    for (const t of unique) {
      if (targetSet.has(t)) correctTaps += 1;
      else falseTaps += 1;
    }
    const credit = clamp((correctTaps - 0.5 * falseTaps) / targetCount, 0, 1);
    const correct = correctTaps === targetCount && falseTaps === 0;
    return {correct, credit};
  };
}

/** Generate one Gs timed-symbol-search item at `level`. Pure given the rng state. */
export function generateGs(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('gs.symbolSearch', level, format, rng);
  const {cols, rows, cellCount} = gridFor(level);
  const targetCount = targetCountFor(level, cellCount);

  // Pick 1 target glyph (2 at higher levels) + the non-target pool.
  const nTargets = level >= 6 ? 2 : 1;
  const glyphPool = shuffle(rng, GLYPHS);
  const targets = glyphPool.slice(0, nTargets) as Glyph[];
  const nonTargets = glyphPool.slice(nTargets) as Glyph[];

  // Choose distinct target positions, then sort them (the canonical answer set).
  const allPositions = shuffle(
    rng,
    Array.from({length: cellCount}, (_, i) => i)
  );
  const targetPositions = allPositions.slice(0, targetCount).sort((a, b) => a - b);
  const targetPosSet = new Set(targetPositions);

  // Lay out the field: planted positions get a target glyph; everything else a
  // non-target glyph (so ONLY the planted positions count as targets).
  const cells: Glyph[] = [];
  for (let i = 0; i < cellCount; i++) {
    cells.push(targetPosSet.has(i) ? pick(rng, targets) : pick(rng, nonTargets));
  }

  const timeBudgetMs = timeBudgetFor(level);

  const payload: GsSymbolSearchSpec = {
    taskType: 'gs.symbolSearch',
    cols,
    rows,
    cells,
    targets,
    targetPositions,
    timeBudgetMs,
    interaction: {mode: 'multi-tap-timed', timeBudgetMs},
    solution: {answer: targetPositions}
  };

  return {
    id,
    domain: 'Gs',
    level,
    format,
    payload,
    // Scoring-meta fidelity contract: BOTH fields required (see header).
    meta: {cellCount, targetCount},
    judge: symbolSearchJudge(targetPositions, targetCount)
  };
}

/** A stable, easy demonstrative Gs item for the 3.05 practice screen. */
export function practiceGs(): Item {
  return generateGs(1, 'standard', makeRng('practice::Gs'));
}
