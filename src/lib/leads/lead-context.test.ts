import {describe, it, expect} from 'vitest';

import {isLeadContext} from './lead-context';

describe('isLeadContext (post-gate hand-off guard)', () => {
  const valid = {
    childFirstName: 'Ана',
    age: 7,
    submittedAt: '2026-06-09T10:00:00.000Z'
  };

  it('accepts a well-formed lead context', () => {
    expect(isLeadContext(valid)).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'nope'],
    ['a missing name', {age: 7, submittedAt: 'x'}],
    ['an empty name', {childFirstName: '   ', age: 7, submittedAt: 'x'}],
    ['a non-numeric age', {childFirstName: 'Ана', age: '7', submittedAt: 'x'}],
    ['a missing timestamp', {childFirstName: 'Ана', age: 7}]
  ])('rejects %s', (_label, value) => {
    expect(isLeadContext(value)).toBe(false);
  });
});
