/**
 * The not-representative outcome (spec 7.1): a STRONG validity flag → withhold the
 * confident profile and gently invite a retry "in a calm moment". Framed warmly,
 * never as failure and never negatively to the child. The retry regenerates a
 * fresh item set (a new seed → new tasks; the determinism guarantee gives a clean
 * second attempt).
 */
'use client';

import {RefreshCw} from 'lucide-react';
import {ConfirmAction} from '../renderers/ConfirmAction';
import type {AssessmentCopy} from '../copy';

export function RetryScreen({
  copy,
  onRetry
}: {
  copy: AssessmentCopy['retry'];
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <span
        aria-hidden
        className="flex size-16 items-center justify-center rounded-full bg-iq-teal/15 text-iq-teal"
      >
        <RefreshCw className="size-8" />
      </span>
      <h1 className="font-brand text-2xl font-extrabold text-ink text-balance">
        {copy.title}
      </h1>
      <p className="text-ink-soft">{copy.body}</p>
      <ConfirmAction label={copy.button} onConfirm={onRetry} />
    </div>
  );
}
