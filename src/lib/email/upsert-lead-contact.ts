import 'server-only';

/**
 * Lead-contact upsert orchestrator (Phase 2.02, Track A).
 *
 * Called from the lead-submit path's `after()` fan-out once a lead has saved. It
 * routes the saved parent lead into Brevo Contacts (create-or-update by email) on
 * consent-gated lists, parallel to the results-email orchestrator (2.01).
 *
 * The ENTIRE function is wrapped so it NEVER throws: an upsert failure is logged
 * (structured) and swallowed, so it can never fail the lead save or the parent's
 * redirect to `/result`. If `BREVO_API_KEY` is unset the upsert is a logged no-op,
 * so the funnel still runs locally before Cowork's Brevo account exists.
 *
 * Privacy: the structured logs carry ONLY the canonical band key, locale, and
 * non-PII status/detail fields — never the parent email or child name.
 *
 * The marketing-consent boundary is enforced inside `contact-mapping` (which list
 * ids are passed). The upsert runs whenever `BREVO_API_KEY` is set regardless of
 * how many lists parsed — the contact is still created/updated with its attributes.
 */
import type {SavedLead} from './lead-summary';
import {BAND_KEY_BY_LEAD} from '@/lib/leads/lead-mapping';
import {buildContactUpsert} from './contact-mapping';
import {upsertContact} from './brevo-contacts';

/** Which list a config value belongs to — a non-PII detail field for logs. */
type ListName = 'leads' | 'marketing';

/**
 * Parse a list-id env value into a positive integer, or `null`.
 *  - unset / blank → `null` (intentional config; no log — running without lists).
 *  - a positive integer → that number.
 *  - anything else → `null`, with a `list-config-invalid` warning (misconfig).
 */
function parseListId(
  raw: string | undefined,
  list: ListName,
  bandKey: string,
  locale: string
): number | null {
  if (raw == null || raw.trim() === '') {
    return null;
  }
  const n = Number(raw);
  if (Number.isInteger(n) && n > 0) {
    return n;
  }
  console.warn(
    JSON.stringify({
      event: 'lead-contact',
      status: 'list-config-invalid',
      list,
      band: bandKey,
      locale
    })
  );
  return null;
}

export async function upsertLeadContact(lead: SavedLead): Promise<void> {
  const bandKey = BAND_KEY_BY_LEAD[lead.band];

  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Graceful degradation: app runs locally before the Brevo account exists.
      console.warn(
        JSON.stringify({
          event: 'lead-contact',
          status: 'skipped-no-key',
          band: bandKey,
          locale: lead.locale
        })
      );
      return;
    }

    const leadsListId = parseListId(
      process.env.BREVO_LEADS_LIST_ID,
      'leads',
      bandKey,
      lead.locale
    );
    const marketingListId = parseListId(
      process.env.BREVO_MARKETING_LIST_ID,
      'marketing',
      bandKey,
      lead.locale
    );

    const payload = buildContactUpsert(lead, {leadsListId, marketingListId});
    await upsertContact(payload, apiKey);

    console.info(
      JSON.stringify({
        event: 'lead-contact',
        status: 'upserted',
        band: bandKey,
        locale: lead.locale
      })
    );
  } catch (err) {
    // NEVER rethrow — lead capture + the /result redirect must be untouched.
    console.error(
      JSON.stringify({
        event: 'lead-contact',
        status: 'failed',
        band: bandKey,
        locale: lead.locale,
        err: err instanceof Error ? err.message : String(err)
      })
    );
  }
}
