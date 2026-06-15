/**
 * Phase 1.11 — shared Playwright fixtures + helpers.
 *
 * These let the e2e specs reach the funnel's gated states without a live
 * Supabase write:
 *  - `/result` (all three bands) is reached by injecting a valid `TestResult`
 *    + `LeadContext` into sessionStorage (the exact hand-off the runner persists),
 *    which is what `ResultView` reads and guards on.
 *  - the email gate is reached on the dev server via `?age=N&dev=1` + the DevBar
 *    auto-finish (no lead is submitted, so no DB row is created).
 *
 * Strength codes are the spec §1 codes: pattern · logic · memory · spatial ·
 * numeracy · words_obs (NOT "verbal" — that is only the colour token).
 */

export type StrengthCode =
  | 'pattern'
  | 'logic'
  | 'memory'
  | 'spatial'
  | 'numeracy'
  | 'words_obs';

export interface ResultFixture {
  band: '3-5' | '6-9' | '10-13';
  locale: 'mk' | 'en';
  name: string;
  age: number;
  ranking: StrengthCode[]; // index 0 = rank #1
}

/** A valid `TestResult` (passes `isTestResult`) built from a ranking. */
export function makeTestResult(fx: ResultFixture) {
  const strengths = fx.ranking.map((code, i) => {
    const rank = i + 1;
    const tier = rank <= 2 ? 'celebrated' : rank === 3 ? 'also' : 'growing';
    const total = 4;
    const hits = Math.max(0, 4 - i);
    return {code, total, hits, ratio: hits / total, rank, tier};
  });
  return {
    version: 1 as const,
    band: fx.band,
    locale: fx.locale,
    strengths,
    top1: fx.ranking[0],
    top2: fx.ranking[1],
    top3: fx.ranking[2],
    growing: fx.ranking.slice(3),
    completedAt: '2026-06-15T10:00:00.000Z'
  };
}

/** A valid `LeadContext` (passes `isLeadContext`). */
export function makeLeadContext(fx: ResultFixture) {
  return {
    childFirstName: fx.name,
    age: fx.age,
    submittedAt: '2026-06-15T10:00:00.000Z'
  };
}

/** One fixture per band, both locales represented across the set. */
export const RESULT_FIXTURES: ResultFixture[] = [
  {
    band: '3-5',
    locale: 'mk',
    name: 'Ива',
    age: 4,
    ranking: ['spatial', 'words_obs', 'pattern', 'logic', 'memory', 'numeracy']
  },
  {
    band: '6-9',
    locale: 'mk',
    name: 'Марко',
    age: 8,
    ranking: ['pattern', 'logic', 'numeracy', 'spatial', 'memory', 'words_obs']
  },
  {
    band: '10-13',
    locale: 'en',
    name: 'Sara',
    age: 12,
    ranking: ['logic', 'numeracy', 'pattern', 'spatial', 'memory', 'words_obs']
  }
];

export const TEST_RESULT_KEY = 'iqup.testResult.v1';
export const LEAD_CONTEXT_KEY = 'iqup.leadContext.v1';

/** Path prefix for a locale (mk = default, no prefix). */
export function localePath(locale: 'mk' | 'en', path = ''): string {
  const prefix = locale === 'en' ? '/en' : '';
  return `${prefix}${path}` || '/';
}
