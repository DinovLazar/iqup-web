import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync, writeFileSync} from 'node:fs';
import {
  RESULT_FIXTURES,
  makeTestResult,
  makeLeadContext,
  localePath,
  TEST_RESULT_KEY,
  LEAD_CONTEXT_KEY,
  type ResultFixture
} from './fixtures';

/**
 * Phase 1.11 — automated WCAG audit (axe-core) across every route × meaningful
 * state × locale from the phase prompt §5. Bar: zero serious/critical violations.
 * Results are written to docs/qa/Part-1-Phase-11/axe-summary.<project>.json.
 */

type Impact = 'minor' | 'moderate' | 'serious' | 'critical' | null;
interface Finding {
  state: string;
  url: string;
  id: string;
  impact: Impact;
  help: string;
  nodes: number;
}

const collected: Finding[] = [];

/**
 * Run axe on the current page, excluding the Next.js dev overlay and any
 * `data-dev-only` chrome (the DevBar + the gate's dev strengths panel), which are
 * stripped in the production build, so a dev-server scan still reflects prod.
 */
async function scan(page: Page, state: string, extraExcludes: string[] = []) {
  let builder = new AxeBuilder({page}).exclude('nextjs-portal');
  for (const sel of ['[data-dev-only]', ...extraExcludes]) {
    builder = builder.exclude(sel);
  }
  const results = await builder.analyze();
  for (const v of results.violations) {
    collected.push({
      state,
      url: page.url(),
      id: v.id,
      impact: v.impact as Impact,
      help: v.help,
      nodes: v.nodes.length
    });
  }
  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(
    blocking,
    `serious/critical axe violations on "${state}": ${blocking
      .map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes)`)
      .join('; ')}`
  ).toEqual([]);
}

/** Inject the funnel hand-off so /result renders without a live submit. */
async function gotoResult(page: Page, fx: ResultFixture) {
  const result = makeTestResult(fx);
  const lead = makeLeadContext(fx);
  await page.addInitScript(
    ({r, l, rk, lk}) => {
      sessionStorage.setItem(rk, JSON.stringify(r));
      sessionStorage.setItem(lk, JSON.stringify(l));
    },
    {r: result, l: lead, rk: TEST_RESULT_KEY, lk: LEAD_CONTEXT_KEY}
  );
  await page.goto(localePath(fx.locale, '/result'));
  // Wait for the island to render (the child's name appears as an <h1>).
  await page.getByRole('heading', {level: 1}).first().waitFor();
}

test.describe('WCAG 2.2 AA — axe automated scans', () => {
  for (const locale of ['mk', 'en'] as const) {
    test(`landing (${locale})`, async ({page}) => {
      await page.goto(localePath(locale));
      await page.getByRole('heading', {level: 1}).first().waitFor();
      await scan(page, `landing-${locale}`);
    });

    test(`test start screen (${locale})`, async ({page}) => {
      await page.goto(localePath(locale, '/test?age=8'));
      await page.getByRole('button').first().waitFor();
      await scan(page, `test-start-${locale}`);
    });

    test(`trial booking page (${locale})`, async ({page}) => {
      await page.goto(localePath(locale, '/trial'));
      await page.getByRole('heading', {level: 1}).first().waitFor();
      // Scan the empty state first, then the city-selected state (the chosen-
      // centre card + the Call / Email / Get directions action row).
      await scan(page, `trial-empty-${locale}`);
      await page.getByRole('combobox').selectOption('aerodrom');
      await page.locator('a[href^="tel:"]').first().waitFor();
      await scan(page, `trial-selected-${locale}`);
    });

    test(`test first question (${locale})`, async ({page}) => {
      await page.goto(localePath(locale, '/test?age=8'));
      // Start screen → first question (the only button on the start screen).
      await page.getByRole('button').first().click();
      await page.getByRole('radio').first().waitFor();
      await scan(page, `test-question-${locale}`);
    });
  }

  test('test age-picker fallback (no ?age)', async ({page}) => {
    await page.goto('/test');
    await page.getByRole('radio').first().waitFor();
    await scan(page, 'test-age-fallback');
  });

  test('email gate — empty', async ({page}) => {
    await page.goto('/test?age=4&dev=1');
    await page.getByRole('button', {name: 'mixed'}).click();
    await page.locator('input[name="email"]').waitFor();
    await scan(page, 'gate-empty');
  });

  test('email gate — invalid + error message', async ({page}) => {
    await page.goto('/test?age=4&dev=1');
    await page.getByRole('button', {name: 'mixed'}).click();
    await page.locator('input[name="email"]').waitFor();
    await page.locator('input[name="email"]').fill('not-an-email');
    await page.locator('input[name="childFirstName"]').fill('Ана');
    await page.locator('button[type="submit"]').click();
    // The invalid-email message is rendered + linked via aria-describedby.
    await page.locator('[aria-invalid="true"]').first().waitFor();
    await scan(page, 'gate-invalid');
  });

  for (const fx of RESULT_FIXTURES) {
    test(`result — band ${fx.band} (${fx.locale})`, async ({page}) => {
      await gotoResult(page, fx);
      await scan(page, `result-${fx.band}-${fx.locale}`);
    });
  }

  test('not-found page (with skip link)', async ({page}) => {
    await page.goto('/this-route-does-not-exist');
    await page.getByRole('heading').first().waitFor();
    // §5: skip-to-content must exist on every page, the 404 included.
    await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
    await scan(page, 'not-found');
  });

  test.afterAll(async ({}, testInfo) => {
    const dir = 'docs/qa/Part-1-Phase-11';
    mkdirSync(dir, {recursive: true});
    const project = testInfo.project.name;
    const summary = {
      project,
      totalFindings: collected.length,
      seriousOrCritical: collected.filter(
        (f) => f.impact === 'serious' || f.impact === 'critical'
      ).length,
      byImpact: collected.reduce<Record<string, number>>((acc, f) => {
        const k = f.impact ?? 'none';
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
      findings: collected
    };
    writeFileSync(
      `${dir}/axe-summary.${project}.json`,
      JSON.stringify(summary, null, 2)
    );
  });
});
