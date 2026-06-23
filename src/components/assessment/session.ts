/**
 * The session hand-off (3.05 → 3.06). Assembles + persists the completed
 * `SessionRun` and its validity outcome to a versioned `sessionStorage` key — no
 * PII, never in a URL (mirrors the v1 `iqup.testResult.v1` pattern). 3.06 (the
 * parent form) reads this at the `// HANDOFF (3.06)` seam on the completion
 * screen; downstream scoring (`buildProfile`) consumes the run + the device
 * baseline carried in `SessionRun.input.calibrationBaselineMs`.
 */
import type {SessionRun} from '@/lib/engine';
import type {ValiditySummary} from '@/lib/validity';

/** Versioned key — bump the suffix when the persisted shape changes (spec 19.4). */
export const ASSESSMENT_RESULT_STORAGE_KEY = 'iqup.assessmentRun.v1';

/** The persisted envelope the 3.06 form + downstream scoring read. */
export interface AssessmentHandoff {
  /** Shape version of THIS envelope (independent of engine/scoring versions). */
  version: 1;
  /** The full adaptive run: responses + telemetry + the device baseline. */
  run: SessionRun;
  /** The validity verdict computed at session end (outcome + flags). */
  validity: ValiditySummary;
  /** ISO timestamp the session completed (for the form / analytics, no PII). */
  completedAt: string;
}

/**
 * Generate a session seed. Determinism is per (age, seed): a fixed seed
 * reproduces the whole session, and a fresh seed on retry yields a new item set
 * (the 3.04 guarantee). Uses the Web Crypto RNG (NOT `Math.random` — the
 * no-`Math.random` source invariant from 3.03/3.04 continues to hold) so two
 * sessions don't collide; falls back to a time-based seed where crypto is absent.
 */
export function generateSeed(age: number): string {
  let nonce: number;
  const c =
    typeof globalThis !== 'undefined'
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;
  if (c && typeof c.getRandomValues === 'function') {
    nonce = c.getRandomValues(new Uint32Array(1))[0];
  } else {
    nonce = Date.now() >>> 0;
  }
  return `iqup-${age}-${nonce.toString(36)}`;
}

/** Persist the completed run for the 3.06 hand-off. Best-effort (private mode). */
export function persistHandoff(handoff: AssessmentHandoff): void {
  try {
    window.sessionStorage.setItem(
      ASSESSMENT_RESULT_STORAGE_KEY,
      JSON.stringify(handoff)
    );
  } catch {
    // sessionStorage may be unavailable (private mode); the in-memory result
    // still drives the completion screen. 3.06 re-validates the key on its own.
  }
}

/** Read a persisted hand-off (3.06 will use this; exported for the seam + tests). */
export function readHandoff(): AssessmentHandoff | null {
  try {
    const raw = window.sessionStorage.getItem(ASSESSMENT_RESULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AssessmentHandoff) : null;
  } catch {
    return null;
  }
}
