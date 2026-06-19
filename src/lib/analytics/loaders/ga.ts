/**
 * Google Analytics 4 loader (Phase 2.04).
 *
 * STRICT load model: the script is injected ONLY when called with a granted
 * state AND `GA4_ID` is set. Idempotent, SSR-safe, never throws.
 *
 * Consent Mode v2: the inline init sets ALL signals to `denied` by default,
 * then immediately `update`s to reflect the actual granted state before any
 * `config` call — so no storage is set unless consent allows it.
 */

import type {ConsentState} from '@/lib/consent/types';
import {GA4_ID, devNotice} from '../env';
import {isBrowser, isGaLoaded, markGaLoaded} from '../runtime';

function consentUpdatePayload(analyticsGranted: boolean, marketingGranted: boolean) {
  return {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: marketingGranted ? 'granted' : 'denied',
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    ad_personalization: marketingGranted ? 'granted' : 'denied'
  } as const;
}

/**
 * Inject gtag.js and initialise GA4 with Consent Mode defaults-denied, then
 * update to the granted state. No-ops if already loaded, if no id, or on SSR.
 */
export function loadGa(analyticsGranted: boolean, marketingGranted: boolean): void {
  if (!isBrowser()) return;
  if (isGaLoaded()) {
    // Already injected — just re-signal the (possibly changed) consent state.
    updateGaConsent({analytics: analyticsGranted, marketing: marketingGranted});
    return;
  }
  if (!GA4_ID) {
    devNotice('GA4 id (NEXT_PUBLIC_GA4_ID) not set — skipping GA load.');
    return;
  }

  try {
    window.dataLayer = window.dataLayer || [];
    // gtag pushes raw `arguments` onto the dataLayer per Google's snippet.
    const gtag: (...args: unknown[]) => void = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag = gtag;

    // Defaults: everything denied (deny-by-default), BEFORE config.
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
    // Immediately reflect the actual granted state.
    gtag('consent', 'update', consentUpdatePayload(analyticsGranted, marketingGranted));

    gtag('js', new Date());
    gtag('config', GA4_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    markGaLoaded();
  } catch {
    // Never throw from a loader — analytics must never break the app.
  }
}

/** Re-signal GA consent (used on re-grant). No-op if gtag is absent. */
export function updateGaConsent(consent: ConsentState): void {
  if (!isBrowser() || typeof window.gtag !== 'function') return;
  try {
    window.gtag('consent', 'update', consentUpdatePayload(consent.analytics, consent.marketing));
  } catch {
    /* never throw */
  }
}

/** Signal all GA storage denied (withdrawal). No-op if gtag is absent. */
export function revokeGa(): void {
  if (!isBrowser() || typeof window.gtag !== 'function') return;
  try {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  } catch {
    /* never throw */
  }
}
