/**
 * CT — Computational thinking (spec Прилог A.8 + Дел 4): 5 sub-types.
 *
 * Follows the reference generator pattern (`gf.ts`):
 *   `generateCt(level, format, rng): Item` (pure given the rng state),
 *   `practiceCt(): Item` (a stable, easy demonstrative item),
 * each Item carrying a typed `payload` (presentation + `interaction` + `solution`),
 * a `judge`, and the `meta` the v2 scoring reads (`optionCount` for the
 * select-one / tap-error sub-types). CT is in the accuracy family — `credit` is
 * binary here (correct ? 1 : 0).
 *
 * Grid convention (binding, shared by `simulate`, the generators, and judging):
 *   `Cell = [col, row]`, origin top-left.
 *     'up'    → row − 1
 *     'down'  → row + 1
 *     'left'  → col − 1
 *     'right' → col + 1
 *
 * PROVISIONAL (flagged — spec pins the paradigms, not the exact knobs):
 *  - the per-sub-type difficulty→size mappings (path length & grid grow with
 *    level for sequence/maze; program length for debug; repeat/body for loop;
 *    rule/input count for conditional);
 *  - the sub-type SELECTION policy (uniform `pick` over the 5 each call);
 *  - option counts where the spec does not pin them: 4, matching Gf's "Избор од 4".
 */
import {makeRng, nextInt, pick, shuffle, type Rng} from '@/lib/engine/prng';
import type {Item, ItemFormat, ItemJudgment, Response} from '@/lib/engine/types';
import {COLORS, DIRECTIONS, type Cell, type ColorToken, type Direction} from './glyphs';
import {arraysEqual, itemId} from './shared';
import type {
  CtConditionalSpec,
  CtDebugSpec,
  CtLoopSpec,
  CtMazeSpec,
  CtSequenceSpec,
  GridWorld
} from './types';

/** PROVISIONAL: select-one / option count where the spec doesn't pin it (matches Gf). */
const OPTION_COUNT = 4;

// ─── Shared grid simulation (the single source of truth) ─────────────────────

const DELTA: Record<Direction, readonly [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0]
};

function wallKey(c: Cell): string {
  return `${c[0]},${c[1]}`;
}

/**
 * Walk `steps` from `world.start`. Returns the final cell, or `null` the instant
 * a step leaves the bounds or enters a wall. Reused for BOTH sequence/maze
 * judging AND for generating + validating the declared solution path.
 */
export function simulate(world: GridWorld, steps: Direction[]): Cell | null {
  const walls = new Set(world.walls.map(wallKey));
  let col = world.start[0];
  let row = world.start[1];
  for (const step of steps) {
    const [dc, dr] = DELTA[step];
    col += dc;
    row += dr;
    if (col < 0 || col >= world.cols || row < 0 || row >= world.rows) return null;
    if (walls.has(`${col},${row}`)) return null;
  }
  return [col, row];
}

function cellsEqual(a: Cell, b: Cell): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/** True iff `steps` walked from start lands exactly on goal (and never leaves/hits a wall). */
function reachesGoal(world: GridWorld, steps: Direction[]): boolean {
  const end = simulate(world, steps);
  return end !== null && cellsEqual(end, world.goal);
}

// ─── Judges (must agree with the generic oracle in shared.ts) ────────────────

/** order-steps: the submitted ordering must simulate from start to goal. */
function pathJudge(world: GridWorld) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const ans = response.answer;
    if (!Array.isArray(ans)) return {correct: false, credit: 0};
    const ok = reachesGoal(world, ans as Direction[]);
    return {correct: ok, credit: ok ? 1 : 0};
  };
}

/** select-one: the chosen index equals the correct one. */
function selectJudge(correct: number) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const ok = response.answer === correct;
    return {correct: ok, credit: ok ? 1 : 0};
  };
}

/** tap-error: the tapped index equals the buggy index. */
function tapErrorJudge(buggyIndex: number) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const ok = response.answer === buggyIndex;
    return {correct: ok, credit: ok ? 1 : 0};
  };
}

