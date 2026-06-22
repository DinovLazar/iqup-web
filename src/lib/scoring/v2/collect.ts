/**
 * Flatten a `SessionRun` into the shapes the validity + attention layers consume.
 * Pure projections over the run; no scoring logic here.
 */
import type {SessionRun} from '@/lib/engine';
import type {ResponseOutcome} from '@/lib/validity';
import type {TimedOutcome} from '@/lib/validity/attention';

/** Every answered item across all domains, with its domain + correctness + meta. */
export function toResponseOutcomes(session: SessionRun): ResponseOutcome[] {
  const out: ResponseOutcome[] = [];
  for (const run of Object.values(session.domains)) {
    for (const it of run.items) {
      out.push({
        domain: run.domain,
        response: it.response,
        correct: it.judgment.correct,
        meta: it.item.meta
      });
    }
  }
  return out;
}

/** Every item's timed outcome across the session (for the attention derivation). */
export function toTimedOutcomes(session: SessionRun): TimedOutcome[] {
  const out: TimedOutcome[] = [];
  for (const run of Object.values(session.domains)) {
    for (const it of run.items) {
      out.push({
        responseTimeMs: it.response.responseTimeMs,
        correct: it.judgment.correct,
        ...(it.response.omitted ? {omitted: true} : {})
      });
    }
  }
  return out;
}
