/**
 * Phase 1.05 — throwaway end-to-end test for the leads pipeline.
 *
 * Run:  npm run test:insert
 *        (= tsx --conditions=react-server scripts/test-insert.ts)
 *
 * The `--conditions=react-server` flag is required because the insert path imports
 * the `server-only` package, which otherwise throws outside a React Server context.
 *
 * Proves, against the LIVE Supabase project, that schema + security + keys all work:
 *   1. zod validation rejects bad input (no write).
 *   2. insertLead() validates + inserts a real row via the service-role client.
 *   3. The service-role client can read that row back.
 *   4. The ANON key can NEITHER read the row (RLS lockout) NOR insert a row.
 *   5. Cleanup: the test row is deleted, leaving `leads` empty.
 *
 * Secrets are loaded from .env.local. This script writes a row to the live DB and
 * then removes it; it is not part of the app and is not run in CI.
 */

import { insertLead } from '@/lib/leads/insert-lead';
import { getServiceRoleClient } from '@/lib/supabase/server';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { leadSchema } from '@/lib/validation/lead';

// Load .env.local before any client is constructed (clients read env lazily).
process.loadEnvFile('.env.local');

const TEST_EMAIL = 'phase105-test@example.com';
const ANON_TEST_EMAIL = 'anon-should-fail@example.com';

const validLead = {
  email: TEST_EMAIL,
  child_first_name: '  Test Child  ', // leading/trailing space — should be trimmed
  child_age: 7,
  band: 'band-b',
  top_strengths: {
    top1: 'pattern',
    top2: 'logic',
    top3: 'spatial',
    scores: { pattern: 3, logic: 2, spatial: 2, memory: 1 },
  },
  locale: 'mk',
  consent: true,
  consent_version: 'v1',
  // marketing_opt_in omitted on purpose → should default to false.
};

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? '✅ PASS' : '❌ FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

async function main() {
  // 1. Validation rejects bad input (consent must be true; age in range).
  const bad = leadSchema.safeParse({ ...validLead, consent: false, child_age: 99 });
  check('zod rejects invalid input (consent:false, age:99)', !bad.success);

  const service = getServiceRoleClient();

  try {
    // 2. Insert a valid lead via insertLead() (service-role path).
    const inserted = await insertLead(validLead);
    check('insertLead() returns an id', Boolean(inserted?.id), inserted?.id);
    const id = inserted.id;

    // 3. Service-role client can read the row back; check trim + default applied.
    const { data: readBack, error: readErr } = await service
      .from('leads')
      .select('id, email, child_first_name, marketing_opt_in')
      .eq('id', id)
      .single();
    check('service-role can read the inserted row', !readErr && readBack?.id === id, readErr?.message);
    check('child_first_name was trimmed', readBack?.child_first_name === 'Test Child', readBack?.child_first_name);
    check('marketing_opt_in defaulted to false', readBack?.marketing_opt_in === false);

    // 4a. Anon key CANNOT read the row (RLS lockout → empty set or permission error).
    const anon = createBrowserSupabaseClient();
    const { data: anonRows, error: anonReadErr } = await anon
      .from('leads')
      .select('id')
      .eq('id', id);
    const anonBlockedFromReading = Boolean(anonReadErr) || (anonRows?.length ?? 0) === 0;
    check(
      'anon key CANNOT read leads (RLS lockout)',
      anonBlockedFromReading,
      anonReadErr ? `error: ${anonReadErr.message}` : `rows returned: ${anonRows?.length}`,
    );

    // 4b. Anon key CANNOT insert a row either.
    const { error: anonInsertErr } = await anon.from('leads').insert({
      ...validLead,
      child_first_name: 'AnonShouldFail',
      email: ANON_TEST_EMAIL,
    });
    check('anon key CANNOT insert into leads', Boolean(anonInsertErr), anonInsertErr?.message);
  } finally {
    // 5. Cleanup ALWAYS runs (even on a thrown insert / partial failure), so the
    // table is left empty. Removes both the service-inserted row and any row an
    // anon insert might have created if the lockout had (unexpectedly) failed.
    const { error: delErr } = await service
      .from('leads')
      .delete()
      .in('email', [TEST_EMAIL, ANON_TEST_EMAIL]);
    check('cleanup: deleted the test row(s)', !delErr, delErr?.message);

    const { count, error: countErr } = await service
      .from('leads')
      .select('id', { count: 'exact', head: true });
    check('leads table is empty after cleanup', !countErr && (count ?? -1) === 0, `count: ${count}`);
  }

  console.log(`\n${failures === 0 ? '🎉 All checks passed.' : `💥 ${failures} check(s) failed.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\n💥 test-insert crashed:', err);
  process.exit(1);
});
