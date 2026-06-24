import 'server-only';

/**
 * Meta Conversions API (CAPI) — the server-side `Lead` (Phase 3.12).
 *
 * Fired from `submitAssessment` (at the `// SEAM (3.12)` marker) inside the same
 * `after()`-isolated, non-blocking pattern 3.10 uses for the report email, so a
 * slow / failing / unconfigured CAPI call can NEVER break the store writes, the
 * results reveal, or the redirect. This function NEVER throws — it returns a small
 * status and logs structurally.
 *
 * PRIVACY / GUARDRAILS:
 *  - `user_data` carries HASHED contact only: `em`/`ph`/`ct`/`country` are SHA-256
 *    over normalised values (Node `crypto`, server-side). Plus the NON-hashed
 *    `client_ip_address` / `client_user_agent` (request headers) and the Meta
 *    browser ids `fbp` / `fbc` when present.
 *  - `custom_data` carries NO cognitive data — at most a generic lead descriptor.
 *    No band, index value, score, IQ, %, or rank ever appears in any field.
 *  - It reads ONLY the submitted lead fields (Store B inputs) + the transient match
 *    data (`event_id`, `fbp`, `fbc`). It never touches Store A / any score, and
 *    introduces no key that could join the two stores.
 *  - It is a LOGGED NO-OP when `META_CAPI_ACCESS_TOKEN` or the dataset id
 *    (`NEXT_PUBLIC_META_PIXEL_ID`) is unset.
 *
 * DEDUP: the `event_id` is generated ONCE per submission on the client and shared
 * by this server `Lead` and (when loaded) the browser Pixel `Lead`. Meta
 * deduplicates server + browser events by `event_id` + `event_name`.
 */
import {createHash} from 'node:crypto';
import type {Locale} from '@/content/locale';

/**
 * Pinned Graph API version (recorded in `00_stack-and-config.md`). Meta supports
 * each version for ~2 years; bump deliberately. The dataset id is the Pixel id.
 */
export const GRAPH_API_VERSION = 'v21.0';

/** What `submitAssessment` hands this sender at the `// SEAM (3.12)` marker. */
export interface MetaCapiLeadInput {
  /** Parent email (Store B). Hashed to `em`. */
  readonly email: string;
  /** Parent phone (Store B). Normalised to E.164 (MK) + hashed to `ph`. */
  readonly phone: string;
  /** The selected centre's city label (Store B-derived). Normalised + hashed to `ct`. */
  readonly city: string;
  /** ISO-3166 alpha-2 country, lowercased. Defaults to `mk`. Hashed to `country`. */
  readonly country?: string;
  /** Shared dedup id — the SAME id the browser Pixel `Lead` uses. */
  readonly eventId: string;
  /** The page URL the submission happened on (no PII in the path). */
  readonly eventSourceUrl?: string;
  /** From the request headers — NOT hashed. */
  readonly clientIpAddress?: string;
  /** From the request headers — NOT hashed. */
  readonly clientUserAgent?: string;
  /** Meta `_fbp` browser id, when present — NOT hashed. */
  readonly fbp?: string;
  /** Meta `_fbc` click id, when present — NOT hashed. */
  readonly fbc?: string;
  /** Unix seconds; defaults to the server clock. Injectable for tests. */
  readonly eventTime?: number;
  /** Carried only for structured logging — never sent to Meta. */
  readonly locale?: Locale;
}

export type MetaCapiResult =
  | {status: 'sent'}
  | {status: 'skipped-no-config'}
  | {status: 'failed'; reason: string};

/** SHA-256 → lowercase hex (Meta's required hashing for `user_data` match keys). */
export function hashSha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/** Email: trim + lowercase. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Phone → E.164 digits (no `+`), assuming North Macedonia (+389) for national
 * numbers. `00` international prefix and an existing `389` are honoured; a leading
 * national trunk `0` is dropped before prepending the country code.
 */
export function normalizePhoneE164Mk(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('389')) return digits;
  if (digits.startsWith('0')) digits = digits.slice(1);
  return `389${digits}`;
}

