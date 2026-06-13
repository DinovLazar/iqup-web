/**
 * Pure certificate logic (deterministic, isomorphic, Vitest-friendly): the
 * per-child tint rule, name sizing, date formatting, and the strength list for
 * alt text. No DOM, no `html-to-image` — only the values the `Certificate`
 * component renders. Keeping this pure makes the certificate verifiable without a
 * browser render (`certificate-model.test.ts`).
 */
import type {Locale} from '@/content/locale';
import {STRENGTHS, type StrengthCode} from '@/content/strengths';
import {joinNames} from '@/content/results';

/** The certificate base — a constant warm cream that is NEVER tinted, so all
 *  body text sits on the same background and AA holds for any child's tint.
 *  `CERT_CREAM` is the lighter (worst-case-for-contrast) stop verified by the AA
 *  test; `CERT_CREAM_EDGE` is the faint decorative vignette edge (behind no text). */
export const CERT_CREAM = '#FFFBF2';
export const CERT_CREAM_EDGE = '#FDF4E2';

/**
 * Deterministic per-child tint (handover rule): frame gradient blends top1 → top2
 * tints; the name flourish + placeholder art use the top1/top2 solids. A single
 * celebrated strength falls back to top1-tint → a lighter mix. Same child (same
 * top strengths) → same tint. All values are CSS custom-property references, so
 * the actual colours come from the 1.03 strength tokens.
 */
export interface CertTint {
  /** Frame gradient start. */
  readonly tintA: string;
  /** Frame gradient end. */
  readonly tintB: string;
  /** Name underline flourish (top1 solid). */
  readonly flourish: string;
  /** Placeholder-art primary (top1 solid). */
  readonly charA: string;
  /** Placeholder-art secondary (top2 solid). */
  readonly charB: string;
}

export function certificateTint(celebrated: readonly StrengthCode[]): CertTint {
  const code1 = celebrated[0];
  const code2 = celebrated[1] ?? celebrated[0];
  const t1 = STRENGTHS[code1].token;
  const t2 = STRENGTHS[code2].token;
  const hasTwo = celebrated.length > 1;
  return {
    tintA: `var(--strength-${t1}-tint)`,
    tintB: hasTwo
      ? `var(--strength-${t2}-tint)`
      : `color-mix(in srgb, var(--strength-${t1}-tint) 55%, white)`,
    flourish: `var(--strength-${t1})`,
    charA: `var(--strength-${t1})`,
    charB: `var(--strength-${t2})`
  };
}

/** Font-size tier for the hero name — longer names step down to stay on canvas. */
export function certNameSize(name: string): 'base' | 'long' | 'xlong' {
  if (name.length > 13) return 'xlong';
  if (name.length > 8) return 'long';
  return 'base';
}

const MONTHS: Record<Locale, readonly string[]> = {
  mk: [
    'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
    'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
};

/** Format a date for the certificate footer (locale-ordered). `date` is a Date so
 *  the (client) component can pass `new Date()`; tests pass a fixed date. */
export function formatCertDate(date: Date, locale: Locale): string {
  const day = date.getDate();
  const month = MONTHS[locale][date.getMonth()];
  const year = date.getFullYear();
  return locale === 'en'
    ? `${month} ${day}, ${year}`
    : `${day} ${month} ${year}`;
}

/** The celebrated strength display names, joined for the certificate alt text. */
export function certificateStrengthList(
  celebrated: readonly StrengthCode[],
  locale: Locale
): string {
  return joinNames(
    celebrated.map((code) => STRENGTHS[code].name[locale]),
    locale
  );
}
