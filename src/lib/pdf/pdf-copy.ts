/**
 * The PDF's localized CHROME — page kickers, meta labels, section headings, and
 * footers — plus the deterministic age / generated-date formatters.
 *
 * This is presentational chrome, NOT report content: the parent-facing prose all
 * comes from `buildReport` (the single source). It is kept self-contained here —
 * the same decision `index-meta.ts` made for the pentagon's identity labels —
 * rather than in the `messages` namespaces, so the PDF surface stays self-
 * describing and we don't duplicate non-marketing chrome as translation keys.
 * Exact MK/EN parity is enforced by the `Record<Locale, …>` shape. **MK is
 * provisional pending native review** (carried over from the 3.08 handover).
 *
 * Honest-framing note: the ONLY digits this surface emits are the child's age
 * and the generated date (both below). There are deliberately no numeric page
 * numbers and no brand year, so a forbidden-token scan over the rendered text is
 * clean. The date formatter mirrors 3.09's `ResultsScreen` exactly (same static
 * month tables, no `Date`/`Intl`) so the PDF and the screen never show different
 * dates for the same report.
 */
import type {Locale} from '@/content/locale';

export interface PdfChrome {
  /** Top-rule kicker on the cover. */
  readonly reportKick: string;
  /** Cover eyebrow + title. */
  readonly coverEyebrow: string;
  readonly coverTitle: string;
  /** Cover meta labels. */
  readonly ageLabel: string;
  readonly generatedLabel: string;
  readonly cityLabel: string;
  /** "{age} years" suffix word (the age digit is the child's age — permitted). */
  readonly yearsWord: string;
  /** Top-strength callout kicker. */
  readonly leadingStrength: string;
  /** Page footers (Bibi-free, digit-free). */
  readonly footMotto1: string;
  readonly footMotto2: string;
  readonly footMotto3: string;
  /** Page 2. */
  readonly p2Title: string;
  readonly p2Lede: string;
  readonly confidencePrefix: string;
  /** Page 3 section headings. */
  readonly p3Title: string;
  readonly bOverview: string;
  readonly bGrowth: string;
  readonly bHome: string;
  readonly bStem: string;
  readonly bIqup: string;
}

export const PDF_CHROME: Readonly<Record<Locale, PdfChrome>> = {
  mk: {
    reportKick: 'Извештај за размислување',
    coverEyebrow: 'Профил на детето · IqUp',
    coverTitle: 'Профил на размислување',
    ageLabel: 'Возраст',
    generatedLabel: 'Генерирано',
    cityLabel: 'Град',
    yearsWord: 'години',
    leadingStrength: 'Водечка сила',
    footMotto1: 'Информативно, не дијагноза · IqUp',
    footMotto2: 'IqUp · учење преку игра',
    footMotto3: 'IqUp · СТЕМ преку игра',
    p2Title: 'Петте области во детали',
    p2Lede:
      'Секоја област е прикажана со збор за нивото, реченица за сигурноста на читањето и краток опис — секогаш со зборови, никогаш со бројки.',
    confidencePrefix: 'Сигурност',
    p3Title: 'Целина и следни чекори',
    bOverview: 'Општ профил',
    bGrowth: 'Простор за раст',
    bHome: 'Активности дома',
    bStem: 'Подготвеност за СТЕМ',
    bIqup: 'За IqUp'
  },
  en: {
    reportKick: 'Thinking report',
    coverEyebrow: "Child's profile · IqUp",
    coverTitle: 'Thinking profile',
    ageLabel: 'Age',
    generatedLabel: 'Generated',
    cityLabel: 'City',
    yearsWord: 'years',
    leadingStrength: 'Leading strength',
    footMotto1: 'Informative, not a diagnosis · IqUp',
    footMotto2: 'IqUp · learning through play',
    footMotto3: 'IqUp · STEM through play',
    p2Title: 'The five areas in detail',
    p2Lede:
      'Each area is shown with a word for its level, a sentence on how confident the reading is, and a short description — always in words, never numbers.',
    confidencePrefix: 'Confidence',
    p3Title: 'The whole picture & next steps',
    bOverview: 'Overall profile',
    bGrowth: 'Room to grow',
    bHome: 'Activities at home',
    bStem: 'STEM readiness',
    bIqup: 'About IqUp'
  }
};

/** Resolve the chrome for a locale. */
export function pdfChrome(locale: Locale): PdfChrome {
  return PDF_CHROME[locale];
}

/** Static month tables — mirror `ResultsScreen.formatGeneratedDate` exactly. */
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
 * Format the day-level `YYYY-MM-DD` generated date as `D Month YYYY` — IDENTICAL
 * to the on-screen results header (so the two never disagree). Returns null for a
 * null/malformed date, exactly like the screen. Deterministic: no `Date`/`Intl`.
 */
export function formatGeneratedDate(
  date: string | null,
  locale: Locale
): string | null {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const month = MONTHS[locale][Number(m[2]) - 1];
  if (!month) return null;
  return `${Number(m[3])} ${month} ${m[1]}`;
}

/** Format the child's age as `{age} {years}` (the age digit is permitted). */
export function formatAge(age: number, locale: Locale): string {
  return `${age} ${PDF_CHROME[locale].yearsWord}`;
}
