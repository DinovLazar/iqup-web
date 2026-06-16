/**
 * TDD spec for the pure SavedLead → Brevo contact payload mapping (Phase 2.02).
 *
 * Pure module (no `server-only`), so no mocks are needed. The headline guardrail
 * is the marketing consent gate: a non-opt-in lead must NEVER land on the
 * marketing list. The forbidden-token check asserts the operational attributes
 * carry only honest, strengths-based text — never score/IQ/rank vocabulary and no
 * raw answers.
 */
import {describe, it, expect} from 'vitest';

import type {SavedLead} from './lead-summary';
import {bandLabelFor} from './lead-summary';
import {
  CONTACT_SOURCE,
  buildContactAttributes,
  contactListIds,
  buildContactUpsert
} from './contact-mapping';

const sampleLead: SavedLead = {
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
  savedAt: '2026-06-16T10:00:00.000Z'
};

/** Same guardrail regexes as `src/emails/ResultsEmail.test.ts`. */
const FORBIDDEN_WORD =
  /\b(score|scores|iq|rank|ranking|ranked|percent|percentile|points?|grade|weak|weaker|weakness|fail|failed|below average)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен)/i;

const EXPECTED_KEYS = [
  'CHILD_FIRST_NAME',
  'CHILD_AGE',
  'BAND',
  'LOCALE',
  'MARKETING_OPT_IN',
  'CONSENT_VERSION',
  'TOP_STRENGTHS',
  'SOURCE'
];

describe('buildContactAttributes', () => {
  it('maps each attribute from the SavedLead correctly', () => {
    const attrs = buildContactAttributes(sampleLead);
    expect(attrs.CHILD_FIRST_NAME).toBe('Maya');
    expect(attrs.CHILD_AGE).toBe(7);
    expect(attrs.LOCALE).toBe('en');
    expect(attrs.MARKETING_OPT_IN).toBe(false);
    expect(attrs.CONSENT_VERSION).toBe('v1-draft-2026-06');
    expect(attrs.SOURCE).toBe(CONTACT_SOURCE);
    expect(attrs.SOURCE).toBe('website-quiz');
  });

  it('uses the human-readable, digit-free BAND label (never band-a/b/c)', () => {
    expect(buildContactAttributes(sampleLead).BAND).toBe(bandLabelFor('band-b'));
    expect(buildContactAttributes({...sampleLead, band: 'band-a'}).BAND).toBe(
      bandLabelFor('band-a')
    );
    expect(buildContactAttributes({...sampleLead, band: 'band-c'}).BAND).toBe(
      bandLabelFor('band-c')
    );
    expect(buildContactAttributes(sampleLead).BAND).not.toMatch(/band-[abc]/);
  });

  it('TOP_STRENGTHS are the two celebrated English strength names, comma-joined', () => {
    // English display names regardless of locale (operational/CRM attribute).
    expect(buildContactAttributes(sampleLead).TOP_STRENGTHS).toBe(
      'Pattern Spotting, Shapes & Space'
    );
    // Stays English even for an mk lead (LOCALE records the parent's language).
    expect(
      buildContactAttributes({...sampleLead, locale: 'mk'}).TOP_STRENGTHS
    ).toBe('Pattern Spotting, Shapes & Space');
  });

  it('skips any non-strength-code in top1/top2 (guarded by isStrengthCode)', () => {
    const attrs = buildContactAttributes({...sampleLead, top1: 'not-a-code'});
    // only the valid code (spatial) survives
    expect(attrs.TOP_STRENGTHS).toBe('Shapes & Space');
  });

  it('emits exactly the eight documented keys (no answers/scores/iq/total)', () => {
    const attrs = buildContactAttributes(sampleLead);
    expect(Object.keys(attrs).sort()).toEqual(EXPECTED_KEYS.slice().sort());
  });

  it('carries no forbidden score vocabulary in its string values', () => {
    // NOTE: we do NOT blanket-ban digits here — CHILD_AGE is a legitimate number
    // and CONSENT_VERSION legitimately contains digits. The ban is on the score
    // vocabulary only, asserted over the STRING values.
    const attrs = buildContactAttributes({...sampleLead, locale: 'mk'});
    const stringValues = Object.values(attrs).filter(
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
  });
});

describe('contactListIds — the consent gate', () => {
  it('opt-in lead is on BOTH the ops list and the marketing list', () => {
    const ids = contactListIds(true, {leadsListId: 10, marketingListId: 20});
    expect(ids).toContain(10);
    expect(ids).toContain(20);
  });

  it('non-opt-in lead is on the ops list and NOT the marketing list', () => {
    const ids = contactListIds(false, {leadsListId: 10, marketingListId: 20});
    expect(ids).toContain(10);
    expect(ids).not.toContain(20);
  });

  it('omits the ops list when leadsListId is null but still produces valid ids', () => {
    expect(contactListIds(false, {leadsListId: null, marketingListId: 20})).toEqual(
      []
    );
    expect(contactListIds(true, {leadsListId: null, marketingListId: 20})).toEqual([
      20
    ]);
  });

  it('omits the marketing list when its id is null even on opt-in', () => {
    expect(
      contactListIds(true, {leadsListId: 10, marketingListId: null})
    ).toEqual([10]);
  });
});

describe('buildContactUpsert', () => {
  it('assembles a valid upsert payload (updateEnabled, attributes, gated listIds)', () => {
    const optIn = buildContactUpsert(
      {...sampleLead, marketingOptIn: true},
      {leadsListId: 10, marketingListId: 20}
    );
    expect(optIn.email).toBe('parent@example.com');
    expect(optIn.updateEnabled).toBe(true);
    expect(optIn.attributes.CHILD_FIRST_NAME).toBe('Maya');
    expect(optIn.listIds).toContain(10);
    expect(optIn.listIds).toContain(20);

    const noOptIn = buildContactUpsert(sampleLead, {
      leadsListId: 10,
      marketingListId: 20
    });
    expect(noOptIn.listIds).toContain(10);
    expect(noOptIn.listIds).not.toContain(20);
  });

  it('still produces a valid payload when leadsListId is unset (null)', () => {
    const payload = buildContactUpsert(sampleLead, {
      leadsListId: null,
      marketingListId: 20
    });
    expect(payload.email).toBe('parent@example.com');
    expect(payload.updateEnabled).toBe(true);
    expect(payload.listIds).toEqual([]);
  });
});
