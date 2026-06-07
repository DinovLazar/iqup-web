import {defineConfig} from 'vitest/config';

// Unit tests for pure logic (e.g. src/lib/bands.ts). A Node environment is
// enough — no DOM is needed for the current suites.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
});
