/**
 * The 5–7 parent-assist gate (spec 7.4) — a HARD pre-start rule: a parent may
 * help technically (read the instruction, steady the device) but must let the
 * child choose the answer. Shown only for ages 5–7; 8+ goes straight in solo.
 * Gated by a confirmation checkbox before the flow can start.
 */
'use client';

import {useState} from 'react';
import {Check} from 'lucide-react';
import {cn} from '@/lib/utils';
import {ConfirmAction} from '../renderers/ConfirmAction';
import type {AssessmentCopy} from '../copy';

export function ParentAssist({
  copy,
  onConfirm
}: {
  copy: AssessmentCopy['assist'];
  onConfirm: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <p className="font-brand text-sm font-bold tracking-wide text-iq-violet uppercase">
        {copy.forParent}
      </p>
      <h1 className="font-brand text-2xl font-extrabold text-ink text-balance">
        {copy.title}
      </h1>
      <p className="text-ink-soft">{copy.body}</p>

      <ul className="flex flex-col gap-2">
        {copy.rules.map((rule, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-card bg-field px-4 py-3 text-ink"
          >
            <Check className="mt-0.5 size-5 shrink-0 text-iq-teal" aria-hidden strokeWidth={3} />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <label className="flex cursor-pointer items-start gap-3 rounded-card border-2 border-border bg-card p-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => setChecked((c) => !c)}
          className={cn(
            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
            'focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none',
            checked ? 'border-iq-violet bg-iq-violet text-white' : 'border-ink-faint bg-card'
          )}
        >
          {checked && <Check className="size-4" strokeWidth={3} aria-hidden />}
        </button>
        <span className="font-medium text-ink">{copy.checkbox}</span>
      </label>

      <ConfirmAction label={copy.confirm} disabled={!checked} onConfirm={onConfirm} />
    </div>
  );
}
