/**
 * Gf renderer (Logical) — the two `select-one` Gf task types:
 *   • `gf.matrix`  — a 3×3 matrix with one missing cell; pick the cell that
 *                    completes the pattern from the options.
 *   • `gf.series`  — a number/shape series with one missing term; pick the term.
 *
 * This is the CANONICAL renderer example for the phase: read the typed `spec`,
 * render bespoke SVG via the shared `Glyph`, drive the shared `SelectOneGrid`,
 * and report the chosen index as the answer + `selectedPosition` telemetry. The
 * answer for `select-one` IS the chosen option index (see `shared.ts` oracle).
 */
'use client';

import {useState} from 'react';
import type {GfMatrixSpec, GfSeriesSpec, MatrixCell} from '@/content/tasks';
import {TaskFrame} from '../TaskFrame';
import {SelectOneGrid} from '../interactions/SelectOneGrid';
import {Glyph} from '../visuals/Glyph';
import {ConfirmAction} from './ConfirmAction';
import type {TaskRendererProps} from '../types';

function MatrixCellView({cell, size = 44}: {cell: MatrixCell; size?: number}) {
  return (
    <Glyph
      glyph={cell.shape}
      color={cell.color}
      count={cell.count}
      rotationDeg={cell.rotationDeg}
      size={cell.count > 1 ? Math.round(size * 0.55) : size}
    />
  );
}

function MatrixGrid({spec}: {spec: GfMatrixSpec}) {
  return (
    <div
      className="grid gap-2"
      style={{gridTemplateColumns: `repeat(${spec.size}, minmax(0, 1fr))`}}
      role="img"
      aria-label="pattern grid"
    >
      {spec.cells.map((cell, i) => (
        <div
          key={i}
          className="flex aspect-square items-center justify-center rounded-lg border-2 border-border bg-field"
          style={{width: 72, height: 72}}
        >
          {cell === null ? (
            <span aria-hidden className="font-brand text-3xl font-bold text-ink-faint">
              ?
            </span>
          ) : (
            <MatrixCellView cell={cell} size={40} />
          )}
        </div>
      ))}
    </div>
  );
}

function SeriesStrip({spec}: {spec: GfSeriesSpec}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" role="img" aria-label="number series">
      {spec.sequence.map((term, i) => (
        <div
          key={i}
          className="flex h-16 min-w-16 items-center justify-center rounded-lg border-2 border-border bg-field px-3 font-brand text-2xl font-bold text-ink"
        >
          {term === null ? (
            <span aria-hidden className="text-ink-faint">?</span>
          ) : (
            term
          )}
        </div>
      ))}
    </div>
  );
}

export function GfTask({spec, copy, reducedMotion, assist, onAnswer}: TaskRendererProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const matrix = spec.taskType === 'gf.matrix' ? (spec as GfMatrixSpec) : null;
  const series = spec.taskType === 'gf.series' ? (spec as GfSeriesSpec) : null;
  const optionCount = (matrix ?? series)!.interaction.optionCount;

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        <ConfirmAction
          label={copy.confirm}
          disabled={selected === null}
          onConfirm={() =>
            selected !== null && onAnswer(selected, {selectedPosition: selected})
          }
        />
      }
    >
      <div className="flex flex-col items-center gap-6">
        {matrix && <MatrixGrid spec={matrix} />}
        {series && <SeriesStrip spec={series} />}

        <SelectOneGrid
          count={optionCount}
          selected={selected}
          onSelect={setSelected}
          columns={optionCount > 4 ? 3 : 2}
          assist={assist}
          optionLabel={(i) => (i < 0 ? copy.instruction : `option ${i + 1}`)}
          renderOption={(i) =>
            matrix ? (
              <MatrixCellView cell={matrix.options[i]} size={40} />
            ) : (
              <span className="font-brand text-2xl font-bold text-ink">
                {series!.options[i]}
              </span>
            )
          }
        />
      </div>
    </TaskFrame>
  );
}
