/**
 * Surface A — the on-screen v2 results screen (Phase 3.09). A faithful React port
 * of `docs/design-handovers/surfaces/Results.html` (the "Insight" mood). It is the
 * moment the parent sees their child's profile and is invited to a free demo class.
 *
 * PURE & PRESENTATIONAL: it takes the already-built `ReportContent`, the resolved
 * chrome `copy`, the `locale`, the pre-built `bookingUrl`, and the display city
 * name — no storage, no hooks, no `Date`, no psychometric recompute. `ReportFlow`
 * owns the wiring (read run → recompute profile → `buildReport` → render this). The
 * purity keeps it deterministic AND renderable under Vitest's Node env for the
 * forbidden-token scan.
 *
 * HONESTY (hard rule): no number / % / score / IQ / rank / level / gauge / bar.
 * Bands are the engine's display WORDS; confidence is a WORD + a non-numeric 3-pip
 * mark; the pentagon is identity, not magnitude. The only digits on screen are the
 * child's age and the generation date (contextual meta, never ability magnitude).
 */
import type {Locale} from '@/content/locale';
import {CENTERS} from '@/content/centers';
import type {ReportContent} from '@/lib/report';
import {INDEX_META, INDEX_ORDER} from './index-meta';
import {IdentityPentagon} from './IdentityPentagon';
import type {ResultsCopy} from './results-copy';

const MONTHS: Record<Locale, readonly string[]> = {
  mk: [
    'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
    'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
};

/** Format a `YYYY-MM-DD` day-date into "23 June 2026" — deterministic, no `Date`. */
function formatGeneratedDate(date: string, locale: Locale): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const year = m[1];
  const month = MONTHS[locale][Number(m[2]) - 1];
  const day = String(Number(m[3]));
  if (!month) return null;
  return `${day} ${month} ${year}`;
}

/** A non-numeric confidence cue: three pips, the first N filled. Carries no number. */
function ConfidencePips({level}: {level: 'high' | 'medium' | 'low'}) {
  const filled = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
  return (
    <span className="iqr-pips" aria-hidden>
      {[0, 1, 2].map((i) => (
        <i key={i} className={i < filled ? 'on' : undefined} />
      ))}
    </span>
  );
}

