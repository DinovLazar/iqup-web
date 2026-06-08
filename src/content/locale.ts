/**
 * Tiny shared locale types for in-repo content (questions, results, strengths).
 *
 * Kept deliberately free of any next-intl / server imports so pure content and
 * scoring modules can use it without pulling the i18n runtime into a bundle or a
 * Vitest (node) test. Mirrors the two locales declared in `src/i18n/routing.ts`.
 */
export type Locale = 'mk' | 'en';

/** A string that exists in both locales (Macedonian default, English mirror). */
export type Localized = Record<Locale, string>;
