import 'server-only';

/**
 * Thin, typed Brevo Contacts READ transport (Phase 3.13) — Store B, read-only.
 *
 * Mirrors the existing write-side `brevo-contacts.ts` pattern: a single `fetch`
 * GET to the contacts REST endpoint, deliberately NOT the Brevo SDK. It only LISTS
 * contacts (paginated) — it never creates, updates, or deletes (read-only over
 * Brevo this phase). The caller passes the API key (read from `BREVO_API_KEY`); this
 * module never reads env. A non-2xx throws a typed error the orchestrator swallows.
 *
 * This file imports nothing from the stats / Store A path — the contacts data path
 * is isolated from the statistics data path (the unlinkability invariant).
 */
import type {BrevoContact} from './contact-fields';

/** Brevo's contacts base endpoint. */
export const BREVO_CONTACTS_LIST_ENDPOINT = 'https://api.brevo.com/v3/contacts';

/** One page of a Brevo contacts listing. */
export interface BrevoContactsPage {
  readonly contacts: readonly BrevoContact[];
  readonly count: number;
}

/** Typed error for a non-2xx Brevo read response. */
export class BrevoReadError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`Brevo contacts read failed (HTTP ${status})`);
    this.name = 'BrevoReadError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Fetch one page of contacts. When `listId` is provided the read is scoped to that
 * Brevo list (the operational lead list, `BREVO_LEADS_LIST_ID`); otherwise it reads
 * all contacts. Brevo's contacts API is paged via `limit` + `offset`.
 */
export async function fetchContactsPage(
  apiKey: string,
  options: {limit: number; offset: number; listId?: number | null}
): Promise<BrevoContactsPage> {
  const {limit, offset, listId} = options;
  const base =
    listId != null
      ? `${BREVO_CONTACTS_LIST_ENDPOINT}/lists/${listId}/contacts`
      : BREVO_CONTACTS_LIST_ENDPOINT;
  const url = `${base}?limit=${limit}&offset=${offset}&sort=desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'api-key': apiKey,
      accept: 'application/json'
    },
    // Internal admin data must never be cached at the fetch layer.
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new BrevoReadError(response.status, body);
  }

  const json = (await response.json().catch(() => ({}))) as {
    contacts?: BrevoContact[];
    count?: number;
  };
  return {
    contacts: Array.isArray(json.contacts) ? json.contacts : [],
    count: typeof json.count === 'number' ? json.count : 0
  };
}
