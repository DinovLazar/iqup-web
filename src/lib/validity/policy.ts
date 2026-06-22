/**
 * The graduated-outcome policy (spec Дел 7.1): map raised flags to an outcome
 * signal — mild → a gentle note, strong → not-representative / retry.
 *
 *   no flags          → 'valid'              (a confident profile)
 *   only mild flag(s)  → 'gentle_note'       (normal report + a soft note)
 *   any strong flag    → 'not_representative' (withhold the profile + offer retry)
 *
 * This module decides the OUTCOME and the validity inputs the confidence model
 * consumes (the chance-level domains). The note/retry UI is 3.05.
 */
import type {ResponseOutcome} from './flags';
import {detectAllFlags} from './flags';
import type {ValidityFlag, ValidityOutcome, ValiditySummary} from './types';

/** Decide the outcome from a set of flags. */
export function outcomeForFlags(flags: readonly ValidityFlag[]): ValidityOutcome {
  if (flags.some((f) => f.severity === 'strong')) return 'not_representative';
  if (flags.length > 0) return 'gentle_note';
  return 'valid';
}

/** Evaluate the full validity verdict for a session's flattened outcomes. */
export function evaluateValidity(outcomes: readonly ResponseOutcome[]): ValiditySummary {
  const flags = detectAllFlags(outcomes);
  const strongCount = flags.filter((f) => f.severity === 'strong').length;
  const mildCount = flags.length - strongCount;
  const chanceLevelDomains = flags
    .filter((f) => f.kind === 'chance_level' && f.domain)
    .map((f) => f.domain!)
    .filter((d, i, arr) => arr.indexOf(d) === i);
  return {
    outcome: outcomeForFlags(flags),
    flags,
    mildCount,
    strongCount,
    chanceLevelDomains
  };
}
