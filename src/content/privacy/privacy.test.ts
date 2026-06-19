import {describe, it, expect} from 'vitest';

import type {Locale} from '@/content/locale';
import {PRIVACY_MK} from './mk';
import {PRIVACY_EN} from './en';
import {getPrivacyContent} from './index';
import type {PrivacyContent} from './types';

const LOCALES: Locale[] = ['mk', 'en'];

/**
 * Concatenate all *visible policy text* for a locale: section headings, every
 * paragraph and list item, and every cookie purpose. (Cookie names, providers,
 * categories and durations are excluded — names are language-neutral keys; the
 * forbidden-vocab rule targets prose the parent reads.)
 */
function visibleText(c: PrivacyContent): string {
  const parts: string[] = [];
  for (const s of c.sections) {
    parts.push(s.heading);
    for (const b of s.blocks) {
      if (b.kind === 'p') parts.push(b.text);
      else parts.push(b.items.join(' '));
    }
  }
  for (const row of c.cookieTable) parts.push(row.purpose);
  return parts.join('\n');
}

/* ---------------------------------------------------------------------------
 * Forbidden score / IQ vocabulary.
 *
 * The policy must never introduce a score, IQ number, percentile or rank, nor
 * imply the activity yields a number. Digits ARE allowed on this page (dates,
 * durations, "No. 4", "1000 Skopje"), so we ban WORDS, not digits.
 *
 * EN regex notes:
 *  - `\biq\b` matches "IQ"/"iq" as a *standalone* token only. Word boundaries
 *    sit between a word char and a non-word char, so the brand "IqUp" does NOT
 *    match: in "IqUp" there is no \b between "q" and "U" (both word chars). The
 *    wordmark "IQ UP!" would contain a standalone "IQ" — but it is a styled
 *    brand asset, never authored into this prose, so it cannot appear here.
 *  - "score"/"scored", "percentile", "rank"/"ranking"/"ranked", and the literal
 *    "pass/fail" are banned as standalone words.
 *  - "result"/"results" is intentionally NOT banned (used benignly: "send the
 *    profile"/"results"). We only ban explicit numeric-score phrasing.
 *
 * MK regex notes — ban only explicit numeric-score vocabulary:
 *  - `коефициент` (coefficient, as in "IQ coefficient"),
 *  - `поен`/`поени` (points), `бод`/`бодови` (points/marks),
 *  - `перцентил` (percentile), `рангирањ` (ranking),
 *  - the phrase `резултат во бројки` (result in numbers).
 *  We do NOT ban the bare word `резултат(и)` — it is benign ("send the
 *  results"). The stems are matched without \b because Cyrillic word boundaries
 *  are unreliable in JS regex; each stem is specific enough not to false-match
 *  benign words.
 * ------------------------------------------------------------------------- */
const FORBIDDEN_EN =
  /\biq\b|\bscored?\b|\bpercentile\b|\brank(?:ing|ed)?\b|pass\/fail/i;

const FORBIDDEN_MK =
  /коефициент|\bпоен(?:и)?\b|\bбод(?:ови)?\b|перцентил|рангирањ|резултат во бројки/i;

function assertCleanForbidden(label: string, text: string): void {
  expect(
    FORBIDDEN_EN.test(text),
    `${label}: found forbidden EN score-word`
  ).toBe(false);
  expect(
    FORBIDDEN_MK.test(text),
    `${label}: found forbidden MK score-word`
  ).toBe(false);
}

