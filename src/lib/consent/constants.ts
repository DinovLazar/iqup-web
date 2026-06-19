/**
 * Cookie / tracking consent constants (Phase 2.04).
 *
 * Bumping COOKIE_CONSENT_VERSION invalidates every stored choice and re-shows
 * the banner. It is DISTINCT from the lead's parental `CONSENT_VERSION`
 * (`src/lib/leads/lead-mapping.ts`) — never conflate the two (guardrail §5.4).
 */
export const COOKIE_CONSENT_VERSION = 'cookies-v1-2026-06';

/** First-party cookie that stores the parent's cookie choices. */
export const CONSENT_COOKIE_NAME = 'iqup_consent';

/**
 * ~6 months. After it lapses the cookie is gone, so the banner re-asks.
 * Tunable — re-ask cadence is a single constant.
 */
export const CONSENT_COOKIE_MAX_AGE_DAYS = 183;
export const CONSENT_COOKIE_MAX_AGE_SECONDS =
  CONSENT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
