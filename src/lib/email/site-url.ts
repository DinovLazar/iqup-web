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

/**
 * The on-screen demo-class CTA target for the v2 results screen (Phase 3.09) —
 * resolves the 3.07 `?grad` seam so the CTA is NEVER a dead link before the real
 * IqUp booking URL lands.
 *
 * Prefers `NEXT_PUBLIC_BOOKING_URL` (the real booking flow, pending IqUp); until
 * that env var is set it falls back to the localized `/trial` page via
 * `trialBookingUrl`. Either way the chosen centre is carried as `?grad=${cityKey}`
 * — `cityKey` is the STABLE centre id (the `?grad` value `ReportContent.iqup.city`
 * carries), never a localized display label, and the only thing ever put in the
 * URL (no PII). Isomorphic: `NEXT_PUBLIC_*` is inlined for the client island.
 */
export function bookingUrlFor(locale: Locale, cityKey: string): string {
  const configured = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  const target = configured && configured.length > 0 ? configured : trialBookingUrl(locale);
  try {
    const u = new URL(target);
    u.searchParams.set('grad', cityKey);
    return u.toString();
  } catch {
    // A relative/malformed configured value — append the param defensively.
    const sep = target.includes('?') ? '&' : '?';
    return `${target}${sep}grad=${encodeURIComponent(cityKey)}`;
  }
}
