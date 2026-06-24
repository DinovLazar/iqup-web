import {NextResponse} from 'next/server';

import {createAdminServerClient} from '@/lib/admin/auth/server';
import {ADMIN_LOGIN_PATH} from '@/lib/admin/auth/env';

export const dynamic = 'force-dynamic';

/**
 * Sign out (Phase 3.13). Clears the Supabase session (cookies cleared via the
 * server client's cookie adapter) and redirects to the login screen. Resilient:
 * a failing sign-out still lands the operator on the login page.
 */
export async function POST(request: Request) {
  const supabase = await createAdminServerClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Never throw on sign-out — fall through to the login redirect.
    }
  }
  // 303 so the POST becomes a GET on the login screen.
  return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url), {status: 303});
}
