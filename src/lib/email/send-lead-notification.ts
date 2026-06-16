import 'server-only';

/**
 * Internal new-lead notification orchestrator (Phase 2.02, Track B).
 *
 * Parallel to `send-results-email.ts`: called from the lead-save `after()` fan-out
 * once a lead has saved, it sends IqUp's own team an internal ops alert about the
 * new lead through the SAME thin Brevo transactional client. Like the results-email
 * orchestrator it:
 *   - reads its config from server-only env and never reads it elsewhere;
 *   - degrades gracefully — a missing key / recipient list / sender is a logged
 *     no-op so the funnel still runs locally before the Brevo account exists;
 *   - is wrapped so it NEVER throws (a notification failure must never fail the
 *     lead save or the parent's redirect to `/result`).
 *
 * Structured logs carry ONLY the band key + locale + status — never the parent
 * email or child name (those live solely in the email body, which is an internal
 * alert to the data controller).
 */
import {BAND_KEY_BY_LEAD} from '@/lib/leads/lead-mapping';
import {sendTransactionalEmail} from './brevo';
import {buildLeadNotificationContent, parseNotifyRecipients} from './lead-notification';
import type {SavedLead} from './lead-summary';

/** Sender display name on the internal alert. */
const SENDER_NAME = 'IqUp Lead Alerts';

export async function sendLeadNotification(lead: SavedLead): Promise<void> {
  const bandKey = BAND_KEY_BY_LEAD[lead.band];

  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Graceful degradation: app runs locally before the Brevo account exists.
      console.warn(
        JSON.stringify({
          event: 'lead-notification',
          status: 'skipped-no-key',
          band: bandKey,
          locale: lead.locale
        })
      );
      return;
    }

    const recipients = parseNotifyRecipients(process.env.LEAD_NOTIFY_TO);
    if (recipients.length === 0) {
      console.warn(
        JSON.stringify({
          event: 'lead-notification',
          status: 'skipped-no-recipients',
          band: bandKey,
          locale: lead.locale
        })
      );
      return;
    }

    const from = process.env.LEAD_NOTIFY_FROM || process.env.EMAIL_FROM_ADDRESS;
    if (!from) {
      console.warn(
        JSON.stringify({
          event: 'lead-notification',
          status: 'skipped-no-sender',
          band: bandKey,
          locale: lead.locale
        })
      );
      return;
    }

    const {subject, html, text} = buildLeadNotificationContent(lead);

    await sendTransactionalEmail(
      {
        sender: {email: from, name: SENDER_NAME},
        to: recipients.map((email) => ({email})),
        subject,
        htmlContent: html,
        textContent: text,
        tags: ['lead-notification', bandKey, lead.locale]
      },
      apiKey
    );

    console.info(
      JSON.stringify({
        event: 'lead-notification',
        status: 'sent',
        band: bandKey,
        locale: lead.locale
      })
    );
  } catch (err) {
    // NEVER rethrow — lead capture + the /result redirect must be untouched.
    console.error(
      JSON.stringify({
        event: 'lead-notification',
        status: 'failed',
        band: bandKey,
        locale: lead.locale,
        err: err instanceof Error ? err.message : String(err)
      })
    );
  }
}
