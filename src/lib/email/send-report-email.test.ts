/**
 * Phase 3.10 — the report-email orchestrator's isolation + validity gate.
 *
 * Every collaborator is mocked so we can assert behaviour without IO: the send
 * NEVER throws (thrown / unconfigured Brevo, render error), is a logged no-op when
 * the key/sender is unset, gates on validity (sends `valid` + `gentle_note`, skips
 * `not_representative`), and attaches the PDF in memory (never stored).
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import type {SessionRun} from '@/lib/engine';

vi.mock('server-only', () => ({}));

const buildProfileMock = vi.fn();
vi.mock('@/lib/scoring/v2', () => ({buildProfile: (r: unknown) => buildProfileMock(r)}));

const buildReportMock = vi.fn();
vi.mock('@/lib/report', () => ({buildReport: (...a: unknown[]) => buildReportMock(...a)}));

const renderReportPdfMock = vi.fn();
vi.mock('@/lib/pdf', () => ({renderReportPdf: (...a: unknown[]) => renderReportPdfMock(...a)}));

const renderReportEmailMock = vi.fn();
vi.mock('@/emails/report-render', () => ({
  renderReportEmail: (...a: unknown[]) => renderReportEmailMock(...a)
}));

const sendTransactionalEmailMock = vi.fn();
vi.mock('./brevo', () => ({
  sendTransactionalEmail: (...a: unknown[]) => sendTransactionalEmailMock(...a)
}));

vi.mock('./site-url', () => ({
  bookingUrlFor: () => 'https://booking.example.com/trial?grad=aerodrom'
}));

import {sendReportEmail, type SendReportEmailParams} from './send-report-email';

const PDF = Buffer.from('%PDF-1.7 fake');

const params = (over: Partial<SendReportEmailParams> = {}): SendReportEmailParams => ({
  run: {} as SessionRun,
  email: 'parent@example.com',
  locale: 'mk',
  city: 'aerodrom',
  generatedAt: '2026-06-23T10:15:00.000Z',
  ...over
});

const ORIG = {key: process.env.BREVO_API_KEY, from: process.env.EMAIL_FROM_ADDRESS};

beforeEach(() => {
  buildProfileMock.mockReset().mockReturnValue({validity: {outcome: 'valid'}});
  buildReportMock.mockReset().mockReturnValue({topStrength: {name: 'Logic', body: 'Builds steps.'}});
  renderReportPdfMock.mockReset().mockResolvedValue(PDF);
  renderReportEmailMock.mockReset().mockResolvedValue({html: '<p>hi</p>', text: 'hi'});
  sendTransactionalEmailMock.mockReset().mockResolvedValue({messageId: 'm1'});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  process.env.BREVO_API_KEY = 'test-key';
  process.env.EMAIL_FROM_ADDRESS = 'noreply@iqup.test';
});

afterEach(() => {
  process.env.BREVO_API_KEY = ORIG.key;
  process.env.EMAIL_FROM_ADDRESS = ORIG.from;
  vi.restoreAllMocks();
});

describe('sendReportEmail — no-op when unconfigured', () => {
  it('is a clean no-op (no work) when BREVO_API_KEY is unset', async () => {
    delete process.env.BREVO_API_KEY;
    await expect(sendReportEmail(params())).resolves.toBeUndefined();
    expect(buildProfileMock).not.toHaveBeenCalled();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });

  it('is a no-op when the sender address is unset', async () => {
    delete process.env.EMAIL_FROM_ADDRESS;
    await sendReportEmail(params());
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });
});

describe('sendReportEmail — validity gate', () => {
  it('sends for a valid run', async () => {
    await sendReportEmail(params());
    expect(sendTransactionalEmailMock).toHaveBeenCalledTimes(1);
  });

  it('sends for a gentle_note run', async () => {
    buildProfileMock.mockReturnValue({validity: {outcome: 'gentle_note'}});
    await sendReportEmail(params());
    expect(sendTransactionalEmailMock).toHaveBeenCalledTimes(1);
  });

  it('SKIPS (no send) a not_representative run, and never assembles it', async () => {
    buildProfileMock.mockReturnValue({validity: {outcome: 'not_representative'}});
    await sendReportEmail(params());
    expect(buildReportMock).not.toHaveBeenCalled();
    expect(renderReportPdfMock).not.toHaveBeenCalled();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });
});

describe('sendReportEmail — attaches the PDF in memory + tags the send', () => {
  it('attaches the base64 PDF and tags [report-email, locale]', async () => {
    await sendReportEmail(params({locale: 'en'}));
    const [payload] = sendTransactionalEmailMock.mock.calls[0];
    expect(payload.attachment[0].content).toBe(PDF.toString('base64'));
    expect(payload.attachment[0].name).toMatch(/\.pdf$/);
    expect(payload.to).toEqual([{email: 'parent@example.com'}]);
    expect(payload.tags).toEqual(['report-email', 'en']);
  });
});

describe('sendReportEmail — never throws', () => {
  it('swallows a thrown Brevo send', async () => {
    sendTransactionalEmailMock.mockRejectedValueOnce(new Error('brevo down'));
    await expect(sendReportEmail(params())).resolves.toBeUndefined();
  });

  it('swallows a slow-then-failing Brevo send', async () => {
    sendTransactionalEmailMock.mockImplementationOnce(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5))
    );
    await expect(sendReportEmail(params())).resolves.toBeUndefined();
  });

  it('swallows a PDF render error', async () => {
    renderReportPdfMock.mockRejectedValueOnce(new Error('render boom'));
    await expect(sendReportEmail(params())).resolves.toBeUndefined();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });
});