export function ResultsScreen({
  report,
  copy,
  locale,
  bookingUrl
}: {
  report: ReportContent;
  copy: ResultsCopy;
  locale: Locale;
  bookingUrl: string;
}) {
  const {meta} = report;
  const outcome = meta.validity.outcome;
  const caveated = meta.validity.caveated; // true only for not_representative
  const generated = meta.generatedDate
    ? formatGeneratedDate(meta.generatedDate, locale)
    : null;

  const cityName =
    CENTERS.find((c) => c.id === report.iqup.city)?.city[locale] ?? null;

  // Retry routes to the assessment start — the SAME intent as the 3.05 RetryScreen,
  // never a second/contradictory retry. Shown only for the caveated read.
  const retryHref = locale === 'en' ? '/en/test' : '/test';

  return (
    <div className="iq-results" data-validity={outcome}>
      {/* 1 · Header (the IqUp wordmark + language toggle live in the global
          SiteHeader; this carries the plain-language title + age/date meta). */}
      <header className="iqr-head">
        <div className="iqr-head__intro">
          <span className="iqr-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <div className="iqr-meta">
            <span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              <span>{copy.ageLabel.replace('{age}', String(meta.age))}</span>
            </span>
            {generated ? (
              <span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 9h18M8 3v4M16 3v4" />
                </svg>
                <span>{copy.generatedLabel.replace('{date}', generated)}</span>
              </span>
            ) : null}
          </div>
        </div>
        <svg className="iqr-wave" viewBox="0 0 1440 30" preserveAspectRatio="none" aria-hidden>
          <path fill="var(--bg)" d="M0 14 C220 0 360 0 560 12 C760 24 920 30 1120 20 C1280 12 1380 8 1440 12 L1440 30 L0 30 Z" />
        </svg>
      </header>

      <div className="iqr-grid">
        {/* 2 · Hero — the completed identity pentagon (dimmed only when caveated). */}
        <div className="iqr-left">
          <section className="iqr-hero">
            <IdentityPentagon
              className="iqr-idp"
              size={300}
              locale={locale}
              dim={caveated ? INDEX_ORDER : undefined}
            />
            <p className="iqr-cap">{copy.heroCaption}</p>
          </section>
        </div>

        <div className="iqr-right">
          {/* Validity note — gentle (quieter) or the bespoke caveat (amber). The
              sentence itself is the engine's localized note (never duplicated in
              messages); chrome supplies only the heading + retry label. */}
          {outcome === 'gentle_note' && meta.validity.note ? (
            <aside className="iqr-validity iqr-validity--gentle" role="note">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8h.01M11 12h1v4h1" />
              </svg>
              <div>
                <b>{copy.validity.gentleHeading}</b>
                <p>{meta.validity.note}</p>
              </div>
            </aside>
          ) : null}
          {outcome === 'not_representative' ? (
            <aside className="iqr-validity iqr-validity--caveat" role="note">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
              <div>
                <b>{copy.validity.caveatHeading}</b>
                {meta.validity.note ? <p>{meta.validity.note}</p> : null}
                <a href={retryHref}>{copy.validity.retry}</a>
              </div>
            </aside>
          ) : null}

          {/* 3 · Five colour-coded index cards (in canonical order). */}
          <section className="iqr-sec">
            <h2 className="iqr-sec__h">{copy.sectionIndices}</h2>
            <div className="iqr-cards">
              {report.indices.map((idx) => {
                const m = INDEX_META[idx.id];
                const cardStyle = {
                  ['--c']: `var(--ix-${m.hue})`,
                  ['--c-tint']: `var(--ix-${m.hue}-tint)`,
                  ['--c-ink']: `var(--ix-${m.hue}-ink)`
                } as React.CSSProperties;
                return (
                  <article key={idx.id} className="iqr-card" style={cardStyle}>
                    <span className="iqr-card__ico">
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        dangerouslySetInnerHTML={{__html: m.glyph}}
                      />
                    </span>
                    <div className="iqr-card__main">
                      <div className="iqr-card__top">
                        <span className="iqr-card__name">{idx.name}</span>
                        <span className="iqr-card__band">{idx.bandLabel}</span>
                      </div>
                      <div className="iqr-card__conf">
                        <span className="iqr-card__lvl">
                          {copy.confidencePrefix}: {idx.confidenceLabel}
                          <ConfidencePips level={idx.confidence} />
                        </span>
                        <span className="iqr-card__note">{idx.confidenceNote}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 4 · Top strength — "Where your child shines". */}
          <section className="iqr-sec">
            <div className="iqr-shine">
              <span className="iqr-shine__star" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.6 6.6L21.5 9l-5.2 4.4 1.8 6.6L12 16.7 5.9 20l1.8-6.6L2.5 9l6.9-.4z" />
                </svg>
              </span>
              <div>
                <div className="iqr-shine__k">{copy.shineKicker}</div>
                <div className="iqr-shine__t">{report.topStrength.name}</div>
                <p>{report.topStrength.body}</p>
              </div>
            </div>
          </section>

          {/* 5 · What we noticed — overview + solving style. */}
          <section className="iqr-sec">
            <h2 className="iqr-sec__h">{copy.sectionNoticed}</h2>
            <div className="iqr-noticed">
              <p>{report.overview.shape}</p>
              {report.overview.pairs.map((pair, i) => (
                <p key={i}>{pair}</p>
              ))}
              <p>
                <span className="lbl">{copy.solvingStyleLabel}</span>{' '}
                {report.solvingStyle.body} {report.solvingStyle.learning}
              </p>
            </div>
          </section>

          {/* 6 · Report-emailed confirmation. SEAM (3.10): the PDF generation +
              email send lands in 3.10 — this strip is PRESENTATIONAL for now; no
              email is actually sent yet. */}
          <section className="iqr-sec">
            <div className="iqr-emailed">
              <span className="ic" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <div>
                <b>{copy.emailedHeading}</b>
                <p>{copy.emailedBody}</p>
              </div>
            </div>
          </section>

          {/* 7 · The violet demo-class CTA (carries the centre via ?grad=). */}
          <section className="iqr-sec">
            <div className="iqr-trial">
              <h2>{copy.trialHeading}</h2>
              <p>{copy.trialBody}</p>
              {cityName ? (
                <span className="iqr-city">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span>{cityName}</span>
                </span>
              ) : null}
              <a className="iqr-btn" href={bookingUrl}>
                <span>{copy.trialCta}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </section>

          {/* 8 · Certificate entry. SEAM (3.11): the shareable Bibi certificate
              (artwork, route, download/share, OG image) lands in 3.11. This is the
              entry affordance ONLY — no Bibi art, no certificate route this phase. */}
          <section className="iqr-sec">
            <h2 className="iqr-sec__h">{copy.sectionCertificate}</h2>
            {/* An active entry affordance; 3.11 wires the onClick → certificate
                route. Not `aria-disabled` — the feature isn't disabled, just not
                yet wired (avoids announcing a misleading "unavailable" state). */}
            <button type="button" className="iqr-cert">
              <span className="iqr-cert__thumb" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--action)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="5" />
                  <path d="M8.5 13 7 22l5-2.6L17 22l-1.5-9" />
                </svg>
              </span>
              <span className="iqr-cert__b">
                <b>{copy.certificateHeading}</b>
                <p>{copy.certificateBody}</p>
              </span>
              <span className="iqr-cert__go" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </span>
            </button>
          </section>

          {/* 9 · Disclaimer — indicative-not-diagnostic + the provisional-norms note. */}
          <footer className="iqr-foot">
            <p className="iqr-disc">
              {report.disclaimer.body} {report.disclaimer.provisional}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
