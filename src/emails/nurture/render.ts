/**
 * Phase 2.03 — render a nurture template (key × locale) to static HTML.
 *
 * Kept as a `.ts` file (no JSX, via `React.createElement`) for the same reason as
 * the 2.01 `src/emails/render.ts`: the accompanying `.test.ts` (Vitest's `include`
 * is `src/**\/*.test.ts`) and the `emails:nurture` render script both import this
 * without needing a JSX transform in a `.ts` file. The presentational JSX lives in
 * the template `.tsx` files.
 *
 * Only HTML is produced — Brevo auto-generates the plain-text alternative from the
 * HTML, so there is no `{html, text}` pair here (unlike 2.01, which attaches both).
 */
import * as React from 'react';
import {render} from '@react-email/render';

import type {Locale} from '@/content/locale';
import {NURTURE_KEYS, type NurtureKey} from './copy';
import {WelcomeTrial} from './WelcomeTrial';
import {WelcomeGeneral} from './WelcomeGeneral';
import {TrialInvite} from './TrialInvite';
import {Nudge} from './Nudge';

const COMPONENTS: Record<NurtureKey, React.ComponentType<{locale: Locale}>> = {
  'welcome-trial': WelcomeTrial,
  'welcome-general': WelcomeGeneral,
  'trial-invite': TrialInvite,
  nudge: Nudge
};

/**
 * Restore the literal quotes React escapes (`"`→`&quot;`, `'`→`&#x27;`/`&#39;`)
 * INSIDE `{{ … }}` merge-tag spans, so Brevo receives a valid `default:` filter.
 * The braces themselves are not escaped, and the replace is confined to merge-tag
 * spans, so no legitimate copy is touched. (The `{{ unsubscribe }}` href carries
 * no quotes, so it is unaffected.)
 *
 * This intentionally handles only QUOTE escaping — the only entity a `default:`
 * value needs today. A merge-tag default must therefore contain no raw `&`/`<`/`>`
 * (React would emit `&amp;`/`&lt;`, which this would not restore); the current
 * fallbacks ("your child" / "вашето дете") contain none.
 */
export function finalizeMergeTags(html: string): string {
  return html.replace(/\{\{[^}]*\}\}/g, (tag) =>
    tag
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
  );
}

/** Render one nurture email (key × locale) to Brevo-ready static HTML. */
export async function renderNurtureEmail(
  key: NurtureKey,
  locale: Locale
): Promise<string> {
  const element = React.createElement(COMPONENTS[key], {locale});
  const html = await render(element);
  return finalizeMergeTags(html);
}

export {NURTURE_KEYS};
