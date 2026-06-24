import createMiddleware from 'next-intl/middleware';
import type {NextRequest} from 'next/server';
import {routing} from './i18n/routing';
import {updateAdminSession} from './lib/admin/auth/middleware';

// Next.js 16 renamed the `middleware` file convention to `proxy`. This handler
// dispatches between two coexisting middlewares:
//   * `/admin/**` (Phase 3.13) — the internal back-office. It is EXCLUDED from
//     locale routing (single-locale English, outside `[locale]`) and instead runs
//     the Supabase session refresh + auth gate.
//   * everything else — next-intl locale routing (MK at `/`, EN at `/en`), exactly
//     as before. The public site's locale routing is unchanged.
const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return updateAdminSession(request);
  }
  return intlMiddleware(request);
}

export const config = {
  // Skip Next.js internals, API routes, and any path containing a dot (static
  // files such as favicon.ico and the OG/Bibi assets). `/admin/**` is NOT excluded
  // here — it matches and is handled by the admin branch above.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
