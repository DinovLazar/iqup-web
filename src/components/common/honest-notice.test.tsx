import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';

import en from '@/messages/en.json';
import mk from '@/messages/mk.json';
import type {Locale} from '@/content/locale';
import type {IndexId} from '@/lib/scoring/v2';
import type {ReportContent} from '@/lib/report';
import {getAboutContent} from '@/content/about';
import {AboutArticle} from '@/components/about/AboutArticle';
import {AgeSetup} from '@/components/assessment/screens/AgeSetup';
import {CertificatePanel} from '@/components/report/CertificatePanel';
import type {CertificateCopy} from '@/components/report/certificate-copy';
import {HonestNote} from './HonestNote';

const LOCALES = [
  ['mk', mk],
  ['en', en]
] as const;

/** Strip tags + decode the common entities → visible text. */
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

/** A minimal ReportContent fixture (mirrors certificate.test.tsx). */
function makeReport(topIndex: IndexId, name: string): ReportContent {
  return {
    meta: {
      age: 8,
      locale: 'en',
      normsVersion: 'test',
      generatedDate: '2026-06-25',
      validity: {outcome: 'valid', note: null, caveated: false}
    },
    topStrength: {index: topIndex, name, bandLabel: 'Strongly developed', body: '...'}
  } as unknown as ReportContent;
}

describe('HonestNote — the one shared honest-framing notice', () => {
  for (const [locale, M] of LOCALES) {
    it(`renders the shared notice + provisional line, muted (AA) (${locale})`, () => {
      const html = renderToStaticMarkup(
        <HonestNote
          variant="inset"
          ariaLabel={M.Disclaimer.ariaLabel}
          notice={M.Disclaimer.notice}
          provisional={M.Disclaimer.provisional}
        />
      );
      const text = visibleText(html);
      expect(text).toContain(M.Disclaimer.notice);
      expect(text).toContain(M.Disclaimer.provisional);
      // Muted ink (AA on canvas/card), never an attention/error colour.
      expect(html).toContain('text-ink-soft');
      expect(html).toContain('role="note"');
    });
  }
});

describe('the shared notice renders on each required chrome surface', () => {
  for (const [locale, M] of LOCALES) {
    const notice = M.Disclaimer.notice;

    it(`About page article renders the shared notice (${locale})`, () => {
      const html = renderToStaticMarkup(
        <AboutArticle
          content={getAboutContent(locale as Locale)}
          notice={
            <HonestNote
              variant="inset"
              notice={notice}
              provisional={M.Disclaimer.provisional}
            />
          }
        />
      );
      expect(visibleText(html)).toContain(notice);
    });

    it(`assessment setup screen renders the shared notice (${locale})`, () => {
      const s = M.Assessment.setup;
      const html = renderToStaticMarkup(
        <AgeSetup
          copy={{
            title: s.title,
            lead: s.lead,
            ageQuestion: s.ageQuestion,
            ageHint: s.ageHint,
            start: s.start,
            ariaAge: s.ariaAge,
            notice
          }}
          onAge={() => {}}
        />
      );
      expect(visibleText(html)).toContain(notice);
    });

    it(`certificate panel chrome renders the shared notice (${locale})`, () => {
      const copy = {
        ...(M.Certificate as unknown as CertificateCopy),
        notice
      };
      const html = renderToStaticMarkup(
        <CertificatePanel
          report={makeReport('logical', 'Logical thinking')}
          locale={locale as Locale}
          copy={copy}
        />
      );
      expect(visibleText(html)).toContain(notice);
    });
  }
});

describe('every required honest-framing surface is wired to a single source', () => {
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

  // The five CHROME surfaces (Phase 3.14): each renders the shared HonestNote.
  const SHARED_SURFACES = [
    ['landing hero', '../landing/Hero.tsx'],
    ['assessment setup', '../assessment/screens/AgeSetup.tsx'],
    ['certificate panel', '../report/CertificatePanel.tsx'],
    ['about page', '../../app/[locale]/about-test/page.tsx'],
    ['privacy page', '../../app/[locale]/privacy/page.tsx']
  ] as const;

  it('the five chrome surfaces all render the shared HonestNote component', () => {
    for (const [label, p] of SHARED_SURFACES) {
      expect(read(p), `${label} is missing HonestNote`).toMatch(/HonestNote/);
    }
  });

  it('the chrome surfaces source the notice from the single Disclaimer namespace', () => {
    // Pages resolve `Disclaimer`; the islands (Hero / AgeSetup / CertificatePanel)
    // receive it as a prop, threaded from the page resolver.
    expect(read('../../app/[locale]/about-test/page.tsx')).toMatch(/namespace: 'Disclaimer'/);
    expect(read('../../app/[locale]/privacy/page.tsx')).toMatch(/namespace: 'Disclaimer'/);
    expect(read('../../app/[locale]/report/page.tsx')).toMatch(/namespace: 'Disclaimer'/);
    expect(read('../../app/[locale]/test/page.tsx')).toMatch(/namespace: 'Disclaimer'/);
    expect(read('../landing/Hero.tsx')).toMatch(/useTranslations\('Disclaimer'\)/);
  });

  // The two FROZEN output surfaces keep `report.disclaimer` (NOT this source) —
  // verify-only, must remain present + unchanged.
  it('the frozen results + PDF surfaces still render report.disclaimer (verify-only)', () => {
    expect(read('../report/ResultsScreen.tsx')).toMatch(/report\.disclaimer/);
    expect(read('../../lib/pdf/ReportDocument.tsx')).toMatch(/disclaimer\.(body|provisional)/);
  });
});
