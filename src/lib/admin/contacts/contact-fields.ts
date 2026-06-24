/**
 * The contact-list field contract (Phase 3.13) — Store B (Brevo) display shape.
 *
 * ISOMORPHIC + pure (no `server-only`): the mapping from a raw Brevo contact to the
 * admin's display row, plus the allow-list it reads. Unit-tested directly.
 *
 * THE privacy rule this file enforces structurally: the contact list shows
 * contact + consent + source + date ONLY. The coarse `TOP_INDEX` attribute that
 * already lives on every Brevo contact (the silent segmentation field from 3.06) is
 * NOT surfaced — it is never read into a row. No score/band/index/cognitive field
 * ever appears in the contacts view. There is no path here that touches Store A.
 */

/** A raw Brevo contact (the subset of `GET /v3/contacts` we consume). */
export interface BrevoContact {
  readonly email?: string;
  readonly createdAt?: string;
  readonly attributes?: Record<string, unknown>;
}

/** The display row for the admin contacts table — contact + consent + source + date. */
export interface LeadContactRow {
  readonly parentFirstName: string;
  readonly email: string;
  readonly phone: string;
  readonly city: string;
  readonly childAge: string;
  readonly childGender: string;
  readonly consentProcess: boolean;
  readonly consentGuardian: boolean;
  readonly marketingOptIn: boolean;
  readonly source: string;
  readonly contactDate: string;
}

/**
 * The ONLY Brevo attribute keys the contacts view reads. `TOP_INDEX` (and any
 * cognitive/score/band field) is deliberately absent — surfacing it would put a
 * cognitive result next to a contact, which the phase forbids.
 */
export const CONTACT_ATTRIBUTE_ALLOW_LIST = [
  'PARENT_FIRST_NAME',
  'PHONE',
  'CITY',
  'CHILD_AGE',
  'CHILD_GENDER',
  'CONSENT_PROCESS',
  'CONSENT_GUARDIAN',
  'MARKETING_OPT_IN',
  'SOURCE'
] as const;

/**
 * Brevo attribute keys that must NEVER reach the contacts view (the cognitive /
 * segmentation fields). Used by the mapper as a hard guard and by the guardrail
 * test. `TOP_INDEX` stays the silent segmentation field it was built as.
 */
export const FORBIDDEN_CONTACT_ATTRIBUTES = ['TOP_INDEX'] as const;

function asString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function asBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

/** The date portion (YYYY-MM-DD) of a Brevo ISO timestamp; '' when absent/unparseable. */
function dateOnly(iso: string | undefined): string {
  if (!iso) return '';
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  return match ? match[1] : '';
}

/**
 * Map a raw Brevo contact to a display row, reading ONLY the allow-listed
 * attributes. `TOP_INDEX` / any non-allow-listed attribute is dropped by
 * construction — the mapper never copies the raw attributes object.
 */
export function toLeadContactRow(contact: BrevoContact): LeadContactRow {
  const a = contact.attributes ?? {};
  return {
    parentFirstName: asString(a.PARENT_FIRST_NAME),
    email: asString(contact.email),
    phone: asString(a.PHONE),
    city: asString(a.CITY),
    childAge: asString(a.CHILD_AGE),
    childGender: asString(a.CHILD_GENDER),
    consentProcess: asBool(a.CONSENT_PROCESS),
    consentGuardian: asBool(a.CONSENT_GUARDIAN),
    marketingOptIn: asBool(a.MARKETING_OPT_IN),
    source: asString(a.SOURCE),
    contactDate: dateOnly(contact.createdAt)
  };
}

/** Filter rows to a single city label (the stored Brevo `CITY` value); '' = no filter. */
export function filterRowsByCity(
  rows: readonly LeadContactRow[],
  city: string | null | undefined
): LeadContactRow[] {
  if (!city) return [...rows];
  return rows.filter((row) => row.city === city);
}

/** A clamped, 1-based page slice. */
export interface Paginated<T> {
  readonly pageRows: readonly T[];
  readonly page: number;
  readonly pageCount: number;
  readonly total: number;
  readonly pageSize: number;
}

/** Slice rows into a clamped 1-based page (page < 1 or beyond the end is clamped). */
export function paginateRows<T>(
  rows: readonly T[],
  page: number,
  pageSize: number
): Paginated<T> {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (clamped - 1) * pageSize;
  return {
    pageRows: rows.slice(start, start + pageSize),
    page: clamped,
    pageCount,
    total,
    pageSize
  };
}
