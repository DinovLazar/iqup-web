/**
 * Age setup — the child's exact age (5–13) which drives the engine's start level
 * + format. **No child name is collected** (spec Дел 14 / GDPR: no PII in the
 * assessment). Brief, friendly instructions. Large keyboard-operable age buttons.
 */
'use client';

import {useState} from 'react';
import {cn} from '@/lib/utils';
import {ConfirmAction} from '../renderers/ConfirmAction';
import type {AssessmentCopy} from '../copy';

const AGES = [5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export function AgeSetup({
  copy,
  onAge
}: {
  copy: AssessmentCopy['setup'];
  onAge: (age: number) => void;
}) {
  const [age, setAge] = useState<number | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="font-brand text-2xl font-extrabold text-ink text-balance">
          {copy.title}
        </h1>
        <p className="text-ink-soft">{copy.lead}</p>
      </header>

      <fieldset className="flex flex-col gap-3 rounded-card-lg border-2 border-border bg-card p-5">
        <legend className="px-1 font-brand text-base font-bold text-ink">
          {copy.ageQuestion}
        </legend>
        <p className="text-sm text-ink-soft">{copy.ageHint}</p>
        <div className="mt-1 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {AGES.map((a) => {
            const selected = age === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAge(a)}
                aria-pressed={selected}
                aria-label={copy.ariaAge.replace('{age}', String(a))}
                className={cn(
                  'flex min-h-tap items-center justify-center rounded-card border-2 font-brand text-lg font-bold transition-all',
                  'focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none',
                  selected
                    ? 'border-iq-violet bg-iq-violet text-white shadow-sm'
                    : 'border-border bg-card text-ink hover:-translate-y-0.5 hover:border-iq-violet/60'
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </fieldset>

      <ConfirmAction
        label={copy.start}
        disabled={age === null}
        onConfirm={() => age !== null && onAge(age)}
      />
    </div>
  );
}
