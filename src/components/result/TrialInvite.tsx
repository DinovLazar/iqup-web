'use client';

import {useId, useState} from 'react';
import {MapPin, Phone, Mail, ArrowRight, Check} from 'lucide-react';
import type {Locale} from '@/content/locale';
import {CENTERS, getCenter, IQUP_CONTACT_URL} from '@/content/centers';
import {fillSlots} from '@/content/results';
import {Button} from '@/components/ui/button';

export interface TrialCopy {
  heading: string;
  pickLabel: string;
  pickPlaceholder: string;
  nearestCenter: string;
  callCta: string;
  emailCta: string;
  contactLink: string;
  reassure: string;
  contactLabel: string;
}

/**
 * Trial invite (calm zone) — bands 3–5 / 6–9 only. A warm §6B CTA + a city picker
 * (no geolocation) that reveals the chosen centre and a working contact action.
 *
 * The booking mechanic is Phase 2.05; until then the CTA is a graceful, real
 * contact: a `tel:`/`mailto:` to the chosen centre + the IqUp contact form.
 */
export function TrialInvite({
  locale,
  intro,
  copy
}: {
  locale: Locale;
  /** §6B trial CTA with `{child}` filled; `{center}` filled here from the pick. */
  intro: string;
  copy: TrialCopy;
}) {
  const selectId = useId();
  const [selectedId, setSelectedId] = useState('');
  const center = getCenter(selectedId);

  const centerLabel = center ? center.city[locale] : copy.nearestCenter;
  const introText = fillSlots(intro, {center: centerLabel});
  // TODO(booking 2.05): replace tel:/mailto: with the real trial-booking flow.
  const telHref = center ? `tel:${center.phone.replace(/\s+/g, '')}` : undefined;
  const mailHref = center ? `mailto:${center.email}` : undefined;

  return (
    <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-card px-6 py-8 text-center shadow-[var(--shadow-sm)] ring-1 ring-border sm:px-8">
      <h2 className="font-display text-2xl font-extrabold text-balance text-ink sm:text-3xl">
        {copy.heading}
      </h2>
      <p className="mx-auto mt-3 mb-6 max-w-[44ch] text-lg leading-relaxed text-ink-soft text-pretty">
        {introText}
      </p>

      <div className="mx-auto max-w-md text-left">
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-bold text-ink">
          {copy.pickLabel}
        </label>
        <select
          id={selectId}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
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
        <div className="mx-auto mt-6 flex max-w-md items-start gap-4 rounded-[var(--radius-lg)] border border-border bg-canvas px-5 py-4 text-left">
          <span className="grid size-12 flex-none place-items-center rounded-[var(--radius-md)] bg-secondary-tint text-secondary-ink" aria-hidden="true">
            <MapPin className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="font-display font-bold text-ink">{center.name[locale]}</p>
            <p className="text-sm text-ink-soft">{center.address}</p>
            <p className="mt-1 text-xs font-semibold text-ink-faint">
              {copy.contactLabel}: {center.contact}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button
          asChild={Boolean(telHref)}
          disabled={!telHref}
          className="h-13 min-h-[3.25rem] gap-2.5 rounded-full bg-hero px-6 text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
        >
          {telHref ? (
            <a href={telHref}>
              <Phone className="size-5" aria-hidden="true" />
              {copy.callCta}
              <ArrowRight className="size-5" aria-hidden="true" />
            </a>
          ) : (
            <span>
              <Phone className="size-5" aria-hidden="true" />
              {copy.callCta}
            </span>
          )}
        </Button>

        {mailHref && (
          <Button
            asChild
            variant="secondary"
            className="h-13 min-h-[3.25rem] gap-2.5 rounded-full px-6 text-base font-bold"
          >
            <a href={mailHref}>
              <Mail className="size-5" aria-hidden="true" />
              {copy.emailCta}
            </a>
          </Button>
        )}
      </div>

      <p className="mt-4">
        <a
          href={IQUP_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-secondary-ink underline-offset-4 hover:underline"
        >
          {copy.contactLink}
        </a>
      </p>

      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-ink-soft">
        <Check className="size-4 text-success" aria-hidden="true" />
        {copy.reassure}
      </p>
    </div>
  );
}
