import 'server-only';

/**
 * After-lead side-effect fan-out (Phase 2.02).
 *
 * The single callback the submit action schedules with `after()` once a lead has
 * saved. It runs THREE fully-isolated side-effects, each of which only ever ADDS
 * to the funnel and must never affect the lead save, the parent's redirect, or
 * each other:
 *   1. the warm results email + attached certificate          (Phase 2.01);
 *   2. the Brevo CRM contact upsert onto consent-gated lists   (Phase 2.02);
 *   3. the internal new-lead notification to IqUp's team       (Phase 2.02).
 *
 * Each collaborator is ALREADY internally try/caught and never-throwing, and each
 * no-ops + logs when its own env is unset. `isolate` is belt-and-suspenders on top
 * of that: it guarantees a side-effect that somehow throws — even synchronously,
 * before returning its promise — can never stop its siblings or propagate out of
 * `runAfterLead`. The three run concurrently (independent I/O) and `allSettled`
 * waits for all to finish so the serverless `after()` work isn't cut short.
 *
 * The honeypot path in the submit action returns BEFORE this is scheduled, so bots
 * never reach the CRM and never trigger a notification.
 */
import type {SavedLead} from '@/lib/email/lead-summary';
import {sendResultsEmail} from '@/lib/email/send-results-email';
import {upsertLeadContact} from '@/lib/email/upsert-lead-contact';
import {sendLeadNotification} from '@/lib/email/send-lead-notification';

/** Run one side-effect so a throw (sync or async) can never escape or block siblings. */
async function isolate(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'after-lead',
        status: 'unexpected-error',
        err: err instanceof Error ? err.message : String(err)
      })
    );
  }
}

export async function runAfterLead(lead: SavedLead): Promise<void> {
  await Promise.allSettled([
    isolate(() =>
      sendResultsEmail({
        email: lead.email,
        childFirstName: lead.childFirstName,
        band: lead.band,
        locale: lead.locale,
        scores: lead.scores
      })
    ),
    isolate(() => upsertLeadContact(lead)),
    isolate(() => sendLeadNotification(lead))
  ]);
}
