import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_VERSION
} from './constants';
import type {ConsentState, StoredConsent} from './types';
import {buildStoredConsent} from './state';

/**
 * First-party `iqup_consent` cookie helpers over `document.cookie`. No runtime
 * dependency (guardrail §5.6). The parse/serialise pair is pure so the
 * round-trip + version-bump invalidation are unit-tested without the DOM.
 */

/** Serialise a stored choice to the compact JSON cookie value. */
export function serializeConsent(stored: StoredConsent): string {
  return JSON.stringify({
    v: stored.v,
    analytics: stored.analytics,
    marketing: stored.marketing,
    ts: stored.ts
  });
}

/**
 * Parse a raw cookie value into a StoredConsent. Returns `null` when the value
 * is malformed OR when its version differs from the current
 * COOKIE_CONSENT_VERSION (a bump re-prompts, guardrail §2.3).
 */
export function parseConsent(raw: string | null | undefined): StoredConsent | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.v !== 'string' || v.v !== COOKIE_CONSENT_VERSION) return null;
  if (typeof v.analytics !== 'boolean' || typeof v.marketing !== 'boolean') {
    return null;
  }
  if (typeof v.ts !== 'string' || v.ts.length === 0) return null;
  return {
    v: v.v,
    analytics: v.analytics,
    marketing: v.marketing,
    ts: v.ts
  };
}

/** Read + validate the consent cookie from `document.cookie`. SSR-safe. */
export function readConsentCookie(): StoredConsent | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${CONSENT_COOKIE_NAME}=`;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(prefix));
  if (!match) return null;
  return parseConsent(decodeURIComponent(match.slice(prefix.length)));
}

/**
 * Persist a choice to the consent cookie: path=/, SameSite=Lax, Secure in
 * production, ~6-month expiry. Returns the StoredConsent that was written.
 */
export function writeConsentCookie(
  state: ConsentState,
  ts?: string
): StoredConsent {
  const stored = buildStoredConsent(state, ts);
  if (typeof document !== 'undefined') {
    const secure =
      typeof location !== 'undefined' && location.protocol === 'https:'
        ? '; Secure'
        : '';
    document.cookie =
      `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serializeConsent(stored))}` +
      `; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  }
  return stored;
}
