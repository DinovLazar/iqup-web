import 'server-only';

/**
 * Contacts reader orchestrator (Phase 3.13) — Store B (Brevo), read-only.
 *
 * Reads the operational lead list from Brevo and maps each contact to a display
 * row (contact + consent + source + date only; never `TOP_INDEX`). It is the
 * contacts HALF of the admin's two isolated data paths — it imports nothing from
 * the stats / Store A reader and never queries Supabase.
 *
 * Resilient by design:
 *   * `BREVO_API_KEY` unset → a clean, logged no-op (empty result, `configured:false`).
 *   * a slow/failing/paged-out Brevo → caught, logged, returns what it has (or empty).
 *   * NEVER throws — a failing Brevo can never crash the admin.
 *
 * Volume: Brevo's list-contacts API is paged; we fetch up to `CONTACTS_FETCH_CAP`
 * (logging when the list is larger) so filtering + pagination over the full set are
 * correct for this internal, modest-volume tool — no silent truncation.
 */
import {fetchContactsPage} from './brevo-contacts-read';
import {toLeadContactRow, type LeadContactRow} from './contact-fields';

/** Brevo's max page size for the contacts API. */
const PAGE_SIZE = 1000;

/** Upper bound on contacts pulled per read (logged when exceeded — no silent cap). */
export const CONTACTS_FETCH_CAP = 5000;

export interface ContactsReadResult {
  /** Whether `BREVO_API_KEY` was set (false → clean empty "not configured" state). */
  readonly configured: boolean;
  /** The mapped display rows (no cognitive field). */
  readonly rows: readonly LeadContactRow[];
  /** True when the list is larger than `CONTACTS_FETCH_CAP` (some rows not fetched). */
  readonly truncated: boolean;
}

/** Parse a list-id env value into a positive integer, or `null` (unset/invalid). */
function parseListId(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const EMPTY: ContactsReadResult = {configured: false, rows: [], truncated: false};

export async function fetchLeadContacts(): Promise<ContactsReadResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    // Graceful degradation: the admin runs locally before Cowork's Brevo exists.
    console.warn(JSON.stringify({event: 'admin-contacts', status: 'skipped-no-key'}));
    return EMPTY;
  }

  const listId = parseListId(process.env.BREVO_LEADS_LIST_ID);
  const rows: LeadContactRow[] = [];
  let offset = 0;
  let totalCount = 0;

  try {
    for (;;) {
      const limit = Math.min(PAGE_SIZE, CONTACTS_FETCH_CAP - rows.length);
      if (limit <= 0) break;
      const page = await fetchContactsPage(apiKey, {limit, offset, listId});
      if (page.count > 0) totalCount = page.count;
      for (const contact of page.contacts) rows.push(toLeadContactRow(contact));
      offset += page.contacts.length;
      if (page.contacts.length < limit) break; // list exhausted
    }

    const truncated = totalCount > rows.length;
    console.info(
      JSON.stringify({
        event: 'admin-contacts',
        status: 'read',
        fetched: rows.length,
        truncated
      })
    );
    return {configured: true, rows, truncated};
  } catch (err) {
    // NEVER rethrow — a failing Brevo must not crash the admin. Return what we have.
    console.error(
      JSON.stringify({
        event: 'admin-contacts',
        status: 'failed',
        err: err instanceof Error ? err.message : String(err)
      })
    );
    return {configured: true, rows, truncated: false};
  }
}
