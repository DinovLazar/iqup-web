import {test, expect} from '@playwright/test';

/**
 * Phase 1.11 — language switch must preserve the full path AND query string, so
 * switching MK↔EN mid-test keeps the child's `?age` instead of bouncing back to
 * the age picker (parity + WCAG 2.2 §3.3.7 Redundant Entry).
 */
test.describe('Language toggle — path + query preservation', () => {
  test('MK → EN keeps ?age on /test', async ({page}) => {
    await page.goto('/test?age=9');
    const toEn = page.getByRole('link', {name: 'English'});
    // The query is hydrated client-side; wait for the href to carry it.
    await expect(toEn).toHaveAttribute('href', /\/en\/test\?age=9/);
    await toEn.click();
    await expect(page).toHaveURL(/\/en\/test\?age=9$/);
    // And the test renders (start screen), not the age-picker fallback.
    await expect(page.getByRole('button').first()).toBeVisible();
  });

  test('EN → MK keeps ?age on /test', async ({page}) => {
    await page.goto('/en/test?age=9');
    const toMk = page.getByRole('link', {name: 'Македонски'});
    await expect(toMk).toHaveAttribute('href', /\/test\?age=9/);
    await toMk.click();
    await expect(page).toHaveURL(/\/test\?age=9$/);
    await expect(page.getByRole('button').first()).toBeVisible();
  });

  test('landing switch still works (no query to preserve)', async ({page}) => {
    await page.goto('/');
    await page.getByRole('heading', {level: 1}).first().waitFor();
    await page.getByRole('link', {name: 'English'}).first().click();
    await expect(page).toHaveURL(/\/en$/);
  });
});
