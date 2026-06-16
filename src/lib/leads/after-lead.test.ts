/**
 * TDD spec for the after-lead side-effect fan-out (Phase 2.02).
 *
 * `runAfterLead` is the single `after()` callback the submit action schedules once
 * a lead has saved. It fans out THREE fully-isolated side-effects — the results
 * email (2.01), the Brevo contact upsert (2.02), and the internal new-lead
 * notification (2.02). The three collaborators are mocked here so this verifies
 * ONLY the orchestration: all three are invoked, each with the right argument, and
 * — critically — one failing (async OR synchronous) never stops the others and
 * never propagates out of `runAfterLead`.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

const sendResultsEmailMock = vi.fn();
const upsertLeadContactMock = vi.fn();
const sendLeadNotificationMock = vi.fn();
vi.mock('@/lib/email/send-results-email', () => ({
  sendResultsEmail: (p: unknown) => sendResultsEmailMock(p)
}));
vi.mock('@/lib/email/upsert-lead-contact', () => ({
  upsertLeadContact: (p: unknown) => upsertLeadContactMock(p)
}));
vi.mock('@/lib/email/send-lead-notification', () => ({
  sendLeadNotification: (p: unknown) => sendLeadNotificationMock(p)
}));

import type {SavedLead} from '@/lib/email/lead-summary';
import {runAfterLead} from './after-lead';

const lead: SavedLead = {
  email: 'parent@example.com',
  childFirstName: 'Maya',
  childAge: 7,
  band: 'band-b',
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
  sendResultsEmailMock.mockReset().mockResolvedValue(undefined);
  upsertLeadContactMock.mockReset().mockResolvedValue(undefined);
  sendLeadNotificationMock.mockReset().mockResolvedValue(undefined);
  // The isolate wrapper logs any unexpected throw via console.error — silence it.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('runAfterLead — fan-out', () => {
  it('schedules all three side-effects', async () => {
    await runAfterLead(lead);
    expect(sendResultsEmailMock).toHaveBeenCalledTimes(1);
    expect(upsertLeadContactMock).toHaveBeenCalledTimes(1);
    expect(sendLeadNotificationMock).toHaveBeenCalledTimes(1);
  });

  it('feeds the results email only its SendResultsEmailParams subset', async () => {
    await runAfterLead(lead);
    expect(sendResultsEmailMock).toHaveBeenCalledWith({
      email: lead.email,
      childFirstName: lead.childFirstName,
      band: lead.band,
      locale: lead.locale,
      scores: lead.scores
    });
  });

  it('passes the whole SavedLead to the contact upsert + the notification', async () => {
    await runAfterLead(lead);
    expect(upsertLeadContactMock).toHaveBeenCalledWith(lead);
    expect(sendLeadNotificationMock).toHaveBeenCalledWith(lead);
  });
});

describe('runAfterLead — isolation (never propagates, never blocks siblings)', () => {
  it('a failing contact upsert leaves the email + notification intact', async () => {
    upsertLeadContactMock.mockRejectedValueOnce(new Error('brevo contacts 500'));
    await expect(runAfterLead(lead)).resolves.toBeUndefined();
    expect(sendResultsEmailMock).toHaveBeenCalledTimes(1);
    expect(sendLeadNotificationMock).toHaveBeenCalledTimes(1);
  });

  it('a failing notification leaves the email + upsert intact', async () => {
    sendLeadNotificationMock.mockRejectedValueOnce(new Error('brevo 500'));
    await expect(runAfterLead(lead)).resolves.toBeUndefined();
    expect(sendResultsEmailMock).toHaveBeenCalledTimes(1);
    expect(upsertLeadContactMock).toHaveBeenCalledTimes(1);
  });

  it('a failing results email leaves the upsert + notification intact', async () => {
    sendResultsEmailMock.mockRejectedValueOnce(new Error('email boom'));
    await expect(runAfterLead(lead)).resolves.toBeUndefined();
    expect(upsertLeadContactMock).toHaveBeenCalledTimes(1);
    expect(sendLeadNotificationMock).toHaveBeenCalledTimes(1);
  });

  it('a SYNCHRONOUS throw in one side-effect still lets the others run', async () => {
    upsertLeadContactMock.mockImplementationOnce(() => {
      throw new Error('sync boom');
    });
    await expect(runAfterLead(lead)).resolves.toBeUndefined();
    expect(sendResultsEmailMock).toHaveBeenCalledTimes(1);
    expect(sendLeadNotificationMock).toHaveBeenCalledTimes(1);
  });
});