// ─── Path construction helpers ───────────────────────────────────────────────

/** A shortest Manhattan command path from `start` to `goal` on an OPEN grid. */
function manhattanPath(start: Cell, goal: Cell): Direction[] {
  const path: Direction[] = [];
  const dc = goal[0] - start[0];
  const dr = goal[1] - start[1];
  for (let i = 0; i < Math.abs(dc); i++) path.push(dc > 0 ? 'right' : 'left');
  for (let i = 0; i < Math.abs(dr); i++) path.push(dr > 0 ? 'down' : 'up');
  return path;
}

/** BFS shortest command path on a grid WITH walls; null if unreachable. */
function bfsPath(world: GridWorld): Direction[] | null {
  const walls = new Set(world.walls.map(wallKey));
  const startKey = wallKey(world.start);
  const goalKey = wallKey(world.goal);
  const prev = new Map<string, {key: string; step: Direction}>();
  const visited = new Set<string>([startKey]);
  let frontier: Cell[] = [world.start];
  while (frontier.length > 0) {
    const next: Cell[] = [];
    for (const [col, row] of frontier) {
      if (`${col},${row}` === goalKey) {
        // Reconstruct.
        const steps: Direction[] = [];
        let key = goalKey;
        while (key !== startKey) {
          const p = prev.get(key)!;
          steps.push(p.step);
          key = p.key;
        }
        return steps.reverse();
      }
      for (const dir of DIRECTIONS) {
        const [dc, dr] = DELTA[dir];
        const nc = col + dc;
        const nr = row + dr;
        const nk = `${nc},${nr}`;
        if (nc < 0 || nc >= world.cols || nr < 0 || nr >= world.rows) continue;
        if (walls.has(nk) || visited.has(nk)) continue;
        visited.add(nk);
        prev.set(nk, {key: `${col},${row}`, step: dir});
        next.push([nc, nr]);
      }
    }
    frontier = next;
  }
  return null;
}

// ─── ct.sequence — order moves on an OPEN grid ───────────────────────────────

/** PROVISIONAL: path length grows with level (and the grid grows to fit). */
function sequencePathLen(level: number): number {
  return Math.min(2 + Math.floor((level - 1) / 2), 7); // L1→2 … L10→6, capped 7
}

function generateSequence(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('ct.sequence', level, format, rng);
  const pathLen = sequencePathLen(level);
  // Grid sized to comfortably hold a path of `pathLen` moves.
  const dim = Math.max(3, pathLen + 1);
  const cols = nextInt(rng, Math.max(3, Math.ceil(pathLen / 2) + 1), dim);
  const rows = nextInt(rng, Math.max(3, Math.ceil(pathLen / 2) + 1), dim);

  // Split the path budget into horizontal + vertical components, both ≥0, sum = pathLen.
  // Guarantee start ≠ goal: the displacement is non-zero by construction.
  let hMoves = nextInt(rng, 0, Math.min(pathLen, cols - 1));
  let vMoves = pathLen - hMoves;
  if (vMoves > rows - 1) {
    vMoves = rows - 1;
    hMoves = Math.min(pathLen - vMoves, cols - 1);
  }
  if (hMoves + vMoves === 0) hMoves = 1; // never zero displacement

  const start: Cell = [nextInt(rng, 0, cols - 1 - hMoves), nextInt(rng, 0, rows - 1 - vMoves)];
  const goal: Cell = [start[0] + hMoves, start[1] + vMoves];

  const world: GridWorld = {cols, rows, start, goal, walls: []};
  const solutionPath = manhattanPath(start, goal);
  const steps = shuffle(rng, solutionPath); // the multiset, shuffled for presentation

  const payload: CtSequenceSpec = {
    taskType: 'ct.sequence',
    world,
    steps,
    interaction: {mode: 'order-steps', slotCount: steps.length},
    solution: {answer: solutionPath}
  };
  return {id, domain: 'CT', level, format, payload, judge: pathJudge(world)};
}

// ─── ct.debug — tap the single wrong step ────────────────────────────────────

