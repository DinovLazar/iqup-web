import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {SiteFooter} from '@/components/landing/SiteFooter';

/**
 * Localized 404 for unmatched routes under a locale (`/foo`, `/en/foo`) and any
 * `notFound()` thrown inside a locale page. It renders INSIDE `[locale]/layout`,
 * so it inherits the correct `<html lang>`, fonts, and next-intl provider — no
 * own `<html>` (which is what caused a hydration mismatch when the global
 * `not-found` was used for locale routes). Fully accessible: skip-link, single
 * `h1`, header/footer landmarks, ≥44px home button, AA-contrast text.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations('NotFound');
  const tA11y = await getTranslations('A11y');

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-secondary-foreground"
      >
        {tA11y('skipToContent')}
      </a>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center gap-4 bg-canvas px-4 py-16 text-center"
      >
        <p className="font-display text-6xl font-extrabold text-secondary">
          {t('code')}
        </p>
        <h1 className="font-display text-2xl font-bold text-balance text-ink sm:text-3xl">
          {t('heading')}
        </h1>
        <p className="max-w-md text-pretty text-ink-soft">{t('body')}</p>
        <Link
          href="/"
          className="mt-2 inline-flex h-12 min-h-[3rem] items-center justify-center rounded-full bg-hero px-7 font-display text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] transition-colors hover:bg-hero-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t('home')}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
