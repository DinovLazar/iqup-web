'use client';

import {useCallback, useMemo, useState} from 'react';
import {ArrowRight} from 'lucide-react';
import type {Locale} from '@/content/locale';
import {getQuestionsForBand} from '@/content/test';
import type {TestQuestion} from '@/content/test/types';
import type {BandKey} from '@/lib/bands';
import {score, TEST_RESULT_STORAGE_KEY, type Answers, type TestResult} from '@/lib/scoring';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import type {TestCopy} from './copy';
import {fillTemplate} from './copy';
import {CompletionView} from './CompletionView';
import {DevBar} from './DevBar';
import {ProgressHeader} from './ProgressHeader';
import {QuestionView} from './QuestionView';
import {StartScreen} from './StartScreen';

type Phase = 'start' | 'running' | 'complete';

/**
 * The one interactive island for the test. Resolves its band's questions, runs
 * them one at a time (progress, Back/Next, the reveal mechanic), and on the final
 * answer computes the `TestResult`, persists it to sessionStorage, and shows the
 * temporary completion view. All chrome copy arrives as props (resolved server-
 * side) so the island ships no translation runtime.
 */
export function TestRunner({
  band,
  bandLabel,
  locale,
  copy,
  dev = false
}: {
  band: BandKey;
  bandLabel: string;
  locale: Locale;
  copy: TestCopy;
  dev?: boolean;
}) {
  const questions = useMemo<TestQuestion[]>(
    () => getQuestionsForBand(band),
    [band]
  );
  const total = questions.length;

  const [phase, setPhase] = useState<Phase>('start');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<TestResult | null>(null);

  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;
  const isLast = index === total - 1;

  // Compute → persist → hand off. This is the seam Phase 1.08 plugs into.
  const finishWith = useCallback(
    (finalAnswers: Answers) => {
      const computed = score(finalAnswers, band, locale);
      computed.completedAt = new Date().toISOString();
      try {
        // Persist to sessionStorage (NOT the URL) so the result survives the
        // navigation into the email gate without leaking child data.
        window.sessionStorage.setItem(
          TEST_RESULT_STORAGE_KEY,
          JSON.stringify(computed)
        );
      } catch {
        // Storage may be unavailable (private mode); the in-memory result still
        // drives the completion view. 1.08 will re-validate presence of the key.
      }
      // HANDOFF (1.08): email gate intercepts here before results
      setResult(computed);
      setPhase('complete');
    },
    [band, locale]
  );

  const handleSelect = useCallback(
    (optionId: string) => {
      setAnswers((prev) => ({...prev, [current.id]: optionId}));
    },
    [current]
  );

  const handleBack = useCallback(() => {
    setIndex((i) => {
      if (i > 0) return i - 1;
      setPhase('start');
      return 0;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      finishWith(answers);
    } else {
      setIndex((i) => i + 1);
    }
  }, [isLast, finishWith, answers]);

  // Dev-only: synthesise a full answer set and jump straight to the result.
  const handleAutoFill = useCallback(
    (variant: 'correct' | 'mixed' | 'wrong') => {
      const built: Answers = {};
      questions.forEach((q, i) => {
        const wrong = q.options.find((o) => o.id !== q.correct);
        if (variant === 'correct') built[q.id] = q.correct;
        else if (variant === 'wrong') built[q.id] = wrong ? wrong.id : q.correct;
        else built[q.id] = i % 2 === 0 ? q.correct : wrong ? wrong.id : q.correct;
      });
      setAnswers(built);
      finishWith(built);
    },
    [questions, finishWith]
  );

  return (
    <>
      <div className={cn('mx-auto w-full max-w-xl px-4 py-6 sm:py-8', dev && 'pb-20')}>
        {phase === 'start' && (
          <StartScreen
            bandLabel={bandLabel}
            count={total}
            copy={copy}
            onStart={() => {
              setIndex(0);
              setPhase('running');
            }}
          />
        )}

        {phase === 'running' && current && (
          <div className="flex flex-col gap-6">
            <ProgressHeader
              current={index + 1}
              total={total}
              backLabel={copy.back}
              progressLabel={fillTemplate(copy.progress, {
                current: index + 1,
                total
              })}
              progressAria={fillTemplate(copy.progressAria, {
                current: index + 1,
                total
              })}
              onBack={handleBack}
            />

            <QuestionView
              key={current.id}
              question={current}
              selected={selected}
              onSelect={handleSelect}
              copy={copy}
              locale={locale}
            />

            <Button
              type="button"
              onClick={handleNext}
              disabled={!selected}
              className="h-14 w-full rounded-xl bg-hero px-8 font-display text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
            >
              {isLast ? copy.finish : copy.next}
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          </div>
        )}

        {phase === 'complete' && (
          <CompletionView copy={copy} dev={dev} result={result} locale={locale} />
        )}
      </div>

      {dev && <DevBar band={band} onAutoFill={handleAutoFill} />}
    </>
  );
}
