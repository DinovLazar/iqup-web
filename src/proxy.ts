import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// Next.js 16 renamed the `middleware` file convention to `proxy`. next-intl's
// `createMiddleware` returns the request handler; exporting it as default is the
// supported pattern for `proxy.ts`. It applies the locale routing defined in
// `routing.ts` (MK at `/`, EN at `/en`).
export default createMiddleware(routing);

export const config = {
  // Skip Next.js internals, API routes, and any path containing a dot
  // (static files such as favicon.ico and the OG/Bibi assets).
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