/** PROVISIONAL: program length grows with level. */
function debugProgramLen(level: number): number {
  return Math.min(3 + Math.floor((level - 1) / 2), 7); // L1→3 … L10→7
}

function generateDebug(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('ct.debug', level, format, rng);
  const pathLen = debugProgramLen(level);
  const dim = Math.max(4, pathLen + 1);
  const cols = nextInt(rng, Math.max(3, Math.ceil(pathLen / 2) + 1), dim);
  const rows = nextInt(rng, Math.max(3, Math.ceil(pathLen / 2) + 1), dim);

  let hMoves = nextInt(rng, 0, Math.min(pathLen, cols - 1));
  let vMoves = pathLen - hMoves;
  if (vMoves > rows - 1) {
    vMoves = rows - 1;
    hMoves = Math.min(pathLen - vMoves, cols - 1);
  }
  if (hMoves + vMoves === 0) hMoves = 1;

  const start: Cell = [nextInt(rng, 0, cols - 1 - hMoves), nextInt(rng, 0, rows - 1 - vMoves)];
  const goal: Cell = [start[0] + hMoves, start[1] + vMoves];
  const world: GridWorld = {cols, rows, start, goal, walls: []};

  const correctPath = manhattanPath(start, goal);
  // Corrupt exactly ONE index so the program no longer reaches goal. Try each
  // index × each replacement deterministically until the result misses goal.
  const buggyIndex = nextInt(rng, 0, correctPath.length - 1);
  const program = correctPath.slice();
  const original = program[buggyIndex];
  const replacements = shuffle(rng, DIRECTIONS.filter((d) => d !== original));
  let corrupted = false;
  for (const repl of replacements) {
    const trial = correctPath.slice();
    trial[buggyIndex] = repl;
    if (!reachesGoal(world, trial)) {
      program[buggyIndex] = repl;
      corrupted = true;
      break;
    }
  }
  if (!corrupted) {
    // Extremely unlikely fallback: a reverse of the original always derails on a
    // strictly-monotonic Manhattan path of length ≥ 1.
    program[buggyIndex] = original === 'up' ? 'down' : original === 'down' ? 'up' : original === 'left' ? 'right' : 'left';
  }

  const payload: CtDebugSpec = {
    taskType: 'ct.debug',
    world,
    program,
    interaction: {mode: 'tap-error', stepCount: program.length},
    solution: {answer: buggyIndex}
  };
  return {
    id,
    domain: 'CT',
    level,
    format,
    payload,
    meta: {optionCount: program.length},
    judge: tapErrorJudge(buggyIndex)
  };
}

// ─── ct.loop — pick the loop-form equivalent to a flat sequence ──────────────

/** PROVISIONAL: repeat count and body length grow with level. */
function loopShape(level: number): {repeat: number; bodyLen: number} {
  const repeat = Math.min(2 + Math.floor((level - 1) / 3), 5); // L1→2 … L10→5
  const bodyLen = level <= 4 ? 1 : 2; // single-direction body, then 2-direction body
  return {repeat, bodyLen};
}

