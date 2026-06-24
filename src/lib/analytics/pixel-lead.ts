/**
 * Browser Meta Pixel `Lead` + the CAPI dedup bridge (Phase 3.12).
 *
 * Re-homes the orphaned v1 `EmailGate` Pixel `Lead` onto the v2 `ReportFlow`,
 * fired AFTER `submitAssessment` returns success. It is fired separately from
 * `track()` because the dedup `event_id` must reach `fbq` as the 4th-arg
 * `eventID` — which `track()`'s PII-free sanitiser would (correctly) strip.
 *
 * DEDUP: the SAME `event_id` is used by the server CAPI `Lead` and this browser
 * `Lead`; Meta deduplicates server + browser events by `event_id` + `event_name`.
 * If the Pixel is not loaded (id unset or Marketing not granted), this is a clean
 * no-op and CAPI alone carries the Lead — the intended reliable path.
 */

import {META_PIXEL_ID} from './env';
import {getConsentSnapshot, isBrowser} from './runtime';

/** Read a single cookie value by name (SSR-safe). */
function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const prefix = `${name}=`;
  const match = document.cookie.split('; ').find((c) => c.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

/**
 * The Meta browser ids used to improve CAPI match quality. PII-free first-party
 * ids set by the Pixel; both optional (absent when the Pixel never loaded). They
 * are transient match data — written to NEITHER store and never placed in a URL.
 */
export function readFbCookies(): {fbp?: string; fbc?: string} {
  return {fbp: readCookie('_fbp'), fbc: readCookie('_fbc')};
}

/**
 * Fire the browser Pixel `Lead` with the shared dedup `event_id`. No-op unless
 * Marketing is granted, the Pixel id is set, and `fbq` is actually present
 * (i.e. the Pixel loaded). Never throws.
 */
export function firePixelLead(eventId: string): void {
  if (!isBrowser()) return;
  if (getConsentSnapshot().marketing !== true) return;
  if (!META_PIXEL_ID) return;
  if (typeof window.fbq !== 'function') return;
  try {
    // 3rd arg = custom_data (none — no cognitive data); 4th arg = the dedup id.
    window.fbq('track', 'Lead', {}, {eventID: eventId});
  } catch {
    /* never throw — analytics must never break the reveal */
  }
}
