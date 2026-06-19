'use client';

import {useState} from 'react';
import type {Locale} from '@/content/locale';
import {fillSlots} from '@/content/results';
import {TrialBooking, type TrialBookingCopy} from '@/components/trial/TrialBooking';

/** The §6 trial heading + the `{center}` placeholder default. The picker + action
 *  labels live in `TrialBookingCopy` (the shared mechanism), not here. */
export interface TrialCopy {
  heading: string;
  /** Default `{center}` label shown before a city is picked ("your nearest center"). */
  nearestCenter: string;
}

/**
 * Trial invite (calm zone) — bands 3–5 / 6–9 only. Renders the §6B heading/intro
 * (with the `{center}` slot) and the shared `TrialBooking` mechanic INLINE, so a
 * parent books their nearest centre without leaving the result screen.
 *
 * Phase 2.05: the temporary `// TODO(booking 2.05)` inline picker/seam was replaced
 * by the shared `TrialBooking` component (the single home for the picker + Call /
 * Email / Get directions / optional Viber-WhatsApp actions). Band 10–13 is
 * unchanged (`CuriousMindEnding`, no trial).
 */
export function TrialInvite({
  locale,
  band,
  intro,
  copy,
  bookingCopy
}: {
  locale: Locale;
  /** Band of the completed test — carried into the PII-free CTA analytics event. */
  band: string;
  /** §6B trial CTA with `{child}` filled; `{center}` filled here from the pick. */
  intro: string;
  copy: TrialCopy;
  /** The shared picker + action labels (resolved from the `Trial` namespace). */
  bookingCopy: TrialBookingCopy;
}) {
  // The chosen centre's city label, used only to fill the §6 `{center}` slot.
  const [centerLabel, setCenterLabel] = useState<string | null>(null);
  const introText = fillSlots(intro, {center: centerLabel ?? copy.nearestCenter});

  return (
    <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-card px-6 py-8 text-center shadow-[var(--shadow-sm)] ring-1 ring-border sm:px-8">
      <h2 className="font-display text-2xl font-extrabold text-balance text-ink sm:text-3xl">
        {copy.heading}
      </h2>
      <p className="mx-auto mt-3 mb-6 max-w-[44ch] text-lg leading-relaxed text-ink-soft text-pretty">
        {introText}
      </p>

      <TrialBooking
        locale={locale}
        band={band}
        copy={bookingCopy}
        onSelectCenter={setCenterLabel}
      />
    </div>
  );
}
