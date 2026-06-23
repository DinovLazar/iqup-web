'use server';

import {after} from 'next/server';
import {assessmentLeadSchema, type AssessmentLead} from './assessment-lead';
import {upsertAssessmentLead} from './upsert-assessment-lead';
import {insertAnonymousScore} from '@/lib/scores/insert-anonymous-score';
import type {AnonymousScore} from '@/lib/scores/anonymous-score';

/** What the report form submits — two INDEPENDENT payloads, no shared key. */
export interface AssessmentSubmission {
  /** Store B (Brevo) — the parent lead (PII). */
  lead: AssessmentLead;
  /** Store A (Supabase) — the anonymous score (NO PII). */
  anonymous: AnonymousScore;
  /** Off-screen honeypot — a filled value means a bot (no writes happen). */
  honeypot?: string;
}

/** Typed result — `{ok:true}` even when the Brevo write fails (non-trapping). */
export type AssessmentSubmitResult = {ok: true} | {ok: false; error: 'generic'};

/** Run one side-effect so a throw (sync or async) can never escape or block siblings. */
async function isolate(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'submit-assessment',
        status: 'unexpected-error',
        err: err instanceof Error ? err.message : String(err)
      })
    );
  }
}

/**
 * The report-form server action (Phase 3.06). Performs the two-store write at the
 * `// HANDOFF (3.06)` seam:
 *
 *   1. Honeypot first — a filled hidden field means a bot; return a success-shaped
 *      result WITHOUT any write, so bots never reach either store and get no signal.
 *   2. Store B (Brevo lead) — the PRIMARY capture, attempted inline but NON-TRAPPING:
 *      it is isolated + never throws, and on failure logs the lead recoverably. The
 *      parent's results reveal proceeds regardless.
 *   3. Store A (anonymous score) — an ISOLATED, NON-BLOCKING side-effect, scheduled
 *      with `after()` so it never delays the response.
 *
 * The two writes are fully independent and share NO key: each receives its own
 * payload, the Store A id is never returned, and the Brevo contact id is discarded.
 * Results are computed CLIENT-SIDE from the persisted run, so they reveal even if
 * BOTH writes fail.
 */
export async function submitAssessment(
  submission: AssessmentSubmission
): Promise<AssessmentSubmitResult> {
  // Honeypot — return before any write so bots never touch the stores.
  if (
    typeof submission?.honeypot === 'string' &&
    submission.honeypot.trim() !== ''
  ) {
    return {ok: true};
  }

  // Re-validate both payloads server-side (the client is never trusted). A bad
  // payload throws inside `isolate` and is swallowed — the parent still reveals
  // results. `assessmentLeadSchema` re-checks the lead; `insertAnonymousScore`
  // re-checks (and PII-rejects) the anonymous payload before its write.
  const lead = assessmentLeadSchema.parse(submission.lead);

  // Store A: isolated + non-blocking — runs AFTER the response is sent so it never
  // delays the reveal. A separate payload with no shared key to the lead.
  after(() => isolate(() => insertAnonymousScore(submission.anonymous)));

  // Store B: the primary capture — attempted inline, isolated, never throws.
  await isolate(() => upsertAssessmentLead(lead));

  return {ok: true};
}
