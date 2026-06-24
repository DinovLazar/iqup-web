import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Phase 2.04 — the headline guarantee + the consent-banner a11y + the /privacy
 * page. The single most important assertion: with no consent cookie, NOTHING
 * tracking-related loads (deny-by-default), even though dummy NEXT_PUBLIC_*
 * tracker ids are set on the dev server (see playwright.config.ts webServer.env).
 */

const TRACKER_URL =
  /googletagmanager\.com|google-analytics\.com|clarity\.ms|connect\.facebook\.net/;

/** Intercept (and abort) every tracker request, recording the attempts. The
 *  inline GA/Clarity/Pixel bootstraps still define window.gtag/clarity/fbq, so
 *  we can detect "a tracker was injected" without real network. */
async function interceptTrackers(page: Page): Promise<string[]> {
  const hits: string[] = [];
  await page.route(TRACKER_URL, (route) => {
    hits.push(route.request().url());
    return route.abort();
  });
  return hits;
}

/** True if any tracker SDK global exists on the page. */
async function trackerGlobalsPresent(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const w = window as unknown as Record<string, unknown>;
    return (
      typeof w.gtag !== 'undefined' ||
      typeof w.clarity !== 'undefined' ||
      typeof w.fbq !== 'undefined'
    );
  });
}

const PATHS = {
  mk: ['/', '/test?age=8', '/privacy'],
  en: ['/en', '/en/test?age=8', '/en/privacy']
} as const;

test.describe('Phase 2.04 — deny-by-default load model', () => {
  for (const locale of ['mk', 'en'] as const) {
    for (const path of PATHS[locale]) {
      test(`no tracker loads before consent — ${path}`, async ({page}) => {
        const hits = await interceptTrackers(page);
        await page.goto(path);
        // Give the banner + any (forbidden) loaders time to run.
        await page.getByRole('button', {name: /accept all|прифати ги сите/i})
          .first()
          .waitFor();
        await page.waitForTimeout(500);
        expect(hits, `tracker requests fired before consent on ${path}`).toEqual(
          []
        );
        expect(
          await trackerGlobalsPresent(page),
          `tracker SDK global present before consent on ${path}`
        ).toBe(false);
      });
    }
  }

  test('Accept all loads the trackers; Reject (fresh context) keeps them off', async ({
    page
  }) => {
    // --- Accept leg ---
    const hits = await interceptTrackers(page);
    await page.goto('/');
    const accept = page
      .getByRole('button', {name: /accept all|прифати ги сите/i})
      .first();
    await accept.waitFor();
    expect(hits).toEqual([]); // still nothing before the click
    await accept.click();
    // The banner dismisses + the loaders inject. Wait for an attempted fetch.
    await expect
      .poll(() => hits.length, {timeout: 5000})
      .toBeGreaterThan(0);
    expect(await trackerGlobalsPresent(page)).toBe(true);
    // GA, Clarity and Pixel should each have been attempted.
    const joined = hits.join(' ');
    expect(joined).toMatch(/googletagmanager\.com/);
    expect(joined).toMatch(/clarity\.ms/);
    expect(joined).toMatch(/connect\.facebook\.net/);
  });

  test('Reject in a fresh context loads nothing', async ({page}) => {
    const hits = await interceptTrackers(page);
    await page.goto('/');
    const reject = page
      .getByRole('button', {name: /^(reject|одбиј)$/i})
      .first();
    await reject.waitFor();
    await reject.click();
    await page.waitForTimeout(700);
    expect(hits).toEqual([]);
    expect(await trackerGlobalsPresent(page)).toBe(false);
  });

  // Phase 3.12: the same guarantee must hold on a v2 funnel surface. `/test` is now
  // the v2 assessment (3.05). Deny-by-default is already asserted for it in the loop
  // above; here we prove Accept loads the trackers on that v2 surface too.
  test('Accept all on the v2 /test assessment loads the trackers', async ({page}) => {
    const hits = await interceptTrackers(page);
    await page.goto('/test?age=8');
    const accept = page
      .getByRole('button', {name: /accept all|прифати ги сите/i})
      .first();
    await accept.waitFor();
    expect(hits).toEqual([]); // nothing before the click, on the v2 surface
    await accept.click();
    await expect.poll(() => hits.length, {timeout: 5000}).toBeGreaterThan(0);
    expect(await trackerGlobalsPresent(page)).toBe(true);
  });
});

