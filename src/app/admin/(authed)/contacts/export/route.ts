import {fetchLeadContacts} from '@/lib/admin/contacts/read-contacts';
import {filterRowsByCity} from '@/lib/admin/contacts/contact-fields';
import {contactsToCsv} from '@/lib/admin/contacts/contacts-csv';
import {csvResponse} from '@/lib/admin/csv';
import {getAdminUser} from '@/lib/admin/auth/server';

export const dynamic = 'force-dynamic';

/**
 * Contacts CSV export (Phase 3.13) — Store B only. Independently gated (defense in
 * depth: middleware + this check). One of two SEPARATE exports — no joined file,
 * no cognitive field, no shared per-child key with the stats export.
 */
export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return new Response('Unauthorized', {status: 401});
  }

  const city = new URL(request.url).searchParams.get('city') ?? '';
  const {rows} = await fetchLeadContacts();
  const filtered = filterRowsByCity(rows, city);
  const csv = contactsToCsv(filtered);

  return csvResponse('iqup-contacts.csv', csv);
}
