/**
 * The shared confirm action for task renderers that need an explicit submit (the
 * select-one and arrange/build patterns). A large, on-brand, keyboard-operable
 * button (≥44px) using the violet primary-action hue (brand §6). Disabled until
 * the child has provided an answer, with the disabled state communicated by more
 * than colour (reduced opacity + `aria-disabled` + `disabled`).
 */
'use client';

import {ArrowRight} from 'lucide-react';
import {cn} from '@/lib/utils';

export function ConfirmAction({
  label,
  onConfirm,
  disabled = false
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onConfirm}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        'flex min-h-tap w-full items-center justify-center gap-2 rounded-card px-8 font-brand text-base font-semibold text-white transition-colors',
        'focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none',
        disabled ? 'cursor-not-allowed bg-iq-grey/50' : 'bg-iq-violet hover:bg-iq-violet/90'
      )}
    >
      {label}
      <ArrowRight className="size-5" aria-hidden />
    </button>
  );
}
