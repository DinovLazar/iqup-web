// TODO(mk-slug): the MK route slug can be localised later (e.g. `/за-тестот`).
// Working slug is `/about-test` for both locales for now (mirrors `/privacy`, `/trial`).
import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {Link} from '@/i18n/navigation';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {SiteFooter} from '@/components/landing/SiteFooter';
import {AboutArticle} from '@/components/about/AboutArticle';
import {HonestNote} from '@/components/common/HonestNote';
import {getAboutContent} from '@/content/about';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'About.meta'});
  const canonical = locale === 'en' ? '/en/about-test' : '/about-test';

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {mk: '/about-test', en: '/en/about-test', 'x-default': '/about-test'}
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
 * The `/about-test` page (Phase 3.14) — the honest "About the test" page. A static
 * (SSG) Server Component in the locale layout (skip-link + global header/footer +
 * per-locale `<html lang>`), mirroring `/privacy` + `/trial`: per-locale
 * `generateMetadata` with canonical + hreflang + alternates. Unlike `/report`
 * (noindex), this page IS indexable.
 *
 * The substantive prose is structured bilingual content (`@/content/about`); the
 * chrome (title, lead, CTA) comes from the `About` next-intl namespace. The honest
 * framing is delivered by the SHARED `HonestNote` (the `Disclaimer` namespace),
 * resolved here and threaded into the article — never authored into this page.
 *
 * No number / % / score / rank anywhere; no Bibi art.
 */
export default async function AboutTestPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tA11y = await getTranslations({locale, namespace: 'A11y'});
  const t = await getTranslations({locale, namespace: 'About'});
  const tDisc = await getTranslations({locale, namespace: 'Disclaimer'});
  const content = getAboutContent(locale as Locale);

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
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <header>
            <h1 className="font-brand text-3xl font-extrabold text-ink text-balance sm:text-4xl">
              {t('meta.title')}
            </h1>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-soft text-pretty">
              {t('lead')}
            </p>
          </header>

          <AboutArticle
            content={content}
            notice={
              <HonestNote
                variant="inset"
                ariaLabel={t('noticeAriaLabel')}
                notice={tDisc('notice')}
                provisional={tDisc('provisional')}
              />
            }
          />

          {/* CTA — try the free test or book a free demo class. */}
          <section
            aria-labelledby="about-cta-h"
            className="mt-16 rounded-[var(--radius-lg)] border border-border bg-background px-6 py-8 text-center"
          >
            <h2
              id="about-cta-h"
              className="font-brand text-2xl font-extrabold text-ink"
            >
              {t('cta.heading')}
            </h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-base leading-relaxed text-ink-soft text-pretty">
              {t('cta.body')}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/test"
                className="inline-flex min-h-tap items-center justify-center rounded-card bg-hero px-7 py-3 font-brand text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] transition-colors hover:bg-hero-strong focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none"
              >
                {t('cta.primary')}
              </Link>
              <Link
                href="/trial"
                className="inline-flex min-h-tap items-center justify-center rounded-card border-2 border-border bg-card px-7 py-3 font-brand text-base font-bold text-ink transition-colors hover:border-iq-violet/60 focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none"
              >
                {t('cta.secondary')}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
