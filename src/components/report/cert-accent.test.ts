import {describe, it, expect} from 'vitest';

import {contrastRatio} from '@/lib/a11y/contrast';
import type {IndexId} from '@/lib/scoring/v2';
import {INDEX_ORDER} from './index-meta';
import {certAccent, certMonthYear, type AccentHue} from './cert-model';

/**
 * Index-hue hexes — MIRROR of `src/app/globals.css` (`--ix-*`). Kept here only to
 * verify the certificate's AA contrast (the test can't read CSS vars). If
 * globals.css changes an index colour, update this table.
 */
const IX_HEX: Record<AccentHue, {solid: string; tint: string; ink: string}> = {
  logic: {solid: '#ec008c', tint: '#fbddef', ink: '#a8005e'},
  spatial: {solid: '#00b6f1', tint: '#daf1fc', ink: '#0a6a8c'},
  memory: {solid: '#00b9ad', tint: '#d9f3f0', ink: '#07655e'},
  planning: {solid: '#f7941d', tint: '#fdebd3', ink: '#97550a'},
  learning: {solid: '#ffc20e', tint: '#fff2cc', ink: '#806100'}
};

// Constant certificate colours (globals.css), all on the white card (`--surface`).
const WHITE = '#ffffff';
const INK_HEAD = '#3b4757';
const INK_MUTED = '#5a6675';
const ACTION = '#762d90';
const ACTION_INK = '#5e2274';

describe('certAccent — deterministic per-child accent from the top strength', () => {
  it('maps each index to its locked hue (matches the pentagon / index cards)', () => {
    const expected: Record<IndexId, AccentHue> = {
      logical: 'logic',
      spatial: 'spatial',
      memory_focus: 'memory',
      planning_speed: 'planning',
      learning_stem: 'learning'
    };
    for (const id of INDEX_ORDER) {
      expect(certAccent(id).hue).toBe(expected[id]);
    }
  });

  it('is deterministic — same index gives the same accent tokens', () => {
    expect(certAccent('logical')).toEqual(certAccent('logical'));
    expect(certAccent('learning_stem').tint).toBe('var(--ix-learning-tint)');
    expect(certAccent('spatial').ink).toBe('var(--ix-spatial-ink)');
  });
});

describe('certificate AA contrast (every accent the rule can produce)', () => {
  it('keeps accent-ink text on its tint ≥ 4.5:1 (the tag + strength pills)', () => {
    for (const hue of Object.keys(IX_HEX) as AccentHue[]) {
      const {ink, tint} = IX_HEX[hue];
      expect(contrastRatio(ink, tint), `${hue} ink-on-tint`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps accent-ink text on the white card ≥ 4.5:1 (the optional name)', () => {
    for (const hue of Object.keys(IX_HEX) as AccentHue[]) {
      expect(contrastRatio(IX_HEX[hue].ink, WHITE), `${hue} ink-on-white`).toBeGreaterThanOrEqual(
        4.5
      );
    }
  });

  it('keeps white text on the violet action ≥ 4.5:1 (ribbon + wordmark badge)', () => {
    expect(contrastRatio(WHITE, ACTION)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the constant card text ≥ 4.5:1 (footer, strength line, sign-off)', () => {
    expect(contrastRatio(INK_HEAD, WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(INK_MUTED, WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(ACTION_INK, WHITE)).toBeGreaterThanOrEqual(4.5);
  });

  it('PROVES the raw accent solid is NOT used behind text (it would fail AA)', () => {
    // The certificate never places accent-ink on the saturated accent solid — this
    // documents WHY (e.g. magenta ink-on-solid ≈ 1.75:1). The guard ensures the
    // design rule stays honest if someone later "simplifies" a pill to a solid.
    expect(contrastRatio(IX_HEX.logic.ink, IX_HEX.logic.solid)).toBeLessThan(4.5);
  });
});

describe('certMonthYear — keepsake date (deterministic, no clock)', () => {
  it('formats a YYYY-MM-DD into a localized "month year"', () => {
    expect(certMonthYear('2026-06-23', 'en')).toBe('June 2026');
    expect(certMonthYear('2026-06-23', 'mk')).toBe('јуни 2026');
  });

  it('returns null for an absent or malformed date', () => {
    expect(certMonthYear(null, 'en')).toBeNull();
    expect(certMonthYear('not-a-date', 'mk')).toBeNull();
  });
});
