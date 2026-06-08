'use client';

import {Clock, ListChecks, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {TestCopy} from './copy';
import {fillTemplate} from './copy';

/**
 * The calm-but-playful test start screen (handover §D "Start"): band pill,
 * encouraging headline, an honest "no right or wrong" line, light meta
 * (game count + minutes) and the big "Let's play" CTA.
 */
export function StartScreen({
  bandLabel,
  count,
  copy,
  onStart
}: {
  bandLabel: string;
  count: number;
  copy: TestCopy;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-secondary-tint px-4 py-1.5 text-sm font-bold text-secondary-ink">
        <Sparkles className="size-4" aria-hidden />
        {bandLabel}
      </span>

      <h1 className="max-w-md font-display text-3xl font-extrabold text-ink text-balance sm:text-4xl">
        {copy.start.title}
      </h1>
      <p className="max-w-md text-lg text-ink-soft text-pretty">
        {copy.start.subtitle}
      </p>

      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <li className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <ListChecks className="size-4 text-secondary-ink" aria-hidden />
          {fillTemplate(copy.start.metaCount, {count})}
        </li>
        <li className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <Clock className="size-4 text-secondary-ink" aria-hidden />
          {copy.start.metaTime}
        </li>
      </ul>

      <Button
        type="button"
        onClick={onStart}
        className="mt-2 h-14 rounded-xl bg-hero px-10 font-display text-lg font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
      >
        {copy.start.cta}
      </Button>
    </div>
  );
}
