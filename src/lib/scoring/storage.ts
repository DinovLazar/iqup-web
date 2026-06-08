/**
 * The single, versioned sessionStorage key under which the test runner persists
 * the computed `TestResult` at the end-of-test hand-off.
 *
 * Phase 1.08 (email gate) and Phase 1.10 (results) read the result from here —
 * NOT from the URL — so no child data ever lands in the address bar. The `v1`
 * suffix tracks the `TestResult.version`; bump both together if the shape changes.
 */
export const TEST_RESULT_STORAGE_KEY = 'iqup.testResult.v1';
