import {use} from 'react';
import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {LanguageToggle} from '@/components/LanguageToggle';

type Props = {
  params: Promise<{locale: string}>;
};

// Temporary bilingual placeholder landing page. Real landing content arrives in
// a later phase (1.06); this only proves routing and the language toggle work.
export default function HomePage({params}: Props) {
  const {locale} = use(params);
  setRequestLocale(locale);

  const t = useTranslations('HomePage');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t('siteName')}</h1>
      <p className="text-muted-foreground">{t('inProgress')}</p>
      <LanguageToggle />
    </main>
  );
}
