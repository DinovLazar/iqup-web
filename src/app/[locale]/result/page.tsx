import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {SiteFooter} from '@/components/landing/SiteFooter';
import {ResultView} from '@/components/result/ResultView';
import type {ResultChrome} from '@/components/result/copy';
import {resolveTrialBookingCopy} from '@/components/trial/resolve-copy';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Result.meta'});
  const canonical = locale === 'en' ? '/en/result' : '/result';

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {mk: '/result', en: '/en/result', 'x-default': '/result'}
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
 * The real `/result` page (Phase 1.10) — a static (SSG) Server-Component shell +
 * the `ResultView` client island. The island reads the persisted `TestResult` +
 * lead context from sessionStorage, guards direct access (redirects home when
 * either is missing), and renders the strengths profile + shareable certificate.
 * No child PII is in the URL or sent to a server; the share/download stay
 * client-side and the OG image (`opengraph-image.tsx`) is generic + name-free.
 */
export default async function ResultPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tA11y = await getTranslations({locale, namespace: 'A11y'});

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
        <ResultView locale={locale as Locale} chrome={await resolveChrome(locale)} />
      </main>
      <SiteFooter />
    </>
  );
}

/** Resolve the result chrome copy server-side (templated strings via `.raw`). */
async function resolveChrome(locale: string): Promise<ResultChrome> {
  const t = await getTranslations({locale, namespace: 'Result'});
  return {
    hero: {title: t.raw('hero.title'), lede: t.raw('hero.lede')},
    constellation: {
      regionLabel: t.raw('constellation.regionLabel'),
      celebratedTitle: t.raw('constellation.celebratedTitle'),
      celebratedSub: t.raw('constellation.celebratedSub'),
      alsoTitle: t.raw('constellation.alsoTitle'),
      alsoSub: t.raw('constellation.alsoSub'),
      growingTitle: t.raw('constellation.growingTitle'),
      growingSub: t.raw('constellation.growingSub')
    },
    certificate: {
      card: {
        heading: t.raw('certificate.heading'),
        text: t.raw('certificate.text'),
        download: t.raw('certificate.download'),
        share: t.raw('certificate.share'),
        preparing: t.raw('certificate.preparing'),
        linkCopied: t.raw('certificate.linkCopied'),
        shareError: t.raw('certificate.shareError')
      },
      face: {
        eyebrow: t.raw('certificate.eyebrow'),
        preline: t.raw('certificate.preline'),
        line: t.raw('certificate.line'),
        shines: t.raw('certificate.shines'),
        bibiPlaceholder: t.raw('certificate.bibiPlaceholder')
      },
      alt: t.raw('certificate.alt')
    },
    parentsEyebrow: t.raw('parents.eyebrow'),
    trial: {
      heading: t.raw('trial.heading'),
      nearestCenter: t.raw('trial.nearestCenter')
    },
    // The picker + action labels for the inline booking mechanic — single-sourced
    // from the `Trial` namespace (shared with the public `/trial` page).
    trialBooking: await resolveTrialBookingCopy(locale as Locale),
    ending: {heading: t.raw('ending.heading'), signoff: t.raw('ending.signoff')}
  };
}
