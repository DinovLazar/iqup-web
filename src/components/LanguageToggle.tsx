'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

// Each locale is shown in its own language (autonym) — the conventional pattern
// for a language switcher.
const localeNames: Record<(typeof routing.locales)[number], string> = {
  mk: 'Македонски',
  en: 'English'
};

export function LanguageToggle() {
  const activeLocale = useLocale();
  // `usePathname` returns the path without the locale prefix, so switching the
  // locale on the same path preserves where the visitor is.
  const pathname = usePathname();
  const t = useTranslations('LanguageToggle');

  return (
    <nav aria-label={t('label')}>
      <ul className="flex items-center gap-3">
        {routing.locales.map((locale) => {
          const isActive = locale === activeLocale;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                aria-current={isActive ? 'true' : undefined}
                className={
                  isActive
                    ? 'font-medium underline underline-offset-4'
                    : 'text-muted-foreground underline-offset-4 hover:underline'
                }
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
