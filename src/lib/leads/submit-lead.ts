'use server';

import {after} from 'next/server';
import {insertLead} from './insert-lead';
import {runAfterLead} from './after-lead';
import {
  buildLeadInput,
  CONSENT_VERSION,
  type GateSubmission,
  type SubmitResult
} from './lead-mapping';

/**
 * Server action for the email gate (Phase 1.08). Receives the typed gate
 * submission, and — after an anti-spam honeypot check — builds the snake_case
 * lead and inserts it via the existing service-role `insertLead()` path (the
 * only path allowed to write `leads`; the anon key is denied, decision #26).
 *
 * Everything is re-validated server-side: `insertLead()` runs the gate
 * submission through `leadSchema` (valid email, name length, age 3–13, band/
 * locale in range, consent === true, number-only strengths summary) before any
 * write, and the schema strips unknown keys. The client is never trusted.
 *
 * Returns a typed, friendly result: `{ok:true}` on success (or on a detected
 * bot — bots get no signal), `{ok:false, error}` on failure. The real error is
 * logged server-side; the parent sees only a polite, retryable message.
 */
export async function submitLead(
  submission: GateSubmission
): Promise<SubmitResult> {
  // Honeypot first: a hidden field a human never fills. If it is non-empty the
  // submission is almost certainly a bot — return a success-shaped result
  // WITHOUT inserting, so the bot gets no signal that it was caught.
  if (
    typeof submission?.honeypot === 'string' &&
    submission.honeypot.trim() !== ''
  ) {
    return {ok: true};
  }

  const lead = buildLeadInput(submission);

  try {
    const inserted = await insertLead(lead);

    // Phases 2.01 + 2.02: fan out the post-save side-effects — the warm results
    // email + attached certificate (2.01), the Brevo CRM contact upsert onto
    // consent-gated lists (2.02), and the internal new-lead notification (2.02).
    // Scheduled with `after()` so they run AFTER the response is sent — the
    // parent's redirect to `/result` is never delayed — and on serverless the
    // work still completes. `runAfterLead` runs each side-effect fully isolated
    // and never throws: a slow/failing/unconfigured side-effect can NEVER affect
    // this lead save, the client redirect, or the others. Reached only on a real
    // insert (the honeypot path above returns before this), so bots never route
    // into the CRM and never trigger a notification. Only data the action already
    // has is passed (no new data is collected or stored), plus the saved row's
    // `created_at` as the lead timestamp.
    after(() =>
      runAfterLead({
        email: submission.email,
        childFirstName: submission.childFirstName,
        childAge: submission.childAge,
        band: submission.band,
        locale: submission.locale,
        marketingOptIn: submission.marketingOptIn,
        consentVersion: CONSENT_VERSION,
        top1: submission.topStrengths.top1,
        top2: submission.topStrengths.top2,
        top3: submission.topStrengths.top3,
        scores: submission.topStrengths.scores,
        savedAt: inserted.created_at
      })
    );

    return {ok: true};
  } catch (error) {
    // Log the real cause server-side (a ZodError on bad input, or a DB failure)
    // — never surfaced to the client. The parent gets a retryable message and
    // their entered values + the TestResult are preserved for another attempt.
    console.error('[submitLead] lead insert failed:', error);
    return {ok: false, error: 'generic'};
  }
}
