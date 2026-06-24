'use client';

import {useEffect, useId, useRef, useState} from 'react';
import {Check, Download, Info, Loader2, Share2} from 'lucide-react';
import type {Locale} from '@/content/locale';
import type {ReportContent} from '@/lib/report';
import {HonestNote} from '@/components/common/HonestNote';
import {CertificateArt} from './CertificateArt';
import type {CertificateCopy} from './certificate-copy';

/**
 * The interactive certificate panel (Phase 3.11) — the wrapper around the pure
 * `CertificateArt`. It is the `// SEAM (3.11)` entry on the results screen: the
 * parent can (optionally) add their child's name, then download or share the
 * keepsake. Reuses the proven v1 mechanics as v2 code:
 *   • Download = client-side `html-to-image` → PNG at the design resolution, with
 *     fonts embedded after `document.fonts.ready` (no tofu in MK Cyrillic).
 *   • Share = the Web Share API file-share where supported, else a copy-link
 *     fallback to an on-brand, PII-free preview (the locale landing page).
 *
 * THE OPTIONAL NAME NEVER LEAVES THE DEVICE. It lives only in component state and
 * the in-browser image render. It is NOT placed in any payload, URL, query string,
 * OG image, or analytics event — there is no server action and no network call
 * here that carries it (the only thing the share fallback copies is the PII-free
 * landing URL). The image the parent then chooses to share is their own artifact.
 */
