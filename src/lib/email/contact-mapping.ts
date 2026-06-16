/**
 * Pure SavedLead → Brevo contact upsert mapping (Phase 2.02, Track A).
 *
 * NO `server-only`: this is a pure, isomorphic transform so it unit-tests cleanly
 * and the orchestrator (`upsert-lead-contact.ts`) and tests both build against it.
 * It turns the shared `SavedLead` context into the Brevo create-or-update payload:
 * the UPPERCASE attribute set, and the consent-gated list ids.
 *
 * The single most important guardrail lives here: the marketing list id is added
 * ONLY when `marketingOptIn === true`. A non-opt-in lead is never placed on the
 * marketing/nurture list — consent is enforced at the mapping layer, not deferred
 * to Brevo configuration.
 *
 * Honesty guardrail (strengths-based only): attributes carry the child's celebrated
 * strength NAMES and a digit-free band LABEL — never a score, IQ number, percentile,
 * rank, raw answers, or the internal `band-a/b/c` code.
 */
import type {SavedLead} from './lead-summary';
import {bandLabelFor} from './lead-summary';
import type {
  BrevoContactAttributeValue,
  UpsertContactParams
} from './brevo-contacts';
import {STRENGTHS, isStrengthCode} from '@/content/strengths';

/** Where the contact came from — a fixed operational tag for CRM segmentation. */
export const CONTACT_SOURCE = 'website-quiz';

/**
 * The two Brevo list ids the upsert targets. `null` means "unset" (intentional
 * config — e.g. running locally before Cowork's Brevo lists exist), not an error.
 */
export interface ContactListConfig {
  /** The operational "all leads" list (every consented lead). */
  readonly leadsListId: number | null;
  /** The marketing/nurture list — gated behind `marketingOptIn`. */
  readonly marketingListId: number | null;
}

/**
 * Build the UPPERCASE Brevo contact attributes from a saved lead. Exactly eight
 * keys, all honest and strengths-based:
 *  - `CHILD_FIRST_NAME` (text)    — the child's first name.
 *  - `CHILD_AGE`        (number)  — the child's age (3–13).
 *  - `BAND`             (text)    — the digit-free human band label (never band-a/b/c).
 *  - `LOCALE`           (text)    — the parent's language (`mk`/`en`).
 *  - `MARKETING_OPT_IN` (boolean) — the marketing-consent flag (mirrors list gating).
 *  - `CONSENT_VERSION`  (text)    — the consent wording version the parent saw.
 *  - `TOP_STRENGTHS`    (text)    — the two celebrated strength names (see below).
 *  - `SOURCE`           (text)    — the fixed acquisition source.
 */
export function buildContactAttributes(
  lead: SavedLead
): Record<string, BrevoContactAttributeValue> {
  // TOP_STRENGTHS is an operational/CRM attribute, so its English display names
  // are used CONSISTENTLY regardless of the parent's locale (the LOCALE attribute
  // records the language) — this keeps segmentation/values uniform in Brevo.
  // `isStrengthCode` guards each code so a non-code value is skipped, never shown.
  const topStrengths = [lead.top1, lead.top2]
    .filter(isStrengthCode)
    .map((code) => STRENGTHS[code].name.en)
    .join(', ');

  return {
    CHILD_FIRST_NAME: lead.childFirstName,
    CHILD_AGE: lead.childAge,
    BAND: bandLabelFor(lead.band),
    LOCALE: lead.locale,
    MARKETING_OPT_IN: lead.marketingOptIn,
    CONSENT_VERSION: lead.consentVersion,
    TOP_STRENGTHS: topStrengths,
    SOURCE: CONTACT_SOURCE
  };
}

/**
 * Resolve which Brevo lists a contact joins.
 *  - the operational "all leads" list is always included when configured;
 *  - the marketing list is included IFF `marketingOptIn === true` AND configured.
 *
 * THE consent guardrail: a non-opt-in lead can never carry the marketing list id.
 */
export function contactListIds(
  marketingOptIn: boolean,
  config: ContactListConfig
): number[] {
  const ids: number[] = [];
  if (config.leadsListId !== null) {
    ids.push(config.leadsListId);
  }
  if (marketingOptIn && config.marketingListId !== null) {
    ids.push(config.marketingListId);
  }
  return ids;
}

/** Assemble the full Brevo create-or-update payload for a saved lead. */
export function buildContactUpsert(
  lead: SavedLead,
  config: ContactListConfig
): UpsertContactParams {
  return {
    email: lead.email,
    attributes: buildContactAttributes(lead),
    listIds: contactListIds(lead.marketingOptIn, config),
    updateEnabled: true
  };
}
