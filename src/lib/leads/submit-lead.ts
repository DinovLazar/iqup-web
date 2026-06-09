'use server';

import {insertLead} from './insert-lead';
import {
  buildLeadInput,
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
    await insertLead(lead);
    return {ok: true};
  } catch (error) {
    // Log the real cause server-side (a ZodError on bad input, or a DB failure)
    // — never surfaced to the client. The parent gets a retryable message and
    // their entered values + the TestResult are preserved for another attempt.
    console.error('[submitLead] lead insert failed:', error);
    return {ok: false, error: 'generic'};
  }
}
