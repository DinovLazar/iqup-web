import {describe, it, expect} from 'vitest';

import type {Locale} from '@/content/locale';
import {STRENGTH_CODES, type StrengthCode} from '@/content/strengths';
import type {BandKey} from '@/lib/bands';
import type {TestResult, Tier} from '@/lib/scoring';
import {STRENGTH_RESULT_COPY} from './strength-copy';
import {RESULT_TEMPLATES} from './templates';
import {getResultCopy, joinNames} from './index';

const LOCALES: Locale[] = ['mk', 'en'];

/** Strip `{slot}` placeholders before checking literal user-facing text. */
function literal(s: string): string {
  return s.replace(/\{[^}]+\}/g, '');
}

/**
 * Forbidden in any user-facing result string (project guardrail): digits,
 * percent signs, and score/rank/deficit vocabulary in EN or MK. The "growing"
 * tier must always read as potential.
 */
const FORBIDDEN_WORD =
  /\b(score|scores|iq|rank|ranking|ranked|percent|percentile|points?|grade|weak|weaker|weakness|fail|failed|below average)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен)/i;

function assertClean(label: string, value: string): void {
  const text = literal(value);
  expect(/\d/.test(text), `${label} contains a digit: "${value}"`).toBe(false);
  expect(text.includes('%'), `${label} contains "%": "${value}"`).toBe(false);
  expect(FORBIDDEN_WORD.test(text), `${label} forbidden word: "${value}"`).toBe(
    false
  );
  expect(FORBIDDEN_MK.test(text), `${label} forbidden MK word: "${value}"`).toBe(
    false
  );
}

describe('result strength copy (spec §6A)', () => {
  it('covers all six strengths with celebrated + growing + short in both locales', () => {
    for (const code of STRENGTH_CODES) {
      const blurb = STRENGTH_RESULT_COPY[code];
      expect(blurb, `missing copy for ${code}`).toBeDefined();
      for (const locale of LOCALES) {
        for (const field of ['celebrated', 'growing', 'short'] as const) {
          const v = blurb[field][locale];
          expect(
            typeof v === 'string' && v.trim().length > 0,
            `${code}.${field}.${locale} empty`
          ).toBe(true);
        }
      }
    }
  });

  it('has no extra strength codes (single taxonomy)', () => {
    expect(Object.keys(STRENGTH_RESULT_COPY).sort()).toEqual(
      [...STRENGTH_CODES].sort()
    );
  });

  it('contains no scores, numbers, percentages, ranks, or deficit language', () => {
    for (const code of STRENGTH_CODES) {
      for (const locale of LOCALES) {
        assertClean(`${code}.celebrated.${locale}`, STRENGTH_RESULT_COPY[code].celebrated[locale]);
        assertClean(`${code}.growing.${locale}`, STRENGTH_RESULT_COPY[code].growing[locale]);
        assertClean(`${code}.short.${locale}`, STRENGTH_RESULT_COPY[code].short[locale]);
      }
    }
  });
});

describe('result wrapper templates (spec §6B/§6C)', () => {
  const FIELDS = [
    'kidCelebration',
    'headline',
    'alsoStrong',
    'growingLine',
    'trialCta',
    'closing',
    'certificate'
  ] as const;

  it('exists for both locales with every field populated', () => {
    for (const locale of LOCALES) {
      for (const field of FIELDS) {
        const v = RESULT_TEMPLATES[locale][field];
        expect(typeof v === 'string' && v.trim().length > 0, `${locale}.${field}`).toBe(true);
      }
    }
  });

  it('keeps identical slot placeholders across locales', () => {
    const slots = (s: string) => (s.match(/\{[^}]+\}/g) ?? []).sort();
    for (const field of FIELDS) {
      expect(slots(RESULT_TEMPLATES.mk[field]), `slots differ at ${field}`).toEqual(
        slots(RESULT_TEMPLATES.en[field])
      );
    }
  });

  it('contains no scores, numbers, percentages, ranks, or deficit language', () => {
    for (const locale of LOCALES) {
      for (const field of FIELDS) {
        assertClean(`${locale}.${field}`, RESULT_TEMPLATES[locale][field]);
      }
    }
  });
});

describe('joinNames', () => {
  it('joins naturally per locale', () => {
    expect(joinNames(['A'], 'en')).toBe('A');
    expect(joinNames(['A', 'B'], 'en')).toBe('A and B');
    expect(joinNames(['A', 'B', 'C'], 'en')).toBe('A, B and C');
    expect(joinNames(['A', 'B', 'C'], 'mk')).toBe('A, B и C');
    expect(joinNames([], 'en')).toBe('');
  });
});

describe('getResultCopy', () => {
  function makeResult(order: StrengthCode[], locale: Locale): TestResult {
    const strengths = order.map((code, i) => ({
      code,
      total: 2,
      hits: 1,
      ratio: 0.5,
      rank: i + 1,
      tier: (i < 2 ? 'celebrated' : i === 2 ? 'also' : 'growing') as Tier
    }));
    return {
      version: 1,
      band: '6-9' as BandKey,
      locale,
      strengths,
      top1: order[0],
      top2: order[1],
      top3: order[2],
      growing: order.slice(3),
      completedAt: '2026-06-13T00:00:00.000Z'
    };
  }

  const order: StrengthCode[] = [
    'pattern',
    'spatial',
    'numeracy',
    'logic',
    'memory',
    'words_obs'
  ];

  it('resolves celebrated(2) / also(1) / growing(3) for both locales', () => {
    for (const locale of LOCALES) {
      const copy = getResultCopy(makeResult(order, locale), 'Марко', locale);
      expect(copy.celebrated.map((c) => c.code)).toEqual(['pattern', 'spatial']);
      expect(copy.also.code).toBe('numeracy');
      expect(copy.growing.map((g) => g.code)).toEqual(['logic', 'memory', 'words_obs']);
      // every celebrated has a non-empty blurb; every growing a fragment
      expect(copy.celebrated.every((c) => c.blurb.trim().length > 0)).toBe(true);
      expect(copy.growing.every((g) => g.fragment.trim().length > 0)).toBe(true);
    }
  });

  it('fills the child name and strength names into the assembled copy', () => {
    const copy = getResultCopy(makeResult(order, 'en'), 'Maya', 'en');
    expect(copy.headline).toContain('Maya');
    expect(copy.headline).toContain('Pattern Spotting');
    expect(copy.certificateLine).toContain('Maya');
    expect(copy.closing).toContain('Maya');
  });

  it('leaves {center} unfilled in the trial intro (TrialInvite fills it)', () => {
    const copy = getResultCopy(makeResult(order, 'en'), 'Maya', 'en');
    expect(copy.trialIntro).toContain('{center}');
    expect(copy.trialIntro).toContain('Maya');
  });

  it('produces digit-free assembled strings', () => {
    for (const locale of LOCALES) {
      const copy = getResultCopy(makeResult(order, locale), 'Марко', locale);
      for (const s of [
        copy.kidCelebration,
        copy.headline,
        copy.alsoLine,
        copy.growingLine,
        copy.closing,
        copy.certificateLine
      ]) {
        expect(/\d/.test(s), `assembled string has a digit: "${s}"`).toBe(false);
      }
    }
  });
});
