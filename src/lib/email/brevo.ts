import 'server-only';

/**
 * Thin, typed Brevo transactional-email client (Phase 2.01).
 *
 * Deliberately NOT the Brevo SDK: a single `fetch` POST to the transactional REST
 * endpoint is lighter, has no dependency surface, and is fully testable by mocking
 * `fetch`. The caller (the results-email orchestrator) reads the API key from the
 * server-only env and passes it in; this module never reads env itself, so it stays
 * a pure transport. A non-2xx response throws a typed `BrevoError`, which the
 * orchestrator's try/catch logs and swallows — a send failure must never surface.
 *
 * This is a CRM-free, automation-free transactional send (decision: 2.02 owns lead
 * routing / lists / Brevo automations — this is an explicit send from our server).
 */

/** Brevo's transactional email endpoint. */
export const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/** A file attachment, base64-encoded (Brevo's `attachment[].content` shape). */
export interface BrevoAttachment {
  /** Base64-encoded file content. */
  readonly content: string;
  /** File name shown in the inbox (e.g. `certificate.png`). */
  readonly name: string;
}

export interface BrevoContact {
  readonly email: string;
  readonly name?: string;
}

/** The transactional message payload (a subset of Brevo's API we use). */
export interface SendTransactionalEmailParams {
  readonly sender: BrevoContact;
  readonly to: readonly BrevoContact[];
  readonly subject: string;
  readonly htmlContent: string;
  readonly textContent: string;
  readonly attachment?: readonly BrevoAttachment[];
  readonly replyTo?: BrevoContact;
  /** Free-form tags for later segmentation (e.g. `['results-email', band, locale]`). */
  readonly tags?: readonly string[];
}

/** Brevo returns a `messageId` on a successful transactional send. */
export interface SendTransactionalEmailResult {
  readonly messageId?: string;
}

/** Typed error for a non-2xx Brevo response — carries the status + raw body. */
export class BrevoError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`Brevo transactional send failed (HTTP ${status})`);
    this.name = 'BrevoError';
    this.status = status;
    this.body = body;
  }
}

/**
 * POST a transactional email to Brevo. Throws `BrevoError` on any non-2xx.
 *
 * @param params the message (sender/to/subject/html/text/attachment/replyTo/tags).
 * @param apiKey the Brevo API key (read from `BREVO_API_KEY` by the caller).
 */
export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams,
  apiKey: string
): Promise<SendTransactionalEmailResult> {
  const response = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new BrevoError(response.status, body);
  }

  return (await response.json().catch(() => ({}))) as SendTransactionalEmailResult;
}
