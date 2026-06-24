import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {LanguageToggle} from '@/components/LanguageToggle';
import {CookieSettingsButton} from '@/components/consent/CookieSettingsButton';
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
          <div className="flex flex-col items-start gap-4 sm:items-end">
            {/* About the test (Phase 3.14) + Privacy policy (Phase 2.04) +
                Cookie settings (re-opens the consent Manage dialog). */}
            <nav aria-label={t('legalNavLabel')} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link
                href="/about-test"
                className="font-semibold text-secondary-ink underline-offset-4 hover:underline"
              >
                {t('about')}
              </Link>
              <Link
                href="/privacy"
                className="font-semibold text-secondary-ink underline-offset-4 hover:underline"
              >
                {t('privacy')}
              </Link>
              <CookieSettingsButton label={t('cookieSettings')} className="text-sm" />
            </nav>
            <LanguageToggle label={tToggle('footerLabel')} />
          </div>
        </div>

        <div className="border-t border-border pt-6 text-sm text-ink-soft">
          <p>{t('rights', {year})}</p>
          <p className="mt-1">{t('org')}</p>
        </div>
      </div>
    </footer>
  );
}
