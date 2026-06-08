/**
 * Rule-based scoring — deterministic, no AI, no total, no IQ number.
 *
 * Implements Phase 1.04 content spec §3 exactly:
 *   For each strength s in the band:
 *     total[s] = questions whose strength == s
 *     hits[s]  = those answered with the correct option
 *     score[s] = hits[s] / total[s]              (a ratio 0..1)
 *   Rank the six strengths by score descending, breaking ties by the fixed order
 *   below. Tiers: ranks 1–2 = celebrated, rank 3 = also, ranks 4–6 = growing.
 *
 * Ratios (not raw counts) keep the comparison fair across strengths that have
 * different question counts per band. The same answers always produce the same
 * result — the comparator is a *total* order over the six distinct codes, so the
 * outcome never depends on Array.prototype.sort stability.
 */
import type {BandKey} from '@/lib/bands';
import type {Locale} from '@/content/locale';
import {STRENGTH_CODES, type StrengthCode} from '@/content/strengths';
import {getQuestionsForBand} from '@/content/test';
import type {Answers, StrengthScore, TestResult, Tier} from './types';

/**
 * Fixed tie-break order (spec §3) — only matters for ties, and never surfaces
 * anything negatively. Each code has a unique index, giving a total order.
 */
export const TIE_BREAK_ORDER: readonly StrengthCode[] = [
  'pattern',
  'logic',
  'spatial',
  'numeracy',
  'memory',
  'words_obs'
];

const tieBreakIndex = (code: StrengthCode): number =>
  TIE_BREAK_ORDER.indexOf(code);

function tierForRank(rank: number): Tier {
  if (rank <= 2) return 'celebrated';
  if (rank === 3) return 'also';
  return 'growing';
}

/**
 * Score a child's answers for a band into the typed `TestResult` contract.
 *
 * @param answers question id → chosen option id (missing entries count as wrong)
 * @param band    canonical band key (`src/lib/bands.ts`)
 * @param locale  active locale, carried through for the results screen (1.10)
 *
 * Deterministic and side-effect-free. `completedAt` is intentionally left unset;
 * the runner stamps it at the sessionStorage hand-off so scoring stays pure.
 */
export function score(
  answers: Answers,
  band: BandKey,
  locale: Locale
): TestResult {
  const questions = getQuestionsForBand(band);

  // Tally hits/total per strength (every band covers all six — spec §2).
  const tally: Record<StrengthCode, {total: number; hits: number}> = {
    pattern: {total: 0, hits: 0},
    logic: {total: 0, hits: 0},
    memory: {total: 0, hits: 0},
    spatial: {total: 0, hits: 0},
    numeracy: {total: 0, hits: 0},
    words_obs: {total: 0, hits: 0}
  };

  for (const q of questions) {
    const bucket = tally[q.strength];
    bucket.total += 1;
    if (answers[q.id] === q.correct) bucket.hits += 1;
  }

  // Build the per-strength ratios, then rank.
  const ranked: StrengthScore[] = STRENGTH_CODES.map((code) => {
    const {total, hits} = tally[code];
    return {
      code,
      total,
      hits,
      ratio: total > 0 ? hits / total : 0,
      // rank + tier filled in after sorting
      rank: 0,
      tier: 'growing' as Tier
    };
  });

  ranked.sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio; // highest ratio first
    return tieBreakIndex(a.code) - tieBreakIndex(b.code); // fixed tie-break
  });

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
