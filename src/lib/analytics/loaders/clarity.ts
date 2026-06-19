/**
 * Microsoft Clarity loader (Phase 2.04).
 *
 * STRICT load model: injected ONLY when called with a granted state AND
 * `CLARITY_ID` is set. Idempotent, SSR-safe, never throws.
 *
 * NOTE: the Cowork dashboard disables Clarity's auto-cookies, so this code must
 * NOT assume auto-cookies are on — we explicitly drive consent via the v2 API
 * (`consentv2`) so storage is only used once the parent grants analytics.
 */

import type {ConsentState} from '@/lib/consent/types';
import {CLARITY_ID, devNotice} from '../env';
import {isBrowser, isClarityLoaded, markClarityLoaded} from '../runtime';

function consentV2Payload(analyticsGranted: boolean, marketingGranted: boolean) {
  return {
    analytics_Storage: analyticsGranted ? 'granted' : 'denied',
    ad_Storage: marketingGranted ? 'granted' : 'denied'
  } as const;
}

/**
 * Inject the Clarity bootstrap and signal v2 consent. No-ops if already loaded,
 * if no id, or on SSR.
 */
export function loadClarity(analyticsGranted: boolean, marketingGranted: boolean): void {
  if (!isBrowser()) return;
  if (isClarityLoaded()) {
    updateClarityConsent({analytics: analyticsGranted, marketing: marketingGranted});
    return;
  }
  if (!CLARITY_ID) {
    devNotice('Clarity id (NEXT_PUBLIC_CLARITY_ID) not set — skipping Clarity load.');
    return;
  }

  try {
    // Standard Clarity bootstrap (queues calls until the tag script loads).
    const c = window as unknown as {clarity?: ((...a: unknown[]) => void) & {q?: unknown[]}};
    if (typeof c.clarity !== 'function') {
      const queue: unknown[] = [];
      const clarity = Object.assign(
        function clarity(...args: unknown[]) {
          queue.push(args);
        },
        {q: queue}
      );
      window.clarity = clarity;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
    document.head.appendChild(script);

    // Auto-cookies are OFF in the dashboard — drive consent explicitly.
    window.clarity?.('consentv2', consentV2Payload(analyticsGranted, marketingGranted));

    markClarityLoaded();
  } catch {
    /* never throw */
  }
}

/** Re-signal Clarity v2 consent (used on re-grant). No-op if absent. */
export function updateClarityConsent(consent: ConsentState): void {
  if (!isBrowser() || typeof window.clarity !== 'function') return;
  try {
    window.clarity('consentv2', consentV2Payload(consent.analytics, consent.marketing));
  } catch {
    /* never throw */
  }
}

/** Signal Clarity v2 consent denied (withdrawal). No-op if absent. */
export function revokeClarity(): void {
  if (!isBrowser() || typeof window.clarity !== 'function') return;
  try {
    window.clarity('consentv2', {analytics_Storage: 'denied', ad_Storage: 'denied'});
  } catch {
    /* never throw */
  }
}
