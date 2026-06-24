/**
 * The PDF's intermediate CONTENT MODEL — one structured, fully-resolved object
 * built from a `ReportContent` + locale + booking URL.
 *
 * Both consumers read from this ONE builder, so they can never drift:
 *   • `ReportDocument.tsx` lays the model out with react-pdf primitives;
 *   • the tests flatten it (`flattenModelText`) to run the forbidden-token scan,
 *     the determinism check, and the section-presence assertions over exactly the
 *     text the PDF renders.
 *
 * The parent-facing prose all comes from `buildReport` (the single source); the
 * chrome comes from `pdf-copy`. The ONLY digit-bearing strings are `cover.age`
 * and `cover.generated` — kept as named fields so a scan can permit their digits
 * while forbidding digits everywhere else.
 */
import {CENTERS} from '@/content/centers';
import type {Locale} from '@/content/locale';
import {INDEX_META} from '@/components/report/index-meta';
import type {ReportContent} from '@/lib/report';
import {formatAge, formatGeneratedDate, pdfChrome, type PdfChrome} from './pdf-copy';
import {hueFor, type HueRamp} from './tokens';

/** One resolved index entry for page 2 (band word + confidence word + note). */
export interface PdfIndexEntry {
  readonly hue: HueRamp;
  /** Geometric line glyph (raw inner SVG markup from `index-meta`). */
  readonly glyph: string;
  readonly name: string;
  readonly bandLabel: string;
  /** `"{Confidence}: {word}"` — the confidence prefix + the approved word. */
  readonly confidenceLine: string;
  readonly confidenceNote: string;
}

/** A page-3 narrative block: a heading + one or more paragraphs. */
export interface PdfBlock {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

/** Everything the PDF renders, fully resolved. */
export interface ReportPdfModel {
  readonly locale: Locale;
  readonly chrome: PdfChrome;
  /** The clickable demo-CTA target (carries `?grad=<centre>`). */
  readonly ctaHref: string;
  readonly cover: {
    /** `"{age} years"` — digit-bearing (the child's age, permitted). */
    readonly age: string;
    /** `"D Month YYYY"` — digit-bearing (the generated date, permitted) or null. */
    readonly generated: string | null;
    /** The centre's localized city name (a place, never PII). */
    readonly cityName: string;
    readonly topStrengthName: string;
    readonly topStrengthBody: string;
  };
  readonly indices: readonly PdfIndexEntry[];
  /** Page-3 narrative blocks (overview, growth, home, stem). */
  readonly overview: PdfBlock;
  readonly growth: PdfBlock;
  readonly home: PdfBlock;
  readonly stem: {readonly heading: string; readonly body: string; readonly bridge: string};
  readonly iqup: {
    readonly heading: string;
    readonly positioning: string;
    readonly programFit: string;
    readonly programName: string;
    readonly ctaLabel: string;
  };
  readonly disclaimer: {readonly body: string; readonly provisional: string};
}

/** Resolve a centre slug to its localized city name (falls back to the slug). */
function cityNameFor(slug: string, locale: Locale): string {
  return CENTERS.find((c) => c.id === slug)?.city[locale] ?? slug;
}

/**
 * Build the full PDF content model. Pure + deterministic: same `report` + locale
 * + `bookingUrl` → identical model (no clock, no randomness).
 */
export function buildReportPdfModel(
  report: ReportContent,
  locale: Locale,
  bookingUrl: string
): ReportPdfModel {
  const chrome = pdfChrome(locale);
  const {meta, indices, overview, topStrength, growthArea, homeActivities, solvingStyle, stemReadiness, iqup, disclaimer} =
    report;

  // Overall-profile block: the profile shape, any strong-pair narration, and the
  // observed solving style + learning trajectory — the same "what we noticed"
  // content the on-screen screen shows (the latent `extremes` framing is surfaced
  // on neither surface, and the 3.08 PDF page has no slot for it).
  const overviewParas = [
    overview.shape,
    ...overview.pairs,
    `${solvingStyle.body} ${solvingStyle.learning}`
  ];

  // Growth block: the kind framing + its optional "try this" line.
  const growthParas = [growthArea.body, ...(growthArea.activity ? [growthArea.activity] : [])];

  return {
    locale,
    chrome,
    ctaHref: bookingUrl,
    cover: {
      age: formatAge(meta.age, locale),
      generated: formatGeneratedDate(meta.generatedDate, locale),
      cityName: cityNameFor(iqup.city, locale),
      topStrengthName: topStrength.name,
      topStrengthBody: topStrength.body
    },
    indices: indices.map((idx) => ({
      hue: hueFor(idx.id),
      glyph: INDEX_META[idx.id].glyph,
      name: idx.name,
      bandLabel: idx.bandLabel,
      confidenceLine: `${chrome.confidencePrefix}: ${idx.confidenceLabel}`,
      confidenceNote: idx.confidenceNote
    })),
    overview: {heading: chrome.bOverview, paragraphs: overviewParas},
    growth: {heading: chrome.bGrowth, paragraphs: growthParas},
    home: {heading: chrome.bHome, paragraphs: homeActivities.map((a) => a.body)},
    stem: {heading: chrome.bStem, body: stemReadiness.body, bridge: stemReadiness.bridge},
    iqup: {
      heading: chrome.bIqup,
      positioning: iqup.positioning,
      programFit: iqup.programFit,
      programName: iqup.programName,
      ctaLabel: iqup.demoCta
    },
    disclaimer: {body: disclaimer.body, provisional: disclaimer.provisional}
  };
}

/**
 * Flatten the model to the COMPLETE set of human-visible strings the PDF renders,
 * tagged so a test can permit digits only where they belong (age + generated
 * date). The CTA href is returned separately (it is a URL, not rendered prose).
 */
export function flattenModelText(model: ReportPdfModel): {
  /** Digit-bearing, permitted: the child's age + the generated date. */
  readonly digitAllowed: string[];
  /** Every other parent-visible string — must contain no digit, no magnitude. */
  readonly content: string[];
  readonly ctaHref: string;
} {
  const c = model.chrome;
  const content: string[] = [
    // cover chrome + content
    c.reportKick, c.coverEyebrow, c.coverTitle,
    c.ageLabel, c.generatedLabel, c.cityLabel,
    model.cover.cityName, c.leadingStrength,
    model.cover.topStrengthName, model.cover.topStrengthBody,
    c.footMotto1,
    // page 2
    c.p2Title, c.p2Lede, c.footMotto2,
    // page 3 chrome
    c.p3Title, c.footMotto3
  ];

  for (const idx of model.indices) {
    content.push(idx.name, idx.bandLabel, idx.confidenceLine, idx.confidenceNote);
  }
  for (const block of [model.overview, model.growth, model.home]) {
    content.push(block.heading, ...block.paragraphs);
  }
  content.push(model.stem.heading, model.stem.body, model.stem.bridge);
  content.push(
    model.iqup.heading,
    model.iqup.positioning,
    model.iqup.programFit,
    model.iqup.programName,
    model.iqup.ctaLabel
  );
  content.push(model.disclaimer.body, model.disclaimer.provisional);

  const digitAllowed = [model.cover.age, ...(model.cover.generated ? [model.cover.generated] : [])];

  return {
    digitAllowed,
    content: content.filter((s) => s.length > 0),
    ctaHref: model.ctaHref
  };
}
