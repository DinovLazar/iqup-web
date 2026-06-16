/**
 * Shared lead-summary presentation helpers (Phase 2.02).
 *
 * Pure + isomorphic (NO `server-only` / Supabase / Brevo imports) so the two
 * independent 2.02 tracks both build against one contract and unit-test cleanly:
 *   - the Brevo contact upsert (`contact-mapping.ts` → attributes), and
 *   - the internal new-lead notification (`lead-notification.ts` → body).
 *
 * `SavedLead` is the context the lead-save path hands the `after()` fan-out — it
 * carries ONLY data the submit action already has (no new data is collected or
 * persisted by 2.02). `BAND_LABEL` is the human-readable, **digit-free** band
 * label (never the internal `band-a/b/c` code) used in both the contact `BAND`
 * attribute and the notification body — digit-free so it never trips the
 * no-number guardrail that the notification body asserts.
 */
import type {BandKey} from '@/lib/bands';
import {BAND_KEY_BY_LEAD} from '@/lib/leads/lead-mapping';
import type {Band, Locale} from '@/lib/validation/lead';

/**
 * The data the lead-save path hands each `after()` side-effect. Everything here
 * is already on the submission / the saved row — 2.02 stores nothing new.
 */
export interface SavedLead {
  /** Parent email (the lead + the contact's primary key in Brevo). */
  readonly email: string;
  /** Child's first name (already received by Brevo in the 2.01 results email). */
  readonly childFirstName: string;
  /** Child's age 3–13. */
  readonly childAge: number;
  /** Stored `leadSchema` band (`band-a`/`band-b`/`band-c`). */
  readonly band: Band;
  readonly locale: Locale;
  /** Optional marketing opt-in — the consent gate for the marketing list. */
  readonly marketingOptIn: boolean;
  /** Version label of the consent wording the parent saw. */
  readonly consentVersion: string;
  /** Ranked celebrated/also strength codes (from the lead's `top_strengths`). */
  readonly top1: string;
  readonly top2: string;
  readonly top3: string;
  /** Per-strength ratio summary (number-only, no answers) — unused by 2.02. */
  readonly scores: Readonly<Record<string, number>>;
  /** When the lead row was saved (the DB `created_at`, ISO 8601). */
  readonly savedAt: string;
}

/**
 * Human-readable, **digit-free** band label, keyed by the canonical band key.
 * Used by the contact `BAND` attribute and the notification body so neither
 * shows the internal `band-a/b/c` code, and so the body stays free of stray
 * digits (the only legitimate numerics in the notification are the masked
 * email / consent-version / timestamp values — see `lead-notification.ts`).
 */
export const BAND_LABEL: Readonly<Record<BandKey, string>> = {
  '3-5': 'Ages three to five',
  '6-9': 'Ages six to nine',
  '10-13': 'Ages ten to thirteen'
};

/** Resolve a stored `leadSchema` band enum to its human label (via the key). */
export function bandLabelFor(band: Band): string {
  return BAND_LABEL[BAND_KEY_BY_LEAD[band]];
}
