/**
 * Pure, isomorphic mapping between the test engine's `TestResult` hand-off and
 * the lead pipeline's `leadSchema` shape. No `server-only` / Supabase imports, so
 * the email-gate client island and the (server) submit action can both use it,
 * and it is unit-testable in a plain Node/Vitest environment.
 *
 * Two transforms live here:
 *  1. band key  → leadSchema band enum  (the two modules use different vocab);
 *  2. TestResult → `top_strengths` SUMMARY  (number-only, never raw answers).
 *
 * Guardrails (decisions #25, #26, #29 + spec §3): the summary carries only the
 * three top strength codes plus a per-strength ratio map. There is NO total, NO
 * IQ number, and NO per-question data — `topStrengthsSchema` is `.strict()` and
 * number-only, so a regression here fails loudly rather than leaking data.
 */
import type {BandKey} from '@/lib/bands';
import type {TestResult} from '@/lib/scoring';
import type {Band, LeadInput, Locale, TopStrengths} from '@/lib/validation/lead';

/**
 * Version label of the consent wording the parent saw, stored on every lead.
 * DRAFT, tied to the provisional `Gate.consent` copy — bump when IqUp legal
 * finalises the wording (and add a new `Gate.consent` string for the new version).
 */
export const CONSENT_VERSION = 'v1-draft-2026-06';

/**
 * Canonical band key → `leadSchema` band enum. The bands module is the single
 * source of truth for the keys (`3-5`/`6-9`/`10-13`); the leads table predates it
 * and uses `band-a/b/c`. Decision #38 already fixed the 1:1 youngest→oldest
 * correspondence, so this is the same mapping, made explicit for the lead path.
 */
export const LEAD_BAND_BY_KEY: Record<BandKey, Band> = {
  '3-5': 'band-a',
  '6-9': 'band-b',
  '10-13': 'band-c'
};

/**
 * Inverse of `LEAD_BAND_BY_KEY`: the stored `leadSchema` band enum → the canonical
 * `BandKey`. The results-email orchestrator (Phase 2.01) receives the stored band
 * and needs the canonical key back to reproduce the on-screen result (drive the
 * trial-CTA rule and re-rank via `src/lib/scoring`). Pure derivation — no new data.
 */
export const BAND_KEY_BY_LEAD: Record<Band, BandKey> = {
  'band-a': '3-5',
  'band-b': '6-9',
  'band-c': '10-13'
};

/** Round to two decimals — clean per-strength figures, deterministic. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Project a `TestResult` into the `top_strengths` SUMMARY the lead stores.
 * `scores` maps each strength code to its per-strength accuracy ratio (0–1),
 * rounded — a normalized "how strong" figure, never a question-level answer.
 */
export function toTopStrengths(result: TestResult): TopStrengths {
  const scores: Record<string, number> = {};
  for (const s of result.strengths) {
    scores[s.code] = round2(s.ratio);
  }
  return {
    top1: result.top1,
    top2: result.top2,
    top3: result.top3,
    scores
  };
}

/**
 * The exact, typed payload the email-gate client island sends to the submit
 * action. camelCase on the wire; the honeypot rides along here and is dropped
 * before the lead is built. `consent` is a plain boolean (re-validated as
 * `literal(true)` by `leadSchema` server-side — never trust the client).
 */
export type GateSubmission = {
  email: string;
  childFirstName: string;
  childAge: number;
  band: Band;
  locale: Locale;
  topStrengths: TopStrengths;
  consent: boolean;
  marketingOptIn: boolean;
  /** Anti-spam honeypot: empty for humans; checked then stripped server-side. */
  honeypot: string;
};

/**
 * A lead payload before validation: the snake_case `LeadInput` shape, but with a
 * plain-boolean `consent` so an unconsented submission is still representable
 * (and then rejected by `leadSchema`, which requires `consent === true`).
 */
export type LeadInputDraft = Omit<LeadInput, 'consent'> & {consent: boolean};

/**
 * Build the snake_case lead payload from a gate submission. Stamps the current
 * `consent_version` and drops the honeypot. The result is re-validated by
 * `leadSchema` inside `insertLead()` — this never writes anything itself.
 */
export function buildLeadInput(s: GateSubmission): LeadInputDraft {
  return {
    email: s.email,
    child_first_name: s.childFirstName,
    child_age: s.childAge,
    band: s.band,
    top_strengths: s.topStrengths,
    locale: s.locale,
    consent: s.consent,
    consent_version: CONSENT_VERSION,
    marketing_opt_in: s.marketingOptIn
  };
}

/** What the submit action returns to the client. */
export type SubmitResult = {ok: true} | {ok: false; error: 'generic'};
