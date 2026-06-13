import {describe, it, expect} from 'vitest';

import {STRENGTH_CODES, STRENGTHS, type StrengthCode} from '@/content/strengths';
import {contrastRatio} from '@/lib/a11y/contrast';
import {
  CERT_CREAM,
  certNameSize,
  certificateStrengthList,
  certificateTint,
  formatCertDate
} from './certificate-model';

/**
 * Strength colour hexes — MIRROR of `src/app/globals.css` (`--strength-*`).
 * Kept here only to verify the tokens' AA contrast (the test can't read CSS
 * vars). If globals.css changes a strength colour, update this table.
 */
const STRENGTH_HEX: Record<
  string,
  {solid: string; tint: string; ink: string}
> = {
  pattern: {solid: '#5b5bd6', tint: '#ecebfb', ink: '#3a33ae'},
  logic: {solid: '#2e7dd1', tint: '#e4f0fb', ink: '#18558f'},
  memory: {solid: '#e05a8a', tint: '#fce7ef', ink: '#a8295c'},
  spatial: {solid: '#109b8e', tint: '#ddf3f0', ink: '#0a625a'},
  numeracy: {solid: '#e08a12', tint: '#fcefd6', ink: '#8a5206'},
  verbal: {solid: '#2e9e58', tint: '#e2f4e8', ink: '#1a6638'}
};

// Constant certificate / profile text colours (globals.css), all on cream.
const INK = '#241f36';
const INK_SOFT = '#5a5570';
const INK_FAINT = '#8a8499';
const SECONDARY_INK = '#0e5278';

describe('certificate tint (deterministic, per-child)', () => {
  it('blends top1 → top2 tints and uses top1 for the flourish', () => {
    const tint = certificateTint(['pattern', 'spatial']);
    expect(tint.tintA).toBe('var(--strength-pattern-tint)');
    expect(tint.tintB).toBe('var(--strength-spatial-tint)');
    expect(tint.flourish).toBe('var(--strength-pattern)');
    expect(tint.charA).toBe('var(--strength-pattern)');
    expect(tint.charB).toBe('var(--strength-spatial)');
  });

  it('maps the words_obs code to the verbal colour token', () => {
    const tint = certificateTint(['words_obs', 'memory']);
    expect(tint.tintA).toBe('var(--strength-verbal-tint)');
    expect(tint.flourish).toBe('var(--strength-verbal)');
  });

  it('is deterministic — same celebrated strengths give the same tint', () => {
    expect(certificateTint(['logic', 'numeracy'])).toEqual(
      certificateTint(['logic', 'numeracy'])
    );
  });

  it('falls back to a lighter mix when only one strength is celebrated', () => {
    const tint = certificateTint(['memory']);
    expect(tint.tintA).toBe('var(--strength-memory-tint)');
    expect(tint.tintB).toContain('color-mix');
    expect(tint.flourish).toBe('var(--strength-memory)');
  });
});

describe('certificate AA contrast (every tint the rule can produce)', () => {
  it('keeps celebrated-chip text (strength ink on its tint) ≥ 4.5:1', () => {
    for (const code of STRENGTH_CODES) {
      const {token} = STRENGTHS[code];
      const {ink, tint} = STRENGTH_HEX[token];
      expect(contrastRatio(ink, tint), `${code} ink-on-tint`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps the constant cream-background text ≥ 4.5:1 (≥ 3:1 for the large date)', () => {
    expect(contrastRatio(INK, CERT_CREAM)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(INK_SOFT, CERT_CREAM)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(SECONDARY_INK, CERT_CREAM)).toBeGreaterThanOrEqual(4.5);
    // ink-faint is used ONLY for the large date line → large-text AA (3:1).
    expect(contrastRatio(INK_FAINT, CERT_CREAM)).toBeGreaterThanOrEqual(3);
  });
});

describe('certificate name sizing', () => {
  it('steps the font down for longer names', () => {
    expect(certNameSize('Ива')).toBe('base');
    expect(certNameSize('Marko')).toBe('base');
    expect(certNameSize('Aleksandar')).toBe('long');
    expect(certNameSize('Konstantin Petar')).toBe('xlong');
  });
});

describe('certificate date formatting', () => {
  const d = new Date(2026, 5, 13); // 13 June 2026 (month is 0-based)

  it('orders the date per locale with localized month names', () => {
    expect(formatCertDate(d, 'en')).toBe('June 13, 2026');
    expect(formatCertDate(d, 'mk')).toBe('13 јуни 2026');
  });
});

describe('certificate strength list (alt text)', () => {
  it('joins the celebrated display names naturally per locale', () => {
    const codes: StrengthCode[] = ['pattern', 'spatial'];
    expect(certificateStrengthList(codes, 'en')).toBe(
      'Pattern Spotting and Shapes & Space'
    );
    expect(certificateStrengthList(codes, 'mk')).toBe(
      'Откривање шаблони и Форми и простор'
    );
  });
});
