/**
 * Meta CAPI `Lead` — payload shape, hashing, the no-cognition guarantee, the
 * config no-op, and the never-throws contract (Phase 3.12).
 *
 * `server-only` is mocked so the module imports under Vitest's Node env; `fetch`
 * is stubbed so no real network is touched.
 */
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));

import {
  buildCapiEventPayload,
  buildCapiUserData,
  hashSha256,
  normalizeCity,
  normalizeCountry,
  normalizeEmail,
  normalizePhoneE164Mk,
  sendMetaCapiLead,
  type MetaCapiLeadInput
} from './capi';

const baseInput: MetaCapiLeadInput = {
  email: '  Parent@Example.COM ',
  phone: '070 382 269',
  city: 'Skopje – Aerodrom',
  country: 'mk',
  eventId: 'evt-123',
  eventSourceUrl: 'https://iqup.mk/report',
  clientIpAddress: '203.0.113.7',
  clientUserAgent: 'Mozilla/5.0',
  fbp: 'fb.1.123.456',
  fbc: 'fb.1.123.click',
  eventTime: 1_700_000_000,
  locale: 'mk'
};

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('normalisers', () => {
  it('email: trim + lowercase', () => {
    expect(normalizeEmail('  Parent@Example.COM ')).toBe('parent@example.com');
  });

  it('phone: → E.164 digits (MK), handling 0 / 00 / 389 / bare forms', () => {
    expect(normalizePhoneE164Mk('070 382 269')).toBe('38970382269');
    expect(normalizePhoneE164Mk('+389 70 123 456')).toBe('38970123456');
    expect(normalizePhoneE164Mk('0038970123456')).toBe('38970123456');
    expect(normalizePhoneE164Mk('38970123456')).toBe('38970123456');
    expect(normalizePhoneE164Mk('70123456')).toBe('38970123456');
  });

  it('city: primary token, diacritics folded, lowercased, punctuation/space-stripped', () => {
    expect(normalizeCity('Skopje – Aerodrom')).toBe('skopje');
    expect(normalizeCity('Skopje – Karpoš')).toBe('skopje');
    expect(normalizeCity('Veles')).toBe('veles');
    // Diacritics folded so the hashed `ct` aligns with Meta's city dictionary.
    expect(normalizeCity('Štip')).toBe('stip');
    expect(normalizeCity('Kičevo')).toBe('kicevo');
  });

  it('country: lowercase alpha-2', () => {
    expect(normalizeCountry('MK')).toBe('mk');
  });
});

