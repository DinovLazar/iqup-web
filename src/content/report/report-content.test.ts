import {describe, expect, it} from 'vitest';

import type {Locale, Localized} from '@/content/locale';
import {INDICES, type Confidence} from '@/lib/scoring/v2';
import {ACTIVITY_BANK} from './activities';
import {BAND_WORDS, CONFIDENCE_WORDS} from './bands';
import {DISCLAIMER_COPY, VALIDITY_NOTES} from './disclaimer';
import {GENTLE_FLOOR_GROWTH, INDEX_COPY, NEXT_FRONTIER_GROWTH} from './indices';
import {AGE_TO_PROGRAM, IQUP_COPY, PROGRAMS, programForAge} from './iqup';
import {
  EXTREMES_COPY,
  INDEX_PAIR_COPY,
  LEARNING_SLOPE_COPY,
  PROFILE_SHAPE_COPY,
  SOLVING_STYLE_COPY
} from './narrative';
import {STEM_COPY} from './stem';

const LOCALES: Locale[] = ['mk', 'en'];
const CLUSTERS = ['5-7', '8-9', '10-13'] as const;

/**
 * Forbidden in any PARENT-FACING string (project guardrail + spec 1.1 / 6.4):
 * digits, `%`, and score / rank / deficit vocabulary in EN or MK. Clinical /
 * diagnostic terms are additionally banned everywhere EXCEPT the disclaimer +
 * validity notes, where they appear ONLY in negation ("not clinical, not a
 * diagnosis") — the honest framing the spec requires.
 */
const FORBIDDEN_EN =
  /\b(scores?|iq|ranked|ranking|rank|percent|percentile|points?|grades?|weak|weaker|weakness|fail|failed|failure|below\s+average|deficits?)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен|просек)/i;
const CLINICAL_EN = /\b(clinical|diagnos\w*|disorders?)\b/i;
const CLINICAL_MK = /(дијагноз|клинич)/i;

function assertClean(label: string, value: string, allowClinical = false): void {
  expect(/\d/.test(value), `${label} contains a digit: "${value}"`).toBe(false);
  expect(value.includes('%'), `${label} contains "%": "${value}"`).toBe(false);
  expect(FORBIDDEN_EN.test(value), `${label} forbidden EN: "${value}"`).toBe(false);
  expect(FORBIDDEN_MK.test(value), `${label} forbidden MK: "${value}"`).toBe(false);
  if (!allowClinical) {
    expect(CLINICAL_EN.test(value), `${label} clinical EN: "${value}"`).toBe(false);
    expect(CLINICAL_MK.test(value), `${label} clinical MK: "${value}"`).toBe(false);
  }
}

/** Every Localized has a non-empty mk + en. */
function assertLocalized(label: string, value: Localized): void {
  for (const locale of LOCALES) {
    expect(
      typeof value[locale] === 'string' && value[locale].trim().length > 0,
      `${label}.${locale} empty`
    ).toBe(true);
  }
}

/** Collect every Localized leaf in an arbitrary content object, labelled. */
function collectLocalized(
  node: unknown,
  path: string,
  out: Array<[string, Localized]>
): void {
  if (node === null || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  if (typeof obj.mk === 'string' && typeof obj.en === 'string') {
    out.push([path, obj as unknown as Localized]);
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    collectLocalized(v, `${path}.${k}`, out);
  }
}

describe('report content — MK/EN parity', () => {
  it('every Localized leaf has a non-empty mk + en', () => {
    const tables: Array<[string, unknown]> = [
      ['BAND_WORDS', BAND_WORDS],
      ['CONFIDENCE_WORDS', CONFIDENCE_WORDS],
      ['INDEX_COPY', INDEX_COPY],
      ['NEXT_FRONTIER_GROWTH', {x: NEXT_FRONTIER_GROWTH}],
      ['GENTLE_FLOOR_GROWTH', {x: GENTLE_FLOOR_GROWTH}],
      ['PROFILE_SHAPE_COPY', PROFILE_SHAPE_COPY],
      ['INDEX_PAIR_COPY', INDEX_PAIR_COPY],
      ['SOLVING_STYLE_COPY', SOLVING_STYLE_COPY],
      ['LEARNING_SLOPE_COPY', LEARNING_SLOPE_COPY],
      ['EXTREMES_COPY', EXTREMES_COPY],
      ['STEM_COPY', STEM_COPY],
      ['ACTIVITY_BANK', ACTIVITY_BANK],
      ['PROGRAMS', PROGRAMS],
      ['IQUP_COPY', IQUP_COPY],
      ['DISCLAIMER_COPY', DISCLAIMER_COPY],
      ['VALIDITY_NOTES', VALIDITY_NOTES]
    ];
    const all: Array<[string, Localized]> = [];
    for (const [name, table] of tables) collectLocalized(table, name, all);
    // Non-vacuous: there is a substantial body of copy to check.
    expect(all.length).toBeGreaterThan(60);
    for (const [label, value] of all) assertLocalized(label, value);
  });

  it('keeps identical {slot} placeholders across locales', () => {
    const slots = (s: string) => (s.match(/\{[^}]+\}/g) ?? []).sort();
    const withSlots: Localized[] = [NEXT_FRONTIER_GROWTH, IQUP_COPY.programFit];
    for (const loc of withSlots) {
      expect(slots(loc.mk)).toEqual(slots(loc.en));
    }
  });
});

