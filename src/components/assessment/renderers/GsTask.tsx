/**
 * Gs renderer (Planning & speed) — the timed symbol search (`multi-tap-timed`).
 * The ONLY task with a visible countdown. Thin wrapper: the shared `TapField`
 * owns the grid, the countdown, and the marked-cell capture; this reports the
 * marked indices (the canonical answer) + `tappedCells` (smearing telemetry).
 * Time-up auto-submits inside `TapField`.
 */
'use client';

import type {GsSymbolSearchSpec} from '@/content/tasks';
import {TaskFrame} from '../TaskFrame';
import {TapField} from '../interactions/TapField';
import type {TaskRendererProps} from '../types';

export function GsTask({spec, copy, reducedMotion, assist, onAnswer}: TaskRendererProps) {
  const gs = spec as GsSymbolSearchSpec;
  return (
    <TaskFrame instruction={copy.instruction} assist={assist} reducedMotion={reducedMotion}>
      <TapField
        spec={gs}
        targetLabel={copy.timer.label}
        timerLabel={copy.timer.label}
        doneLabel={copy.confirm}
        reducedMotion={reducedMotion}
        assist={assist}
        onSubmit={(indices, tappedCells) =>
          onAnswer(indices, {tappedCells, omitted: tappedCells === 0})
        }
      />
    </TaskFrame>
  );
}
