/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SEED NORMS — PROVISIONAL. NOT a final psychometric standard.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Source of truth: `IQ UP Specifikacija v1.2 FINAL.pdf` — Дел 5 (adaptive
 * engine), Дел 6 (scoring & norming), Дел 7 (validity), Прилог A (task
 * algorithms) and Прилог B (seed scoring & norms). Where the spec gives a
 * concrete number it is reproduced here verbatim; where it gives only a METHOD
 * (validity / confidence thresholds, the per-age speed expectation), a
 * defensible default is set and flagged `PROVISIONAL` inline.
 *
 * Per spec 6.6: these are **initial reference values for the MVP**, indicative
 * and calibrated *within the system*. As the anonymous dataset grows (Дел 14)
 * they migrate toward real, market-calibrated norms. An offline psychologist
 * review + a small pilot is the recommended pre-launch check (Дел 20).
 *
 * The version below is stored with each anonymous record (spec 19.4) so results
 * stay comparable across recalibrations.
 */
import type {AgeCluster, Domain} from '@/lib/engine/types';

/** Bump when ANY value in this file changes (spec 19.4 versioning). */
export const NORMS_VERSION = 'seed-2026-06-PROVISIONAL';

/** Valid exact ages for the assessment (spec: children 5–13). */
export const MIN_AGE = 5;
export const MAX_AGE = 13;

// ─────────────────────────────────────────────────────────────────────────────
// Adaptive engine — start levels, caps, ceiling (spec Дел 5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Start level by exact age. Spec Дел 5 gives this table explicitly **as the Gf
 * example** ("Почетно ниво по возраст (пример, Gf)"):
 *
 *   age   5  6  7  8  9  10 11 12 13
 *   start 1  2  2  3  4  5  6  7  8
 *
 * PROVISIONAL for the non-Gf domains: the spec only tabulates Gf, so we apply
 * the same age→level curve to every domain as the default. Gsm additionally
 * keys its concrete *span length* off Прилог B.1 (see `EXPECTED_SPAN_FORWARD`);
 * the start LEVEL stays on this curve and 3.04's Gsm provider maps level→span.
 */
export const START_LEVEL_BY_AGE: Readonly<Record<number, number>> = {
  5: 1,
  6: 2,
  7: 2,
  8: 3,
  9: 4,
  10: 5,
  11: 6,
  12: 7,
  13: 8
};

/** The discontinue rule: a domain ends after this many consecutive errors. */
export const CEILING_CONSECUTIVE_ERRORS = 2;

/**
 * Per-domain item caps (spec Дел 5: "Цел: 4–6 задачи по домен"). The
 * single-signal indices (Gf → Logical, Gv → Spatial) get a couple more items
 * for stability (spec 3.2: "единствените сигнали (Gf, Gv) добиваат малку повеќе
 * ставки во адаптивниот мотор за подобра стабилност").
 *
 * `min` is a SOFT target used by the confidence model, NOT a stopping floor —
 * the ceiling rule may legitimately end a domain earlier (a genuine floor),
 * which is then reported honestly via low confidence (spec 6.5 / 7.3).
 */
export const DOMAIN_CAPS: Readonly<Record<Domain, {min: number; max: number}>> = {
  Gf: {min: 4, max: 6},
  Gv: {min: 4, max: 6},
  Gsm: {min: 4, max: 5},
  Gs: {min: 4, max: 5},
  EF: {min: 4, max: 5},
  Glr: {min: 4, max: 5},
  CT: {min: 4, max: 5}
};

/**
 * The 10–13 cluster runs a slightly longer battery (spec Дел 5: "проширена
 * батерија 10–13 год … малку подолго за психометриска стабилност"). PROVISIONAL:
 * we add this many items to each domain's `max` for that cluster only.
 */
export const EXTENDED_BATTERY_BONUS = 1;

