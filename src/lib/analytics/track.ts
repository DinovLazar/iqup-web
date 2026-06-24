/**
 * Consent-gated, PII-free event tracking (Phase 2.04, extended in Phase 3.12).
 *
 * `track(event, params?)` routes a small set of named events to GA4 and/or the
 * Meta Pixel, but ONLY for the categories the parent has granted, only when the
 * relevant env id is set, and only when the SDK is actually present. With no
 * consent / no env id / no SDK it is a complete no-op. SSR-safe, never throws.
 *
 * PII-FREE + SCORE-FREE HARD RULE (Phase 3.12 §"Hard guardrails"): params are
 * sanitised down to a fixed allow-list of exactly `{ age, section, locale, path }`.
 * Every other key — name, email, phone, answers, AND any cognitive outcome
 * (`band`, index value, score, rank) — is DROPPED before anything reaches a third
 * party. `band` is intentionally NOT forwarded even though older (v1, orphaned)
 * callers still pass it: cognitive outcomes must never reach GA4 (defence-in-depth,
 * unit-asserted). `age` is the only number allowed (the child's age, non-identifying).
 */

import {GA4_ID, META_PIXEL_ID} from './env';
import {getConsentSnapshot, isBrowser} from './runtime';

export type TrackEvent =
  // Cross-cutting.
  | 'page_view'
  // The v2 assessment funnel (Phase 3.12 / spec Appendix F).
  | 'age_set'
  | 'test_start'
  | 'section_complete'
  | 'test_complete'
  | 'form_view'
  | 'lead_submit'
  | 'cta_booking_click'
  | 'retest_start'
  // v1 (orphaned) — kept in the union so the un-mounted v1 components still
  // typecheck; the v2 funnel does not use these names.
  | 'generate_lead';

/**
 * The only fields a caller may attach to an event. `band` is accepted for
 * back-compat with orphaned v1 callers BUT is never forwarded (see `sanitize`).
 * `age` + `section` are the v2 funnel additions; both are non-PII, non-cognitive.
 */
export type TrackParams = {
  /** The child's age (the only number allowed through — non-identifying). */
  age?: number;
  /** A language-neutral section/domain id for `section_complete` (e.g. `Gf`). */
  section?: string;
  locale?: string;
  path?: string;
  /** @deprecated v1 field — accepted but DROPPED; cognitive bands never reach GA. */
  band?: string;
};

/** Routing: GA event name + optional Pixel event name per TrackEvent. */
type Route = {ga: string | null; pixel: string | null};

const ROUTES: Record<TrackEvent, Route> = {
  page_view: {ga: 'page_view', pixel: 'PageView'},
  age_set: {ga: 'age_set', pixel: null},
  test_start: {ga: 'test_start', pixel: null},
  section_complete: {ga: 'section_complete', pixel: null},
  test_complete: {ga: 'test_complete', pixel: null},
  form_view: {ga: 'form_view', pixel: null},
  // The Meta `Lead` for a submission is fired server-side via CAPI (and, when the
  // Pixel is loaded, by `firePixelLead` with a shared `event_id` for dedup). So
  // `lead_submit` routes to GA only — `track()` cannot carry the dedup `event_id`.
  lead_submit: {ga: 'lead_submit', pixel: null},
  cta_booking_click: {ga: 'cta_booking_click', pixel: null},
  retest_start: {ga: 'retest_start', pixel: null},
  generate_lead: {ga: 'generate_lead', pixel: 'Lead'}
};

/**
 * Reduce arbitrary params to the PII-free, SCORE-free allow-list. Only `age`,
 * `section`, `locale`, and `path` survive, and only when present + well-typed.
 * `band` (and everything else) is dropped — cognitive outcomes never leave the site.
 */
function sanitize(params?: TrackParams): TrackParams {
  const clean: TrackParams = {};
  if (!params) return clean;
  if (typeof params.age === 'number' && Number.isFinite(params.age)) {
    clean.age = params.age;
  }
  if (typeof params.section === 'string') clean.section = params.section;
  if (typeof params.locale === 'string') clean.locale = params.locale;
  if (typeof params.path === 'string') clean.path = params.path;
  return clean;
}

export function track(event: TrackEvent, params?: TrackParams): void {
  if (!isBrowser()) return;

  const route = ROUTES[event];
  if (!route) return;

  const consent = getConsentSnapshot();
  const sanitized = sanitize(params);

  // GA / analytics channel.
  if (
    route.ga &&
    consent.analytics === true &&
    GA4_ID &&
    typeof window.gtag === 'function'
  ) {
    try {
      window.gtag('event', route.ga, sanitized);
    } catch {
      /* never throw */
    }
  }

  // Pixel / marketing channel.
  if (
    route.pixel &&
    consent.marketing === true &&
    META_PIXEL_ID &&
    typeof window.fbq === 'function'
  ) {
    try {
      window.fbq('track', route.pixel, sanitized);
    } catch {
      /* never throw */
    }
  }
}
