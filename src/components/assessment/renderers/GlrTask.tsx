/**
 * Glr renderer (Learning & STEM) — the `match-pairs` paired-associate task
 * (`glr.pairedAssociate`). Two phases per attempt:
 *
 *   • STUDY  — show the full learned set (`spec.pairs`) as cue → target rows so
 *              the child can memorise them. Re-shown every attempt (the block is
 *              re-tested across attempts to drive the learning slope). The child
 *              proceeds with an explicit "ready" affordance — never a forced
 *              timeout — so reduced-motion and slow readers stay in control.
 *   • RECALL — for each `spec.trials[i]` show the cue and its shuffled `options`
 *              as large tappable glyph buttons; the child picks the target they
 *              think matches. Trials are stacked, each its own option row, so the
 *              whole recall is visible and keyboard-navigable at once.
 *
 * The reported answer is `Glyph[]` aligned to `trials` order: `answer[i]` = the
 * chosen target glyph for `trials[i]`. That is exactly what `pairsJudge` compares
 * against `solution.answer` (`chosen[i] === answer[i]`), so a child who picks
 * each trial's true target scores `correct`. The renderer NEVER reads `solution`.
 *
 * Progress is shown as filled pips (one per trial) — never digits / "N of M" / %.
 * No Bibi/characters, no localized literals (all text via `copy`).
 */
'use client';

import {useMemo, useState} from 'react';
import {m} from 'framer-motion';
import {Check} from 'lucide-react';
import type {GlrPairedSpec} from '@/content/tasks';
import type {Glyph as GlyphToken} from '@/content/tasks';
import {cn} from '@/lib/utils';
import {TaskFrame} from '../TaskFrame';
import {Glyph} from '../visuals/Glyph';
import {ConfirmAction} from './ConfirmAction';
import type {TaskRendererProps} from '../types';

/** A single cue → target row shown in the study phase. */
function StudyPair({
  cue,
  target,
  size
}: {
  cue: GlyphToken;
  target: GlyphToken;
  size: number;
}) {
  return (
    <li className="flex items-center justify-center gap-3 rounded-card border-2 border-border bg-field px-4 py-3">
      <Glyph glyph={cue} size={size} title={cue} />
      <span aria-hidden className="font-brand text-2xl font-bold text-ink-faint">
        =
      </span>
      <Glyph glyph={target} color="yellow" size={size} title={target} />
    </li>
  );
}

/** The study phase: the full learned set + a "ready" affordance to start recall. */
function StudyPhase({
  spec,
  assist,
  ready,
  onReady
}: {
  spec: GlrPairedSpec;
  assist: boolean;
  ready: string;
  onReady: () => void;
}) {
  const size = assist ? 48 : 40;
  return (
    <>
      <ul className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
        {spec.pairs.map((pair, i) => (
          <StudyPair key={i} cue={pair.cue} target={pair.target} size={size} />
        ))}
      </ul>
      <div className="mt-6 w-full max-w-md">
        <button
          type="button"
          onClick={onReady}
          className={cn(
            'flex min-h-tap w-full items-center justify-center gap-2 rounded-card bg-iq-violet px-8 font-brand text-base font-semibold text-white transition-colors hover:bg-iq-violet/90',
            'focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none'
          )}
        >
          {ready}
        </button>
      </div>
    </>
  );
}

