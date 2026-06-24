'use client';

import {useId, useState} from 'react';
import {MapPin, Phone, Mail, Navigation, MessageCircle} from 'lucide-react';
import type {Locale} from '@/content/locale';
import {
  CENTERS,
  getCenter,
  mapsUrlFor,
  viberHref,
  whatsappHref
} from '@/content/centers';
import {Button} from '@/components/ui/button';
import {track} from '@/lib/analytics/track';

/**
 * The chrome the booking mechanic owns: the picker label + the one-tap action
 * labels + the name-free mailto template. Supplied as plain strings (resolved
 * server-side from the `Trial` namespace via `resolveTrialBookingCopy`), so this
 * client island ships no translation runtime — the repo idiom (1.06/1.08/1.10).
 */
export interface TrialBookingCopy {
  /** Visible `<label>` for the city `<select>`. */
  readonly pickLabel: string;
  /** Disabled placeholder option. */
  readonly pickPlaceholder: string;
  /** Label preceding the centre's named contact. */
  readonly contactLabel: string;
  /** "Call the center" action. */
  readonly callCta: string;
  /** "Email the center" action. */
  readonly emailCta: string;
  /** "Get directions" action. */
  readonly directionsCta: string;
  /** "Message on {channel}" action — `{channel}` filled with Viber / WhatsApp. */
  readonly messageCta: string;
  /** Name-free mailto subject line. */
  readonly mailSubject: string;
  /** Name-free mailto body inviting the parent to share age + a preferred time. */
  readonly mailBody: string;
  /** "No commitment · cancel anytime" reassurance line. */
  readonly reassure: string;
}

/**
 * The shared trial-booking mechanic (Phase 2.05) — the single home for the city
 * picker + one-tap contact actions, reused by BOTH the public `/trial` page and
 * the result screen's trial invite (`TrialInvite`).
 *
 * Contact-only by design: it collects and stores NOTHING. A parent picks their
 * city from a native `<select>` (no geolocation — manual choice, privacy-
 * preserving) and gets one-tap ways to reach the chosen centre: call, a name-free
 * pre-filled email, get directions, and (only where a centre carries them) Viber /
 * WhatsApp. If IqUp later adopts a scheduling tool, only the action targets change.
 */
export function TrialBooking({
  locale,
  copy,
  onSelectCenter
}: {
  locale: Locale;
  /** Accepted for back-compat with the orphaned v1 `TrialInvite` caller, but no
   *  longer forwarded to analytics (cognitive outcomes never reach GA — 3.12). */
  band?: string;
  copy: TrialBookingCopy;
  /** Notified with the chosen centre's city label (or null) so a surface can fill
   *  its own `{center}` slot. The public page omits it. */
  onSelectCenter?: (centerLabel: string | null) => void;
}) {
  const selectId = useId();
  const [selectedId, setSelectedId] = useState('');
  const center = getCenter(selectedId);

  const handleChange = (id: string) => {
    setSelectedId(id);
    const c = getCenter(id);
    onSelectCenter?.(c ? c.city[locale] : null);
  };

  // Analytics: a real booking action (call / email / directions / Viber-WhatsApp).
  // Standardised on the Appendix-F name `cta_booking_click` (Phase 3.12) so the
  // taxonomy matches the v2 results CTA. PII-free + score-free — exactly
  // {locale, path}; the `band` prop is no longer forwarded (cognitive outcomes
  // never reach GA). A no-op until Analytics consent + the GA id are present.
  const trackBookingClick = () =>
    track('cta_booking_click', {
      locale,
      path: typeof window === 'undefined' ? undefined : window.location.pathname
    });

  const telHref = center ? `tel:${center.phone.replace(/\s+/g, '')}` : undefined;
  const mailHref = center
    ? `mailto:${center.email}?subject=${encodeURIComponent(
        copy.mailSubject
      )}&body=${encodeURIComponent(copy.mailBody)}`
    : undefined;
  const directionsHref = center ? mapsUrlFor(center) : undefined;
  const viber = center ? viberHref(center) : undefined;
  const whatsapp = center ? whatsappHref(center) : undefined;

  const messageLabel = (channel: string) =>
    copy.messageCta.replace('{channel}', channel);

  return (
    <div className="mx-auto max-w-md">
      <div className="text-left">
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-bold text-ink">
          {copy.pickLabel}
        </label>
        <select
          id={selectId}
          value={selectedId}
          onChange={(e) => handleChange(e.target.value)}
          className="h-13 min-h-[3.25rem] w-full rounded-[var(--radius-md)] border-2 border-input bg-field px-4 text-base text-ink focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <option value="" disabled>
            {copy.pickPlaceholder}
          </option>
          {CENTERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.city[locale]}
            </option>
          ))}
        </select>
      </div>

      {center && (
        <div className="mt-6 flex items-start gap-4 rounded-[var(--radius-lg)] border border-border bg-canvas px-5 py-4 text-left">
          <span
            className="grid size-12 flex-none place-items-center rounded-[var(--radius-md)] bg-secondary-tint text-secondary-ink"
            aria-hidden="true"
          >
            <MapPin className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="font-display font-bold text-ink">{center.name[locale]}</p>
            <p className="text-sm text-ink-soft">{center.address}</p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">
              {copy.contactLabel}: {center.contact}
            </p>
          </div>
        </div>
      )}

      {center && (
        <>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              className="h-13 min-h-[3.25rem] gap-2.5 rounded-full bg-hero px-6 text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
            >
              <a href={telHref} onClick={trackBookingClick}>
                <Phone className="size-5" aria-hidden="true" />
                {copy.callCta}
              </a>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="h-13 min-h-[3.25rem] gap-2.5 rounded-full px-6 text-base font-bold"
            >
              <a href={mailHref} onClick={trackBookingClick}>
                <Mail className="size-5" aria-hidden="true" />
                {copy.emailCta}
              </a>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="h-13 min-h-[3.25rem] gap-2.5 rounded-full px-6 text-base font-bold"
            >
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackBookingClick}
              >
                <Navigation className="size-5" aria-hidden="true" />
                {copy.directionsCta}
              </a>
            </Button>

            {viber && (
              <Button
                asChild
                variant="secondary"
                className="h-13 min-h-[3.25rem] gap-2.5 rounded-full px-6 text-base font-bold"
              >
                <a
                  href={viber}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackBookingClick}
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  {messageLabel('Viber')}
                </a>
              </Button>
            )}

            {whatsapp && (
              <Button
                asChild
                variant="secondary"
                className="h-13 min-h-[3.25rem] gap-2.5 rounded-full px-6 text-base font-bold"
              >
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackBookingClick}
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  {messageLabel('WhatsApp')}
                </a>
              </Button>
            )}
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-ink-soft">
            {copy.reassure}
          </p>
        </>
      )}
    </div>
  );
}

export default TrialBooking;
