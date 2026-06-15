import 'server-only';
import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {STRENGTHS, type StrengthCode} from '@/content/strengths';
import type {Locale} from '@/content/locale';
import {BRAND, STRENGTH_HEX, type StrengthHex} from './brand';
import {certNameSize, formatCertDate} from '@/components/result/certificate-model';
import {BIBI_CERT_ART} from '@/components/result/bibi';
import enMessages from '@/messages/en.json';
import mkMessages from '@/messages/mk.json';

/**
 * Server-side certificate renderer: produces the shareable certificate as a PNG,
 * to be attached to the results email.
 *
 * This is NOT a new design — it mirrors the on-screen certificate
 * (`src/components/result/Certificate.tsx`) within Satori's CSS limits:
 *  - Satori has no CSS variables / `color-mix()` / `display:grid`, so every colour
 *    is a literal hex from `BRAND` / `STRENGTH_HEX` (the documented OG exception),
 *    soft mixes are precomputed with `mix()`, and every multi-child layout uses
 *    flexbox.
 *  - Fonts are embedded from `@fontsource` `.woff` buffers (Latin + Cyrillic per
 *    weight) so the Macedonian name renders with no tofu — the proven pattern from
 *    `opengraph-image.tsx`.
 *
 * No score / IQ / % / rank appears anywhere — only the child's name, the
 * celebrated strengths, IqUp branding, and the completion date (as on screen).
 */
export interface CertificateImageInput {
  childFirstName: string;
  /** The celebrated strengths (top1, top2) — the only strengths shown. */
  celebrated: readonly StrengthCode[];
  locale: Locale;
  /** Completion date for the footer; defaults to new Date(). */
  date?: Date;
}

const WIDTH = 1080;
const HEIGHT = 1350;

/** Hero name size per length tier (literal mirror of Certificate.tsx). */
const NAME_SIZE: Record<'base' | 'long' | 'xlong', number> = {
  base: 104,
  long: 78,
  xlong: 60
};

/** The localized certificate face labels, picked by locale from the messages. */
interface CertificateFace {
  eyebrow: string;
  preline: string;
  line: string;
  shines: string;
  bibiPlaceholder: string;
}

function face(locale: Locale): CertificateFace {
  const messages = locale === 'mk' ? mkMessages : enMessages;
  return messages.Result.certificate as unknown as CertificateFace;
}

/**
 * Per-child tint, literal-hex mirror of `certificateTint` in `certificate-model.ts`:
 * the frame gradient blends top1-tint → top2-tint; the flourish + medallions use
 * the top1/top2 solids. A single celebrated strength falls back gracefully (frame
 * end = a lighter mix of the single tint), exactly like the on-screen cert.
 */
interface CertTintHex {
  /** Frame gradient start (top1 tint). */
  readonly tintA: string;
  /** Frame gradient end (top2 tint, or a lightened top1 tint when single). */
  readonly tintB: string;
  /** Name underline flourish (top1 solid). */
  readonly flourish: string;
  /** Placeholder-art primary (top1 solid). */
  readonly charA: string;
  /** Placeholder-art secondary (top2 solid). */
  readonly charB: string;
}

function tintFor(celebrated: readonly StrengthCode[]): CertTintHex {
  const code1 = celebrated[0];
  const code2 = celebrated[1] ?? celebrated[0];
  const hex1: StrengthHex = STRENGTH_HEX[STRENGTHS[code1].token];
  const hex2: StrengthHex = STRENGTH_HEX[STRENGTHS[code2].token];
  const hasTwo = celebrated.length > 1;
  return {
    tintA: hex1.tint,
    // single → color-mix(... 55%, white) on the on-screen cert; mirror it.
    tintB: hasTwo ? hex2.tint : mix(hex1.tint, BRAND.white, 0.55),
    flourish: hex1.solid,
    charA: hex1.solid,
    charB: hex2.solid
  };
}

/** Linear blend of two `#rrggbb` colours — `t` is the weight of `a` (Satori has
 *  no `color-mix`, so the on-screen cert's soft mixes are precomputed here). */
function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const ch = (i: number) => Math.round(ca[i] * t + cb[i] * (1 - t));
  return rgbHex(ch(0), ch(1), ch(2));
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ];
}

