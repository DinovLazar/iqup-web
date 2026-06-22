/**
 * v2 scoring — the OUTPUT seam. The `CognitiveProfile` is the contract Phase
 * 3.05 (results screen), 3.07 (report engine), 3.09 (PDF/pentagon) and 3.06
 * (anonymous Store A) all consume. Defined here so they build against a frozen
 * shape. See `README.md` for the prose.
 *
 * IMPORTANT (project rule): this layer returns DATA ONLY and renders no
 * user-facing number / % / IQ / rank string. The raw 0–100 signal/index values
 * are carried internally — Store A persists them and the bands + pentagon derive
 * from them — but the band is a STABLE ENUM with no display words; the
 * parent-facing words are copy owned by 3.09 / the report.
 *
 * v2 lives under `scoring/v2/` to stay clearly separate from the still-wired v1
 * strengths scorer (`scoring/score.ts`), which is untouched this phase.
 */
import type {Domain} from '@/lib/engine/types';
import type {ValiditySummary} from '@/lib/validity';

/** The eight internal signals (spec Дел 3.1): seven task domains + derived attention. */
export type Signal = Domain | 'attention';

/** All eight signals, canonical order. */
export const SIGNALS: readonly Signal[] = [
  'Gf',
  'Gv',
  'Gsm',
  'Gs',
  'attention',
  'EF',
  'Glr',
  'CT'
];

/** The five parent-facing indices (spec Дел 3.2). */
export type IndexId =
  | 'logical' // Gf
  | 'spatial' // Gv
  | 'memory_focus' // 0.7·Gsm + 0.3·attention
  | 'planning_speed' // 0.6·EF + 0.4·Gs
  | 'learning_stem'; // 0.5·CT + 0.5·Glr

/** All five indices, canonical order (Part A indices 1–4, then Part B index 5). */
export const INDICES: readonly IndexId[] = [
  'logical',
  'spatial',
  'memory_focus',
  'planning_speed',
  'learning_stem'
];

/**
 * The four bands by 0–100 value (spec 6.4) — a STABLE ENUM, NOT display words.
 * ≥80 exceptional · 64–79 strong · 45–63 solid · <45 developing.
 */
export type Band = 'exceptional' | 'strong' | 'solid' | 'developing';

/** Per-index confidence label (spec 6.5). */
export type Confidence = 'high' | 'medium' | 'low';

/** A single signal's score. */
export interface SignalScore {
  signal: Signal;
  /** The domain-specific raw score (span, net-per-time, weighted accuracy, attention raw). */
  raw: number;
  /** The 0–100 (clamped 8–99) per-age normalised index. */
  index: number;
  /** How many items fed this signal (session-wide answered count for attention). */
  nItems: number;
}

/** A single composite index's score. */
export interface IndexScore {
  index: IndexId;
  /** 0–100 composite value. */
  value: number;
  /** Stable band enum (no display words). */
  band: Band;
  /** Confidence label. */
  confidence: Confidence;
}

/** A pair of indices the report engine may narrate (spec 9.1: "парови индекси"). */
export interface IndexPair {
  a: IndexId;
  b: IndexId;
  /** |value(a) − value(b)|. */
  delta: number;
}

/** Speed–accuracy solving style (spec 9.5) — observed, never a speculative trait. */
export type SolvingStyle =
  | 'reflective_accurate' // slower, high accuracy
  | 'fast_accurate' // fast, high accuracy
  | 'fast_errors' // fast, more errors (impulsive)
  | 'balanced';

/**
 * Derived structural features (spec 9.1 / §6.6) — pure derivations from the
 * signals/indices that the report engine (3.07) maps to prose. NO copy here;
 * these are structural so 3.07 stays a pure text layer.
 */
export interface DerivedFeatures {
  /** Flat (even) vs spiky (uneven) profile, by the spread of the five indices. */
  profileShape: 'flat' | 'spiky';
  /** Spread = max index − min index across the five. */
  indexSpread: number;
  highestIndex: IndexId;
  lowestIndex: IndexId;
  /** Index pairs that are both high (a strength cluster). */
  strongPairs: IndexPair[];
  /** Index pairs with a large gap (a strength next to a growth area). */
  gapPairs: IndexPair[];
  solvingStyle: SolvingStyle;
  /**
   * Memory forward/backward asymmetry (Gsm), only when backward was measured
   * (age ≥ 8). `null` otherwise. Positive = stronger forward than backward.
   */
  memoryAsymmetry: number | null;
  /** Glr learning slope across attempts (improvement per attempt). */
  learningSlope: number;
  /** Domains that hit the top of the test for the age (spec 7.3 ceiling). */
  ceilingDomains: Domain[];
  /** Domains that hit the floor (spec 7.3). */
  floorDomains: Domain[];
}

/** Session reproducibility + versioning metadata. */
export interface SessionMeta {
  age: number;
  /** The seed exactly as supplied (number or string). */
  seed: number | string;
  /** The normalised 32-bit integer seed actually used (reproducibility). */
  seedInt: number;
  /** Device tap-speed baseline (ms) used for calibration-relative timing. */
  calibrationBaselineMs: number;
  engineVersion: string;
  scoringVersion: string;
  normsVersion: string;
}

/**
 * The full assessment output. Carries the internal raw + normalised numbers (for
 * Store A and the band/pentagon derivation) and renders nothing user-facing.
 */
export interface CognitiveProfile {
  version: 2;
  session: SessionMeta;
  /** All eight signals. */
  signals: Record<Signal, SignalScore>;
  /** All five indices with band + confidence. */
  indices: Record<IndexId, IndexScore>;
  features: DerivedFeatures;
  validity: ValiditySummary;
}
