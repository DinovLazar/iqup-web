/**
 * Age bands — the single source of truth for the whole project.
 *
 * The IqUp brain-games test is split into three age bands. A parent picks the
 * child's exact age on the landing page (phase 1.06); the band derives from that
 * age via {@link getBandForAge} and selects which set of questions the test
 * engine (1.07) renders. The email gate (1.08) reuses the exact age.
 *
 * Band keys here are CANONICAL: the phase 1.04 content spec was not present when
 * this was authored, so later phases must adopt these keys (`3-5`, `6-9`,
 * `10-13`). If 1.04 lands with different keys, reconcile here first.
 */

/** Canonical band keys, youngest → oldest. */
export const BAND_KEYS = ['3-5', '6-9', '10-13'] as const;

export type BandKey = (typeof BAND_KEYS)[number];

export type Band = {
  /** Canonical key used across content, scoring, and URLs. */
  readonly key: BandKey;
  /** Inclusive youngest age in the band. */
  readonly minAge: number;
  /** Inclusive oldest age in the band. */
  readonly maxAge: number;
};

/** The three bands and their inclusive age ranges. */
export const BANDS: readonly Band[] = [
  {key: '3-5', minAge: 3, maxAge: 5},
  {key: '6-9', minAge: 6, maxAge: 9},
  {key: '10-13', minAge: 10, maxAge: 13}
] as const;

/** Youngest supported age (inclusive). */
export const MIN_AGE = BANDS[0].minAge;

/** Oldest supported age (inclusive). */
export const MAX_AGE = BANDS[BANDS.length - 1].maxAge;

/** Every supported age, inclusive: [3, 4, …, 13]. Handy for the age selector. */
export const AGES: readonly number[] = Array.from(
  {length: MAX_AGE - MIN_AGE + 1},
  (_, i) => MIN_AGE + i
);

/** True when `age` is a whole number within the supported 3–13 range. */
export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE;
}

/**
 * Map a child's age to its band key.
 * @returns the band key, or `null` for anything out of range (under 3, over 13)
 * or not a whole number.
 */
export function getBandForAge(age: number): BandKey | null {
  if (!isValidAge(age)) return null;
  const band = BANDS.find((b) => age >= b.minAge && age <= b.maxAge);
  return band ? band.key : null;
}

/** Full band record for an age, or `null` if out of range. */
export function getBand(age: number): Band | null {
  const key = getBandForAge(age);
  return key ? (BANDS.find((b) => b.key === key) ?? null) : null;
}
