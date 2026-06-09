/**
 * The single, versioned sessionStorage key under which the test runner persists
 * the computed `TestResult` at the end-of-test hand-off, plus typed read helpers.
 *
 * Phase 1.08 (email gate) and Phase 1.10 (results) read the result from here —
 * NOT from the URL — so no child data ever lands in the address bar. The `v1`
 * suffix tracks the `TestResult.version`; bump both together if the shape changes.
 */
import type {TestResult} from './types';

export const TEST_RESULT_STORAGE_KEY = 'iqup.testResult.v1';

/**
 * Structural guard for a persisted `TestResult` (sessionStorage is untrusted —
 * it could be stale from an older version, hand-edited, or empty). Checks the
 * version + the fields the gate and the results screen actually read.
 */
export function isTestResult(value: unknown): value is TestResult {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    (v.locale === 'mk' || v.locale === 'en') &&
    typeof v.band === 'string' &&
    Array.isArray(v.strengths) &&
    v.strengths.length > 0 &&
    typeof v.top1 === 'string' &&
    typeof v.top2 === 'string' &&
    typeof v.top3 === 'string'
  );
}

/**
 * Read + validate the persisted `TestResult` from sessionStorage (client only).
 * Returns `null` when absent, unparsable, or shape-invalid — callers redirect.
 */
export function readTestResult(): TestResult | null {
  try {
    const raw = window.sessionStorage.getItem(TEST_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isTestResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