export function CertificatePanel({
  report,
  locale,
  copy
}: {
  report: ReportContent;
  locale: Locale;
  copy: CertificateCopy;
}) {
  const uid = useId();
  const certRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [addName, setAddName] = useState(false);
  const [childName, setChildName] = useState('');
  const [busy, setBusy] = useState<'idle' | 'download' | 'share'>('idle');
  const [status, setStatus] = useState<{text: string; error: boolean} | null>(null);
  const [scale, setScale] = useState(0.3);

  // Fit the full-size (1080-wide) certificate to the stage width — responsive,
  // no layout shift. The CAPTURED node stays un-transformed at 1080×1350, so the
  // export is a faithful raster regardless of the preview scale.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setScale(stage.clientWidth / 1080);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const renderName = addName ? childName : '';

  async function renderBlob(): Promise<Blob> {
    const node = certRef.current;
    if (!node) throw new Error('certificate node not mounted');
    // Wait for the web fonts before serialising (html-to-image can otherwise drop
    // them). Loaded lazily so the bundle stays out of the initial results payload
    // (only needed to EXPORT the certificate, not to view it).
    if (document.fonts?.ready) await document.fonts.ready;
    const htmlToImage = await import('html-to-image');
    const opts = {width: 1080, height: 1350, pixelRatio: 1} as const;

    // Best case: embed ONLY the brand face (Montserrat, latin + cyrillic) so the
    // Macedonian text renders in Montserrat with no tofu. Embedding EVERY site
    // font (Rubik / Nunito / dev fonts × all subsets ≈ 23 faces) bloats the
    // rasterised SVG and can stall it — we want exactly the two faces the
    // certificate uses. Guarded by a timeout so a renderer that can't rasterise
    // SVG-embedded fonts falls back to a fast system-font capture (Cyrillic still
    // renders cleanly) — the UI never hangs on "Preparing…".
    try {
      const allCss = await htmlToImage.getFontEmbedCSS(node);
      const fontEmbedCSS = allCss
        .split('@font-face')
        .filter(
          (b) => /Montserrat/i.test(b) && !/Fallback/i.test(b) && /(U\+0-FF|U\+400-45F)/i.test(b)
        )
        .map((b) => '@font-face' + b)
        .join('\n');
      if (fontEmbedCSS) {
        const embedded = await Promise.race([
          htmlToImage.toBlob(node, {...opts, fontEmbedCSS}),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000))
        ]);
        if (embedded) return embedded;
      }
    } catch {
      // fall through to the system-font capture
    }

    const blob = await htmlToImage.toBlob(node, {...opts, skipFonts: true});
    if (!blob) throw new Error('certificate capture failed');
    return blob;
  }

  async function handleDownload() {
    if (busy !== 'idle') return;
    setBusy('download');
    setStatus(null);
    try {
      const blob = await renderBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iqup-explorer-certificate.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setStatus({text: copy.shareError, error: true});
    } finally {
      setBusy('idle');
    }
  }

  async function handleShare() {
    if (busy !== 'idle') return;
    setBusy('share');
    setStatus(null);
    try {
      const blob = await renderBlob();
      const file = new File([blob], 'iqup-explorer-certificate.png', {type: 'image/png'});
      // The share text is generic + name-free (the child's name lives only in the
      // image the parent made, never in the message metadata).
      const shareData = {files: [file], title: copy.reward, text: copy.og.tagline};
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        await copyLink();
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // user cancelled — leave silently
      } else {
        await copyLink();
      }
    } finally {
      setBusy('idle');
    }
  }

  /** Copy a PII-free on-brand URL (the locale landing page) — never this child's
   *  result, and never the optional name. */
  async function copyLink() {
    try {
      const origin = window.location.origin;
      const url = locale === 'en' ? `${origin}/en` : `${origin}/`;
      await navigator.clipboard.writeText(url);
      setStatus({text: copy.linkCopied, error: false});
    } catch {
      setStatus({text: copy.shareError, error: true});
    }
  }

  const nameId = `${uid}-cert-name`;
  const toggleId = `${uid}-cert-addname`;

  return (
    <div className="iqc">
      <p className="iqc__intro">{copy.intro}</p>

      {/* Opt-in, on-device-only name — OFF by default. */}
      <div className="iqc__namebox">
        <label className="iqc__toggle" htmlFor={toggleId}>
          <input
            id={toggleId}
            type="checkbox"
            checked={addName}
            onChange={(e) => {
              setAddName(e.target.checked);
              if (!e.target.checked) setChildName('');
            }}
          />
          <span>{copy.addName}</span>
        </label>
        {addName ? (
          <div className="iqc__field">
            <label htmlFor={nameId}>{copy.nameLabel}</label>
            <input
              id={nameId}
              type="text"
              autoComplete="off"
              maxLength={24}
              placeholder={copy.namePlaceholder}
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
            />
            <p className="iqc__priv">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 1 1 8 0v3" />
              </svg>
              <span>{copy.namePrivacy}</span>
            </p>
          </div>
        ) : null}
      </div>

      {/* Scaled preview — the captured node is the un-transformed 1080×1350 cert. */}
      <div className="iqc__stage" ref={stageRef} style={{height: 1350 * scale}}>
        <div
          className="iqc__scaler"
          style={{transform: `scale(${scale})`, transformOrigin: 'top left'}}
        >
          <CertificateArt ref={certRef} report={report} locale={locale} copy={copy} childName={renderName} />
        </div>
      </div>

      <div className="iqc__actions">
        <button
          type="button"
          className="iqc__btn iqc__btn--primary"
          onClick={handleDownload}
          disabled={busy !== 'idle'}
        >
          {busy === 'download' ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <Download className="size-5" aria-hidden />
          )}
          {busy === 'download' ? copy.preparing : copy.download}
        </button>
        <button
          type="button"
          className="iqc__btn iqc__btn--ghost"
          onClick={handleShare}
          disabled={busy !== 'idle'}
        >
          {busy === 'share' ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <Share2 className="size-5" aria-hidden />
          )}
          {busy === 'share' ? copy.preparing : copy.share}
        </button>
      </div>

      <p
        className={`iqc__status${status?.error ? ' iqc__status--err' : ''}`}
        aria-live="polite"
      >
        {status ? (
          <>
            {status.error ? (
              <Info className="size-4" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            {status.text}
          </>
        ) : null}
      </p>

      {/* The shared honest-framing notice (Phase 3.14) — a brief honest line in the
          panel CHROME (the rasterised artboard stays number-free + clean), sourced
          from the one `Disclaimer` namespace. */}
      <HonestNote notice={copy.notice} className="mx-auto max-w-[42ch] text-center text-[13px]" />
    </div>
  );
}
