// TODO(mk-slug): the MK route slug can be localised later (e.g. `/проба`).
// Working slug is `/trial` for both locales for now (mirrors `/privacy`).
import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {SiteFooter} from '@/components/landing/SiteFooter';
import {TrialBooking} from '@/components/trial/TrialBooking';
import {resolveTrialBookingCopy} from '@/components/trial/resolve-copy';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Trial.meta'});
  const canonical = locale === 'en' ? '/en/trial' : '/trial';

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {mk: '/trial', en: '/en/trial', 'x-default': '/trial'}
    },
    openGraph: {
      type: 'website',
      siteName: 'IqUp',
      title: t('title'),
      description: t('description'),
      url: canonical,
      locale: locale === 'en' ? 'en_US' : 'mk_MK'
    }
  };
}

/**
 * The public trial-booking page (Phase 2.05) — a static (SSG) Server Component in
 * the locale layout (skip-link + header/footer + per-locale `<html lang>`). MK at
 * `/trial`, EN at `/en/trial`.
 *
 * NAME-FREE and collects NOTHING: a band-agnostic heading + an honest intro
 * ("trials are booked directly with your nearest IqUp center") + the shared
 * `TrialBooking` mechanism (no `band`). The same component the result screen uses
 * inline, so the two surfaces stay identical. Anyone can open this directly; the
 * emails (results + nurture trial) link here via the single `trialBookingUrl`.
 */
export default async function TrialPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tA11y = await getTranslations({locale, namespace: 'A11y'});
  const t = await getTranslations({locale, namespace: 'Trial'});
  const bookingCopy = await resolveTrialBookingCopy(locale as Locale);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-secondary-foreground"
      >
        {tA11y('skipToContent')}
      </a>
      <SiteHeader />
      <main id="main-content" className="bg-canvas">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:py-16">
          <header>
            <h1 className="font-display text-3xl font-extrabold text-balance text-ink sm:text-4xl">
              {t('heading')}
            </h1>
            <p className="mx-auto mt-4 max-w-[48ch] text-lg leading-relaxed text-ink-soft text-pretty">
              {t('intro')}
            </p>
          </header>

          <div className="mt-10">
            <TrialBooking locale={locale as Locale} copy={bookingCopy} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
