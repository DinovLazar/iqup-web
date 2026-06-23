/**
 * IqUp positioning + program-fit + demo CTA (spec Дел 11 / plan.md §6) and the
 * deterministic age→program mapping (brand.md §2).
 *
 * The five IqUp programs have OVERLAPPING age ranges; the report needs exactly
 * one program per exact age 5–13. `AGE_TO_PROGRAM` is the single, clean,
 * non-overlapping partition we propose — implemented as DATA so an IqUp
 * correction is a one-line edit. **FLAGGED for IqUp to confirm.**
 *
 * Proposed partition (each age sits inside that program's real brand age range):
 *   5–7  → Magic Laboratory            (brand range 5–8)
 *   8–9  → Magic Laboratory PLUS       (brand range 6–9)
 *   10–11→ Oliver's Scientific Adv.    (brand range 9–12)
 *   12–13→ Oliver's Scientific Adv. +  (brand range 10–13)
 * "Little Explorers" (3–5) is intentionally excluded: the assessment starts at 5,
 * where Magic Laboratory is the natural school-age STEM entry program.
 */
import {MAX_AGE, MIN_AGE} from '@/content/norms';
import type {IqupCopy, ProgramCopy, ProgramId} from './types';

/** The four programs in scope for ages 5–13 (brand.md §2 real names). */
export const PROGRAMS: Readonly<Record<ProgramId, ProgramCopy>> = {
  magic_lab: {
    id: 'magic_lab',
    name: {
      mk: 'Магичната лабораторија на Биби и Боби',
      en: "Bibi & Bobi's Magic Laboratory"
    }
  },
  magic_lab_plus: {
    id: 'magic_lab_plus',
    name: {
      mk: 'Магичната лабораторија на Биби и Боби ПЛУС',
      en: 'Magic Laboratory PLUS'
    }
  },
  oliver: {
    id: 'oliver',
    name: {
      mk: 'Научните авантури на Оливер',
      en: "Oliver's Scientific Adventures"
    }
  },
  oliver_plus: {
    id: 'oliver_plus',
    name: {
      mk: 'Научните авантури на Оливер ПЛУС',
      en: "Oliver's Scientific Adventures PLUS"
    }
  }
};

/**
 * Exact age → program. PROVISIONAL partition (see file header) — flagged for
 * IqUp. A one-line edit corrects any age. Covers every exact age MIN_AGE..MAX_AGE.
 */
export const AGE_TO_PROGRAM: Readonly<Record<number, ProgramId>> = {
  5: 'magic_lab',
  6: 'magic_lab',
  7: 'magic_lab',
  8: 'magic_lab_plus',
  9: 'magic_lab_plus',
  10: 'oliver',
  11: 'oliver',
  12: 'oliver_plus',
  13: 'oliver_plus'
};

/** Resolve the matched program for an exact age (clamped to the valid range). */
export function programForAge(age: number): ProgramId {
  const clamped = Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(age)));
  return AGE_TO_PROGRAM[clamped];
}

/**
 * The IqUp positioning + CTA copy. `{program}` in `programFit` is filled by the
 * assembly layer with the matched program's display name. The demo CTA carries
 * the city via the booking-URL seam (built downstream in 3.09), not here.
 */
export const IQUP_COPY: IqupCopy = {
  positioning: {
    mk: 'Во IqUp ова размислување го негуваме секој ден — преку STEM, кодирање и истражувачко учење, водени од приказни и осмислени од воспитувачи и научници. Целта не е да полниме глави со факти, туку да го разбудиме природниот потенцијал на секое дете.',
    en: 'At IqUp this is the thinking we nurture every day — through STEM, coding, and inquiry-led learning, carried by stories and shaped by educators and scientists. The goal is not to fill heads with facts, but to awaken every child’s natural potential.'
  },
  programFit: {
    mk: 'За дете на оваа возраст, {program} е природниот следен чекор — скроена точно за тоа како вашето дете учи и истражува.',
    en: 'For a child this age, {program} is the natural next step — shaped for exactly how your child learns and explores.'
  },
  demoCta: {
    mk: 'Дојдете да го видите тоа во акција: резервирајте бесплатен пробен час во вашиот најблизок IqUp центар — разиграно, практично и без обврска.',
    en: 'Come and see it in action: book a free demo class at your nearest IqUp center — playful, hands-on, and no commitment.'
  }
};
