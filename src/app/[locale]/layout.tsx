import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {Geist, Geist_Mono} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  // Macedonian (Cyrillic) is the default locale, so load that subset too.
  subsets: ['latin', 'cyrillic']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'cyrillic']
});

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
    title: t('title'),
    description: t('description'),
    // Basic hreflang alternates. Full SEO (absolute URLs via metadataBase,
    // per-page canonicals) is handled in a later phase.
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

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
