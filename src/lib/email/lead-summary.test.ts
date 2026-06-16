/**
 * TDD spec for the shared lead-summary presentation helpers (Phase 2.02).
 *
 * Both 2.02 side-effects — the Brevo contact upsert (attributes) and the internal
 * new-lead notification (body) — need a HUMAN-READABLE, digit-free band label
 * (never the internal `band-a/b/c` code) and the shared `SavedLead` context shape.
 * These live here so the two parallel tracks build against one contract.
 */
import {describe, it, expect} from 'vitest';

import {BAND_LABEL, bandLabelFor} from './lead-summary';

describe('BAND_LABEL', () => {
  it('has a label for each canonical band key', () => {
    expect(Object.keys(BAND_LABEL).sort()).toEqual(['10-13', '3-5', '6-9']);
  });

  it('is human-readable and digit-free (so it never trips the no-number guard)', () => {
    for (const label of Object.values(BAND_LABEL)) {
      expect(label.length).toBeGreaterThan(0);
      expect(/\d/.test(label), `"${label}" must contain no digit`).toBe(false);
    }
  });
});

describe('bandLabelFor', () => {
  it('maps every leadSchema band enum to its human label (via the canonical key)', () => {
    expect(bandLabelFor('band-a')).toBe(BAND_LABEL['3-5']);
    expect(bandLabelFor('band-b')).toBe(BAND_LABEL['6-9']);
    expect(bandLabelFor('band-c')).toBe(BAND_LABEL['10-13']);
  });
});
