import {describe, expect, it} from 'vitest';
import type {Domain, Response} from '@/lib/engine/types';
import type {ResponseOutcome} from './flags';
import {evaluateValidity, outcomeForFlags} from './policy';
import type {ValidityFlag} from './types';

function flag(severity: 'mild' | 'strong'): ValidityFlag {
  return {kind: 'too_fast', severity, detail: {}};
}

function out(domain: Domain, correct: boolean, response: Partial<Response>): ResponseOutcome {
  return {
    domain,
    correct,
    response: {itemId: 'x', answer: null, responseTimeMs: 1500, ...response}
  };
}

describe('outcomeForFlags (graduated outcomes, spec 7.1)', () => {
  it('no flags → valid', () => {
    expect(outcomeForFlags([])).toBe('valid');
  });

  it('only mild flag(s) → gentle_note', () => {
    expect(outcomeForFlags([flag('mild')])).toBe('gentle_note');
  });

  it('any strong flag → not_representative', () => {
    expect(outcomeForFlags([flag('strong')])).toBe('not_representative');
    expect(outcomeForFlags([flag('mild'), flag('strong')])).toBe('not_representative');
  });
});

describe('evaluateValidity', () => {
  it('a clean session → valid, no flags', () => {
    const outcomes = Array.from({length: 5}, () => out('Gf', true, {responseTimeMs: 1500}));
    const summary = evaluateValidity(outcomes);
    expect(summary.outcome).toBe('valid');
    expect(summary.flags).toEqual([]);
    expect(summary.strongCount).toBe(0);
  });

  it('a mostly-too-fast session → not_representative (strong)', () => {
    const outcomes = Array.from({length: 5}, () => out('Gf', true, {responseTimeMs: 200}));
    const summary = evaluateValidity(outcomes);
    expect(summary.outcome).toBe('not_representative');
    expect(summary.strongCount).toBeGreaterThanOrEqual(1);
  });

  it('a few-too-fast session → gentle_note (mild only)', () => {
    const outcomes = [
      out('Gf', true, {responseTimeMs: 200}),
      ...Array.from({length: 9}, () => out('Gf', true, {responseTimeMs: 1500}))
    ];
    const summary = evaluateValidity(outcomes);
    expect(summary.outcome).toBe('gentle_note');
    expect(summary.mildCount).toBe(1);
  });

  it('reports the chance-level domains for the confidence model', () => {
    const outcomes = [
      out('Gf', true, {responseTimeMs: 1500}),
      out('Gf', false, {responseTimeMs: 1500}),
      out('Gf', false, {responseTimeMs: 1500}),
      out('Gf', false, {responseTimeMs: 1500})
    ].map((o) => ({...o, meta: {optionCount: 4}}));
    const summary = evaluateValidity(outcomes);
    expect(summary.chanceLevelDomains).toContain('Gf');
  });
});
