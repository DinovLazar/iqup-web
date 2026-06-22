/**
 * Composite-index weights (spec Дел 6.3 / Прилог B) — the single, named home for
 * these constants. Indices stay conceptually clean: signals are combined per the
 * spec's exact weights, never blended "for balance" (spec 3.2).
 *
 *   Логичко          = Gf
 *   Просторно        = Gv
 *   Меморија_и_фокус = 0.7·Gsm + 0.3·Внимание
 *   Планирање_брзина = 0.6·EF  + 0.4·Gs
 *   Учење_STEM       = 0.5·CT  + 0.5·Glr
 */
import type {IndexId, Signal} from './types';

/** One weighted signal contributing to an index. */
export interface SignalWeight {
  signal: Signal;
  weight: number;
}

/** The composite definition for every index. Weights within an index sum to 1. */
export const COMPOSITE_WEIGHTS: Readonly<Record<IndexId, readonly SignalWeight[]>> = {
  logical: [{signal: 'Gf', weight: 1}],
  spatial: [{signal: 'Gv', weight: 1}],
  memory_focus: [
    {signal: 'Gsm', weight: 0.7},
    {signal: 'attention', weight: 0.3}
  ],
  planning_speed: [
    {signal: 'EF', weight: 0.6},
    {signal: 'Gs', weight: 0.4}
  ],
  learning_stem: [
    {signal: 'CT', weight: 0.5},
    {signal: 'Glr', weight: 0.5}
  ]
};
