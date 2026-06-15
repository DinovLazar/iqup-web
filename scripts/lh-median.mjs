/**
 * Phase 1.11 — Windows-tolerant Lighthouse median runner.
 *
 * Why this exists: `@lhci/cli` (the committed `lhci:mobile`/`lhci:desktop`
 * scripts) is the canonical, clean-infra median-of-5 tool, but on this Windows
 * machine every Lighthouse child process dies on an `EPERM` while chrome-launcher
 * removes its temp profile dir *after* the audit — which makes LHCI discard the
 * (otherwise valid) run. This script calls Lighthouse directly, writes each run's
 * JSON, and reads it back regardless of that post-run cleanup error, then reports
 * the per-URL MEDIAN. Same fixed mobile preset (simulated slow-4G + 4× CPU) and
 * `Accept-Language: mk` pin as the LHCI configs.
 *
 * Usage: build + start the prod server (`npm run build && npm run start`) in one
 * terminal, then `npm run lh:median` in another. Writes
 * docs/qa/Part-1-Phase-11/lighthouse-medians.json.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const BASE = 'http://localhost:3000';
const TMP = `${process.cwd()}\\.lhtmp`;
mkdirSync('.lhtmp', {recursive: true});
mkdirSync('docs/qa/Part-1-Phase-11', {recursive: true});

const TARGETS = [
  {url: '/', ff: 'mobile', runs: 5},
  {url: '/en', ff: 'mobile', runs: 5},
  {url: '/test', ff: 'mobile', runs: 3},
  {url: '/', ff: 'desktop', runs: 3},
  {url: '/en', ff: 'desktop', runs: 3}
];

// Invoke the Lighthouse CLI via `node` directly (not `npx.cmd`, which Node
// refuses to spawn without a shell on Windows) so args pass through unquoted.
const LH_CLI = 'node_modules/lighthouse/cli/index.js';

function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const results = [];
for (const t of TARGETS) {
  const slug = `${t.ff}${t.url.replace(/\//g, '_') || '_root'}`;
  const cat = {performance: [], accessibility: [], 'best-practices': [], seo: []};
  const met = {lcp: [], cls: [], tbt: []};
  let lcpElement = '';
  for (let i = 0; i < t.runs; i++) {
    const out = `.lhtmp/${slug}-${i}.json`;
    const args = [
      LH_CLI,
      BASE + t.url,
      '--quiet',
      '--only-categories=performance,accessibility,best-practices,seo',
      `--form-factor=${t.ff}`,
      t.ff === 'mobile' ? '--screenEmulation.mobile' : '--preset=desktop',
      '--throttling-method=simulate',
      '--extra-headers={"Accept-Language":"mk"}',
      '--chrome-flags=--headless=new --no-sandbox',
      '--output=json',
      `--output-path=${out}`
    ];
    try {
      execFileSync(process.execPath, args, {
        stdio: 'ignore',
        env: {...process.env, TEMP: TMP, TMP: TMP}
      });
    } catch {
      // Expected on Windows: post-audit temp-dir EPERM. The report JSON is
      // already written before cleanup, so we read it below anyway.
    }
    let r;
    try {
      r = JSON.parse(readFileSync(out, 'utf8'));
    } catch {
      console.error(`! no report for ${t.ff} ${t.url} run ${i}`);
      continue;
    }
    for (const k of Object.keys(cat)) {
      const s = r.categories?.[k]?.score;
      if (s != null) cat[k].push(Math.round(s * 100));
    }
    met.lcp.push(r.audits?.['largest-contentful-paint']?.numericValue ?? 0);
    met.cls.push(r.audits?.['cumulative-layout-shift']?.numericValue ?? 0);
    met.tbt.push(r.audits?.['total-blocking-time']?.numericValue ?? 0);
    if (!lcpElement) {
      lcpElement =
        r.audits?.['largest-contentful-paint-element']?.details?.items?.[0]
          ?.items?.[0]?.node?.snippet ?? '';
    }
  }
  results.push({
    url: t.url,
    formFactor: t.ff,
    runs: cat.performance.length,
    performance: median(cat.performance),
    accessibility: median(cat.accessibility),
    bestPractices: median(cat['best-practices']),
    seo: median(cat.seo),
    lcpMs: Math.round(median(met.lcp) ?? 0),
    cls: Number((median(met.cls) ?? 0).toFixed(3)),
    tbtMs: Math.round(median(met.tbt) ?? 0),
    lcpElement
  });
}

console.log('\n=== Lighthouse medians (Phase 1.11) ===');
for (const r of results) {
  console.log(
    `${r.formFactor.padEnd(7)} ${r.url.padEnd(8)} ` +
      `Perf ${String(r.performance).padStart(3)}  A11y ${r.accessibility}  ` +
      `BP ${r.bestPractices}  SEO ${r.seo}  | ` +
      `LCP ${r.lcpMs}ms  CLS ${r.cls}  TBT ${r.tbtMs}ms  (n=${r.runs})`
  );
}
writeFileSync(
  'docs/qa/Part-1-Phase-11/lighthouse-medians.json',
  JSON.stringify(results, null, 2)
);
console.log('\nwrote docs/qa/Part-1-Phase-11/lighthouse-medians.json');
