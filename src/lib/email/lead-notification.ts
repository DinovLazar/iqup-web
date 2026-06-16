/**
 * Internal new-lead notification BODY (Phase 2.02, Track B) — PURE, no `server-only`.
 *
 * This is an INTERNAL ops alert to IqUp (the data controller) about their own
 * lead, NOT a parent-facing message. Because IqUp is the controller acting on its
 * own lawful basis to follow up, the alert MAY carry the parent email + child
 * first name (the team needs them to act). It is intentionally ENGLISH ONLY: it
 * is read by the internal team, so the bilingual (mk/en) requirement that governs
 * parent-facing copy does not apply here — the parent's chosen locale is reported
 * as a labelled field instead.
 *
 * Strengths-honest guardrail still holds: the visible body carries NO score / IQ /
 * % / rank / number. The child age is a number, so it is rendered as a WORDED label
 * (`ageInWords`) to keep the body digit-free; the only legitimate digit-bearing
 * values are the parent email, the consent version, and the timestamp (the
 * companion test masks these before asserting no digits — see
 * `lead-notification.test.ts`).
 */
import type {Locale} from '@/lib/validation/lead';
import {BRAND} from './brand';
import type {SavedLead} from './lead-summary';
import {bandLabelFor} from './lead-summary';

/**
 * Split a comma-separated `LEAD_NOTIFY_TO` env value into trimmed, non-empty
 * addresses. `undefined` / `null` / blank → `[]` (the orchestrator treats an
 * empty list as "no recipients configured" and skips the send).
 */
export function parseNotifyRecipients(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * English words for an age. Covers 3–13 (the `leadSchema`-validated range) plus
 * 0–2 for safety. Worded so the notification body stays free of stray digits.
 */
const AGE_WORDS: Readonly<Record<number, string>> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen'
};

export function ageInWords(age: number): string {
  return AGE_WORDS[age] ?? 'unknown';
}

/** Human-readable language name for the parent's reported locale. */
export function localeLabel(locale: Locale): string {
  return locale === 'mk' ? 'Macedonian' : 'English';
}

export interface LeadNotificationContent {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

/** The fixed reassurance line: the parent already has their results + certificate. */
const ALREADY_RECEIVED =
  "The parent has already received their child's strengths profile and certificate by email.";

/** Ordered label → value pairs shared by the text + HTML renderers. */
function rows(lead: SavedLead): ReadonlyArray<readonly [string, string]> {
  return [
    ['Child first name', lead.childFirstName],
    ['Parent email', lead.email],
    ['Child age', ageInWords(lead.childAge)],
    ['Age band', bandLabelFor(lead.band)],
    ['Language', localeLabel(lead.locale)],
    ['Marketing opt-in', lead.marketingOptIn ? 'Yes' : 'No'],
    ['Consent version', lead.consentVersion],
    ['Saved at', new Date(lead.savedAt).toUTCString()]
  ];
}

/** Escape the few characters that matter in HTML text/attribute content. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build the internal notification (subject + HTML + plain-text mirror). A couple
 * of `BRAND` hex tokens give the header a light on-brand touch; this is an ops
 * alert, so the markup stays simple and inline-styled (mobile-friendly), not the
 * full React Email design system.
 */
export function buildLeadNotificationContent(
  lead: SavedLead
): LeadNotificationContent {
  const subject = `New IqUp quiz lead: ${lead.childFirstName} — ${bandLabelFor(
    lead.band
  )}`;

  const fields = rows(lead);

  const text = [
    'New IqUp quiz lead',
    '',
    ...fields.map(([label, value]) => `${label}: ${value}`),
    '',
    ALREADY_RECEIVED
  ].join('\n');

  const rowsHtml = fields
    .map(
      ([label, value]) =>
        `<tr>` +
        `<td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};color:${BRAND.inkSoft};font-weight:600;vertical-align:top;white-space:nowrap;">${escapeHtml(
          label
        )}</td>` +
        `<td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};color:${BRAND.ink};">${escapeHtml(
          value
        )}</td>` +
        `</tr>`
    )
    .join('');

  const html =
    `<div style="margin:0;padding:24px;background:${BRAND.canvas};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink};">` +
    `<div style="max-width:560px;margin:0 auto;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">` +
    `<div style="padding:16px 20px;background:${BRAND.hero};color:${BRAND.heroInk};font-size:18px;font-weight:700;">New IqUp quiz lead</div>` +
    `<div style="padding:20px;">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.4;">${rowsHtml}</table>` +
    `<p style="margin:20px 0 0;font-size:14px;color:${BRAND.inkSoft};">${escapeHtml(
      ALREADY_RECEIVED
    )}</p>` +
    `</div>` +
    `</div>` +
    `</div>`;

  return {subject, html, text};
}
