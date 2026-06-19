/**
 * Cookie / tracking consent types (Phase 2.04).
 *
 * IMPORTANT: this is the COOKIE consent — entirely separate from the lead's
 * parental consent (`CONSENT_VERSION` / the `leads.consent` column, Phase 1.08).
 * The two never share state, names, or versions (guardrail §5.4).
 */

/** The two switchable, non-essential categories. "Necessary" is always on. */
export type ConsentCategory = 'analytics' | 'marketing';

/**
 * The current grant state for the switchable categories. Deny-by-default:
 * both are `false` until the parent actively grants them.
 */
export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

/**
 * The compact JSON persisted in the `iqup_consent` first-party cookie.
 * `v` is the COOKIE_CONSENT_VERSION the choice was made under — a bump
 * invalidates the stored choice and re-shows the banner.
 */
export type StoredConsent = {
  v: string;
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp of when the choice was made. */
  ts: string;
};