/** Resolve a domain's max item count for an age cluster. */
export function maxItemsFor(domain: Domain, cluster: AgeCluster): number {
  const base = DOMAIN_CAPS[domain].max;
  return cluster === '10-13' ? base + EXTENDED_BATTERY_BONUS : base;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed norms — memory span & speed expectations (spec Прилог B.1 / Дел 6.1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expected forward memory span by exact age — Прилог B.1 ("Меморија — span по
 * возраст (нанапред)"):
 *
 *   age      5    6     7    8    9     10   11   12    13
 *   expected 4    4–5   5    5    5–6   6    6    6–7   7
 *
 * The spec gives ranges for ages 6, 9, 12; we encode the midpoint and flag it
 * PROVISIONAL. Used by the span→index normalisation (Прилог B.2).
 */
export const EXPECTED_SPAN_FORWARD: Readonly<Record<number, number>> = {
  5: 4,
  6: 4.5, // PROVISIONAL midpoint of spec range 4–5
  7: 5,
  8: 5,
  9: 5.5, // PROVISIONAL midpoint of spec range 5–6
  10: 6,
  11: 6,
  12: 6.5, // PROVISIONAL midpoint of spec range 6–7
  13: 7
};

/**
 * Backward span ≈ forward − 2, from age 8 (Прилог B.1: "Наназад ≈ нанапред − 2,
 * од 8 год"). Returns `null` under 8, where backward span is not tested
 * (spec Дел 4: "наназад од 8 год").
 */
export function expectedSpanBackward(age: number): number | null {
  if (age < 8) return null;
  return EXPECTED_SPAN_FORWARD[age] - 2;
}

/**
 * PROVISIONAL — the spec gives the Gs *formula* ((correct − 0.5·errors)/time)
 * and the B.2 *index formula* but NO per-age expectation table for the speed
 * rate. These defaults express the expected net-correct-per-reference-second a
 * typical child of each age reaches; they are the least-calibrated numbers here
 * and must be re-tuned from the pilot. Tuned so a typical child lands near 50.
 */
export const EXPECTED_SPEED_BY_AGE: Readonly<Record<number, number>> = {
  5: 0.55,
  6: 0.62,
  7: 0.7,
  8: 0.78,
  9: 0.85,
  10: 0.92,
  11: 1.0,
  12: 1.08,
  13: 1.15
};

/**
 * PROVISIONAL reference device tap-baseline (ms). Gs timing is made
 * device-independent by scaling the raw clock to this reference (see
 * `@/lib/scoring/v2/signals`). A real per-device baseline is captured by the
 * first practice task in the live flow (spec 7.2) and passed in as
 * `calibrationBaselineMs`; this constant only sets the common reference point.
 */
export const REFERENCE_TAP_BASELINE_MS = 400;

// ─────────────────────────────────────────────────────────────────────────────
// Raw → index normalisation coefficients (spec Прилог B.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Прилог B.2 — verbatim. 50 = typical for the age; the clamp keeps indices in
 * [8, 99] (never a hard 0 or 100, avoiding false precision at the extremes).
 *
 *   accuracy-based: index = clamp(round(20 + accuracy_weighted*75), 8, 99)
 *   span:           index = clamp(round(50 + (span − expected)*14), 8, 99)
 *   speed:          index = clamp(round(50 + (net_per_time − expected)*6), 8, 99)
 */
export const INDEX_CLAMP_MIN = 8;
export const INDEX_CLAMP_MAX = 99;
export const ACCURACY_BASE = 20;
export const ACCURACY_SCALE = 75;
export const SPAN_BASE = 50;
export const SPAN_SCALE = 14;
export const SPEED_BASE = 50;
export const SPEED_SCALE = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Bands (spec Дел 6.4) — numeric cutoffs only; display words are NOT here
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Band cutoffs (spec 6.4). Output is a STABLE ENUM (see `@/lib/scoring/v2`);
 * the parent-facing words ("Exceptionally developed" …) are copy owned by 3.09 /
 * the report, deliberately NOT baked in here.
 *
 *   ≥ 80  exceptional   ·   64–79 strong   ·   45–63 solid   ·   < 45 developing
 */
export const BAND_CUTOFFS = {
  exceptional: 80,
  strong: 64,
  solid: 45
  // anything below `solid` is `developing`
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Validity thresholds (spec Дел 7.1) — "подесливи" (configurable)
// ─────────────────────────────────────────────────────────────────────────────

export const VALIDITY = {
  /** RT below this (ms) counts as a too-fast answer (spec 7.1: "< ~500ms"). */
  TOO_FAST_MS: 500,
  /** >30% too-fast responses → a STRONG flag (spec 7.1). */
  TOO_FAST_STRONG_RATE: 0.3,
  /** >60% identical option position → same-position-bias flag (spec 7.1). */
  SAME_POSITION_RATE: 0.6,
  /** Idle gap (ms) beyond which a pause is excluded from time (spec Дел 8: ~20–25s). */
  IDLE_GAP_MS: 25_000,
  /** PROVISIONAL: this many excluded idle gaps → an idle flag ("многу → флаг"). */
  IDLE_GAP_FLAG_COUNT: 3,
  /** PROVISIONAL: domain accuracy within this band of chance → chance-level. */
  CHANCE_TOLERANCE: 0.1,
  /** PROVISIONAL: minimum items before chance-level can be asserted for a domain. */
  CHANCE_MIN_ITEMS: 4,
  /** Gs "smearing": tapping ≥ this fraction of all cells → gaming flag (spec 7.1). */
  SPEED_GAMING_TAP_RATE: 0.9,
  /** PROVISIONAL: with smearing, accuracy at/below this also signals gaming. */
  SPEED_GAMING_MAX_ACCURACY: 0.5
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Confidence thresholds (spec Дел 6.5) — spec gives the METHOD; values PROVISIONAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PROVISIONAL — spec 6.5 defines confidence as a function of (a) item count,
 * (b) answer consistency, (c) session validity, but gives no numbers. These are
 * defensible defaults, flagged for the recommended psychologist review.
 */
export const CONFIDENCE = {
  /** ≥ this many contributing items → the item-count test passes at "high". */
  HIGH_MIN_ITEMS: 5,
  /** ≥ this many (but < HIGH) → "medium"; below → "low". */
  MED_MIN_ITEMS: 3,
  /** Consistency ratio ≥ this → the consistency test passes. */
  CONSISTENCY_MIN: 0.6,
  /** Too-fast-AND-wrong threshold (ms) for the impulsive-error rate (attention). */
  IMPULSIVE_MS: 500
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Derived-feature thresholds (spec Дел 9.1) — Code owns the shape; values PROVISIONAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PROVISIONAL tuning for the structural features the report engine (3.07)
 * narrates. The spec NAMES the features (profile shape, index pairs, solving
 * style, …) but not the cutoffs; these are defensible defaults to re-tune with
 * real data.
 */
export const FEATURES = {
  /** Index spread (max − min of the five) at/above which a profile is "spiky". */
  SPIKY_SPREAD: 20,
  /** Both indices ≥ this (the "strong" band floor) → a strong pair. */
  STRONG_PAIR_MIN: 64,
  /** |Δ| between two indices ≥ this → a notable gap pair. */
  GAP_PAIR_MIN: 20,
  /** Mean calibration-relative response time below this → "fast" solving. */
  FAST_REL_RT: 3,
  /** Overall accuracy at/above this → "accurate" solving. */
  ACCURATE_MIN: 0.7
} as const;
