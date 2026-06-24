import type {Metadata} from 'next';
import Link from 'next/link';

import {fetchLeadContacts} from '@/lib/admin/contacts/read-contacts';
import {
  filterRowsByCity,
  paginateRows,
  type LeadContactRow
} from '@/lib/admin/contacts/contact-fields';
import {CENTERS} from '@/content/centers';

export const metadata: Metadata = {
  title: 'Contacts · IqUp Admin',
  robots: {index: false, follow: false}
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

/** The city dropdown options — the canonical centre labels (stable even at 0 rows). */
const CITY_OPTIONS = [...CENTERS]
  .map((c) => c.city.en)
  .sort((a, b) => a.localeCompare(b));

function YesNo({value}: {value: boolean}) {
  return (
    <span className={value ? 'text-ink' : 'text-ink-soft'}>{value ? 'Yes' : 'No'}</span>
  );
}

export default async function AdminContactsPage({
  searchParams
}: {
  searchParams: Promise<{city?: string; page?: string}>;
}) {
  const {city = '', page: pageParam} = await searchParams;
  const {configured, rows, truncated} = await fetchLeadContacts();

  const filtered = filterRowsByCity(rows, city);
  const {pageRows, page, pageCount, total} = paginateRows<LeadContactRow>(
    filtered,
    Number(pageParam) || 1,
    PAGE_SIZE
  );

  const exportHref = city
    ? `/admin/contacts/export?city=${encodeURIComponent(city)}`
    : '/admin/contacts/export';

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">Contacts</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Lead contacts from Brevo (Store B). Read-only.
          </p>
        </div>
        {configured && total > 0 ? (
          <a
            href={exportHref}
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iq-violet)]"
          >
            Export CSV
          </a>
        ) : null}
      </div>

      {/* City filter — a plain GET form (works without client JS). */}
      <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label htmlFor="city" className="block text-sm font-semibold text-ink">
            Filter by city
          </label>
          <select
            id="city"
            name="city"
            defaultValue={city}
            className="rounded-lg border border-border bg-white px-3 py-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iq-violet)]"
          >
            <option value="">All cities</option>
            {CITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="min-h-tap rounded-lg bg-[var(--iq-violet)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--iq-violet)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iq-violet)] focus-visible:ring-offset-2"
        >
          Apply
        </button>
        {city ? (
          <Link
            href="/admin/contacts"
            className="px-2 py-2 text-sm font-semibold text-[var(--iq-violet)] underline-offset-2 hover:underline"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {!configured ? (
        <p className="rounded-lg border border-border bg-white p-4 text-sm text-ink-soft">
          Brevo is not configured (<code className="font-mono">BREVO_API_KEY</code> is
          unset), so there are no contacts to show yet.
        </p>
      ) : total === 0 ? (
        <p className="rounded-lg border border-border bg-white p-4 text-sm text-ink-soft">
          {city ? 'No contacts match this city.' : 'No contacts yet.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Lead contacts{city ? ` in ${city}` : ''}
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-ink-soft">
                  <th scope="col" className="px-3 py-2 font-semibold">Parent</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Email</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Phone</th>
                  <th scope="col" className="px-3 py-2 font-semibold">City</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Age</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Gender</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Process</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Guardian</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Marketing</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Source</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => (
                  <tr
                    key={`${row.email}-${i}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-3 py-2 text-ink">{row.parentFirstName}</td>
                    <td className="px-3 py-2 text-ink">{row.email}</td>
                    <td className="px-3 py-2 text-ink">{row.phone}</td>
                    <td className="px-3 py-2 text-ink">{row.city}</td>
                    <td className="px-3 py-2 text-ink">{row.childAge}</td>
                    <td className="px-3 py-2 text-ink">{row.childGender || '—'}</td>
                    <td className="px-3 py-2"><YesNo value={row.consentProcess} /></td>
                    <td className="px-3 py-2"><YesNo value={row.consentGuardian} /></td>
                    <td className="px-3 py-2"><YesNo value={row.marketingOptIn} /></td>
                    <td className="px-3 py-2 text-ink-soft">{row.source}</td>
                    <td className="px-3 py-2 text-ink-soft">{row.contactDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
            <p>
              {total} contact{total === 1 ? '' : 's'}
              {city ? ` in ${city}` : ''} · page {page} of {pageCount}
              {truncated ? ' · list capped at the fetch limit' : ''}
            </p>
            <div className="flex gap-2">
              <PageLink city={city} page={page - 1} disabled={page <= 1}>
                Previous
              </PageLink>
              <PageLink city={city} page={page + 1} disabled={page >= pageCount}>
                Next
              </PageLink>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function PageLink({
  city,
  page,
  disabled,
  children
}: {
  city: string;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const cls =
    'rounded-lg border border-border px-3 py-1.5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iq-violet)]';
  if (disabled) {
    return (
      <span aria-disabled="true" className={`${cls} cursor-not-allowed opacity-50`}>
        {children}
      </span>
    );
  }
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  params.set('page', String(page));
  return (
    <Link href={`/admin/contacts?${params.toString()}`} className={`${cls} text-ink hover:bg-white`}>
      {children}
    </Link>
  );
}
