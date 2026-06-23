import 'server-only';

/**
 * v2 lead-contact upsert orchestrator (Phase 3.06) — Store B's writer.
 *
 * The PRIMARY capture: it routes the parent lead into Brevo Contacts (create-or-
 * update by email) on consent-gated lists, reusing the existing thin `upsertContact`
 * transport (no SDK) + the generic list logic. It is "primary but non-trapping":
 *
 *   * It NEVER throws — a failure is caught, so it can never block the parent's
 *     results reveal (the action awaits it inside an `isolate`, and this is
 *     belt-and-suspenders on top).
 *   * On failure it logs the FULL lead under a `lead-recover` marker so the lead is
 *     not silently lost. This is the deliberate, minimal durability fallback;
 *     production-grade retry/queue durability is deferred — see TODO(durability 3.16).
 *   * With `BREVO_API_KEY` unset it is a logged no-op, so the funnel still runs
 *     locally before Cowork's Brevo account exists.
 *
 * Unlinkability: the returned Brevo contact id is DISCARDED — nothing about Brevo is
 * stored in Supabase, and no Store A id is ever sent here.
 */
import {
  assessmentLeadListIds,
  buildAssessmentLeadUpsert,
  type AssessmentLead
} from './assessment-lead';
import {upsertContact} from '@/lib/email/brevo-contacts';

/** Parse a list-id env value into a positive integer, or `null` (unset/invalid). */
function parseListId(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function upsertAssessmentLead(lead: AssessmentLead): Promise<void> {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Graceful degradation: app runs locally before the Brevo account exists.
      console.warn(
        JSON.stringify({
          event: 'assessment-lead',
          status: 'skipped-no-key',
          locale: lead.locale
        })
      );
      return;
    }

    const config = {
      leadsListId: parseListId(process.env.BREVO_LEADS_LIST_ID),
      marketingListId: parseListId(process.env.BREVO_MARKETING_LIST_ID)
    };

    const payload = buildAssessmentLeadUpsert(lead, config);
    // Brevo returns the new contact id on create — INTENTIONALLY discarded (the
    // unlinkability guarantee: nothing about Brevo is persisted in Supabase).
    await upsertContact(payload, apiKey);

    console.info(
      JSON.stringify({
        event: 'assessment-lead',
        status: 'upserted',
        locale: lead.locale,
        lists: assessmentLeadListIds(lead.marketingOptIn, config).length
      })
    );
  } catch (err) {
    // NEVER rethrow — the parent's results reveal must be untouched. But this is the
    // PRIMARY capture, so log the FULL lead recoverably (it must not be silently
    // lost). TODO(durability 3.16): replace this log-only fallback with a real
    // retry/queue at launch hardening.
    console.error(
      JSON.stringify({
        event: 'assessment-lead',
        status: 'failed',
        err: err instanceof Error ? err.message : String(err)
      })
    );
    console.error(
      JSON.stringify({
        event: 'assessment-lead',
        status: 'lead-recover',
        // The full lead, so it can be replayed manually until 3.16 lands.
        lead
      })
    );
  }
}
