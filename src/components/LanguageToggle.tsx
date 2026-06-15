'use client';

import {useMemo, useSyncExternalStore} from 'react';
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

// Read the live query string without `useSearchParams` (which would opt the
// static landing/result pages into client-side rendering) and without a
// setState-in-effect. `useSyncExternalStore` renders the empty server snapshot
// during hydration, then resolves to the real query — no mismatch.
const subscribe = (cb: () => void) => {
  window.addEventListener('popstate', cb);
  return () => window.removeEventListener('popstate', cb);
};
const getQueryString = () => window.location.search;
const getServerQueryString = () => '';

/**
 * Accessible MK/EN switcher, styled as a pill segmented control (handover §B.7).
 * Preserves the current path AND query string and lets next-intl's <Link locale>
 * set the NEXT_LOCALE cookie when switching — so switching language mid-test
 * keeps the child's `?age` instead of bouncing to the age picker (WCAG 2.2
 * §3.3.7 Redundant Entry).
 *
 * `label` is supplied by the (server) parent so this island ships no translation
 * runtime. Distinct header/footer labels keep the two toggles unique landmarks.
 */
export function LanguageToggle({label}: {label: string}) {
  const activeLocale = useLocale();
  // `usePathname` returns the path without the locale prefix, so switching the
  // locale on the same path preserves where the visitor is.
  const pathname = usePathname();
  const search = useSyncExternalStore(
    subscribe,
    getQueryString,
    getServerQueryString
  );

  const query = useMemo(() => {
    const out: Record<string, string> = {};
    new URLSearchParams(search).forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }, [search]);
  const hasQuery = Object.keys(query).length > 0;

  return (
    <nav aria-label={label}>
      <ul className="inline-flex items-center gap-1 rounded-full bg-canvas p-1 ring-1 ring-border">
        {routing.locales.map((locale) => {
          const isActive = locale === activeLocale;
          return (
            <li key={locale}>
              <Link
                href={hasQuery ? {pathname, query} : pathname}
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
