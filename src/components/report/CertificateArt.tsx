import {forwardRef, type CSSProperties} from 'react';
import type {Locale} from '@/content/locale';
import type {ReportContent} from '@/lib/report';
import {BIBI_CERT_ART} from '@/components/result/bibi';
import type {CertificateCopy} from './certificate-copy';
import {certAccent, certMonthYear, CONFETTI, CONFETTI_COLORS} from './cert-model';

/**
 * The shareable certificate artwork (Phase 3.11) — a fixed 1080 × 1350 (portrait
 * 4:5) artboard, the ONE place Bibi appears. Built to the 3.08 certificate surface
 * (`docs/design-handovers/surfaces/Certificate.html`), re-implemented as fresh v2
 * code on the shipped v2 token system (`--ix-*` / `--action*` / `--ink-*`,
 * Montserrat, the per-index hues). It is a PURE, props-driven render so it is
 * deterministic AND verifiable without a browser (`certificate.test.tsx`).
 *
 * The root div is the captured node — `CertificatePanel` forwards a ref to it.
 * Built entirely from text + vectors + solid fills (inline styles referencing the
 * v2 tokens) so `html-to-image` reproduces it faithfully as a flat raster.
 *
 * HONESTY (hard rule): NO band / score / % / rank / number — only the brand
 * wordmark, the "Explorer" reward framing, and the top strength in warm,
 * child-facing language. The accent is drawn deterministically from the top
 * strength's index hue; accent colour only ever sits behind text as the light
 * `-tint` (with `-ink`) or as `-ink` on the white card — both AA across all five
 * hues (see `cert-accent.test.ts`). The OPTIONAL `childName` is rendered in the
 * browser only and never leaves the device.
 */
export interface CertificateArtProps {
  report: ReportContent;
  locale: Locale;
  copy: CertificateCopy;
  /** On-device-only child name. Empty → the certificate shows no name. */
  childName?: string;
}

