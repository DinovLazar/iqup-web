/**
 * TDD spec for the internal new-lead notification BODY (Phase 2.02, Track B).
 *
 * Pure module (no `server-only`): this exercises the string helpers and the
 * content builder. The notification is an internal ops alert to IqUp (the data
 * controller) about their own lead, so — unlike the parent-facing results email
 * — it MAY carry the parent email + child first name for follow-up. It is still
 * a strengths-honest product, so the visible body must carry NO score / IQ / % /
 * rank / number anywhere: the only legitimate digit-bearing values are the parent
 * email, the consent version, and the timestamp, which this test MASKS before the
 * no-digit guardrail runs (mirroring how `ResultsEmail.test.ts` masks URLs/emails
 * before its no-number guard). The child age is rendered as a worded label so it
 * is not a stray digit.
 */
import {describe, it, expect} from 'vitest';

import type {SavedLead} from './lead-summary';
import {bandLabelFor} from './lead-summary';
import {
  ageInWords,
  buildLeadNotificationContent,
  localeLabel,
  parseNotifyRecipients
} from './lead-notification';

const sampleLead: SavedLead = {
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

/** Forbidden score vocabulary — copied verbatim from `ResultsEmail.test.ts`. */
const FORBIDDEN_WORD =
  /\b(score|scores|iq|rank|ranking|ranked|percent|percentile|points?|grade|weak|weaker|weakness|fail|failed|below average)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен)/i;

/** Strip HTML tags so attribute/style values can't trip the visible-text guard. */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ');
}

/**
 * Mask the three legitimate digit-bearing values (parent email, consent version,
 * timestamp) out of a string before the no-digit / no-score guard runs.
 */
function maskLegit(value: string, lead: SavedLead): string {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, ' ')
    .split(lead.consentVersion)
    .join(' ')
    .split(new Date(lead.savedAt).toUTCString())
    .join(' ');
}

function assertClean(label: string, value: string): void {
  expect(/\d/.test(value), `${label} contains a digit: "${value}"`).toBe(false);
  expect(value.includes('%'), `${label} contains "%": "${value}"`).toBe(false);
  expect(FORBIDDEN_WORD.test(value), `${label} forbidden word: "${value}"`).toBe(
    false
  );
  expect(FORBIDDEN_MK.test(value), `${label} forbidden MK word: "${value}"`).toBe(
    false
  );
}

describe('parseNotifyRecipients', () => {
  it('parses a single address', () => {
    expect(parseNotifyRecipients('ops@iqup.test')).toEqual(['ops@iqup.test']);
  });

  it('splits a comma-separated list, trimming spaces', () => {
    expect(parseNotifyRecipients('a@x.com, b@y.com')).toEqual([
      'a@x.com',
      'b@y.com'
    ]);
  });

  it('drops empty entries', () => {
    expect(parseNotifyRecipients('a@x.com,,  , b@y.com,')).toEqual([
      'a@x.com',
      'b@y.com'
    ]);
  });

  it('returns [] for undefined / null / empty', () => {
    expect(parseNotifyRecipients(undefined)).toEqual([]);
    expect(parseNotifyRecipients(null)).toEqual([]);
    expect(parseNotifyRecipients('')).toEqual([]);
    expect(parseNotifyRecipients('   ')).toEqual([]);
  });
});

describe('ageInWords', () => {
  it('words the validated 3–13 range', () => {
    expect(ageInWords(3)).toBe('three');
    expect(ageInWords(7)).toBe('seven');
    expect(ageInWords(13)).toBe('thirteen');
  });

  it('words the 0–2 safety range with no stray digit', () => {
    for (const age of [0, 1, 2]) {
      expect(/\d/.test(ageInWords(age))).toBe(false);
    }
  });
});

describe('localeLabel', () => {
  it('maps locale codes to language names', () => {
    expect(localeLabel('mk')).toBe('Macedonian');
    expect(localeLabel('en')).toBe('English');
  });
});

describe('buildLeadNotificationContent', () => {
  const content = buildLeadNotificationContent(sampleLead);
  const timestamp = new Date(sampleLead.savedAt).toUTCString();

  it('subject carries the child name + the digit-free band label', () => {
    expect(content.subject).toContain(sampleLead.childFirstName);
    expect(content.subject).toContain(bandLabelFor(sampleLead.band));
    expect(/\d/.test(content.subject)).toBe(false);
  });

  for (const [channel, body] of [
    ['text', content.text],
    ['html', content.html]
  ] as const) {
    it(`${channel} carries every required field`, () => {
      expect(body).toContain(sampleLead.childFirstName);
      expect(body).toContain(sampleLead.email);
      expect(body).toContain(ageInWords(sampleLead.childAge));
      expect(body).toContain(bandLabelFor(sampleLead.band));
      expect(body).toContain(localeLabel(sampleLead.locale));
      expect(body).toContain('Yes'); // marketing opt-in true
      expect(body).toContain(sampleLead.consentVersion);
      expect(body).toContain(timestamp);
      expect(body).toContain(
        "The parent has already received their child's strengths profile and certificate by email."
      );
    });
  }

  it("renders marketing opt-in as 'No' when false", () => {
    const c = buildLeadNotificationContent({...sampleLead, marketingOptIn: false});
    expect(c.text).toContain('No');
    expect(stripTags(c.html)).toContain('No');
  });

  it('text stays clean once the legitimate digit-bearing values are masked', () => {
    assertClean('notification text', maskLegit(content.text, sampleLead));
  });

  it('html (tags stripped) stays clean once the legitimate values are masked', () => {
    assertClean(
      'notification html',
      maskLegit(stripTags(content.html), sampleLead)
    );
  });
});
