import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';

// Per-locale Open Graph / Twitter image for /trial, 1200×630.
//
// GENERIC + NAME-FREE by design (mirrors /result): a shared booking link must
// never preview any child data. It shows only on-brand "book a free IqUp trial"
// copy. Rendered with the Cyrillic-capable Rubik font so the Macedonian image
// never ships tofu glyphs. Hex values are inlined (satori can't resolve CSS theme
// tokens) — keep in sync with the tokens / the /result image.
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';
export const alt = 'IqUp';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

const FONT_DIR = join(process.cwd(), 'node_modules', '@fontsource', 'rubik', 'files');

function loadFont(file: string) {
  return readFile(join(FONT_DIR, file));
}

export default async function TrialOpengraphImage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Trial.og'});
  const headline = t('headline');
  const tagline = t('tagline');

  const [latin800, cyrillic800, latin600, cyrillic600] = await Promise.all([
    loadFont('rubik-latin-800-normal.woff'),
    loadFont('rubik-cyrillic-800-normal.woff'),
    loadFont('rubik-latin-600-normal.woff'),
    loadFont('rubik-cyrillic-600-normal.woff')
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
            'radial-gradient(120% 90% at 50% -10%, #FFF3D1 0%, #FBF8F3 55%, #E3F1FB 100%)',
          fontFamily: 'Rubik'
        }}
      >
        {/* wordmark */}
        <div style={{display: 'flex', alignItems: 'baseline', fontSize: 52}}>
          <span style={{fontWeight: 800, color: '#241F36'}}>IQ</span>
          <span
            style={{
              marginLeft: 12,
              background: '#FFC83D',
              color: '#2A2440',
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
          {/* small CSS "spark" (a rotated square) — avoids loading a glyph font */}
          <div
            style={{
              display: 'flex',
              width: 26,
              height: 26,
              background: '#F4B000',
              borderRadius: 7,
              transform: 'rotate(45deg)'
            }}
          />
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 64,
              fontWeight: 800,
              color: '#241F36',
              lineHeight: 1.1,
              maxWidth: 1000
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 32,
              fontWeight: 600,
              color: '#0E5278'
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
        {name: 'Rubik', data: latin800, weight: 800, style: 'normal'},
        {name: 'Rubik', data: cyrillic800, weight: 800, style: 'normal'},
        {name: 'Rubik', data: latin600, weight: 600, style: 'normal'},
        {name: 'Rubik', data: cyrillic600, weight: 600, style: 'normal'}
      ]
    }
  );
}
