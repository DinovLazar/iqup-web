/**
 * Result-copy accessor. Assembles the parent-/kid-facing strengths-profile copy
 * for one child from the ranked `TestResult`, the spec §6 templates, and the
 * single strengths taxonomy.
 *
 * Pure + isomorphic (no i18n runtime, no server-only import) so it runs in the
 * client island and in Vitest. Strength names come from `@/content/strengths`;
 * the §6 copy comes from `./strength-copy` + `./templates`.
 */
import type {Locale} from '@/content/locale';
import {STRENGTHS, type StrengthCode} from '@/content/strengths';
import type {TestResult} from '@/lib/scoring';
import {STRENGTH_RESULT_COPY} from './strength-copy';
import {RESULT_TEMPLATES} from './templates';
import type {ResultTemplates} from './types';

export type {StrengthResultBlurb, ResultTemplates} from './types';
export {STRENGTH_RESULT_COPY} from './strength-copy';
export {RESULT_TEMPLATES} from './templates';

/** Fill `{slot}` placeholders; unknown slots are left intact. */
export function fillSlots(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? vars[key] : `{${key}}`
  );
}

/** Join display names naturally: "A", "A and B", "A, B and C" (locale-aware). */
export function joinNames(names: readonly string[], locale: Locale): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  const conj = locale === 'en' ? ' and ' : ' и ';
  return names.slice(0, -1).join(', ') + conj + names[names.length - 1];
}

export interface ResolvedStrength {
  readonly code: StrengthCode;
  /** Localized display name (from `@/content/strengths`). */
  readonly name: string;
  /** Localized short descriptor (constellation badge sub-line). */
  readonly short: string;
}

export interface CelebratedStrength extends ResolvedStrength {
  /** §6A celebrated blurb. */
  readonly blurb: string;
}

export interface GrowingStrength extends ResolvedStrength {
  /** §6A growing fragment (positive). */
  readonly fragment: string;
}

export interface ResolvedResultCopy {
  /** §6B kid-facing celebration. */
  readonly kidCelebration: string;
  /** §6B parent headline (name + top1/top2 names filled). */
  readonly headline: string;
  /** Ranks #1–#2 — the headline/certificate strengths. */
  readonly celebrated: CelebratedStrength[];
  /** Rank #3 — "also strong". */
  readonly also: ResolvedStrength;
  /** §6B "also strong" line (top3 name filled). */
  readonly alsoLine: string;
  /** Ranks #4–#6 — "growing". */
  readonly growing: GrowingStrength[];
  /** §6B "growing" line (growing names joined + filled). */
  readonly growingLine: string;
  /** §6B trial CTA with `{child}` filled; `{center}` still a placeholder. */
  readonly trialIntro: string;
  /** §6B closing (band 10–13), with `{child}` filled. */
  readonly closing: string;
  /** §6C certificate body line (name + top1/top2 names filled). */
  readonly certificateLine: string;
}

function resolve(code: StrengthCode, locale: Locale): ResolvedStrength {
  return {
    code,
    name: STRENGTHS[code].name[locale],
    short: STRENGTH_RESULT_COPY[code].short[locale]
  };
}

/**
 * Assemble the full strengths-profile copy for `result` + `childName` in `locale`.
 * Tiers follow the contract's ranked projections: celebrated = top1/top2,
 * also = top3, growing = the rest.
 */
export function getResultCopy(
  result: TestResult,
  childName: string,
  locale: Locale
): ResolvedResultCopy {
  const t: ResultTemplates = RESULT_TEMPLATES[locale];
  const name = (code: StrengthCode) => STRENGTHS[code].name[locale];

  const celebratedCodes: StrengthCode[] = [result.top1, result.top2];
  const celebrated: CelebratedStrength[] = celebratedCodes.map((code) => ({
    ...resolve(code, locale),
    blurb: STRENGTH_RESULT_COPY[code].celebrated[locale]
  }));

  const also = resolve(result.top3, locale);

  const growing: GrowingStrength[] = result.growing.map((code) => ({
    ...resolve(code, locale),
    fragment: STRENGTH_RESULT_COPY[code].growing[locale]
  }));

  const slots = {
    child: childName,
    top1_name: name(result.top1),
    top2_name: name(result.top2),
    top3_name: name(result.top3),
    growing_list: joinNames(
      result.growing.map((code) => name(code)),
      locale
    )
  };

  return {
    kidCelebration: t.kidCelebration,
    headline: fillSlots(t.headline, slots),
    celebrated,
    also,
    alsoLine: fillSlots(t.alsoStrong, slots),
    growing,
    growingLine: fillSlots(t.growingLine, slots),
    trialIntro: fillSlots(t.trialCta, slots),
    closing: fillSlots(t.closing, slots),
    certificateLine: fillSlots(t.certificate, slots)
  };
}
