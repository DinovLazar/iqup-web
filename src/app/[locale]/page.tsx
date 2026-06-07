import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {MotionProvider} from '@/components/landing/MotionProvider';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {Hero} from '@/components/landing/Hero';
import {HowItWorks} from '@/components/landing/HowItWorks';
import {TrustCues} from '@/components/landing/TrustCues';
import {Reassurance} from '@/components/landing/Reassurance';
import {SiteFooter} from '@/components/landing/SiteFooter';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Meta'});
  const canonical = locale === 'en' ? '/en' : '/';

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {mk: '/', en: '/en', 'x-default': '/'}
    },
    openGraph: {
      type: 'website',
      siteName: 'IqUp',
      title: t('title'),
      description: t('description'),
      url: canonical,
      locale: locale === 'en' ? 'en_US' : 'mk_MK'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description')
    }
  };
  // The per-locale OG image is supplied by opengraph-image.tsx in this segment.
}

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  // Opt into static rendering for this locale.
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'A11y'});

  return (
    <MotionProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-secondary-foreground"
      >
        {t('skipToContent')}
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <TrustCues />
        <Reassurance />
      </main>
      <SiteFooter />
    </MotionProvider>
  );
}
