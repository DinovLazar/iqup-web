/**
 * Consent-gated, PII-free event tracking (Phase 2.04).
 *
 * `track(event, params?)` routes a small set of named events to GA4 and/or the
 * Meta Pixel, but ONLY for the categories the parent has granted, only when the
 * relevant env id is set, and only when the SDK is actually present. With no
 * consent / no env id / no SDK it is a complete no-op. SSR-safe.
 *
 * PII-FREE HARD RULE: params are sanitised down to a fixed whitelist of exactly
 * `{ band, locale, path }`. Every other key (name, email, age, answers,
 * strengths, …) is dropped before anything is forwarded to a third party.
 */

import {GA4_ID, META_PIXEL_ID} from './env';
import {getConsentSnapshot, isBrowser} from './runtime';

export type TrackEvent =
  | 'page_view'
  | 'test_start'
  | 'test_complete'
  | 'generate_lead'
  | 'trial_cta_click';

export type TrackParams = {band?: string; locale?: string; path?: string};

/** Routing: GA event name + optional Pixel event name per TrackEvent. */
type Route = {ga: string | null; pixel: string | null};

const ROUTES: Record<TrackEvent, Route> = {
  page_view: {ga: 'page_view', pixel: 'PageView'},
  test_start: {ga: 'test_start', pixel: null},
  test_complete: {ga: 'test_complete', pixel: null},
  generate_lead: {ga: 'generate_lead', pixel: 'Lead'},
  trial_cta_click: {ga: 'trial_cta_click', pixel: null}
};

/**
 * Reduce arbitrary params to the PII-free whitelist. Only `band`, `locale`,
 * and `path` survive, and only when they are present (undefined keys dropped).
 */
function sanitize(params?: TrackParams): TrackParams {
  const clean: TrackParams = {};
  if (!params) return clean;
  if (typeof params.band === 'string') clean.band = params.band;
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
