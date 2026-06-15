import {describe, it, expect} from 'vitest';

import {BAND_KEYS, type BandKey} from '@/lib/bands';
import {STRENGTH_CODES, type StrengthCode} from '@/content/strengths';
import {getQuestionsForBand} from '@/content/test';
import {toTopStrengths} from '@/lib/leads/lead-mapping';
import {score, TIE_BREAK_ORDER} from './score';
import {reconstructResult} from './reconstruct';
import type {Answers} from './types';

/**
 * Build an answer set where exactly `correctByStrength[s]` of each strength's
 * questions are correct; the rest get a wrong option. (Mirrors score.test.ts.)
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
  Object.fromEntries(getQuestionsForBand(band).map((q) => [q.id, q.correct]));

describe('reconstructResult — reproduces the on-screen ranking from the lead summary', () => {
  // A spread of answer shapes per band: perfect, empty, and several crafted mixes.
  const PATTERNS: Array<Partial<Record<StrengthCode, number>> | 'all' | 'none'> = [
    'all',
    'none',
    {words_obs: 2, spatial: 1},
    {memory: 3, numeracy: 1},
    {pattern: 1, logic: 1, memory: 1},
    {numeracy: 2, words_obs: 1, spatial: 2}
  ];

  it('matches score()’s exact ranking + tiers for every band × answer shape', () => {
    for (const band of BAND_KEYS) {
      for (const pattern of PATTERNS) {
        const answers =
          pattern === 'all'
            ? allCorrect(band)
            : pattern === 'none'
              ? {}
              : buildAnswers(band, pattern);
        const onScreen = score(answers, band, 'mk');

        // The lead stores ONLY this rounded ratio map — reconstruct from it.
        const {scores} = toTopStrengths(onScreen);
        const rebuilt = reconstructResult(scores, band, 'mk');

        const label = `${band} / ${JSON.stringify(pattern)}`;
        expect(rebuilt.strengths.map((s) => s.code), label).toEqual(
          onScreen.strengths.map((s) => s.code)
        );
        expect(rebuilt.strengths.map((s) => s.tier), label).toEqual(
          onScreen.strengths.map((s) => s.tier)
        );
        expect([rebuilt.top1, rebuilt.top2, rebuilt.top3], label).toEqual([
          onScreen.top1,
          onScreen.top2,
          onScreen.top3
        ]);
        expect(rebuilt.growing, label).toEqual(onScreen.growing);
        expect(rebuilt.band, label).toBe(band);
        expect(rebuilt.locale, label).toBe('mk');
        expect(rebuilt.version, label).toBe(1);
      }
    }
  });
});

describe('reconstructResult — determinism and edge cases', () => {
  it('ranks an all-equal score map purely by the fixed tie-break order', () => {
    const flat: Record<string, number> = {};
    for (const code of STRENGTH_CODES) flat[code] = 0.5;
    const result = reconstructResult(flat, '6-9', 'en');
    expect(result.strengths.map((s) => s.code)).toEqual([...TIE_BREAK_ORDER]);
    expect(result.strengths.map((s) => s.tier)).toEqual([
      'celebrated',
      'celebrated',
      'also',
      'growing',
      'growing',
      'growing'
    ]);
  });

  it('ranks all six strengths exactly once, ranks 1..6', () => {
    const scores: Record<string, number> = {
      pattern: 0.2,
      logic: 0.8,
      memory: 0.4,
      spatial: 1,
      numeracy: 0,
      words_obs: 0.6
    };
    const result = reconstructResult(scores, '10-13', 'en');
    expect(result.top1).toBe('spatial');
    expect(result.strengths.map((s) => s.code)).toEqual([
      'spatial',
      'logic',
      'words_obs',
      'memory',
      'pattern',
      'numeracy'
    ]);
    expect(result.strengths.map((s) => s.rank)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.strengths.map((s) => s.ratio)).toEqual([1, 0.8, 0.6, 0.4, 0.2, 0]);
  });

  it('treats a strength missing from the score map as 0 (defensive)', () => {
    const partial: Record<string, number> = {pattern: 0.9}; // others absent
    const result = reconstructResult(partial, '3-5', 'mk');
    expect(result.strengths).toHaveLength(6);
    expect(result.top1).toBe('pattern');
    expect(result.strengths.map((s) => s.code).sort()).toEqual(
      [...STRENGTH_CODES].sort()
    );
    // The five absent strengths are all 0 and fall into tie-break order.
    expect(result.growing.length).toBe(3);
  });

  it('exposes no aggregate score / IQ field (same invariant as score())', () => {
    const result = reconstructResult({pattern: 0.5}, '6-9', 'en');
    expect(JSON.stringify(result).toLowerCase()).not.toContain('"iq"');
    expect(JSON.stringify(result).toLowerCase()).not.toContain('total_score');
  });
});
