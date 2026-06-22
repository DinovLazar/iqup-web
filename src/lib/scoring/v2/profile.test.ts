import {describe, expect, it} from 'vitest';
import {runSession, type SessionInput} from '@/lib/engine';
import {alwaysCorrect, alwaysWrong, makeFixtureProvider, scripted} from '@/lib/engine/fixtures';
import {buildProfile} from './profile';
import {INDICES, SIGNALS, type CognitiveProfile} from './types';

const provider = makeFixtureProvider();
const input = (age: number, seed: number | string = 'gold'): SessionInput => ({
  age,
  seed,
  calibrationBaselineMs: 400
});

function profile(age: number, responder: ReturnType<typeof alwaysCorrect>, seed?: number | string) {
  return buildProfile(runSession(input(age, seed), provider, responder));
}

describe('golden — alwaysCorrect, age 7 (hand-checked)', () => {
  const p = profile(7, alwaysCorrect());

  it('signals match the hand-computed indices', () => {
    const idx = Object.fromEntries(SIGNALS.map((s) => [s, p.signals[s].index]));
    expect(idx).toEqual({
      Gf: 95,
      Gv: 95,
      Gsm: 92,
      Gs: 78,
      attention: 95,
      EF: 95,
      Glr: 95,
      CT: 95
    });
  });

  it('indices, bands and confidence are as expected', () => {
    expect(p.indices.logical).toMatchObject({value: 95, band: 'exceptional', confidence: 'high'});
    expect(p.indices.spatial).toMatchObject({value: 95, band: 'exceptional', confidence: 'high'});
    expect(p.indices.memory_focus).toMatchObject({value: 93, band: 'exceptional', confidence: 'high'});
    expect(p.indices.planning_speed).toMatchObject({value: 88, band: 'exceptional', confidence: 'high'});
    expect(p.indices.learning_stem).toMatchObject({value: 95, band: 'exceptional', confidence: 'high'});
  });

  it('the session is valid', () => {
    expect(p.validity.outcome).toBe('valid');
  });
});

describe('golden — alwaysWrong, age 7 (floor handling)', () => {
  const p = profile(7, alwaysWrong());

  it('accuracy domains hit the formula floor; Gsm clamps to the index floor', () => {
    expect(p.signals.Gf.index).toBe(20);
    expect(p.signals.Gsm.index).toBe(8);
  });

  it('attention stays high — steady, non-impulsive answers (attention ≠ accuracy)', () => {
    expect(p.signals.attention.index).toBe(95);
  });

  it('all indices land in the developing band with reduced confidence', () => {
    for (const idx of INDICES) {
      expect(p.indices[idx].band).toBe('developing');
      expect(p.indices[idx].confidence).not.toBe('high');
    }
  });

  it('the discontinue rule flagged the floor extreme on the domains', () => {
    expect(p.features.floorDomains.length).toBeGreaterThan(0);
  });
});

describe('golden — alwaysCorrect, age 13 (ceiling extreme)', () => {
  const p = profile(13, alwaysCorrect());

  it('every domain reached the ceiling extreme', () => {
    expect(p.features.ceilingDomains.length).toBe(7);
    expect(p.features.floorDomains).toEqual([]);
  });

  it('all indices are exceptional', () => {
    for (const idx of INDICES) expect(p.indices[idx].band).toBe('exceptional');
  });
});

describe('invariant — extremes produce valid, in-range, NaN-free values', () => {
  for (const [label, p] of [
    ['floor', profile(5, alwaysWrong())],
    ['ceiling', profile(13, alwaysCorrect())],
    ['mixed', profile(9, scripted([true, true, false, true, false, true]))]
  ] as const) {
    it(`${label}: signals 8–99, indices 0–100, never NaN`, () => {
      for (const s of SIGNALS) {
        const v = p.signals[s].index;
        expect(Number.isNaN(v)).toBe(false);
        expect(v).toBeGreaterThanOrEqual(8);
        expect(v).toBeLessThanOrEqual(99);
      }
      for (const i of INDICES) {
        const v = p.indices[i].value;
        expect(Number.isNaN(v)).toBe(false);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    });
  }
});

describe('invariant — time is never a penalty off the speed task', () => {
  // Same correct answers; one slow, one fast (both > the too-fast/impulsive cutoff).
  const slow = profile(9, alwaysCorrect({responseTimeMs: 4000}));
  const fast = profile(9, alwaysCorrect({responseTimeMs: 800}));
  const NON_SPEED = SIGNALS.filter((s) => s !== 'Gs');

  it('slow+accurate ≥ fast+accurate on every non-speed signal', () => {
    for (const s of NON_SPEED) {
      expect(slow.signals[s].index).toBeGreaterThanOrEqual(fast.signals[s].index);
    }
  });

  it('only Gs (the speed task) is allowed to reward being faster', () => {
    expect(fast.signals.Gs.index).toBeGreaterThanOrEqual(slow.signals.Gs.index);
  });
});

describe('invariant — no user-facing number / % / IQ / rank string leaks', () => {
  const p = profile(9, scripted([true, true, false, true, false, true]));
  const FORBIDDEN = /%|\biq\b|percentile|\brank\b|\/100|\bscore\b|exceptional ly/i;

  function collectStrings(value: unknown, acc: string[]): void {
    if (typeof value === 'string') acc.push(value);
    else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, acc));
    else if (value && typeof value === 'object') {
      for (const v of Object.values(value)) collectStrings(v, acc);
    }
  }

  it('no string the module produces renders a score/%/IQ/rank', () => {
    const strings: string[] = [];
    collectStrings(p, strings);
    expect(strings.length).toBeGreaterThan(0);
    for (const s of strings) expect(s).not.toMatch(FORBIDDEN);
  });

  it('bands and confidence are stable enums (no display words)', () => {
    for (const i of INDICES) {
      expect(['exceptional', 'strong', 'solid', 'developing']).toContain(p.indices[i].band);
      expect(['high', 'medium', 'low']).toContain(p.indices[i].confidence);
    }
  });
});

describe('Store A slice — all signal/index values are plain numbers', () => {
  const p = profile(9, scripted([true, false, true, true]));
  it('the 8 signals + 5 indices are numeric (extractable by 3.06)', () => {
    for (const s of SIGNALS) {
      expect(typeof p.signals[s].raw).toBe('number');
      expect(typeof p.signals[s].index).toBe('number');
    }
    for (const i of INDICES) expect(typeof p.indices[i].value).toBe('number');
  });
});

describe('determinism — same (age, seed, responses) → identical profile', () => {
  function json(p: CognitiveProfile) {
    return JSON.stringify(p);
  }

  it('two runs are byte-identical', () => {
    const a = profile(9, alwaysCorrect(), 'same-seed');
    const b = profile(9, alwaysCorrect(), 'same-seed');
    expect(json(a)).toBe(json(b));
  });

  it('carries the session params + versions for reproducibility', () => {
    const p = profile(9, alwaysCorrect(), 'repro');
    expect(p.session.age).toBe(9);
    expect(p.session.seed).toBe('repro');
    expect(typeof p.session.seedInt).toBe('number');
    expect(p.session.engineVersion).toBeTruthy();
    expect(p.session.scoringVersion).toBeTruthy();
    expect(p.session.normsVersion).toBeTruthy();
  });
});
