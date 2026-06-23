/**
 * Phase 3.06 — throwaway end-to-end test for Store A (assessment_scores).
 *
 * Run:  npm run test:scores
 *        (= tsx --conditions=react-server scripts/test-anonymous-score.ts)
 *
 * The `--conditions=react-server` flag is required because the insert path imports
 * the `server-only` package, which otherwise throws outside a React Server context.
 *
 * Proves, against the LIVE Supabase project, that schema + security + keys all work:
 *   1. zod validation REJECTS a PII-shaped payload (no write).
 *   2. insertAnonymousScore() validates + inserts a real anonymous row (service-role).
 *   3. The service-role client can read that row back; `created_date` is day-level.
 *   4. The ANON key can NEITHER read the row (RLS lockout) NOR insert a row.
 *   5. Cleanup: the test row is deleted, leaving `assessment_scores` empty.
 *
 * Secrets are loaded from .env.local. This script writes a row to the live DB and
 * then removes it; it is not part of the app and is not run in CI. Requires the
 * 20260623120000_create_assessment_scores migration to be applied first.
 */

import {insertAnonymousScore} from '@/lib/scores/insert-anonymous-score';
import {anonymousScoreSchema} from '@/lib/scores/anonymous-score';
import {getServiceRoleClient} from '@/lib/supabase/server';
import {createBrowserSupabaseClient} from '@/lib/supabase/client';

// Load .env.local before any client is constructed (clients read env lazily).
process.loadEnvFile('.env.local');

// A recognisable sentinel norms_version so cleanup can target only our test rows.
const TEST_NORMS = 'TEST-3.06-DELETE-ME';

const validRow = {
  age: 9,
  gender: 'female' as const,
  city: 'aerodrom',
  language: 'mk' as const,
  signal_gf: 88,
  signal_gv: 72,
  signal_gsm: 64,
  signal_gs: 55,
  signal_attention: 90,
  signal_ef: 70,
  signal_glr: 61,
  signal_ct: 77,
  index_logical: 88,
  index_spatial: 72,
  index_memory_focus: 71,
  index_planning_speed: 61,
  index_learning_stem: 69,
  validity: 'valid' as const,
  norms_version: TEST_NORMS
};

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? '✅ PASS' : '❌ FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

async function main() {
  // 1. The strict schema REJECTS a PII-shaped payload (email rides along).
  const bad = anonymousScoreSchema.safeParse({...validRow, email: 'a@b.com'});
  check('zod rejects a PII-shaped payload (email)', !bad.success);

  const service = getServiceRoleClient();

  try {
    // 2. Insert a valid anonymous row via the service-role path.
    await insertAnonymousScore(validRow);
    check('insertAnonymousScore() resolved (service-role insert)', true);

    // 3. Service-role client can read it back; created_date is a day-level DATE.
    const {data: rows, error: readErr} = await service
      .from('assessment_scores')
      .select('id, created_date, validity, norms_version')
      .eq('norms_version', TEST_NORMS);
    const row = rows?.[0];
    check('service-role can read the inserted row', !readErr && !!row, readErr?.message);
    check(
      'created_date is day-level (YYYY-MM-DD, no time component)',
      !!row && /^\d{4}-\d{2}-\d{2}$/.test(row.created_date),
      row?.created_date
    );

    // 4a. Anon key CANNOT read (RLS lockout → empty set or error).
    const anon = createBrowserSupabaseClient();
    const {data: anonRows, error: anonReadErr} = await anon
      .from('assessment_scores')
      .select('id')
      .eq('norms_version', TEST_NORMS);
    const anonBlocked = Boolean(anonReadErr) || (anonRows?.length ?? 0) === 0;
    check(
      'anon key CANNOT read assessment_scores (RLS lockout)',
      anonBlocked,
      anonReadErr ? `error: ${anonReadErr.message}` : `rows: ${anonRows?.length}`
    );

    // 4b. Anon key CANNOT insert either.
    const {error: anonInsertErr} = await anon
      .from('assessment_scores')
      .insert({...validRow, norms_version: `${TEST_NORMS}-anon`});
    check('anon key CANNOT insert into assessment_scores', Boolean(anonInsertErr), anonInsertErr?.message);
  } finally {
    // 5. Cleanup ALWAYS runs — leave the table empty.
    const {error: delErr} = await service
      .from('assessment_scores')
      .delete()
      .in('norms_version', [TEST_NORMS, `${TEST_NORMS}-anon`]);
    check('cleanup: deleted the test row(s)', !delErr, delErr?.message);
  }

  console.log(`\n${failures === 0 ? '🎉 All checks passed.' : `💥 ${failures} check(s) failed.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\n💥 test-anonymous-score crashed:', err);
  process.exit(1);
});
