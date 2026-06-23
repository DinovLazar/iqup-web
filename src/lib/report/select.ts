/**
 * Pure presentational SELECTION for the report engine (spec Дел 9). This layer
 * maps the `CognitiveProfile`'s stable enums + already-derived features to the
 * content keys the assembly fires — band→word, confidence→words, the growth
 * variant, the learning-slope copy bucket, the STEM-bridge variant, the
 * index-pair variant, and the home-activity draw.
 *
 * IMPORTANT: this is SELECTION only. Every cognitive derivation (profile shape,
 * strong/gap pairs, solving style, memory asymmetry, learning slope, ceiling /
 * floor) is read from `CognitiveProfile.features` — NONE is recomputed here.
 * Bucketing a given value into a copy label (band word, learning bucket) is a
 * presentational mapping, exactly like the band→word mapping the spec assigns to
 * this content layer.
 */
import type {Locale, Localized} from '@/content/locale';
import type {ActivityBank, IndexPairVariant, LearningSlopeBucket, StemBridgeVariant} from '@/content/report';
import type {AgeCluster} from '@/lib/engine/types';
import type {Band, CognitiveProfile, IndexId, IndexPair} from '@/lib/scoring/v2';
import {INDICES} from '@/lib/scoring/v2';
import type {GrowthVariant, ReportActivity} from './types';

/** Resolve a localised value to a plain string. */
export function pick(value: Localized, locale: Locale): string {
  return value[locale];
}

/** Bands that count as "high" (a strength, no room flagged). */
const HIGH_BANDS: ReadonlySet<Band> = new Set(['strong', 'exceptional']);

/** Is an index in a high band? */
export function isHighBand(profile: CognitiveProfile, index: IndexId): boolean {
  return HIGH_BANDS.has(profile.indices[index].band);
}

/**
 * The growth-area framing variant (plan.md §6.5):
 *   all_strong — every index high → a "next frontier", not a deficit;
 *   all_floor  — every index in the developing band → gentle "tasks were new";
 *   standard   — otherwise.
 */
export function growthVariant(profile: CognitiveProfile): GrowthVariant {
  const bands = INDICES.map((i) => profile.indices[i].band);
  if (bands.every((b) => HIGH_BANDS.has(b))) return 'all_strong';
  if (bands.every((b) => b === 'developing')) return 'all_floor';
  return 'standard';
}

/**
 * PROVISIONAL copy-bucket thresholds for the learning trajectory (the Glr slope
 * is derived upstream; here we only choose which sentence to show). Re-tune with
 * real data alongside the other PROVISIONAL norms.
 */
export const LEARNING_THRESHOLDS = {
  /** Slope at/above this → "fast" (clear improvement across attempts). */
  FAST: 0.2,
  /** Slope at/below this → "needs a few calm repetitions" (kindly framed). */
  REPETITION: 0
} as const;

export function learningBucket(slope: number): LearningSlopeBucket {
  if (slope >= LEARNING_THRESHOLDS.FAST) return 'fast';
  if (slope <= LEARNING_THRESHOLDS.REPETITION) return 'repetition';
  return 'steady';
}

/**
 * The STEM-bridge variant by which STEM-relevant strengths are present
 * (spec 9 / plan.md §6.7). Narrative only — never changes an index formula.
 */
export function stemBridgeVariant(profile: CognitiveProfile): StemBridgeVariant {
  const spatial = isHighBand(profile, 'spatial');
  const logical = isHighBand(profile, 'logical');
  const stem = isHighBand(profile, 'learning_stem');
  if (spatial && logical) return 'spatial_logical';
  if (stem) return 'computational';
  if (spatial || logical) return 'single';
  return 'emerging';
}

/** Map a strong index pair to its narration variant. */
export function indexPairVariant(pair: IndexPair): IndexPairVariant {
  const set = new Set<IndexId>([pair.a, pair.b]);
  if (set.has('spatial') && set.has('logical')) return 'spatial_logical';
  if (set.has('memory_focus') && set.has('planning_speed')) return 'memory_planning';
  return 'generic_strong';
}

/**
 * The (up to two) strong index pairs to narrate, as distinct variants in
 * canonical order (features.strongPairs is already canonical, so deterministic).
 */
export function pairVariantsToNarrate(profile: CognitiveProfile): IndexPairVariant[] {
  const out: IndexPairVariant[] = [];
  for (const pair of profile.features.strongPairs) {
    const variant = indexPairVariant(pair);
    if (!out.includes(variant)) out.push(variant);
    if (out.length === 2) break;
  }
  return out;
}

/** Day-level date (`YYYY-MM-DD`) from a caller-supplied ISO timestamp, else null. */
export function dayLevel(iso: string | undefined): string | null {
  if (!iso) return null;
  // Take the calendar-day prefix without constructing a Date (keeps it pure +
  // timezone-stable: the caller decides the instant; we never shift it).
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  return match ? match[1] : null;
}

/**
 * The 2–3 indices to draw home activities for, in priority order: the growth
 * area (where support helps most), the top strength, then a STEM-relevant area
 * (or the second-strongest if STEM is already covered). Deterministic + deduped.
 */
export function activityIndices(profile: CognitiveProfile): IndexId[] {
  const top = profile.features.highestIndex;
  const growth = profile.features.lowestIndex;
  const ordered = [...INDICES].sort(
    (a, b) => profile.indices[b].value - profile.indices[a].value
  );
  const secondHighest = ordered.find((i) => i !== top) ?? top;
  const stemPick = growth !== 'learning_stem' && top !== 'learning_stem'
    ? 'learning_stem'
    : secondHighest;

  const out: IndexId[] = [];
  for (const candidate of [growth, top, stemPick]) {
    if (!out.includes(candidate)) out.push(candidate);
  }
  return out.slice(0, 3);
}

/**
 * Draw one home activity per chosen index from the (index, cluster) bank. A
 * stable per-index rotation (driven by the session seed + the index position)
 * varies WHICH of the cell's equivalent activities a child sees, boosting the
 * "two children rarely get the same report" property — still fully deterministic
 * for a given profile.
 */
export function selectActivities(
  profile: CognitiveProfile,
  cluster: AgeCluster,
  bank: ActivityBank,
  locale: Locale
): ReportActivity[] {
  const seed = Math.abs(profile.session.seedInt);
  const indices = activityIndices(profile);
  const out: ReportActivity[] = [];
  indices.forEach((index, ordinal) => {
    const cell = bank[index][cluster];
    if (cell.length === 0) return;
    const choice = cell[(seed + ordinal) % cell.length];
    out.push({
      index,
      title: pick(choice.title, locale),
      body: pick(choice.body, locale)
    });
  });
  return out;
}
