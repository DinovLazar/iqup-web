import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

// Unit tests for pure logic (bands, scoring, content integrity) + the Phase 3.09
// results screen, which renders to static markup via `react-dom/server` (no DOM
// needed — the components are deliberately pure/presentational), so a Node
// environment still suffices. `.tsx` is included for the results-screen suite.
//
// The `@/*` → `src/*` alias mirrors tsconfig.json's paths so test files can use
// the same imports as the app (Vitest does not read tsconfig paths on its own).
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}']
  }
});
