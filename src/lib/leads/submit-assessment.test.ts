/**
 * Spec for the report-form server action — the two-store write at the HANDOFF
 * (3.06) seam. Both writers are mocked so we can assert WHAT each store receives
 * and prove the unlinkability + non-trapping guarantees without any real IO. The
 * `after()` callback is run synchronously so the Store A side-effect is observable.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {COOKIE_CONSENT_VERSION} from '@/lib/consent/constants';

vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({after: (fn: () => unknown) => fn()}));

const upsertAssessmentLeadMock = vi.fn();
vi.mock('./upsert-assessment-lead', () => ({
  upsertAssessmentLead: (l: unknown) => upsertAssessmentLeadMock(l)
}));

const insertAnonymousScoreMock = vi.fn();
vi.mock('@/lib/scores/insert-anonymous-score', () => ({
  insertAnonymousScore: (s: unknown) => insertAnonymousScoreMock(s)
}));

// SEAM (3.12): mock the request-context + the CAPI sender so the gating is
// observable without a real cookie store / headers / network.
const capi = vi.hoisted(() => ({
  cookieValue: undefined as string | undefined,
  headerEntries: {} as Record<string, string>,
  sendMock: vi.fn()
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      capi.cookieValue !== undefined ? {name, value: capi.cookieValue} : undefined
  }),
  headers: async () => new Headers(capi.headerEntries)
}));
vi.mock('@/lib/meta/capi', () => ({
  sendMetaCapiLead: (input: unknown) => capi.sendMock(input)
}));

/** A valid `iqup_consent` cookie value for the given marketing grant. */
function consentCookie(marketing: boolean): string {
  return JSON.stringify({
    v: COOKIE_CONSENT_VERSION,
    analytics: true,
    marketing,
    ts: '2026-06-24T00:00:00.000Z'
  });
}

const metaReq = {
  eventId: 'evt-dedup-1',
  fbp: 'fb.1.1.aaa',
  fbc: 'fb.1.1.bbb',
  eventSourceUrl: 'https://iqup.mk/report'
};

import {runSession, type SessionInput} from '@/lib/engine';
import {alwaysCorrect, makeFixtureProvider} from '@/lib/engine/fixtures';
import {buildProfile} from '@/lib/scoring/v2';
import {buildAnonymousScore} from '@/lib/scores/anonymous-score';
import type {AssessmentLead} from './assessment-lead';
import {submitAssessment, type AssessmentSubmission} from './submit-assessment';

const provider = makeFixtureProvider();
const input: SessionInput = {age: 9, seed: 'gold', calibrationBaselineMs: 400};
const profile = buildProfile(runSession(input, provider, alwaysCorrect()));

const anonymous = buildAnonymousScore(profile, {
  city: 'aerodrom',
  gender: 'female',
  language: 'mk'
});

const lead: AssessmentLead = {
  parentFirstName: 'Marija',
  email: 'parent@example.com',
  phone: '+389 70 123 456',
  city: 'aerodrom',
  childAge: 9,
  childGender: 'female',
  locale: 'mk',
  consentProcess: true,
  consentGuardian: true,
  marketingOptIn: true,
  topIndex: profile.features.highestIndex
};

function submission(overrides: Partial<AssessmentSubmission> = {}): AssessmentSubmission {
  return {lead, anonymous, honeypot: '', ...overrides};
}

