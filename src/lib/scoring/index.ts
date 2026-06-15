/**
 * Scoring public surface. Import from `@/lib/scoring`.
 *
 * The `TestResult` contract (see ./types) is the hand-off both the email gate
 * (1.08) and the results screen (1.10) consume — strengths-based, positive-only,
 * with NO total score and NO IQ number anywhere.
 */
export {score, TIE_BREAK_ORDER, compareStrengthScores, tierForRank} from './score';
export {reconstructResult} from './reconstruct';
export {TEST_RESULT_STORAGE_KEY, isTestResult, readTestResult} from './storage';
export type {
  Answers,
  StrengthScore,
  TestResult,
  Tier
} from './types';