/**
 * City → Meta's expected `ct` form: the primary city token, diacritics folded,
 * lowercased, with all spaces/punctuation stripped. The centre labels embed a
 * district (e.g. "Skopje – Aerodrom"); we take the part before the dash so the
 * hashed `ct` is the real city ("skopje"). Diacritics are decomposed + dropped
 * first (NFD) so "Štip" → "stip" / "Kičevo" → "kicevo" — closer to Meta's city
 * dictionary, which improves match quality.
 */
export function normalizeCity(city: string): string {
  const primary = city.split(/[–—\-/,]/)[0] ?? city;
  return primary
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Country code → lowercase alpha-2. */
export function normalizeCountry(country: string): string {
  return country.trim().toLowerCase().replace(/[^a-z]/g, '');
}

/** The hashed + raw match keys for `user_data` (omitting empty/absent fields). */
export function buildCapiUserData(
  input: MetaCapiLeadInput
): Record<string, string> {
  const userData: Record<string, string> = {
    em: hashSha256(normalizeEmail(input.email)),
    ph: hashSha256(normalizePhoneE164Mk(input.phone)),
    ct: hashSha256(normalizeCity(input.city)),
    country: hashSha256(normalizeCountry(input.country ?? 'mk'))
  };
  // Non-hashed signals — passed verbatim per Meta's spec.
  if (input.clientIpAddress) userData.client_ip_address = input.clientIpAddress;
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  return userData;
}

/**
 * Build the full CAPI request body for the `Lead`. Pure (no IO) so the payload
 * shape + hashing + no-cognition guarantee can be asserted without a network call.
 * `custom_data` carries only a generic descriptor — never any assessment outcome.
 */
export function buildCapiEventPayload(
  input: MetaCapiLeadInput,
  eventTime: number,
  testEventCode?: string
): Record<string, unknown> {
  return {
    data: [
      {
        event_name: 'Lead',
        event_time: eventTime,
        event_id: input.eventId,
        action_source: 'website',
        ...(input.eventSourceUrl
          ? {event_source_url: input.eventSourceUrl}
          : {}),
        user_data: buildCapiUserData(input),
        // GENERIC only — no band / index / score / rank ever goes here.
        custom_data: {content_category: 'assessment_lead'}
      }
    ],
    ...(testEventCode ? {test_event_code: testEventCode} : {})
  };
}

/**
 * POST a single `Lead` to the Conversions API. Never throws; a logged no-op when
 * the token or dataset id is unset. Optional `META_CAPI_TEST_EVENT_CODE` routes
 * the event to Meta's Test Events tool for QA (document it; not required to be set).
 */
export async function sendMetaCapiLead(
  input: MetaCapiLeadInput
): Promise<MetaCapiResult> {
  try {
    const datasetId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const token = process.env.META_CAPI_ACCESS_TOKEN;
    if (!datasetId || !token) {
      // Graceful degradation: the funnel runs locally before the Meta config lands.
      console.warn(
        JSON.stringify({event: 'meta-capi', status: 'skipped-no-config'})
      );
      return {status: 'skipped-no-config'};
    }

    const eventTime = input.eventTime ?? Math.floor(Date.now() / 1000);
    const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE || undefined;
    const payload = buildCapiEventPayload(input, eventTime, testEventCode);

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(
      datasetId
    )}/events?access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        JSON.stringify({
          event: 'meta-capi',
          status: 'failed',
          code: res.status,
          // Truncated so a Meta error body never bloats logs (and never holds PII —
          // we sent only hashes; Meta echoes our event, not the raw contact).
          body: body.slice(0, 200)
        })
      );
      return {status: 'failed', reason: `http-${res.status}`};
    }

    console.info(
      JSON.stringify({event: 'meta-capi', status: 'sent', locale: input.locale})
    );
    return {status: 'sent'};
  } catch (err) {
    // NEVER rethrow — the reveal, the two stores, and the redirect are untouched.
    console.error(
      JSON.stringify({
        event: 'meta-capi',
        status: 'failed',
        err: err instanceof Error ? err.message : String(err)
      })
    );
    return {status: 'failed', reason: 'threw'};
  }
}
