/**
 * Store A — the anonymous-score row (Phase 3.06, plan.md §12 / spec Дел 14).
 *
 * NO `server-only`: this is a pure, isomorphic transform + schema so the client
 * (which computes `buildProfile` on the persisted run) and the server insert path
 * both build against it and it unit-tests cleanly. It turns a `CognitiveProfile`
 * plus the form's coarse demographics into the exact `assessment_scores` row.
 *
 * The load-bearing privacy guarantees live here:
 *   * The row holds NO PII — only age/gender/city/language buckets, the derived
 *     0–100 signals/indices, the validity flag, and the norms version.
 *   * NO id, NO exact timestamp, NO correlation token is ever part of the payload
 *     — `created_date` is set DB-side to a DAY-LEVEL `current_date`. This is what
 *     keeps Store A unlinkable to the Brevo lead store (no shared key).
 *   * The zod schema is `.strict()`, so any PII-shaped field (email/name/phone) on
 *     the inbound payload is REJECTED, never silently stripped.
 */
import {z} from 'zod';
import {CENTERS} from '@/content/centers';
import type {CognitiveProfile} from '@/lib/scoring/v2';

/** The optional child-gender value set (flagged for IqUp confirmation). */
export const SCORE_GENDERS = ['female', 'male', 'unspecified'] as const;
export type ScoreGender = (typeof SCORE_GENDERS)[number];

/** Supported locales (matches the DB check + the i18n routing). */
export const SCORE_LOCALES = ['mk', 'en'] as const;

/** Valid city keys = the stable centre slug ids (the single source is centers.ts). */
const CITY_IDS = CENTERS.map((c) => c.id) as [string, ...string[]];

/** A 0–100 score (signals are clamped to 8–99 by the scorer; indices span 0–100). */
const score0to100 = z.number().min(0).max(100);

/**
 * The anonymous-score row schema — the exact `assessment_scores` Insert shape minus
 * the DB-side `id` / `created_date`. `.strict()` rejects ANY unknown key so a
 * PII-shaped field can never ride along (data minimisation, enforced loudly).
 */
export const anonymousScoreSchema = z
  .object({
    age: z.int().min(5).max(13),
    gender: z.enum(SCORE_GENDERS).nullable(),
    city: z.enum(CITY_IDS),
    language: z.enum(SCORE_LOCALES),

    signal_gf: score0to100,
    signal_gv: score0to100,
    signal_gsm: score0to100,
    signal_gs: score0to100,
    signal_attention: score0to100,
    signal_ef: score0to100,
    signal_glr: score0to100,
    signal_ct: score0to100,

    index_logical: score0to100,
    index_spatial: score0to100,
    index_memory_focus: score0to100,
    index_planning_speed: score0to100,
    index_learning_stem: score0to100,

    validity: z.enum(['valid', 'not_representative']),
    norms_version: z.string().trim().min(1).max(64)
  })
  .strict();

/** The validated anonymous-score row (what `insertAnonymousScore` writes). */
export type AnonymousScore = z.infer<typeof anonymousScoreSchema>;

/** The coarse, non-PII demographics the form contributes to Store A. */
export interface ScoreDemographics {
  /** The chosen centre's stable id (the "city key" from centers.ts). */
  city: string;
  /** Optional child gender, or `null` when not provided. */
  gender: ScoreGender | null;
  /** The parent's UI language. */
  language: 'mk' | 'en';
}

/**
 * Build the anonymous Store A row from a `CognitiveProfile` + the form demographics.
 *
 * Pure mapping: it reads the derived 0–100 numbers off the profile and never copies
 * any identifier, timestamp, or PII. `validity` collapses the three-outcome enum to
 * the store's two-value flag (`gentle_note` is still a representative session →
 * `valid`; only `not_representative` is excluded from norm calibration).
 */
export function buildAnonymousScore(
  profile: CognitiveProfile,
  demographics: ScoreDemographics
): AnonymousScore {
  const {signals, indices} = profile;
  return {
    age: profile.session.age,
    gender: demographics.gender,
    city: demographics.city,
    language: demographics.language,

    signal_gf: signals.Gf.index,
    signal_gv: signals.Gv.index,
    signal_gsm: signals.Gsm.index,
    signal_gs: signals.Gs.index,
    signal_attention: signals.attention.index,
    signal_ef: signals.EF.index,
    signal_glr: signals.Glr.index,
    signal_ct: signals.CT.index,

    index_logical: indices.logical.value,
    index_spatial: indices.spatial.value,
    index_memory_focus: indices.memory_focus.value,
    index_planning_speed: indices.planning_speed.value,
    index_learning_stem: indices.learning_stem.value,

    validity:
      profile.validity.outcome === 'not_representative'
        ? 'not_representative'
        : 'valid',
    norms_version: profile.session.normsVersion
  };
}
