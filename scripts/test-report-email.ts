/**
 * Phase 3.10 — dev-only live-delivery check for the REPORT email + PDF attachment.
 *
 * Run:  npm run test:report-email
 *        (= tsx --tsconfig scripts/email-runtime/tsconfig.json scripts/test-report-email.ts)
 *
 * Drives the REAL orchestrator (`sendReportEmail`) once per locale, always to
 * `TEST_EMAIL_TO` (a test inbox you own — NEVER a real parent), building a real
 * `SessionRun` via the engine fixtures, so you can confirm in the inbox:
 *   - the email arrives and renders (Gmail at least, ideally Outlook);
 *   - the Macedonian subject + body render in Cyrillic with no tofu;
 *   - `iqup-cognitive-profile.pdf` opens as a valid PDF with the right sections,
 *     Cyrillic text (no tofu), and a working demo CTA carrying `?grad=`.
 *
 * The send path maps `server-only` to an empty stub via the email-runtime tsconfig
 * (same as `test:email`), so `react-dom/server` + react-pdf work exactly as they do
 * in the real Next runtime. SAFETY: refuses prod/CI, requires TEST_EMAIL_TO, and
 * no-ops cleanly (logs `skipped-no-key`) without BREVO_API_KEY — it never pretends
 * an email was sent. Not part of the app bundle; not run by `npm test` / CI.
 */
import {sendReportEmail} from '@/lib/email/send-report-email';
import {runSession, type SessionInput} from '@/lib/engine';
import {alwaysCorrect, makeFixtureProvider} from '@/lib/engine/fixtures';
import type {Locale} from '@/content/locale';

// --- Safety guards: never in production / CI ---------------------------------
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run: NODE_ENV=production. This is a dev-only script.');
  process.exit(1);
}
if (process.env.CI) {
  console.error('Refusing to run in CI. This is a dev-only, interactive check.');
  process.exit(1);
}

// Load .env.local before reading any email config.
try {
  process.loadEnvFile('.env.local');
} catch {
  // Fine if it's absent; the checks below report what's missing.
}

const to = process.env.TEST_EMAIL_TO;
if (!to) {
  console.error(
    'Set TEST_EMAIL_TO in .env.local to a test inbox you own (NEVER a real parent), then re-run.'
  );
  process.exit(1);
}

const hasKey = Boolean(process.env.BREVO_API_KEY);
const hasSender = Boolean(process.env.EMAIL_FROM_ADDRESS);

const provider = makeFixtureProvider();
const SAMPLES: ReadonlyArray<{locale: Locale; age: number}> = [
  {locale: 'mk', age: 8},
  {locale: 'en', age: 10}
];

async function main() {
  console.log(`Recipient (TEST_EMAIL_TO): ${to}`);
  if (!hasKey) {
    console.warn(
      '\n⚠️  BREVO_API_KEY is not set — every send will no-op (skipped-no-key).\n' +
        '   Wiring is exercised, but LIVE DELIVERY IS DEFERRED pending the key.\n' +
        '   Add BREVO_API_KEY + EMAIL_FROM_ADDRESS to .env.local, then re-run.\n'
    );
  } else if (!hasSender) {
    console.warn('\n⚠️  EMAIL_FROM_ADDRESS is not set — every send will no-op.\n');
  } else {
    console.log(`Sender: ${process.env.EMAIL_FROM_ADDRESS}\n`);
  }

  for (const {locale, age} of SAMPLES) {
    console.log(`→ ${locale} / age ${age}`);
    const input: SessionInput = {age, seed: `report-harness-${locale}`, calibrationBaselineMs: 400};
    const run = runSession(input, provider, alwaysCorrect());
    // The orchestrator is internally try/caught and logs a structured status line
    // ({ event:'report-email', status:'sent'|'skipped-no-key'|'failed', … }).
    await sendReportEmail({
      run,
      email: to as string,
      locale,
      city: 'aerodrom',
      generatedAt: new Date().toISOString()
    });
  }

  if (hasKey && hasSender) {
    console.log(
      `\n✅ Attempted ${SAMPLES.length} sends to ${to}. Now inspect the inbox:\n` +
        '   • Cyrillic subject + body render (no tofu) for the mk sample;\n' +
        '   • iqup-cognitive-profile.pdf opens with 3 pages, the pentagon, the five\n' +
        '     indices, Cyrillic with no tofu, and a working demo CTA (?grad=).'
    );
  } else {
    console.log(
      '\n☑️  No-key path verified (each send no-opped without throwing). Live delivery deferred.'
    );
  }
}

main().catch((err) => {
  console.error('\n💥 test-report-email crashed:', err);
  process.exit(1);
});
