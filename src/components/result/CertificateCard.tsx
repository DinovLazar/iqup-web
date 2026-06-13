'use client';

import {useRef, useState} from 'react';
import {toBlob} from 'html-to-image';
import {Download, Share2, Check, Loader2} from 'lucide-react';
import type {Locale} from '@/content/locale';
import type {StrengthCode} from '@/content/strengths';
import {Button} from '@/components/ui/button';
import {Certificate, type CertificateFace} from './Certificate';

export interface CertificateCardCopy {
  heading: string;
  text: string;
  download: string;
  share: string;
  preparing: string;
  linkCopied: string;
  shareError: string;
}

interface CertificateCardProps {
  name: string;
  celebrated: readonly StrengthCode[];
  locale: Locale;
  /** Completion ISO timestamp (from the lead context). */
  dateISO?: string;
  face: CertificateFace;
  altLabel: string;
  copy: CertificateCardCopy;
  /** §6C certificate line — used as the share message text (client-side share only). */
  shareText: string;
  /** Generic landing URL copied in the share fallback (NOT this child's result). */
  siteUrl: string;
}

const PREVIEW_W = 272;
const SCALE = PREVIEW_W / 1080;
const FILENAME = 'iqup-brain-games-certificate.png';

type Busy = 'idle' | 'download' | 'share';

/** Render the 1080×1350 certificate at full size off the captured node, scaled
 *  down for preview. The captured node (`certRef`) is the un-transformed
 *  certificate, so the export is a faithful 1080×1350 raster. */
export function CertificateCard({
  name,
  celebrated,
  locale,
  dateISO,
  face,
  altLabel,
  copy,
  shareText,
  siteUrl
}: CertificateCardProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<Busy>('idle');
  const [status, setStatus] = useState<string>('');
  const date = dateISO ? new Date(dateISO) : new Date();

  async function renderBlob(): Promise<Blob> {
    const node = certRef.current;
    if (!node) throw new Error('certificate node not mounted');
    // Embed the self-hosted Cyrillic fonts correctly (html-to-image can otherwise
    // drop web fonts) — wait for them before serialising the SVG.
    if (document.fonts?.ready) await document.fonts.ready;
    const blob = await toBlob(node, {
      width: 1080,
      height: 1350,
      pixelRatio: 1, // node is already native 1080×1350 → Instagram-portrait size
      cacheBust: true
    });
    if (!blob) throw new Error('certificate capture failed');
    return blob;
  }

  async function handleDownload() {
    if (busy !== 'idle') return;
    setBusy('download');
    setStatus('');
    try {
      const blob = await renderBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = FILENAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setStatus(copy.shareError);
    } finally {
      setBusy('idle');
    }
  }

  async function handleShare() {
    if (busy !== 'idle') return;
    setBusy('share');
    setStatus('');
    try {
      const blob = await renderBlob();
      const file = new File([blob], FILENAME, {type: 'image/png'});
      const shareData = {files: [file], title: copy.heading, text: shareText};
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
      // User-cancelled share → no-op; anything else → copy-link fallback.
      if (err instanceof DOMException && err.name === 'AbortError') {
        // cancelled, leave silently
      } else {
        await copyLink();
      }
    } finally {
      setBusy('idle');
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setStatus(copy.linkCopied);
    } catch {
      setStatus(copy.shareError);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[34rem] rounded-[var(--radius-xl)] bg-card p-6 shadow-[var(--shadow-md)] ring-1 ring-border sm:grid sm:max-w-[55rem] sm:grid-cols-[272px_1fr] sm:items-center sm:gap-8 sm:p-8 sm:text-left">
      {/* scaled preview — the captured node is the un-transformed certificate */}
      <div
        aria-hidden="true"
        className="relative mx-auto mb-5 overflow-hidden rounded-[18px] shadow-[var(--shadow-lg)] ring-1 ring-border sm:mx-0 sm:mb-0"
        style={{width: PREVIEW_W, height: Math.round(1350 * SCALE)}}
      >
        <div style={{position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${SCALE})`}}>
          <Certificate
            ref={certRef}
            name={name}
            celebrated={celebrated}
            locale={locale}
            date={date}
            face={face}
            altLabel={altLabel}
          />
        </div>
      </div>

      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl font-extrabold text-ink">{copy.heading}</h2>
        <p className="mx-auto mt-1.5 mb-5 max-w-[34ch] text-ink-soft sm:mx-0">{copy.text}</p>

        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
          <Button
            type="button"
            onClick={handleDownload}
            disabled={busy !== 'idle'}
            className="h-13 min-h-[3.25rem] gap-2.5 rounded-full bg-hero px-6 text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
          >
            {busy === 'download' ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-5" aria-hidden="true" />
            )}
            {busy === 'download' ? copy.preparing : copy.download}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleShare}
            disabled={busy !== 'idle'}
            className="h-13 min-h-[3.25rem] gap-2.5 rounded-full px-6 text-base font-bold"
          >
            {busy === 'share' ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Share2 className="size-5" aria-hidden="true" />
            )}
            {busy === 'share' ? copy.preparing : copy.share}
          </Button>
        </div>

        <p
          aria-live="polite"
          className="mt-3 flex min-h-[1.25rem] items-center justify-center gap-1.5 text-sm font-semibold text-success-ink sm:justify-start"
        >
          {status && (
            <>
              <Check className="size-4" aria-hidden="true" />
              {status}
            </>
          )}
        </p>
      </div>
    </section>
  );
}
