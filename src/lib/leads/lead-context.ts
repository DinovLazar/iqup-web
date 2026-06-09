/**
 * The small "gate completed" hand-off persisted after a successful lead submit.
 *
 * On `{ok:true}` the email gate writes this to sessionStorage and navigates to
 * `/[locale]/result`; the temporary result page (and Phase 1.10's real one) read
 * it. Its mere presence is the signal that the gate was completed — `/result`
 * redirects home without it, so the page is only reachable after lead capture
 * (protecting it) and falls back naturally once sessionStorage clears on tab
 * close. It deliberately carries NO email and NO strengths — just what the
 * results chrome needs (the child's first name + age) — and never touches the URL.
 */
export const LEAD_CONTEXT_STORAGE_KEY = 'iqup.leadContext.v1';

export type LeadContext = {
  childFirstName: string;
  age: number;
  submittedAt: string;
};

/** Structural guard — sessionStorage is untrusted (stale / hand-edited / empty). */
export function isLeadContext(value: unknown): value is LeadContext {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.childFirstName === 'string' &&
    v.childFirstName.trim().length > 0 &&
    typeof v.age === 'number' &&
    Number.isFinite(v.age) &&
    typeof v.submittedAt === 'string'
  );
}

/** Persist the lead context (client only). Swallows storage errors (private mode). */
export function writeLeadContext(ctx: LeadContext): void {
  try {
    window.sessionStorage.setItem(LEAD_CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    // sessionStorage may be unavailable; the navigation to /result still proceeds.
  }
}

/** Read + validate the lead context (client only). `null` when absent/invalid. */
export function readLeadContext(): LeadContext | null {
  try {
    const raw = window.sessionStorage.getItem(LEAD_CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isLeadContext(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
