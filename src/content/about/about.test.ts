import {describe, it, expect} from 'vitest';

import type {Locale} from '@/content/locale';
import {ABOUT_MK} from './mk';
import {ABOUT_EN} from './en';
import {getAboutContent} from './index';
import type {AboutContent} from './types';

const LOCALES: Locale[] = ['mk', 'en'];

/** Concatenate all visible About text (headings + paragraphs + list items). */
function visibleText(c: AboutContent): string {
  const parts: string[] = [];
  for (const s of c.sections) {
    parts.push(s.heading);
    for (const b of s.blocks) {
      if (b.kind === 'p') parts.push(b.text);
      else parts.push(b.items.join(' '));
    }
  }
  return parts.join('\n');
}

/* ---------------------------------------------------------------------------
 * Forbidden vocabulary — the strictest matchers in the repo (mirrors
 * report-content.test.ts). The About prose must NEVER introduce a score / IQ /
 * rank / grade / points / weak / fail / below-average / deficit word, NOR a
 * clinical/diagnostic word, NOR a literal digit. The clinical/IQ/diagnosis
 * NEGATION is delivered by the shared `Disclaimer` notice, never authored here.
 * ------------------------------------------------------------------------- */
const FORBIDDEN_EN =
  /\b(scores?|iq|ranked|ranking|rank|percent|percentile|points?|grades?|weak|weaker|weakness|fail|failed|failure|below\s+average|deficits?)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен|просек)/i;
const CLINICAL_EN = /\b(clinical|diagnos\w*|disorders?)\b/i;
const CLINICAL_MK = /(дијагноз|клинич)/i;

describe('about content — accessor', () => {
  it('returns the EN content for "en" and MK content for "mk"', () => {
    expect(getAboutContent('en')).toBe(ABOUT_EN);
    expect(getAboutContent('mk')).toBe(ABOUT_MK);
  });
});

describe('about content — MK/EN structural parity', () => {
  it('has the same section ids in the same order', () => {
    expect(ABOUT_MK.sections.map((s) => s.id)).toEqual(
      ABOUT_EN.sections.map((s) => s.id)
    );
  });

  it('has the same block kinds (in order) + same list lengths + same notice flag per section', () => {
    expect(ABOUT_MK.sections.length).toBe(ABOUT_EN.sections.length);
    for (let i = 0; i < ABOUT_MK.sections.length; i++) {
      const mk = ABOUT_MK.sections[i];
      const en = ABOUT_EN.sections[i];
      expect(mk.id).toBe(en.id);
      expect(Boolean(mk.withNotice), `withNotice differs in "${mk.id}"`).toBe(
        Boolean(en.withNotice)
      );
      expect(
        mk.blocks.map((b) => b.kind),
        `block kinds differ in section "${mk.id}"`
      ).toEqual(en.blocks.map((b) => b.kind));
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

  it('exposes exactly one notice-bearing section (the "what it isn\'t" lean-on-notice point)', () => {
    for (const c of [ABOUT_MK, ABOUT_EN]) {
      expect(c.sections.filter((s) => s.withNotice).length).toBe(1);
    }
  });

  it('has every heading + block non-empty in both locales', () => {
    for (const c of [ABOUT_MK, ABOUT_EN]) {
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
});

describe('about content — honest framing (no score/IQ/clinical vocabulary, no digit)', () => {
  it('introduces no forbidden words and no literal digit in any locale', () => {
    for (const locale of LOCALES) {
      const text = visibleText(getAboutContent(locale));
      expect(FORBIDDEN_EN.test(text), `${locale}: forbidden EN word`).toBe(false);
      expect(FORBIDDEN_MK.test(text), `${locale}: forbidden MK word`).toBe(false);
      expect(CLINICAL_EN.test(text), `${locale}: clinical EN word`).toBe(false);
      expect(CLINICAL_MK.test(text), `${locale}: clinical MK word`).toBe(false);
      expect(/\d/.test(text), `${locale}: literal digit`).toBe(false);
    }
  });

  it('does NOT false-positive on the brand "IqUp" or benign "results"', () => {
    expect(FORBIDDEN_EN.test('IqUp helps your child. We send the results.')).toBe(false);
    expect(visibleText(ABOUT_EN)).toContain('IqUp');
  });

  it('is non-vacuous: injecting score/IQ/clinical vocabulary would fail', () => {
    expect(FORBIDDEN_EN.test('Your child scored an IQ in the top percentile.')).toBe(true);
    expect(CLINICAL_EN.test('a clinical diagnosis')).toBe(true);
    expect(FORBIDDEN_MK.test('слаби страни и поени')).toBe(true);
    expect(CLINICAL_MK.test('клиничка дијагноза')).toBe(true);
  });
});
