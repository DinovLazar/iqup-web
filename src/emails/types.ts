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
