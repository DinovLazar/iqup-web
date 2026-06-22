/**
 * The CONTENT-SPEC seam (3.04 → 3.05). Every generator emits a typed,
 * language-neutral `payload` describing what to present, how the child
 * interacts, and — under a clearly separated `solution` key — the correct
 * answer. 3.05 renders the presentation + `interaction`; 3.02 designs against
 * these shapes; the engine never reads any of it.
 *
 * Conventions (binding for every generator):
 *  - `taskType`     a stable id; the i18n instruction key (3.05) + renderer discriminant.
 *  - `interaction`  the input model AS DATA — drives 3.05's input widget.
 *  - `solution`     internal-only; `solution.answer` IS the canonical correct
 *                   `Response.answer` for this item, so a single generic oracle
 *                   can drive a "correct" responder and `judge` can compare. The
 *                   renderer must NOT render `solution`.
 *  - no localized text anywhere — only tokens (`Glyph`/`ColorToken`/`Direction`),
 *    positions, and quantities.
 */
import type {Cell, ColorToken, Direction, Glyph, PolyShape} from './glyphs';

/** Every task-type id in the bank (the 3.05 i18n key + renderer discriminant). */
export type TaskType =
  | 'gf.matrix'
  | 'gf.series'
  | 'gv.rotation'
  | 'gsm.corsi'
  | 'gs.symbolSearch'
  | 'ef.towerOfLondon'
  | 'glr.pairedAssociate'
  | 'ct.sequence'
  | 'ct.debug'
  | 'ct.loop'
  | 'ct.conditional'
  | 'ct.maze';

/**
 * The input model, as data — what kind of widget 3.05 must show and how to
 * package the child's `Response.answer`. The `mode` discriminates; the extra
 * fields tell the renderer its bounds. Generic correct/wrong answer helpers key
 * off `mode`, so this is also the test-side contract.
 */
export type Interaction =
  /** Pick exactly one of `optionCount` options. answer = chosen index (number). */
  | {mode: 'select-one'; optionCount: number}
  /** Tap the tiles back in order. answer = tile-id array. */
  | {mode: 'tap-sequence'; tileCount: number; length: number; direction: 'forward' | 'backward'; revealMs: number}
  /** Tap every target before time runs out. answer = tapped-position array. */
  | {mode: 'multi-tap-timed'; timeBudgetMs: number}
  /** Move balls peg→peg to reach the goal. answer = {finalState, moves}. */
  | {mode: 'move-balls'; pegCount: number; ballCount: number}
  /** Order the available step tokens into a slot row. answer = ordered token array. */
  | {mode: 'order-steps'; slotCount: number}
  /** Match each cue to a target. answer = chosen-target array (aligned to trials). */
  | {mode: 'match-pairs'; pairCount: number; optionCount: number}
  /** Tap the one wrong step. answer = step index (number). */
  | {mode: 'tap-error'; stepCount: number};

/** Fields common to every content spec. */
interface BaseSpec {
  taskType: TaskType;
  interaction: Interaction;
}

// ─── Gf — logical (matrices + number/shape series) ───────────────────────────

/** One matrix cell: a shape with attributes. `null` marks the hidden cell. */
export interface MatrixCell {
  shape: Glyph;
  color: ColorToken;
  /** How many copies of the shape are drawn in the cell (1–4). */
  count: number;
  /** Rotation of the shape in degrees (0/90/180/270). */
  rotationDeg: 0 | 90 | 180 | 270;
}

export interface GfMatrixSpec extends BaseSpec {
  taskType: 'gf.matrix';
  /** Grid edge (3 → a 3×3 matrix). */
  size: number;
  /** Row-major cells; exactly one is `null` (the missing cell). */
  cells: (MatrixCell | null)[];
  /** Index of the `null` cell in `cells`. */
  missingIndex: number;
  /** The answer options (one correct + rule-violating distractors). */
  options: MatrixCell[];
  interaction: {mode: 'select-one'; optionCount: number};
  /** `transformations` = how many attributes vary (the difficulty measure). */
  solution: {answer: number; rule: string; transformations: number};
}

export interface GfSeriesSpec extends BaseSpec {
  taskType: 'gf.series';
  /** The sequence with one `null` (the missing term). */
  sequence: (number | null)[];
  missingIndex: number;
  /** Numeric answer options. */
  options: number[];
  interaction: {mode: 'select-one'; optionCount: number};
  solution: {answer: number; rule: string};
}

// ─── Gv — spatial (mental rotation) ──────────────────────────────────────────

export interface GvRotationSpec extends BaseSpec {
  taskType: 'gv.rotation';
  /** The reference shape. */
  base: PolyShape;
  /** The angle the correct option is rotated by, relative to `base`. */
  rotationDeg: 90 | 180 | 270;
  /** Candidate shapes — one true rotation + mirror/other/wrong-angle distractors. */
  options: {shape: PolyShape; kind: 'rotation' | 'mirror' | 'other' | 'wrong-angle'}[];
  interaction: {mode: 'select-one'; optionCount: number};
  solution: {answer: number};
}

// ─── Gsm — memory span (Corsi) ───────────────────────────────────────────────

