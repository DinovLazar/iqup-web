/**
 * Resolve the PUBLIC Supabase config the admin auth layer needs.
 *
 * ISOMORPHIC + no `server-only`: read by the browser login client, the proxy
 * (middleware session refresh), and the server-side per-route gate alike. Both
 * values are PUBLIC by design (the project URL + the anon key already ship in
 * client code); the SERVICE-ROLE key is deliberately NOT here — the admin's auth
 * uses the anon key + the user's session, while its DATA reads use the
 * server-only service-role client (Store A) / `BREVO_API_KEY` (Store B).
 *
 * Returns `null` when either var is unset so every caller can degrade to a clean,
 * never-throwing "not configured" state (e.g. the blank `.env.local` template on a
 * dev machine — the login screen still renders and the gate still redirects).
 */
export interface AdminAuthEnv {
  readonly url: string;
  readonly anonKey: string;
}

export function adminAuthEnv(): AdminAuthEnv | null {
  // Reference the literal `process.env.NEXT_PUBLIC_*` keys so Next inlines them
  // into the client bundle (it only replaces statically-written references).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return {url, anonKey};
}

/** True when the admin auth layer has the public Supabase config it needs. */
export function isAdminAuthConfigured(): boolean {
  return adminAuthEnv() !== null;
}

/** Canonical admin paths (single source so the gate + redirects stay in sync). */
export const ADMIN_LOGIN_PATH = '/admin/login';
export const ADMIN_HOME_PATH = '/admin';

/** Whether a pathname is (under) the public login screen — the one ungated path. */
export function isAdminLoginPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);
}
