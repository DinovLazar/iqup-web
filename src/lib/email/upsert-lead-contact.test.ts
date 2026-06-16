/**
 * TDD spec for the contact-upsert orchestrator (Phase 2.02, Track A).
 *
 * Mirrors `send-results-email.test.ts`: the IO transport (`brevo-contacts`) is
 * mocked to capture the `upsertContact` calls, but the PURE `contact-mapping` is
 * the real module (so the consent gate it enforces is exercised end-to-end). The
 * orchestrator reads list ids from env and — critically — must NEVER throw (lead
 * capture + the parent's redirect are isolated from this side-effect). The two
 * guardrails asserted here: the no-key skip, and the marketing consent boundary.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

const upsertContactMock = vi.fn();
vi.mock('./brevo-contacts', () => ({
  upsertContact: (...args: unknown[]) => upsertContactMock(...args),
  BrevoContactsError: class BrevoContactsError extends Error {}
}));

import type {SavedLead} from './lead-summary';
import {upsertLeadContact} from './upsert-lead-contact';

function lead(overrides: Partial<SavedLead> = {}): SavedLead {
  return {
    email: 'parent@example.com',
    childFirstName: 'Maya',
    childAge: 7,
    band: 'band-b',
    locale: 'en',
    marketingOptIn: false,
    consentVersion: 'v1-draft-2026-06',
    top1: 'pattern',
    top2: 'spatial',
    top3: 'numeracy',
    scores: {pattern: 1, spatial: 0.8, numeracy: 0.6, logic: 0.4, memory: 0.2, words_obs: 0},
    savedAt: '2026-06-16T10:00:00.000Z',
    ...overrides
  };
}

beforeEach(() => {
  upsertContactMock.mockReset();
  upsertContactMock.mockResolvedValue({id: 1});
  vi.stubEnv('BREVO_API_KEY', 'secret-key');
  vi.stubEnv('BREVO_LEADS_LIST_ID', '10');
  vi.stubEnv('BREVO_MARKETING_LIST_ID', '20');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('upsertLeadContact — graceful degradation', () => {
  it('no-ops (no upsert) when BREVO_API_KEY is unset', async () => {
    vi.stubEnv('BREVO_API_KEY', '');
    await expect(upsertLeadContact(lead())).resolves.toBeUndefined();
    expect(upsertContactMock).not.toHaveBeenCalled();
  });

  it('never throws even when upsertContact rejects', async () => {
    upsertContactMock.mockRejectedValueOnce(new Error('brevo 500'));
    await expect(upsertLeadContact(lead())).resolves.toBeUndefined();
  });
});

describe('upsertLeadContact — the upsert', () => {
  it('upserts an opt-in lead onto BOTH lists with UPPERCASE attributes', async () => {
    await upsertLeadContact(lead({marketingOptIn: true}));
    expect(upsertContactMock).toHaveBeenCalledTimes(1);
    const [payload, apiKey] = upsertContactMock.mock.calls[0];
    expect(apiKey).toBe('secret-key');
    expect(payload.email).toBe('parent@example.com');
    expect(payload.updateEnabled).toBe(true);
    expect(payload.attributes.CHILD_FIRST_NAME).toBe('Maya');
    expect(payload.attributes.CHILD_AGE).toBe(7);
    expect(payload.listIds).toContain(10);
    expect(payload.listIds).toContain(20);
  });

  it('keeps a non-opt-in lead OFF the marketing list (consent gate)', async () => {
    await upsertLeadContact(lead({marketingOptIn: false}));
    const [payload] = upsertContactMock.mock.calls[0];
    expect(payload.listIds).toContain(10);
    expect(payload.listIds).not.toContain(20);
  });

  it('excludes an invalid leads list id but STILL runs the upsert', async () => {
    vi.stubEnv('BREVO_LEADS_LIST_ID', 'abc');
    await upsertLeadContact(lead({marketingOptIn: true}));
    expect(upsertContactMock).toHaveBeenCalledTimes(1);
    const [payload] = upsertContactMock.mock.calls[0];
    expect(payload.listIds).not.toContain(10);
    // the valid marketing id still applies (opt-in)
    expect(payload.listIds).toContain(20);
  });

  it('runs the upsert even when both list ids are unset (contact still created)', async () => {
    vi.stubEnv('BREVO_LEADS_LIST_ID', '');
    vi.stubEnv('BREVO_MARKETING_LIST_ID', '');
    await upsertLeadContact(lead({marketingOptIn: true}));
    expect(upsertContactMock).toHaveBeenCalledTimes(1);
    const [payload] = upsertContactMock.mock.calls[0];
    expect(payload.listIds).toEqual([]);
    expect(payload.attributes.CHILD_FIRST_NAME).toBe('Maya');
  });
});
