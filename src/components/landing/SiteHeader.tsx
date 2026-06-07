import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {LanguageToggle} from '@/components/LanguageToggle';
import {Wordmark} from './Wordmark';

/** Minimal funnel header: logo (stand-in wordmark) + language toggle. */
export function SiteHeader() {
  const t = useTranslations('Landing.header');
  const tToggle = useTranslations('LanguageToggle');

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Wordmark />
          {/* Visible wordmark is the accessible name (WCAG 2.5.3); add the
              "home" affordance for screen readers without changing the label. */}
          <span className="sr-only"> — {t('home')}</span>
        </Link>
        <LanguageToggle label={tToggle('label')} />
      </div>
    </header>
  );
}