function rgbHex(r: number, g: number, b: number): string {
  const to = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Inline glyph paths, mirrored from `StrengthGlyph.tsx`. Rendered with an
 *  EXPLICIT white stroke (Satori does not reliably inherit `currentColor`).
 *
 *  Stored as ARRAYS, not Fragments: the `@vercel/og`-bundled Satori in this repo
 *  throws `Cannot convert a Symbol value to a string` when an SVG's only child is
 *  a React Fragment, but accepts a keyed array of elements (verified). */
const GLYPH_PATHS: Record<StrengthCode, React.ReactNode[]> = {
  pattern: [
    <circle key="c" cx="6.5" cy="6.5" r="3" />,
    <rect key="r1" x="14" y="3.5" width="6" height="6" rx="1.6" />,
    <path key="p" d="M6.5 14l3 5.5h-6z" />,
    <rect key="r2" x="14" y="14" width="6" height="6" rx="1.6" />
  ],
  logic: [
    <circle key="c1" cx="12" cy="5" r="2.5" />,
    <circle key="c2" cx="5.5" cy="19" r="2.5" />,
    <circle key="c3" cx="18.5" cy="19" r="2.5" />,
    <path key="p" d="M12 7.5v2.2c0 1.5-1 2.3-2.4 3.1C8 13.8 5.5 14.5 5.5 16.5M12 9.7c0 1.5 1 2.3 2.4 3.1 1.6.9 4.1 1.6 4.1 3.7" />
  ],
  memory: [
    <path key="p" d="M4 12a8 8 0 1 1 2.5 5.8" />,
    <polyline key="pl" points="3 18.5 3.5 13.5 8.5 14" />,
    <circle key="c" cx="12" cy="12" r="2.2" />
  ],
  spatial: [
    <path key="p1" d="M21 8.2l-9-5-9 5v7.6l9 5 9-5V8.2z" />,
    <path key="p2" d="M3 8.2l9 5 9-5M12 13.2v8" />
  ],
  numeracy: [
    <line key="l1" x1="4" y1="9" x2="20" y2="9" />,
    <line key="l2" x1="4" y1="15" x2="20" y2="15" />,
    <line key="l3" x1="10.5" y1="3.5" x2="8.5" y2="20.5" />,
    <line key="l4" x1="15.5" y1="3.5" x2="13.5" y2="20.5" />
  ],
  words_obs: [
    <path key="p" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />,
    <circle key="c" cx="12" cy="12" r="3" />
  ]
};

function Glyph({code, size}: {code: StrengthCode; size: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPH_PATHS[code]}
    </svg>
  );
}

/** Abstract, licensing-safe placeholder art (NEVER a Bibi look-alike). Ported and
 *  simplified for Satori from `Certificate.tsx`'s `PlaceholderArt`, with CSS-var
 *  fills swapped for literal brand hex. */
function PlaceholderArt({charA, charB}: {charA: string; charB: string}) {
  // Keyed array of children (not a Fragment) — see GLYPH_PATHS note.
  return (
    <svg width={264} height={264} viewBox="0 0 300 300">
      {[
        <circle key="bg" cx="150" cy="150" r="96" fill={charA} opacity="0.16" />,
        <ellipse key="e1" cx="120" cy="138" rx="58" ry="66" fill={BRAND.secondary} opacity="0.22" transform="rotate(-12 120 138)" />,
        <ellipse key="e2" cx="182" cy="150" rx="52" ry="60" fill={charB} opacity="0.22" transform="rotate(10 182 150)" />,
        <circle key="hub" cx="150" cy="146" r="40" fill={BRAND.hero} opacity="0.9" />,
        <path key="star" d="M150 120l7 18 18 7-18 7-7 18-7-18-18-7 18-7z" fill="#ffffff" opacity="0.9" />,
        <path key="s1" d="M92 96l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill={BRAND.heroStrong} />,
        <path key="s2" d="M214 188l3.4 9 9 3.4-9 3.4-3.4 9-3.4-9-9-3.4 9-3.4z" fill={BRAND.grape} />,
        <circle key="d1" cx="210" cy="108" r="8" fill={BRAND.coral} />,
        <circle key="d2" cx="96" cy="196" r="7" fill={charA} />
      ]}
    </svg>
  );
}

/** A four-point sparkle drawn as a vector. The on-screen cert uses the `✦`
 *  (U+2726) character, but neither Rubik nor Nunito Sans carry that glyph — under
 *  Satori (no system-font fallback) it would render as tofu — so the decoration is
 *  drawn as an SVG instead, matching the same shape. */
function Sparkle({size, color}: {size: number; color: string}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {[<path key="s" d="M12 1.5l2.6 6.9 6.9 2.6-6.9 2.6L12 22.5l-2.6-6.9L2.5 13l6.9-2.6z" />]}
    </svg>
  );
}

// Deterministic confetti scatter, kept clear of the centre text column (mockup).
const PIECES: ReadonlyArray<[number, number, 'dot' | 'tri', number]> = [
  [70, 70, 'dot', 16], [930, 90, 'dot', 13], [120, 300, 'tri', 16], [945, 360, 'dot', 18],
  [62, 560, 'dot', 12], [980, 640, 'tri', 14], [80, 900, 'dot', 16], [955, 930, 'dot', 12],
  [150, 1130, 'tri', 16], [900, 1140, 'dot', 14], [60, 1180, 'dot', 11], [975, 1200, 'dot', 15]
];

