import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {Montserrat} from 'next/font/google';
import '../globals.css';

/**
 * Root layout for the internal admin back-office (Phase 3.13).
 *
 * The admin lives OUTSIDE the `[locale]` segment — single-locale English, never
 * linked from the public site, `noindex`, no analytics, no consent UI. It owns its
 * own `<html>`/`<body>` (it does not pass through the next-intl `[locale]` layout),
 * styled from the v2 brand tokens in `globals.css`. Montserrat is the brand font.
 */
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'IqUp Admin',
  // Internal tool: never indexed, never followed, never in the sitemap/hreflang.
  robots: {index: false, follow: false}
};

export default function AdminRootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased font-brand bg-canvas text-ink">{children}</body>
    </html>
  );
}
