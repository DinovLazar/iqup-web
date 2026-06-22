import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import type {Direction} from './glyphs';
import {generateCt, practiceCt, simulate} from './ct';
import {correctAnswerFor, specOf, wrongAnswerFor} from './shared';
import type {
  CtConditionalSpec,
  CtDebugSpec,
  CtLoopSpec,
  CtMazeSpec,
  CtSequenceSpec
} from './types';

function gen(level: number, seed: string | number) {
  return generateCt(level, 'standard', makeRng(seed));
}

/** A serialisable projection (drops the judge closure) for byte-identity checks. */
function ser(item: ReturnType<typeof gen>) {
  return JSON.stringify({
    id: item.id,
    domain: item.domain,
    level: item.level,
    format: item.format,
    payload: item.payload,
    meta: item.meta
  });
}

/** Generate a broad spread of items so all 5 sub-types are represented. */
function corpus(): ReturnType<typeof gen>[] {
  const items: ReturnType<typeof gen>[] = [];
  for (let s = 0; s < 120; s++) {
    for (let level = 1; level <= 10; level++) {
      items.push(gen(level, `corpus-${s}-${level}`));
    }
  }
  return items;
}

const ALL = corpus();
const byType = (t: string) => ALL.filter((i) => specOf(i).taskType === t);

