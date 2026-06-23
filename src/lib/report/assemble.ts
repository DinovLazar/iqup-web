/**
 * `buildReport(profile, context)` — the deterministic, pure report engine
 * (spec Дел 9). Features → fired modules → the assembled, parent-facing
 * `ReportContent` for one locale. No AI, no clock, no randomness: the same
 * `CognitiveProfile` + same `context` → byte-identical output.
 *
 * The power is rich features × a large module library × this assembly logic
 * (plan.md §6.6) — NOT generation. Every cognitive derivation is read from
 * `CognitiveProfile.features`; this layer only selects copy and orders it.
 */
import type {Locale} from '@/content/locale';
import {
  ACTIVITY_BANK,
  BAND_WORDS,
  CONFIDENCE_WORDS,
  DISCLAIMER_COPY,
  EXTREMES_COPY,
  GENTLE_FLOOR_GROWTH,
  INDEX_COPY,
  INDEX_PAIR_COPY,
  IQUP_COPY,
  LEARNING_SLOPE_COPY,
  NEXT_FRONTIER_GROWTH,
  PROFILE_SHAPE_COPY,
  PROGRAMS,
  SOLVING_STYLE_COPY,
  STEM_COPY,
  VALIDITY_NOTES,
  programForAge
} from '@/content/report';
import {ageCluster} from '@/lib/engine/types';
import type {CognitiveProfile} from '@/lib/scoring/v2';
import {INDICES} from '@/lib/scoring/v2';
import {
  dayLevel,
  growthVariant,
  learningBucket,
  pairVariantsToNarrate,
  pick,
  selectActivities,
  stemBridgeVariant
} from './select';
import type {
  ReportContent,
  ReportContext,
  ReportIndex,
  ValidityTreatment
} from './types';

/** Fill `{slot}` placeholders; unknown slots are left intact (so a typo shows). */
function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? vars[key] : `{${key}}`
  );
}

/** Map the validity outcome to its parent-facing treatment (spec 7.1). */
function validityTreatment(
  profile: CognitiveProfile,
  locale: Locale
): ValidityTreatment {
  const outcome = profile.validity.outcome;
  if (outcome === 'gentle_note') {
    return {outcome, note: pick(VALIDITY_NOTES.gentle_note, locale), caveated: false};
  }
  if (outcome === 'not_representative') {
    return {
      outcome,
      note: pick(VALIDITY_NOTES.not_representative, locale),
      caveated: true
    };
  }
  return {outcome, note: null, caveated: false};
}

/** Build the finished parent-facing report for one locale. Pure + deterministic. */
export function buildReport(
  profile: CognitiveProfile,
  context: ReportContext
): ReportContent {
  const {locale} = context;
  const {features} = profile;
  const age = profile.session.age;

  // ── meta ────────────────────────────────────────────────────────────────
  const meta = {
    age,
    locale,
    normsVersion: profile.session.normsVersion,
    generatedDate: dayLevel(context.generatedAt),
    validity: validityTreatment(profile, locale)
  };

  // ── the five indices: band word + confidence word + confidence note ──────
  const indices: ReportIndex[] = INDICES.map((id) => {
    const {band, confidence} = profile.indices[id];
    return {
      id,
      name: pick(INDEX_COPY[id].name, locale),
      band,
      bandLabel: pick(BAND_WORDS[band], locale),
      confidence,
      confidenceLabel: pick(CONFIDENCE_WORDS[confidence].word, locale),
      confidenceNote: pick(CONFIDENCE_WORDS[confidence].note, locale)
    };
  });

  // ── overview: profile shape + any strong index pairs ─────────────────────
  const overview = {
    shape: pick(PROFILE_SHAPE_COPY[features.profileShape], locale),
    pairs: pairVariantsToNarrate(profile).map((v) =>
      pick(INDEX_PAIR_COPY[v], locale)
    )
  };

  // ── top strength: the standout index, described as it looks in a child ───
  const topIndex = features.highestIndex;
  const topStrength = {
    index: topIndex,
    name: pick(INDEX_COPY[topIndex].name, locale),
    bandLabel: pick(BAND_WORDS[profile.indices[topIndex].band], locale),
    body: pick(INDEX_COPY[topIndex].strength, locale)
  };

  // ── growth area: kind framing, with the all-strong / all-floor variants ──
  const gIndex = features.lowestIndex;
  const gVariant = growthVariant(profile);
  const gName = pick(INDEX_COPY[gIndex].name, locale);
  let growthBody: string;
  let growthActivity: string;
  if (gVariant === 'all_strong') {
    growthBody = fill(pick(NEXT_FRONTIER_GROWTH, locale), {index: gName});
    growthActivity = pick(INDEX_COPY[gIndex].growthActivity, locale);
  } else if (gVariant === 'all_floor') {
    growthBody = pick(GENTLE_FLOOR_GROWTH, locale);
    growthActivity = '';
  } else {
    growthBody = pick(INDEX_COPY[gIndex].growth, locale);
    growthActivity = pick(INDEX_COPY[gIndex].growthActivity, locale);
  }
  const growthArea = {
    index: gIndex,
    name: gName,
    variant: gVariant,
    body: growthBody,
    activity: growthActivity
  };

  // ── home activities: 2–3 drawn from the (index, age-cluster) bank ────────
  const homeActivities = selectActivities(
    profile,
    ageCluster(age),
    ACTIVITY_BANK,
    locale
  );

  // ── solving style (observed) + learning trajectory (kindly framed) ───────
  const solvingStyle = {
    style: features.solvingStyle,
    body: pick(SOLVING_STYLE_COPY[features.solvingStyle], locale),
    learning: pick(LEARNING_SLOPE_COPY[learningBucket(features.learningSlope)], locale)
  };

  // ── STEM readiness + the narrative bridge ────────────────────────────────
  const stemReadiness = {
    body: pick(STEM_COPY.intro, locale),
    bridge: pick(STEM_COPY.bridge[stemBridgeVariant(profile)], locale)
  };

  // ── ceiling / floor extremes ─────────────────────────────────────────────
  const extremes = {
    ceiling: features.ceilingDomains.length > 0 ? pick(EXTREMES_COPY.ceiling, locale) : null,
    floor: features.floorDomains.length > 0 ? pick(EXTREMES_COPY.floor, locale) : null
  };

  // ── IqUp positioning + program fit + demo CTA ────────────────────────────
  const programId = programForAge(age);
  const programName = pick(PROGRAMS[programId].name, locale);
  const iqup = {
    positioning: pick(IQUP_COPY.positioning, locale),
    programFit: fill(pick(IQUP_COPY.programFit, locale), {program: programName}),
    programId,
    programName,
    demoCta: pick(IQUP_COPY.demoCta, locale),
    // SEAM (booking URL): the rendering surface (3.09) builds the booking link as
    // `/booking?grad=${city}` — the engine only carries the city, never the URL.
    city: context.city
  };

  // ── disclaimer (honest, indicative-not-diagnostic, provisional norms) ────
  const disclaimer = {
    body: pick(DISCLAIMER_COPY.body, locale),
    provisional: pick(DISCLAIMER_COPY.provisional, locale)
  };

  return {
    meta,
    indices,
    overview,
    topStrength,
    growthArea,
    homeActivities,
    solvingStyle,
    stemReadiness,
    extremes,
    iqup,
    disclaimer
  };
}
