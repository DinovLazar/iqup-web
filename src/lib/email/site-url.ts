/**
 * The single source for the locale-prefixed site base used by every email CTA.
 *
 * Pure + isomorphic (NO `server-only`) so it can be imported by the `server-only`
 * results-email orchestrator (2.01) AND by the pure nurture-email templates (2.03)
 * — which are rendered under Vitest and under the `emails:nurture` render script —
 * without pulling in a server tripwire or a mock.
 *
 * Extracted in 2.03 from the private `siteUrlFor` that used to live in
 * `send-results-email.ts`, so the 2.01 results email and the 2.03 nurture emails
 * resolve their trial-CTA target from the SAME place. When the real booking flow
 * lands in 2.05, this is the one seam to update and both pick it up.
 *
 * `NEXT_PUBLIC_SITE_URL` is finalised to the production domain in 2.06; until then
 * it falls back to `http://localhost:3000` (the documented dev placeholder).
 */
import type {Locale} from '@/content/locale';

/** Absolute, locale-prefixed site base for email CTAs (EN at `/en`, MK at `/`). */
export function siteUrlFor(locale: Locale): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ).replace(/\/+$/, '');
  return locale === 'en' ? `${base}/en` : base;
}
