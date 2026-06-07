import 'server-only';

import { getServiceRoleClient } from '@/lib/supabase/server';
import { leadSchema } from '@/lib/validation/lead';

/** What a successful insert returns: the new row's id + server timestamp. */
export type InsertedLead = {
  id: string;
  created_at: string;
};

/**
 * Validate a parent lead and insert it into Supabase — server-side only.
 *
 * Every field is validated against `leadSchema` (valid email, child name length,
 * age 3–13, band/locale in range, consent === true, …) BEFORE any write. Invalid
 * input throws a `ZodError` and nothing is inserted. The insert uses the
 * service-role client — the only path allowed to write `leads`, since RLS blocks
 * the public anon key.
 *
 * Phase 1.08 (the email-gate submit route) is the intended caller; it passes the
 * untrusted form body straight in, so the input is typed `unknown` on purpose.
 *
 * @param input untrusted lead data.
 * @returns the new row's id + created_at.
 * @throws ZodError on invalid input; Error if the database insert fails.
 */
export async function insertLead(input: unknown): Promise<InsertedLead> {
  // Throws ZodError on any invalid field — the caller decides how to surface it.
  const lead = leadSchema.parse(input);

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select('id, created_at')
    .single();

  if (error) {
    throw new Error(`Failed to insert lead: ${error.message}`);
  }

  return data;
}
