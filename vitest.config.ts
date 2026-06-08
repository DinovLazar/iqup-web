import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

// Unit tests for pure logic (bands, scoring, content integrity). A Node
// environment is enough — no DOM is needed for the current suites.
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
    include: ['src/**/*.test.ts']
  }
});
