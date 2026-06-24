import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';

// Per-locale Open Graph / Twitter image for the results / share surface (/report),
// 1200×630 — Phase 3.11.
//
// GENERIC + NAME-FREE by design: a shared link must NEVER preview a child's name
// or result (children's-data minimisation). It shows only on-brand "IqUp Explorer"
// copy. The optional on-device certificate name is NEVER read here — this route
// takes only `{locale}`, so it is structurally impossible to leak. Rendered with
// the Cyrillic-capable Montserrat (the v2 brand face, the SAME static TTFs the PDF
// embeds) so the Macedonian image never ships tofu glyphs. Hex values are inlined
// (satori can't resolve CSS theme tokens) — keep in sync with globals.css.
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';
export const alt = 'IqUp';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

const FONT_DIR = join(process.cwd(), 'src', 'lib', 'pdf', 'fonts');

function loadFont(file: string) {
  return readFile(join(FONT_DIR, file));
}

export default async function ReportOpengraphImage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Certificate.og'});
  const headline = t('headline');
  const tagline = t('tagline');

  const [semibold, extrabold] = await Promise.all([
    loadFont('Montserrat-SemiBold.ttf'),
    loadFont('Montserrat-ExtraBold.ttf')
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'radial-gradient(120% 90% at 50% -10%, #fff2cc 0%, #fafcfc 55%, #daf1fc 100%)',
          fontFamily: 'Montserrat'
        }}
      >
        {/* wordmark — IQ + a violet UP! badge (brand text, not a score) */}
        <div style={{display: 'flex', alignItems: 'baseline', fontSize: 52}}>
          <span style={{fontWeight: 800, color: '#3b4757'}}>IQ</span>
          <span
            style={{
              marginLeft: 12,
              background: '#762d90',
              color: '#ffffff',
              fontWeight: 800,
              borderRadius: 14,
              padding: '4px 18px'
            }}
          >
            UP!
          </span>
        </div>

        {/* generic, name-free message */}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div
            style={{
              display: 'flex',
              width: 26,
              height: 26,
              background: '#ec008c',
              borderRadius: 7,
              transform: 'rotate(45deg)'
            }}
          />
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 66,
              fontWeight: 800,
              color: '#241f36',
              lineHeight: 1.1,
              maxWidth: 1000
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 32,
              fontWeight: 600,
              color: '#762d90'
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {name: 'Montserrat', data: semibold, weight: 600, style: 'normal'},
        {name: 'Montserrat', data: extrabold, weight: 800, style: 'normal'}
      ]
    }
  );
}
