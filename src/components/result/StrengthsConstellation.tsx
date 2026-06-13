import type {ReactNode} from 'react';
import {STRENGTHS} from '@/content/strengths';
import {Reveal} from '@/components/landing/Reveal';
import type {
  CelebratedStrength,
  GrowingStrength,
  ResolvedStrength
} from '@/content/results';
import {StrengthGlyph} from './StrengthGlyph';

export interface ConstellationCopy {
  regionLabel: string;
  celebratedTitle: string;
  celebratedSub: string;
  alsoTitle: string;
  alsoSub: string;
  growingTitle: string;
  growingSub: string;
}

/**
 * The strengths constellation (playful zone) — three warm, non-evaluative tiers.
 * No charts, bars, gauges, numbers, or medals: the ranked `TestResult` only
 * *orders* the tiers. Celebrated = top1/top2 (big badges), also = top3 (chip),
 * growing = the rest (encouraging chips). Strength accents come from the 1.03
 * tokens via `@/content/strengths`.
 */
export function StrengthsConstellation({
  celebrated,
  also,
  growing,
  copy
}: {
  celebrated: CelebratedStrength[];
  also: ResolvedStrength;
  growing: GrowingStrength[];
  copy: ConstellationCopy;
}) {
  return (
    <section aria-label={copy.regionLabel} className="px-4 pb-12">
      <div className="mx-auto max-w-3xl">
        {/* celebrated */}
        <Reveal>
          <div className="mt-6">
            <TierHead icon={<StarIcon />} title={copy.celebratedTitle} sub={copy.celebratedSub} />
            <ul className="flex flex-wrap justify-center gap-4">
              {celebrated.map((s) => (
                <li key={s.code} className="contents">
                  <CelebratedBadge strength={s} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* also strong */}
        <Reveal delay={0.05}>
          <div className="mt-8">
            <TierHead icon={<StarIcon small />} title={copy.alsoTitle} sub={copy.alsoSub} />
            <div className="flex flex-wrap justify-center gap-3">
              <AlsoChip strength={also} />
            </div>
          </div>
        </Reveal>

        {/* growing */}
        <Reveal delay={0.1}>
          <div className="mt-8">
            <div className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-dashed border-input bg-card px-5 pt-5 pb-6 text-center">
              <span className="mb-1.5 inline-flex items-center gap-2 font-display text-base font-bold text-success-ink">
                <SproutIcon />
                {copy.growingTitle}
              </span>
              <p className="mx-auto mb-4 max-w-[46ch] text-sm text-ink-soft text-pretty">
                {copy.growingSub}
              </p>
              <ul className="flex flex-wrap justify-center gap-2">
                {growing.map((s) => (
                  <li key={s.code}>
                    <GrowChip strength={s} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TierHead({icon, title, sub}: {icon: ReactNode; title: string; sub: string}) {
  return (
    <div className="mb-5 flex flex-col items-center gap-1 text-center">
      <div className="flex items-center gap-2.5">
        <span className="text-hero-strong" aria-hidden="true">
          {icon}
        </span>
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      </div>
      <span className="text-sm font-semibold text-ink-soft">{sub}</span>
    </div>
  );
}

function CelebratedBadge({strength}: {strength: CelebratedStrength}) {
  const token = STRENGTHS[strength.code].token;
  return (
    <div className="relative flex w-[200px] max-w-[14rem] flex-col items-center gap-2 rounded-[var(--radius-xl)] bg-card px-5 pt-6 pb-5 text-center shadow-[var(--shadow-md)] ring-1 ring-border">
      <span className="absolute top-3.5 right-4 text-hero-strong" aria-hidden="true">
        ✦
      </span>
      <span
        className="mb-1 grid size-[88px] place-items-center rounded-full"
        style={{
          background: `var(--strength-${token}-tint)`,
          boxShadow: `inset 0 0 0 3px color-mix(in srgb, var(--strength-${token}) 26%, white)`
        }}
      >
        <StrengthGlyph
          code={strength.code}
          style={{width: 44, height: 44, color: `var(--strength-${token})`}}
        />
      </span>
      <span
        className="font-display text-xl leading-tight font-bold text-balance"
        style={{color: `var(--strength-${token}-ink)`}}
      >
        {strength.name}
      </span>
      <span className="text-sm font-semibold text-ink-soft">{strength.short}</span>
    </div>
  );
}

function AlsoChip({strength}: {strength: ResolvedStrength}) {
  const token = STRENGTHS[strength.code].token;
  return (
    <span
      className="inline-flex items-center gap-2.5 rounded-full py-2.5 pr-[18px] pl-3"
      style={{
        background: `var(--strength-${token}-tint)`,
        border: `1px solid color-mix(in srgb, var(--strength-${token}) 22%, white)`
      }}
    >
      <span
        className="grid size-[34px] place-items-center rounded-full text-white"
        style={{background: `var(--strength-${token})`}}
      >
        <StrengthGlyph code={strength.code} style={{width: 20, height: 20}} />
      </span>
      <span className="font-display font-bold" style={{color: `var(--strength-${token}-ink)`}}>
        {strength.name}
      </span>
    </span>
  );
}

function GrowChip({strength}: {strength: GrowingStrength}) {
  const token = STRENGTHS[strength.code].token;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-input bg-canvas px-3.5 py-1.5 font-display text-sm font-bold text-ink"
      title={strength.fragment}
    >
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full"
        style={{background: `var(--strength-${token})`}}
      />
      {strength.name}
    </span>
  );
}

function StarIcon({small}: {small?: boolean}) {
  const s = small ? 20 : 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.5 5.7 6.2.6-4.7 4.1 1.4 6.1L12 16.9 6.6 19.5 8 13.4 3.3 9.3l6.2-.6z" />
    </svg>
  );
}

function SproutIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22V12M12 12C12 8 9 5 4 5c0 5 3 8 8 7zM12 12c0-3.5 2.5-6.5 7-6.5 0 4.5-2.8 7.2-7 6.5z" />
    </svg>
  );
}
