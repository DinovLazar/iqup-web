/**
 * Tests for the consent-gated, PII-free + SCORE-free tracker (Phase 2.04,
 * extended Phase 3.12).
 *
 * HOW ENV IS STUBBED: `env.ts` reads `process.env.NEXT_PUBLIC_*` at module-load
 * time (this is how Next inlines them in the real build). So each test calls
 * `vi.stubEnv(...)` and THEN dynamically `await import()`s the modules after
 * `vi.resetModules()`. This guarantees `track()` sees the stubbed ids, and that
 * runtime module state (the consent snapshot) is fresh per test.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

type AnalyticsModules = {
  track: typeof import('./track').track;
  setConsentSnapshot: typeof import('./runtime').setConsentSnapshot;
};

/** Stub a browser environment with spied gtag/fbq, then import fresh modules. */
async function loadWith(opts: {
  ga?: string;
  pixel?: string;
  clarity?: string;
}): Promise<{
  mods: AnalyticsModules;
  gtag: ReturnType<typeof vi.fn>;
  fbq: ReturnType<typeof vi.fn>;
}> {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_GA4_ID', opts.ga ?? '');
  vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', opts.pixel ?? '');
  vi.stubEnv('NEXT_PUBLIC_CLARITY_ID', opts.clarity ?? '');

  const gtag = vi.fn();
  const fbq = vi.fn();

  // Minimal window/document so isBrowser() is true and gtag/fbq exist.
  vi.stubGlobal('window', {gtag, fbq});
  vi.stubGlobal('document', {});

  const track = (await import('./track')).track;
  const setConsentSnapshot = (await import('./runtime')).setConsentSnapshot;

  return {mods: {track, setConsentSnapshot}, gtag, fbq};
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('track() — consent gating', () => {
  it('no-ops when both consent categories are denied', async () => {
    const {mods, gtag, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: false, marketing: false});

    mods.track('generate_lead', {locale: 'en'});

    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
  });

  it('fires both GA and Pixel for generate_lead when both granted', async () => {
    const {mods, gtag, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.track('generate_lead', {locale: 'en'});

    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {locale: 'en'});
    expect(fbq).toHaveBeenCalledWith('track', 'Lead', {locale: 'en'});
  });

  it('fires only GA when only analytics granted', async () => {
    const {mods, gtag, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: false});

    mods.track('generate_lead', {locale: 'en'});

    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {locale: 'en'});
    expect(fbq).not.toHaveBeenCalled();
  });

  it('fires only Pixel when only marketing granted (and only for mapped events)', async () => {
    const {mods, gtag, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: false, marketing: true});

    // generate_lead has a pixel mapping → fbq fires, gtag does not.
    mods.track('generate_lead', {locale: 'en'});
    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).toHaveBeenCalledWith('track', 'Lead', {locale: 'en'});

    fbq.mockClear();

    // test_start has NO pixel mapping → nothing fires under marketing-only.
    mods.track('test_start', {locale: 'en'});
    expect(fbq).not.toHaveBeenCalled();
    expect(gtag).not.toHaveBeenCalled();
  });
});

describe('track() — env gating', () => {
  it('no-ops when no env ids set even though consent granted', async () => {
    const {mods, gtag, fbq} = await loadWith({}); // empty ids
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.track('generate_lead', {locale: 'en'});

    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
  });
});

describe('track() — v2 funnel events route to GA', () => {
  it('routes every v2 funnel event to GA under analytics consent', async () => {
    const {mods, gtag} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    for (const ev of [
      'age_set',
      'test_start',
      'section_complete',
      'test_complete',
      'form_view',
      'lead_submit',
      'cta_booking_click',
      'retest_start'
    ] as const) {
      gtag.mockClear();
      mods.track(ev, {locale: 'mk'});
      expect(gtag, `${ev} should reach GA`).toHaveBeenCalledTimes(1);
      expect(gtag.mock.calls[0]![1]).toBe(ev);
    }
  });

  it('lead_submit does NOT fire the Pixel (the Pixel Lead carries the dedup id)', async () => {
    const {mods, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.track('lead_submit', {locale: 'mk'});
    expect(fbq).not.toHaveBeenCalled();
  });
});

describe('track() — PII-free + SCORE-free sanitisation', () => {
  it('keeps only the {age, section, locale, path} allow-list', async () => {
    const {mods, gtag} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.track('age_set', {age: 7, section: 'Gf', locale: 'mk', path: '/test'});

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0]![2]).toEqual({
      age: 7,
      section: 'Gf',
      locale: 'mk',
      path: '/test'
    });
  });

  it('strips PII AND any cognitive outcome (band/score/index) before sending', async () => {
    const {mods, gtag} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    const dirty = {
      locale: 'mk',
      section: 'Gsm',
      // PII — must never pass:
      name: 'Ana',
      email: 'x@y.z',
      phone: '+38970123456',
      answers: ['a', 'b'],
      // Cognitive outcomes — must never pass (Phase 3.12 guardrail):
      band: 'Advanced',
      index: 'logical',
      score: 88,
      rank: 1
    };
    mods.track('section_complete', dirty as unknown as import('./track').TrackParams);

    expect(gtag).toHaveBeenCalledTimes(1);
    const forwarded = gtag.mock.calls[0]![2] as Record<string, unknown>;

    // Only allow-list keys present.
    expect(forwarded).toEqual({locale: 'mk', section: 'Gsm'});

    // Explicit PII + cognitive-outcome assertions.
    for (const banned of [
      'name',
      'email',
      'phone',
      'answers',
      'band',
      'index',
      'score',
      'rank'
    ]) {
      expect(forwarded, `${banned} must be dropped`).not.toHaveProperty(banned);
    }
  });

  it('drops band even when passed alone (the only number allowed is age)', async () => {
    const {mods, gtag} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.track('test_complete', {band: '80+', locale: 'en'} as import('./track').TrackParams);

    const forwarded = gtag.mock.calls[0]![2] as Record<string, unknown>;
    expect(forwarded).toEqual({locale: 'en'});
    expect(forwarded).not.toHaveProperty('band');
  });
});
