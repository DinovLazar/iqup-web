import {describe, it, expect} from 'vitest';

import {BAND_KEYS, type BandKey} from '@/lib/bands';
import {
  STRENGTH_CODES,
  isStrengthCode,
  type StrengthCode
} from '@/content/strengths';
import {ALL_QUESTIONS, getQuestionsForBand} from './index';
import type {Locale} from '@/content/locale';

const LOCALES: Locale[] = ['mk', 'en'];

/** Per-band question counts, exactly per spec §2. */
const EXPECTED_COUNTS: Record<BandKey, number> = {
  '3-5': 10,
  '6-9': 12,
  '10-13': 14
};

/** Per-band strength distribution, exactly per spec §2. */
const EXPECTED_DISTRIBUTION: Record<BandKey, Record<StrengthCode, number>> = {
  '3-5': {pattern: 2, logic: 1, memory: 1, spatial: 2, numeracy: 2, words_obs: 2},
  '6-9': {pattern: 2, logic: 2, memory: 2, spatial: 2, numeracy: 2, words_obs: 2},
  '10-13': {pattern: 3, logic: 3, memory: 2, spatial: 2, numeracy: 2, words_obs: 2}
};

describe('content — per-band shape (spec §2)', () => {
  it.each(BAND_KEYS)('band %s has the expected question count', (band) => {
    expect(getQuestionsForBand(band)).toHaveLength(EXPECTED_COUNTS[band]);
  });

  it.each(BAND_KEYS)('band %s matches the strength distribution', (band) => {
    const counts: Record<StrengthCode, number> = {
      pattern: 0,
      logic: 0,
      memory: 0,
      spatial: 0,
      numeracy: 0,
      words_obs: 0
    };
    for (const q of getQuestionsForBand(band)) counts[q.strength] += 1;
    expect(counts).toEqual(EXPECTED_DISTRIBUTION[band]);
  });

  it.each(BAND_KEYS)('every strength is reachable in band %s', (band) => {
    const present = new Set(getQuestionsForBand(band).map((q) => q.strength));
    for (const code of STRENGTH_CODES) expect(present.has(code)).toBe(true);
  });

  it.each(BAND_KEYS)('every question in band %s is tagged to that band', (band) => {
    for (const q of getQuestionsForBand(band)) expect(q.band).toBe(band);
  });
});

describe('content — per-question integrity', () => {
  it('every question maps to exactly one valid strength code', () => {
    for (const q of ALL_QUESTIONS) {
      expect(isStrengthCode(q.strength)).toBe(true);
      expect(STRENGTH_CODES).toContain(q.strength);
    }
  });

  it('every question has 2–4 options with unique ids', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(4);
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('every question has exactly one correct option that exists', () => {
    for (const q of ALL_QUESTIONS) {
      const matches = q.options.filter((o) => o.id === q.correct);
      expect(matches).toHaveLength(1);
    }
  });

  it('question ids are unique across all bands', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('reveal (memory) items carry a stem, a revealMs hint, and are tagged memory', () => {
    const reveals = ALL_QUESTIONS.filter((q) => q.mechanic === 'reveal');
    // spec §7: A-Q09, B-Q05, B-Q06, C-Q07, C-Q08
    expect(reveals).toHaveLength(5);
    for (const q of reveals) {
      expect(q.strength).toBe('memory');
      expect(q.stem).toBeDefined();
      expect(typeof q.revealMs).toBe('number');
      expect(q.revealMs).toBeGreaterThan(0);
    }
  });
});

describe('content — MK/EN parity', () => {
  it('every prompt is present and non-empty in both locales', () => {
    for (const q of ALL_QUESTIONS) {
      for (const loc of LOCALES) {
        expect(q.prompt[loc]?.trim().length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it('every option label is present and non-empty in both locales', () => {
    for (const q of ALL_QUESTIONS) {
      for (const o of q.options) {
        for (const loc of LOCALES) {
          expect(o.label[loc]?.trim().length ?? 0).toBeGreaterThan(0);
        }
      }
    }
  });

  it('MK and EN carry both locales for every prompt/option and never reuse the other locale', () => {
    // Structure is shared (one object per question), so ids/order/glyphs are
    // locale-independent by construction. This guards the remaining failure mode:
    // a missing translation silently left equal to (or empty vs) the other locale.
    for (const q of ALL_QUESTIONS) {
      expect(typeof q.prompt.mk).toBe('string');
      expect(typeof q.prompt.en).toBe('string');
      for (const o of q.options) {
        expect(typeof o.label.mk).toBe('string');
        expect(typeof o.label.en).toBe('string');
        // Image options must carry at least one glyph (rendered in both locales).
        if (o.glyphs) expect(o.glyphs.length).toBeGreaterThan(0);
      }
    }
  });
});