describe('privacy content — accessor', () => {
  it('returns the EN content for "en" and MK content for "mk"', () => {
    expect(getPrivacyContent('en')).toBe(PRIVACY_EN);
    expect(getPrivacyContent('mk')).toBe(PRIVACY_MK);
  });

  it('uses an identical provisional version + lastUpdated across locales', () => {
    expect(PRIVACY_MK.version).toBe(PRIVACY_EN.version);
    expect(PRIVACY_MK.lastUpdated).toBe(PRIVACY_EN.lastUpdated);
    expect(PRIVACY_EN.version).toMatch(/draft/);
    expect(PRIVACY_EN.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('privacy content — MK/EN structural parity', () => {
  it('has the same section ids in the same order', () => {
    expect(PRIVACY_MK.sections.map((s) => s.id)).toEqual(
      PRIVACY_EN.sections.map((s) => s.id)
    );
  });

  it('has the same number of blocks and same block kinds (in order) per section', () => {
    expect(PRIVACY_MK.sections.length).toBe(PRIVACY_EN.sections.length);
    for (let i = 0; i < PRIVACY_MK.sections.length; i++) {
      const mk = PRIVACY_MK.sections[i];
      const en = PRIVACY_EN.sections[i];
      expect(mk.id).toBe(en.id);
      expect(
        mk.blocks.map((b) => b.kind),
        `block kinds differ in section "${mk.id}"`
      ).toEqual(en.blocks.map((b) => b.kind));
      // list blocks: same number of items per list, in order
      for (let j = 0; j < mk.blocks.length; j++) {
        const mb = mk.blocks[j];
        const eb = en.blocks[j];
        if (mb.kind === 'list' && eb.kind === 'list') {
          expect(
            mb.items.length,
            `list length differs in section "${mk.id}" block ${j}`
          ).toBe(eb.items.length);
        }
      }
    }
  });

  it('has every heading + block non-empty in both locales', () => {
    for (const c of [PRIVACY_MK, PRIVACY_EN]) {
      for (const s of c.sections) {
        expect(s.heading.trim().length).toBeGreaterThan(0);
        for (const b of s.blocks) {
          if (b.kind === 'p') expect(b.text.trim().length).toBeGreaterThan(0);
          else {
            expect(b.items.length).toBeGreaterThan(0);
            for (const item of b.items)
              expect(item.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('has the same cookie rows with the same (language-neutral) names', () => {
    expect(PRIVACY_MK.cookieTable.map((r) => r.name)).toEqual(
      PRIVACY_EN.cookieTable.map((r) => r.name)
    );
  });

  it('has every cookie field populated in both locales', () => {
    for (const c of [PRIVACY_MK, PRIVACY_EN]) {
      for (const r of c.cookieTable) {
        for (const v of [r.name, r.provider, r.purpose, r.category, r.duration])
          expect(v.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe('privacy content — no score / IQ vocabulary', () => {
  it('introduces no forbidden score/IQ words in any locale', () => {
    for (const locale of LOCALES) {
      assertCleanForbidden(locale, visibleText(getPrivacyContent(locale)));
    }
  });

  it('does NOT false-positive on the brand "IqUp" or benign "results"', () => {
    // Brand name and benign words must pass the EN matcher.
    expect(FORBIDDEN_EN.test('IqUp helps your child. We send the results.')).toBe(
      false
    );
    // The actual content already contains "IqUp" many times — sanity check.
    expect(visibleText(PRIVACY_EN)).toContain('IqUp');
    expect(FORBIDDEN_EN.test(visibleText(PRIVACY_EN))).toBe(false);
    // Benign MK "резултат" must pass the MK matcher.
    expect(FORBIDDEN_MK.test('Ви ги испраќаме резултатите.')).toBe(false);
  });

  it('is non-vacuous: injecting score/IQ vocabulary would fail', () => {
    expect(FORBIDDEN_EN.test('Your child scored an IQ of 120.')).toBe(true);
    expect(FORBIDDEN_EN.test('top percentile ranking')).toBe(true);
    expect(FORBIDDEN_EN.test('pass/fail outcome')).toBe(true);
    expect(FORBIDDEN_MK.test('IQ коефициент од 120 поени')).toBe(true);
    expect(FORBIDDEN_MK.test('перцентил и рангирање')).toBe(true);
  });
});
