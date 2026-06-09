import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {
  ResultPlaceholder,
  type ResultCopy
} from '@/components/result/ResultPlaceholder';

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
 * Temporary results page (Phase 1.08) — a Server Component shell + a client
 * island that reads the persisted `TestResult` + lead context from
 * sessionStorage. The island guards direct access (redirects home when either is
 * missing), so this route is only reachable after the email gate. Phase 1.10
 * replaces the island with the real strengths profile + certificate at the
 * `// PLUGS INTO 1.10` seam.
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
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-canvas">
        <ResultPlaceholder
          locale={locale as Locale}
          copy={await resolveResultCopy(locale)}
        />
      </main>
    </>
  );
}

/** Resolve the placeholder copy server-side (templated `heading` via `.raw`). */
async function resolveResultCopy(locale: string): Promise<ResultCopy> {
  const t = await getTranslations({locale, namespace: 'Result'});
  return {
    badge: t('badge'),
    heading: t.raw('heading'),
    intro: t('intro'),
    topStrengthsLabel: t('topStrengthsLabel'),
    note: t('note'),
    home: t('home')
  };
}
