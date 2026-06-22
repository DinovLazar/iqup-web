import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import {generateEf, practiceEf} from './ef';
import {correctAnswerFor, wrongAnswerFor} from './shared';
import type {EfTowerSpec, PegState} from './types';

function gen(level: number, seed: string | number) {
  return generateEf(level, 'standard', makeRng(seed));
}

/** A serialisable projection (drops the judge closure) for byte-identity checks. */
function ser(item: ReturnType<typeof gen>) {
  return JSON.stringify({id: item.id, domain: item.domain, level: item.level, format: item.format, payload: item.payload, meta: item.meta});
}

function payloadOf(item: ReturnType<typeof gen>): EfTowerSpec {
  return item.payload as EfTowerSpec;
}

// ─── An independent BFS, mirroring the generator, to verify minMoves ─────────

const CAPACITIES = [3, 2, 1];
const PEG_COUNT = 3;
function stateKey(s: PegState[]): string {
  return s.map((p) => p.join('.')).join('|');
}
function clone(s: PegState[]): PegState[] {
  return s.map((p) => p.slice());
}
function successors(s: PegState[]): PegState[][] {
  const out: PegState[][] = [];
  for (let f = 0; f < PEG_COUNT; f++) {
    if (s[f].length === 0) continue;
    for (let t = 0; t < PEG_COUNT; t++) {
      if (t === f || s[t].length >= CAPACITIES[t]) continue;
      const n = clone(s);
      n[t].push(n[f].pop() as number);
      out.push(n);
    }
  }
  return out;
}
/** Shortest-move distance from start to goal (−1 if unreachable). */
function bfsDistance(start: PegState[], goal: PegState[]): number {
  const goalKey = stateKey(goal);
  const dist = new Map<string, number>([[stateKey(start), 0]]);
  const queue = [clone(start)];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const d = dist.get(stateKey(cur)) as number;
    if (stateKey(cur) === goalKey) return d;
    for (const next of successors(cur)) {
      const key = stateKey(next);
      if (dist.has(key)) continue;
      dist.set(key, d + 1);
      queue.push(next);
    }
  }
  return dist.has(goalKey) ? (dist.get(goalKey) as number) : -1;
}

/** A peg config is valid: capacities respected, balls 0,1,2 present exactly once. */
function isValidState(state: PegState[]): boolean {
  if (state.length !== PEG_COUNT) return false;
  for (let i = 0; i < PEG_COUNT; i++) if (state[i].length > CAPACITIES[i]) return false;
  const balls = state.flat().sort((a, b) => a - b);
  return balls.length === 3 && balls[0] === 0 && balls[1] === 1 && balls[2] === 2;
}

/** A move that lands the goal in `extra` more moves than minimum (goal still reached). */
type Answer = {finalState: PegState[]; moves: number};

describe('EF determinism + variety', () => {
  it('same (level, format, seed) → byte-identical item', () => {
    expect(ser(gen(4, 'seed-1'))).toBe(ser(gen(4, 'seed-1')));
  });
  it('different seed → different item at the same level', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) seen.add(ser(gen(4, `seed-${s}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('EF BFS correctness — the critical test', () => {
  it('declared minMoves is genuinely the BFS shortest distance start→goal', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const p = payloadOf(gen(level, `bfs-${s}-${level}`));
        expect(bfsDistance(p.start, p.goal)).toBe(p.minMoves);
      }
    }
  });

  it('start and goal are valid configs and start ≠ goal', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const p = payloadOf(gen(level, `valid-${s}-${level}`));
        expect(isValidState(p.start)).toBe(true);
        expect(isValidState(p.goal)).toBe(true);
        expect(stateKey(p.start)).not.toBe(stateKey(p.goal));
        expect(p.minMoves).toBeGreaterThanOrEqual(2);
        expect(p.capacities).toEqual(CAPACITIES);
        expect(p.ballCount).toBe(3);
      }
    }
  });
});

describe('EF answer correctness', () => {
  it('optimal solve → {correct:true, credit:1}; don\'t-move → {correct:false, credit:0}', () => {
    for (let s = 0; s < 60; s++) {
      for (let level = 1; level <= 10; level++) {
        const item = gen(level, `corr-${s}-${level}`);
        const correct = correctAnswerFor(item) as Answer;
        const j = item.judge({itemId: item.id, answer: correct, responseTimeMs: 1000});
        expect(j.correct).toBe(true);
        expect(j.credit).toBe(1);

        const jw = item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1000});
        expect(jw.correct).toBe(false);
        expect(jw.credit).toBe(0);
      }
    }
  });

  it('omitted response → {correct:false, credit:0}', () => {
    const item = gen(3, 'omit');
    const j = item.judge({itemId: item.id, answer: undefined, responseTimeMs: 0, omitted: true});
    expect(j).toEqual({correct: false, credit: 0});
  });

  it('reaching the goal in minMoves+2 moves → correct true but credit < 1', () => {
    for (let s = 0; s < 40; s++) {
      const item = gen(5, `extra-${s}`);
      const p = payloadOf(item);
      const answer: Answer = {finalState: p.goal.map((peg) => peg.slice()), moves: p.minMoves + 2};
      const j = item.judge({itemId: item.id, answer, responseTimeMs: 1000});
      expect(j.correct).toBe(true);
      expect(j.credit).toBeLessThan(1);
      expect(j.credit).toBeCloseTo(p.minMoves / (p.minMoves + 2), 10);
    }
  });
});

describe('EF difficulty sanity', () => {
  it('meta.minMoves is non-decreasing across the sampled levels (note: capped at the high end)', () => {
    const byLevel: number[] = [];
    for (let level = 1; level <= 10; level++) {
      let m = 0;
      for (let s = 0; s < 20; s++) m = Math.max(m, gen(level, `diff-${level}-${s}`).meta?.minMoves ?? 0);
      byLevel[level] = m;
    }
    expect(byLevel[1]).toBeLessThanOrEqual(byLevel[5]);
    expect(byLevel[5]).toBeLessThanOrEqual(byLevel[8]);
    // Low-level spec anchor: level 1 → 2 moves.
    expect(byLevel[1]).toBe(2);
  });
});

describe('EF scoring meta + practice', () => {
  it('every item carries a numeric meta.minMoves matching the payload', () => {
    for (let level = 1; level <= 10; level++) {
      const item = gen(level, `meta-${level}`);
      expect(typeof item.meta?.minMoves).toBe('number');
      expect(item.meta?.minMoves).toBe(payloadOf(item).minMoves);
    }
  });

  it('practice item is stable and has minMoves 2', () => {
    expect(ser(practiceEf())).toBe(ser(practiceEf()));
    expect(practiceEf().level).toBe(1);
    expect(practiceEf().meta?.minMoves).toBe(2);
  });

  it('payload carries no forbidden tokens (score/percentile/rank/IQ/level N)', () => {
    const forbidden = /(\bIQ\b|score|percent(ile)?|\brank\b|level\s*\d)/i;
    for (let level = 1; level <= 10; level++) {
      const json = JSON.stringify(payloadOf(gen(level, `tok-${level}`)));
      expect(json).not.toMatch(forbidden);
    }
  });
});
