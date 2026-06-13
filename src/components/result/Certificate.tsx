import {forwardRef, type CSSProperties} from 'react';
import type {Locale} from '@/content/locale';
import {STRENGTHS, type StrengthCode} from '@/content/strengths';
import {StrengthGlyph} from './StrengthGlyph';
import {BIBI_CERT_ART} from './bibi';
import {
  CERT_CREAM,
  CERT_CREAM_EDGE,
  certNameSize,
  certificateTint,
  formatCertDate
} from './certificate-model';

/** The certificate's localized face labels (chrome, from the `Result` namespace). */
export interface CertificateFace {
  eyebrow: string;
  preline: string;
  line: string;
  shines: string;
  bibiPlaceholder: string;
}

export interface CertificateProps {
  name: string;
  /** Celebrated strengths (top1, top2) — the only strengths shown. */
  celebrated: readonly StrengthCode[];
  locale: Locale;
  /** Completion date for the footer. */
  date: Date;
  face: CertificateFace;
  /** Fully-resolved alt/`aria-label` (name + strengths filled). */
  altLabel: string;
}

const NAME_SIZE: Record<'base' | 'long' | 'xlong', number> = {
  base: 104,
  long: 78,
  xlong: 60
};

// Deterministic confetti scatter, kept clear of the centre text column (mockup).
const PIECES: ReadonlyArray<[number, number, 'dot' | 'tri', number]> = [
  [70, 70, 'dot', 16], [930, 90, 'dot', 13], [120, 300, 'tri', 16], [945, 360, 'dot', 18],
  [62, 560, 'dot', 12], [980, 640, 'tri', 14], [80, 900, 'dot', 16], [955, 930, 'dot', 12],
  [150, 1130, 'tri', 16], [900, 1140, 'dot', 14], [60, 1180, 'dot', 11], [975, 1200, 'dot', 15]
];

/**
 * The shareable certificate — a fixed 1080 × 1350 (portrait 4:5) artboard. Built
 * entirely from text, vectors, and solid/gradient fills under the handover's
 * render constraint, so `html-to-image` reproduces it faithfully as a flat raster.
 *
 * The root div is the captured node — `CertificateCard` forwards a ref to it. The
 * cream background is constant (never tinted); only the frame, flourish, art, and
 * chips carry the per-child tint, so AA holds for every child (see
 * `certificate-model.test.ts`).
 */
