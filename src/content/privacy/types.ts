/**
 * Privacy / cookie-policy content types (Phase 2.04).
 *
 * The substantive policy prose lives as structured, typed bilingual content
 * (`mk.ts` / `en.ts`) so the page can render real semantic HTML (sections,
 * paragraphs, lists, a cookie `<table>`) and so a parity test can assert MK↔EN
 * structural equivalence. The on-screen chrome (page title, lead, labels, table
 * headers, the draft notice, the "manage cookies" control) lives in the
 * `Privacy` next-intl namespace, not here.
 *
 * PROVISIONAL: this is a GDPR baseline pending IqUp legal sign-off; all MK copy
 * is provisional pending native-MK review.
 *
 * HARD RULE (project guardrail): no string here may introduce a score / IQ
 * number / percentile / rank, or imply the activity yields a number. Enforced by
 * `privacy.test.ts`. (Digits themselves are allowed — dates, durations,
 * address numbers — only the score/IQ *words* are forbidden.)
 */

/** A single rendered block inside a policy section. */
export type PrivacyBlock =
  | {kind: 'p'; text: string}
  | {kind: 'list'; items: string[]};

/** One policy section: stable id (language-neutral), localized heading + blocks. */
export type PrivacySection = {
  /** Stable, language-neutral anchor id (e.g. `who-we-are`). */
  id: string;
  heading: string;
  blocks: PrivacyBlock[];
};

/** A row in the cookie table. `name` is language-neutral (cookie key). */
export type CookieRow = {
  /** The literal cookie name(s) — never translated (e.g. `_ga`, `NEXT_LOCALE`). */
  name: string;
  provider: string;
  purpose: string;
  /** Localized category label ("Necessary"/"Неопходни", …). */
  category: string;
  duration: string;
};

/** The full per-locale privacy content. */
export type PrivacyContent = {
  /** Provisional version stamp (e.g. `privacy-v1-draft-2026-06`). */
  version: string;
  /** ISO date of last update (e.g. `2026-06-19`). */
  lastUpdated: string;
  sections: PrivacySection[];
  cookieTable: CookieRow[];
};
