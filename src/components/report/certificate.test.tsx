import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';

import en from '@/messages/en.json';
import mk from '@/messages/mk.json';
import type {Locale} from '@/content/locale';
import type {IndexId} from '@/lib/scoring/v2';
import type {ReportContent} from '@/lib/report';
import {CertificateArt} from './CertificateArt';
import {CertificatePanel} from './CertificatePanel';
import type {CertificateCopy} from './certificate-copy';

const COPY: Record<Locale, CertificateCopy> = {
  en: {...(en.Certificate as unknown as CertificateCopy), notice: en.Disclaimer.notice},
  mk: {...(mk.Certificate as unknown as CertificateCopy), notice: mk.Disclaimer.notice}
};

/** A minimal ReportContent fixture whose only knobs are the top strength + date. */
function makeReport(topIndex: IndexId, name: string): ReportContent {
  return {
    meta: {
      age: 8,
      locale: 'en',
      normsVersion: 'test',
      generatedDate: '2026-06-23',
      validity: {outcome: 'valid', note: null, caveated: false}
    },
    topStrength: {index: topIndex, name, bandLabel: 'Strongly developed', body: '...'}
  } as unknown as ReportContent;
}

/** Strip tags + decode entities → visible text (mirrors the results-screen test). */
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

/** Remove the "IQ UP!" brand wordmark — it is brand text, explicitly allowed, NOT
 *  a score (mirrors the 3.10 brand-text decision). Everything else must be clean. */
function stripWordmark(text: string): string {
  return text.replace(/\bIQ\s*UP\s*!?/gi, ' ');
}

// The same matchers the engine + messages + results-screen suites use.
const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;

const LOCALES: Locale[] = ['mk', 'en'];
const INDICES: IndexId[] = [
  'logical',
  'spatial',
  'memory_focus',
  'planning_speed',
  'learning_stem'
];
const STRENGTH_NAME: Record<Locale, string> = {
  en: 'Logical thinking',
  mk: 'Логичко размислување'
};

describe('Certificate — honest framing (no score on the keepsake)', () => {
  it('the forbidden matchers are non-vacuous', () => {
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);
    // ...and the wordmark stripper does NOT swallow a real "IQ score" leak.
    expect(FORBIDDEN_EN.test(stripWordmark('IQ score'))).toBe(true);
  });

  for (const locale of LOCALES) {
    for (const index of INDICES) {
      it(`renders no score/IQ/%/rank/band token — ${locale} / ${index}`, () => {
        const html = renderToStaticMarkup(
          <CertificateArt
            report={makeReport(index, STRENGTH_NAME[locale])}
            locale={locale}
            copy={COPY[locale]}
            childName="Маја"
          />
        );
        const text = stripWordmark(visibleText(html));
        expect(FORBIDDEN_EN.test(text), `EN token leaked (${locale}/${index})`).toBe(false);
        expect(FORBIDDEN_MK.test(text), `MK token leaked (${locale}/${index})`).toBe(false);
      });
    }
  }

  it('has no stray digit beyond the keepsake date', () => {
    const html = renderToStaticMarkup(
      <CertificateArt
        report={makeReport('logical', STRENGTH_NAME.en)}
        locale="en"
        copy={COPY.en}
        childName="Maya"
      />
    );
    // The only digits on the certificate are the month/year footer date.
    const remainder = visibleText(html).replace('June 2026', ' ');
    expect(/\d/.test(remainder), `stray digit: "${remainder}"`).toBe(false);
  });
});

describe('Certificate — determinism (same ReportContent → same markup)', () => {
  it('is byte-identical across two renders of the same input', () => {
    const a = renderToStaticMarkup(
      <CertificateArt report={makeReport('spatial', 'Shapes')} locale="en" copy={COPY.en} childName="Ana" />
    );
    const b = renderToStaticMarkup(
      <CertificateArt report={makeReport('spatial', 'Shapes')} locale="en" copy={COPY.en} childName="Ana" />
    );
    expect(a).toBe(b);
    expect(a).toContain('role="img"');
  });
});

