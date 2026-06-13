import {Reveal} from '@/components/landing/Reveal';
import type {CelebratedStrength} from '@/content/results';

/**
 * Parent-facing "what we noticed" note (calm zone) — the spec §6B prose: the
 * headline, the celebrated blurbs for top1/top2, the also-strong line, and the
 * growing line. Renders the warm detail behind the constellation's visual
 * summary; the result "speaks to the parent" (§6).
 */
export function ParentNote({
  eyebrow,
  headline,
  celebrated,
  alsoLine,
  growingLine
}: {
  eyebrow: string;
  headline: string;
  celebrated: CelebratedStrength[];
  alsoLine: string;
  growingLine: string;
}) {
  return (
    <Reveal>
      <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-card p-6 shadow-[var(--shadow-sm)] ring-1 ring-border sm:p-8">
        <span className="block text-center text-xs font-extrabold tracking-[0.14em] text-ink-faint uppercase">
          {eyebrow}
        </span>
        <h2 className="mt-4 text-center font-display text-2xl font-extrabold text-balance text-ink">
          {headline}
        </h2>
        <div className="mt-5 flex flex-col gap-4 text-pretty text-ink-soft">
          {celebrated.map((s) => (
            <p key={s.code} className="leading-relaxed">
              {s.blurb}
            </p>
          ))}
          <p className="leading-relaxed">{alsoLine}</p>
          <p className="leading-relaxed font-semibold text-ink">{growingLine}</p>
        </div>
      </div>
    </Reveal>
  );
}
