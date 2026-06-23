/**
 * The **select-one** interaction primitive (interaction `mode: 'select-one'`):
 * pick exactly one option. Built on a Radix RadioGroup so it is keyboard-operable
 * (arrow keys + Space) with a visible focus ring; selection feedback is a ring +
 * check badge (icon + colour, never colour alone). The renderer supplies how each
 * option draws (`renderOption`) and its locale-neutral accessible name
 * (`optionLabel`). Reports the chosen 0-based index — which IS the canonical
 * `Response.answer` for `select-one` and the `selectedPosition` telemetry.
 */
'use client';

import {RadioGroup} from 'radix-ui';
import {Check} from 'lucide-react';
import {cn} from '@/lib/utils';

export function SelectOneGrid({
  count,
  selected,
  onSelect,
  renderOption,
  optionLabel,
  columns = 2,
  assist = false
}: {
  count: number;
  selected: number | null;
  onSelect: (index: number) => void;
  renderOption: (index: number) => React.ReactNode;
  optionLabel: (index: number) => string;
  /** Grid columns; 2 by default (4-option tasks → 2×2). */
  columns?: 2 | 3 | 4;
  assist?: boolean;
}) {
  return (
    <RadioGroup.Root
      className={cn(
        'grid w-full max-w-md gap-3',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-2 sm:grid-cols-4'
      )}
      value={selected === null ? undefined : String(selected)}
      onValueChange={(v) => onSelect(Number(v))}
      aria-label={optionLabel(-1) || undefined}
    >
      {Array.from({length: count}, (_, i) => {
        const isSel = selected === i;
        return (
          <RadioGroup.Item
            key={i}
            value={String(i)}
            aria-label={optionLabel(i)}
            className={cn(
              'group relative flex min-h-tap items-center justify-center rounded-card border-2 bg-card p-3 outline-none transition-all',
              'aspect-square focus-visible:ring-3 focus-visible:ring-iq-violet/50',
              assist && 'p-4',
              isSel
                ? 'border-iq-violet bg-iq-violet/5 shadow-sm'
                : 'border-border hover:-translate-y-0.5 hover:border-iq-violet/60'
            )}
          >
            <span className="pointer-events-none flex items-center justify-center">
              {renderOption(i)}
            </span>
            <span
              aria-hidden
              className={cn(
                'absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-iq-violet text-white transition-opacity',
                isSel ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Check className="size-4" strokeWidth={3} />
            </span>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
