import {useTranslations} from 'next-intl';
import {Award, MousePointerClick, Puzzle} from 'lucide-react';
import {Card} from '@/components/ui/card';
import {Reveal} from './Reveal';

/** "How it works" in three short, honest steps. */
export function HowItWorks() {
  const t = useTranslations('Landing.how');

  const steps = [
    {key: 'step1', icon: MousePointerClick},
    {key: 'step2', icon: Puzzle},
    {key: 'step3', icon: Award}
  ] as const;

  return (
    <section className="bg-background py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-3xl font-bold text-ink">
          {t('title')}
        </h2>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({key, icon: Icon}, index) => (
            <li key={key}>
              <Reveal delay={index * 0.1} className="h-full">
                <Card className="h-full p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-secondary-tint text-secondary-ink">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    {/* Dark ink on yellow (9.3:1) — high contrast, on-brand. */}
                    <span
                      aria-hidden
                      className="flex size-9 items-center justify-center rounded-full bg-hero font-display text-lg font-extrabold text-hero-ink"
                    >
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">
                    {t(`${key}.body`)}
                  </p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
