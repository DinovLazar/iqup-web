import {describe, expect, it} from 'vitest';
import {DOMAIN_CAPS, START_LEVEL_BY_AGE} from '@/content/norms';
import {
  alwaysCorrect,
  alwaysWrong,
  correctUpToLevel,
  makeFixtureProvider,
  scripted
} from './fixtures';
import {
  assertValidAge,
  createDomainController,
  formatFor,
  runDomain,
  runSession,
  startLevel,
  type SessionInput
} from './engine';
import {DOMAINS} from './types';

const provider = makeFixtureProvider();

function input(age: number, seed: number | string = 42): SessionInput {
  return {age, seed, calibrationBaselineMs: 400};
}

/** A serialisable projection of a run's path (drops the judge closures). */
function pathOf(run: {items: {item: {id: string; level: number; format: string}; judgment: {correct: boolean}}[]}) {
  return run.items.map((it) => ({
    id: it.item.id,
    level: it.item.level,
    format: it.item.format,
    correct: it.judgment.correct
  }));
}

describe('age validation', () => {
  it('accepts 5–13 and rejects out-of-range / non-integers', () => {
    for (let age = 5; age <= 13; age++) expect(() => assertValidAge(age)).not.toThrow();
    expect(() => assertValidAge(4)).toThrow();
    expect(() => assertValidAge(14)).toThrow();
    expect(() => assertValidAge(7.5)).toThrow();
  });
});

describe('start levels (spec Дел 5)', () => {
  it('matches the per-age table for every domain', () => {
    for (const domain of DOMAINS) {
      for (let age = 5; age <= 13; age++) {
        expect(startLevel(domain, age)).toBe(START_LEVEL_BY_AGE[age]);
      }
    }
  });
});

describe('format selection (spec Дел 5)', () => {
  it('Gsm is forward-only under 8', () => {
    for (const i of [0, 1, 2, 3]) expect(formatFor('Gsm', 7, i)).toBe('forward');
  });

  it('Gsm alternates forward/backward from 8', () => {
    expect(formatFor('Gsm', 8, 0)).toBe('forward');
    expect(formatFor('Gsm', 8, 1)).toBe('backward');
    expect(formatFor('Gsm', 8, 2)).toBe('forward');
  });

  it('non-Gsm domains are always standard', () => {
    expect(formatFor('Gf', 13, 1)).toBe('standard');
    expect(formatFor('CT', 5, 0)).toBe('standard');
  });
});

describe('adaptive level stepping', () => {
  it('raises level on a correct answer, capped at 10', () => {
    // age 13 → start 8; always-correct climbs 8,9,10,10,...
    const run = runDomain('Gf', input(13), provider, alwaysCorrect());
    const levels = run.items.map((i) => i.level);
    expect(levels[0]).toBe(8);
    expect(levels[1]).toBe(9);
    expect(levels[2]).toBe(10);
    expect(Math.max(...levels)).toBeLessThanOrEqual(10);
  });

  it('lowers level on an error, floored at 1, and flags the floor extreme', () => {
    // age 5 → start 1; always-wrong errors at level 1 immediately.
    const run = runDomain('Gf', input(5), provider, alwaysWrong());
    expect(run.items[0].level).toBe(1);
    expect(run.reachedFloorExtreme).toBe(true);
  });

  it('flags the ceiling extreme when an item at level 10 is solved', () => {
    const run = runDomain('Gf', input(13), provider, alwaysCorrect());
    expect(run.reachedCeilingExtreme).toBe(true);
  });
});