export const CertificateArt = forwardRef<HTMLDivElement, CertificateArtProps>(
  function CertificateArt({report, locale, copy, childName = ''}, ref) {
    const topIndex = report.topStrength.index;
    const accent = certAccent(topIndex);
    const strengthName = report.topStrength.name;
    const strengthLine = copy.strengthLine[topIndex];
    const date = certMonthYear(report.meta.generatedDate, locale);
    const name = childName.trim();
    const hasName = name.length > 0;
    // Step the name down for longer names so it stays on one comfortable line.
    const nameSize = name.length > 13 ? 60 : name.length > 8 ? 78 : 96;

    return (
      <div
        ref={ref}
        role="img"
        aria-label={copy.altLabel}
        style={{
          position: 'relative',
          width: 1080,
          height: 1350,
          overflow: 'hidden',
          isolation: 'isolate',
          fontFamily: 'var(--font-brand)',
          color: 'var(--ink)',
          background: accent.tint
        }}
      >
        {/* playful frame: white panel ringed by the violet action + the accent */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 34,
            borderRadius: 48,
            background: 'var(--surface)',
            boxShadow: `0 0 0 10px var(--action), 0 0 0 22px ${accent.solid}`
          }}
        />

        {/* decorative waves (fixed hues) + deterministic confetti */}
        <svg
          aria-hidden
          viewBox="0 0 1080 120"
          preserveAspectRatio="none"
          style={{position: 'absolute', left: 0, top: 34, width: '100%', height: 120, zIndex: 1}}
        >
          <path
            fill="var(--ix-logic-tint)"
            d="M0 0 H1080 V64 C880 104 720 40 540 64 C360 88 200 40 0 72 Z"
          />
        </svg>
        <svg
          aria-hidden
          viewBox="0 0 1080 120"
          preserveAspectRatio="none"
          style={{position: 'absolute', left: 0, bottom: 34, width: '100%', height: 120, zIndex: 1}}
        >
          <path
            fill="var(--ix-memory-tint)"
            d="M0 120 H1080 V56 C880 16 720 80 540 56 C360 32 200 80 0 48 Z"
          />
        </svg>
        <div aria-hidden style={{position: 'absolute', inset: 34, zIndex: 1}}>
          {CONFETTI.map(([x, y, kind, s, ci], i) => {
            const base: CSSProperties = {
              position: 'absolute',
              left: x - 34,
              top: y - 34,
              background: CONFETTI_COLORS[ci],
              opacity: 0.85
            };
            return (
              <span
                key={i}
                style={
                  kind === 'bar'
                    ? {...base, width: s * 1.8, height: s, borderRadius: 3}
                    : {...base, width: s, height: s, borderRadius: '50%'}
                }
              />
            );
          })}
        </div>

        {/* content column */}
        <div
          style={{
            position: 'absolute',
            inset: 34,
            zIndex: 2,
            padding: '78px 84px 70px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {/* header — wordmark + the per-child accent "Certificate" tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <Wordmark size={40} />
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accent.ink,
                background: accent.tint,
                padding: '9px 20px',
                borderRadius: 999
              }}
            >
              {copy.tag}
            </span>
          </div>

          {/* the "Explorer" reward stamp (violet pill, white text — AA strong) */}
          <span
            style={{
              marginTop: 34,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              background: 'var(--action)',
              color: '#fff',
              padding: '16px 38px',
              borderRadius: 999,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            <Star size={34} />
            {copy.reward}
          </span>

          {/* Bibi placeholder — the ONLY Bibi slot. Drop in the licensed art by
              setting BIBI_CERT_ART (in src/components/result/bibi.ts) to its public
              path — this box then renders that image with no layout change. */}
          <div
            aria-hidden
            style={{
              width: 340,
              height: 340,
              margin: '34px 0 24px',
              borderRadius: 40,
              background: BIBI_CERT_ART ? 'var(--surface)' : accent.tint,
              border: BIBI_CERT_ART ? 'none' : `4px dashed ${accent.soft}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              overflow: 'hidden',
              color: accent.ink
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
                <PlaceholderSilhouette fill={accent.soft} />
                <span style={{fontSize: 20, fontWeight: 800}}>{copy.bibiPlaceholder}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: 0.85,
                    maxWidth: '24ch',
                    lineHeight: 1.3
                  }}
                >
                  {copy.bibiPlaceholderNote}
                </span>
              </>
            )}
          </div>

          {/* who — optional name, then the top strength (name pill + warm line) */}
          {hasName ? (
            <>
              <div style={{fontSize: 22, fontWeight: 600, color: 'var(--ink-muted)'}}>
                {copy.awardedTo}
              </div>
              <div
                style={{
                  fontSize: nameSize,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                  color: accent.ink,
                  margin: '8px 0 16px',
                  maxWidth: '16ch'
                }}
              >
                {name}
              </div>
            </>
          ) : null}

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: accent.tint,
              color: accent.ink,
              padding: '12px 26px',
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 800
            }}
          >
            {strengthName}
          </span>
          <p
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: 'var(--ink-head)',
              maxWidth: '22ch',
              margin: '18px 0 0',
              lineHeight: 1.25
            }}
          >
            {strengthLine}
          </p>

          {/* footer — keepsake month/year + the brand sign-off */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <span style={{fontSize: 18, fontWeight: 600, color: 'var(--ink-muted)'}}>
              {date ?? ''}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 18,
                fontWeight: 700,
                color: accent.ink
              }}
            >
              <span aria-hidden style={{color: accent.solid, display: 'inline-flex'}}>
                <Star size={20} />
              </span>
              {copy.from}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

/** The "IQ UP!" brand wordmark — structural markup (not an i18n string), so the
 *  forbidden-token scans treat it as brand text, not a score. The spans are
 *  adjacent (no inner spaces). */
function Wordmark({size}: {size: number}) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1
      }}
    >
      <span style={{color: 'var(--action)'}}>IQ</span>
      <span style={{color: 'var(--ink-head)'}}>UP</span>
      <span
        style={{
          marginLeft: '0.06em',
          background: 'var(--action)',
          color: '#fff',
          width: '1.05em',
          height: '1.3em',
          display: 'inline-grid',
          placeItems: 'center',
          borderRadius: 10
        }}
      >
        !
      </span>
    </span>
  );
}

function Star({size}: {size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.6 6.6L21.5 9l-5.2 4.4 1.8 6.6L12 16.7 5.9 20l1.8-6.6L2.5 9l6.9-.4z" />
    </svg>
  );
}

/** Abstract, licensing-safe placeholder (NOT a Bibi look-alike) — two ears + a
 *  body, in the accent's soft hue, until the licensed art lands. */
function PlaceholderSilhouette({fill}: {fill: string}) {
  return (
    <svg width={170} height={180} viewBox="0 0 170 180" aria-hidden>
      <ellipse cx="45" cy="40" rx="22" ry="30" fill={fill} transform="rotate(-16 45 40)" />
      <ellipse cx="125" cy="40" rx="22" ry="30" fill={fill} transform="rotate(16 125 40)" />
      <rect x="25" y="60" width="120" height="120" rx="58" fill={fill} />
    </svg>
  );
}
