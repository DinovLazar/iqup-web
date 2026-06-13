import {Reveal} from '@/components/landing/Reveal';
import {fillSlots} from '@/content/results';

/**
 * The reveal hero (playful zone) — the child-facing celebration that "plays
 * first". The eyebrow is the §6B kid celebration; the title personalises with the
 * child's first name (highlighted); the lede reassures with the no-scores promise.
 */
export function ResultHero({
  celebration,
  titleTemplate,
  name,
  lede
}: {
  celebration: string;
  /** i18n template "Brilliant work, {name}!". */
  titleTemplate: string;
  name: string;
  lede: string;
}) {
  const [before, after] = splitOnName(titleTemplate);

  return (
    <section className="px-4 pt-12 pb-8 text-center sm:pt-16">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-hero-tint px-4 py-1.5 text-sm font-extrabold tracking-wide text-hero-ink">
            <span aria-hidden="true">✦</span>
            {celebration}
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-[clamp(2rem,8vw,3rem)] leading-[1.08] font-extrabold tracking-tight text-balance text-ink isolate">
            {before}
            <span className="relative inline-block whitespace-nowrap text-secondary-ink">
              <span
                aria-hidden="true"
                className="absolute inset-x-[-0.05em] bottom-[0.08em] -z-10 h-[0.32em] rounded-[6px] bg-hero/90"
              />
              {name}
            </span>
            {after}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-4 max-w-[42ch] text-lg leading-relaxed text-ink-soft text-pretty">
            {lede}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** Split "Brilliant work, {name}!" → ["Brilliant work, ", "!"]. */
function splitOnName(template: string): [string, string] {
  const idx = template.indexOf('{name}');
  if (idx === -1) return [fillSlots(template, {}), ''];
  return [template.slice(0, idx), template.slice(idx + '{name}'.length)];
}
