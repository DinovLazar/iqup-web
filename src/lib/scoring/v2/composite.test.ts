import {describe, expect, it} from 'vitest';
import {compositeValue} from './indices';
import type {Signal, SignalScore} from './types';

/** Build a signals map where each signal's `index` is the given value. */
function signalsFrom(values: Record<Signal, number>): Record<Signal, SignalScore> {
  const out = {} as Record<Signal, SignalScore>;
  for (const k of Object.keys(values) as Signal[]) {
    out[k] = {signal: k, raw: 0, index: values[k], nItems: 5};
  }
  return out;
}

const base: Record<Signal, number> = {
  Gf: 70,
  Gv: 55,
  Gsm: 80,
  Gs: 90,
  attention: 40,
  EF: 60,
  Glr: 70,
  CT: 50
};

describe('compositeValue (spec 6.3 weights)', () => {
  const s = signalsFrom(base);

  it('Logical = Gf', () => {
    expect(compositeValue('logical', s)).toBe(70);
  });

  it('Spatial = Gv', () => {
    expect(compositeValue('spatial', s)).toBe(55);
  });

  it('Memory & focus = 0.7·Gsm + 0.3·attention', () => {
    // 0.7*80 + 0.3*40 = 56 + 12 = 68
    expect(compositeValue('memory_focus', s)).toBe(68);
  });

  it('Planning & speed = 0.6·EF + 0.4·Gs', () => {
    // 0.6*60 + 0.4*90 = 36 + 36 = 72
    expect(compositeValue('planning_speed', s)).toBe(72);
  });

  it('Learning & STEM = 0.5·CT + 0.5·Glr', () => {
    // 0.5*50 + 0.5*70 = 25 + 35 = 60
    expect(compositeValue('learning_stem', s)).toBe(60);
  });

  it('rounds the weighted sum to an integer', () => {
    const s2 = signalsFrom({...base, Gsm: 81, attention: 41}); // 0.7*81+0.3*41 = 56.7+12.3 = 69
    expect(compositeValue('memory_focus', s2)).toBe(69);
  });
});
