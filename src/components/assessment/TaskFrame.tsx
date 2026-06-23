/**
 * The shared task frame every task renderer mounts inside (the binding visual
 * spec's "shared task frame"). One task at a time: a friendly instruction line, a
 * generous bespoke-SVG stage, a quiet non-numeric within-domain motion indicator,
 * and an optional confirm action. No score / "N of M" / % anywhere — progress is
 * the puzzle-brain (rendered by the flow shell, above this frame).
 */
'use client';

import {m} from 'framer-motion';
import {cn} from '@/lib/utils';

export function TaskFrame({
  instruction,
  children,
  action,
  assist = false,
  /** A subtle "working" cue while the child engages; reduced-motion → static. */
  reducedMotion = false
}: {
  instruction: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  assist?: boolean;
  reducedMotion?: boolean;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-start gap-3">
        <WithinDomainIndicator reducedMotion={reducedMotion} />
        <h2
          className={cn(
            'font-brand font-bold text-ink text-balance',
            assist ? 'text-2xl leading-snug' : 'text-xl'
          )}
        >
          {instruction}
        </h2>
      </header>

      <div
        className={cn(
          'flex min-h-[18rem] flex-col items-center justify-center rounded-card-lg border-2 border-border bg-card p-4 sm:p-6',
          assist && 'min-h-[20rem]'
        )}
      >
        {children}
      </div>

      {action && <div className="flex flex-col gap-3">{action}</div>}
    </section>
  );
}

/**
 * The within-domain micro-indicator: three quietly breathing dots — a calm "we're
 * working through this part" cue, never a counter. Static under reduced motion (a
 * single filled dot, no animation), and `aria-hidden` (it conveys no info a
 * screen-reader user needs — the instruction + live region carry meaning).
 */
function WithinDomainIndicator({reducedMotion}: {reducedMotion: boolean}) {
  if (reducedMotion) {
    return (
      <span
        aria-hidden
        className="mt-1.5 inline-flex size-2.5 shrink-0 rounded-full bg-iq-violet/70"
      />
    );
  }
  return (
    <span aria-hidden className="mt-2 inline-flex shrink-0 gap-1">
      {[0, 1, 2].map((i) => (
        <m.span
          key={i}
          className="inline-flex size-2 rounded-full bg-iq-violet/60"
          animate={{opacity: [0.3, 1, 0.3]}}
          transition={{duration: 1.6, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut'}}
        />
      ))}
    </span>
  );
}
