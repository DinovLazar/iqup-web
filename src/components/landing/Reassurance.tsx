import {useTranslations} from 'next-intl';
import {Reveal} from './Reveal';

/** Warm reassurance strip with a verified IqUp brand line (handover §C.4). */
export function Reassurance() {
  const t = useTranslations('Landing.reassurance');

  return (
    <section className="bg-background px-4 py-14 md:py-20">
      <Reveal className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-br from-hero-tint to-secondary-tint px-6 py-12 text-center sm:px-12">
          <p className="mx-auto max-w-2xl font-display text-2xl leading-snug font-bold text-ink text-balance sm:text-3xl">
            {t('quote')}
          </p>
          <p className="mt-4 text-sm font-semibold tracking-wide text-secondary-ink">
            {t('attribution')}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
