/**
 * Admin session refresh + gate for the proxy (Phase 3.13) — defense-in-depth layer 1.
 *
 * Runs for every `/admin/**` request (see `src/proxy.ts`). It refreshes the
 * Supabase cookie session and redirects unauthenticated requests to the login
 * screen. The per-route server check (`requireAdminUser`) is layer 2 — we never
 * rely on this middleware alone.
 *
 * It coexists with the next-intl middleware: the proxy calls THIS for `/admin/**`
 * and next-intl for everything else, so `/admin` is excluded from locale routing.
 *
 * Resilient: with the public Supabase config unset (blank dev env) it cannot
 * authenticate anyone, so it gates every admin path except the login screen; a
 * failing/slow Supabase is caught and treated as unauthenticated — it never throws.
 */
import {NextResponse, type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';

import type {Database} from '@/lib/supabase/types';
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  adminAuthEnv,
  isAdminLoginPath
} from './env';

export async function updateAdminSession(
  request: NextRequest
): Promise<NextResponse> {
  const {pathname} = request.nextUrl;
  const env = adminAuthEnv();

  // Not configured: cannot authenticate anyone → gate every path but the login.
  if (!env) {
    if (isAdminLoginPath(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  // Mutable so the Supabase cookie adapter can rewrite it with a refreshed session.
  let response = NextResponse.next({request});

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({name, value}) => request.cookies.set(name, value));
        response = NextResponse.next({request});
        toSet.forEach(({name, value, options}) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  let authenticated = false;
  try {
    const {
      data: {user}
    } = await supabase.auth.getUser();
    authenticated = user != null;
  } catch {
    // A failing/unreachable Supabase must never crash the gate.
    authenticated = false;
  }

  if (!authenticated && !isAdminLoginPath(pathname)) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }
  if (authenticated && isAdminLoginPath(pathname)) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  return response;
}