const FONT_DIR = (family: string) =>
  join(process.cwd(), 'node_modules', '@fontsource', family, 'files');

function loadFont(family: string, file: string) {
  return readFile(join(FONT_DIR(family), file));
}

export async function renderCertificatePng(
  input: CertificateImageInput
): Promise<Buffer> {
  const {childFirstName, celebrated, locale} = input;
  const date = input.date ?? new Date();
  const f = face(locale);
  const tint = tintFor(celebrated);
  const nameSize = NAME_SIZE[certNameSize(childFirstName)];

  // Soft mixes the on-screen cert makes with color-mix(), precomputed to hex.
  const keyline = mix(tint.tintA, BRAND.white, 0.42); // 42% tintA, 58% white
  const bibiFill = mix(tint.tintA, BRAND.cream, 0.14); // 14% tintA into cream
  const bibiBorder = mix(tint.tintA, BRAND.white, 0.55);
  const ruleColor = mix(BRAND.hero, BRAND.input, 0.7); // hero 70% + input

  const confettiColors = [
    BRAND.hero,
    tint.charA,
    tint.charB,
    BRAND.grape,
    BRAND.coral,
    BRAND.secondary
  ];

  const three = celebrated.length >= 3;

  // Licensed Bibi art when it lands (`public/bibi/…`), else the abstract
  // placeholder. NEVER generated/redrawn — the swap point lives in `bibi.ts`.
  const bibiArt: string | null = BIBI_CERT_ART;

  const element = (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: WIDTH,
        height: HEIGHT,
        // Satori has no radial-gradient parity for the vignette; a constant cream
        // matches the body-text background (AA basis) and reads identically.
        background: BRAND.cream,
        fontFamily: 'Nunito Sans',
        color: BRAND.ink
      }}
    >
      {/* gradient keepsake frame (top1 → top2) + inner cream panel */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 40,
          right: 40,
          bottom: 40,
          display: 'flex',
          borderRadius: 64,
          padding: 11,
          background: `linear-gradient(150deg, ${tint.tintA}, ${tint.tintB})`
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            borderRadius: 54,
            background: BRAND.cream
          }}
        />
      </div>

      {/* thin secondary keyline */}
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 64,
          right: 64,
          bottom: 64,
          borderRadius: 40,
          border: `2px solid ${keyline}`
        }}
      />

      {/* confetti */}
      {PIECES.map(([x, y, kind, s], i) => {
        const c = confettiColors[i % confettiColors.length];
        if (kind === 'tri') {
          return (
            <div
              key={`p${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 0,
                height: 0,
                borderLeft: `${s}px solid transparent`,
                borderRight: `${s}px solid transparent`,
                borderBottom: `${s * 1.6}px solid ${c}`,
                opacity: 0.9
              }}
            />
          );
        }
        return (
          <div
            key={`p${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: c,
              opacity: 0.9
            }}
          />
        );
      })}

      {/* content column */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: WIDTH,
          height: HEIGHT,
          padding: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'Rubik',
            fontWeight: 700,
            fontSize: 25,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: BRAND.secondaryInk
          }}
        >
          <span style={{display: 'flex', marginRight: 14}}>
            <Sparkle size={22} color={BRAND.heroStrong} />
          </span>
          <span>{f.eyebrow}</span>
          <span style={{display: 'flex', marginLeft: 14}}>
            <Sparkle size={22} color={BRAND.heroStrong} />
          </span>
        </div>

        {/* Bibi slot — 336×336 drop-in box */}
        <div
          style={{
            display: 'flex',
            width: 336,
            height: 336,
            marginTop: 30,
            borderRadius: 48,
            background: bibiArt ? BRAND.cream : bibiFill,
            border: bibiArt ? 'none' : `3px dashed ${bibiBorder}`,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {bibiArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bibiArt}
              alt=""
              width={336}
              height={336}
              style={{objectFit: 'contain'}}
            />
          ) : (
            [
              <PlaceholderArt key="art" charA={tint.charA} charB={tint.charB} />,
              <div
                key="cap"
                style={{
                  position: 'absolute',
                  bottom: 18,
                  display: 'flex',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 0.7,
                  color: mix(tint.tintA, BRAND.inkSoft, 0.6),
                  background: BRAND.cream,
                  padding: '5px 14px',
                  borderRadius: 999
                }}
              >
                {f.bibiPlaceholder}
              </div>
            ]
          )}
        </div>

        {/* preline */}
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 600,
            color: BRAND.inkSoft,
            marginTop: 30,
            marginBottom: 4
          }}
        >
          {f.preline}
        </div>

        {/* child NAME + flourish */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 0,
            paddingBottom: 14
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'Rubik',
              fontWeight: 800,
              lineHeight: 1.02,
              fontSize: nameSize,
              letterSpacing: -1,
              color: BRAND.ink
            }}
          >
            {childFirstName}
          </div>
          <div
            style={{
              display: 'flex',
              height: 14,
              width: 320,
              marginTop: 14,
              borderRadius: 999,
              background: tint.flourish
            }}
          />
        </div>

        {/* line */}
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            fontWeight: 600,
            color: BRAND.inkSoft,
            maxWidth: 720,
            marginTop: 28,
            lineHeight: 1.4
          }}
        >
          {f.line}
        </div>

        {/* divider rule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 34,
            marginBottom: 30,
            color: BRAND.heroStrong
          }}
        >
          <span style={{display: 'flex', width: 70, height: 3, borderRadius: 3, background: ruleColor}} />
          <span style={{display: 'flex', marginLeft: 18, marginRight: 18}}>
            <Sparkle size={26} color={BRAND.heroStrong} />
          </span>
          <span style={{display: 'flex', width: 70, height: 3, borderRadius: 3, background: ruleColor}} />
        </div>

        {/* "Shines at" label */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Rubik',
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 4.8,
            textTransform: 'uppercase',
            color: BRAND.inkFaint,
            marginBottom: 22
          }}
        >
          {f.shines}
        </div>

        {/* celebrated strength chips — each in its own colour */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 840
          }}
        >
          {celebrated.map((code) => {
            const hex = STRENGTH_HEX[STRENGTHS[code].token];
            return (
              <div
                key={code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: 11,
                  padding: three ? '16px 26px 16px 18px' : '18px 30px 18px 20px',
                  borderRadius: 999,
                  background: hex.tint,
                  border: `2px solid ${mix(hex.solid, BRAND.white, 0.3)}`
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: 60,
                    height: 60,
                    borderRadius: 60,
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: hex.solid,
                    marginRight: three ? 14 : 18
                  }}
                >
                  <Glyph code={code} size={34} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Rubik',
                    fontWeight: 700,
                    fontSize: three ? 28 : 31,
                    color: hex.ink
                  }}
                >
                  {STRENGTHS[code].name[locale]}
                </div>
              </div>
            );
          })}
        </div>

        {/* footer — wordmark + date */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: 40
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'Rubik',
              fontWeight: 800,
              fontSize: 44,
              lineHeight: 1,
              letterSpacing: -0.4
            }}
          >
            <span style={{color: BRAND.secondaryInk}}>IQ</span>
            <span style={{color: BRAND.ink}}>UP</span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: BRAND.hero,
                color: BRAND.heroInk,
                width: 50,
                height: 60,
                borderRadius: 12,
                marginLeft: 5,
                transform: 'rotate(4deg)'
              }}
            >
              !
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 25,
              fontWeight: 600,
              color: BRAND.inkFaint,
              letterSpacing: 0.5,
              marginTop: 16
            }}
          >
            {formatCertDate(date, locale)}
          </div>
        </div>
      </div>
    </div>
  );

  const [
    rubikLatin700,
    rubikCyr700,
    rubikLatin800,
    rubikCyr800,
    nunitoLatin600,
    nunitoCyr600,
    nunitoLatin700,
    nunitoCyr700
  ] = await Promise.all([
    loadFont('rubik', 'rubik-latin-700-normal.woff'),
    loadFont('rubik', 'rubik-cyrillic-700-normal.woff'),
    loadFont('rubik', 'rubik-latin-800-normal.woff'),
    loadFont('rubik', 'rubik-cyrillic-800-normal.woff'),
    loadFont('nunito-sans', 'nunito-sans-latin-600-normal.woff'),
    loadFont('nunito-sans', 'nunito-sans-cyrillic-600-normal.woff'),
    loadFont('nunito-sans', 'nunito-sans-latin-700-normal.woff'),
    loadFont('nunito-sans', 'nunito-sans-cyrillic-700-normal.woff')
  ]);

  const response = new ImageResponse(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {name: 'Rubik', data: rubikLatin700, weight: 700, style: 'normal'},
      {name: 'Rubik', data: rubikCyr700, weight: 700, style: 'normal'},
      {name: 'Rubik', data: rubikLatin800, weight: 800, style: 'normal'},
      {name: 'Rubik', data: rubikCyr800, weight: 800, style: 'normal'},
      {name: 'Nunito Sans', data: nunitoLatin600, weight: 600, style: 'normal'},
      {name: 'Nunito Sans', data: nunitoCyr600, weight: 600, style: 'normal'},
      {name: 'Nunito Sans', data: nunitoLatin700, weight: 700, style: 'normal'},
      {name: 'Nunito Sans', data: nunitoCyr700, weight: 700, style: 'normal'}
    ]
  });

  return Buffer.from(await response.arrayBuffer());
}