describe('discontinue (ceiling) + cap', () => {
  it('ends after two consecutive errors', () => {
    const run = runDomain('Gf', input(9), provider, alwaysWrong());
    expect(run.endedBy).toBe('discontinue');
    expect(run.items).toHaveLength(2);
  });

  it('does NOT discontinue when errors are not consecutive', () => {
    // correct, wrong, correct, wrong … never two errors in a row → runs to cap.
    const run = runDomain('Gf', input(9), provider, scripted([true, false, true, false, true, false]));
    expect(run.endedBy).toBe('cap');
    expect(run.items.length).toBe(DOMAIN_CAPS.Gf.max);
  });

  it('respects the per-domain cap for an all-correct run', () => {
    const run = runDomain('Gsm', input(6), provider, alwaysCorrect());
    expect(run.endedBy).toBe('cap');
    expect(run.items).toHaveLength(DOMAIN_CAPS.Gsm.max);
  });

  it('runs the extended battery (+1) for the 10–13 cluster', () => {
    const young = runDomain('CT', input(9), provider, alwaysCorrect());
    const older = runDomain('CT', input(11), provider, alwaysCorrect());
    expect(young.items).toHaveLength(DOMAIN_CAPS.CT.max);
    expect(older.items).toHaveLength(DOMAIN_CAPS.CT.max + 1);
  });
});

describe('domain controller', () => {
  it('drives a domain one response at a time', () => {
    const c = createDomainController('Gf', input(9), provider);
    const first = c.peek();
    expect(first).not.toBeNull();
    // peek is idempotent (same item until answered)
    expect(c.peek()).toBe(first);
    let guard = 0;
    while (!c.done) {
      const item = c.peek();
      if (!item) break;
      c.submit(alwaysCorrect()(item));
      if (++guard > 50) throw new Error('runaway');
    }
    expect(c.peek()).toBeNull();
    expect(c.result().items.length).toBeGreaterThan(0);
  });

  it('throws if you submit after the domain ended', () => {
    const c = createDomainController('Gf', input(9), provider);
    while (!c.done) {
      const item = c.peek();
      if (!item) break;
      c.submit(alwaysWrong()(item));
    }
    expect(() => c.submit({itemId: 'x', answer: 'y', responseTimeMs: 1})).toThrow();
  });
});

describe('runSession', () => {
  it('runs all seven domains', () => {
    const session = runSession(input(9), provider, alwaysCorrect());
    expect(Object.keys(session.domains).sort()).toEqual([...DOMAINS].sort());
  });

  it('correctUpToLevel produces a mixed path that still terminates', () => {
    const run = runDomain('Gf', input(9), provider, correctUpToLevel(7));
    expect(run.items.length).toBeGreaterThanOrEqual(2);
    expect(run.items.length).toBeLessThanOrEqual(DOMAIN_CAPS.Gf.max);
  });
});

describe('determinism (hard requirement, spec Дел 5)', () => {
  it('the same (age, seed, responses) reproduces a byte-identical path', () => {
    const a = runSession(input(9, 'seed-A'), provider, alwaysCorrect());
    const b = runSession(input(9, 'seed-A'), provider, alwaysCorrect());
    for (const d of DOMAINS) {
      expect(pathOf(a.domains[d])).toEqual(pathOf(b.domains[d]));
    }
  });

  it('different seeds change the selection path (item ids differ)', () => {
    const a = runSession(input(9, 'seed-A'), provider, alwaysCorrect());
    const b = runSession(input(9, 'seed-B'), provider, alwaysCorrect());
    const idsA = DOMAINS.flatMap((d) => a.domains[d].items.map((i) => i.item.id));
    const idsB = DOMAINS.flatMap((d) => b.domains[d].items.map((i) => i.item.id));
    expect(idsA).not.toEqual(idsB);
    // …but the level path is identical (same responder, same start levels).
    const levelsA = DOMAINS.flatMap((d) => a.domains[d].items.map((i) => i.level));
    const levelsB = DOMAINS.flatMap((d) => b.domains[d].items.map((i) => i.level));
    expect(levelsA).toEqual(levelsB);
  });

  it('domain order does not perturb a domain stream (independent sub-seeds)', () => {
    const full = runSession(input(9, 'seed-Z'), provider, alwaysCorrect());
    const justGf = runDomain('Gf', input(9, 'seed-Z'), provider, alwaysCorrect());
    expect(pathOf(full.domains.Gf)).toEqual(pathOf(justGf));
  });
});
