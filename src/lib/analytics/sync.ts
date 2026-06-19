/**
 * Tracker synchronisation (Phase 2.04).
 *
 * `syncTrackers(consent)` is the single entry point the consent provider calls
 * whenever the parent's choice changes (and once on mount). It:
 *   1. updates the live snapshot so `track()` immediately respects the choice,
 *   2. injects newly-granted trackers (idempotently),
 *   3. re-grants already-injected trackers on re-call,
 *   4. signals `denied` to any tracker whose category was withdrawn.
 *
 * Deny-by-default: nothing loads until a category is granted. We never forcibly
 * unload an already-injected script mid-session — we signal denied; a clean
 * state lands on the next navigation.
 */

import type {ConsentState} from '@/lib/consent/types';
import {isBrowser, isGaLoaded, isClarityLoaded, isPixelLoaded, setConsentSnapshot} from './runtime';
import {loadGa, revokeGa} from './loaders/ga';
import {loadClarity, revokeClarity} from './loaders/clarity';
import {loadPixel, revokePixel} from './loaders/pixel';

export function syncTrackers(consent: ConsentState): void {
  // 1. Update the snapshot first — track() must respect the new state at once,
  //    even on the server (no DOM needed for the snapshot).
  setConsentSnapshot(consent);

  // 2. Everything below touches the DOM.
  if (!isBrowser()) return;

  const analyticsGranted = consent.analytics === true;
  const marketingGranted = consent.marketing === true;

  // --- Analytics category: GA4 + Clarity ---------------------------------
  if (analyticsGranted) {
    // loadGa/loadClarity self-skip if already loaded, and on re-call when
    // already loaded they re-grant via update*Consent internally.
    loadGa(analyticsGranted, marketingGranted);
    loadClarity(analyticsGranted, marketingGranted);
  } else {
    if (isGaLoaded()) revokeGa();
    if (isClarityLoaded()) revokeClarity();
  }

  // --- Marketing category: Meta Pixel ------------------------------------
  if (marketingGranted) {
    loadPixel();
  } else if (isPixelLoaded()) {
    revokePixel();
  }

  // If marketing changed but GA was already loaded, GA's ad_* signals are
  // handled above: loadGa() re-grants with the current marketing flag when it
  // is granted; revokeGa() denies all (incl. ad_*) when analytics is withdrawn.
  // When analytics stays granted but marketing toggles, the loadGa() re-grant
  // path already pushed the correct ad_* state.
}
