/**
 * Store B — the v2 parent lead (Phase 3.06, plan.md §11 / spec Дел 13).
 *
 * NO `server-only`: a pure, isomorphic schema + transform so the client form, the
 * server action, and tests all build against it. It defines what a valid v2 lead is
 * and maps it to the Brevo create-or-update contact payload (the UPPERCASE attribute
 * set + the consent-gated list ids).
 *
 * Honesty guardrail (the hard product rule): the ONLY result-derived attribute is
 * the single coarse `TOP_INDEX` LABEL (a human-readable English string). No score,
 * IQ, %, band word, rank, second-place, or full profile ever leaves for Brevo.
 *
 * Unlinkability guardrail: this carries NO Store A id and NO correlation token. The
 * Brevo contact id it returns is discarded by the orchestrator and never stored.
 */
import {z} from 'zod';
import {CENTERS, getCenter} from '@/content/centers';
import type {IndexId} from '@/lib/scoring/v2';
import type {
  BrevoContactAttributeValue,
  UpsertContactParams
} from '@/lib/email/brevo-contacts';

/** The v2 consent wording version (3 consents now vs v1's 2) — flag for IqUp legal. */
export const CONSENT_VERSION_V2 = 'v2-draft-2026-06';

/** Where the contact came from — a fixed operational tag for CRM segmentation. */
export const ASSESSMENT_LEAD_SOURCE = 'website-assessment';

/** The single coarse top-index label set (English, no numbers) — for `TOP_INDEX`. */
export const TOP_INDEX_LABEL: Record<IndexId, string> = {
  logical: 'Logical thinking',
  spatial: 'Spatial reasoning',
  memory_focus: 'Memory & focus',
  planning_speed: 'Planning & speed',
  learning_stem: 'Learning & STEM'
};

const INDEX_IDS = Object.keys(TOP_INDEX_LABEL) as [IndexId, ...IndexId[]];
const CITY_IDS = CENTERS.map((c) => c.id) as [string, ...string[]];

/**
 * The v2 lead schema. `parent_first_name`/email/phone/city are required; child
 * gender is optional; the three consents are SEPARATE — process + guardian are
 * required (literal `true`), marketing is an optional boolean. No child name.
 */
export const assessmentLeadSchema = z.object({
  parentFirstName: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  // Lenient phone validation: digits + the usual separators, 4–32 chars. The exact
  // format is left to IqUp / launch hardening — we only guard length + charset.
  phone: z
    .string()
    .trim()
    .min(4)
    .max(32)
    .regex(/^[0-9+()\-\s]+$/, 'phone-charset'),
  city: z.enum(CITY_IDS),
  childAge: z.int().min(5).max(13),
  childGender: z.enum(['female', 'male', 'unspecified']).nullable(),
  locale: z.enum(['mk', 'en']),
  // Both required consents must be exactly true to submit.
  consentProcess: z.literal(true),
  consentGuardian: z.literal(true),
  // Optional marketing opt-in — separate from the required consents.
  marketingOptIn: z.boolean(),
  // The single coarse top-index (an enum id; mapped to its English label for Brevo).
  topIndex: z.enum(INDEX_IDS)
});

/** A validated v2 lead. */
export type AssessmentLead = z.infer<typeof assessmentLeadSchema>;

/**
 * The two Brevo list ids the upsert targets. `null` = "unset" (intentional config —
 * e.g. running locally before Cowork's Brevo lists exist), not an error.
 */
export interface LeadListConfig {
  /** The operational "all leads" list (every submitted lead). */
  readonly leadsListId: number | null;
  /** The marketing/nurture list — gated behind `marketingOptIn`. */
  readonly marketingListId: number | null;
}

/**
 * Build the UPPERCASE Brevo contact attributes from a v2 lead. `CHILD_GENDER` is
 * omitted when null (so an update never clears an existing value). `CITY` uses the
 * centre's English city label for uniform CRM segmentation; the locale-independent
 * label keeps Brevo values consistent regardless of the parent's UI language.
 */
export function buildAssessmentLeadAttributes(
  lead: AssessmentLead
): Record<string, BrevoContactAttributeValue> {
  const center = getCenter(lead.city);
  const cityLabel = center ? center.city.en : lead.city;

  const attributes: Record<string, BrevoContactAttributeValue> = {
    PARENT_FIRST_NAME: lead.parentFirstName,
    PHONE: lead.phone,
    CITY: cityLabel,
    CHILD_AGE: lead.childAge,
    LOCALE: lead.locale,
    CONSENT_PROCESS: lead.consentProcess,
    CONSENT_GUARDIAN: lead.consentGuardian,
    MARKETING_OPT_IN: lead.marketingOptIn,
    CONSENT_VERSION: CONSENT_VERSION_V2,
    TOP_INDEX: TOP_INDEX_LABEL[lead.topIndex],
    SOURCE: ASSESSMENT_LEAD_SOURCE
  };

  if (lead.childGender !== null) {
    attributes.CHILD_GENDER = lead.childGender;
  }

  return attributes;
}

/**
 * Resolve which Brevo lists a contact joins.
 *  - the operational "all leads" list is always included when configured;
 *  - the marketing list is included IFF `marketingOptIn === true` AND configured.
 *
 * THE consent guardrail: a non-opt-in lead can never carry the marketing list id.
 */
export function assessmentLeadListIds(
  marketingOptIn: boolean,
  config: LeadListConfig
): number[] {
  const ids: number[] = [];
  if (config.leadsListId !== null) ids.push(config.leadsListId);
  if (marketingOptIn && config.marketingListId !== null) {
    ids.push(config.marketingListId);
  }
  return ids;
}

/** Assemble the full Brevo create-or-update payload for a v2 lead. */
export function buildAssessmentLeadUpsert(
  lead: AssessmentLead,
  config: LeadListConfig
): UpsertContactParams {
  return {
    email: lead.email,
    attributes: buildAssessmentLeadAttributes(lead),
    listIds: assessmentLeadListIds(lead.marketingOptIn, config),
    updateEnabled: true
  };
}
