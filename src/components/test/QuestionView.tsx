'use client';

import {useEffect, useId, useState} from 'react';
import {RadioGroup} from 'radix-ui';
import {useReducedMotion} from 'framer-motion';
import {Brain, Eye} from 'lucide-react';
import type {Locale} from '@/content/locale';
import type {TestQuestion} from '@/content/test/types';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import type {TestCopy} from './copy';
import {OptionTile} from './OptionTile';
import {StrengthChip} from './StrengthChip';
import {StemVisual} from './visuals';

type RevealPhase = 'intro' | 'show' | 'answer';

/**
 * Renders a single question. For memory items (`mechanic: 'reveal'`) it runs the
 * spec §7 reveal flow first: a "Ready?" tap shows the stimulus for `revealMs`
 * then auto-hides (timed) — or, under `prefers-reduced-motion`, a manual "Show"
 * then "I'm ready" with no timer. After the reveal (or immediately, for non-
 * memory items) the prompt + answer tiles appear.
 *
 * The component is keyed by question id by its parent, so all local state resets
 * cleanly on navigation.
 */
export function QuestionView({
  question,
  selected,
  onSelect,
  copy,
  locale
}: {
  question: TestQuestion;
  selected: string | undefined;
  onSelect: (optionId: string) => void;
  copy: TestCopy;
  locale: Locale;
}) {
  const reduceMotion = useReducedMotion();
  const isReveal = question.mechanic === 'reveal';
  const promptId = useId();

  // If the question was already answered (e.g. navigating back then forward),
  // skip straight to the options rather than forcing a re-watch.
  const [phase, setPhase] = useState<RevealPhase>(
    isReveal && !selected ? 'intro' : 'answer'
  );

  const revealMs = question.revealMs ?? 3000;

  // Timed reveal: when motion is allowed, auto-hide the stimulus after revealMs.
  useEffect(() => {
    if (phase !== 'show' || reduceMotion) return;
    const id = window.setTimeout(() => setPhase('answer'), revealMs);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion, revealMs]);

  const hasImages = question.options.some((o) => (o.glyphs?.length ?? 0) > 0);

  // ----- Reveal: intro + stimulus phases -----
  if (isReveal && phase !== 'answer') {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase"
          style={{
            backgroundColor: 'var(--strength-memory-tint)',
            color: 'var(--strength-memory-ink)'
          }}
        >
          <Brain className="size-4" aria-hidden />
          {copy.reveal.title}
        </span>

        {phase === 'intro' ? (
          <>
            <h1 className="max-w-md font-display text-2xl font-bold text-ink text-balance">
              {copy.reveal.intro}
            </h1>
            <Button
              type="button"
              onClick={() => setPhase('show')}
              className="h-14 rounded-xl bg-hero px-8 font-display text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
            >
              <Eye className="size-5" aria-hidden />
              {reduceMotion ? copy.reveal.show : copy.reveal.ready}
            </Button>
          </>
        ) : (
          <>
            <h1 className="font-display text-xl font-bold text-ink-soft" aria-live="polite">
              {copy.reveal.watching}
            </h1>
            {question.stem ? (
              <StemVisual stem={question.stem} locale={locale} className="max-w-md" />
            ) : null}
            {reduceMotion ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPhase('answer')}
                className="h-14 rounded-xl px-8 font-display text-base font-bold"
              >
                {copy.reveal.hide}
              </Button>
            ) : (
              <CountdownBar durationMs={revealMs} />
            )}
          </>
        )}
      </div>
    );
  }

  // ----- Answer phase (and all non-memory questions) -----
  return (
    <div
      key={question.id}
      className="flex flex-col gap-5 duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
    >
      <div className="flex flex-col items-start gap-3">
        <StrengthChip code={question.strength} locale={locale} />
        <h1
          id={promptId}
          className="font-display text-2xl font-bold text-ink text-balance sm:text-3xl"
        >
          {question.prompt[locale]}
        </h1>
      </div>

      {!isReveal && question.stem ? (
        <StemVisual stem={question.stem} locale={locale} />
      ) : null}

      <RadioGroup.Root
        aria-labelledby={promptId}
        value={selected}
        onValueChange={onSelect}
        className={cn(
          'grid gap-3',
          hasImages ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'
        )}
      >
        {question.options.map((option, i) => (
          <OptionTile
            key={option.id}
            option={option}
            index={i}
            selected={selected === option.id}
            variant={hasImages ? 'image' : 'text'}
            locale={locale}
          />
        ))}
      </RadioGroup.Root>
    </div>
  );
}

/**
 * A bar that shrinks from full to empty over `durationMs`. Mounted only for the
 * duration of the timed reveal, so it starts full and animates down on mount
 * (the state flip happens inside requestAnimationFrame, never synchronously in
 * the effect body). Reduced-motion users never see it — they get manual control.
 */
function CountdownBar({durationMs}: {durationMs: number}) {
  const [shrink, setShrink] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShrink(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-secondary-tint">
      <div
        className="h-full rounded-full transition-[width] ease-linear"
        style={{
          width: shrink ? '0%' : '100%',
          transitionDuration: `${durationMs}ms`,
          backgroundColor: 'var(--strength-memory)'
        }}
      />
    </div>
  );
}
