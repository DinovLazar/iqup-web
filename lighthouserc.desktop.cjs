/**
 * Phase 1.11 — Lighthouse CI, DESKTOP.
 *
 * Median-of-5 against the PRODUCTION build (`next start`) with the standard
 * Lighthouse desktop preset (no mobile throttling). Build first (`next build`),
 * then `npm run lhci:desktop`. Reports land in `.lighthouseci/desktop`.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in|Local:',
      startServerReadyTimeout: 60000,
      url: ['http://localhost:3000/', 'http://localhost:3000/en'],
      numberOfRuns: 5,
      settings: {
        // Pin MK so `/` resolves to the Macedonian landing directly instead of
        // locale-detection redirecting Lighthouse to `/en`. Explicit `/en` still
        // serves English.
        extraHeaders: {'Accept-Language': 'mk'},
        preset: 'desktop',
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
      outputDir: '.lighthouseci/desktop'
    }
  }
};