export interface GsmCorsiSpec extends BaseSpec {
  taskType: 'gsm.corsi';
  /** The fixed board of tiles (renderer lays them out at these unit positions). */
  tiles: {id: number; x: number; y: number}[];
  /** Tile ids in presentation order (length = span; may revisit a tile non-consecutively). */
  sequence: number[];
  direction: 'forward' | 'backward';
  /** Per-tile reveal time (ms) — enforcement is 3.05; carried here as data. */
  revealMs: number;
  interaction: {mode: 'tap-sequence'; tileCount: number; length: number; direction: 'forward' | 'backward'; revealMs: number};
  solution: {answer: number[]};
}

// ─── Gs — processing speed (timed symbol search) ─────────────────────────────

export interface GsSymbolSearchSpec extends BaseSpec {
  taskType: 'gs.symbolSearch';
  cols: number;
  rows: number;
  /** The field, row-major (`cols*rows` glyphs). */
  cells: Glyph[];
  /** The glyph(s) that count as targets. */
  targets: Glyph[];
  /** The indices of `cells` that are targets. */
  targetPositions: number[];
  /** Time budget (ms) — the visible countdown is 3.05; carried here as data. */
  timeBudgetMs: number;
  interaction: {mode: 'multi-tap-timed'; timeBudgetMs: number};
  solution: {answer: number[]};
}

// ─── EF — planning (Tower of London) ─────────────────────────────────────────

/** A peg holds ball-ids bottom→top; pegs have descending capacities (classic ToL). */
export type PegState = number[];

export interface EfTowerSpec extends BaseSpec {
  taskType: 'ef.towerOfLondon';
  /** Ball ids 0..ballCount-1 (a stable color per id, mapped by 3.05). */
  ballCount: number;
  /** Peg capacities, e.g. [3,2,1] (classic ToL). Length = pegCount. */
  capacities: number[];
  start: PegState[];
  goal: PegState[];
  /** Known minimum number of moves from start to goal (BFS-exact). */
  minMoves: number;
  interaction: {mode: 'move-balls'; pegCount: number; ballCount: number};
  /** The canonical optimal answer: the goal state reached in `minMoves` moves. */
  solution: {answer: {finalState: PegState[]; moves: number}};
}

// ─── Glr — learning (paired-associate, multi-attempt) ────────────────────────

export interface GlrPair {
  cue: Glyph;
  target: Glyph;
}

export interface GlrPairedSpec extends BaseSpec {
  taskType: 'glr.pairedAssociate';
  /** The full learned set, shown in the study phase of every attempt. */
  pairs: GlrPair[];
  /** 1-based attempt index within the learning block (drives the slope). */
  attempt: number;
  /** Recall trials — each cue with shuffled target options. */
  trials: {cue: Glyph; options: Glyph[]}[];
  interaction: {mode: 'match-pairs'; pairCount: number; optionCount: number};
  /** Correct target per trial, aligned to `trials` order. */
  solution: {answer: Glyph[]};
}

// ─── CT — computational thinking (5 sub-types) ───────────────────────────────

/** A small grid world a robot moves through (shared by sequence + maze). */
export interface GridWorld {
  cols: number;
  rows: number;
  start: Cell;
  goal: Cell;
  /** Blocked cells (walls). Empty for the open sequence task. */
  walls: Cell[];
}

export interface CtSequenceSpec extends BaseSpec {
  taskType: 'ct.sequence';
  world: GridWorld;
  /** The exact multiset of step tokens the child must order. */
  steps: Direction[];
  interaction: {mode: 'order-steps'; slotCount: number};
  /** A valid ordering that reaches the goal. */
  solution: {answer: Direction[]};
}

export interface CtDebugSpec extends BaseSpec {
  taskType: 'ct.debug';
  world: GridWorld;
  /** The program as shown — exactly one step is wrong. */
  program: Direction[];
  interaction: {mode: 'tap-error'; stepCount: number};
  /** Index of the single buggy step. */
  solution: {answer: number};
}

export interface CtLoopSpec extends BaseSpec {
  taskType: 'ct.loop';
  /** The flat sequence under test (e.g. up,up,up). */
  sequence: Direction[];
  /** Loop-form options like "repeat up ×3"; one is equivalent to `sequence`. */
  options: {repeat: number; body: Direction[]}[];
  interaction: {mode: 'select-one'; optionCount: number};
  solution: {answer: number};
}

export interface CtConditionalSpec extends BaseSpec {
  taskType: 'ct.conditional';
  /** The if→then rules (color → direction). */
  rules: {color: ColorToken; direction: Direction}[];
  /** The input tiles the rules run over. */
  inputs: ColorToken[];
  /** Candidate output direction-sequences; one matches applying rules to inputs. */
  options: Direction[][];
  interaction: {mode: 'select-one'; optionCount: number};
  solution: {answer: number};
}

export interface CtMazeSpec extends BaseSpec {
  taskType: 'ct.maze';
  world: GridWorld;
  /** The command palette the child orders (a multiset of moves). */
  steps: Direction[];
  interaction: {mode: 'order-steps'; slotCount: number};
  /** A valid command path from start to goal avoiding walls. */
  solution: {answer: Direction[]};
}

/** The union of every CT sub-type spec. */
export type CtSpec =
  | CtSequenceSpec
  | CtDebugSpec
  | CtLoopSpec
  | CtConditionalSpec
  | CtMazeSpec;

/** The discriminated union of every content spec a generated item can carry. */
export type TaskSpec =
  | GfMatrixSpec
  | GfSeriesSpec
  | GvRotationSpec
  | GsmCorsiSpec
  | GsSymbolSearchSpec
  | EfTowerSpec
  | GlrPairedSpec
  | CtSpec;
