import {describe, it, expect} from 'vitest';
import {COOKIE_CONSENT_VERSION} from './constants';
import {parseConsent, serializeConsent} from './cookie';
import {
  DENIED_CONSENT,
  acceptAllState,
  buildStoredConsent,
  consentStateFromStored,
  rejectAllState,
  toConsentState
} from './state';

describe('consent state machine', () => {
  it('defaults to denied for analytics + marketing', () => {
    expect(DENIED_CONSENT).toEqual({analytics: false, marketing: false});
  });

  it('accept-all grants both categories', () => {
    expect(acceptAllState()).toEqual({analytics: true, marketing: true});
  });

  it('reject denies both categories', () => {
    expect(rejectAllState()).toEqual({analytics: false, marketing: false});
  });

  it('set-preferences keeps per-category selection', () => {
    expect(toConsentState({analytics: true, marketing: false})).toEqual({
      analytics: true,
      marketing: false
    });
    expect(toConsentState({analytics: false, marketing: true})).toEqual({
      analytics: false,
      marketing: true
    });
  });

  it('coerces missing/odd values to false (never silently grants)', () => {
    // @ts-expect-error — exercising a malformed runtime input
    expect(toConsentState({analytics: 'yes'})).toEqual({
      analytics: false,
      marketing: false
    });
    expect(toConsentState({})).toEqual(DENIED_CONSENT);
  });
});

describe('consent cookie serialise/parse round-trip', () => {
  it('round-trips a stored choice', () => {
    const stored = buildStoredConsent(
      {analytics: true, marketing: false},
      '2026-06-19T10:00:00.000Z'
    );
    const raw = serializeConsent(stored);
    const parsed = parseConsent(raw);
    expect(parsed).toEqual(stored);
    expect(parsed && consentStateFromStored(parsed)).toEqual({
      analytics: true,
      marketing: false
    });
  });

  it('stamps the current version + timestamp', () => {
    const stored = buildStoredConsent(acceptAllState(), '2026-06-19T00:00:00.000Z');
    expect(stored.v).toBe(COOKIE_CONSENT_VERSION);
    expect(stored.ts).toBe('2026-06-19T00:00:00.000Z');
  });
});

describe('COOKIE_CONSENT_VERSION bump invalidates stored consent', () => {
  it('rejects a value stored under an older version (re-prompts)', () => {
    const older = JSON.stringify({
      v: 'cookies-v0-2020-01',
      analytics: true,
      marketing: true,
      ts: '2020-01-01T00:00:00.000Z'
    });
    expect(parseConsent(older)).toBeNull();
  });

  it('rejects malformed / empty values', () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent('')).toBeNull();
    expect(parseConsent('not json')).toBeNull();
    expect(parseConsent('{"v":"' + COOKIE_CONSENT_VERSION + '"}')).toBeNull();
    expect(
      parseConsent(
        JSON.stringify({v: COOKIE_CONSENT_VERSION, analytics: 1, marketing: 0, ts: 'x'})
      )
    ).toBeNull();
  });

  it('accepts a value stored under the current version', () => {
    const current = serializeConsent(
      buildStoredConsent({analytics: false, marketing: true}, '2026-06-19T00:00:00.000Z')
    );
    expect(parseConsent(current)).toEqual({
      v: COOKIE_CONSENT_VERSION,
      analytics: false,
      marketing: true,
      ts: '2026-06-19T00:00:00.000Z'
    });
  });
});
