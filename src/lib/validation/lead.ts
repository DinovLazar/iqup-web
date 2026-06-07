import { z } from 'zod';

/**
 * Lead validation — the single source of truth for what a valid parent lead is.
 *
 * Shared across phases: the scoring phase (1.07) produces `top_strengths`, and the
 * email-gate form + submit route (1.08) call `insertLead()` which validates against
 * this schema. Keys are snake_case to match the `leads` table columns so a parsed
 * object inserts directly.
 *
 * Unknown keys are STRIPPED here — plain `z.object` strips by default in zod 4
 * (verified), so only the known fields are ever sent to the DB and no unexpected PII
 * is persisted (GDPR data minimization). We deliberately strip rather than `.strict()`
 * at this level so the lead is still saved (cleanly) if a future anti-spam field
 * (e.g. a honeypot — deferred to 2.04/2.07) rides along in the form payload.
 */

/** Age bands (each drives a band-specific test + result). Matches the DB check. */
export const BANDS = ['band-a', 'band-b', 'band-c'] as const;
export type Band = (typeof BANDS)[number];

/** Supported locales (MK default, EN secondary). Matches the DB check. */
export const LOCALES = ['mk', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Computed strengths SUMMARY (never raw answers): the three top strength keys plus
 * a per-strength score map. This is the contract the scoring phase (1.07) fills in.
 *
 * `.strict()` rejects any unknown key: because this object is produced by our own
 * scoring code (not an untrusted caller), strict-rejecting enforces "summary only"
 * loudly — a scoring bug that tried to attach raw answers would fail in dev rather
 * than be silently stripped. `scores` accepts only numbers, so raw answers (strings/
 * arrays) cannot be smuggled through it either.
 */
export const topStrengthsSchema = z
  .object({
    top1: z.string().trim().min(1).max(40),
    top2: z.string().trim().min(1).max(40),
    top3: z.string().trim().min(1).max(40),
    scores: z.record(z.string(), z.number()),
  })
  .strict();
export type TopStrengths = z.infer<typeof topStrengthsSchema>;

export const leadSchema = z.object({
  // Parent email (the lead). Top-level z.email() (zod 4); capped at the practical
  // RFC 5321 maximum address length.
  email: z.email().max(254),
  // Child's first name only — no surnames (data minimization). Trimmed; 1–60 chars.
  child_first_name: z.string().trim().min(1).max(60),
  // Child's age 3–13 (selects the band). Integer, range-checked to match the DB.
  child_age: z.int().min(3).max(13),
  band: z.enum(BANDS),
  top_strengths: topStrengthsSchema,
  locale: z.enum(LOCALES),
  // Parental consent is REQUIRED — must be exactly true to submit.
  consent: z.literal(true),
  // Version label of the consent wording the parent saw (e.g. 'v1').
  consent_version: z.string().trim().min(1).max(20),
  // Optional newsletter opt-in, separate from required consent (used in Part 2).
  marketing_opt_in: z.boolean().default(false),
});

/** Parsed/output shape — what gets inserted (`marketing_opt_in` always present). */
export type Lead = z.infer<typeof leadSchema>;
/** Input shape — what callers pass (`marketing_opt_in` optional; default applied). */
export type LeadInput = z.input<typeof leadSchema>;
