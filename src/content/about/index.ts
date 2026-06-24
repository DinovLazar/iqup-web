/**
 * About-content accessor. Returns the structured, typed bilingual About-the-test
 * content for one locale (Phase 3.14).
 *
 * Pure + isomorphic (no i18n runtime, no server-only import) so it runs in the
 * server page and in Vitest. The on-screen chrome (title, lead, the honest notice,
 * the CTA) comes from the `About` next-intl namespace, not here.
 */
import type {Locale} from '@/content/locale';
import {ABOUT_MK} from './mk';
import {ABOUT_EN} from './en';
import type {AboutContent} from './types';

export type {AboutContent, AboutSection, AboutBlock} from './types';
export {ABOUT_MK} from './mk';
export {ABOUT_EN} from './en';

/** Get the About content for `locale` (MK default, EN mirror). */
export function getAboutContent(locale: Locale): AboutContent {
  return locale === 'en' ? ABOUT_EN : ABOUT_MK;
}
