// @vitest-environment node
/**
 * Phase 3.10 — the report PDF content contract.
 *
 * Asserts over the resolved content MODEL (`buildReportPdfModel`) — the exact text
 * the PDF lays out — plus a binary smoke render. Proves: all sections present; the
 * demo CTA carries `?grad=`; the honest-framing forbidden-token + no-stray-digit
 * scan (the ONLY digits are the child's age + the generated date); determinism
 * (same `ReportContent` → same model text); and that the document renders to a
 * valid PDF in both locales for both sent validity outcomes.
 */
import {describe, it, expect} from 'vitest';
import type {ReactElement} from 'react';
import type {Locale} from '@/content/locale';
import type {ValidityOutcome} from '@/lib/validity';
import {buildReportPdfModel, flattenModelText} from './model';
import {ReportDocument} from './ReportDocument';
import {renderReportPdf} from './render';
import {sampleReport} from './fixtures';

const BOOKING = 'https://booking.example.com/trial?grad=aerodrom';
const LOCALES: Locale[] = ['mk', 'en'];
/** The funnel only ever sends these two outcomes (3.05 routes the third to retry). */
const SENT: ValidityOutcome[] = ['valid', 'gentle_note'];

const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;

function modelFor(locale: Locale, validity: ValidityOutcome) {
  return buildReportPdfModel(sampleReport(locale, {validity}), locale, BOOKING);
}

describe('report PDF — forbidden matchers are non-vacuous', () => {
  it('the matchers fire on a bad sample', () => {
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);
  });
});

for (const locale of LOCALES) {
  for (const validity of SENT) {
    describe(`report PDF content — ${locale} / ${validity}`, () => {
      const model = modelFor(locale, validity);
      const {content, digitAllowed, ctaHref} = flattenModelText(model);

      it('has every section present', () => {
        expect(model.indices).toHaveLength(5);
        expect(model.cover.topStrengthName.length).toBeGreaterThan(0);
        expect(model.cover.topStrengthBody.length).toBeGreaterThan(0);
        expect(model.cover.generated).toBeTruthy();
        expect(model.overview.paragraphs.length).toBeGreaterThan(0);
        expect(model.growth.paragraphs.length).toBeGreaterThan(0);
        expect(model.home.paragraphs.length).toBeGreaterThanOrEqual(2);
        expect(model.home.paragraphs.length).toBeLessThanOrEqual(3);
        expect(model.stem.body.length).toBeGreaterThan(0);
        expect(model.stem.bridge.length).toBeGreaterThan(0);
        expect(model.iqup.positioning.length).toBeGreaterThan(0);
        expect(model.iqup.ctaLabel.length).toBeGreaterThan(0);
        expect(model.disclaimer.body.length).toBeGreaterThan(0);
        expect(model.disclaimer.provisional.length).toBeGreaterThan(0);
      });

      it('the demo CTA link carries ?grad=', () => {
        expect(ctaHref).toContain('grad=');
      });

      it('leaks no forbidden score/IQ/%/rank token (EN + MK)', () => {
        for (const s of content) {
          expect(FORBIDDEN_EN.test(s), `EN token leaked: "${s}"`).toBe(false);
          expect(FORBIDDEN_MK.test(s), `MK token leaked: "${s}"`).toBe(false);
        }
      });

      it('has NO digit anywhere except the age + generated-date fields', () => {
        for (const s of content) {
          expect(/\d/.test(s), `stray digit in: "${s}"`).toBe(false);
        }
        // …and the permitted fields really do carry their digits (non-vacuous).
        expect(digitAllowed.length).toBeGreaterThanOrEqual(2);
        for (const s of digitAllowed) {
          expect(/\d/.test(s), `expected a digit in permitted field: "${s}"`).toBe(true);
        }
      });
    });
  }
}

describe('report PDF — determinism', () => {
  for (const locale of LOCALES) {
    it(`same ReportContent → same model text (${locale})`, () => {
      const a = flattenModelText(buildReportPdfModel(sampleReport(locale), locale, BOOKING));
      const b = flattenModelText(buildReportPdfModel(sampleReport(locale), locale, BOOKING));
      expect(a).toEqual(b);
    });
  }
});

/** Recursively collect every STRING leaf in a react element tree (react-pdf text
 *  only appears as string children of <Text>/<Tspan>), so this captures exactly
 *  the visible text the document renders — including any JSX-injected literal a
 *  model-only scan would miss (e.g. a numbered list ordinal). */
function collectStrings(node: unknown, acc: string[]): void {
  if (node == null || typeof node === 'boolean') return;
  if (typeof node === 'string') {
    if (node.trim().length > 0) acc.push(node);
    return;
  }
  if (typeof node === 'number') {
    acc.push(String(node));
    return;
  }
  if (Array.isArray(node)) {
    for (const n of node) collectStrings(n, acc);
    return;
  }
  const el = node as ReactElement & {props?: {children?: unknown}};
  if (el.props && 'children' in el.props) collectStrings(el.props.children, acc);
}

describe('report PDF — rendered document tree carries no stray digit', () => {
  for (const locale of LOCALES) {
    it(`every text node is digit-free except age + generated date (${locale})`, () => {
      const model = buildReportPdfModel(sampleReport(locale), locale, BOOKING);
      const allowed = new Set([model.cover.age, model.cover.generated].filter(Boolean) as string[]);
      const strings: string[] = [];
      collectStrings(ReportDocument({model}), strings);
      const withDigits = strings.filter((s) => /\d/.test(s));
      // Non-vacuous: the age + date strings DO carry digits and ARE present.
      expect(withDigits.length).toBeGreaterThanOrEqual(2);
      for (const s of withDigits) {
        expect(allowed.has(s), `unexpected digit-bearing text node: "${s}"`).toBe(true);
      }
    });
  }
});

describe('report PDF — binary render', () => {
  for (const locale of LOCALES) {
    for (const validity of SENT) {
      it(`renders a valid PDF (${locale} / ${validity})`, async () => {
        const report = sampleReport(locale, {validity});
        const buf = await renderReportPdf({report, locale, bookingUrl: BOOKING});
        expect(buf.length).toBeGreaterThan(1000);
        expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
      });
    }
  }
});
