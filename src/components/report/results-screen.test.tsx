import {describe, expect, it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';

import en from '@/messages/en.json';
import mk from '@/messages/mk.json';
import type {Locale} from '@/content/locale';
import type {ReportContent} from '@/lib/report';
import type {ValidityOutcome} from '@/lib/validity';
import {ResultsScreen} from './ResultsScreen';
import type {ResultsCopy} from './results-copy';

// ─────────────────────────────────────────────────────────────────────────────
// Build the real chrome ResultsCopy straight from the message catalogues, so the
// forbidden-token scan runs over the ACTUAL strings the screen renders.
// ─────────────────────────────────────────────────────────────────────────────
function copyFrom(ns: (typeof en)['Results']): ResultsCopy {
  return {
    eyebrow: ns.eyebrow,
    title: ns.title,
    ageLabel: ns.ageLabel,
    generatedLabel: ns.generatedLabel,
    heroCaption: ns.heroCaption,
    sectionIndices: ns.sectionIndices,
    sectionNoticed: ns.sectionNoticed,
    sectionCertificate: ns.sectionCertificate,
    shineKicker: ns.shineKicker,
    confidencePrefix: ns.confidencePrefix,
    solvingStyleLabel: ns.solvingStyleLabel,
    emailedHeading: ns.emailedHeading,
    emailedBody: ns.emailedBody,
    trialHeading: ns.trialHeading,
    trialBody: ns.trialBody,
    trialCta: ns.trialCta,
    certificateHeading: ns.certificateHeading,
    certificateBody: ns.certificateBody,
    validity: {
      gentleHeading: ns.validity.gentleHeading,
      caveatHeading: ns.validity.caveatHeading,
      retry: ns.validity.retry
    }
  };
}

const COPY: Record<Locale, ResultsCopy> = {
  en: copyFrom(en.Results),
  mk: copyFrom(mk.Results)
};

const FORMATTED_DATE: Record<Locale, string> = {
  en: '23 June 2026',
  mk: '23 јуни 2026'
};

// A representative ReportContent fixture — clean prose, day-level date, age 8. The
// real engine output is already scanned for forbidden tokens in report.test.ts;
// here we guard the SCREEN itself (chrome + how it composes content). Cast through
// `unknown` only to avoid coupling the fixture to the ProgramId union.
function makeReport(outcome: ValidityOutcome): ReportContent {
  const note =
    outcome === 'valid'
      ? null
      : outcome === 'gentle_note'
        ? 'A few tasks were finished quickly, so take this as a gentle read.'
        : 'These answers look rushed — try again in a calmer moment for a truer picture.';
  return {
    meta: {
      age: 8,
      locale: 'en',
      normsVersion: 'test',
      generatedDate: '2026-06-23',
      validity: {outcome, note, caveated: outcome === 'not_representative'}
    },
    indices: [
      {id: 'logical', name: 'Logical thinking', band: 'strong', bandLabel: 'Strongly developed', confidence: 'high', confidenceLabel: 'High', confidenceNote: 'A firm reading — steady across the tasks.'},
      {id: 'spatial', name: 'Spatial thinking', band: 'solid', bandLabel: 'Well developed', confidence: 'medium', confidenceLabel: 'Medium', confidenceNote: 'A medium reading — worth a second look later.'},
      {id: 'memory_focus', name: 'Memory & focus', band: 'strong', bandLabel: 'Strongly developed', confidence: 'high', confidenceLabel: 'High', confidenceNote: 'A firm reading — steady across the tasks.'},
      {id: 'planning_speed', name: 'Planning & speed', band: 'solid', bandLabel: 'Well developed', confidence: 'medium', confidenceLabel: 'Medium', confidenceNote: 'A medium reading — worth a second look later.'},
      {id: 'learning_stem', name: 'Learning & STEM thinking', band: 'developing', bandLabel: 'Developing nicely', confidence: 'low', confidenceLabel: 'Low', confidenceNote: 'A lighter reading — this area was just warming up.'}
    ],
    overview: {
      shape: 'A rounded, confident profile with a natural pair of strengths working together.',
      pairs: ['Logic and memory reinforce each other here.']
    },
    topStrength: {index: 'logical', name: 'Logical thinking', bandLabel: 'Strongly developed', body: 'Logical thinking leads — your child builds clear steps to an answer.'},
    growthArea: {index: 'learning_stem', name: 'Learning & STEM thinking', variant: 'standard', body: 'This area is just blossoming — room to grow, never a weakness.', activity: 'Try a simple pattern puzzle once a week.'},
    homeActivities: [
      {index: 'logical', title: 'Sequence games', body: 'Play cards and dominoes together.'},
      {index: 'memory_focus', title: 'Recall play', body: 'Ask what came before and after.'}
    ],
    solvingStyle: {style: 'reflective_accurate', body: 'Approaches tasks calmly and thoroughly, leaning to care over speed.', learning: 'That persistence is a great foundation for the next steps.'},
    stemReadiness: {body: 'The mix of logic and memory is the thinking early coding leans on.', bridge: 'Steps become commands; details become sensors.'},
    extremes: {ceiling: null, floor: null},
    iqup: {positioning: 'A STEM and thinking program led by great educators.', programFit: 'A natural next step.', programId: 'young_explorers', programName: 'Young Explorers', demoCta: 'Book a free trial class', city: 'veles'},
    disclaimer: {body: 'Informative, not a diagnosis. It is not a clinical measurement.', provisional: 'Our norms are still provisional and we keep improving them.'}
  } as unknown as ReportContent;
}

const BOOKING = 'http://localhost:3000/en/trial?grad=veles';

/** Strip tags + decode the entities `renderToStaticMarkup` emits → visible text. */
function visibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Same matchers the engine + messages suites use (the honest-framing hard rule).
const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;

const LOCALES: Locale[] = ['mk', 'en'];
const OUTCOMES: ValidityOutcome[] = ['valid', 'gentle_note', 'not_representative'];

describe('ResultsScreen — honest framing (no magnitude on the rendered screen)', () => {
  it('the forbidden matchers are non-vacuous', () => {
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);
  });

  for (const locale of LOCALES) {
    for (const outcome of OUTCOMES) {
      it(`renders no score/IQ/%/rank/band token — ${locale} / ${outcome}`, () => {
        const html = renderToStaticMarkup(
          <ResultsScreen
            report={makeReport(outcome)}
            copy={COPY[locale]}
            locale={locale}
            bookingUrl={BOOKING}
          />
        );
        const text = visibleText(html);
        expect(FORBIDDEN_EN.test(text), `EN token leaked (${locale}/${outcome})`).toBe(false);
        expect(FORBIDDEN_MK.test(text), `MK token leaked (${locale}/${outcome})`).toBe(false);
      });

      it(`has no stray digits beyond the age + date meta — ${locale} / ${outcome}`, () => {
        const html = renderToStaticMarkup(
          <ResultsScreen
            report={makeReport(outcome)}
            copy={COPY[locale]}
            locale={locale}
            bookingUrl={BOOKING}
          />
        );
        const ageText = COPY[locale].ageLabel.replace('{age}', '8');
        const dateText = COPY[locale].generatedLabel.replace('{date}', FORMATTED_DATE[locale]);
        const remainder = visibleText(html)
          .replace(dateText, ' ')
          .replace(FORMATTED_DATE[locale], ' ')
          .replace(ageText, ' ');
        expect(/\d/.test(remainder), `stray digit in ${locale}/${outcome}: "${remainder}"`).toBe(
          false
        );
      });
    }
  }
});

