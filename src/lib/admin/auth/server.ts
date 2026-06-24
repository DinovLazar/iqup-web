import 'server-only';

/**
 * Server-side admin auth gate (Phase 3.13) — defense-in-depth layer 2.
 *
 * The proxy (middleware) refreshes + checks the session for every `/admin/**`
 * request (layer 1); this module re-checks it inside each admin page/layout and
 * route handler, so a single missed matcher can never expose admin data. It builds
 * a cookie-bound Supabase client with the PUBLIC anon key + the user's session
 * (NEVER the service-role key — that stays in the Store A reader only).
 *
 * Resilient: when the public Supabase config is unset, or a session read fails, it
 * returns "no user" rather than throwing, so the gate degrades to a clean redirect.
 */
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {createServerClient} from '@supabase/ssr';
import type {User} from '@supabase/supabase-js';

import type {Database} from '@/lib/supabase/types';
import {ADMIN_LOGIN_PATH, adminAuthEnv} from './env';

/**
 * Build a cookie-bound, anon-key Supabase client for the current request, or
 * `null` when the public config is unset. The `setAll` is wrapped in try/catch
 * because cookie mutation throws in a Server Component render — the middleware is
 * what actually persists the refreshed session, so ignoring it there is correct.
 */
export async function createAdminServerClient() {
  const env = adminAuthEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({name, value, options}) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies are read-only — safe to
          // ignore; the proxy refreshes the session cookie on the next request.
        }
      }
    }
  });
}

/** The signed-in admin user for this request, or `null` (unauthenticated / unconfigured). */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createAdminServerClient();
  if (!supabase) return null;
  try {
    const {
      data: {user}
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    // A slow/failing/unreachable Supabase must never crash an admin route.
    return null;
  }
}

/**
 * Require an authenticated admin or redirect to the login screen. Use at the top of
 * every gated admin page/layout and route handler (the per-route half of the gate).
 */
export async function requireAdminUser(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect(ADMIN_LOGIN_PATH);
  return user;
}
