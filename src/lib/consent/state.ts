import {COOKIE_CONSENT_VERSION} from './constants';
import type {ConsentState, StoredConsent} from './types';

/**
 * Pure consent state-machine helpers. Deny-by-default: the only way a category
 * becomes `true` is an explicit grant (Accept all / Save preferences).
 *
 * These are framework-free so the state machine is unit-tested without React or
 * `document` (Phase 2.04 §7).
 */

/** The deny-by-default state — what a first-time, undecided visitor has. */
export const DENIED_CONSENT: ConsentState = {analytics: false, marketing: false};

/** Accept all non-essential categories. */
export function acceptAllState(): ConsentState {
  return {analytics: true, marketing: true};
}

/** Reject all non-essential categories (same effect as the deny default). */
export function rejectAllState(): ConsentState {
  return {analytics: false, marketing: false};
}

/** Normalise an arbitrary per-category selection to a clean boolean state. */
export function toConsentState(input: Partial<ConsentState>): ConsentState {
  return {
    analytics: input.analytics === true,
    marketing: input.marketing === true
  };
}

/** Project a stored choice down to the live category state. */
export function consentStateFromStored(stored: StoredConsent): ConsentState {
  return toConsentState(stored);
}

/**
 * Build the value to persist for a given choice, stamped with the current
 * version and timestamp. `ts` is injectable for deterministic tests.
 */
export function buildStoredConsent(
  state: ConsentState,
  ts: string = new Date().toISOString()
): StoredConsent {
  return {
    v: COOKIE_CONSENT_VERSION,
    analytics: state.analytics === true,
    marketing: state.marketing === true,
    ts
  };
}
