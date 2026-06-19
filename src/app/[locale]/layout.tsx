import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {Rubik, Nunito_Sans} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {ConsentRoot} from '@/components/consent/ConsentRoot';
import type {ConsentCopy} from '@/components/consent/copy';
import '../globals.css';

// Display / headings. Cyrillic + Latin so Macedonian (the default locale) renders
// in Rubik, not a system fallback. Variable font → no explicit weights needed.
// Headings carry the LCP text, so Rubik is preloaded to win critical bandwidth.
const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin', 'cyrillic'],
  display: 'swap'
});

// Body. Not the LCP element, so it is NOT preloaded — that keeps it from
// competing with the heading font for the critical bytes (faster LCP). It swaps
// in via a metric-matched fallback (no layout shift).
const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: false
});

// Absolute base for canonical/OG URLs. The production domain (a subdomain of
// iqup.mk) is decided at launch (phase 2.06); set NEXT_PUBLIC_SITE_URL there.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

// Pre-render both locales at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Meta'});

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    // Site-wide hreflang default; pages may set their own canonical.
    alternates: {
      languages: {
        mk: '/',
        en: '/en',
        'x-default': '/'
      }
    }
  };
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  // Reject any locale that isn't configured.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opt this layout into static rendering for the active locale.
  setRequestLocale(locale);

  const consentCopy = await resolveConsentCopy(locale);

  return (
    <html lang={locale} className={`${rubik.variable} ${nunitoSans.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider>
          {/* Consent provider + banner + Manage dialog + page-view tracker —
              covers every page in both locales. A client island that renders
              the banner post-hydration (no CLS / hydration mismatch) and never
              opts a page into dynamic rendering (no useSearchParams). */}
          <ConsentRoot copy={consentCopy}>{children}</ConsentRoot>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/** Resolve the consent banner + Manage dialog chrome server-side (passed to the
 *  client island as props, so it ships no translation runtime). */
async function resolveConsentCopy(locale: string): Promise<ConsentCopy> {
  const t = await getTranslations({locale, namespace: 'Consent'});
  return {
    banner: {
      ariaLabel: t('banner.ariaLabel'),
      title: t('banner.title'),
      body: t('banner.body'),
      accept: t('banner.accept'),
      reject: t('banner.reject'),
      manage: t('banner.manage')
    },
    manage: {
      title: t('manage.title'),
      intro: t('manage.intro'),
      save: t('manage.save'),
      cancel: t('manage.cancel'),
      close: t('manage.close'),
      alwaysOn: t('manage.alwaysOn'),
      necessary: {
        title: t('manage.necessary.title'),
        description: t('manage.necessary.description')
      },
      analytics: {
        title: t('manage.analytics.title'),
        description: t('manage.analytics.description')
      },
      marketing: {
        title: t('manage.marketing.title'),
        description: t('manage.marketing.description')
      },
      note: t('manage.note')
    }
  };
}
