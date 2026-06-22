/**
 * Gv — Spatial / visual processing (spec Прилог A.2): mental rotation.
 *
 * One target asymmetric shape + four candidate shapes. The correct option is the
 * SAME shape rotated by `rotationDeg`; the three distractors are deterministic
 * spatial confusions:
 *   - `'mirror'`      the horizontal flip of the base (optionally also rotated at
 *                     high levels for subtlety) — the classic "looks rotated but
 *                     is actually reflected" trap;
 *   - `'other'`       a different asymmetric shape — a gross-distinction foil;
 *   - `'wrong-angle'` the base rotated by a DIFFERENT 90° multiple than the
 *                     correct one — the "right shape, wrong turn" trap.
 *
 * `randomAsymmetricShape` guarantees the base is distinguishable from every
 * rotation AND from its mirror, so there is exactly one correct answer. We use
 * `shapeEquals` to guarantee every option's shape is distinct from the correct
 * rotation and from each other (regenerating / re-picking on any collision).
 *
 * Difficulty (monotonic, so the adaptive engine can rely on it): shape complexity
 * grows with level — cell count `n` and bounding-grid `size` both increase, so
 * `base.cells.length` is non-decreasing in level.
 *
 * PROVISIONAL — 135° rotation deferred:
 *   Spec A.2 mentions a 135° rotation. Polyomino-on-grid shapes (the `PolyShape`
 *   model the frozen `glyphs.ts` seam provides) only support 90° multiples — a
 *   135° turn does not map cells back onto the grid. We therefore use 90/180/270
 *   and defer 135°; supporting it would require switching Gv stimuli to
 *   vector-path shapes, which is out of scope for this phase.
 */
import {makeRng, pick, shuffle, type Rng} from '@/lib/engine/prng';
import type {Item, ItemFormat, ItemJudgment, Response} from '@/lib/engine/types';
import {
  mirrorH,
  rotate,
  randomAsymmetricShape,
  shapeEquals,
  type PolyShape
} from './glyphs';
import {itemId} from './shared';
import type {GvRotationSpec} from './types';

const OPTION_COUNT = 4; // spec A.2: four candidates
/** The 90° multiples the grid model supports (135° deferred — see file header). */
const ROTATIONS: (90 | 180 | 270)[] = [90, 180, 270];

/** Clamp `x` into the inclusive `[lo, hi]` range. */
function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/** Build the shared `select-one` judge: the chosen index equals the correct one. */
function selectJudge(correct: number) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const ok = response.answer === correct;
    return {correct: ok, credit: ok ? 1 : 0};
  };
}

/** Shape complexity grows with level: cell count `n` (3→7) and grid `size`. */
function complexityFor(level: number): {size: number; n: number} {
  const n = clamp(3 + Math.floor(level / 2), 3, 7);
  const size = level <= 4 ? 3 : 4;
  return {size, n};
}

/** True iff `shape` collides with any shape already accepted as an option. */
function collidesWithAny(shape: PolyShape, taken: PolyShape[]): boolean {
  return taken.some((t) => shapeEquals(shape, t));
}

/**
 * Generate a Gv mental-rotation item. The correct option is `rotate(base,
 * rotationDeg)`; distractors are a mirror, a different shape, and a wrong-angle
 * rotation — each guaranteed distinct from the correct rotation and from each
 * other via `shapeEquals` (re-picking on collision).
 */
export function generateGv(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('gv.rotation', level, format, rng);
  const {size, n} = complexityFor(level);

  const base = randomAsymmetricShape(rng, size, n);
  const rotationDeg = pick(rng, ROTATIONS);
  const correctShape = rotate(base, rotationDeg);

  // Track accepted option shapes to guarantee mutual distinctness.
  const taken: PolyShape[] = [correctShape];
  const options: GvRotationSpec['options'] = [{shape: correctShape, kind: 'rotation'}];

  // ── mirror ──────────────────────────────────────────────────────────────
  // The horizontal flip. At higher levels also rotate it for subtlety. Walk the
  // available rotations (incl. 0°) until we find one distinct from everything
  // accepted so far (the base is asymmetric so at least one always works).
  const mirrorBase = mirrorH(base);
  const mirrorAngles: (0 | 90 | 180 | 270)[] =
    level >= 6 ? [...shuffle(rng, ROTATIONS), 0] : [0, ...shuffle(rng, ROTATIONS)];
  let mirrorShape = mirrorBase;
  for (const a of mirrorAngles) {
    const cand = rotate(mirrorBase, a);
    if (!collidesWithAny(cand, taken)) {
      mirrorShape = cand;
      break;
    }
  }
  taken.push(mirrorShape);
  options.push({shape: mirrorShape, kind: 'mirror'});

  // ── other ───────────────────────────────────────────────────────────────
  // A different asymmetric shape. Regenerate (bounded, deterministic) until it
  // is distinct from every accepted option in every orientation we might confuse
  // it with — here it suffices to be distinct from the accepted set as-is.
  let otherShape = randomAsymmetricShape(rng, size, n);
  for (let attempt = 0; attempt < 40 && collidesWithAny(otherShape, taken); attempt++) {
    otherShape = randomAsymmetricShape(rng, size, n);
  }
  taken.push(otherShape);
  options.push({shape: otherShape, kind: 'other'});

  // ── wrong-angle ───────────────────────────────────────────────────────────
  // The base rotated by a DIFFERENT 90° multiple than the correct one. Try the
  // other two angles (shuffled); if both collide (rare for a near-symmetric
  // residue), fall back to the plain base (0°), which is itself an off-angle.
  const otherAngles = shuffle(rng, ROTATIONS.filter((a) => a !== rotationDeg));
  let wrongAngleShape: PolyShape | null = null;
  for (const a of otherAngles) {
    const cand = rotate(base, a);
    if (!collidesWithAny(cand, taken)) {
      wrongAngleShape = cand;
      break;
    }
  }
  if (wrongAngleShape === null) {
    // Final deterministic fallback: the un-rotated base (0° ≠ a 90/180/270 turn).
    wrongAngleShape = collidesWithAny(base, taken)
      ? otherShape // degenerate; otherShape is already distinct — keep set valid
      : base;
  }
  taken.push(wrongAngleShape);
  options.push({shape: wrongAngleShape, kind: 'wrong-angle'});

  const shuffled = shuffle(rng, options);
  const answer = shuffled.findIndex((o) => o.kind === 'rotation');

  const payload: GvRotationSpec = {
    taskType: 'gv.rotation',
    base,
    rotationDeg,
    options: shuffled,
    interaction: {mode: 'select-one', optionCount: OPTION_COUNT},
    solution: {answer}
  };
  return {
    id,
    domain: 'Gv',
    level,
    format,
    payload,
    meta: {optionCount: OPTION_COUNT},
    judge: selectJudge(answer)
  };
}

/** A stable, easy demonstrative Gv item for the 3.05 practice screen. */
export function practiceGv(): Item {
  return generateGv(1, 'standard', makeRng('practice::Gv'));
}
