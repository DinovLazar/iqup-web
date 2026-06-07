import {defineRouting} from 'next-intl/routing';

// Locale routing for the bilingual site.
// - Macedonian (`mk`) is the default and is served at `/` (no prefix).
// - English (`en`) is served at `/en`.
// `localePrefix: 'as-needed'` keeps the default locale unprefixed while
// prefixing every other locale.
export const routing = defineRouting({
  locales: ['mk', 'en'],
  defaultLocale: 'mk',
  localePrefix: 'as-needed'
});
