/**
 * Tests for syncTrackers() (Phase 2.04).
 *
 * Asserts deny-by-default (nothing injected with no consent), idempotent
 * injection (a script appended once even across repeated grant calls), and
 * withdrawal signalling (denied consent re-signalled, scripts NOT torn down).
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

type FakeScript = {async: boolean; src: string};

/** Build a fake browser whose document records every appended <script>. */
async function loadSync(opts: {ga?: string; pixel?: string; clarity?: string}): Promise<{
  syncTrackers: typeof import('./sync').syncTrackers;
  scripts: FakeScript[];
  win: Record<string, unknown>;
}> {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_GA4_ID', opts.ga ?? '');
  vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', opts.pixel ?? '');
  vi.stubEnv('NEXT_PUBLIC_CLARITY_ID', opts.clarity ?? '');

  const scripts: FakeScript[] = [];
  const win: Record<string, unknown> = {};
  const doc = {
    createElement: (): FakeScript => ({async: false, src: ''}),
    head: {
      appendChild: (s: FakeScript) => {
        scripts.push(s);
        return s;
      }
    }
  };

  vi.stubGlobal('window', win);
  vi.stubGlobal('document', doc);

  const syncTrackers = (await import('./sync')).syncTrackers;
  return {syncTrackers, scripts, win};
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

describe('syncTrackers() — deny-by-default', () => {
  it('injects no scripts when both categories denied', async () => {
    const {syncTrackers, scripts} = await loadSync({ga: 'G-X', pixel: 'PX-X', clarity: 'CL-X'});
    syncTrackers({analytics: false, marketing: false});
    expect(scripts).toHaveLength(0);
  });
});

describe('syncTrackers() — granted injection', () => {
  it('injects GA + Clarity on analytics grant and the Pixel on marketing grant', async () => {
    const {syncTrackers, scripts, win} = await loadSync({
      ga: 'G-X',
      pixel: 'PX-X',
      clarity: 'CL-X'
    });
    syncTrackers({analytics: true, marketing: true});

    const srcs = scripts.map((s) => s.src);
    expect(srcs.some((s) => s.includes('googletagmanager.com/gtag/js?id=G-X'))).toBe(true);
    expect(srcs.some((s) => s.includes('clarity.ms/tag/CL-X'))).toBe(true);
    expect(srcs.some((s) => s.includes('connect.facebook.net'))).toBe(true);

    // SDK shims were created.
    expect(typeof win.gtag).toBe('function');
    expect(typeof win.clarity).toBe('function');
    expect(typeof win.fbq).toBe('function');
  });

  it('is idempotent — repeated grant calls do not re-inject scripts', async () => {
    const {syncTrackers, scripts} = await loadSync({ga: 'G-X', pixel: 'PX-X', clarity: 'CL-X'});
    syncTrackers({analytics: true, marketing: true});
    const afterFirst = scripts.length;

    syncTrackers({analytics: true, marketing: true});
    syncTrackers({analytics: true, marketing: true});

    expect(scripts.length).toBe(afterFirst);
  });
});

describe('syncTrackers() — withdrawal', () => {
  it('signals denied without tearing down already-injected scripts', async () => {
    const {syncTrackers, scripts, win} = await loadSync({
      ga: 'G-X',
      pixel: 'PX-X',
      clarity: 'CL-X'
    });
    syncTrackers({analytics: true, marketing: true});
    const injected = scripts.length;

    // Spy on the live SDK shims to observe the denial signals.
    const gtagSpy = vi.spyOn(win as {gtag: (...a: unknown[]) => void}, 'gtag');
    const fbqSpy = vi.spyOn(win as {fbq: (...a: unknown[]) => void}, 'fbq');

    syncTrackers({analytics: false, marketing: false});

    // No new (and no removed) scripts.
    expect(scripts.length).toBe(injected);

    // GA storage denied + pixel revoked were signalled.
    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    expect(fbqSpy).toHaveBeenCalledWith('consent', 'revoke');
  });
});
