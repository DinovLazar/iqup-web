/**
 * Spec for the report-form server action — the two-store write at the HANDOFF
 * (3.06) seam. Both writers are mocked so we can assert WHAT each store receives
 * and prove the unlinkability + non-trapping guarantees without any real IO. The
 * `after()` callback is run synchronously so the Store A side-effect is observable.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest';

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
