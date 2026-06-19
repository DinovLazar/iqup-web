/**
 * Shared live state for the consent-gated analytics layer (Phase 2.04).
 *
 * Read by both `track()` (to decide whether to emit) and the loaders (to avoid
 * double-injecting scripts). All DOM access is SSR-safe.
 */

import type {ConsentState} from '@/lib/consent/types';

/* -------------------------------------------------------------------------- */
/* Global window augmentations (single place for the whole analytics layer).   */
/* -------------------------------------------------------------------------- */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & {q?: unknown[]};
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: Window['fbq'];
  }
}

/* -------------------------------------------------------------------------- */
/* Consent snapshot — deny-by-default.                                         */
/* -------------------------------------------------------------------------- */

let consentSnapshot: ConsentState = {analytics: false, marketing: false};

export function getConsentSnapshot(): ConsentState {
  return consentSnapshot;
}

export function setConsentSnapshot(consent: ConsentState): void {
  consentSnapshot = {
    analytics: consent.analytics === true,
    marketing: consent.marketing === true
  };
}

/* -------------------------------------------------------------------------- */
/* Idempotent-injection bookkeeping.                                           */
/* -------------------------------------------------------------------------- */

let gaLoaded = false;
let clarityLoaded = false;
let pixelLoaded = false;

export const isGaLoaded = (): boolean => gaLoaded;
export const isClarityLoaded = (): boolean => clarityLoaded;
export const isPixelLoaded = (): boolean => pixelLoaded;

export const markGaLoaded = (): void => {
  gaLoaded = true;
};
export const markClarityLoaded = (): void => {
  clarityLoaded = true;
};
export const markPixelLoaded = (): void => {
  pixelLoaded = true;
};

/* -------------------------------------------------------------------------- */
/* SSR helpers.                                                                */
/* -------------------------------------------------------------------------- */

/** True only in a real browser with a DOM we can inject into. */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
