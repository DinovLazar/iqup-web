/**
 * Pure certificate logic for the v2 shareable certificate (Phase 3.11) —
 * deterministic, isomorphic, Vitest-friendly: the per-child accent (drawn from
 * the top strength's index hue), the month-year footer date, and the small
 * deterministic confetti scatter. No DOM, no `Date`, no `Math.random`, no
 * `html-to-image` — only the values `CertificateArt` renders, so the certificate
 * is verifiable without a browser render (`certificate.test.tsx`,
 * `cert-accent.test.ts`).
 *
 * HARD RULES mirrored from the rest of the report layer:
 *   • The accent is the top strength's index hue — same `ReportContent` → same
 *     accent (deterministic, no clock, no randomness).
 *   • Accent colour NEVER sits behind body text as a raw solid (the dark `-ink`
 *     fails AA on the saturated solids — e.g. magenta ink-on-solid ≈ 1.75:1). It
 *     is used as the light `-tint` background with `-ink` text, or as the `-ink`
 *     on the white card, both AA-safe across all five hues (proven by the test).
 */
import type {Locale} from '@/content/locale';
import type {IndexId} from '@/lib/scoring/v2';
import {INDEX_META, type IndexMeta} from './index-meta';

/** The five locked hue slugs → the `--ix-*` tokens in globals.css. */
export type AccentHue = IndexMeta['hue'];

/** The per-child accent, resolved to the four `--ix-${hue}*` CSS custom props. All
 *  values are token references — the actual colours come from globals.css. */
export interface CertAccent {
  readonly hue: AccentHue;
  /** Saturated solid (`--ix-${hue}`) — decorative fills only, never behind text. */
  readonly solid: string;
  /** Light tint (`--ix-${hue}-tint`) — AA-safe background under `-ink` text. */
  readonly tint: string;
  /** Dark ink (`--ix-${hue}-ink`) — AA-safe text on the white card or on `-tint`. */
  readonly ink: string;
  /** Soft mid (`--ix-${hue}-soft`) — decorative only. */
  readonly soft: string;
}

/**
 * Deterministic per-child accent: the top strength's index → its locked hue.
 * Same top strength → same accent. The hue is the single source already used by
 * the pentagon + the index cards (`index-meta.ts`), so the certificate matches
 * the rest of the surface.
 */
export function certAccent(topIndex: IndexId): CertAccent {
  const hue = INDEX_META[topIndex].hue;
  return {
    hue,
    solid: `var(--ix-${hue})`,
    tint: `var(--ix-${hue}-tint)`,
    ink: `var(--ix-${hue}-ink)`,
    soft: `var(--ix-${hue}-soft)`
  };
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

/**
 * Format a `YYYY-MM-DD` day-date into a "month year" footer label ("June 2026" /
 * "јуни 2026") — a keepsake date, never an ability magnitude. Deterministic: the
 * date string comes from `ReportContent.meta.generatedDate` (caller-supplied), so
 * there is no `Date`/`Intl` on the content path. Returns null for an absent/
 * malformed date (the footer then shows only the brand line).
 */
export function certMonthYear(
  generatedDate: string | null,
  locale: Locale
): string | null {
  if (!generatedDate) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(generatedDate);
  if (!m) return null;
  const month = MONTHS[locale][Number(m[2]) - 1];
  if (!month) return null;
  return `${month} ${m[1]}`;
}

/**
 * Deterministic confetti scatter (flat brand-hue shapes), kept clear of the
 * centre text column — a fixed table, never `Math.random`, so the same certificate
 * renders byte-identically every time. `[x, y, kind, size, colorIndex]` in the
 * 1080×1350 artboard space.
 */
export const CONFETTI: ReadonlyArray<
  readonly [number, number, 'dot' | 'bar', number, number]
> = [
  [70, 70, 'dot', 18, 0], [990, 96, 'bar', 16, 1], [120, 250, 'dot', 14, 2],
  [960, 300, 'dot', 20, 3], [60, 470, 'bar', 13, 4], [1000, 560, 'dot', 16, 5],
  [80, 980, 'dot', 18, 1], [980, 940, 'bar', 14, 2], [150, 1170, 'dot', 16, 3],
  [930, 1180, 'dot', 13, 0], [60, 1210, 'bar', 12, 4], [1010, 1220, 'dot', 15, 5]
];

/** The six flat confetti hues (brand index hues + the violet action), as tokens. */
export const CONFETTI_COLORS: readonly string[] = [
  'var(--ix-logic)',
  'var(--ix-spatial)',
  'var(--ix-memory)',
  'var(--ix-planning)',
  'var(--ix-learning)',
  'var(--action)'
];
