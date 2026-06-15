/**
 * Phase 1.11 — Lighthouse CI, MOBILE.
 *
 * Median-of-5 against the PRODUCTION build (`next start`) with a single fixed
 * mobile throttling preset (Lighthouse standard: simulated slow-4G + 4× CPU), so
 * the mobile-performance number is defensible instead of single-run noise. Build
 * first (`next build`), then `npm run lhci:mobile`. Reports land in `.lighthouseci/`.
 *
 * No assertions are configured — we read the medians from the report, we do not
 * gate CI on them. Performance is measured on `/`, `/en`, `/test`, `/en/test`
 * (the ad-entry landing in both locales + the gate-hosting test route). `/result`
 * is not measurable here: it redirects home without the sessionStorage hand-off.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in|Local:',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/en',
        'http://localhost:3000/test',
        'http://localhost:3000/en/test'
      ],
      numberOfRuns: 5,
      settings: {
        // Pin MK so the prefix-less default-locale landing (`/`) resolves to the
        // Macedonian page directly instead of next-intl locale-detection
        // redirecting Lighthouse's English UA to `/en` (which fails the run).
        // Explicit `/en` still serves English regardless of this header.
        extraHeaders: {'Accept-Language': 'mk'},
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 1.75,
          disabled: false
        },
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        },
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo'
        ]
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci/mobile'
    }
  }
};
