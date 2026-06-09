import {describe, it, expect} from 'vitest';

import {isTestResult, TEST_RESULT_STORAGE_KEY} from './storage';

const validResult = {
  version: 1,
  band: '6-9',
  locale: 'mk',
  strengths: [{code: 'logic', total: 2, hits: 2, ratio: 1, rank: 1, tier: 'celebrated'}],
  top1: 'logic',
  top2: 'pattern',
  top3: 'spatial',
  growing: ['numeracy', 'memory', 'words_obs'],
  completedAt: '2026-06-09T10:00:00.000Z'
};

describe('isTestResult (persisted hand-off guard)', () => {
  it('accepts a well-formed TestResult', () => {
    expect(isTestResult(validResult)).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'nope'],
    ['a wrong version', {...validResult, version: 2}],
    ['an unknown locale', {...validResult, locale: 'fr'}],
    ['empty strengths', {...validResult, strengths: []}],
    ['a missing top1', {...validResult, top1: undefined}]
  ])('rejects %s', (_label, value) => {
    expect(isTestResult(value)).toBe(false);
  });
});

describe('TEST_RESULT_STORAGE_KEY', () => {
  it('is the versioned key the runner persists to', () => {
    expect(TEST_RESULT_STORAGE_KEY).toBe('iqup.testResult.v1');
  });
});
