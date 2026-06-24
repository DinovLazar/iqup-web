/**
 * Browser Pixel `Lead` + CAPI dedup bridge (Phase 3.12).
 *
 * Same env-stubbing idiom as `track.test.ts`: `env.ts` reads `NEXT_PUBLIC_*` at
 * module load, so we `vi.stubEnv` THEN dynamically import after `resetModules`.
 */
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

type Mods = {
  firePixelLead: typeof import('./pixel-lead').firePixelLead;
  readFbCookies: typeof import('./pixel-lead').readFbCookies;
  setConsentSnapshot: typeof import('./runtime').setConsentSnapshot;
};

async function loadWith(opts: {
  pixel?: string;
  cookie?: string;
  withFbq?: boolean;
}): Promise<{mods: Mods; fbq: ReturnType<typeof vi.fn>}> {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_GA4_ID', '');
  vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', opts.pixel ?? '');
  vi.stubEnv('NEXT_PUBLIC_CLARITY_ID', '');

  const fbq = vi.fn();
  const win: Record<string, unknown> = {};
  if (opts.withFbq) win.fbq = fbq;
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', {cookie: opts.cookie ?? ''});

  const pl = await import('./pixel-lead');
  const setConsentSnapshot = (await import('./runtime')).setConsentSnapshot;
  return {
    mods: {firePixelLead: pl.firePixelLead, readFbCookies: pl.readFbCookies, setConsentSnapshot},
    fbq
  };
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

describe('firePixelLead — consent + env + loaded gating', () => {
  it('fires fbq Lead with the shared event_id when marketing granted + pixel loaded', async () => {
    const {mods, fbq} = await loadWith({pixel: 'PX-1', withFbq: true});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.firePixelLead('evt-xyz');

    expect(fbq).toHaveBeenCalledWith('track', 'Lead', {}, {eventID: 'evt-xyz'});
  });

  it('no-ops when marketing is NOT granted', async () => {
    const {mods, fbq} = await loadWith({pixel: 'PX-1', withFbq: true});
    mods.setConsentSnapshot({analytics: true, marketing: false});

    mods.firePixelLead('evt-xyz');
    expect(fbq).not.toHaveBeenCalled();
  });

  it('no-ops when the pixel id is unset', async () => {
    const {mods, fbq} = await loadWith({pixel: '', withFbq: true});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.firePixelLead('evt-xyz');
    expect(fbq).not.toHaveBeenCalled();
  });

  it('no-ops when the Pixel is not loaded (fbq absent)', async () => {
    const {mods, fbq} = await loadWith({pixel: 'PX-1', withFbq: false});
    mods.setConsentSnapshot({analytics: true, marketing: true});

    mods.firePixelLead('evt-xyz');
    expect(fbq).not.toHaveBeenCalled();
  });
});

describe('readFbCookies', () => {
  it('reads _fbp and _fbc from document.cookie', async () => {
    const {mods} = await loadWith({
      cookie: '_fbp=fb.1.1.aaa; _fbc=fb.1.1.bbb; other=x'
    });
    expect(mods.readFbCookies()).toEqual({fbp: 'fb.1.1.aaa', fbc: 'fb.1.1.bbb'});
  });

  it('returns undefined for missing ids', async () => {
    const {mods} = await loadWith({cookie: 'other=x'});
    expect(mods.readFbCookies()).toEqual({fbp: undefined, fbc: undefined});
  });
});
