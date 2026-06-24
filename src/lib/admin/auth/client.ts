/**
 * Browser-side Supabase auth client for the admin login screen (Phase 3.13).
 *
 * Uses `@supabase/ssr`'s `createBrowserClient`, which reads/writes the cookie-based
 * session so the SSR server (middleware + the per-route gate) can see it. It is
 * built with the PUBLIC anon key + the user's session — NEVER the service-role key.
 *
 * This module is imported only by the `'use client'` login form. The caller checks
 * `isAdminAuthConfigured()` first, so this never runs with the blank-env template.
 */
import {createBrowserClient} from '@supabase/ssr';

import type {Database} from '@/lib/supabase/types';
import {adminAuthEnv} from './env';

export function createAdminBrowserClient() {
  const env = adminAuthEnv();
  if (!env) {
    // Defensive: the login UI gates on `isAdminAuthConfigured()` before calling
    // this, so we never reach here with the blank-env template.
    throw new Error('Admin auth is not configured (Supabase env unset).');
  }
  return createBrowserClient<Database>(env.url, env.anonKey);
}
