/**
 * TDD spec for the thin Brevo transactional-email client.
 *
 * The client is `server-only`, so we stub that import, and we mock `fetch` to
 * assert the exact request shape (endpoint, `api-key` header, JSON body with the
 * attachment) without touching the network. A non-2xx response must throw a typed
 * `BrevoError` (the orchestrator's try/catch logs + swallows it).
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

import {
  sendTransactionalEmail,
  BrevoError,
  BREVO_ENDPOINT,
  type SendTransactionalEmailParams
} from './brevo';

const sampleParams: SendTransactionalEmailParams = {
  sender: {email: 'hello@iqup.test', name: 'IqUp'},
  to: [{email: 'parent@example.com'}],
  subject: 'Маја is great',
  htmlContent: '<p>hi</p>',
  textContent: 'hi',
  attachment: [{content: 'YmFzZTY0', name: 'certificate.png'}],
  replyTo: {email: 'reply@iqup.test'},
  tags: ['results-email', '6-9', 'mk']
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function okResponse(body: unknown = {messageId: '<abc@brevo>'}): Response {
  return new Response(JSON.stringify(body), {
    status: 201,
    headers: {'content-type': 'application/json'}
  });
}

describe('sendTransactionalEmail', () => {
  it('POSTs to the Brevo transactional endpoint with the api-key header', async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    await sendTransactionalEmail(sampleParams, 'secret-key');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(BREVO_ENDPOINT);
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(init.method).toBe('POST');
    expect(init.headers['api-key']).toBe('secret-key');
    expect(init.headers['content-type']).toBe('application/json');
  });

  it('serializes the full message + attachment in the JSON body', async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    await sendTransactionalEmail(sampleParams, 'secret-key');

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.sender).toEqual({email: 'hello@iqup.test', name: 'IqUp'});
    expect(body.to).toEqual([{email: 'parent@example.com'}]);
    expect(body.subject).toBe('Маја is great');
    expect(body.htmlContent).toBe('<p>hi</p>');
    expect(body.textContent).toBe('hi');
    expect(body.attachment).toEqual([
      {content: 'YmFzZTY0', name: 'certificate.png'}
    ]);
    expect(body.replyTo).toEqual({email: 'reply@iqup.test'});
    expect(body.tags).toEqual(['results-email', '6-9', 'mk']);
  });

  it('returns the parsed body on a 2xx response', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({messageId: '<id@brevo>'}));
    const result = await sendTransactionalEmail(sampleParams, 'k');
    expect(result.messageId).toBe('<id@brevo>');
  });

  it('throws a typed BrevoError carrying the status + body on a non-2xx', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"message":"unauthorized"}', {status: 401})
    );
    await expect(sendTransactionalEmail(sampleParams, 'bad')).rejects.toBeInstanceOf(
      BrevoError
    );

    fetchMock.mockResolvedValueOnce(
      new Response('{"message":"unauthorized"}', {status: 401})
    );
    const err = await sendTransactionalEmail(sampleParams, 'bad').catch((e) => e);
    expect(err).toBeInstanceOf(BrevoError);
    expect(err.status).toBe(401);
    expect(err.body).toContain('unauthorized');
  });
});