describe('ResultsScreen — validity states (from meta.validity)', () => {
  it('valid → no validity note, full-saturation pentagon', () => {
    const html = renderToStaticMarkup(
      <ResultsScreen report={makeReport('valid')} copy={COPY.en} locale="en" bookingUrl={BOOKING} />
    );
    expect(html).not.toContain('iqr-validity');
    expect(html).not.toContain('opacity="0.32"');
  });

  it('gentle_note → quieter inline note carrying the engine sentence', () => {
    const html = renderToStaticMarkup(
      <ResultsScreen report={makeReport('gentle_note')} copy={COPY.en} locale="en" bookingUrl={BOOKING} />
    );
    expect(html).toContain('iqr-validity--gentle');
    expect(html).not.toContain('iqr-validity--caveat');
    expect(html).toContain('gentle read');
    expect(html).not.toContain('opacity="0.32"'); // pentagon stays full
  });

  it('not_representative → bespoke caveat banner, dimmed pentagon, single retry to the assessment', () => {
    const html = renderToStaticMarkup(
      <ResultsScreen report={makeReport('not_representative')} copy={COPY.en} locale="en" bookingUrl={BOOKING} />
    );
    expect(html).toContain('iqr-validity--caveat');
    expect(html).toContain('opacity="0.32"'); // all five wedges dimmed (still whole)
    expect(html).toContain('href="/en/test"'); // mirrors the 3.05 RetryScreen intent
    expect(html).toContain('try again'.toLowerCase());
  });
});

describe('ResultsScreen — demo CTA + certificate seam', () => {
  it('the demo CTA href carries ?grad=', () => {
    const html = renderToStaticMarkup(
      <ResultsScreen report={makeReport('valid')} copy={COPY.en} locale="en" bookingUrl={BOOKING} />
    );
    expect(html).toContain(`href="${BOOKING}"`);
    expect(html).toMatch(/grad=veles/);
  });

  it('renders the certificate entry affordance (no route yet — SEAM 3.11)', () => {
    const html = renderToStaticMarkup(
      <ResultsScreen report={makeReport('valid')} copy={COPY.en} locale="en" bookingUrl={BOOKING} />
    );
    expect(html).toContain('iqr-cert');
  });
});

describe('IdentityPentagon — identity, not magnitude', () => {
  function pentagonOf(report: ReportContent): string {
    const html = renderToStaticMarkup(
      <ResultsScreen report={report} copy={COPY.en} locale="en" bookingUrl={BOOKING} />
    );
    const m = /<svg[^>]*class="iqr-idp"[\s\S]*?<\/svg>/.exec(html);
    return m ? m[0] : '';
  }

  it('is byte-identical for two different children (same shape & size for everyone)', () => {
    const a = makeReport('valid');
    const b = makeReport('valid');
    // Mutate b's content — the pentagon must NOT change (it encodes no value).
    const b2 = {
      ...b,
      indices: b.indices.map((i) => ({...i, band: 'developing', bandLabel: 'Developing nicely'}))
    } as ReportContent;
    const pa = pentagonOf(a);
    const pb = pentagonOf(b2);
    expect(pa).not.toBe('');
    expect(pa).toBe(pb);
    expect(pa).toContain('role="img"');
  });
});