describe('Certificate — the optional name is on-device only', () => {
  it('the panel adds NO name by default (toggle off, no input rendered)', () => {
    const text = visibleText(
      renderToStaticMarkup(
        <CertificatePanel report={makeReport('logical', STRENGTH_NAME.en)} locale="en" copy={COPY.en} />
      )
    );
    // The opt-in toggle label is present, but the name FIELD is not (off by default).
    expect(text).toContain(COPY.en.addName);
    expect(text).not.toContain(COPY.en.nameLabel);
    // ...and with no name, the certificate shows the warm line, not "Awarded to".
    expect(text).not.toContain(COPY.en.awardedTo);
  });

  it('renders the name into the certificate image only — never into an attribute', () => {
    const NAME = 'Зоранчо';
    const html = renderToStaticMarkup(
      <CertificateArt report={makeReport('logical', STRENGTH_NAME.mk)} locale="mk" copy={COPY.mk} childName={NAME} />
    );
    // The name is rendered as visible text inside the certificate image…
    expect(visibleText(html)).toContain(NAME);
    // …and NEVER inside any attribute (href / src / action / data-*) that could
    // carry it off the device.
    const attrWithName = new RegExp(`[a-zA-Z-]+="[^"]*${NAME}`);
    expect(attrWithName.test(html), 'name leaked into an attribute').toBe(false);
  });
});

describe('Certificate — no-leak (the name reaches no store / URL / network / OG)', () => {
  const panelSrc = readFileSync(new URL('./CertificatePanel.tsx', import.meta.url), 'utf8');
  const artSrc = readFileSync(new URL('./CertificateArt.tsx', import.meta.url), 'utf8');
  const ogSrc = readFileSync(
    new URL('../../app/[locale]/report/opengraph-image.tsx', import.meta.url),
    'utf8'
  );

  it('the certificate code calls no store / analytics / network sink', () => {
    for (const [label, src] of [
      ['CertificatePanel', panelSrc],
      ['CertificateArt', artSrc]
    ] as const) {
      expect(src, `${label} imports submitAssessment`).not.toMatch(/submitAssessment/);
      expect(src, `${label} calls fetch`).not.toMatch(/\bfetch\s*\(/);
      expect(src, `${label} calls track`).not.toMatch(/\btrack\s*\(/);
      expect(src, `${label} calls sendBeacon`).not.toMatch(/sendBeacon/);
      expect(src, `${label} references gtag/clarity/fbq`).not.toMatch(/gtag|clarity|fbq/);
      expect(src, `${label} builds a query string`).not.toMatch(/URLSearchParams/);
    }
  });

  it('the share fallback copies a PII-free URL and shares no name', () => {
    // The only clipboard write is the locale landing origin — never the name.
    expect(panelSrc).toMatch(/writeText\(url\)/);
    expect(panelSrc).toMatch(/window\.location\.origin/);
    // The Web Share metadata is generic copy — never the child name.
    expect(panelSrc).toMatch(/text:\s*copy\.og\.tagline/);
    expect(panelSrc).not.toMatch(/text:\s*childName/);
    expect(panelSrc).not.toMatch(/writeText\(\s*childName/);
  });

  it('the share OG image is name-free by construction (takes only {locale})', () => {
    // No child-name source, no per-result lookup, no query-param name.
    expect(ogSrc).not.toMatch(/childName|sessionStorage|topStrength|searchParams|\?name=/);
    // It takes ONLY the locale param — structurally impossible to leak a name.
    expect(ogSrc).toMatch(/params:\s*Promise<\{locale: string\}>/);
    expect(ogSrc).toMatch(/generateStaticParams/);
    // It reads only the generic, name-free Certificate.og copy.
    expect(ogSrc).toMatch(/Certificate\.og/);
  });
});