export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  function Certificate({name, celebrated, locale, date, face, altLabel}, ref) {
    const tint = certificateTint(celebrated);
    const nameSize = NAME_SIZE[certNameSize(name)];
    const confettiColors = [
      'var(--hero)',
      tint.charA,
      tint.charB,
      'var(--accent-grape)',
      'var(--accent-coral)',
      'var(--secondary)'
    ];

    return (
      <div
        ref={ref}
        role="img"
        aria-label={altLabel}
        style={{
          position: 'relative',
          width: 1080,
          height: 1350,
          overflow: 'hidden',
          isolation: 'isolate',
          fontFamily: 'var(--font-sans)',
          color: 'var(--ink)',
          background: `radial-gradient(120% 80% at 50% 0%, ${CERT_CREAM} 55%, ${CERT_CREAM_EDGE} 100%)`
        }}
      >
        {/* gradient keepsake frame (top1 → top2) + inner cream panel */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 40,
            borderRadius: 64,
            padding: 11,
            background: `linear-gradient(150deg, ${tint.tintA}, ${tint.tintB})`
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 11,
              borderRadius: 54,
              background: CERT_CREAM
            }}
          />
        </div>
        {/* thin secondary keyline */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 64,
            borderRadius: 40,
            border: `2px solid color-mix(in srgb, ${tint.tintA} 42%, white)`,
            zIndex: 3
          }}
        />

        {/* confetti */}
        <div aria-hidden style={{position: 'absolute', inset: 40, zIndex: 2}}>
          {PIECES.map(([x, y, kind, s], i) => {
            const c = confettiColors[i % confettiColors.length];
            const base: CSSProperties = {
              position: 'absolute',
              left: x - 40,
              top: y - 40,
              opacity: 0.9
            };
            return kind === 'tri' ? (
              <span
                key={i}
                style={{
                  ...base,
                  width: 0,
                  height: 0,
                  borderLeft: `${s}px solid transparent`,
                  borderRight: `${s}px solid transparent`,
                  borderBottom: `${s * 1.6}px solid ${c}`
                }}
              />
            ) : (
              <span
                key={i}
                style={{...base, width: s, height: s, borderRadius: '50%', background: c}}
              />
            );
          })}
        </div>

        {/* content column */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            padding: 96,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 25,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: 'var(--secondary-ink)'
            }}
          >
            <span style={{color: 'var(--hero-strong)', fontSize: 22}}>✦</span>
            <span>{face.eyebrow}</span>
            <span style={{color: 'var(--hero-strong)', fontSize: 22}}>✦</span>
          </div>

          {/* Bibi placeholder — exact 336×336 drop-in box */}
          <div
            role="img"
            aria-label={face.bibiPlaceholder}
            style={{
              width: 336,
              height: 336,
              marginTop: 30,
              position: 'relative',
              borderRadius: 48,
              background: BIBI_CERT_ART
                ? CERT_CREAM
                : `repeating-linear-gradient(135deg, transparent 0 18px, color-mix(in srgb, ${tint.tintA} 8%, transparent) 18px 19px), color-mix(in srgb, ${tint.tintA} 14%, ${CERT_CREAM})`,
              border: BIBI_CERT_ART
                ? 'none'
                : `3px dashed color-mix(in srgb, ${tint.tintA} 55%, white)`,
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden'
            }}
          >
            {BIBI_CERT_ART ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={BIBI_CERT_ART}
                alt=""
                style={{width: '100%', height: '100%', objectFit: 'contain'}}
              />
            ) : (
              <>
                <PlaceholderArt charA={tint.charA} charB={tint.charB} />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    color: `color-mix(in srgb, ${tint.tintA} 60%, var(--ink-soft))`,
                    background: `color-mix(in srgb, ${CERT_CREAM} 80%, transparent)`,
                    padding: '5px 14px',
                    borderRadius: 999
                  }}
                >
                  {face.bibiPlaceholder}
                </span>
              </>
            )}
          </div>

          <div style={{fontSize: 30, fontWeight: 600, color: 'var(--ink-soft)', margin: '30px 0 4px'}}>
            {face.preline}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 1.02,
              fontSize: nameSize,
              letterSpacing: '-0.015em',
              color: 'var(--ink)',
              maxWidth: '14ch',
              margin: 0,
              paddingBottom: 14
            }}
          >
            {name}
            <span
              style={{
                display: 'block',
                height: 14,
                width: 'min(62%, 360px)',
                margin: '14px auto 0',
                borderRadius: 999,
                background: tint.flourish
              }}
            />
          </h1>

          <p style={{fontSize: 34, fontWeight: 600, color: 'var(--ink-soft)', maxWidth: '24ch', margin: '28px 0 0', lineHeight: 1.4}}>
            {face.line}
          </p>

          <div aria-hidden style={{display: 'flex', alignItems: 'center', gap: 18, margin: '34px 0 30px', color: 'var(--hero-strong)'}}>
            <span style={{width: 70, height: 3, borderRadius: 3, background: 'color-mix(in srgb, var(--hero) 70%, var(--input))'}} />
            <span style={{fontSize: 26}}>✦</span>
            <span style={{width: 70, height: 3, borderRadius: 3, background: 'color-mix(in srgb, var(--hero) 70%, var(--input))'}} />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
              marginBottom: 22
            }}
          >
            {face.shines}
          </div>

          {/* celebrated strength chips — each in its own colour */}
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, maxWidth: 840}}>
            {celebrated.map((code) => {
              const token = STRENGTHS[code].token;
              const three = celebrated.length >= 3;
              return (
                <span
                  key={code}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: three ? 14 : 18,
                    padding: three ? '16px 26px 16px 18px' : '18px 30px 18px 20px',
                    borderRadius: 999,
                    background: `var(--strength-${token}-tint)`,
                    border: `2px solid color-mix(in srgb, var(--strength-${token}) 30%, white)`
                  }}
                >
                  <span
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      flex: '0 0 auto',
                      display: 'grid',
                      placeItems: 'center',
                      background: `var(--strength-${token})`,
                      color: '#fff'
                    }}
                  >
                    <StrengthGlyph code={code} style={{width: 34, height: 34}} />
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: three ? 28 : 31,
                      color: `var(--strength-${token}-ink)`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {STRENGTHS[code].name[locale]}
                  </span>
                </span>
              );
            })}
          </div>

          {/* footer — wordmark + date */}
          <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 40}}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.1em', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, lineHeight: 1, letterSpacing: '-0.01em'}}>
              <span style={{color: 'var(--secondary-ink)'}}>IQ</span>
              <span style={{color: 'var(--ink)'}}>UP</span>
              <span
                style={{
                  background: 'var(--hero)',
                  color: 'var(--hero-ink)',
                  width: '1.12em',
                  height: '1.36em',
                  display: 'inline-grid',
                  placeItems: 'center',
                  borderRadius: 12,
                  marginLeft: '0.1em',
                  transform: 'rotate(4deg)'
                }}
              >
                !
              </span>
            </span>
            <span style={{fontSize: 25, fontWeight: 600, color: 'var(--ink-faint)', letterSpacing: '0.02em'}}>
              {formatCertDate(date, locale)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

/** Abstract, licensing-safe placeholder art (NOT a Bibi look-alike). */
function PlaceholderArt({charA, charB}: {charA: string; charB: string}) {
  return (
    <svg width={264} height={264} viewBox="0 0 300 300" aria-hidden="true">
      <circle cx="150" cy="150" r="96" fill={charA} opacity="0.16" />
      <ellipse cx="120" cy="138" rx="58" ry="66" fill="var(--secondary)" opacity="0.22" transform="rotate(-12 120 138)" />
      <ellipse cx="182" cy="150" rx="52" ry="60" fill={charB} opacity="0.22" transform="rotate(10 182 150)" />
      <circle cx="150" cy="146" r="40" fill="var(--hero)" opacity="0.9" />
      <path d="M150 120l7 18 18 7-18 7-7 18-7-18-18-7 18-7z" fill="#fff" opacity="0.9" />
      <path d="M92 96l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="var(--hero-strong)" />
      <path d="M214 188l3.4 9 9 3.4-9 3.4-3.4 9-3.4-9-9-3.4 9-3.4z" fill="var(--accent-grape)" />
      <circle cx="210" cy="108" r="8" fill="var(--accent-coral)" />
      <circle cx="96" cy="196" r="7" fill={charA} />
    </svg>
  );
}
