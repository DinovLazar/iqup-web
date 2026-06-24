import type {ReactNode} from 'react';
import type {AboutContent, AboutBlock} from '@/content/about';

/**
 * The About-the-test article (Phase 3.14) — a pure, presentational component that
 * renders the structured bilingual content (`@/content/about`). It is fed by the
 * `about-test` Server Component (content + the resolved shared honest-framing
 * notice), mirroring how `ResultsScreen` is a presentational island fed by a
 * server resolver — so it ships no i18n runtime and is directly renderable in a
 * unit test.
 *
 * The shared honest-framing `notice` node is injected (not authored here) at the
 * section that opts in via `withNotice` (the "what it isn't" section — the "lean on
 * the shared notice" point).
 */
export function AboutArticle({
  content,
  notice
}: {
  content: AboutContent;
  notice: ReactNode;
}) {
  return (
    <div className="mt-12 flex flex-col gap-12">
      {content.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-h`}
        >
          <h2
            id={`${section.id}-h`}
            className="font-brand text-xl font-extrabold text-ink sm:text-2xl"
          >
            {section.heading}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {section.blocks.map((block, i) => (
              <AboutBlockView key={i} block={block} />
            ))}
          </div>
          {section.withNotice ? <div className="mt-6">{notice}</div> : null}
        </section>
      ))}
    </div>
  );
}

/** Render one structured About block (paragraph or bullet list). */
function AboutBlockView({block}: {block: AboutBlock}) {
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
