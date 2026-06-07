'use client';

import {useLocale} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {cn} from '@/lib/utils';

// Each locale is shown in its own language (autonym) — the conventional pattern
// for a language switcher. Kept in-component (data, not marketing copy).
const localeNames: Record<(typeof routing.locales)[number], string> = {
  mk: 'Македонски',
  en: 'English'
};

/**
 * Accessible MK/EN switcher, styled as a pill segmented control (handover §B.7).
 * Preserves the current path and lets next-intl's <Link locale> set the
 * NEXT_LOCALE cookie when switching. MK is default and visually first.
 */
// `label` is supplied by the (server) parent so this island ships no translation
// runtime. Distinct header/footer labels keep the two toggles unique landmarks.
export function LanguageToggle({label}: {label: string}) {
  const activeLocale = useLocale();
  // `usePathname` returns the path without the locale prefix, so switching the
  // locale on the same path preserves where the visitor is.
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="inline-flex items-center gap-1 rounded-full bg-canvas p-1 ring-1 ring-border">
        {routing.locales.map((locale) => {
          const isActive = locale === activeLocale;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                )}
              >
                {localeNames[locale]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
