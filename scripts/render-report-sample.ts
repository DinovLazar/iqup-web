/**
 * Phase 3.10 — dev-only PDF eyeball harness.
 *
 * Run:  npm run report:sample
 *        (= tsx --tsconfig scripts/email-runtime/tsconfig.json scripts/render-report-sample.ts)
 *
 * Renders the report PDF for a `valid` and a `gentle_note` case in BOTH locales to
 * `docs/qa/Part-3-Phase-10/` so you can open them and confirm: 3 A4 pages; the
 * branded cover + identity pentagon; the five colour-coded indices; the narrative
 * + the demo CTA; and — critically — the Macedonian Cyrillic renders with NO tofu.
 *
 * These are a LOCAL QA artefact only (the Part-3-Phase-10 dir is gitignored — PDFs
 * with embedded fonts are large). In production the PDF is rendered in memory and
 * never written to disk. Not part of the app bundle; not run by `npm test` / CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import type {Locale} from '@/content/locale';
import type {ValidityOutcome} from '@/lib/validity';
import {renderReportPdf} from '@/lib/pdf';
import {sampleReport} from '@/lib/pdf/fixtures';
import {bookingUrlFor} from '@/lib/email/site-url';

const OUT = path.join(process.cwd(), 'docs', 'qa', 'Part-3-Phase-10');

const CASES: ReadonlyArray<{locale: Locale; validity: ValidityOutcome}> = [
  {locale: 'mk', validity: 'valid'},
  {locale: 'en', validity: 'valid'},
  {locale: 'mk', validity: 'gentle_note'},
  {locale: 'en', validity: 'gentle_note'}
];

async function main() {
  fs.mkdirSync(OUT, {recursive: true});
  for (const c of CASES) {
    const report = sampleReport(c.locale, {validity: c.validity});
    const buf = await renderReportPdf({
      report,
      locale: c.locale,
      bookingUrl: bookingUrlFor(c.locale, 'aerodrom')
    });
    const file = path.join(OUT, `report-${c.locale}-${c.validity}.pdf`);
    fs.writeFileSync(file, buf);
    console.log(`wrote ${path.relative(process.cwd(), file)} (${buf.length} bytes)`);
  }
  console.log('\nOpen the PDFs above and check: 3 pages, the pentagon, the five');
  console.log('indices, the demo CTA, and Macedonian Cyrillic with no tofu.');
}

main().catch((err) => {
  console.error('\n💥 render-report-sample crashed:', err);
  process.exit(1);
});
