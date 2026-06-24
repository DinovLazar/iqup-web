import {Info} from 'lucide-react';
import {cn} from '@/lib/utils';

/**
 * The ONE shared honest-framing notice (Phase 3.14).
 *
 * A small, presentational, props-driven component reading a SINGLE shared i18n
 * source (the `Disclaimer` namespace), resolved server-side and threaded in as
 * props — exactly the repo's island pattern (the component ships no i18n runtime).
 * It is reused across every required *chrome* surface (landing, the assessment
 * setup, the About page, the privacy page, the certificate panel) so the honest
 * framing reads identically everywhere from one place.
 *
 * It is textually consistent with the report's `report.disclaimer` core sentence,
 * but is DELIBERATELY NOT the same source: the results screen + the emailed PDF
 * keep `report.disclaimer` (frozen). This notice is for the chrome only.
 *
 * HONESTY: this is the one place clinical/diagnostic wording may appear — only to
 * NEGATE it ("not a clinical assessment, an IQ score, or a diagnosis"). The text is
 * muted (`--ink-muted`, AA on canvas/card) so it never competes with the page, and
 * carries no number, %, or magnitude word of its own.
 */
export interface HonestNoteProps {
  /** The core honest-framing sentence (`Disclaimer.notice`). */
  notice: string;
  /** The optional provisional-norms line (`Disclaimer.provisional`). */
  provisional?: string;
  /** An accessible label for the note region (`Disclaimer.ariaLabel` or a surface
   *  label). Only used by the `inset` variant (which is a labelled `<aside>`). */
  ariaLabel?: string;
  /**
   * `plain` — a quiet inline footnote (default; for the hero, setup, certificate).
   * `inset` — a bordered, lightly-tinted callout with an icon (for the fuller
   *   treatment on the About + privacy pages).
   */
  variant?: 'plain' | 'inset';
  className?: string;
}

export function HonestNote({
  notice,
  provisional,
  ariaLabel,
  variant = 'plain',
  className
}: HonestNoteProps) {
  if (variant === 'inset') {
    return (
      <aside
        role="note"
        aria-label={ariaLabel}
        className={cn(
          'flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-background px-5 py-4',
          className
        )}
      >
        <Info className="mt-0.5 size-5 shrink-0 text-ink-soft" aria-hidden />
        <div className="text-sm leading-relaxed text-ink-soft">
          <p>{notice}</p>
          {provisional ? <p className="mt-2">{provisional}</p> : null}
        </div>
      </aside>
    );
  }

  return (
    <p className={cn('text-sm leading-relaxed text-ink-soft', className)}>
      {notice}
      {provisional ? ` ${provisional}` : ''}
    </p>
  );
}
