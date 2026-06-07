'use client';

import {useId, useState} from 'react';
import {RadioGroup} from 'radix-ui';
import {Check} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {type BandKey, getBandForAge, isValidAge} from '@/lib/bands';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

type AgeOption = {value: number; ariaLabel: string};
type BandGroup = {key: BandKey; label: string; ages: AgeOption[]};

export type AgeStartProps = {
  labels: {
    question: string;
    hint: string;
    start: string;
    startHint: string;
    noSignup: string;
  };
  bands: BandGroup[];
};

/**
 * The one interactive island on the landing page: pick the child's exact age
 * (3–13), then Start.
 *
 * Ages are presented as an accessible radiogroup, visually grouped into the three
 * bands (big tap targets, band-aware — honouring handover §B.4) while the
 * selectable unit stays the exact age. The band derives from the age via
 * getBandForAge; the Start CTA carries `age` to the test route (the email gate in
 * 1.08 reuses the exact age). Out-of-range ages are simply not rendered.
 *
 * All copy is passed in from the (server) parent so this island ships no
 * translation runtime — keeping the client bundle small.
 */
export function AgeStart({labels, bands}: AgeStartProps) {
  const labelId = useId();
  const [age, setAge] = useState<number | null>(null);

  const valid = age !== null && isValidAge(age);
  const selectedBand = valid ? getBandForAge(age) : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p id={labelId} className="font-display text-lg font-bold text-ink">
          {labels.question}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{labels.hint}</p>
      </div>

      <RadioGroup.Root
        aria-labelledby={labelId}
        value={age !== null ? String(age) : undefined}
        onValueChange={(value) => setAge(Number(value))}
        className="flex flex-col gap-4"
      >
        {bands.map((band) => (
          <div key={band.key} className="flex flex-col gap-2">
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wide transition-colors',
                selectedBand === band.key ? 'text-secondary-ink' : 'text-ink-soft'
              )}
            >
              {band.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {band.ages.map((option) => {
                const selected = age === option.value;
                return (
                  <RadioGroup.Item
                    key={option.value}
                    value={String(option.value)}
                    aria-label={option.ariaLabel}
                    className={cn(
                      'relative flex h-12 min-w-12 items-center justify-center rounded-xl border-2 px-3 font-display text-lg font-bold transition-all outline-none',
                      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                      selected
                        ? 'border-brand-blue bg-secondary-tint text-secondary-ink shadow-sm'
                        : 'border-border bg-card text-ink hover:-translate-y-0.5 hover:border-brand-blue/60'
                    )}
                  >
                    {option.value}
                    {selected ? (
                      <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand-blue text-white">
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                    ) : null}
                  </RadioGroup.Item>
                );
              })}
            </div>
          </div>
        ))}
      </RadioGroup.Root>

      <div className="flex flex-col gap-2">
        {valid ? (
          <Button
            asChild
            className="h-14 w-full rounded-xl bg-hero px-8 font-display text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
          >
            {/* Carries the exact age; /test is built in phase 1.07. Locale prefix
                is handled by the next-intl Link. */}
            <Link href={{pathname: '/test', query: {age: String(age)}}}>
              {labels.start}
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            disabled
            aria-disabled="true"
            className="h-14 w-full rounded-xl px-8 font-display text-base font-bold"
          >
            {labels.start}
          </Button>
        )}
        <p className="text-center text-sm text-ink-soft" aria-live="polite">
          {valid ? labels.noSignup : labels.startHint}
        </p>
      </div>
    </div>
  );
}
