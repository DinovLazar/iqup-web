import {useTranslations} from 'next-intl';
import {LanguageToggle} from '@/components/LanguageToggle';
import {Wordmark} from './Wordmark';

/** Minimal funnel footer: wordmark + one honest line + language toggle. */
export function SiteFooter() {
  const t = useTranslations('Landing.footer');
  const tToggle = useTranslations('LanguageToggle');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <Wordmark />
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t('line')}</p>
            <p className="mt-2 font-display text-sm font-bold text-secondary-ink">
              {t('tagline')}
            </p>
          </div>
          {/* About / Privacy links are intentionally omitted — those pages don't
              exist yet (built in later phases). A later phase wires them in here
              to avoid dead links. */}
          <LanguageToggle label={tToggle('footerLabel')} />
        </div>

        <div className="border-t border-border pt-6 text-sm text-ink-soft">
          <p>{t('rights', {year})}</p>
          <p className="mt-1">{t('org')}</p>
        </div>
      </div>
    </footer>
  );
}
