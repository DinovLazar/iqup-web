import 'server-only';

import {getServiceRoleClient} from '@/lib/supabase/server';
import {anonymousScoreSchema} from './anonymous-score';

/**
 * Validate an anonymous score and insert it into Supabase Store A — server-side only.
 *
 * Every field is re-validated against `anonymousScoreSchema` (a `.strict()` schema
 * that REJECTS any PII-shaped field) BEFORE any write. Invalid input throws a
 * `ZodError` and nothing is inserted. The insert uses the service-role client — the
 * only path allowed to write `assessment_scores`, since RLS blocks the public anon
 * key (exactly as the v1 `leads` table).
 *
 * The new row's `id` is INTENTIONALLY not selected or returned: it must never leave
 * the server, never reach Brevo, and never become a join key — that discardedness is
 * the unlinkability guarantee. The DB stamps a day-level `created_date` itself.
 *
 * @param input untrusted anonymous-score data (no PII).
 * @throws ZodError on invalid input; Error if the database insert fails.
 */
export async function insertAnonymousScore(input: unknown): Promise<void> {
  // Throws ZodError on any invalid/PII-shaped field — caught by the caller's isolate.
  const score = anonymousScoreSchema.parse(input);

  const supabase = getServiceRoleClient();
  const {error} = await supabase.from('assessment_scores').insert(score);

  if (error) {
    throw new Error(`Failed to insert anonymous score: ${error.message}`);
  }
}