function generateLoop(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('ct.loop', level, format, rng);
  const {repeat, bodyLen} = loopShape(level);
  const body: Direction[] = [];
  for (let i = 0; i < bodyLen; i++) body.push(pick(rng, DIRECTIONS));
  // The flat sequence = body repeated `repeat` times.
  const sequence: Direction[] = [];
  for (let r = 0; r < repeat; r++) sequence.push(...body);

  // Build distractor loop-forms that do NOT expand to `sequence`.
  const correct = {repeat, body};
  const seen = new Set<string>([`${repeat}|${body.join(',')}`]);
  const distractors: {repeat: number; body: Direction[]}[] = [];

  const candidate = (r: number, b: Direction[]) => {
    const key = `${r}|${b.join(',')}`;
    if (seen.has(key)) return;
    // Reject any form that actually expands to the same flat sequence.
    const expanded: Direction[] = [];
    for (let i = 0; i < r; i++) expanded.push(...b);
    if (arraysEqual(expanded, sequence)) return;
    seen.add(key);
    distractors.push({repeat: r, body: b.slice()});
  };

  // Wrong repeat counts, a mutated body, and a different-direction body.
  candidate(repeat + 1, body);
  candidate(Math.max(1, repeat - 1), body);
  if (bodyLen >= 1) {
    const altDir = pick(rng, DIRECTIONS.filter((d) => d !== body[0]));
    candidate(repeat, [altDir, ...body.slice(1)]);
  }
  candidate(repeat, [...body, pick(rng, DIRECTIONS)]);
  // Pad with growing repeat counts if still short (deterministic).
  let extra = repeat + 2;
  while (distractors.length < OPTION_COUNT - 1) {
    candidate(extra, body);
    extra += 1;
    if (extra > repeat + 12) break; // safety
  }

  const options = shuffle(rng, [correct, ...distractors.slice(0, OPTION_COUNT - 1)]);
  const answer = options.findIndex((o) => o.repeat === repeat && arraysEqual(o.body, body));

  const payload: CtLoopSpec = {
    taskType: 'ct.loop',
    sequence,
    options,
    interaction: {mode: 'select-one', optionCount: options.length},
    solution: {answer}
  };
  return {
    id,
    domain: 'CT',
    level,
    format,
    payload,
    meta: {optionCount: options.length},
    judge: selectJudge(answer)
  };
}

// ─── ct.conditional — apply color→direction rules to an input row ────────────

/** PROVISIONAL: number of rules and input length grow with level. */
function conditionalShape(level: number): {ruleCount: number; inputLen: number} {
  const ruleCount = Math.min(2 + Math.floor((level - 1) / 3), 4); // L1→2 … L10→4
  const inputLen = Math.min(2 + Math.floor((level - 1) / 2), 6); // L1→2 … L10→6
  return {ruleCount, inputLen};
}

function generateConditional(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('ct.conditional', level, format, rng);
  const {ruleCount, inputLen} = conditionalShape(level);

  // Pick `ruleCount` distinct colors, each mapped to a direction.
  const ruleColors = shuffle(rng, COLORS).slice(0, ruleCount) as ColorToken[];
  const rules = ruleColors.map((color) => ({color, direction: pick(rng, DIRECTIONS)}));
  const ruleMap = new Map<ColorToken, Direction>(rules.map((r) => [r.color, r.direction]));

  // Inputs are drawn ONLY from colors that have a rule (so every input maps).
  const inputs: ColorToken[] = [];
  for (let i = 0; i < inputLen; i++) inputs.push(pick(rng, ruleColors));
  const correctOutput = inputs.map((c) => ruleMap.get(c)!);

  // Distractors: plausible-but-wrong direction sequences (same length).
  const seen = new Set<string>([correctOutput.join(',')]);
  const distractors: Direction[][] = [];
  const tryAdd = (seq: Direction[]) => {
    const key = seq.join(',');
    if (seen.has(key)) return;
    seen.add(key);
    distractors.push(seq);
  };
  // Flip one output position to another direction.
  for (let attempt = 0; attempt < 20 && distractors.length < OPTION_COUNT - 1; attempt++) {
    const idx = nextInt(rng, 0, correctOutput.length - 1);
    const swap = pick(rng, DIRECTIONS.filter((d) => d !== correctOutput[idx]));
    const cand = correctOutput.slice();
    cand[idx] = swap;
    tryAdd(cand);
  }
  // Pad with a fully reversed and a rotated-rule mapping if still short.
  let pad = 0;
  while (distractors.length < OPTION_COUNT - 1 && pad < 12) {
    const cand = correctOutput.map((d, i) => (i === pad % correctOutput.length ? DIRECTIONS[(DIRECTIONS.indexOf(d) + 1) % 4] : d));
    tryAdd(cand);
    pad += 1;
  }

  const options = shuffle(rng, [correctOutput, ...distractors.slice(0, OPTION_COUNT - 1)]);
  const answer = options.findIndex((o) => arraysEqual(o, correctOutput));

  const payload: CtConditionalSpec = {
    taskType: 'ct.conditional',
    rules,
    inputs,
    options,
    interaction: {mode: 'select-one', optionCount: options.length},
    solution: {answer}
  };
  return {
    id,
    domain: 'CT',
    level,
    format,
    payload,
    meta: {optionCount: options.length},
    judge: selectJudge(answer)
  };
}

