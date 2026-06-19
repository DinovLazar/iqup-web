'use client';

import {Cookie} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useConsent} from '@/lib/consent/ConsentProvider';
import type {ConsentCopy} from './copy';

/**
 * Cookie-consent banner (Phase 2.04). A NON-modal, non-blocking region pinned to
 * the bottom of the viewport — it never traps focus and never blocks scrolling of
 * the page behind it. GDPR parity: Accept and Reject are the same size/weight so
 * rejecting is exactly as easy as accepting.
 *
 * Renders nothing until the provider has read the cookie (`ready`) to avoid a
 * hydration mismatch + CLS, and hides itself once a choice exists (`decided`) or
 * the Manage dialog has taken over (`manageOpen`).
 */
export function ConsentBanner({copy}: {copy: ConsentCopy}) {
  const {ready, decided, manageOpen, acceptAll, rejectAll, openManage} =
    useConsent();

  if (!ready || decided || manageOpen) return null;

  return (
    <div
      role="region"
      aria-label={copy.banner.ariaLabel}
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="motion-safe:animate-[consent-banner-in_240ms_ease-out] w-full max-w-3xl rounded-[var(--radius-xl)] border border-border border-t bg-card p-5 shadow-[var(--shadow-lg)] sm:p-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-secondary-tint text-secondary-ink sm:flex"
          >
            <Cookie className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-base font-semibold text-ink">
              {copy.banner.title}
            </h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              {copy.banner.body}
            </p>
          </div>
        </div>

        {/* Actions: Accept + Reject share a row at the TOP of the group with
            IDENTICAL styling (same fill, contrast, size, weight, elevation) — no
            nudge toward Accept, so rejecting is exactly as easy + as salient as
            accepting (GDPR / EDPB dark-pattern guidance). Manage sits as clearly
            lower emphasis (outline) but is still a real, ≥44px tappable button. */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            data-consent-action="accept"
            onClick={acceptAll}
            className="h-11 min-h-11 flex-1 bg-secondary px-5 text-sm font-semibold text-secondary-foreground shadow-[var(--shadow-md)] hover:bg-secondary/90 sm:flex-initial"
          >
            {copy.banner.accept}
          </Button>
          <Button
            type="button"
            data-consent-action="reject"
            onClick={rejectAll}
            className="h-11 min-h-11 flex-1 bg-secondary px-5 text-sm font-semibold text-secondary-foreground shadow-[var(--shadow-md)] hover:bg-secondary/90 sm:flex-initial"
          >
            {copy.banner.reject}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openManage}
            className="h-11 min-h-11 flex-1 px-5 text-sm font-medium sm:flex-initial sm:ml-auto"
          >
            {copy.banner.manage}
          </Button>
        </div>
      </div>

      {/* Scoped keyframes for the motion-safe entrance only — disabled entirely
          under prefers-reduced-motion via the motion-safe variant above.
          Transform-only (no opacity fade): keeps the buttons at full opacity
          throughout, so an a11y scanner reading mid-animation never sees a
          composited sub-AA colour (the settled colours are AA). */}
      <style>{`
        @keyframes consent-banner-in {
          from { transform: translateY(0.75rem); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ConsentBanner;
