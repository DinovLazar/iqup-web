import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

/**
 * Server-only Supabase client built with the SERVICE-ROLE key.
 *
 * The service-role key bypasses Row Level Security, so this module must NEVER be
 * imported into a client component:
 *   - the `server-only` import above is a build-time tripwire that fails the build
 *     if a client module ever imports this file;
 *   - the key is read from `SUPABASE_SERVICE_ROLE_KEY` (NOT a `NEXT_PUBLIC_` var),
 *     so Next.js never inlines it into the browser bundle.
 *
 * Use this only through the validated `insertLead()` helper.
 */
let cachedClient: SupabaseClient<Database> | null = null;

export function getServiceRoleClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase server client is misconfigured: set NEXT_PUBLIC_SUPABASE_URL and ' +
        'SUPABASE_SERVICE_ROLE_KEY in .env.local (the service-role key is server-only).',
    );
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      // This is a stateless server client; never persist or refresh a session.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
