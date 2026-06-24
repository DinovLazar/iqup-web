/**
 * Resilience proof (Phase 3.13): both readers are clean no-ops without their config
 * and NEVER throw — a slow/failing/unconfigured Brevo or Supabase can't crash the
 * admin.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

const getServiceRoleClientMock = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  getServiceRoleClient: () => getServiceRoleClientMock()
}));

import {fetchLeadContacts} from './contacts/read-contacts';
import {readAggregateStats} from './stats/read-stats';

const ORIGINAL_ENV = {...process.env};
const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  getServiceRoleClientMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = {...ORIGINAL_ENV};
});

describe('contacts reader resilience (Store B)', () => {
  it('is a clean no-op without BREVO_API_KEY (never calls fetch, never throws)', async () => {
    delete process.env.BREVO_API_KEY;
    const result = await fetchLeadContacts();
    expect(result).toEqual({configured: false, rows: [], truncated: false});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never throws when Brevo fails — returns empty, configured', async () => {
    process.env.BREVO_API_KEY = 'test-key';
    fetchMock.mockRejectedValue(new Error('network down'));
    const result = await fetchLeadContacts();
    expect(result.configured).toBe(true);
    expect(result.rows).toEqual([]);
  });
});

describe('stats reader resilience (Store A)', () => {
  it('is a clean no-op when Supabase is unconfigured (never throws)', async () => {
    getServiceRoleClientMock.mockImplementation(() => {
      throw new Error('Supabase server client is misconfigured');
    });
    const stats = await readAggregateStats();
    expect(stats.configured).toBe(false);
    expect(stats.total).toBe(0);
    expect(stats.byCity).toEqual([]);
  });

  it('never throws when the query errors — returns empty, configured', async () => {
    getServiceRoleClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => ({
            range: async () => ({data: null, error: {message: 'boom'}})
          })
        })
      })
    });
    const stats = await readAggregateStats();
    expect(stats.configured).toBe(true);
    expect(stats.total).toBe(0);
  });
});
