/**
 * Contacts CSV export (Phase 3.13) — Store B (Brevo) only.
 *
 * ISOMORPHIC + pure (no `server-only`): turns the display rows into a CSV string.
 * It carries the same fields as the table — contact + consent + source + date — and
 * NEVER a cognitive field (no `TOP_INDEX`/band/score). This is one of TWO separate
 * exports; it shares no per-child key with the aggregate-stats CSV.
 */
import {toCsv} from '../csv';
import type {LeadContactRow} from './contact-fields';

/** The contacts CSV columns (header order). No cognitive/score/band column exists. */
export const CONTACTS_CSV_HEADER = [
  'parent_first_name',
  'email',
  'phone',
  'city',
  'child_age',
  'child_gender',
  'consent_process',
  'consent_guardian',
  'marketing_opt_in',
  'source',
  'contact_date'
] as const;

export function contactsToCsv(rows: readonly LeadContactRow[]): string {
  return toCsv(
    CONTACTS_CSV_HEADER,
    rows.map((r) => [
      r.parentFirstName,
      r.email,
      r.phone,
      r.city,
      r.childAge,
      r.childGender,
      r.consentProcess,
      r.consentGuardian,
      r.marketingOptIn,
      r.source,
      r.contactDate
    ])
  );
}
