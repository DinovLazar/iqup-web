/**
 * Tests for the consent-gated, PII-free tracker (Phase 2.04).
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

    mods.track('generate_lead', {band: '6-9', locale: 'en'});

    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
  });

  it('fires both GA and Pixel for generate_lead when both granted', async () => {
    const {mods, gtag, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.track('generate_lead', {band: '6-9', locale: 'en'});

    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {band: '6-9', locale: 'en'});
    expect(fbq).toHaveBeenCalledWith('track', 'Lead', {band: '6-9', locale: 'en'});
  });

  it('fires only GA when only analytics granted', async () => {
    const {mods, gtag, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: false});

    mods.track('generate_lead', {band: '6-9', locale: 'en'});

    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {band: '6-9', locale: 'en'});
    expect(fbq).not.toHaveBeenCalled();
  });

  it('fires only Pixel when only marketing granted (and only for mapped events)', async () => {
    const {mods, gtag, fbq} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: false, marketing: true});

    // generate_lead has a pixel mapping → fbq fires, gtag does not.
    mods.track('generate_lead', {band: '6-9', locale: 'en'});
    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).toHaveBeenCalledWith('track', 'Lead', {band: '6-9', locale: 'en'});

    fbq.mockClear();

    // test_start has NO pixel mapping → nothing fires under marketing-only.
    mods.track('test_start', {band: '6-9', locale: 'en'});
    expect(fbq).not.toHaveBeenCalled();
    expect(gtag).not.toHaveBeenCalled();
  });
});

describe('track() — env gating', () => {
  it('no-ops when no env ids set even though consent granted', async () => {
    const {mods, gtag, fbq} = await loadWith({}); // empty ids
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.track('generate_lead', {band: '6-9', locale: 'en'});

    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
  });
});

describe('track() — PII-free sanitisation', () => {
  it('strips every key outside the {band, locale, path} whitelist', async () => {
    const {mods, gtag} = await loadWith({ga: 'G-TEST', pixel: 'PX-TEST'});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    const piiPayload = {
      band: '6-9',
      locale: 'mk',
      name: 'Ana',
      email: 'x@y.z',
      age: 7,
      answers: ['a', 'b'],
      strengths: 'logic'
    };
    // The cast proves callers cannot smuggle PII through the typed surface
    // either: TrackParams has no name/email/age keys.
    mods.track('test_start', piiPayload as unknown as import('./track').TrackParams);

    expect(gtag).toHaveBeenCalledTimes(1);
    const forwarded = gtag.mock.calls[0]![2] as Record<string, unknown>;

    // Only whitelist keys present.
    expect(forwarded).toEqual({band: '6-9', locale: 'mk'});

    // Explicit PII-free assertions.
    for (const banned of ['name', 'email', 'age', 'answers', 'strengths']) {
      expect(forwarded).not.toHaveProperty(banned);
    }
  });
});
