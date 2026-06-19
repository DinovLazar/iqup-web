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

/**
 * THE single source for the trial-booking URL (Phase 2.05) — the public booking
 * page (`/trial`, EN at `/en/trial`). After 2.05 the result screen, the results
 * email, and the three trial nurture emails all resolve their trial target from
 * here, so it updates in exactly one place.
 *
 * Built on `siteUrlFor` (so the `NEXT_PUBLIC_SITE_URL`-unset → `http://localhost:3000`
 * fallback is preserved) + the `/trial` slug. When a `utmCampaign` is given, the
 * shared Brevo UTM tags are appended (`utm_source=brevo`, `utm_medium=email`, the
 * per-email campaign) — the nurture + results emails use this; the on-screen
 * surface omits the campaign (no UTM).
 *
 * NOTE: `trial` is a PROVISIONAL slug — see `// TODO(mk-slug)` on the route. The
 * production host behind `siteUrlFor` is finalised in 2.06.
 */
export function trialBookingUrl(locale: Locale, utmCampaign?: string): string {
  const base = `${siteUrlFor(locale)}/trial`;
  if (!utmCampaign) return base;
  const u = new URL(base);
  u.searchParams.set('utm_source', 'brevo');
  u.searchParams.set('utm_medium', 'email');
  u.searchParams.set('utm_campaign', utmCampaign);
  return u.toString();
}
