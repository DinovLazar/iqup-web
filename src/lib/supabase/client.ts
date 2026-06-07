import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

/**
 * Browser/anon Supabase client built with the public anon key.
 *
 * For FUTURE use only. It is deliberately NOT used to access the `leads` table:
 * RLS is enabled on `leads` with no anon policies, so this client can neither read
 * nor write leads. All lead writes go through the server-only service-role client
 * (see ./server.ts and src/lib/leads/insert-lead.ts).
 *
 * Both values are public by design (the URL and anon key ship to the browser).
 */
export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase browser client is misconfigured: set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createClient<Database>(url, anonKey);
}
