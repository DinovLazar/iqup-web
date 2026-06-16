/**
 * Phase 2.03 — nurture copy guardrail tests.
 *
 * Proves, over the authored copy (`copy.ts`):
 *   1. exact MK↔EN structural parity (same emails, same body length, same footer
 *      keys, same `ctaKind`), and every required slot present + non-empty;
 *   2. personalisation is a Brevo merge tag (the `CHILD_FIRST_NAME` tag appears in
 *      every email) — and the trial-CTA / general-link split is correct;
 *   3. NO forbidden tokens — no digit / `%` / score-IQ-rank vocabulary (EN + MK) —
 *      in any user-facing message slot. The footer's legal/postal line is exempt
 *      from the DIGIT ban (a postal address legitimately has digits) but still gets
 *      the forbidden-WORD guard (decision #94's surface-split philosophy).
 *
 * Mirrors the 2.01 forbidden-token approach (`ResultsEmail.test.ts`) so the no-
 * number rule stays one clean tripwire over the email family.
 */
import {describe, it, expect} from 'vitest';

import type {Locale} from '@/content/locale';
import {
  NURTURE_COPY,
  NURTURE_KEYS,
  type NurtureEmailCopy,
  type NurtureKey
} from './copy';

const LOCALES: Locale[] = ['mk', 'en'];

/** Same guardrail regexes as the 2.01 results-email + 1.10 results tests. */
const FORBIDDEN_WORD =
  /\b(score|scores|iq|rank|ranking|ranked|percent|percentile|points?|grade|weak|weaker|weakness|fail|failed|below average)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен)/i;

/** Strip Brevo merge tags before checking literal copy. */
function stripMerge(s: string): string {
  return s.replace(/\{\{[^}]*\}\}/g, ' ');
}

/** Full clean: no digit, no `%`, no forbidden word (EN + MK). */
function assertClean(label: string, value: string): void {
  const text = stripMerge(value);
  expect(/\d/.test(text), `${label} contains a digit: "${text}"`).toBe(false);
  expect(text.includes('%'), `${label} contains "%": "${text}"`).toBe(false);
  expect(FORBIDDEN_WORD.test(text), `${label} forbidden EN word: "${text}"`).toBe(
    false
  );
  expect(FORBIDDEN_MK.test(text), `${label} forbidden MK word: "${text}"`).toBe(
    false
  );
}

/** Word-only clean (for the legal/postal line, which legitimately has digits). */
function assertNoForbiddenWord(label: string, value: string): void {
  expect(FORBIDDEN_WORD.test(value), `${label} forbidden EN word: "${value}"`).toBe(
    false
  );
  expect(FORBIDDEN_MK.test(value), `${label} forbidden MK word: "${value}"`).toBe(
    false
  );
}

/** Every user-facing message slot of one email (NOT the shared footer). */
function messageSlots(email: NurtureEmailCopy): string[] {
  return [
    email.subject,
    email.preview,
    email.heading,
    email.greeting,
    email.intro,
    ...email.body,
    email.cta
  ];
}

describe('nurture copy — MK/EN parity', () => {
  it('both locales carry the same four emails', () => {
    for (const locale of LOCALES) {
      expect(Object.keys(NURTURE_COPY[locale].emails).sort()).toEqual(
        [...NURTURE_KEYS].sort()
      );
    }
  });

  it('both locales carry the same footer keys', () => {
    expect(Object.keys(NURTURE_COPY.en.footer).sort()).toEqual(
      Object.keys(NURTURE_COPY.mk.footer).sort()
    );
  });

  for (const key of NURTURE_KEYS) {
    it(`"${key}" matches structurally across MK/EN (body length + ctaKind)`, () => {
      const en = NURTURE_COPY.en.emails[key];
      const mk = NURTURE_COPY.mk.emails[key];
      expect(en.body.length, `${key}: body length`).toBe(mk.body.length);
      expect(en.ctaKind, `${key}: ctaKind`).toBe(mk.ctaKind);
      expect(Object.keys(en).sort()).toEqual(Object.keys(mk).sort());
    });
  }
});

describe('nurture copy — required slots present', () => {
  for (const locale of LOCALES) {
    for (const key of NURTURE_KEYS) {
      it(`${key}/${locale}: every slot is a non-empty string`, () => {
        const email = NURTURE_COPY[locale].emails[key];
        for (const slot of messageSlots(email)) {
          expect(typeof slot).toBe('string');
          expect(slot.trim().length).toBeGreaterThan(0);
        }
        expect(email.body.length).toBeGreaterThan(0);
      });

      it(`${key}/${locale}: footer slots are non-empty`, () => {
        const f = NURTURE_COPY[locale].footer;
        for (const v of [
          f.identity,
          f.receiving,
          f.legal,
          f.unsubscribeLabel,
          f.signoff
        ]) {
          expect(v.trim().length).toBeGreaterThan(0);
        }
      });
    }
  }
});

describe('nurture copy — personalisation + CTA split', () => {
  for (const locale of LOCALES) {
    for (const key of NURTURE_KEYS) {
      it(`${key}/${locale}: carries the CHILD_FIRST_NAME merge tag`, () => {
        const email = NURTURE_COPY[locale].emails[key];
        const joined = messageSlots(email).join(' ');
        expect(joined).toContain('contact.CHILD_FIRST_NAME');
        // …and never shows the child's age (age is a branch condition only).
        expect(joined).not.toContain('CHILD_AGE');
      });
    }
  }

  it('only welcome-general is a general link; the other three are trial CTAs', () => {
    for (const locale of LOCALES) {
      const e = NURTURE_COPY[locale].emails;
      expect(e['welcome-general'].ctaKind).toBe('general');
      for (const key of ['welcome-trial', 'trial-invite', 'nudge'] as NurtureKey[]) {
        expect(e[key].ctaKind, `${key}/${locale}`).toBe('trial');
      }
      // the three trial emails share one CTA label; the general link differs.
      const trialCta = e['welcome-trial'].cta;
      expect(e['trial-invite'].cta).toBe(trialCta);
      expect(e.nudge.cta).toBe(trialCta);
      expect(e['welcome-general'].cta).not.toBe(trialCta);
    }
  });
});

describe('nurture copy — no forbidden tokens', () => {
  for (const locale of LOCALES) {
    for (const key of NURTURE_KEYS) {
      it(`${key}/${locale}: every message slot is clean (no number/score)`, () => {
        const email = NURTURE_COPY[locale].emails[key];
        for (const [i, slot] of messageSlots(email).entries()) {
          assertClean(`${key}/${locale}[slot ${i}]`, slot);
        }
      });
    }

    it(`${locale}: footer is clean (legal line: words only, postal digits allowed)`, () => {
      const f = NURTURE_COPY[locale].footer;
      assertClean(`${locale} footer.identity`, f.identity);
      assertClean(`${locale} footer.receiving`, f.receiving);
      assertClean(`${locale} footer.unsubscribeLabel`, f.unsubscribeLabel);
      assertClean(`${locale} footer.signoff`, f.signoff);
      assertNoForbiddenWord(`${locale} footer.legal`, f.legal);
    });
  }

  it('the guard is non-vacuous (it catches a planted bad token)', () => {
    expect(() => assertClean('planted digit', 'you scored 7')).toThrow();
    expect(() => assertClean('planted EN word', 'a perfect IQ score')).toThrow();
    expect(() => assertClean('planted MK word', 'вашата оценка')).toThrow();
  });
});
