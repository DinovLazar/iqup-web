'use client';

import {RadioGroup} from 'radix-ui';
import {Check} from 'lucide-react';
import type {Locale} from '@/content/locale';
import type {TestOption} from '@/content/test/types';
import {cn} from '@/lib/utils';
import {Glyph} from './visuals';

/** Cyrillic option keys for MK, Latin for EN (decorative; alt = the label). */
const LETTERS: Record<Locale, string[]> = {
  mk: ['А', 'Б', 'В', 'Г'],
  en: ['A', 'B', 'C', 'D']
};

/**
 * One answer tile, built on a Radix RadioGroup.Item (handover §B.2): a large,
 * keyboard-operable target with selected feedback by **icon + colour** (a check
 * badge + ring), never colour alone. Its accessible name is the option `label`,
 * which doubles as the alt-text for image options.
 */
export function OptionTile({
  option,
  index,
  selected,
  variant,
  locale
}: {
  option: TestOption;
  index: number;
  selected: boolean;
  variant: 'image' | 'text';
  locale: Locale;
}) {
  const glyphCount = option.glyphs?.length ?? 0;
  const glyphSize = glyphCount > 1 ? 40 : 76;

  return (
    <RadioGroup.Item
      value={option.id}
      aria-label={option.label[locale]}
      className={cn(
        'group relative flex rounded-2xl border-2 bg-card text-left transition-all outline-none',
        'focus-visible:ring-3 focus-visible:ring-ring/50',
        variant === 'image'
          ? 'min-h-36 flex-col items-center justify-center gap-3 p-4'
          : 'min-h-[3.5rem] items-center gap-3 px-4 py-3',
        selected
          ? 'border-brand-blue bg-secondary-tint shadow-sm'
          : 'border-border hover:-translate-y-0.5 hover:border-brand-blue/60'
      )}
    >
      {variant === 'image' ? (
        <>
          <span className="flex flex-wrap items-center justify-center gap-1.5">
            {option.glyphs?.map((g, i) => (
              <Glyph key={i} spec={g} size={glyphSize} />
            ))}
          </span>
          <span className="text-center text-sm font-semibold text-ink">
            {option.label[locale]}
          </span>
        </>
      ) : (
        <>
          <span
            aria-hidden
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg font-display text-base font-bold transition-colors',
              selected
                ? 'bg-brand-blue text-white'
                : 'bg-secondary-tint text-secondary-ink'
            )}
          >
            {LETTERS[locale][index] ?? index + 1}
          </span>
          <span className="font-display text-base font-bold text-ink">
            {option.label[locale]}
          </span>
        </>
      )}

      {/* Selected feedback: a check badge (icon + colour, not colour alone). */}
      <span
        aria-hidden
        className={cn(
          'absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-brand-blue text-white transition-opacity',
          selected ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
    </RadioGroup.Item>
  );
}