describe('buildCapiUserData — hashing + raw signals', () => {
  it('hashes em/ph/ct/country over the NORMALISED values (SHA-256 hex)', () => {
    const ud = buildCapiUserData(baseInput);
    expect(ud.em).toBe(hashSha256('parent@example.com'));
    expect(ud.ph).toBe(hashSha256('38970382269'));
    expect(ud.ct).toBe(hashSha256('skopje'));
    expect(ud.country).toBe(hashSha256('mk'));
    for (const k of ['em', 'ph', 'ct', 'country'] as const) {
      expect(ud[k]).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('never sends raw contact details (only hashes)', () => {
    const json = JSON.stringify(buildCapiUserData(baseInput));
    expect(json).not.toContain('parent@example.com');
    expect(json).not.toContain('Parent@Example');
    expect(json).not.toContain('38970382269');
    expect(json).not.toContain('Aerodrom');
  });

  it('passes ip / ua / fbp / fbc UN-hashed, and omits them when absent', () => {
    const ud = buildCapiUserData(baseInput);
    expect(ud.client_ip_address).toBe('203.0.113.7');
    expect(ud.client_user_agent).toBe('Mozilla/5.0');
    expect(ud.fbp).toBe('fb.1.123.456');
    expect(ud.fbc).toBe('fb.1.123.click');

    const minimal = buildCapiUserData({
      ...baseInput,
      clientIpAddress: undefined,
      clientUserAgent: undefined,
      fbp: undefined,
      fbc: undefined
    });
    expect(minimal).not.toHaveProperty('client_ip_address');
    expect(minimal).not.toHaveProperty('fbp');
    expect(minimal).not.toHaveProperty('fbc');
  });
});

describe('buildCapiEventPayload — envelope + no cognition', () => {
  it('builds a single Lead event with the shared event_id + website source', () => {
    const payload = buildCapiEventPayload(baseInput, 1_700_000_000) as {
      data: Array<Record<string, unknown>>;
    };
    expect(payload.data).toHaveLength(1);
    const ev = payload.data[0]!;
    expect(ev.event_name).toBe('Lead');
    expect(ev.event_id).toBe('evt-123');
    expect(ev.action_source).toBe('website');
    expect(ev.event_time).toBe(1_700_000_000);
    expect(ev.event_source_url).toBe('https://iqup.mk/report');
    expect(ev.custom_data).toEqual({content_category: 'assessment_lead'});
  });

  it('includes test_event_code only when supplied', () => {
    expect(buildCapiEventPayload(baseInput, 1, 'TEST123')).toHaveProperty(
      'test_event_code',
      'TEST123'
    );
    expect(buildCapiEventPayload(baseInput, 1)).not.toHaveProperty('test_event_code');
  });

  it('NO cognitive data anywhere in the payload (band/index/score/rank/IQ)', () => {
    const json = JSON.stringify(buildCapiEventPayload(baseInput, 1)).toLowerCase();
    for (const forbidden of [
      'band',
      'score',
      'rank',
      'percentile',
      'logical',
      'spatial',
      'memory_focus',
      'planning_speed',
      'learning_stem',
      '"iq"'
    ]) {
      expect(json, `forbidden token "${forbidden}" leaked`).not.toContain(forbidden);
    }
  });
});

describe('sendMetaCapiLead — config gate + resilience', () => {
  it('is a logged no-op when the access token / dataset id is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '');
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const res = await sendMetaCapiLead(baseInput);
    expect(res).toEqual({status: 'skipped-no-config'});
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('POSTs to the Graph API when configured (and reads the dataset id as the Pixel id)', async () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', 'PX-1');
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'secret-token');
    const fetchSpy = vi.fn().mockResolvedValue({ok: true, text: async () => ''});
    vi.stubGlobal('fetch', fetchSpy);

    const res = await sendMetaCapiLead(baseInput);
    expect(res).toEqual({status: 'sent'});
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const url = fetchSpy.mock.calls[0]![0] as string;
    expect(url).toContain('/PX-1/events');
    expect(url).toContain('access_token=secret-token');
    // The secret must travel only in the request — never logged.
    const body = JSON.parse(
      (fetchSpy.mock.calls[0]![1] as {body: string}).body
    );
    expect(body.data[0].event_name).toBe('Lead');
  });

  it('NEVER throws and returns failed when fetch rejects', async () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', 'PX-1');
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'secret-token');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    await expect(sendMetaCapiLead(baseInput)).resolves.toEqual({
      status: 'failed',
      reason: 'threw'
    });
  });

  it('returns failed (not throw) on a non-2xx response', async () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', 'PX-1');
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'secret-token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ok: false, status: 400, text: async () => 'bad'})
    );

    await expect(sendMetaCapiLead(baseInput)).resolves.toEqual({
      status: 'failed',
      reason: 'http-400'
    });
  });

  it('forwards META_CAPI_TEST_EVENT_CODE into the payload when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', 'PX-1');
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'secret-token');
    vi.stubEnv('META_CAPI_TEST_EVENT_CODE', 'TEST777');
    const fetchSpy = vi.fn().mockResolvedValue({ok: true, text: async () => ''});
    vi.stubGlobal('fetch', fetchSpy);

    await sendMetaCapiLead(baseInput);
    const body = JSON.parse((fetchSpy.mock.calls[0]![1] as {body: string}).body);
    expect(body.test_event_code).toBe('TEST777');
  });
});
