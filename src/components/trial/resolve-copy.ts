import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import type {TrialBookingCopy} from './TrialBooking';

/**
 * Resolve the `TrialBooking` chrome from the `Trial` next-intl namespace
 * server-side, so the client island receives plain strings and ships no
 * translation runtime. Shared by BOTH surfaces — the public `/trial` page and the
 * result screen's `TrialInvite` — so the picker + action labels are single-sourced
 * and identical on both.
 *
 * `messageCta` carries a `{channel}` slot filled client-side (Viber / WhatsApp), so
 * it is read with `.raw` to keep the template literal intact.
 */
export async function resolveTrialBookingCopy(
  locale: Locale
): Promise<TrialBookingCopy> {
  const t = await getTranslations({locale, namespace: 'Trial'});
  return {
    pickLabel: t('pickLabel'),
    pickPlaceholder: t('pickPlaceholder'),
    contactLabel: t('contactLabel'),
    callCta: t('callCta'),
    emailCta: t('emailCta'),
    directionsCta: t('directionsCta'),
    messageCta: t.raw('messageCta'),
    mailSubject: t('mailSubject'),
    mailBody: t('mailBody'),
    reassure: t('reassure')
  };
}
