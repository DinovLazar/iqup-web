// TODO(mk-slug): the MK route slug can be localised later (e.g. `/приватност`).
// Working slug is `/privacy` for both locales for now.
import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {SiteFooter} from '@/components/landing/SiteFooter';
import {CookieSettingsButton} from '@/components/consent/CookieSettingsButton';
import {HonestNote} from '@/components/common/HonestNote';
import {getPrivacyContent} from '@/content/privacy';
import type {PrivacyBlock} from '@/content/privacy';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Privacy.meta'});
  const canonical = locale === 'en' ? '/en/privacy' : '/privacy';

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {mk: '/privacy', en: '/en/privacy', 'x-default': '/privacy'}
    },
    openGraph: {
      type: 'website',
      siteName: 'IqUp',
      title: t('title'),
      description: t('description'),
      url: canonical,
      locale: locale === 'en' ? 'en_US' : 'mk_MK'
    }
  };
}

/**
 * The `/privacy` page (Phase 2.04) — the site's first privacy & cookie policy.
 *
 * A static (SSG) Server Component: no `searchParams`, no dynamic APIs. The
 * substantive policy is structured bilingual content (`@/content/privacy`); the
 * on-screen chrome (title, lead, labels, table headers, draft notice) comes from
 * the `Privacy` next-intl namespace. The one client island is the
 * `CookieSettingsButton`, which re-opens the consent Manage dialog.
 *
 * PROVISIONAL: a GDPR baseline pending IqUp legal sign-off; all MK is
 * provisional pending native-MK review.
 */
export default async function PrivacyPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tA11y = await getTranslations({locale, namespace: 'A11y'});
  const t = await getTranslations({locale, namespace: 'Privacy'});
  const tDisc = await getTranslations({locale, namespace: 'Disclaimer'});
  const content = getPrivacyContent(locale as Locale);

  const cookiesSectionId = 'cookies';
  const withdrawSectionId = 'withdraw-consent';

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-secondary-foreground"
      >
        {tA11y('skipToContent')}
      </a>
      <SiteHeader />
      <main id="main-content" className="bg-canvas">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <header>
            <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              {t('meta.title')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              {t('lead')}
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              {t('lastUpdatedLabel')} {content.lastUpdated} {'·'}{' '}
              {t('versionLabel')} {content.version}
            </p>
          </header>

          {/* Provisional / draft notice — visible but tasteful muted callout. */}
          <div
            role="note"
            className="mt-8 rounded-[var(--radius-lg)] border border-border bg-background px-5 py-4 text-sm leading-relaxed text-ink-soft"
          >
            {t('draftNote')}
          </div>

          {/* The shared honest-framing notice (Phase 3.14) — a restatement from the
              one `Disclaimer` source, consistent with every other surface. */}
          <HonestNote
            variant="inset"
            ariaLabel={tDisc('ariaLabel')}
            notice={tDisc('notice')}
            provisional={tDisc('provisional')}
            className="mt-4"
          />

          <div className="mt-12 flex flex-col gap-12">
            {content.sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`}>
                <h2
                  id={`${section.id}-h`}
                  className="font-display text-xl font-bold text-ink sm:text-2xl"
                >
                  {section.heading}
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                  {section.blocks.map((block, i) => (
                    <PolicyBlock key={i} block={block} />
                  ))}
                </div>

                {/* The cookie table is rendered inside the Cookies section.
                    The horizontal scroll container is keyboard-focusable
                    (tabIndex + role/label) so keyboard users can scroll it —
                    WCAG 2.1.1 (axe scrollable-region-focusable). */}
                {section.id === cookiesSectionId && (
                  <div
                    role="region"
                    aria-label={t('cookieTableLabel')}
                    tabIndex={0}
                    className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-border focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                      <caption className="sr-only">{t('meta.title')}</caption>
                      <thead>
                        <tr className="border-b border-border bg-background text-ink">
                          <th scope="col" className="px-4 py-3 font-semibold">
                            {t('tableHeaders.name')}
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            {t('tableHeaders.provider')}
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            {t('tableHeaders.purpose')}
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            {t('tableHeaders.category')}
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            {t('tableHeaders.duration')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {content.cookieTable.map((row) => (
                          <tr
                            key={row.name}
                            className="border-b border-border last:border-b-0 text-ink-soft"
                          >
                            <th
                              scope="row"
                              className="px-4 py-3 font-mono text-xs font-medium text-ink"
                            >
                              {row.name}
                            </th>
                            <td className="px-4 py-3">{row.provider}</td>
                            <td className="px-4 py-3">{row.purpose}</td>
                            <td className="px-4 py-3">{row.category}</td>
                            <td className="px-4 py-3">{row.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* The manage-cookies control lives in the withdraw-consent
                    section. The button itself is page chrome, not content. */}
                {section.id === withdrawSectionId && (
                  <div className="mt-5">
                    <CookieSettingsButton label={t('manageCookies')} />
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Render one structured policy block (paragraph or bullet list). */
function PolicyBlock({block}: {block: PrivacyBlock}) {
  if (block.kind === 'p') {
    return (
      <p className="text-base leading-relaxed text-ink-soft">{block.text}</p>
    );
  }
  return (
    <ul className="flex list-disc flex-col gap-2 pl-6 text-base leading-relaxed text-ink-soft marker:text-secondary-ink">
      {block.items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
