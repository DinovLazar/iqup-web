/**
 * Auth-gate proof (Phase 3.13): `/admin/**` redirects to `/admin/login` when
 * unauthenticated — both when the admin auth is unconfigured (blank env) and when a
 * configured Supabase reports no session. A failing Supabase is treated as
 * unauthenticated (never throws).
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

const createServerClientMock = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => createServerClientMock(...args)
}));

import {NextRequest} from 'next/server';
import {updateAdminSession} from './middleware';

const ORIGINAL_ENV = {...process.env};

function req(path: string): NextRequest {
  return new NextRequest(new URL(`http://localhost${path}`));
}

beforeEach(() => {
  createServerClientMock.mockReset();
});

afterEach(() => {
  process.env = {...ORIGINAL_ENV};
});

describe('updateAdminSession — unconfigured (blank env)', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('redirects a gated path to /admin/login', async () => {
    const res = await updateAdminSession(req('/admin/contacts'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
    // Never even constructs a Supabase client when unconfigured.
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it('lets the login screen through (no redirect)', async () => {
    const res = await updateAdminSession(req('/admin/login'));
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('updateAdminSession — configured', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  it('redirects an unauthenticated gated path to /admin/login', async () => {
    createServerClientMock.mockReturnValue({
      auth: {getUser: async () => ({data: {user: null}})}
    });
    const res = await updateAdminSession(req('/admin/statistics'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it('sends a signed-in user away from the login screen to /admin', async () => {
    createServerClientMock.mockReturnValue({
      auth: {getUser: async () => ({data: {user: {id: 'u1', email: 'a@b.co'}}})}
    });
    const res = await updateAdminSession(req('/admin/login'));
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(new URL(location).pathname).toBe('/admin');
  });

  it('treats a failing Supabase as unauthenticated (never throws)', async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: async () => {
          throw new Error('supabase down');
        }
      }
    });
    const res = await updateAdminSession(req('/admin/contacts'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });
});