describe('CT determinism + variety', () => {
  it('same (level, format, seed) → byte-identical item', () => {
    expect(ser(gen(5, 'seed-1'))).toBe(ser(gen(5, 'seed-1')));
  });
  it('different seed → different item at the same level', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 30; s++) seen.add(ser(gen(5, `seed-${s}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
  it('all 5 sub-types are generated', () => {
    const types = new Set(ALL.map((i) => specOf(i).taskType));
    expect(types).toEqual(
      new Set(['ct.sequence', 'ct.debug', 'ct.loop', 'ct.conditional', 'ct.maze'])
    );
  });
});

describe('CT answer correctness — generic oracle agreement', () => {
  it('judge(correctAnswerFor) → true and judge(wrongAnswerFor) → false, every item', () => {
    for (const item of ALL) {
      expect(item.judge({itemId: item.id, answer: correctAnswerFor(item), responseTimeMs: 1000}).correct).toBe(true);
      expect(item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1000}).correct).toBe(false);
    }
  });
});

describe('CT ct.sequence', () => {
  it('start ≠ goal and the declared solution re-simulates to the goal', () => {
    const items = byType('ct.sequence');
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const p = specOf(item) as CtSequenceSpec;
      expect(p.world.start).not.toEqual(p.world.goal);
      expect(p.world.walls).toEqual([]);
      const end = simulate(p.world, p.solution.answer);
      expect(end).not.toBeNull();
      expect(end).toEqual(p.world.goal);
      // The orderable steps are the same multiset as the solution.
      expect([...p.steps].sort()).toEqual([...p.solution.answer].sort());
      expect(p.interaction.slotCount).toBe(p.steps.length);
      // Empty answer must judge wrong (start ≠ goal guarantees this).
      expect(item.judge({itemId: item.id, answer: [], responseTimeMs: 1}).correct).toBe(false);
    }
  });
});

describe('CT ct.maze', () => {
  it('start ≠ goal, has walls (when scaled), solution avoids walls + reaches goal', () => {
    const items = byType('ct.maze');
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const p = specOf(item) as CtMazeSpec;
      expect(p.world.start).not.toEqual(p.world.goal);
      const end = simulate(p.world, p.solution.answer);
      expect(end).not.toBeNull();
      expect(end).toEqual(p.world.goal);
      // Solution never steps onto a wall (simulate returns null if it does).
      expect([...p.steps].sort()).toEqual([...p.solution.answer].sort());
      expect(item.judge({itemId: item.id, answer: [], responseTimeMs: 1}).correct).toBe(false);
    }
  });
  it('at least some mazes carry walls', () => {
    const withWalls = byType('ct.maze').filter((i) => (specOf(i) as CtMazeSpec).world.walls.length > 0);
    expect(withWalls.length).toBeGreaterThan(0);
  });
});

describe('CT ct.debug', () => {
  it('the buggy program misses goal, but fixing the buggy index reaches goal', () => {
    const items = byType('ct.debug');
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const p = specOf(item) as CtDebugSpec;
      const bug = p.solution.answer;
      // The shown program (with the bug) does NOT reach goal.
      const buggyEnd = simulate(p.world, p.program);
      const reaches = buggyEnd !== null && buggyEnd[0] === p.world.goal[0] && buggyEnd[1] === p.world.goal[1];
      expect(reaches).toBe(false);
      // Fixing JUST the buggy step (back to a correct Manhattan move) reaches goal.
      // We don't know the original move, but the corrected program is a shortest
      // Manhattan path; reconstruct the displacement direction at that index.
      const dc = p.world.goal[0] - p.world.start[0];
      const dr = p.world.goal[1] - p.world.start[1];
      const corrected = p.program.slice();
      // Rebuild the canonical correct path (right/left then down/up) and use its move.
      const correctPath: Direction[] = [];
      for (let i = 0; i < Math.abs(dc); i++) correctPath.push(dc > 0 ? 'right' : 'left');
      for (let i = 0; i < Math.abs(dr); i++) correctPath.push(dr > 0 ? 'down' : 'up');
      corrected[bug] = correctPath[bug];
      const fixedEnd = simulate(p.world, corrected);
      expect(fixedEnd).toEqual(p.world.goal);
      expect(p.interaction.stepCount).toBe(p.program.length);
      expect(item.meta?.optionCount).toBe(p.program.length);
    }
  });
});

describe('CT ct.loop', () => {
  it('exactly one option expands to the flat sequence — the declared answer', () => {
    const items = byType('ct.loop');
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const p = specOf(item) as CtLoopSpec;
      const expand = (o: {repeat: number; body: Direction[]}) => {
        const out: Direction[] = [];
        for (let r = 0; r < o.repeat; r++) out.push(...o.body);
        return out;
      };
      const matches = p.options.filter((o) => JSON.stringify(expand(o)) === JSON.stringify(p.sequence));
      expect(matches.length).toBe(1);
      expect(JSON.stringify(expand(p.options[p.solution.answer]))).toBe(JSON.stringify(p.sequence));
      expect(p.options.length).toBe(4);
    }
  });
});

describe('CT ct.conditional', () => {
  it('the declared answer = applying rules to inputs; one matching option', () => {
    const items = byType('ct.conditional');
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const p = specOf(item) as CtConditionalSpec;
      const ruleMap = new Map(p.rules.map((r) => [r.color, r.direction]));
      const expected = p.inputs.map((c) => ruleMap.get(c)!);
      expect(p.options[p.solution.answer]).toEqual(expected);
      const matches = p.options.filter((o) => JSON.stringify(o) === JSON.stringify(expected));
      expect(matches.length).toBe(1);
      expect(p.options.length).toBe(4);
    }
  });
});

describe('CT difficulty sanity', () => {
  it('sequence path length is non-decreasing in level (sampled max)', () => {
    const maxLen: number[] = [];
    for (let level = 1; level <= 10; level++) {
      let m = 0;
      for (let s = 0; s < 80; s++) {
        const item = gen(level, `diff-${level}-${s}`);
        if (specOf(item).taskType === 'ct.sequence') {
          m = Math.max(m, (specOf(item) as CtSequenceSpec).steps.length);
        }
      }
      maxLen[level] = m;
    }
    expect(maxLen[1]).toBeLessThanOrEqual(maxLen[5]);
    expect(maxLen[5]).toBeLessThanOrEqual(maxLen[10]);
  });
  it('debug program length is non-decreasing in level (sampled max)', () => {
    const maxLen: number[] = [];
    for (let level = 1; level <= 10; level++) {
      let m = 0;
      for (let s = 0; s < 80; s++) {
        const item = gen(level, `dbg-${level}-${s}`);
        if (specOf(item).taskType === 'ct.debug') {
          m = Math.max(m, (specOf(item) as CtDebugSpec).program.length);
        }
      }
      maxLen[level] = m;
    }
    expect(maxLen[1]).toBeLessThanOrEqual(maxLen[5]);
    expect(maxLen[5]).toBeLessThanOrEqual(maxLen[10]);
  });
});

describe('CT scoring meta', () => {
  it('select-one and tap-error items carry numeric meta.optionCount', () => {
    for (const item of [...byType('ct.loop'), ...byType('ct.conditional'), ...byType('ct.debug')]) {
      expect(typeof item.meta?.optionCount).toBe('number');
      expect(item.meta!.optionCount).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('CT no forbidden tokens', () => {
  it('payload carries no forbidden tokens (score/percentile/rank/IQ/level N)', () => {
    const forbidden = /(\bIQ\b|score|percent(ile)?|\brank\b|level\s*\d)/i;
    for (let level = 1; level <= 10; level++) {
      for (let s = 0; s < 10; s++) {
        const json = JSON.stringify(specOf(gen(level, `tok-${level}-${s}`)));
        expect(json).not.toMatch(forbidden);
      }
    }
  });
});

describe('CT practice', () => {
  it('practice item is stable, easy, and an open-grid sequence', () => {
    expect(ser(practiceCt())).toBe(ser(practiceCt()));
    expect(practiceCt().level).toBe(1);
    expect(specOf(practiceCt()).taskType).toBe('ct.sequence');
  });
});
