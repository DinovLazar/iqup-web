import 'server-only';

/**
 * Report-email orchestrator (Phase 3.10) — the v2 equivalent of the 2.01
 * `sendResultsEmail`, built fresh (the 2.01 path is the v1 product; do not reuse).
 *
 * Called from `submitAssessment` via `after()` once the parent has submitted.
 * Given the completed `SessionRun` + the report context the screen used, it:
 *   1. recomputes the SAME `CognitiveProfile` (`buildProfile`) and assembles the
 *      SAME `ReportContent` (`buildReport`) the on-screen results screen rendered —
 *      one report path, never a second;
 *   2. gates on validity — sends for `valid` + `gentle_note`, SKIPS (logs) a
 *      `not_representative` (caveated) run, which the funnel never actually persists;
 *   3. renders the PDF in memory and base64-encodes it as an attachment (NEVER
 *      written to disk, never stored anywhere);
 *   4. renders the bilingual React Email (HTML + plain text);
 *   5. sends ONE transactional email via the thin Brevo client.
 *
 * The ENTIRE function is wrapped so it NEVER throws: a failure is logged
 * (structured) and swallowed, so the send can never affect the on-screen reveal or
 * the two stores. If `BREVO_API_KEY` (or the sender) is unset, the send is a logged
 * no-op — the funnel still runs locally before Cowork's Brevo account exists.
 *
 * UNLINKABILITY: the profile travels with the request and is used only to build
 * the report for THIS email — nothing extra is persisted, and no join between the
 * lead (Store B) and the scores (Store A) is ever written.
 */
import type {SessionRun} from '@/lib/engine';
import type {Locale} from '@/content/locale';
import {buildProfile} from '@/lib/scoring/v2';
import {buildReport} from '@/lib/report';
import {renderReportPdf} from '@/lib/pdf';
import {renderReportEmail} from '@/emails/report-render';
import type {ReportEmailChrome} from '@/emails/types';
import {sendTransactionalEmail} from './brevo';
import {bookingUrlFor} from './site-url';
import enMessages from '@/messages/en.json';
import mkMessages from '@/messages/mk.json';

/** What `submitAssessment` hands the orchestrator at the SEAM (3.10). */
export interface SendReportEmailParams {
  /** The completed adaptive run — recomputed server-side into the same profile. */
  readonly run: SessionRun;
  /** Parent email (Store B / the lead). The only PII this path touches. */
  readonly email: string;
  readonly locale: Locale;
  /** The chosen centre slug (carried into the CTA `?grad=`). */
  readonly city: string;
  /** The same submit timestamp the screen used as the report's generated date. */
  readonly generatedAt: string;
}

/** Resolve the localized `ReportEmail` chrome (no slots to fill). */
function resolveChrome(locale: Locale): ReportEmailChrome {
  return (locale === 'mk' ? mkMessages : enMessages).ReportEmail;
}

export async function sendReportEmail(params: SendReportEmailParams): Promise<void> {
  const {run, email, locale, city, generatedAt} = params;

  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Graceful degradation: the funnel runs locally before the Brevo account exists.
      console.warn(JSON.stringify({event: 'report-email', status: 'skipped-no-key', locale}));
      return;
    }
    const fromAddress = process.env.EMAIL_FROM_ADDRESS;
    if (!fromAddress) {
      console.warn(JSON.stringify({event: 'report-email', status: 'skipped-no-sender', locale}));
      return;
    }
    const fromName = process.env.EMAIL_FROM_NAME || 'IqUp';
    const replyTo = process.env.EMAIL_REPLY_TO;

    // 1. Recompute the SAME profile + report the screen rendered.
    const profile = buildProfile(run);

    // 2. Validity send-gate: never email a caveated (not_representative) report.
    if (profile.validity.outcome === 'not_representative') {
      console.warn(
        JSON.stringify({event: 'report-email', status: 'skipped-not-representative', locale})
      );
      return;
    }

    const report = buildReport(profile, {locale, city, generatedAt});
    const bookingUrl = bookingUrlFor(locale, city);

    // 3. Render the PDF in memory + base64-encode it (NEVER stored).
    const pdf = await renderReportPdf({report, locale, bookingUrl});
    const attachment = [
      {content: pdf.toString('base64'), name: 'iqup-cognitive-profile.pdf'}
    ];

    // 4. Render the bilingual cover email (HTML + plain text). The teaser strings
    //    come from the assembled report (single source), not the i18n catalogue.
    const chrome = resolveChrome(locale);
    const {html, text} = await renderReportEmail({
      locale,
      chrome,
      topStrengthName: report.topStrength.name,
      topStrengthBody: report.topStrength.body,
      bookingUrl
    });

    // 5. Send one transactional email. Tags help 2.02 segment later.
    await sendTransactionalEmail(
      {
        sender: {email: fromAddress, name: fromName},
        to: [{email}],
        subject: chrome.subject,
        htmlContent: html,
        textContent: text,
        attachment,
        replyTo: replyTo ? {email: replyTo} : undefined,
        tags: ['report-email', locale]
      },
      apiKey
    );

    console.info(JSON.stringify({event: 'report-email', status: 'sent', locale}));
  } catch (err) {
    // NEVER rethrow — the reveal + the two stores must be untouched by a send failure.
    console.error(
      JSON.stringify({
        event: 'report-email',
        status: 'failed',
        locale,
        err: err instanceof Error ? err.message : String(err)
      })
    );
  }
}
