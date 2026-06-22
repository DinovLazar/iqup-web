import {describe, expect, it} from 'vitest';
import {deriveAttention, type TimedOutcome} from './attention';

const BASELINE = 400;

function inRange(x: number) {
  expect(Number.isNaN(x)).toBe(false);
  expect(x).toBeGreaterThanOrEqual(0);
  expect(x).toBeLessThanOrEqual(1);
}

describe('deriveAttention edge inputs', () => {
  it('no responses → valid, in-range, no NaN', () => {
    const d = deriveAttention([], BASELINE);
    expect(d.n).toBe(0);
    inRange(d.raw);
  });

  it('a single response → no variability term, no NaN', () => {
    const d = deriveAttention([{responseTimeMs: 1500, correct: true}], BASELINE);
    expect(d.normVariability).toBe(0);
    inRange(d.raw);
  });

  it('a zero baseline does not divide-by-zero', () => {
    const d = deriveAttention([{responseTimeMs: 1500, correct: true}], 0);
    inRange(d.raw);
  });
});

describe('deriveAttention behaviour', () => {
  it('steady pace, no careless errors → high attention (raw ≈ 1)', () => {
    const steady: TimedOutcome[] = Array.from({length: 6}, () => ({
      responseTimeMs: 1500,
      correct: true
    }));
    const d = deriveAttention(steady, BASELINE);
    expect(d.normVariability).toBe(0);
    expect(d.impulsiveRate).toBe(0);
    expect(d.raw).toBe(1);
  });

  it('erratic timing lowers attention via variability', () => {
    const erratic: TimedOutcome[] = [
      {responseTimeMs: 300, correct: true},
      {responseTimeMs: 6000, correct: true},
      {responseTimeMs: 400, correct: true},
      {responseTimeMs: 8000, correct: true}
    ];
    const d = deriveAttention(erratic, BASELINE);
    expect(d.normVariability).toBeGreaterThan(0);
    expect(d.raw).toBeLessThan(1);
    inRange(d.raw);
  });

  it('too-fast-and-wrong answers raise the impulsive rate', () => {
    const impulsive: TimedOutcome[] = [
      {responseTimeMs: 200, correct: false},
      {responseTimeMs: 250, correct: false},
      {responseTimeMs: 1500, correct: true},
      {responseTimeMs: 1500, correct: true}
    ];
    const d = deriveAttention(impulsive, BASELINE);
    expect(d.impulsiveRate).toBeCloseTo(0.5, 5);
    inRange(d.raw);
  });

  it('omissions count toward the impulsive rate', () => {
    const withOmissions: TimedOutcome[] = [
      {responseTimeMs: 0, correct: false, omitted: true},
      {responseTimeMs: 1500, correct: true}
    ];
    const d = deriveAttention(withOmissions, BASELINE);
    expect(d.impulsiveRate).toBeCloseTo(0.5, 5);
    inRange(d.raw);
  });

  it('a slow-but-steady device is not penalised vs a fast one (calibration)', () => {
    const fast: TimedOutcome[] = [
      {responseTimeMs: 800, correct: true},
      {responseTimeMs: 1200, correct: true}
    ];
    const slow: TimedOutcome[] = [
      {responseTimeMs: 1600, correct: true},
      {responseTimeMs: 2400, correct: true}
    ];
    // Same ratio of times → same variability when each is scaled by its baseline.
    const dFast = deriveAttention(fast, 400);
    const dSlow = deriveAttention(slow, 800);
    expect(dFast.normVariability).toBeCloseTo(dSlow.normVariability, 5);
  });
});
