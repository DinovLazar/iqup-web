/**
 * TDD spec for the internal new-lead notification ORCHESTRATOR (Phase 2.02, Track B).
 *
 * Mirrors `send-results-email.test.ts`: the Brevo transport is mocked so this test
 * verifies ONLY the orchestration — the no-key / no-recipients / no-sender skips,
 * the Brevo payload shape (recipients fanned out, sender override precedence, tags),
 * and that the whole thing NEVER throws (the lead save + the parent redirect must be
 * isolated from this side-effect). The content builder + recipient parser are the
 * real (pure) modules.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

const sendTransactionalEmailMock = vi.fn();
vi.mock('./brevo', () => ({
  sendTransactionalEmail: (...args: unknown[]) =>
    sendTransactionalEmailMock(...args),
  BrevoError: class BrevoError extends Error {}
}));

import type {SavedLead} from './lead-summary';
import {buildLeadNotificationContent} from './lead-notification';
import {sendLeadNotification} from './send-lead-notification';

const sampleLead: SavedLead = {
  email: 'parent@example.com',
  childFirstName: 'Maya',
  childAge: 7,
  band: 'band-b', // → bandKey '6-9'
  locale: 'en',
  marketingOptIn: true,
  consentVersion: 'v1-draft-2026-06',
  top1: 'pattern',
  top2: 'spatial',
  top3: 'numeracy',
  scores: {pattern: 1, spatial: 0.8, numeracy: 0.6, logic: 0.4, memory: 0.2, words_obs: 0},
  savedAt: '2026-06-16T10:00:00.000Z'
};

beforeEach(() => {
  sendTransactionalEmailMock.mockReset();
  sendTransactionalEmailMock.mockResolvedValue({messageId: 'm-1'});
  vi.stubEnv('BREVO_API_KEY', 'secret-key');
  vi.stubEnv('LEAD_NOTIFY_TO', 'a@iqup.test, b@iqup.test');
  vi.stubEnv('LEAD_NOTIFY_FROM', '');
  vi.stubEnv('EMAIL_FROM_ADDRESS', 'from@iqup.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sendLeadNotification — graceful degradation', () => {
  it('no-ops (no send) when BREVO_API_KEY is unset', async () => {
    vi.stubEnv('BREVO_API_KEY', '');
    await expect(sendLeadNotification(sampleLead)).resolves.toBeUndefined();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });

  it('no-ops (no send) when LEAD_NOTIFY_TO is empty', async () => {
    vi.stubEnv('LEAD_NOTIFY_TO', '   ,  ,');
    await expect(sendLeadNotification(sampleLead)).resolves.toBeUndefined();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });

  it('no-ops (no send) when LEAD_NOTIFY_TO is unset', async () => {
    vi.stubEnv('LEAD_NOTIFY_TO', '');
    await expect(sendLeadNotification(sampleLead)).resolves.toBeUndefined();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });

  it('no-ops (no send) when both LEAD_NOTIFY_FROM and EMAIL_FROM_ADDRESS are unset', async () => {
    vi.stubEnv('LEAD_NOTIFY_FROM', '');
    vi.stubEnv('EMAIL_FROM_ADDRESS', '');
    await expect(sendLeadNotification(sampleLead)).resolves.toBeUndefined();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });

  it('never throws even if Brevo rejects', async () => {
    sendTransactionalEmailMock.mockRejectedValueOnce(new Error('brevo 500'));
    await expect(sendLeadNotification(sampleLead)).resolves.toBeUndefined();
  });
});

describe('sendLeadNotification — the send', () => {
  it('fans the recipients out and sends the built content with the api key + tags', async () => {
    await sendLeadNotification(sampleLead);
    expect(sendTransactionalEmailMock).toHaveBeenCalledTimes(1);
    const [payload, apiKey] = sendTransactionalEmailMock.mock.calls[0];

    expect(apiKey).toBe('secret-key');
    expect(payload.sender).toEqual({
      email: 'from@iqup.test',
      name: 'IqUp Lead Alerts'
    });
    expect(payload.to).toEqual([
      {email: 'a@iqup.test'},
      {email: 'b@iqup.test'}
    ]);
    expect(payload.tags).toEqual(['lead-notification', '6-9', 'en']);

    const built = buildLeadNotificationContent(sampleLead);
    expect(payload.subject).toBe(built.subject);
    expect(payload.htmlContent).toBe(built.html);
    expect(payload.textContent).toBe(built.text);
  });

  it('LEAD_NOTIFY_FROM overrides EMAIL_FROM_ADDRESS when both are set', async () => {
    vi.stubEnv('LEAD_NOTIFY_FROM', 'alerts@iqup.test');
    await sendLeadNotification(sampleLead);
    const [payload] = sendTransactionalEmailMock.mock.calls[0];
    expect(payload.sender.email).toBe('alerts@iqup.test');
  });
});
