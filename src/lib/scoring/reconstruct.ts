/**
 * Reconstruct the on-screen ranked `TestResult` from the per-strength ratio map
 * the lead already carries (`top_strengths.scores`).
 *
 * The submit action (Phase 1.08) stores only the SUMMARY — the three top codes
 * plus a per-strength ratio map (number-only, no answers, no total/IQ). The
 * results email (Phase 2.01) needs the same ranked tiers the result screen showed
 * in order to assemble the same body copy via `getResultCopy`. Rather than persist
 * anything new, this re-derives the ranking from that ratio map using the SAME
 * deterministic comparator + tier rule as `score()`, so the emailed result is the
 * byte-for-byte same content as the on-screen result.
 *
 * `hits`/`total` are not part of the summary (and are unused by the result copy and
 * the certificate), so they are reported as 0. The ratios are the rounded values
 * the lead stored; the ranking the rounding produces is identical to the on-screen
 * ranking for the small-denominator ratios a band can yield (proven in
 * `reconstruct.test.ts`, which cross-checks against `score()`).
 */
import type {BandKey} from '@/lib/bands';
import type {Locale} from '@/content/locale';
import {STRENGTH_CODES} from '@/content/strengths';
import {compareStrengthScores, tierForRank} from './score';
import type {StrengthScore, TestResult, Tier} from './types';

export function reconstructResult(
  scores: Readonly<Record<string, number>>,
  band: BandKey,
  locale: Locale
): TestResult {
  const ranked: StrengthScore[] = STRENGTH_CODES.map((code) => ({
    code,
    total: 0,
    hits: 0,
    ratio: scores[code] ?? 0,
    rank: 0,
    tier: 'growing' as Tier
  }));

  ranked.sort(compareStrengthScores);
  ranked.forEach((s, i) => {
    s.rank = i + 1;
    s.tier = tierForRank(s.rank);
  });

  return {
    version: 1,
    band,
    locale,
    strengths: ranked,
    top1: ranked[0].code,
    top2: ranked[1].code,
    top3: ranked[2].code,
    growing: ranked.slice(3).map((s) => s.code)
  };
}