// ─── ct.maze — order moves on a grid WITH walls ──────────────────────────────

/** PROVISIONAL: path length & grid grow with level (mirrors sequence). */
function mazeShape(level: number): {dim: number; pathLen: number} {
  const dim = Math.min(4 + Math.floor((level - 1) / 3), 7); // L1→4 … L10→7
  const pathLen = Math.min(3 + Math.floor((level - 1) / 2), 9);
  return {dim, pathLen};
}

function generateMaze(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('ct.maze', level, format, rng);
  const {dim} = mazeShape(level);
  const cols = dim;
  const rows = dim;

  // Choose distinct start/goal, sprinkle walls, then BFS. Retry deterministically
  // until a reachable, non-trivial (start ≠ goal) instance is found.
  let attempt = 0;
  let world: GridWorld;
  let solutionPath: Direction[] | null = null;
  do {
    const start: Cell = [nextInt(rng, 0, cols - 1), nextInt(rng, 0, rows - 1)];
    let goal: Cell = [nextInt(rng, 0, cols - 1), nextInt(rng, 0, rows - 1)];
    // Force goal ≠ start.
    let guard = 0;
    while (cellsEqual(goal, start) && guard < 20) {
      goal = [nextInt(rng, 0, cols - 1), nextInt(rng, 0, rows - 1)];
      guard += 1;
    }
    if (cellsEqual(goal, start)) goal = [(start[0] + 1) % cols, start[1]];

    // Walls: ~level-scaled count, never on start/goal.
    const wallCount = Math.min(nextInt(rng, 1, 2) + Math.floor(level / 2), cols * rows - cols - 2);
    const walls: Cell[] = [];
    const blocked = new Set<string>([wallKey(start), wallKey(goal)]);
    for (let i = 0; i < wallCount * 3 && walls.length < wallCount; i++) {
      const w: Cell = [nextInt(rng, 0, cols - 1), nextInt(rng, 0, rows - 1)];
      if (!blocked.has(wallKey(w))) {
        blocked.add(wallKey(w));
        walls.push(w);
      }
    }
    world = {cols, rows, start, goal, walls};
    solutionPath = bfsPath(world);
    attempt += 1;
  } while (solutionPath === null && attempt < 50);

  // Deterministic fallback: an open grid with an adjacent goal (always solvable).
  if (solutionPath === null) {
    const start: Cell = [0, 0];
    const goal: Cell = [1, 0];
    world = {cols, rows, start, goal, walls: []};
    solutionPath = ['right'];
  }

  const steps = shuffle(rng, solutionPath);
  const payload: CtMazeSpec = {
    taskType: 'ct.maze',
    world,
    steps,
    interaction: {mode: 'order-steps', slotCount: steps.length},
    solution: {answer: solutionPath}
  };
  return {id, domain: 'CT', level, format, payload, judge: pathJudge(world)};
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** PROVISIONAL: uniform selection over the 5 sub-types. */
const SUB_TYPES = ['sequence', 'debug', 'loop', 'conditional', 'maze'] as const;

/** Generate a CT item: one of the 5 sub-types, chosen deterministically. */
export function generateCt(level: number, format: ItemFormat, rng: Rng): Item {
  switch (pick(rng, SUB_TYPES)) {
    case 'sequence':
      return generateSequence(level, format, rng);
    case 'debug':
      return generateDebug(level, format, rng);
    case 'loop':
      return generateLoop(level, format, rng);
    case 'conditional':
      return generateConditional(level, format, rng);
    case 'maze':
      return generateMaze(level, format, rng);
  }
}

/** A stable, easy demonstrative CT item (an open-grid sequence) for 3.05 practice. */
export function practiceCt(): Item {
  return generateSequence(1, 'standard', makeRng('practice::CT'));
}
