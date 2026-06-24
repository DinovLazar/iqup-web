/**
 * Shared typed seam between the three Phase 2.01 build tracks: the orchestrator
 * (`src/lib/email/send-results-email.ts`) resolves these, the React Email template
 * (`./ResultsEmail.tsx`) consumes them. Keeping the template a pure presentational
 * component (props in, JSX out — no next-intl runtime, no server-only import) makes
 * it renderable in Vitest and inside the server action's `after()` alike.
 */
import type {BandKey} from '@/lib/bands';
import type {Locale} from '@/content/locale';
import type {ResolvedResultCopy} from '@/content/results';

/**
 * The localized *chrome* the email needs beyond the §6 strengths copy. The
 * strengths body copy is NOT here — it comes from `getResultCopy` (single source).
 * This is the only new translated surface (the `Email` next-intl namespace), and
 * `{name}` slots are filled by the orchestrator before reaching the template.
 */
export interface EmailChrome {
  /** Subject line (`{name}` filled). */
  readonly subject: string;
  /** Inbox preview snippet (`{name}` filled). */
  readonly preview: string;
  /** Opening greeting. */
  readonly greeting: string;
  /** Warm parent-facing lead-in (`{name}` filled). */
  readonly intro: string;
  /** "Your certificate is attached" line (`{name}` filled). */
  readonly certificateAttached: string;
  /** Trial invite (bands 3–5 / 6–9 only). `cta` is the button label. */
  readonly trial: {
    readonly heading: string;
    readonly body: string;
    readonly cta: string;
  };
  /** Curious-mind ending (band 10–13, no trial). `{name}` filled. */
  readonly curiousMind: string;
  /** Footer identity + plain contact line + signoff. */
  readonly footer: {
    readonly identity: string;
    readonly contact: string;
    readonly signoff: string;
  };
}

/**
 * Everything the `ResultsEmail` component renders. `copy` is the assembled §6
 * strengths profile (`getResultCopy`); `bandKey` drives the trial-CTA-vs-ending
 * branch; `trialUrl` is the absolute trial-booking-page URL the CTA links to
 * (Phase 2.05 — was the locale site root in 2.01).
 */
export interface ResultsEmailProps {
  readonly childFirstName: string;
  readonly bandKey: BandKey;
  readonly locale: Locale;
  readonly copy: ResolvedResultCopy;
  readonly chrome: EmailChrome;
  readonly trialUrl: string;
}

/**
 * The v2 REPORT email chrome (Phase 3.10) — the localized `ReportEmail` next-intl
 * namespace, resolved by `send-report-email.ts` and consumed by `ReportEmail.tsx`.
 * Deliberately number-free and child-name-free (honest framing): the email says
 * "your child", carries the worded top strength as a warm teaser, and points at
 * the demo CTA — the full profile lives in the attached PDF, not the body.
 */
export interface ReportEmailChrome {
  /** Subject line. */
  readonly subject: string;
  /** Inbox preview snippet. */
  readonly preview: string;
  /** Opening greeting. */
  readonly greeting: string;
  /** Lead-in: your child's cognitive profile is attached. */
  readonly intro: string;
  /** Kicker over the warm top-strength teaser. */
  readonly teaserKicker: string;
  /** Demo-class invite block (heading + body + button label). */
  readonly trialHeading: string;
  readonly trialBody: string;
  readonly cta: string;
  /** Footer identity + plain contact line + signoff (the IqUp identity). */
  readonly footer: {
    readonly identity: string;
    readonly contact: string;
    readonly signoff: string;
  };
}

/**
 * Everything `ReportEmail` renders. The teaser strings come from the assembled
 * `ReportContent` (`topStrength` — the single source), NOT from messages, so the
 * report content is never duplicated into the i18n catalogue. No band, no number,
 * no child name anywhere.
 */
export interface ReportEmailProps {
  readonly locale: Locale;
  readonly chrome: ReportEmailChrome;
  /** The parent-facing top-strength NAME (worded, no number). */
  readonly topStrengthName: string;
  /** The parent-facing top-strength blurb (worded, no number). */
  readonly topStrengthBody: string;
  /** The demo-CTA target (carries `?grad=<centre>`). */
  readonly bookingUrl: string;
}
