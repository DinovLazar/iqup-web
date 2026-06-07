import {useTranslations} from 'next-intl';
import {Clock, Gift, ShieldCheck, Sparkles} from 'lucide-react';

/**
 * Light, honest trust cues for parents. No unverified or franchise-marketing
 * claims (e.g. the "85% enroll after a demo" figure) on this consumer page.
 */
export function TrustCues() {
  const t = useTranslations('Landing.trust');

  const cues = [
    {key: 'free', icon: Gift},
    {key: 'time', icon: Clock},
    {key: 'encouraging', icon: Sparkles},
    {key: 'data', icon: ShieldCheck}
  ] as const;

  return (
    <section className="bg-canvas py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-3xl font-bold text-ink">
          {t('title')}
        </h2>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cues.map(({key, icon: Icon}) => (
            <li key={key}>
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-border">
                <span className="flex size-11 items-center justify-center rounded-xl bg-success-tint text-success-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="font-display text-lg font-bold text-ink">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {t(`${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
