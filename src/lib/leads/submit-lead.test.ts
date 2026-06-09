import {describe, it, expect, vi, beforeEach} from 'vitest';

import {leadSchema, topStrengthsSchema} from '@/lib/validation/lead';
import type {TestResult} from '@/lib/scoring';
import type {BandKey} from '@/lib/bands';
import {
  LEAD_BAND_BY_KEY,
  CONSENT_VERSION,
  toTopStrengths,
  buildLeadInput,
  type GateSubmission
} from './lead-mapping';

// Mock the only DB write path so no Supabase / service-role client is ever
// loaded by these unit tests (and so we can assert exactly what gets inserted).
const insertLeadMock = vi.fn();
vi.mock('./insert-lead', () => ({
  insertLead: (input: unknown) => insertLeadMock(input)
}));

// Imported after the mock is registered (vi.mock is hoisted above imports).
import {submitLead} from './submit-lead';

/** A representative computed result (NOT band-distribution-bound — synthetic). */
const sampleResult: TestResult = {
  version: 1,
  band: '6-9',
  locale: 'mk',
  strengths: [
    {code: 'logic', total: 2, hits: 2, ratio: 1, rank: 1, tier: 'celebrated'},
    {code: 'pattern', total: 2, hits: 2, ratio: 1, rank: 2, tier: 'celebrated'},
    {code: 'spatial', total: 2, hits: 1, ratio: 0.5, rank: 3, tier: 'also'},
    {code: 'numeracy', total: 2, hits: 1, ratio: 0.5, rank: 4, tier: 'growing'},
    {code: 'memory', total: 3, hits: 1, ratio: 1 / 3, rank: 5, tier: 'growing'},
    {code: 'words_obs', total: 2, hits: 0, ratio: 0, rank: 6, tier: 'growing'}
  ],
  top1: 'logic',
  top2: 'pattern',
  top3: 'spatial',
  growing: ['numeracy', 'memory', 'words_obs'],
  completedAt: '2026-06-09T10:00:00.000Z'
};

function sampleSubmission(overrides: Partial<GateSubmission> = {}): GateSubmission {
  return {
    email: 'parent@example.com',
    childFirstName: 'Ана',
    childAge: 7,
    band: LEAD_BAND_BY_KEY[sampleResult.band],
    locale: sampleResult.locale,
    topStrengths: toTopStrengths(sampleResult),
    consent: true,
    marketingOptIn: false,
    honeypot: '',
    ...overrides
  };
}

/** Tokens that must NEVER appear anywhere in a serialized lead (no score / no IQ). */
const FORBIDDEN = /"?(iq|percentile|grade|pass|fail|total|score|answers?)"?\s*:/i;

beforeEach(() => {
  insertLeadMock.mockReset();
});

describe('band mapping (TestResult key → leadSchema band)', () => {
  it('maps the three canonical band keys onto band-a/b/c (decision #38)', () => {
    const expected: Record<BandKey, string> = {
      '3-5': 'band-a',
      '6-9': 'band-b',
      '10-13': 'band-c'
    };
    expect(LEAD_BAND_BY_KEY).toEqual(expected);
  });
});

