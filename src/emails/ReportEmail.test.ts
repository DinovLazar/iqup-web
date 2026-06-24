/**
 * Phase 3.10 — the report (cover) email.
 *
 * Renders the real component to HTML + plain text in both locales and asserts the
 * honest-framing contract: no IQ/score/%/rank token and no stray digit in the
 * visible text; the worded top-strength teaser + the demo CTA are present; the CTA
 * carries `?grad=`; and there is NO child name (the component has no name slot).
 */
import {describe, it, expect} from 'vitest';
import type {Locale} from '@/content/locale';
import enMessages from '@/messages/en.json';
import mkMessages from '@/messages/mk.json';
import {renderReportEmail} from './report-render';
import {sampleReport} from '@/lib/pdf/fixtures';

const BOOKING = 'https://booking.example.com/trial?grad=aerodrom';
const LOCALES: Locale[] = ['mk', 'en'];

const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;

/** A canary child name we never pass — proves the no-child-name invariant. */
const CANARY_NAME = 'Зоранчо';

function chromeFor(locale: Locale) {
  return (locale === 'mk' ? mkMessages : enMessages).ReportEmail;
}

describe('report email — forbidden matchers are non-vacuous', () => {
  it('the matchers fire on a bad sample', () => {
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);
  });
});

for (const locale of LOCALES) {
  describe(`report email — ${locale}`, () => {
    const report = sampleReport(locale);

    async function rendered() {
      return renderReportEmail({
        locale,
        chrome: chromeFor(locale),
        topStrengthName: report.topStrength.name,
        topStrengthBody: report.topStrength.body,
        bookingUrl: BOOKING
      });
    }

    it('renders HTML + plain text', async () => {
      const {html, text} = await rendered();
      expect(html).toContain('<html');
      expect(html).toContain(`lang="${locale}"`);
      expect(text.length).toBeGreaterThan(0);
    });

    it('plain text leaks no forbidden token and no stray digit', async () => {
      const {text} = await rendered();
      expect(FORBIDDEN_EN.test(text)).toBe(false);
      expect(FORBIDDEN_MK.test(text)).toBe(false);
      // The visible text carries no number (the URL slug + chrome are digit-free).
      expect(/\d/.test(text), `stray digit in email text: "${text}"`).toBe(false);
    });

    it('carries the worded top-strength teaser + the demo CTA (with ?grad=)', async () => {
      const {html, text} = await rendered();
      // HTML preserves the name verbatim; the plain-text renderer upper-cases the
      // heading, so match that case-insensitively.
      expect(html).toContain(report.topStrength.name);
      expect(text.toLowerCase()).toContain(report.topStrength.name.toLowerCase());
      expect(html).toContain(chromeFor(locale).cta);
      expect(html).toContain('grad=aerodrom');
    });

    it('contains no child name', async () => {
      const {html, text} = await rendered();
      expect(html).not.toContain(CANARY_NAME);
      expect(text).not.toContain(CANARY_NAME);
    });
  });
}
