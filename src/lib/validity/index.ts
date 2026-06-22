/**
 * Public surface of the validity layer (spec Дел 7). Import from `@/lib/validity`.
 * Pure functions only — the gentle-note / retry UI and the live telemetry
 * capture are Phase 3.05.
 */
export type {
  ValidityFlagKind,
  FlagSeverity,
  ValidityFlag,
  ValidityOutcome,
  ValiditySummary,
  AttentionDerivation
} from './types';
export {
  type ResponseOutcome,
  detectTooFast,
  detectSamePosition,
  detectIdleGaps,
  detectChanceLevel,
  detectSpeedGaming,
  detectAllFlags
} from './flags';
export {outcomeForFlags, evaluateValidity} from './policy';
export {deriveAttention, type TimedOutcome} from './attention';
