/**
 * Phase 2.01 — dev-only live-delivery check for the results email.
 *
 * Run:  npm run test:email
 *        (= tsx --tsconfig scripts/email-runtime/tsconfig.json scripts/test-email.ts)
 *
 * The send path imports the `server-only` package (a build-time client/server
 * tripwire). We can't neutralise it with `--conditions=react-server` (the way
 * `test:insert` does) because the React Email renderer needs `react-dom/server`,
 * which IS blocked under that condition — so instead `scripts/email-runtime/
 * tsconfig.json` maps `server-only` to an empty stub (paths alias). `next/og` and
 * `react-dom/server` then both work, exactly as they do in the real Next runtime
 * where the send actually happens (verified).
 *
 * It drives the REAL orchestrator (`sendResultsEmail`) once per band × locale,
 * always to `TEST_EMAIL_TO` (a test inbox you own — NEVER a real parent), so you
 * can confirm in the inbox:
 *   - the email arrives and renders (Gmail at least, ideally Outlook too);
 *   - the Macedonian subject + body render in Cyrillic with no tofu;
 *   - `certificate.png` opens as a valid 1080×1350 PNG with the right name /
 *     celebrated strengths / per-child tint and no tofu;
 *   - the trial CTA shows ONLY for the 3–5 and 6–9 bands (not 10–13).
 *
 * SAFETY: refuses to run in production or CI, and requires TEST_EMAIL_TO. If
 * `BREVO_API_KEY` is not set, the orchestrator no-ops (logs `skipped-no-key`) and
 * this script reports that live delivery is DEFERRED pending the key — it never
 * pretends an email was sent.
 *
 * Not part of the app bundle; not run by `npm test` / CI.
 */
import {sendResultsEmail} from '@/lib/email/send-results-email';
import {LEAD_BAND_BY_KEY} from '@/lib/leads/lead-mapping';
import type {BandKey} from '@/lib/bands';
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

// --- Sample matrix: every band × locale --------------------------------------
// Distinct per-band ratio maps (the same number-only summary a real lead stores),
// each yielding a clear ranking so the celebrated strengths differ per band.
const SCORES: Record<BandKey, Record<string, number>> = {
  '3-5': {spatial: 1, words_obs: 0.83, pattern: 0.67, numeracy: 0.5, memory: 0.33, logic: 0.17},
  '6-9': {pattern: 1, logic: 0.83, numeracy: 0.67, spatial: 0.5, memory: 0.33, words_obs: 0.17},
  '10-13': {memory: 1, numeracy: 0.83, logic: 0.67, words_obs: 0.5, spatial: 0.33, pattern: 0.17}
};

// Cyrillic names for MK, Latin for EN — so the Cyrillic path is exercised.
const SAMPLES: ReadonlyArray<{bandKey: BandKey; locale: Locale; name: string}> = [
  {bandKey: '3-5', locale: 'mk', name: 'Ива'},
  {bandKey: '3-5', locale: 'en', name: 'Mia'},
  {bandKey: '6-9', locale: 'mk', name: 'Марко'},
  {bandKey: '6-9', locale: 'en', name: 'Noah'},
  {bandKey: '10-13', locale: 'mk', name: 'Ана'},
  {bandKey: '10-13', locale: 'en', name: 'Maya'}
];

async function main() {
  console.log(`Recipient (TEST_EMAIL_TO): ${to}`);
  if (!hasKey) {
    console.warn(
      '\n⚠️  BREVO_API_KEY is not set — every send will no-op (skipped-no-key).\n' +
        '   Wiring is exercised, but LIVE DELIVERY IS DEFERRED pending the key.\n' +
        '   Add BREVO_API_KEY + EMAIL_FROM_ADDRESS (and optionally EMAIL_FROM_NAME /\n' +
        '   EMAIL_REPLY_TO) to .env.local, then re-run `npm run test:email`.\n'
    );
  } else if (!hasSender) {
    console.warn(
      '\n⚠️  EMAIL_FROM_ADDRESS is not set — every send will no-op (skipped-no-sender).\n'
    );
  } else {
    console.log(`Sender: ${process.env.EMAIL_FROM_ADDRESS}\n`);
  }

  for (const {bandKey, locale, name} of SAMPLES) {
    console.log(`→ ${bandKey} / ${locale} / "${name}"`);
    // The orchestrator is internally try/caught and logs a structured status line
    // ({ event:'results-email', status:'sent'|'skipped-no-key'|'failed', … }).
    await sendResultsEmail({
      email: to as string,
      childFirstName: name,
      band: LEAD_BAND_BY_KEY[bandKey],
      locale,
      scores: SCORES[bandKey]
    });
  }

  if (hasKey && hasSender) {
    console.log(
      `\n✅ Attempted ${SAMPLES.length} sends to ${to}. Now inspect the inbox:\n` +
        '   • Cyrillic subject + body render (no tofu) for the mk samples;\n' +
        '   • certificate.png opens as a 1080×1350 PNG with the right name/strengths/tint;\n' +
        '   • the trial CTA shows for 3–5 and 6–9, and is ABSENT for 10–13.'
    );
  } else {
    console.log(
      '\n☑️  No-key path verified (each send no-opped without throwing). Live delivery deferred.'
    );
  }
}

main().catch((err) => {
  console.error('\n💥 test-email crashed:', err);
  process.exit(1);
});
