import {useTranslations} from 'next-intl';
import {Clock, Gift, Sparkles} from 'lucide-react';
import {Card} from '@/components/ui/card';
import {AGES, BANDS} from '@/lib/bands';
import {AgeStart, type AgeStartProps} from './AgeStart';
import {HeroArt} from './HeroArt';
import {Reveal} from './Reveal';

/**
 * Hero — calm parent surface (~25% play). The h1 hook + honest explainer render
 * statically (LCP-safe); supporting pieces get a gentle entrance.
 */
export function Hero() {
  const t = useTranslations('Landing.hero');
  const tAge = useTranslations('Landing.age');

  const trust = [
    {icon: Gift, label: t('trust.free')},
    {icon: Clock, label: t('trust.time')},
    {icon: Sparkles, label: t('trust.noScore')}
  ];

  // Resolve all age-picker copy server-side and hand it to the client island so
  // the island ships no translation runtime.
  const ageProps: AgeStartProps = {
    labels: {
      question: tAge('question'),
      hint: tAge('hint'),
      start: tAge('start'),
      startHint: tAge('startHint'),
      noSignup: tAge('noSignup')
    },
    bands: BANDS.map((band) => ({
      key: band.key,
      label: tAge(`bands.${band.key}`),
      ages: AGES.filter((a) => a >= band.minAge && a <= band.maxAge).map((a) => ({
        value: a,
        ariaLabel: tAge('ariaAge', {age: a})
      }))
    }))
  };

  return (
    <section className="relative overflow-hidden bg-canvas">
      {/* decorative atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-hero/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-12 size-72 rounded-full bg-secondary-tint/70 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary-tint px-3 py-1.5 text-sm font-semibold text-secondary-ink">
            {t('eyebrow')}
          </span>

          <h1 className="mt-5 font-display text-4xl leading-[1.1] font-extrabold text-ink text-balance sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-soft text-pretty">
            {t('explainer')}
          </p>

          {/* age picker + Start (the interactive island) */}
          <Card className="mt-7 p-5 sm:p-6">
            <AgeStart {...ageProps} />
          </Card>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {trust.map(({icon: Icon, label}) => (
              <li key={label} className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <Icon className="size-4 text-success-ink" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1} className="hidden lg:block">
          <HeroArt />
        </Reveal>
      </div>
    </section>
  );
}