/** One recall trial: the cue plus its shuffled option buttons. */
function RecallTrial({
  cue,
  options,
  selected,
  assist,
  cueLabel,
  onSelect
}: {
  cue: GlyphToken;
  options: GlyphToken[];
  selected: GlyphToken | null;
  assist: boolean;
  cueLabel: string;
  onSelect: (target: GlyphToken) => void;
}) {
  const cueSize = assist ? 52 : 44;
  const optSize = assist ? 44 : 38;
  return (
    <div
      className="flex w-full flex-col items-center gap-3 rounded-card-lg border-2 border-border bg-field p-3 sm:flex-row sm:items-center sm:gap-4"
      role="group"
      aria-label={cueLabel}
    >
      <div className="flex shrink-0 items-center justify-center rounded-card bg-card px-3 py-2">
        <Glyph glyph={cue} size={cueSize} title={cue} />
      </div>
      <span aria-hidden className="font-brand text-xl font-bold text-ink-faint">
        →
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          return (
            <button
              // options can repeat glyph tokens across positions only by index, so key by index
              key={i}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(opt)}
              className={cn(
                'relative flex min-h-tap min-w-tap items-center justify-center rounded-card border-2 bg-card p-2 transition-colors',
                'focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none',
                isSelected
                  ? 'border-iq-violet ring-3 ring-iq-violet/40'
                  : 'border-border hover:border-iq-violet/60'
              )}
            >
              <Glyph glyph={opt} color="yellow" size={optSize} title={opt} />
              {isSelected && (
                <span
                  aria-hidden
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-iq-violet text-white shadow"
                >
                  <Check className="size-4" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Non-numeric progress: one filled pip per trial answered. Conveys progress by
 * fill + count of dots only — never a "N of M" / digit / %.
 */
function TrialPips({total, filled}: {total: number; filled: number}) {
  return (
    <span aria-hidden className="flex items-center justify-center gap-1.5">
      {Array.from({length: total}, (_, i) => (
        <span
          key={i}
          className={cn(
            'inline-flex size-2.5 rounded-full transition-colors',
            i < filled ? 'bg-iq-yellow' : 'bg-iq-grey/30'
          )}
        />
      ))}
    </span>
  );
}

export function GlrTask({spec, copy, reducedMotion, assist, onAnswer}: TaskRendererProps) {
  const paired = spec as GlrPairedSpec;
  const trials = paired.trials;

  const [phase, setPhase] = useState<'study' | 'recall'>('study');
  // One chosen target per trial, aligned to `trials` order; null = unanswered.
  const [chosen, setChosen] = useState<(GlyphToken | null)[]>(() =>
    trials.map(() => null)
  );

  const filled = useMemo(() => chosen.filter((c) => c !== null).length, [chosen]);
  const allChosen = filled === trials.length && trials.length > 0;

  const select = (trialIndex: number, target: GlyphToken) => {
    setChosen((prev) => {
      const next = prev.slice();
      next[trialIndex] = target;
      return next;
    });
  };

  const submit = () => {
    if (!allChosen) return;
    // answer[i] = chosen target for trials[i] — exactly what the judge compares.
    const answer = chosen as GlyphToken[];
    onAnswer(answer);
  };

  const Reveal = reducedMotion ? 'div' : m.div;
  const revealProps = reducedMotion
    ? {}
    : {
        initial: {opacity: 0, y: 6},
        animate: {opacity: 1, y: 0},
        transition: {duration: 0.25, ease: 'easeOut' as const}
      };

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        phase === 'recall' ? (
          <>
            <ConfirmAction
              label={copy.confirm}
              disabled={!allChosen}
              onConfirm={submit}
            />
            <div className="flex items-center justify-center">
              <TrialPips total={trials.length} filled={filled} />
            </div>
          </>
        ) : undefined
      }
    >
      {phase === 'study' ? (
        <Reveal className="flex w-full flex-col items-center" {...revealProps}>
          <StudyPhase
            spec={paired}
            assist={assist}
            ready={copy.reveal.ready}
            onReady={() => setPhase('recall')}
          />
        </Reveal>
      ) : (
        <Reveal className="flex w-full flex-col items-center gap-3" {...revealProps}>
          {trials.map((trial, i) => (
            <RecallTrial
              key={i}
              cue={trial.cue}
              options={trial.options}
              selected={chosen[i]}
              assist={assist}
              cueLabel={copy.reveal.yourTurn}
              onSelect={(target) => select(i, target)}
            />
          ))}
        </Reveal>
      )}
    </TaskFrame>
  );
}
