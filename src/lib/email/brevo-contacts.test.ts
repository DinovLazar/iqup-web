/**
 * TDD spec for the thin Brevo Contacts client (Phase 2.02, Track A).
 *
 * Parallels `brevo.test.ts`: the client is `server-only`, so we stub that import,
 * and we mock `fetch` to assert the exact request shape (endpoint, `api-key`
 * header, JSON body) without touching the network. Brevo's contacts endpoint
 * returns `201 {id}` on create and `204 No Content` on update — both must resolve
 * cleanly (no JSON parse crash). A non-2xx response must throw a typed
 * `BrevoContactsError` (the orchestrator's try/catch logs + swallows it).
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

vi.mock('server-only', () => ({}));

import {
  upsertContact,
  BrevoContactsError,
  BREVO_CONTACTS_ENDPOINT,
  type BrevoContactAttributeValue,
  type UpsertContactParams
} from './brevo-contacts';

/** A representative attributes object — exactly the keys the mapping emits. */
const sampleAttributes: Record<string, BrevoContactAttributeValue> = {
  CHILD_FIRST_NAME: 'Maya',
  CHILD_AGE: 7,
  BAND: 'Ages six to nine',
  LOCALE: 'en',
  MARKETING_OPT_IN: true,
  CONSENT_VERSION: 'v1-draft-2026-06',
  TOP_STRENGTHS: 'Pattern Spotting, Shapes & Space',
  SOURCE: 'website-quiz'
};

const sampleParams: UpsertContactParams = {
  email: 'parent@example.com',
  attributes: sampleAttributes,
  listIds: [10, 20],
  updateEnabled: true
};

/** Same guardrail regexes as `src/emails/ResultsEmail.test.ts`. */
const FORBIDDEN_WORD =
  /\b(score|scores|iq|rank|ranking|ranked|percent|percentile|points?|grade|weak|weaker|weakness|fail|failed|below average)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен)/i;

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function createdResponse(body: unknown = {id: 4242}): Response {
  return new Response(JSON.stringify(body), {
    status: 201,
    headers: {'content-type': 'application/json'}
  });
}

function updatedResponse(): Response {
  // Brevo returns 204 No Content on update (updateEnabled).
  return new Response(null, {status: 204});
}

describe('upsertContact', () => {
  it('POSTs to the Brevo contacts endpoint with the api-key header', async () => {
    fetchMock.mockResolvedValueOnce(createdResponse());
    await upsertContact(sampleParams, 'secret-key');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(BREVO_CONTACTS_ENDPOINT);
    expect(url).toBe('https://api.brevo.com/v3/contacts');
    expect(init.method).toBe('POST');
    expect(init.headers['api-key']).toBe('secret-key');
    expect(init.headers['content-type']).toBe('application/json');
  });

  it('serializes email, UPPERCASE attributes, listIds and updateEnabled in the body', async () => {
    fetchMock.mockResolvedValueOnce(createdResponse());
    await upsertContact(sampleParams, 'secret-key');

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.email).toBe('parent@example.com');
    expect(body.attributes).toEqual(sampleAttributes);
    expect(body.listIds).toEqual([10, 20]);
    expect(body.listIds.every((n: number) => Number.isInteger(n))).toBe(true);
    expect(body.updateEnabled).toBe(true);
  });

  it('returns {id} on a 201 create response', async () => {
    fetchMock.mockResolvedValueOnce(createdResponse({id: 99}));
    const result = await upsertContact(sampleParams, 'k');
    expect(result.id).toBe(99);
  });

  it('resolves to {} on a 204 update response (no JSON parse crash)', async () => {
    fetchMock.mockResolvedValueOnce(updatedResponse());
    const result = await upsertContact(sampleParams, 'k');
    expect(result).toEqual({});
  });

  it('throws a typed BrevoContactsError carrying the status + body on a non-2xx', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"message":"invalid_parameter"}', {status: 400})
    );
    await expect(upsertContact(sampleParams, 'bad')).rejects.toBeInstanceOf(
      BrevoContactsError
    );

    fetchMock.mockResolvedValueOnce(
      new Response('{"message":"invalid_parameter"}', {status: 400})
    );
    const err = await upsertContact(sampleParams, 'bad').catch((e) => e);
    expect(err).toBeInstanceOf(BrevoContactsError);
    expect(err.name).toBe('BrevoContactsError');
    expect(err.status).toBe(400);
    expect(err.body).toContain('invalid_parameter');
  });

  it('carries no forbidden score vocabulary and no raw answers in its attributes', () => {
    // Guardrail: the string attribute values are honest, strengths-based text —
    // never score/IQ/rank vocabulary (EN or MK), and the key set is exactly the
    // known operational attributes (no `answers`, `scores`, `iq`, `total`).
    const stringValues = Object.values(sampleAttributes).filter(
      (v): v is string => typeof v === 'string'
    );
    for (const value of stringValues) {
      expect(FORBIDDEN_WORD.test(value), `forbidden word in "${value}"`).toBe(
        false
      );
      expect(FORBIDDEN_MK.test(value), `forbidden MK word in "${value}"`).toBe(
        false
      );
    }
    expect(Object.keys(sampleAttributes).sort()).toEqual(
      [
        'BAND',
        'CHILD_AGE',
        'CHILD_FIRST_NAME',
        'CONSENT_VERSION',
        'LOCALE',
        'MARKETING_OPT_IN',
        'SOURCE',
        'TOP_STRENGTHS'
      ].sort()
    );
  });
});