describe('report content — no forbidden tokens (non-vacuous)', () => {
  it('the full library is digit-free and number/rank/deficit-free', () => {
    const tables: Array<[string, unknown]> = [
      ['BAND_WORDS', BAND_WORDS],
      ['CONFIDENCE_WORDS', CONFIDENCE_WORDS],
      ['INDEX_COPY', INDEX_COPY],
      ['NEXT_FRONTIER_GROWTH', {x: NEXT_FRONTIER_GROWTH}],
      ['GENTLE_FLOOR_GROWTH', {x: GENTLE_FLOOR_GROWTH}],
      ['PROFILE_SHAPE_COPY', PROFILE_SHAPE_COPY],
      ['INDEX_PAIR_COPY', INDEX_PAIR_COPY],
      ['SOLVING_STYLE_COPY', SOLVING_STYLE_COPY],
      ['LEARNING_SLOPE_COPY', LEARNING_SLOPE_COPY],
      ['EXTREMES_COPY', EXTREMES_COPY],
      ['STEM_COPY', STEM_COPY],
      ['ACTIVITY_BANK', ACTIVITY_BANK],
      ['PROGRAMS', PROGRAMS],
      ['IQUP_COPY', IQUP_COPY]
    ];
    const all: Array<[string, Localized]> = [];
    for (const [name, table] of tables) collectLocalized(table, name, all);
    let checked = 0;
    for (const [label, value] of all) {
      for (const locale of LOCALES) {
        // {slot} placeholders are filled later; strip before scanning.
        assertClean(`${label}.${locale}`, value[locale].replace(/\{[^}]+\}/g, ''));
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(120); // non-vacuous
  });

  it('the disclaimer + validity notes are number-free and may negate clinical terms', () => {
    const all: Array<[string, Localized]> = [];
    collectLocalized(DISCLAIMER_COPY, 'DISCLAIMER', all);
    collectLocalized(VALIDITY_NOTES, 'VALIDITY', all);
    expect(all.length).toBeGreaterThan(0);
    for (const [label, value] of all) {
      for (const locale of LOCALES) {
        assertClean(`${label}.${locale}`, value[locale], /* allowClinical */ true);
      }
    }
    // …and they DO carry the honest framing (the negation is present).
    expect(DISCLAIMER_COPY.body.en.toLowerCase()).toContain('not a clinical');
    expect(DISCLAIMER_COPY.body.mk).toContain('не клиничка');
  });
});

describe('report content — coverage', () => {
  it('covers all five indices with name + strength + growth + activity', () => {
    for (const id of INDICES) {
      const c = INDEX_COPY[id];
      expect(c, `missing index copy for ${id}`).toBeDefined();
      for (const field of ['name', 'strength', 'growth', 'growthActivity'] as const) {
        assertLocalized(`${id}.${field}`, c[field]);
      }
    }
  });

  it('covers all four bands and all three confidence labels', () => {
    for (const band of ['exceptional', 'strong', 'solid', 'developing'] as const) {
      assertLocalized(`band.${band}`, BAND_WORDS[band]);
    }
    for (const conf of ['high', 'medium', 'low'] as const satisfies Confidence[]) {
      assertLocalized(`conf.${conf}.word`, CONFIDENCE_WORDS[conf].word);
      assertLocalized(`conf.${conf}.note`, CONFIDENCE_WORDS[conf].note);
    }
  });

  it('the activity bank covers every (index, cluster) cell with ≥2 activities', () => {
    for (const id of INDICES) {
      for (const cluster of CLUSTERS) {
        const cell = ACTIVITY_BANK[id][cluster];
        expect(cell.length, `${id}/${cluster} too few`).toBeGreaterThanOrEqual(2);
        for (const a of cell) {
          assertLocalized(`${id}/${cluster}.title`, a.title);
          assertLocalized(`${id}/${cluster}.body`, a.body);
        }
      }
    }
  });
});

describe('report content — age → program mapping', () => {
  it('maps every exact age 5–13 to exactly one in-scope program', () => {
    for (let age = 5; age <= 13; age++) {
      const id = AGE_TO_PROGRAM[age];
      expect(id, `age ${age} unmapped`).toBeDefined();
      expect(PROGRAMS[id], `program ${id} missing`).toBeDefined();
      expect(programForAge(age)).toBe(id);
    }
  });

  it('clamps out-of-range ages into the valid program range', () => {
    expect(programForAge(4)).toBe(programForAge(5));
    expect(programForAge(99)).toBe(programForAge(13));
  });
});