describe('toTopStrengths (summary-only projection)', () => {
  it('produces exactly {top1, top2, top3, scores} and matches topStrengthsSchema', () => {
    const summary = toTopStrengths(sampleResult);
    expect(Object.keys(summary).sort()).toEqual(['scores', 'top1', 'top2', 'top3']);
    expect(summary.top1).toBe('logic');
    expect(summary.top2).toBe('pattern');
    expect(summary.top3).toBe('spatial');
    // .strict() + number-only — would throw if a raw answer or extra key snuck in.
    expect(topStrengthsSchema.parse(summary)).toEqual(summary);
  });

  it('scores covers all six strengths with finite numbers only (no raw answers)', () => {
    const {scores} = toTopStrengths(sampleResult);
    expect(Object.keys(scores).sort()).toEqual(
      ['logic', 'memory', 'numeracy', 'pattern', 'spatial', 'words_obs'].sort()
    );
    for (const value of Object.values(scores)) {
      expect(typeof value).toBe('number');
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it('rounds per-strength ratios to two decimals', () => {
    const {scores} = toTopStrengths(sampleResult);
    expect(scores.logic).toBe(1);
    expect(scores.spatial).toBe(0.5);
    expect(scores.memory).toBe(0.33); // 1/3 → 0.33
    expect(scores.words_obs).toBe(0);
  });

  it('carries no per-question, IQ, or total field', () => {
    const json = JSON.stringify(toTopStrengths(sampleResult));
    expect(json).not.toMatch(FORBIDDEN);
  });
});

describe('buildLeadInput (snake_case LeadInput for insertLead)', () => {
  it('builds a payload that passes the real leadSchema', () => {
    const built = buildLeadInput(sampleSubmission());
    const parsed = leadSchema.safeParse(built);
    expect(parsed.success).toBe(true);
  });

  it('maps form fields to snake_case columns and stamps the consent version', () => {
    const built = buildLeadInput(sampleSubmission());
    expect(built).toMatchObject({
      email: 'parent@example.com',
      child_first_name: 'Ана',
      child_age: 7,
      band: 'band-b',
      locale: 'mk',
      consent: true,
      consent_version: CONSENT_VERSION,
      marketing_opt_in: false
    });
  });

  it('never carries the honeypot through to the lead payload', () => {
    const built = buildLeadInput(sampleSubmission({honeypot: 'i-am-a-bot'}));
    expect('honeypot' in built).toBe(false);
    expect(JSON.stringify(built)).not.toContain('i-am-a-bot');
  });

  it('carries no IQ / total / per-answer field anywhere in the serialized lead', () => {
    const json = JSON.stringify(buildLeadInput(sampleSubmission()));
    expect(json).not.toMatch(FORBIDDEN);
  });

  it('a payload with consent !== true is rejected by leadSchema', () => {
    const built = buildLeadInput(sampleSubmission({consent: false}));
    expect(leadSchema.safeParse(built).success).toBe(false);
  });

  it('preserves an opted-in marketing flag', () => {
    const built = buildLeadInput(sampleSubmission({marketingOptIn: true}));
    expect(built.marketing_opt_in).toBe(true);
  });
});

describe('leadSchema strips unknown keys (defense-in-depth, decision #29)', () => {
  it('drops any extra field that rides along with a valid lead', () => {
    const polluted = {
      ...buildLeadInput(sampleSubmission()),
      honeypot: 'x',
      answers: {q1: 'a', q2: 'b'},
      iq: 132
    };
    const parsed = leadSchema.parse(polluted);
    expect('honeypot' in parsed).toBe(false);
    expect('answers' in parsed).toBe(false);
    expect('iq' in parsed).toBe(false);
    expect(JSON.stringify(parsed)).not.toMatch(FORBIDDEN);
  });
});

describe('submitLead (server action control flow)', () => {
  it('inserts a valid lead and returns ok', async () => {
    insertLeadMock.mockResolvedValueOnce({id: 'row-1', created_at: 'now'});
    const result = await submitLead(sampleSubmission());
    expect(result).toEqual({ok: true});
    expect(insertLeadMock).toHaveBeenCalledTimes(1);
    expect(insertLeadMock).toHaveBeenCalledWith(buildLeadInput(sampleSubmission()));
  });

  it('treats a filled honeypot as spam: no insert, success-shaped return', async () => {
    const result = await submitLead(sampleSubmission({honeypot: 'gotcha'}));
    expect(result).toEqual({ok: true});
    expect(insertLeadMock).not.toHaveBeenCalled();
  });

  it('returns a friendly error (not throw) when the insert fails', async () => {
    insertLeadMock.mockRejectedValueOnce(new Error('db exploded'));
    const result = await submitLead(sampleSubmission());
    expect(result).toEqual({ok: false, error: 'generic'});
  });
});
