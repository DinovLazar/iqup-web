/**
 * EF — Executive function / planning (spec Прилог A.5): Tower of London.
 *
 * Classic ToL: 3 pegs with descending capacities `[3, 2, 1]`, 3 colored balls
 * (ids 0,1,2). A move lifts the TOP ball of one peg and drops it on another peg
 * that is below its capacity. The child must transform a `start` configuration
 * into a `goal` configuration in the KNOWN minimum number of moves.
 *
 * The whole state space is tiny (a few dozen reachable, capacity-respecting
 * configurations), so we BFS it exhaustively: from a chosen `start` we compute
 * the shortest-move distance to every reachable state, then pick (seeded) a
 * `goal` whose distance equals `targetMinMoves`. `minMoves` is that BFS-exact
 * distance — carried in both `solution.answer.moves` and `meta.minMoves` (the v2
 * scoring layer reads `meta.minMoves`; Decisions #141: EF credit encodes
 * optimality `minMoves / movesUsed`).
 *
 * Difficulty (spec A.5: minimum 2→5 by level):
 *   targetMinMoves = clamp(level + 1, 2, 7)
 * PROVISIONAL: the spec only fixes the low end (2→5); the extension to a cap of
 * 7 for high levels is provisional (flagged here). Distance ≥ 2 guarantees
 * start ≠ goal, so the "don't move" wrong-answer oracle always fails.
 */
import {makeRng, nextInt, type Rng} from '@/lib/engine/prng';
import type {Item, ItemFormat, ItemJudgment, Response} from '@/lib/engine/types';
import {itemId, pegStateEquals} from './shared';
import type {EfTowerSpec, PegState} from './types';

const CAPACITIES = [3, 2, 1] as const;
const BALL_COUNT = 3;
const PEG_COUNT = CAPACITIES.length;
/** The canonical start: all three balls stacked on the big peg, bottom→top 0,1,2. */
const CANONICAL_START: PegState[] = [[0, 1, 2], [], []];

// ─── BFS over the ToL state space ────────────────────────────────────────────

/** Canonical, collision-free string key for a peg configuration. */
function stateKey(state: PegState[]): string {
  return state.map((peg) => peg.join('.')).join('|');
}

function cloneState(state: PegState[]): PegState[] {
  return state.map((peg) => peg.slice());
}

/** All legal successor states: lift the top ball of one peg onto a non-full peg. */
function successors(state: PegState[]): PegState[][] {
  const out: PegState[][] = [];
  for (let from = 0; from < PEG_COUNT; from++) {
    if (state[from].length === 0) continue;
    for (let to = 0; to < PEG_COUNT; to++) {
      if (to === from) continue;
      if (state[to].length >= CAPACITIES[to]) continue;
      const next = cloneState(state);
      const ball = next[from].pop() as number;
      next[to].push(ball);
      out.push(next);
    }
  }
  return out;
}

/**
 * BFS from `start`: shortest-move distance to every reachable state, plus the
 * state object for each key. The space is tiny and fully connected.
 */
function bfsDistances(start: PegState[]): {
  dist: Map<string, number>;
  states: Map<string, PegState[]>;
} {
  const dist = new Map<string, number>();
  const states = new Map<string, PegState[]>();
  const startKey = stateKey(start);
  dist.set(startKey, 0);
  states.set(startKey, cloneState(start));
  const queue: PegState[][] = [cloneState(start)];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const d = dist.get(stateKey(cur)) as number;
    for (const next of successors(cur)) {
      const key = stateKey(next);
      if (dist.has(key)) continue;
      dist.set(key, d + 1);
      states.set(key, next);
      queue.push(next);
    }
  }
  return {dist, states};
}

// ─── Generator ───────────────────────────────────────────────────────────────

/**
 * Target minimum move count by level. Spec A.5 fixes 2→5 for the low levels;
 * PROVISIONAL: extended to a cap of 7 for the high levels.
 */
function targetMinMovesFor(level: number): number {
  return Math.max(2, Math.min(level + 1, 7));
}

/** Build the EF judge. `credit` encodes optimality minMoves / movesUsed. */
function towerJudge(goal: PegState[], minMoves: number) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const answer = response.answer as {finalState: PegState[]; moves: number} | undefined;
    if (!answer || !Array.isArray(answer.finalState) || typeof answer.moves !== 'number') {
      return {correct: false, credit: 0};
    }
    const reachedGoal = pegStateEquals(answer.finalState, goal);
    if (!reachedGoal) return {correct: false, credit: 0};
    const movesUsed = Math.max(answer.moves, minMoves);
    const credit = Math.max(0, Math.min(minMoves / movesUsed, 1));
    return {correct: true, credit};
  };
}

export function generateEf(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('ef.towerOfLondon', level, format, rng);
  const target = targetMinMovesFor(level);

  // BFS from the canonical start; pick a seeded goal at the target distance.
  const start = CANONICAL_START;
  const {dist, states} = bfsDistances(start);

  // Candidate goal keys at EXACTLY the target distance.
  const exact: string[] = [];
  let maxDist = 0;
  for (const [key, d] of dist) {
    if (d > maxDist) maxDist = d;
    if (d === target) exact.push(key);
  }

  let goalKey: string;
  let minMoves: number;
  if (exact.length > 0) {
    exact.sort(); // stable candidate order, independent of Map insertion order
    goalKey = exact[nextInt(rng, 0, exact.length - 1)];
    minMoves = target;
  } else {
    // FALLBACK (rare, high end only): no state sits at exactly `target` — use the
    // farthest reachable state and set minMoves to that distance. (PROVISIONAL.)
    const farthest = [...dist.entries()].filter(([, d]) => d === maxDist).map(([k]) => k);
    farthest.sort();
    goalKey = farthest[nextInt(rng, 0, farthest.length - 1)];
    minMoves = maxDist;
  }

  const goal = states.get(goalKey) as PegState[];

  const payload: EfTowerSpec = {
    taskType: 'ef.towerOfLondon',
    ballCount: BALL_COUNT,
    capacities: [...CAPACITIES],
    start: cloneState(start),
    goal: cloneState(goal),
    minMoves,
    interaction: {mode: 'move-balls', pegCount: PEG_COUNT, ballCount: BALL_COUNT},
    solution: {answer: {finalState: cloneState(goal), moves: minMoves}}
  };

  return {
    id,
    domain: 'EF',
    level,
    format,
    payload,
    meta: {minMoves},
    judge: towerJudge(goal, minMoves)
  };
}

/** A stable, easy demonstrative EF item for the 3.05 practice screen (minMoves 2). */
export function practiceEf(): Item {
  return generateEf(1, 'standard', makeRng('practice::EF'));
}
