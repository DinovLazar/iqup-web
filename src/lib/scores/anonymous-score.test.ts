import {describe, it, expect} from 'vitest';
import {runSession, type SessionInput} from '@/lib/engine';
import {alwaysCorrect, makeFixtureProvider} from '@/lib/engine/fixtures';
import {buildProfile, type CognitiveProfile} from '@/lib/scoring/v2';
import {NORMS_VERSION} from '@/content/norms';
import {
  anonymousScoreSchema,
  buildAnonymousScore,
  type AnonymousScore
} from './anonymous-score';

const provider = makeFixtureProvider();
const input: SessionInput = {age: 9, seed: 'gold', calibrationBaselineMs: 400};
const sampleProfile = buildProfile(runSession(input, provider, alwaysCorrect()));

/** The exact, complete set of columns the row is allowed to carry (Store A). */
const ALLOWED_KEYS = [
  'age',
  'gender',
  'city',
  'language',
  'signal_gf',
  'signal_gv',
  'signal_gsm',
  'signal_gs',
  'signal_attention',
  'signal_ef',
  'signal_glr',
  'signal_ct',
  'index_logical',
  'index_spatial',
  'index_memory_focus',
  'index_planning_speed',
  'index_learning_stem',
  'validity',
  'norms_version'
].sort();

/** PII-shaped keys that must NEVER appear in an anonymous row (data minimisation). */
const PII_KEYS = [
  'email',
  'parentFirstName',
  'parent_first_name',
  'name',
  'phone',
  'id',
  'created_at',
  'createdAt',
  'timestamp'
];

describe('buildAnonymousScore (Store A mapping)', () => {
  const row = buildAnonymousScore(sampleProfile, {
    city: 'aerodrom',
    gender: 'female',
    language: 'mk'
  });

  it('emits exactly the allowed columns — no more, no less', () => {
    expect(Object.keys(row).sort()).toEqual(ALLOWED_KEYS);
  });

  it('carries NO PII and NO id / exact-timestamp field', () => {
    for (const k of PII_KEYS) {
      expect(k in row, `unexpected key ${k}`).toBe(false);
    }
  });

  it('copies the derived numbers straight off the profile', () => {
    expect(row.signal_gf).toBe(sampleProfile.signals.Gf.index);
    expect(row.signal_attention).toBe(sampleProfile.signals.attention.index);
    expect(row.index_logical).toBe(sampleProfile.indices.logical.value);
    expect(row.index_learning_stem).toBe(sampleProfile.indices.learning_stem.value);
    expect(row.age).toBe(9);
    expect(row.norms_version).toBe(NORMS_VERSION);
  });

  it('passes its own strict schema', () => {
    expect(anonymousScoreSchema.parse(row)).toEqual(row);
  });

  it('allows a null gender (the field is optional)', () => {
    const r = buildAnonymousScore(sampleProfile, {
      city: 'ohrid',
      gender: null,
      language: 'en'
    });
    expect(r.gender).toBeNull();
    expect(anonymousScoreSchema.parse(r)).toEqual(r);
  });
});

describe('validity mapping (3-outcome enum → 2-value flag)', () => {
  function withOutcome(outcome: CognitiveProfile['validity']['outcome']) {
    return buildAnonymousScore(
      {...sampleProfile, validity: {...sampleProfile.validity, outcome}},
      {city: 'aerodrom', gender: null, language: 'mk'}
    ).validity;
  }

  it('valid → valid', () => expect(withOutcome('valid')).toBe('valid'));
  it('gentle_note → valid (still a representative session)', () =>
    expect(withOutcome('gentle_note')).toBe('valid'));
  it('not_representative → not_representative', () =>
    expect(withOutcome('not_representative')).toBe('not_representative'));
});

describe('anonymousScoreSchema (.strict — PII rejection)', () => {
  const base: AnonymousScore = buildAnonymousScore(sampleProfile, {
    city: 'aerodrom',
    gender: 'male',
    language: 'mk'
  });

  it('REJECTS any PII-shaped extra field (does not silently strip it)', () => {
    expect(anonymousScoreSchema.safeParse({...base, email: 'a@b.com'}).success).toBe(
      false
    );
    expect(
      anonymousScoreSchema.safeParse({...base, parent_first_name: 'Ana'}).success
    ).toBe(false);
    expect(anonymousScoreSchema.safeParse({...base, phone: '070'}).success).toBe(
      false
    );
  });

  it('REJECTS an unknown city (must be a real centre id)', () => {
    expect(anonymousScoreSchema.safeParse({...base, city: 'atlantis'}).success).toBe(
      false
    );
  });

  it('REJECTS an out-of-range age', () => {
    expect(anonymousScoreSchema.safeParse({...base, age: 4}).success).toBe(false);
    expect(anonymousScoreSchema.safeParse({...base, age: 14}).success).toBe(false);
  });

  it('REJECTS a score outside 0–100', () => {
    expect(anonymousScoreSchema.safeParse({...base, signal_gf: 120}).success).toBe(
      false
    );
  });
});
