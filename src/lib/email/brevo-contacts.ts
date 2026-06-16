import 'server-only';

/**
 * Thin, typed Brevo Contacts client (Phase 2.02, Track A).
 *
 * Parallels `brevo.ts` (the transactional client): a single `fetch` POST to the
 * contacts REST endpoint — deliberately NOT the Brevo SDK, so there is no
 * dependency surface and the whole thing is testable by mocking `fetch`. The
 * caller (the contact-upsert orchestrator) reads the API key from the server-only
 * env and passes it in; this module never reads env itself, so it stays a pure
 * transport. A non-2xx response throws a typed `BrevoContactsError`, which the
 * orchestrator's try/catch logs and swallows — a routing failure must never
 * surface (it can't be allowed to fail the lead save or the parent's redirect).
 *
 * This is the lead-routing side of 2.02: it upserts the parent as a CRM contact
 * (by email) onto consent-gated lists. The marketing-consent boundary is enforced
 * upstream in `contact-mapping.ts` (which list ids are passed) — this transport is
 * agnostic to it and simply sends whatever payload it is handed.
 */

/** Brevo's contacts endpoint (create-or-update by email when `updateEnabled`). */
export const BREVO_CONTACTS_ENDPOINT = 'https://api.brevo.com/v3/contacts';

/** A Brevo contact attribute value — only scalar text / number / boolean. */
export type BrevoContactAttributeValue = string | number | boolean;

/** The create-or-update contact payload (the subset of Brevo's API we use). */
export interface UpsertContactParams {
  /** The contact's primary key — the parent's email. */
  readonly email: string;
  /** UPPERCASE Brevo contact attributes (see `contact-mapping.ts`). */
  readonly attributes: Record<string, BrevoContactAttributeValue>;
  /** Integer ids of the lists the contact is added to. */
  readonly listIds: readonly number[];
  /** Upsert: when true, an existing contact (matched by email) is updated. */
  readonly updateEnabled: boolean;
}

/** Brevo returns the new contact's `id` on create; nothing on update. */
export interface UpsertContactResult {
  readonly id?: number;
}

/** Typed error for a non-2xx Brevo response — carries the status + raw body. */
export class BrevoContactsError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`Brevo contact upsert failed (HTTP ${status})`);
    this.name = 'BrevoContactsError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Create-or-update a Brevo contact. Throws `BrevoContactsError` on any non-2xx.
 *
 * Tolerates an empty body: Brevo returns `201 {id}` when it creates a contact and
 * `204 No Content` when it updates an existing one (because `updateEnabled`). A
 * `204` resolves to `{}` (no `response.json()` — that would throw on no content).
 *
 * @param params the upsert payload (email / attributes / listIds / updateEnabled).
 * @param apiKey the Brevo API key (read from `BREVO_API_KEY` by the caller).
 */
export async function upsertContact(
  params: UpsertContactParams,
  apiKey: string
): Promise<UpsertContactResult> {
  const response = await fetch(BREVO_CONTACTS_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new BrevoContactsError(response.status, body);
  }

  if (response.status === 204) {
    return {};
  }

  return (await response.json().catch(() => ({}))) as UpsertContactResult;
}
