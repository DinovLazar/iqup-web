import {test, expect, type Page} from '@playwright/test';
import {mkdirSync} from 'node:fs';
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
 * Phase 1.11 — cross-device visual evidence record + responsive integrity checks
 * + certificate download/share on mobile. Screenshots land under
 * docs/qa/Part-1-Phase-11/<project>/ (project = mobile | desktop).
 */

const OUT = 'docs/qa/Part-1-Phase-11';

function shotPath(project: string, name: string) {
  const dir = `${OUT}/${project}`;
  mkdirSync(dir, {recursive: true});
  return `${dir}/${name}.png`;
}

/** Remove the Next.js dev overlay so the evidence shots are production-faithful. */
async function cleanShot(page: Page, project: string, name: string) {
  await page.evaluate(() => {
    document.querySelector('nextjs-portal')?.remove();
  });
  await page.screenshot({path: shotPath(project, name), fullPage: true});
}

async function gotoResult(page: Page, fx: ResultFixture) {
  await page.addInitScript(
    ({r, l, rk, lk}) => {
      sessionStorage.setItem(rk, JSON.stringify(r));
      sessionStorage.setItem(lk, JSON.stringify(l));
    },
    {
      r: makeTestResult(fx),
      l: makeLeadContext(fx),
      rk: TEST_RESULT_KEY,
      lk: LEAD_CONTEXT_KEY
    }
  );
  await page.goto(localePath(fx.locale, '/result'));
  await page.getByRole('heading', {level: 1}).first().waitFor();
}

test.describe('Device matrix — screenshots', () => {
  test('landing (mk + en)', async ({page}, testInfo) => {
    const p = testInfo.project.name;
    await page.goto('/');
    await page.getByRole('heading', {level: 1}).first().waitFor();
    await cleanShot(page, p, 'landing-mk');
    await page.goto('/en');
    await page.getByRole('heading', {level: 1}).first().waitFor();
    await cleanShot(page, p, 'landing-en');
  });

  test('test start (mk)', async ({page}, testInfo) => {
    await page.goto('/test?age=8');
    await page.getByRole('button').first().waitFor();
    await cleanShot(page, testInfo.project.name, 'test-start-mk');
  });

  test('email gate (mk)', async ({page}, testInfo) => {
    await page.goto('/test?age=4&dev=1');
    await page.getByRole('button', {name: 'mixed'}).click();
    await page.locator('input[name="email"]').waitFor();
    await cleanShot(page, testInfo.project.name, 'gate-mk');
  });

  test('result — all three bands', async ({page}, testInfo) => {
    const p = testInfo.project.name;
    for (const fx of RESULT_FIXTURES) {
      await gotoResult(page, fx);
      await cleanShot(page, p, `result-${fx.band}-${fx.locale}`);
    }
  });

  test('not-found', async ({page}, testInfo) => {
    await page.goto('/this-route-does-not-exist');
    await page.getByRole('heading').first().waitFor();
    await cleanShot(page, testInfo.project.name, 'not-found');
  });
});

test.describe('Responsive integrity', () => {
  const WIDTHS = [360, 390, 414, 768, 1024, 1280];

  test('no horizontal overflow across breakpoints', async ({page}) => {
    const offenders: string[] = [];
    const pages = ['/', '/en', '/test?age=8'];
    for (const path of pages) {
      await page.goto(path);
      await page.getByRole('heading', {level: 1}).first().waitFor();
      for (const w of WIDTHS) {
        await page.setViewportSize({width: w, height: 900});
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        );
        if (overflow > 1) offenders.push(`${path} @ ${w}px → +${overflow}px`);
      }
    }
    // Also check a result page (band 3-5, mk) at each width.
    await gotoResult(page, RESULT_FIXTURES[0]);
    for (const w of WIDTHS) {
      await page.setViewportSize({width: w, height: 900});
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      if (overflow > 1) offenders.push(`/result @ ${w}px → +${overflow}px`);
    }
    expect(offenders, `horizontal overflow: ${offenders.join('; ')}`).toEqual([]);
  });
});

test.describe('Certificate — download + share on mobile', () => {
  test('download produces a PNG and share falls back to copy-link', async ({
    page,
    context
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'certificate mobile check runs on the mobile project'
    );
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoResult(page, RESULT_FIXTURES[0]);

    // Download → a PNG file with the certificate filename.
    const downloadBtn = page.getByRole('button', {name: /преземи|download/i}).first();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadBtn.click()
    ]);
    expect(download.suggestedFilename()).toMatch(/\.png$/);

    // Share → headless Chromium has no Web Share API → copy-link fallback shows
    // a "link copied" status (the child's name never leaves the browser).
    const shareBtn = page.getByRole('button', {name: /сподели|share/i}).first();
    await shareBtn.click();
    await expect(page.locator('[aria-live="polite"]')).not.toBeEmpty({
      timeout: 10_000
    });
  });
});
