/**
 * The small "form completed" hand-off persisted after a successful v2 submit
 * (Phase 3.06) — the v2 sibling of `iqup.leadContext.v1`.
 *
 * On a successful submit the report form writes this to sessionStorage and lands on
 * the interstitial; Phase 3.09 (the results reveal) reads it. Its mere presence is
 * the signal that the form was completed — the report page falls back to `/test`
 * without it (so results are only reachable after capture) and it clears naturally
 * on tab close. It deliberately carries NO email and NO scores — only what the
 * results chrome legitimately needs (the parent's first name for a greeting + the
 * chosen centre id for the nearest-centre trial CTA) — and never touches the URL.
 *
 * The actual numbers 3.09 reveals are recomputed client-side from the persisted
 * `iqup.assessmentRun.v1` run — they are NOT duplicated here.
 */
export const LEAD_CONTEXT_V2_STORAGE_KEY = 'iqup.leadContext.v2';

export type LeadContextV2 = {
  /** The parent's first name — for a warm greeting on the results screen. */
  parentFirstName: string;
  /** The chosen centre's stable id — for the nearest-centre trial CTA (3.09). */
  city: string;
  /** ISO timestamp the form was submitted (for the results chrome, no PII). */
  submittedAt: string;
};

/** Structural guard — sessionStorage is untrusted (stale / hand-edited / empty). */
export function isLeadContextV2(value: unknown): value is LeadContextV2 {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.parentFirstName === 'string' &&
    v.parentFirstName.trim().length > 0 &&
    typeof v.city === 'string' &&
    v.city.trim().length > 0 &&
    typeof v.submittedAt === 'string'
  );
}

/** Persist the v2 lead context (client only). Swallows storage errors (private mode). */
export function writeLeadContextV2(ctx: LeadContextV2): void {
  try {
    window.sessionStorage.setItem(
      LEAD_CONTEXT_V2_STORAGE_KEY,
      JSON.stringify(ctx)
    );
  } catch {
    // sessionStorage may be unavailable; the navigation to the interstitial proceeds.
  }
}

/** Read + validate the v2 lead context (client only). `null` when absent/invalid. */
export function readLeadContextV2(): LeadContextV2 | null {
  try {
    const raw = window.sessionStorage.getItem(LEAD_CONTEXT_V2_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isLeadContextV2(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
