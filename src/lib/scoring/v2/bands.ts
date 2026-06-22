/**
 * Band assignment by 0–100 value (spec 6.4). Returns a STABLE ENUM only — the
 * parent-facing words are copy owned by 3.09 / the report (see the known open
 * question about three vs four zone words, which 3.08/copy reconciles; it does
 * not affect this enum).
 *
 *   ≥ 80 exceptional · 64–79 strong · 45–63 solid · < 45 developing
 */
import {BAND_CUTOFFS} from '@/content/norms';
import type {Band} from './types';

export function bandFor(value: number): Band {
  if (value >= BAND_CUTOFFS.exceptional) return 'exceptional';
  if (value >= BAND_CUTOFFS.strong) return 'strong';
  if (value >= BAND_CUTOFFS.solid) return 'solid';
  return 'developing';
}
