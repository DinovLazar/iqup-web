import {defineConfig, devices} from '@playwright/test';

/**
 * Phase 1.11 — Playwright config for the accessibility (axe) + screenshot QA pass.
 *
 * Runs against the **dev server** (`npm run dev`). Accessibility findings (axe)
 * are DOM/ARIA-based and equivalent dev↔prod, and the dev server lets the specs
 * reach the gated gate state via `?dev=1` without a live Supabase write. The
 * separate Lighthouse-CI measurement (`lighthouserc.*.cjs`) is what runs against
 * the production build for performance. The Next dev overlay is excluded from
 * axe scans and removed before screenshots, so neither is polluted by dev-only UI.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', {open: 'never', outputFolder: 'playwright-report'}]],
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off'
  },
  projects: [
    {
      name: 'mobile',
      use: {...devices['Pixel 7'], viewport: {width: 393, height: 851}}
    },
    {
      name: 'desktop',
      use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 800}}
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000
  }
});
