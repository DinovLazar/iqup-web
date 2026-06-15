import type {Metadata} from 'next';
import Link from 'next/link';
import {Rubik, Nunito_Sans} from 'next/font/google';
import {Wordmark} from '@/components/landing/Wordmark';
import './globals.css';

/**
 * Global 404 (App Router catch-all for unmatched routes). It sits OUTSIDE the
 * `[locale]` segment, so it owns its own `<html>`/`<body>` and cannot read the
 * active locale — hence the message is bilingual (MK primary, EN secondary with
 * its own `lang`), matching the site's two audiences. It is fully accessible:
 * skip-link, single `h1`, landmarks, ≥44px home button, AA contrast.
 */
const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin', 'cyrillic'],
  display: 'swap'
});
const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: false
});

export const metadata: Metadata = {
  title: 'Страницата не е најдена · Page not found — IqUp',
  robots: {index: false, follow: false}
};

export default function NotFound() {
  return (
    <html lang="mk" className={`${rubik.variable} ${nunitoSans.variable}`}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-secondary-foreground"
        >
          Премини на содржината · <span lang="en">Skip to content</span>
        </a>

        <header className="border-b border-border/70 bg-background/80">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
            <Link
              href="/"
              className="rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Wordmark />
            </Link>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center gap-4 bg-canvas px-4 py-16 text-center"
        >
          <p className="font-display text-5xl font-extrabold text-secondary">404</p>
          <h1 className="font-display text-2xl font-bold text-balance text-ink sm:text-3xl">
            Страницата не е најдена
            <span className="mt-1 block text-lg font-semibold text-ink-soft" lang="en">
              Page not found
            </span>
          </h1>
          <p className="max-w-md text-pretty text-ink-soft">
            Можеби врската е стара или погрешно напишана.
            <span lang="en"> The link may be old or mistyped.</span>
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex h-12 min-h-[3rem] items-center justify-center rounded-full bg-hero px-7 font-display text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] transition-colors hover:bg-hero-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Назад на почетна · <span lang="en">Back home</span>
          </Link>
        </main>
      </body>
    </html>
  );
}
