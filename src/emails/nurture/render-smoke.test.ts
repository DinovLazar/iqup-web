/**
 * Phase 2.03 — nurture render smoke test (the Brevo-ready HTML).
 *
 * Renders every template × locale through the real `renderNurtureEmail` (the same
 * path the `emails:nurture` script uses) and asserts, for each rendered HTML:
 *   - the `CHILD_FIRST_NAME` merge tag is present WITH a literal-quote `default:`
 *     filter (proving the render restores the quotes React escapes — Brevo needs
 *     them);
 *   - the unsubscribe tag + the legal sender identity + the postal address are
 *     present (marketing-email legal requirements);
 *   - the right `utm_campaign` (+ `utm_source=brevo` / `utm_medium=email`) is on
 *     the links;
 *   - the trial CTA is present in welcome-trial / trial-invite / nudge and ABSENT
 *     in welcome-general (which carries a general link instead);
 *   - NO forbidden tokens (digit / `%` / score-IQ-rank vocabulary, EN + MK) in the
 *     visible text — masking the structural digit-bearing bits (URLs, the brand
 *     wordmark "IQ UP!", and the legal/postal line), mirroring the 2.01 approach.
 *
 * This runs under the DEFAULT Vitest env — the templates import no `server-only`
 * (exactly like 2.01's `ResultsEmail.test.ts`, which already renders React Email
 * under Vitest in `npm test`), so no script-local tsconfig is needed here.
 */
import {describe, it, expect} from 'vitest';

import type {Locale} from '@/content/locale';
import {NURTURE_COPY, NURTURE_KEYS, type NurtureKey} from './copy';
import {UTM_CAMPAIGN} from './links';
import {renderNurtureEmail} from './render';

const LOCALES: Locale[] = ['mk', 'en'];

const FORBIDDEN_WORD =
  /\b(score|scores|iq|rank|ranking|ranked|percent|percentile|points?|grade|weak|weaker|weakness|fail|failed|below average)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен)/i;

/** The brand wordmark — contains a standalone "IQ", which is the BRAND, not a score. */
const WORDMARK = 'IQ UP!';

/** Locale-specific city token to assert the postal address rendered. */
const CITY: Record<Locale, string> = {en: 'Skopje', mk: 'Скопје'};

/**
 * Extract visible text and mask the legitimately-digit-bearing / brand bits so the
 * no-number tripwire fires only on real copy:
 *  - drop the doctype + `<head>` (DTD/charset carry digits) and HTML comments;
 *  - strip remaining tags (removes inline-style + href attrs entirely);
 *  - drop merge tags, the brand wordmark, and the legal/postal line.
 */
function visibleText(html: string, locale: Locale): string {
  let s = html
    .replace(/<!DOCTYPE[^>]*>/i, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&zwnj;/g, ' ');
  s = s.replace(/\{\{[^}]*\}\}/g, ' ');
  s = s.split(WORDMARK).join(' ');
  s = s.split(NURTURE_COPY[locale].footer.legal).join(' ');
  return s;
}

function assertClean(label: string, value: string): void {
  expect(/\d/.test(value), `${label} contains a digit: "${value}"`).toBe(false);
  expect(value.includes('%'), `${label} contains "%"`).toBe(false);
  expect(FORBIDDEN_WORD.test(value), `${label} forbidden EN word`).toBe(false);
  expect(FORBIDDEN_MK.test(value), `${label} forbidden MK word`).toBe(false);
}

describe('nurture render smoke', () => {
  for (const locale of LOCALES) {
    for (const key of NURTURE_KEYS) {
      const label = `${key}/${locale}`;

      it(`${label}: merge tag, unsubscribe, identity + postal address`, async () => {
        const html = await renderNurtureEmail(key, locale);

        // child-name merge tag with a LITERAL-quote default (not &quot;)
        expect(html, `${label}: child-name merge tag`).toContain(
          'contact.CHILD_FIRST_NAME | default: "'
        );
        expect(html, `${label}: no escaped quote in merge tag`).not.toMatch(
          /\{\{[^}]*&quot;[^}]*\}\}/
        );

        // unsubscribe + legal identity + postal address
        expect(html, `${label}: unsubscribe tag`).toContain('{{ unsubscribe }}');
        expect(html, `${label}: legal entity`).toContain('IKUP');
        expect(html, `${label}: postal city`).toContain(CITY[locale]);
        expect(html, `${label}: brand identity tagline`).toContain(
          NURTURE_COPY[locale].footer.identity
        );
      });

      it(`${label}: UTM-tagged links (its own campaign)`, async () => {
        const html = await renderNurtureEmail(key, locale);
        expect(html, `${label}: utm_source`).toContain('utm_source=brevo');
        expect(html, `${label}: utm_medium`).toContain('utm_medium=email');
        expect(html, `${label}: utm_campaign`).toContain(
          `utm_campaign=${UTM_CAMPAIGN[key]}`
        );
      });

      it(`${label}: no forbidden tokens in visible text`, async () => {
        const html = await renderNurtureEmail(key, locale);
        assertClean(label, visibleText(html, locale));
      });
    }

    it(`${locale}: trial CTA present in trial emails, ABSENT in welcome-general`, async () => {
      const trialLabel = NURTURE_COPY[locale].emails['trial-invite'].cta;

      for (const key of ['welcome-trial', 'trial-invite', 'nudge'] as NurtureKey[]) {
        const html = await renderNurtureEmail(key, locale);
        expect(html, `${key}/${locale}: trial CTA present`).toContain(trialLabel);
      }

      const general = await renderNurtureEmail('welcome-general', locale);
      expect(general, `welcome-general/${locale}: NO trial CTA`).not.toContain(
        trialLabel
      );
      // …but it DOES carry its own (general) link.
      expect(
        general,
        `welcome-general/${locale}: general link present`
      ).toContain(NURTURE_COPY[locale].emails['welcome-general'].cta);
    });
  }
});
