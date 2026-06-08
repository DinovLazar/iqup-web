import {describe, it, expect} from 'vitest';

import {BAND_KEYS, type BandKey} from '@/lib/bands';
import {STRENGTH_CODES, type StrengthCode} from '@/content/strengths';
import {getQuestionsForBand} from '@/content/test';
import {score, TIE_BREAK_ORDER} from './score';
import type {Answers, TestResult} from './types';

/**
 * Build an answer set for a band where exactly `correctByStrength[s]` of each
 * strength's questions are answered correctly; the rest get a deliberately wrong
 * option. Strengths omitted from the map get zero correct.
 */
function buildAnswers(
  band: BandKey,
  correctByStrength: Partial<Record<StrengthCode, number>> = {}
): Answers {
  const remaining: Record<string, number> = {...correctByStrength};
  const answers: Answers = {};
  for (const q of getQuestionsForBand(band)) {
    const want = remaining[q.strength] ?? 0;
    if (want > 0) {
      answers[q.id] = q.correct;
      remaining[q.strength] = want - 1;
    } else {
      const wrong = q.options.find((o) => o.id !== q.correct);
      answers[q.id] = wrong ? wrong.id : q.correct;
    }
  }
  return answers;
}

const allCorrect = (band: BandKey): Answers =>
  Object.fromEntries(
    getQuestionsForBand(band).map((q) => [q.id, q.correct])
  );

/** Recursively collect every object key in a structure. */
function collectKeys(value: unknown, acc: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const v of value) collectKeys(v, acc);
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      acc.add(k);
      collectKeys(v, acc);
    }
  }
  return acc;
}

describe('score — ranking, tiers, and the tie-break', () => {
  it('all-correct ranks purely by the fixed tie-break order (every band)', () => {
    for (const band of BAND_KEYS) {
      const result = score(allCorrect(band), band, 'en');
      // Every ratio is 1.0, so the deterministic tie-break decides the order.
      expect(result.strengths.map((s) => s.code)).toEqual([...TIE_BREAK_ORDER]);
      expect(result.top1).toBe('pattern');
      expect(result.top2).toBe('logic');
      expect(result.top3).toBe('spatial');
      expect(result.growing).toEqual(['numeracy', 'memory', 'words_obs']);
      // Tiers follow rank, regardless of the (perfect) scores.
      expect(result.strengths.map((s) => s.tier)).toEqual([
        'celebrated',
        'celebrated',
        'also',
        'growing',
        'growing',
        'growing'
      ]);
      for (const s of result.strengths) expect(s.ratio).toBe(1);
    }
  });

  it('all-wrong STILL celebrates top1/top2 and frames the rest as growing (spec §3)', () => {
    for (const band of BAND_KEYS) {
      // Empty answers => every question unanswered => every ratio 0.
      const result = score({}, band, 'mk');
      expect(result.strengths.map((s) => s.code)).toEqual([...TIE_BREAK_ORDER]);
      expect(result.strengths[0].tier).toBe('celebrated');
      expect(result.strengths[1].tier).toBe('celebrated');
      expect(result.strengths[2].tier).toBe('also');
      expect(result.strengths.slice(3).every((s) => s.tier === 'growing')).toBe(
        true
      );
      for (const s of result.strengths) expect(s.ratio).toBe(0);
    }
  });

  it('ranks by ratio first, tie-break second (crafted 10–13 set)', () => {
    // words_obs 2/2 = 1.0 (rank 1), spatial 1/2 = 0.5 (rank 2),
    // the remaining four are 0.0 and fall into tie-break order.
    const answers = buildAnswers('10-13', {words_obs: 2, spatial: 1});
    const result = score(answers, '10-13', 'en');

    expect(result.top1).toBe('words_obs');
    expect(result.top2).toBe('spatial');
    expect(result.top3).toBe('pattern'); // first of the 0.0 group by tie-break
    expect(result.growing).toEqual(['logic', 'numeracy', 'memory']);

    const wordsObs = result.strengths.find((s) => s.code === 'words_obs')!;
    const spatial = result.strengths.find((s) => s.code === 'spatial')!;
    expect(wordsObs.ratio).toBe(1);
    expect(spatial.ratio).toBe(0.5);
    expect(wordsObs.tier).toBe('celebrated');
    expect(spatial.tier).toBe('celebrated');
  });

  it('a single fully-correct strength becomes the headline (every band)', () => {
    for (const band of BAND_KEYS) {
      const total = getQuestionsForBand(band).filter(
        (q) => q.strength === 'memory'
      ).length;
      const result = score(buildAnswers(band, {memory: total}), band, 'en');
      expect(result.top1).toBe('memory');
      const memory = result.strengths.find((s) => s.code === 'memory')!;
      expect(memory.ratio).toBe(1);
      expect(memory.rank).toBe(1);
    }
  });
});

describe('score — determinism', () => {
  it('same input → identical output (deep equal), every band', () => {
    for (const band of BAND_KEYS) {
      const answers = buildAnswers(band, {pattern: 1, numeracy: 2});
      const a = score(answers, band, 'mk');
      const b = score(answers, band, 'mk');
      expect(a).toEqual(b);
      // Stable across a fresh object identity too.
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});

describe('score — invariants (no total, no IQ; all six present)', () => {
  const forbidden = [
    'total_score',
    'totalscore',
    'iq',
    'iqscore',
    'score',
    'percentile',
    'overall',
    'grade',
    'pass',
    'fail'
  ];

  it('exposes no aggregate score / IQ field anywhere in the result', () => {
    const result = score(allCorrect('6-9'), '6-9', 'en');
    const keys = collectKeys(result);
    for (const key of keys) {
      expect(forbidden).not.toContain(key.toLowerCase());
    }
    // The serialized payload (what sessionStorage holds) carries no "iq".
    expect(JSON.stringify(result).toLowerCase()).not.toContain('"iq"');
  });

  it('ranks all six strengths, each once, ranks 1..6, ratios within [0,1]', () => {
    for (const band of BAND_KEYS) {
      const result: TestResult = score(
        buildAnswers(band, {logic: 1}),
        band,
        'en'
      );
      expect(result.strengths).toHaveLength(6);

      const codes = result.strengths.map((s) => s.code).sort();
      expect(codes).toEqual([...STRENGTH_CODES].sort());

      const ranks = result.strengths.map((s) => s.rank).sort((x, y) => x - y);
      expect(ranks).toEqual([1, 2, 3, 4, 5, 6]);

      for (const s of result.strengths) {
        expect(s.ratio).toBeGreaterThanOrEqual(0);
        expect(s.ratio).toBeLessThanOrEqual(1);
        expect(s.hits).toBeLessThanOrEqual(s.total);
        expect(s.total).toBeGreaterThan(0); // every strength present in the band
      }
    }
  });

  it('carries the band and locale through to the result', () => {
    const result = score({}, '3-5', 'mk');
    expect(result.band).toBe('3-5');
    expect(result.locale).toBe('mk');
    expect(result.version).toBe(1);
    // Pure scoring does not stamp a timestamp.
    expect(result.completedAt).toBeUndefined();
  });
});
