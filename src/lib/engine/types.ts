/**
 * The engine's INPUT seam — the contracts Phase 3.04 (the item bank) implements
 * and Phase 3.05 (the live flow) drives. Defined here so 3.04 can build the
 * procedural generators against a frozen interface without guessing.
 *
 * The engine is **agnostic to how items are made**: it asks the provider for "a
 * domain-D item at level L in format F" and receives one. It never inspects the
 * item's presentation payload, and it never knows whether the item was
 * procedurally generated or hand-authored.
 *
 * See `README.md` in this folder for the prose description of both seams.
 */
import type {Rng} from './prng';

/**
 * The seven measured TASK domains (spec Дел 3.1). NB: **attention is NOT here**
 * — it is a derived signal (computed from timing + errors across the session),
 * never a task the provider supplies. The eight signals = these seven + the
 * derived `attention` (see `@/lib/scoring/v2/types`).
 */
export type Domain = 'Gf' | 'Gv' | 'Gsm' | 'Gs' | 'EF' | 'Glr' | 'CT';

/** All seven task domains, in canonical order. */
export const DOMAINS: readonly Domain[] = ['Gf', 'Gv', 'Gsm', 'Gs', 'EF', 'Glr', 'CT'];

/** Difficulty level within a domain: an integer 1–10 (spec Дел 5). */
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

/**
 * Age clusters that change task *format* (not just difficulty) — spec Дел 5:
 * Gsm forward-only under 8 vs forward+backward from 8; parent-assisted mode
 * 5–7; extended battery 10–13. Per-year norming is unchanged (Дел 6.2); only
 * the format varies by cluster.
 */
export type AgeCluster = '5-7' | '8-9' | '10-13';

/**
 * The item format the engine requests for a given (domain, age, position).
 * Opaque-ish strings so 3.04 can extend them per domain (e.g. Gsm uses
 * `'forward'` / `'backward'`). `'standard'` is the default for domains whose
 * format does not vary.
 */
export type ItemFormat = 'standard' | 'forward' | 'backward';

/** The result of judging a child's response to an item. */
export interface ItemJudgment {
  /** Was the answer correct? Drives the adaptive level + / − step. */
  correct: boolean;
  /**
   * Optional partial credit in [0, 1] for scoring (e.g. a CT ordering that is
   * partly right). Defaults to `correct ? 1 : 0` when omitted. The adaptive
   * step still keys off `correct`, never the partial credit.
   */
  credit?: number;
}

/**
 * A single assessment item. Declares its domain + difficulty + format, carries
 * an opaque presentation `payload` (the engine never reads it), and knows how to
 * judge a response. Implemented by 3.04; stubbed by the fixtures in this folder.
 */
export interface Item {
  /** Stable id, unique within a session (used to tie responses to items). */
  id: string;
  domain: Domain;
  /** 1–10. */
  level: number;
  format: ItemFormat;
  /**
   * Everything the UI needs to present the item — stems, options, the Corsi
   * sequence, the Tower-of-London start/goal, etc. **Opaque to the engine.**
   */
  payload: unknown;
  /** Judge a child's response to THIS item. Pure; no side effects. */
  judge(response: Response): ItemJudgment;
  /**
   * Optional domain-specific scoring metadata the raw-score layer reads
   * (e.g. Gsm span length, Gs cell count, EF minimum move count). Opaque to the
   * engine; consumed only by `@/lib/scoring/v2`. Kept on the item so the
   * scoring layer never has to re-derive it from the payload.
   */
  meta?: ItemScoringMeta;
}

/**
 * Domain-specific numbers the v2 scoring layer needs but the engine ignores.
 * 3.04 fills the fields relevant to each domain; all are optional.
 */
export interface ItemScoringMeta {
  /** Gsm: the span length this item tests (number of tiles in the sequence). */
  spanLength?: number;
  /** Gs: total number of cells in the grid (for the "smearing" / gaming flag). */
  cellCount?: number;
  /** Gs: number of target cells the child was meant to tap. */
  targetCount?: number;
  /** EF: the known minimum number of moves to the goal state. */
  minMoves?: number;
  /** Glr: which learning attempt (1-based) this recall item belongs to. */
  attempt?: number;
  /** The number of answer options (chance level = 1 / optionCount). */
  optionCount?: number;
}

/**
 * A child's answer to an item plus the telemetry the engine / validity / scoring
 * layers need. The TELEMETRY CAPTURE itself is Phase 3.05's job (timers,
 * idle/blur detection); here we only declare what the logic consumes.
 */
export interface Response {
  /** The id of the item being answered. */
  itemId: string;
  /** The chosen answer — opaque to the engine; only `item.judge` interprets it. */
  answer: unknown;
  /**
   * Raw response time in milliseconds, on the device clock. Converted to
   * calibration-relative units before any timing-dependent signal is computed
   * (see `calibrationBaselineMs` on the session input).
   */
  responseTimeMs: number;
  /**
   * Idle / tab-blur time accrued during this item, in ms (spec Дел 8). Long
   * gaps are excluded from time analysis and feed the idle validity flag.
   */
  idleMs?: number;
  /**
   * The position index the child selected (0-based), when the item is a
   * multiple-choice grid. Feeds the same-position-bias validity flag.
   */
  selectedPosition?: number;
  /** True if the item timed out / was skipped (an omission). */
  omitted?: boolean;
  /**
   * Gs only: how many cells the child tapped in total. Feeds the speed-task
   * "smearing" (gaming) flag (tapping ~all cells).
   */
  tappedCells?: number;
}

/**
 * The provider the engine pulls items from. 3.04 implements this over the
 * procedural generators; the fixtures in this folder implement it for tests.
 * `getItem` may draw on `rng` for distractors / variation but MUST be
 * deterministic for a given (domain, level, format, rng-state).
 */
export interface ItemProvider {
  getItem(domain: Domain, level: number, format: ItemFormat, rng: Rng): Item;
}

/** Map an exact age (5–13) to its format cluster (spec Дел 5). */
export function ageCluster(age: number): AgeCluster {
  if (age <= 7) return '5-7';
  if (age <= 9) return '8-9';
  return '10-13';
}
