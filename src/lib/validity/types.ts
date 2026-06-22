/**
 * Validity layer types (spec Дел 7). Pure data — no UI. The live telemetry
 * capture and the gentle-note / retry UI are 3.05; this layer only computes the
 * flags, the graduated OUTCOME, and the validity inputs the confidence model
 * needs.
 */
import type {Domain} from '@/lib/engine/types';

/** The validity flags the spec names (Дел 7.1). */
export type ValidityFlagKind =
  | 'too_fast' // many sub-~500ms answers
  | 'same_position' // >60% identical option position
  | 'idle_gaps' // repeated long idle/blur gaps
  | 'chance_level' // domain accuracy at chance → lower confidence for that index
  | 'speed_gaming'; // "smearing" the Gs task (tapping ~all cells)

/** A mild flag → gentle note; a strong flag → not-representative / retry. */
export type FlagSeverity = 'mild' | 'strong';

/** A single raised validity flag. `detail` carries the measured numbers. */
export interface ValidityFlag {
  kind: ValidityFlagKind;
  severity: FlagSeverity;
  /** Set when the flag is domain-specific (chance_level, speed_gaming). */
  domain?: Domain;
  detail: Record<string, number>;
}

/** The graduated outcome signal (spec Дел 7.1). */
export type ValidityOutcome =
  | 'valid' // no flags → a confident profile
  | 'gentle_note' // mild flag(s) → normal report + a soft note
  | 'not_representative'; // strong flag(s) → withhold the confident profile + retry

/** The full validity verdict for a session. */
export interface ValiditySummary {
  outcome: ValidityOutcome;
  flags: ValidityFlag[];
  mildCount: number;
  strongCount: number;
  /** Domains whose accuracy sat at chance level → their index confidence drops. */
  chanceLevelDomains: Domain[];
}

/** The derived attention signal's raw computation + its components. */
export interface AttentionDerivation {
  /** Raw attention in [0, 1] = clamp(1 − normVariability − impulsiveRate, 0, 1). */
  raw: number;
  /** Calibration-relative response-time variability (coefficient of variation), [0,1]. */
  normVariability: number;
  /** (too-fast-and-wrong + omissions) / total responses, [0,1]. */
  impulsiveRate: number;
  /** Number of responses the derivation was computed over. */
  n: number;
}
