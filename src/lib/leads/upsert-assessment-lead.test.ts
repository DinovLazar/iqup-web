/**
 * Spec for the v2 lead-contact upsert orchestrator (Store B's writer). The Brevo
 * transport is mocked; the pure mapping is real. The guardrails asserted: the
 * no-key no-op, the consent→list boundary from env, never-throwing, and the
 * recoverable log on failure (so the primary capture is not silently lost).
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

const upsertContactMock = vi.fn();
vi.mock('@/lib/email/brevo-contacts', () => ({
  upsertContact: (...args: unknown[]) => upsertContactMock(...args)
}));

import {upsertAssessmentLead} from './upsert-assessment-lead';
import type {AssessmentLead} from './assessment-lead';

function lead(overrides: Partial<AssessmentLead> = {}): AssessmentLead {
  return {
    parentFirstName: 'Marija',
    email: 'parent@example.com',
    phone: '070123456',
    city: 'aerodrom',
    childAge: 9,
    childGender: 'male',
    locale: 'en',
    consentProcess: true,
    consentGuardian: true,
    marketingOptIn: false,
    topIndex: 'spatial',
    ...overrides
  };
}

const ENV = process.env;
beforeEach(() => {
  upsertContactMock.mockReset();
  upsertContactMock.mockResolvedValue({id: 999});
  process.env = {...ENV};
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  vi.restoreAllMocks();
});

describe('upsertAssessmentLead', () => {
  it('is a logged no-op when BREVO_API_KEY is unset', async () => {
    delete process.env.BREVO_API_KEY;
    await upsertAssessmentLead(lead());
    expect(upsertContactMock).not.toHaveBeenCalled();
  });

  it('upserts the contact when the key is set', async () => {
    process.env.BREVO_API_KEY = 'k';
    process.env.BREVO_LEADS_LIST_ID = '10';
    await upsertAssessmentLead(lead());
    expect(upsertContactMock).toHaveBeenCalledTimes(1);
    const [payload, apiKey] = upsertContactMock.mock.calls[0];
    expect(apiKey).toBe('k');
    expect(payload.email).toBe('parent@example.com');
    expect(payload.listIds).toEqual([10]);
  });

  it('adds the marketing list only when opted in', async () => {
    process.env.BREVO_API_KEY = 'k';
    process.env.BREVO_LEADS_LIST_ID = '10';
    process.env.BREVO_MARKETING_LIST_ID = '20';
    await upsertAssessmentLead(lead({marketingOptIn: true}));
    expect(upsertContactMock.mock.calls[0][0].listIds).toEqual([10, 20]);

    upsertContactMock.mockClear();
    await upsertAssessmentLead(lead({marketingOptIn: false}));
    expect(upsertContactMock.mock.calls[0][0].listIds).toEqual([10]);
  });

  it('NEVER throws on a transport failure, and logs the lead recoverably', async () => {
    process.env.BREVO_API_KEY = 'k';
    upsertContactMock.mockRejectedValueOnce(new Error('brevo down'));
    const errSpy = vi.spyOn(console, 'error');
    await expect(upsertAssessmentLead(lead())).resolves.toBeUndefined();
    // One of the error logs must be the recoverable lead dump (not silently lost).
    const logged = errSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toContain('lead-recover');
    expect(logged).toContain('parent@example.com');
  });

  it('discards the returned Brevo contact id (nothing about Brevo is persisted)', async () => {
    process.env.BREVO_API_KEY = 'k';
    const result = await upsertAssessmentLead(lead());
    // The orchestrator returns void — the {id} from upsertContact never escapes.
    expect(result).toBeUndefined();
  });
});
