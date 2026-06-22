/**
 * Seedable, deterministic PRNG — the single source of randomness for the whole
 * v2 assessment (spec Дел 5: "seedable, без случајност во скорирањето. Никаков
 * AI во рантајмот").
 *
 * Algorithm: **mulberry32** — a tiny, well-known 32-bit generator.
 *   Why mulberry32:
 *     - deterministic and trivially seedable from a single 32-bit integer;
 *     - tiny, dependency-free, and easy to re-implement / audit / port;
 *     - good enough statistical quality for stimulus selection (this is NOT a
 *       cryptographic context — we only need reproducible, well-distributed
 *       draws for choosing distractors, shuffling options, etc.);
 *     - passes gjrand-style smoke tests and is widely used for exactly this
 *       kind of reproducible-content use case.
 *
 * `Math.random()` MUST NOT appear anywhere on the engine / scoring / item path.
 * This same utility is what Phase 3.04's procedural item generators consume, so
 * a given (age, seed) reproduces a byte-identical session every time.
 */

/** A pure random source: each call returns a float in [0, 1). */
export type Rng = () => number;

/**
 * mulberry32 — returns a generator function seeded by a 32-bit integer.
 * Identical seeds produce identical streams; different seeds diverge.
 */
export function mulberry32(seed: number): Rng {
  // Coerce to a uint32 so callers can pass any integer.
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * xmur3 string hash → a 32-bit seed. Lets a session be parameterised by a
 * human-readable string seed (e.g. an anonymous device token) while the engine
 * stays integer-seeded. Deterministic: same string → same number.
 */
export function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/**
 * Normalise any accepted seed value to a 32-bit integer. A `number` is used
 * directly (truncated to uint32); a `string` is hashed via {@link hashSeed}.
 */
export function toSeedInt(seed: number | string): number {
  return typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
}

/**
 * Build an `Rng` from either a numeric or string seed. The single entry point
 * the engine and the item generators use.
 */
export function makeRng(seed: number | string): Rng {
  return mulberry32(toSeedInt(seed));
}

/**
 * Derive an independent, reproducible sub-stream seed from a base seed plus a
 * label (e.g. a domain name). This keeps per-domain item selection independent
 * yet fully reproducible: the same (seed, label) always yields the same stream,
 * and re-ordering domains never perturbs another domain's stream.
 */
export function deriveSeed(seed: number | string, label: string): number {
  return hashSeed(`${toSeedInt(seed)}::${label}`);
}

/** Integer in [min, max] inclusive, drawn from `rng`. */
export function nextInt(rng: Rng, min: number, max: number): number {
  if (max < min) throw new Error(`nextInt: max (${max}) < min (${min})`);
  return min + Math.floor(rng() * (max - min + 1));
}

/** Pick one element of a non-empty array, deterministically. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick: empty array');
  return items[nextInt(rng, 0, items.length - 1)];
}

/**
 * Fisher–Yates shuffle into a NEW array (does not mutate the input), using
 * `rng` so the order is reproducible for a given seed.
 */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = nextInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
