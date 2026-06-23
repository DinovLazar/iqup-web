import {describe, it, expect} from 'vitest';
import {getCenter} from '@/content/centers';
import {
  assessmentLeadSchema,
  assessmentLeadListIds,
  buildAssessmentLeadAttributes,
  buildAssessmentLeadUpsert,
  CONSENT_VERSION_V2,
  ASSESSMENT_LEAD_SOURCE,
  TOP_INDEX_LABEL,
  type AssessmentLead
} from './assessment-lead';

function lead(overrides: Partial<AssessmentLead> = {}): AssessmentLead {
  return {
    parentFirstName: 'Marija',
    email: 'parent@example.com',
    phone: '+389 70 123 456',
    city: 'aerodrom',
    childAge: 9,
    childGender: 'female',
    locale: 'mk',
    consentProcess: true,
    consentGuardian: true,
    marketingOptIn: false,
    topIndex: 'logical',
    ...overrides
  };
}

/** Forbidden honesty tokens that must never appear in any Brevo value. */
const FORBIDDEN = /\b(iq|score|percentile|rank|band)\b/i;

describe('assessmentLeadSchema', () => {
  it('accepts a well-formed v2 lead', () => {
    expect(assessmentLeadSchema.safeParse(lead()).success).toBe(true);
  });

  it('requires BOTH process and guardian consent (literal true)', () => {
    expect(
      assessmentLeadSchema.safeParse(lead({consentProcess: false as never})).success
    ).toBe(false);
    expect(
      assessmentLeadSchema.safeParse(lead({consentGuardian: false as never})).success
    ).toBe(false);
  });

  it('rejects an unknown city, a bad email, and an out-of-range age', () => {
    expect(assessmentLeadSchema.safeParse(lead({city: 'atlantis'})).success).toBe(
      false
    );
    expect(assessmentLeadSchema.safeParse(lead({email: 'nope'})).success).toBe(false);
    expect(assessmentLeadSchema.safeParse(lead({childAge: 3})).success).toBe(false);
  });

  it('allows a null child gender (optional field)', () => {
    expect(assessmentLeadSchema.safeParse(lead({childGender: null})).success).toBe(
      true
    );
  });
});

describe('buildAssessmentLeadAttributes (Brevo attribute set)', () => {
  it('maps the full v2 attribute set with the new consent version + source', () => {
    const attrs = buildAssessmentLeadAttributes(lead());
    expect(attrs).toMatchObject({
      PARENT_FIRST_NAME: 'Marija',
      PHONE: '+389 70 123 456',
      CITY: getCenter('aerodrom')!.city.en,
      CHILD_AGE: 9,
      CHILD_GENDER: 'female',
      LOCALE: 'mk',
      CONSENT_PROCESS: true,
      CONSENT_GUARDIAN: true,
      MARKETING_OPT_IN: false,
      CONSENT_VERSION: CONSENT_VERSION_V2,
      TOP_INDEX: 'Logical thinking',
      SOURCE: ASSESSMENT_LEAD_SOURCE
    });
  });

  it('omits CHILD_GENDER entirely when gender is null (never clears on update)', () => {
    const attrs = buildAssessmentLeadAttributes(lead({childGender: null}));
    expect('CHILD_GENDER' in attrs).toBe(false);
  });

  it('TOP_INDEX is the single coarse English label — no digits, no forbidden tokens', () => {
    for (const [, label] of Object.entries(TOP_INDEX_LABEL)) {
      expect(label).not.toMatch(/\d/);
      expect(label).not.toMatch(FORBIDDEN);
    }
  });

  it('carries NO score / index numbers and no full profile', () => {
    const attrs = buildAssessmentLeadAttributes(lead());
    // CHILD_AGE is the only numeric attribute; nothing score-shaped rides along.
    const numericKeys = Object.entries(attrs)
      .filter(([, v]) => typeof v === 'number')
      .map(([k]) => k);
    expect(numericKeys).toEqual(['CHILD_AGE']);
    expect(JSON.stringify(attrs)).not.toMatch(FORBIDDEN);
  });
});

describe('assessmentLeadListIds (consent → list gating)', () => {
  const config = {leadsListId: 10, marketingListId: 20};

  it('operational list is ALWAYS included', () => {
    expect(assessmentLeadListIds(false, config)).toContain(10);
    expect(assessmentLeadListIds(true, config)).toContain(10);
  });

  it('marketing list is included IFF marketingOptIn is true', () => {
    expect(assessmentLeadListIds(false, config)).toEqual([10]);
    expect(assessmentLeadListIds(true, config)).toEqual([10, 20]);
  });

  it('a non-opt-in lead is NEVER on the marketing list, even when configured', () => {
    expect(assessmentLeadListIds(false, config)).not.toContain(20);
  });

  it('skips an unset list id (null) without error', () => {
    expect(assessmentLeadListIds(true, {leadsListId: null, marketingListId: null})).toEqual(
      []
    );
  });
});

describe('buildAssessmentLeadUpsert', () => {
  it('is an upsert by email with updateEnabled', () => {
    const payload = buildAssessmentLeadUpsert(lead(), {
      leadsListId: 10,
      marketingListId: 20
    });
    expect(payload.email).toBe('parent@example.com');
    expect(payload.updateEnabled).toBe(true);
    expect(payload.listIds).toEqual([10]); // not opted-in
  });
});
