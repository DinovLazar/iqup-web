/**
 * Public analytics ids (Phase 2.04).
 *
 * These are PUBLIC client-side ids — NOT secrets. They are intentionally
 * inlined into the client bundle by Next.js. Because Next.js statically
 * replaces `process.env.NEXT_PUBLIC_*` at build time, each variable MUST be
 * referenced with its full literal name — never compute the key dynamically.
 *
 * Each id falls back to '' (empty string) when unset. An empty id means the
 * corresponding tracker is a clean no-op: its loader dev-notices and returns,
 * and `track()` never routes to it.
 */

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? '';
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

/**
 * Dev-only one-line notice, used by loaders when an id is absent. Silent in
 * production so nothing leaks to the client console for real users.
 */
export function devNotice(message: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[analytics] ${message}`);
  }
}