test.describe('Phase 2.04 — consent banner a11y', () => {
  test('axe clean with the banner shown', async ({page}) => {
    await page.goto('/');
    await page
      .getByRole('button', {name: /accept all|прифати ги сите/i})
      .first()
      .waitFor();
    const results = await new AxeBuilder({page})
      .exclude('nextjs-portal')
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(
      blocking,
      blocking.map((v) => `${v.id} (${v.impact})`).join('; ')
    ).toEqual([]);
  });

  test('keyboard reaches both Accept and Reject; both visible without scrolling', async ({
    page
  }) => {
    await page.goto('/');
    const accept = page
      .getByRole('button', {name: /accept all|прифати ги сите/i})
      .first();
    const reject = page.getByRole('button', {name: /^(reject|одбиј)$/i}).first();
    await accept.waitFor();
    // Both in the initial viewport (Reject reachable without scrolling past Accept).
    await expect(accept).toBeInViewport();
    await expect(reject).toBeInViewport();
    // Equal visual weight: same background, box-shadow, font-weight and size (no
    // nudge toward Accept). Measured BEFORE focusing so the focus ring doesn't
    // pollute the box-shadow comparison.
    const style = (loc: typeof accept) =>
      loc.evaluate((el) => {
        const c = getComputedStyle(el);
        return `${c.backgroundColor}|${c.boxShadow}|${c.fontWeight}|${Math.round(
          el.getBoundingClientRect().height
        )}`;
      });
    expect(await style(accept)).toBe(await style(reject));
    // Both keyboard-focusable.
    await accept.focus();
    await expect(accept).toBeFocused();
    await reject.focus();
    await expect(reject).toBeFocused();
  });

  test('Manage dialog opens and ESC closes it', async ({page}) => {
    await page.goto('/');
    await page
      .getByRole('button', {name: /^(manage|прилагоди)$/i})
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test.describe('Phase 2.04 — /privacy page', () => {
  for (const {locale, path, lang} of [
    {locale: 'mk', path: '/privacy', lang: 'mk'},
    {locale: 'en', path: '/en/privacy', lang: 'en'}
  ] as const) {
    test(`renders with correct lang + skip link + axe clean (${locale})`, async ({
      page
    }) => {
      // Pin NEXT_LOCALE so next-intl's locale detection doesn't redirect the
      // default-locale path (/privacy) to /en/privacy in CI, where the browser
      // default is en-US. Real MK users hit /privacy as MK. (An explicit
      // /en/privacy path prefix already wins over the cookie for the EN leg.)
      await page.context().addCookies([
        {name: 'NEXT_LOCALE', value: lang, url: 'http://localhost:3000'}
      ]);
      await page.goto(path);
      await page.getByRole('heading', {level: 1}).first().waitFor();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
      const results = await new AxeBuilder({page})
        .exclude('nextjs-portal')
        .analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );
      expect(
        blocking,
        blocking.map((v) => `${v.id} (${v.impact})`).join('; ')
      ).toEqual([]);
    });
  }

  test('footer Cookie settings re-opens the Manage dialog', async ({page}) => {
    // Accept first so the banner is gone and only the footer entry remains.
    await page.goto('/privacy');
    await page
      .getByRole('button', {name: /accept all|прифати ги сите/i})
      .first()
      .click();
    await page
      .getByRole('contentinfo')
      .getByRole('button', {name: /cookie settings|поставки за колачиња/i})
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
