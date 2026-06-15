/**
 * Phase 2.01 — results-email render tests.
 *
 * The email is the parent-facing equivalent of the on-screen result: it must
 * render the SAME §6 strengths copy (`getResultCopy`) per locale, branch on the
 * band exactly like the screen (trial CTA for 3–5 / 6–9, curious-mind ending for
 * 10–13), and carry NO forbidden result tokens (no digit / % / score / IQ / rank
 * vocabulary in EN or MK) in any visible text.
 *
 * Fixtures are built from a crafted per-strength ratio map fed through
 * `reconstructResult` (the same path Phase 2.01's orchestrator uses), so the test
 * exercises the real ranking → tier → copy pipeline rather than a hand-stubbed
 * `TestResult`.
 */
import {describe, it, expect} from 'vitest';

import en from '@/messages/en.json';
import mk from '@/messages/mk.json';
import type {Locale} from '@/content/locale';
import type {BandKey} from '@/lib/bands';
import {reconstructResult} from '@/lib/scoring';
import {getResultCopy, fillSlots} from '@/content/results';
import type {EmailChrome, ResultsEmailProps} from './types';
import {renderResultsEmail} from './render';

const MESSAGES: Record<Locale, {Email: Record<string, unknown>}> = {
  en: en as never,
  mk: mk as never
};

/** A web/Cyrillic name per locale so we can assert the child's name renders. */
const NAME: Record<Locale, string> = {en: 'Maya', mk: 'Марко'};

const SITE_URL = 'https://iqup.example/mk';

/**
 * Distinct per-strength ratio map → a deterministic ranking (pattern, spatial,
 * numeracy celebrated/also; logic, memory, words_obs growing). Mirrors the kind
 * of summary a real lead stores, so `reconstructResult` yields a real result.
 */
const SCORES: Readonly<Record<string, number>> = {
  pattern: 1,
  spatial: 0.83,
  numeracy: 0.67,
  logic: 0.5,
  memory: 0.33,
  words_obs: 0.17
};

const BANDS: BandKey[] = ['3-5', '6-9', '10-13'];
const LOCALES: Locale[] = ['mk', 'en'];

/** Strip `{slot}` placeholders before checking literal user-facing text. */
function literal(s: string): string {
  return s.replace(/\{[^}]+\}/g, '');
}

/** Same guardrail regexes as `src/content/results/results.test.ts`. */
const FORBIDDEN_WORD =
  /\b(score|scores|iq|rank|ranking|ranked|percent|percentile|points?|grade|weak|weaker|weakness|fail|failed|below average)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен)/i;

function assertClean(label: string, value: string): void {
  const text = literal(value);
  expect(/\d/.test(text), `${label} contains a digit: "${text}"`).toBe(false);
  expect(text.includes('%'), `${label} contains "%": "${text}"`).toBe(false);
  expect(FORBIDDEN_WORD.test(text), `${label} forbidden word: "${text}"`).toBe(
    false
  );
  expect(FORBIDDEN_MK.test(text), `${label} forbidden MK word: "${text}"`).toBe(
    false
  );
}

/** Build the localized `EmailChrome` from the `Email` namespace, `{name}` filled. */
function chromeFor(locale: Locale, name: string): EmailChrome {
  const e = MESSAGES[locale].Email as Record<string, never>;
  const trial = e.trial as unknown as Record<string, string>;
  const footer = e.footer as unknown as Record<string, string>;
  const slots = {name};
  return {
    subject: fillSlots(e.subject as unknown as string, slots),
    preview: fillSlots(e.preview as unknown as string, slots),
    greeting: fillSlots(e.greeting as unknown as string, slots),
    intro: fillSlots(e.intro as unknown as string, slots),
    certificateAttached: fillSlots(
      e.certificateAttached as unknown as string,
      slots
    ),
    trial: {
      heading: fillSlots(trial.heading, slots),
      body: fillSlots(trial.body, slots),
      cta: fillSlots(trial.cta, slots)
    },
    curiousMind: fillSlots(e.curiousMind as unknown as string, slots),
    footer: {
      identity: fillSlots(footer.identity, slots),
      contact: fillSlots(footer.contact, slots),
      signoff: fillSlots(footer.signoff, slots)
    }
  };
}

function propsFor(bandKey: BandKey, locale: Locale): ResultsEmailProps {
  const name = NAME[locale];
  const result = reconstructResult(SCORES, bandKey, locale);
  const copy = getResultCopy(result, name, locale);
  return {
    childFirstName: name,
    bandKey,
    locale,
    copy,
    chrome: chromeFor(locale, name),
    siteUrl: SITE_URL
  };
}

/** Remove URLs + email addresses so link hrefs/contacts don't trip the guards. */
function visibleText(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, ' ');
}

describe('ResultsEmail', () => {
  for (const bandKey of BANDS) {
    for (const locale of LOCALES) {
      const label = `${bandKey}/${locale}`;

      it(`renders the child name + strengths copy and stays clean (${label})`, async () => {
        const props = propsFor(bandKey, locale);
        const {html, text} = await renderResultsEmail(props);

        // child's first name is present in the rendered HTML
        expect(html, `${label}: missing name`).toContain(props.childFirstName);

        // at least one celebrated strength name + a fragment of its blurb
        const first = props.copy.celebrated[0];
        expect(html, `${label}: missing strength name`).toContain(first.name);
        const blurbFragment = literal(first.blurb)
          .trim()
          .split(/\s+/)
          .slice(0, 4)
          .join(' ');
        expect(
          html,
          `${label}: missing blurb fragment "${blurbFragment}"`
        ).toContain(blurbFragment);

        // no forbidden tokens in the visible plain text (minus URLs / emails)
        assertClean(`${label} visible text`, visibleText(text));
      });

      if (bandKey === '10-13') {
        it(`shows the curious-mind ending, no trial CTA (${label})`, async () => {
          const props = propsFor(bandKey, locale);
          const {html, text} = await renderResultsEmail(props);
          const visible = visibleText(text);

          expect(visible).toContain(literal(props.chrome.curiousMind).trim());
          expect(
            visible,
            `${label}: should not show trial CTA`
          ).not.toContain(props.chrome.trial.cta);
          // and certainly no trial button href to the site
          expect(html).not.toContain(`href="${SITE_URL}"`);
        });
      } else {
        it(`shows the trial CTA + absolute site button (${label})`, async () => {
          const props = propsFor(bandKey, locale);
          const {html, text} = await renderResultsEmail(props);
          const visible = visibleText(text);

          expect(visible, `${label}: missing trial CTA`).toContain(
            props.chrome.trial.cta
          );
          // an absolute href starting with http, pointing at the site URL
          const hrefMatch = html.match(/href="(https?:\/\/[^"]+)"/);
          expect(hrefMatch, `${label}: no absolute href`).not.toBeNull();
          const hrefs = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(
            (m) => m[1]
          );
          expect(
            hrefs.some((h) => h === SITE_URL || h.startsWith(SITE_URL)),
            `${label}: no href equal/startsWith siteUrl; got ${JSON.stringify(hrefs)}`
          ).toBe(true);
        });
      }
    }
  }
});
