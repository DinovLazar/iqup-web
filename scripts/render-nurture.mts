/**
 * Phase 2.03 — render the four nurture templates × 2 locales → 8 static HTML files.
 *
 * Run:  npm run emails:nurture
 *        (= tsx --tsconfig scripts/email-runtime/tsconfig.json scripts/render-nurture.mts)
 *
 * It runs under the SAME script-local tsconfig the 2.01 `test:email` uses, which
 * aliases `server-only`→empty (decision #87) so `@react-email/render` +
 * `react-dom/server` work under `tsx` (we must NOT use `--conditions=react-server`,
 * which blocks `react-dom/server`). The nurture templates don't import `server-only`
 * anyway — the alias is harmless and keeps the runtime identical to 2.01's.
 *
 * Output → `docs/email-templates/Part-2-Phase-03-nurture/<key>.<locale>.html`,
 * which the Cowork half loads into Brevo (see that folder's README). The trial-CTA
 * link is baked from `NEXT_PUBLIC_SITE_URL` (the same source the 2.01 email uses);
 * if it's unset, the dev placeholder `http://localhost:3000` is used — Cowork
 * confirms the link at 2.06 and swaps it to the real booking flow at 2.05.
 *
 * This is a pure render-to-file (no Brevo key, no send) — safe to run anywhere.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

import {renderNurtureEmail, NURTURE_KEYS} from '@/emails/nurture/render';
import type {Locale} from '@/content/locale';

const OUT_DIR = join('docs', 'email-templates', 'Part-2-Phase-03-nurture');
const LOCALES: Locale[] = ['mk', 'en'];

async function main(): Promise<void> {
  // Best-effort: pick up a configured NEXT_PUBLIC_SITE_URL so the CTA link is real.
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // Fine if absent — the dev placeholder is used (documented in the README).
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000 (dev placeholder)';
  console.log(`Rendering nurture emails (CTA base: ${siteUrl})`);

  await mkdir(OUT_DIR, {recursive: true});

  let written = 0;
  for (const key of NURTURE_KEYS) {
    for (const locale of LOCALES) {
      const html = await renderNurtureEmail(key, locale);
      const file = join(OUT_DIR, `${key}.${locale}.html`);
      await writeFile(file, html, 'utf8');
      console.log(`  ✓ ${key}.${locale}.html`);
      written += 1;
    }
  }

  console.log(`\n✅ Wrote ${written} HTML files to ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error('\n💥 render-nurture crashed:', err);
  process.exit(1);
});
