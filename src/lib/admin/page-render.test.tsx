/**
 * Render smoke for the gated admin views (Phase 3.13).
 *
 * The auth gate (correctly) blocks the contacts/statistics views without a session,
 * so they can't be reached in a blank-env browser smoke. This renders the page
 * server components to static markup with their readers mocked — proving both the
 * clean EMPTY state (unconfigured) and the POPULATED state render without throwing,
 * and that the contacts view never emits a cognitive value.
 */
import {describe, it, expect, vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';

vi.mock('server-only', () => ({}));

const fetchLeadContactsMock = vi.fn();
vi.mock('@/lib/admin/contacts/read-contacts', () => ({
  fetchLeadContacts: () => fetchLeadContactsMock()
}));

const readAggregateStatsMock = vi.fn();
vi.mock('@/lib/admin/stats/read-stats', () => ({
  readAggregateStats: () => readAggregateStatsMock()
}));

import AdminContactsPage from '@/app/admin/(authed)/contacts/page';
import AdminStatisticsPage from '@/app/admin/(authed)/statistics/page';
import {emptyAggregateStats, type AggregateStats} from './stats/aggregate';
import type {LeadContactRow} from './contacts/contact-fields';

async function renderPage(element: Promise<React.ReactElement>): Promise<string> {
  return renderToStaticMarkup(await element);
}

describe('contacts view render', () => {
  it('renders a clean empty state when Brevo is unconfigured', async () => {
    fetchLeadContactsMock.mockReturnValue({
      configured: false,
      rows: [],
      truncated: false
    });
    const html = await renderPage(
      AdminContactsPage({searchParams: Promise.resolve({})})
    );
    expect(html).toContain('Brevo is not configured');
    expect(html).not.toContain('Export CSV');
  });

  it('renders the table (and no cognitive value) when populated', async () => {
    const row: LeadContactRow = {
      parentFirstName: 'Маја',
      email: 'parent@example.com',
      phone: '070123456',
      city: 'Skopje – Aerodrom',
      childAge: '8',
      childGender: 'female',
      consentProcess: true,
      consentGuardian: true,
      marketingOptIn: false,
      source: 'website-assessment',
      contactDate: '2026-06-20'
    };
    fetchLeadContactsMock.mockReturnValue({
      configured: true,
      rows: [row],
      truncated: false
    });
    const html = await renderPage(
      AdminContactsPage({searchParams: Promise.resolve({})})
    );
    expect(html).toContain('parent@example.com');
    expect(html).toContain('Маја');
    expect(html).toContain('Export CSV');
    // No cognitive value or column ever rendered.
    expect(html).not.toContain('Logical thinking');
    expect(html.toLowerCase()).not.toContain('top_index');
  });
});

describe('statistics view render', () => {
  it('renders a clean empty state when Supabase is unconfigured', async () => {
    readAggregateStatsMock.mockReturnValue(emptyAggregateStats(false));
    const html = await renderPage(AdminStatisticsPage());
    expect(html).toContain('Supabase is not configured');
    expect(html).not.toContain('Export CSV');
  });

  it('renders distributions when populated', async () => {
    const stats: AggregateStats = {
      ...emptyAggregateStats(true),
      total: 3,
      byAge: [{key: '8', count: 3}],
      byCity: [{key: 'Skopje – Aerodrom', count: 3}],
      byLanguage: [{key: 'mk', count: 3}],
      byValidity: [{key: 'valid', count: 3}],
      completionsByWeek: [{key: '2026-06-15', count: 3}]
    };
    readAggregateStatsMock.mockReturnValue(stats);
    const html = await renderPage(AdminStatisticsPage());
    expect(html).toContain('completed assessments');
    expect(html).toContain('Export CSV');
    expect(html).toContain('Skopje – Aerodrom');
    expect(html).toContain('Band distribution by index');
  });
});
