/**
 * Phase 2.03 — the one place every nurture-email link is built.
 *
 * Two responsibilities, both single-sourced here:
 *   1. UTM tagging — every outbound link carries `utm_source=brevo`,
 *      `utm_medium=email`, and a PER-EMAIL `utm_campaign`, so 2.04's GA4 can
 *      attribute nurture-driven visits.
 *   2. The trial-CTA target — it points at the SAME place the 2.01 results email's
 *      trial CTA does (`siteUrlFor`, the shared seam in `@/lib/email/site-url`), so
 *      the two stay identical and 2.05 updates both in one place.
 */
import type {Locale} from '@/content/locale';
import {siteUrlFor} from '@/lib/email/site-url';
import type {NurtureKey} from './copy';

const UTM_SOURCE = 'brevo';
const UTM_MEDIUM = 'email';

/** The per-email `utm_campaign` value (one per template). */
export const UTM_CAMPAIGN: Record<NurtureKey, string> = {
  'welcome-trial': 'nurture-welcome-trial',
  'welcome-general': 'nurture-welcome-general',
  'trial-invite': 'nurture-trial-invite',
  nudge: 'nurture-nudge'
};

/** Append the shared UTM params (+ the per-email campaign) to a URL. */
export function withUtm(url: string, campaign: string): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', UTM_SOURCE);
  u.searchParams.set('utm_medium', UTM_MEDIUM);
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}

/**
 * The CTA href for a nurture email: the locale-correct site base + UTM.
 *
 * TODO(booking 2.05): the trial CTA currently points at the honest fallback (the
 * site, via `siteUrlFor`) — exactly like the 2.01 results email. When the real
 * booking flow lands in 2.05, update `siteUrlFor`/this seam and BOTH emails follow.
 * The production domain behind `siteUrlFor` is finalised in 2.06.
 */
export function ctaHref(locale: Locale, key: NurtureKey): string {
  return withUtm(siteUrlFor(locale), UTM_CAMPAIGN[key]);
}