beforeEach(() => {
  upsertAssessmentLeadMock.mockReset().mockResolvedValue(undefined);
  insertAnonymousScoreMock.mockReset().mockResolvedValue(undefined);
  capi.sendMock.mockReset().mockResolvedValue({status: 'sent'});
  capi.cookieValue = undefined;
  capi.headerEntries = {};
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('submitAssessment — control flow', () => {
  it('writes BOTH stores and returns ok on a real submit', async () => {
    const res = await submitAssessment(submission());
    expect(res).toEqual({ok: true});
    expect(upsertAssessmentLeadMock).toHaveBeenCalledTimes(1);
    expect(insertAnonymousScoreMock).toHaveBeenCalledTimes(1);
  });

  it('a filled honeypot writes NOTHING (bots never reach either store)', async () => {
    const res = await submitAssessment(submission({honeypot: 'i-am-a-bot'}));
    expect(res).toEqual({ok: true});
    expect(upsertAssessmentLeadMock).not.toHaveBeenCalled();
    expect(insertAnonymousScoreMock).not.toHaveBeenCalled();
  });

  it('is NON-TRAPPING: returns ok even when the Brevo write fails', async () => {
    upsertAssessmentLeadMock.mockRejectedValueOnce(new Error('brevo down'));
    const res = await submitAssessment(submission());
    expect(res).toEqual({ok: true});
  });

  it('still reveals (ok) even when the Store A write fails', async () => {
    insertAnonymousScoreMock.mockRejectedValueOnce(new Error('db down'));
    const res = await submitAssessment(submission());
    expect(res).toEqual({ok: true});
  });
});

describe('unlinkability — the load-bearing guarantee', () => {
  it('each store gets its OWN payload (the two are passed independently)', async () => {
    await submitAssessment(submission());
    const sentLead = upsertAssessmentLeadMock.mock.calls[0][0];
    const sentScore = insertAnonymousScoreMock.mock.calls[0][0];
    expect(sentScore).toBe(anonymous);
    expect(sentLead).not.toBe(sentScore);
  });

  it('the anonymous payload carries NO PII (no email / name / phone)', async () => {
    await submitAssessment(submission());
    const sentScore = insertAnonymousScoreMock.mock.calls[0][0] as Record<string, unknown>;
    const json = JSON.stringify(sentScore);
    expect(json).not.toContain('parent@example.com');
    expect(json).not.toContain('Marija');
    expect(json).not.toContain('389 70');
    for (const k of ['email', 'parentFirstName', 'phone', 'name']) {
      expect(k in sentScore).toBe(false);
    }
  });

  it('the two payloads share NO unique join key (no id / correlation token)', async () => {
    await submitAssessment(submission());
    const sentLead = upsertAssessmentLeadMock.mock.calls[0][0] as Record<string, unknown>;
    const sentScore = insertAnonymousScoreMock.mock.calls[0][0] as Record<string, unknown>;
    // Neither side carries an id, a timestamp, or any shared correlation token.
    for (const k of ['id', 'created_at', 'createdAt', 'submittedAt', 'correlationId', 'sessionId']) {
      expect(k in sentLead, `lead.${k}`).toBe(false);
      expect(k in sentScore, `score.${k}`).toBe(false);
    }
    // The only overlapping keys are coarse demographic buckets — never unique ids.
    const leadKeys = new Set(Object.keys(sentLead));
    const shared = Object.keys(sentScore).filter((k) => leadKeys.has(k));
    expect(shared.sort()).toEqual(['city']); // city bucket only (gender names differ; locale vs language)
  });

  it('re-validates the lead server-side (a tampered lead is rejected, not written)', async () => {
    // consentProcess flipped false → schema parse throws BEFORE the write.
    await expect(
      submitAssessment(submission({lead: {...lead, consentProcess: false as never}}))
    ).rejects.toThrow();
    expect(upsertAssessmentLeadMock).not.toHaveBeenCalled();
  });
});

describe('SEAM (3.12) — Meta CAPI Lead gating', () => {
  it('fires CAPI when meta is provided AND Marketing consent is granted (server cookie)', async () => {
    capi.cookieValue = consentCookie(true);
    capi.headerEntries = {'x-forwarded-for': '203.0.113.5, 10.0.0.1', 'user-agent': 'UA-test'};

    await submitAssessment(submission({meta: metaReq}));

    expect(capi.sendMock).toHaveBeenCalledTimes(1);
    const sent = capi.sendMock.mock.calls[0][0] as Record<string, unknown>;
    // Reads ONLY the lead fields (Store B inputs) + the transient match data.
    expect(sent.email).toBe(lead.email);
    expect(sent.phone).toBe(lead.phone);
    expect(sent.city).toBe('Skopje – Aerodrom'); // the centre's English city label
    expect(sent.eventId).toBe('evt-dedup-1'); // the dedup id, unchanged
    expect(sent.fbp).toBe('fb.1.1.aaa');
    expect(sent.fbc).toBe('fb.1.1.bbb');
    // The proxy headers are read for match quality (first XFF hop).
    expect(sent.clientIpAddress).toBe('203.0.113.5');
    expect(sent.clientUserAgent).toBe('UA-test');
  });

  it('does NOT fire CAPI when Marketing consent is not granted (server-read)', async () => {
    capi.cookieValue = consentCookie(false);
    await submitAssessment(submission({meta: metaReq}));
    expect(capi.sendMock).not.toHaveBeenCalled();
  });

  it('does NOT fire CAPI when there is no consent cookie at all', async () => {
    capi.cookieValue = undefined;
    await submitAssessment(submission({meta: metaReq}));
    expect(capi.sendMock).not.toHaveBeenCalled();
  });

  it('does NOT fire CAPI when the client supplies no meta (back-compat)', async () => {
    capi.cookieValue = consentCookie(true);
    await submitAssessment(submission()); // no meta
    expect(capi.sendMock).not.toHaveBeenCalled();
  });

  it('passes NO cognitive data and NO Store A score to CAPI', async () => {
    capi.cookieValue = consentCookie(true);
    await submitAssessment(submission({meta: metaReq}));

    const sent = capi.sendMock.mock.calls[0][0] as Record<string, unknown>;
    const json = JSON.stringify(sent).toLowerCase();
    for (const forbidden of [
      'band',
      'score',
      'index',
      'signal',
      'logical',
      'spatial',
      'anonymous'
    ]) {
      expect(json, `CAPI payload leaked "${forbidden}"`).not.toContain(forbidden);
    }
    // The anonymous score object is never handed to CAPI.
    expect(sent).not.toHaveProperty('anonymous');
  });

  it('a failing CAPI call NEVER breaks the submit (still ok)', async () => {
    capi.cookieValue = consentCookie(true);
    capi.sendMock.mockRejectedValueOnce(new Error('meta down'));
    const res = await submitAssessment(submission({meta: metaReq}));
    expect(res).toEqual({ok: true});
    // The two stores still ran.
    expect(upsertAssessmentLeadMock).toHaveBeenCalledTimes(1);
    expect(insertAnonymousScoreMock).toHaveBeenCalledTimes(1);
  });
});
