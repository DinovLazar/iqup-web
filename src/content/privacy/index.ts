/**
 * Privacy-content accessor. Returns the structured, typed bilingual privacy /
 * cookie policy for one locale (Phase 2.04).
 *
 * Pure + isomorphic (no i18n runtime, no server-only import) so it runs in the
 * server page and in Vitest. The on-screen chrome (title, lead, labels, table
 * headers, draft notice) comes from the `Privacy` next-intl namespace, not here.
 */
import type {Locale} from '@/content/locale';
import {PRIVACY_MK} from './mk';
import {PRIVACY_EN} from './en';
import type {PrivacyContent} from './types';

export type {
  PrivacyContent,
  PrivacySection,
  PrivacyBlock,
  CookieRow
} from './types';
export {PRIVACY_MK} from './mk';
export {PRIVACY_EN} from './en';

/** Get the privacy content for `locale` (MK default, EN mirror). */
export function getPrivacyContent(locale: Locale): PrivacyContent {
  return locale === 'en' ? PRIVACY_EN : PRIVACY_MK;
}
