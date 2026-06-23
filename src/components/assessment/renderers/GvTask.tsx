/**
 * Gv renderer (Spatial) — mental rotation (`select-one`). Shows the reference
 * polyomino, then asks which option is the same shape turned by the item's angle
 * (the distractors are mirror / wrong-angle / other shapes — `kind` is internal,
 * never shown). Reports the chosen index + `selectedPosition`.
 */
'use client';

import {useState} from 'react';
import type {GvRotationSpec} from '@/content/tasks';
import {TaskFrame} from '../TaskFrame';
import {SelectOneGrid} from '../interactions/SelectOneGrid';
import {PolyShapeGlyph} from '../visuals/Glyph';
import {ConfirmAction} from './ConfirmAction';
import type {TaskRendererProps} from '../types';

export function GvTask({spec, copy, reducedMotion, assist, onAnswer}: TaskRendererProps) {
  const gv = spec as GvRotationSpec;
  const [selected, setSelected] = useState<number | null>(null);

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
        <div className="flex items-center justify-center rounded-card-lg border-2 border-iq-blue/40 bg-field p-3">
          <PolyShapeGlyph shape={gv.base} color="blue" px={120} />
        </div>

        <SelectOneGrid
          count={gv.interaction.optionCount}
          selected={selected}
          onSelect={setSelected}
          columns={gv.interaction.optionCount > 4 ? 3 : 2}
          assist={assist}
          optionLabel={(i) => (i < 0 ? copy.instruction : `option ${i + 1}`)}
          renderOption={(i) => (
            <PolyShapeGlyph shape={gv.options[i].shape} color="purple" px={88} />
          )}
        />
      </div>
    </TaskFrame>
  );
}
