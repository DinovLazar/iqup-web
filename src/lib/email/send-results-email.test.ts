/**
 * TDD spec for the results-email orchestrator.
 *
 * The heavy / IO collaborators are mocked (the certificate PNG renderer, the React
 * Email renderer, and the Brevo transport) so this test verifies ONLY the
 * orchestration: the no-key skip, the deterministic pipeline wiring (scores →
 * ranking → celebrated strengths → certificate + copy), the Brevo payload shape,
 * and — critically — that the whole thing NEVER throws (lead capture must be
 * isolated from the send). The pure collaborators (`reconstructResult`,
 * `getResultCopy`, `fillSlots`, `BAND_KEY_BY_LEAD`) are the real modules.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

const sendTransactionalEmailMock = vi.fn();
vi.mock('./brevo', () => ({
  sendTransactionalEmail: (...args: unknown[]) =>
    sendTransactionalEmailMock(...args),
  BrevoError: class BrevoError extends Error {}
}));

const renderCertificatePngMock = vi.fn();
vi.mock('./certificate-image', () => ({
  renderCertificatePng: (...args: unknown[]) => renderCertificatePngMock(...args)
}));

const renderResultsEmailMock = vi.fn();
vi.mock('@/emails/render', () => ({
  renderResultsEmail: (...args: unknown[]) => renderResultsEmailMock(...args)
}));

import en from '@/messages/en.json';
import {fillSlots} from '@/content/results';
import {reconstructResult} from '@/lib/scoring';
import {sendResultsEmail} from './send-results-email';

const CERT_BYTES = Buffer.from('PNG-BYTES-HERE');
const CERT_BASE64 = CERT_BYTES.toString('base64');

/** A clear ranking: pattern > spatial > numeracy > logic > memory > words_obs. */
const SCORES: Record<string, number> = {
  pattern: 1,
  spatial: 0.8,
  numeracy: 0.6,
  logic: 0.4,
  memory: 0.2,
  words_obs: 0
};

function params(overrides: Record<string, unknown> = {}) {
  return {
    email: 'parent@example.com',
    childFirstName: 'Maya',
    band: 'band-b' as const, // → bandKey '6-9'
    locale: 'en' as const,
    scores: SCORES,
    ...overrides
  };
}

beforeEach(() => {
  sendTransactionalEmailMock.mockReset();
  renderCertificatePngMock.mockReset();
  renderResultsEmailMock.mockReset();
  renderCertificatePngMock.mockResolvedValue(CERT_BYTES);
  renderResultsEmailMock.mockResolvedValue({
    html: '<p>html</p>',
    text: 'plain text'
  });
  vi.stubEnv('BREVO_API_KEY', 'secret-key');
  vi.stubEnv('EMAIL_FROM_ADDRESS', 'hello@iqup.test');
  vi.stubEnv('EMAIL_FROM_NAME', 'IqUp');
  vi.stubEnv('EMAIL_REPLY_TO', 'reply@iqup.test');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://iqup.example');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sendResultsEmail — graceful degradation', () => {
  it('no-ops (no send, no render) when BREVO_API_KEY is unset', async () => {
    vi.stubEnv('BREVO_API_KEY', '');
    await expect(sendResultsEmail(params())).resolves.toBeUndefined();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
    expect(renderCertificatePngMock).not.toHaveBeenCalled();
  });

  it('never throws even if Brevo rejects', async () => {
    sendTransactionalEmailMock.mockRejectedValueOnce(new Error('brevo 500'));
    await expect(sendResultsEmail(params())).resolves.toBeUndefined();
  });

  it('never throws even if the certificate render fails', async () => {
    renderCertificatePngMock.mockRejectedValueOnce(new Error('satori boom'));
    await expect(sendResultsEmail(params())).resolves.toBeUndefined();
    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
  });
});

describe('sendResultsEmail — the send', () => {
  it('renders the certificate for the reconstructed celebrated strengths', async () => {
    await sendResultsEmail(params());
    expect(renderCertificatePngMock).toHaveBeenCalledTimes(1);
    const arg = renderCertificatePngMock.mock.calls[0][0];
    // reconstructed top1/top2 from SCORES are pattern, spatial
    expect(arg.celebrated).toEqual(['pattern', 'spatial']);
    expect(arg.childFirstName).toBe('Maya');
    expect(arg.locale).toBe('en');
  });

  it('passes the assembled email + attachment + tags to Brevo, with the api key', async () => {
    await sendResultsEmail(params());
    expect(sendTransactionalEmailMock).toHaveBeenCalledTimes(1);
    const [payload, apiKey] = sendTransactionalEmailMock.mock.calls[0];

    expect(apiKey).toBe('secret-key');
    expect(payload.sender).toEqual({email: 'hello@iqup.test', name: 'IqUp'});
    expect(payload.to).toEqual([{email: 'parent@example.com'}]);
    expect(payload.subject).toBe(fillSlots(en.Email.subject, {name: 'Maya'}));
    expect(payload.htmlContent).toBe('<p>html</p>');
    expect(payload.textContent).toBe('plain text');
    expect(payload.attachment).toEqual([
      {content: CERT_BASE64, name: 'certificate.png'}
    ]);
    expect(payload.replyTo).toEqual({email: 'reply@iqup.test'});
    expect(payload.tags).toEqual(['results-email', '6-9', 'en']);
  });

  it('feeds the email template the same content the result screen shows', async () => {
    await sendResultsEmail(params());
    const props = renderResultsEmailMock.mock.calls[0][0];
    const expected = reconstructResult(SCORES, '6-9', 'en');
    expect(props.bandKey).toBe('6-9');
    expect(props.childFirstName).toBe('Maya');
    // copy.celebrated codes equal the reconstructed top1/top2
    expect(props.copy.celebrated.map((c: {code: string}) => c.code)).toEqual([
      expected.top1,
      expected.top2
    ]);
    // Phase 2.05 (DELIBERATE change): the trial CTA now targets the shared public
    // booking page (`/trial`), not the locale root — one trial target everywhere.
    expect(props.trialUrl).toBe('https://iqup.example/en/trial');
  });

  it('omits replyTo when EMAIL_REPLY_TO is unset', async () => {
    vi.stubEnv('EMAIL_REPLY_TO', '');
    await sendResultsEmail(params());
    const [payload] = sendTransactionalEmailMock.mock.calls[0];
    expect(payload.replyTo).toBeUndefined();
  });

  it('uses the unprefixed booking URL for the mk locale', async () => {
    await sendResultsEmail(params({locale: 'mk', band: 'band-a'}));
    const props = renderResultsEmailMock.mock.calls[0][0];
    expect(props.trialUrl).toBe('https://iqup.example/trial');
    expect(props.bandKey).toBe('3-5');
  });
});
