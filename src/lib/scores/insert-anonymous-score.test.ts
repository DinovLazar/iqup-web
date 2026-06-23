/**
 * Unit spec for the Store A write path. The Supabase service-role client is mocked
 * to capture the insert payload (no real DB / no service-role client is loaded), so
 * we can assert: a valid row is inserted verbatim, the row carries NO id / NO exact
 * timestamp (only the DB-side day-level `created_date`), and a PII-shaped payload is
 * REJECTED before any write. The LIVE RLS proof (anon denied, cleanup) lives in
 * scripts/test-anonymous-score.ts.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('server-only', () => ({}));

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({insert: insertMock}));
vi.mock('@/lib/supabase/server', () => ({
  getServiceRoleClient: () => ({from: fromMock})
}));

import {runSession, type SessionInput} from '@/lib/engine';
import {alwaysCorrect, makeFixtureProvider} from '@/lib/engine/fixtures';
import {buildProfile} from '@/lib/scoring/v2';
import {buildAnonymousScore} from './anonymous-score';
import {insertAnonymousScore} from './insert-anonymous-score';

const provider = makeFixtureProvider();
const input: SessionInput = {age: 7, seed: 'gold', calibrationBaselineMs: 400};
const profile = buildProfile(runSession(input, provider, alwaysCorrect()));
const validRow = buildAnonymousScore(profile, {
  city: 'aerodrom',
  gender: 'female',
  language: 'mk'
});

beforeEach(() => {
  insertMock.mockReset();
  fromMock.mockClear();
  insertMock.mockResolvedValue({error: null});
});

describe('insertAnonymousScore', () => {
  it('writes a valid row to assessment_scores via the service-role client', async () => {
    await insertAnonymousScore(validRow);
    expect(fromMock).toHaveBeenCalledWith('assessment_scores');
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith(validRow);
  });

  it('the inserted payload has NO id and NO exact timestamp (day-level date is DB-side)', async () => {
    await insertAnonymousScore(validRow);
    const written = insertMock.mock.calls[0][0] as Record<string, unknown>;
    expect('id' in written).toBe(false);
    expect('created_at' in written).toBe(false);
    expect('created_date' in written).toBe(false);
  });

  it('REJECTS a PII-shaped payload before any write (no insert happens)', async () => {
    await expect(
      insertAnonymousScore({...validRow, email: 'parent@example.com'})
    ).rejects.toThrow();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('throws when the DB returns an error', async () => {
    insertMock.mockResolvedValueOnce({error: {message: 'boom'}});
    await expect(insertAnonymousScore(validRow)).rejects.toThrow(/boom/);
  });
});
