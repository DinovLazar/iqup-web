import {describe, expect, it} from 'vitest';
import {runSession, type SessionInput} from '@/lib/engine';
import {alwaysCorrect, alwaysWrong, makeFixtureProvider, scripted} from '@/lib/engine/fixtures';
import {buildProfile} from './profile';

const provider = makeFixtureProvider();
const input = (age: number): SessionInput => ({age, seed: 'feat', calibrationBaselineMs: 400});

describe('derived features', () => {
  it('a near-even profile is flat; an uneven one is spiky', () => {
    const flat = buildProfile(runSession(input(7), provider, alwaysCorrect()));
    expect(flat.features.profileShape).toBe('flat');

    const spiky = buildProfile(
      runSession(input(9), provider, scripted([true, true, false, true, false, true]))
    );
    expect(spiky.features.profileShape).toBe('spiky');
    expect(spiky.features.indexSpread).toBeGreaterThanOrEqual(20);
  });

  it('reports the highest and lowest index', () => {
    const p = buildProfile(
      runSession(input(9), provider, scripted([true, true, false, true, false, true]))
    );
    expect(p.features.highestIndex).toBeTruthy();
    expect(p.features.lowestIndex).toBeTruthy();
    expect(p.features.highestIndex).not.toBe(p.features.lowestIndex);
  });

  it('classifies the solving style from speed × accuracy', () => {
    const reflective = buildProfile(runSession(input(9), provider, alwaysCorrect({responseTimeMs: 4000})));
    expect(reflective.features.solvingStyle).toBe('reflective_accurate');

    const fast = buildProfile(runSession(input(9), provider, alwaysCorrect({responseTimeMs: 800})));
    expect(fast.features.solvingStyle).toBe('fast_accurate');

    const careless = buildProfile(runSession(input(9), provider, alwaysWrong({responseTimeMs: 800})));
    expect(careless.features.solvingStyle).toBe('fast_errors');
  });

  it('memory asymmetry is null under 8 (no backward span) and a number from 8', () => {
    const young = buildProfile(runSession(input(7), provider, alwaysCorrect()));
    expect(young.features.memoryAsymmetry).toBeNull();

    const older = buildProfile(runSession(input(13), provider, alwaysCorrect()));
    expect(typeof older.features.memoryAsymmetry).toBe('number');
  });

  it('learning slope is ~0 for a flat (all-correct) Glr run', () => {
    const p = buildProfile(runSession(input(9), provider, alwaysCorrect()));
    expect(p.features.learningSlope).toBeCloseTo(0, 5);
  });

  it('lists ceiling domains for a top-out run and floor domains for a bottom-out run', () => {
    const top = buildProfile(runSession(input(13), provider, alwaysCorrect()));
    expect(top.features.ceilingDomains.length).toBeGreaterThan(0);

    const bottom = buildProfile(runSession(input(5), provider, alwaysWrong()));
    expect(bottom.features.floorDomains.length).toBeGreaterThan(0);
  });
});
