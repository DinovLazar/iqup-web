/**
 * Phase 2.03 — bilingual copy for the four follow-up "nurture" emails that run on
 * the marketing list (the list 2.02 populates ONLY on `marketing_opt_in`).
 *
 * These are version-controlled, reviewable marketing templates — the content half
 * of the lead lifecycle. They reuse the 2.01 results-email brand + layout and are
 * personalised ENTIRELY by Brevo merge tags (filled by Brevo at send time, never
 * by us), using only attributes Brevo already stores from 2.02:
 *   - `CHILD_FIRST_NAME` (text)  — greeted with a graceful empty-name fallback;
 *   - `CHILD_AGE` (number)       — a Brevo BRANCH condition only, never shown;
 *   - `LOCALE` (text mk/en)      — a Brevo BRANCH condition only, never shown.
 * No new data exists and none is needed (decision #91).
 *
 * Guardrails baked in here (every email, both languages):
 *   - NO numbers/scores anywhere — no IQ, score, %, rank, or digit in user-facing
 *     copy (the same forbidden-token discipline as 2.01/2.02). The child's AGE is
 *     never shown — it is only a Brevo branch condition. `copy.test.ts` is the
 *     tripwire over every slot below.
 *   - Personalisation = Brevo merge tags only (see `MERGE`), with a graceful
 *     empty-name default so an absent name never renders awkwardly.
 *   - Footer carries the unsubscribe tag + the legal sender identity + postal
 *     address (marketing email legally requires both).
 *
 * ALL MACEDONIAN IS PROVISIONAL — pending native-MK review (as for every phase).
 * EN mirrors MK and must stay equivalent in meaning. The footer identity tagline +
 * signoff are REUSED from the 2.01 `Email.footer` strings (single source); the
 * legal entity / postal line is flagged for IqUp legal, tied to `CONSENT_VERSION`
 * (decisions #83/#88/#96 — the legal/consent boundary the reviewer must see).
 */
import type {Locale} from '@/content/locale';
import enMessages from '@/messages/en.json';
import mkMessages from '@/messages/mk.json';

/** The four nurture emails. */
export type NurtureKey =
  | 'welcome-trial'
  | 'welcome-general'
  | 'trial-invite'
  | 'nudge';

export const NURTURE_KEYS: readonly NurtureKey[] = [
  'welcome-trial',
  'welcome-general',
  'trial-invite',
  'nudge'
];

/**
 * Brevo merge tags, authored as string-literal constants so they render VERBATIM
 * into the HTML (writing `{{ }}` directly in JSX would be parsed as an expression).
 * The `default:` filter gives the graceful empty-name fallback; the render helper
 * (`render.ts`) restores the literal quotes React escapes inside text content, so
 * Brevo receives a valid filter.
 */
export const MERGE = {
  /** Child first name with a graceful, natural-reading fallback. */
  childName: (fallback: string): string =>
    `{{ contact.CHILD_FIRST_NAME | default: "${fallback}" }}`,
  /** Brevo's unsubscribe link target (used as an href — no quotes, never escaped). */
  unsubscribe: '{{ unsubscribe }}'
} as const;

/** The natural-reading empty-name fallback per locale ("…with your child."). */
const CHILD_FALLBACK: Record<Locale, string> = {
  en: 'your child',
  mk: 'вашето дете'
};

/** The child-first-name merge tag, ready to drop into prose, per locale. */
function childName(locale: Locale): string {
  return MERGE.childName(CHILD_FALLBACK[locale]);
}

/** Which kind of call-to-action an email carries. */
export type CtaKind = 'trial' | 'general';

/** The localized, fully-authored content of one nurture email. */
export interface NurtureEmailCopy {
  /** Inbox subject line. */
  readonly subject: string;
  /** Inbox preview / pre-header snippet. */
  readonly preview: string;
  /** Main heading. */
  readonly heading: string;
  /** Generic greeting (we greet the parent — no parent name is collected). */
  readonly greeting: string;
  /** Warm opening line — carries the child-name merge tag. */
  readonly intro: string;
  /** Remaining body paragraphs (same count across locales for parity). */
  readonly body: readonly string[];
  /**
   * Call-to-action label. `trial` → the trial-booking CTA (identical label across
   * the three trial emails, matching the 2.01 email); `general` → a soft "visit"
   * link (welcome-general only — NO trial CTA).
   */
  readonly cta: string;
  /** Distinguishes the trial CTA from the general visit link. */
  readonly ctaKind: CtaKind;
}

/** The shared footer (identity + legal + unsubscribe), per locale. */
export interface NurtureFooterCopy {
  /** Brand tagline — REUSED from the 2.01 `Email.footer.identity` (single source). */
  readonly identity: string;
  /** Why the parent is receiving this (marketing-list transparency). */
  readonly receiving: string;
  /** Legal sender identity + postal address (flagged for IqUp legal). */
  readonly legal: string;
  /** Unsubscribe link label (the link target is `MERGE.unsubscribe`). */
  readonly unsubscribeLabel: string;
  /** Closing signoff — REUSED from the 2.01 `Email.footer.signoff` (single source). */
  readonly signoff: string;
}

export interface NurtureLocaleCopy {
  readonly footer: NurtureFooterCopy;
  readonly emails: Record<NurtureKey, NurtureEmailCopy>;
}

/**
 * The legal sender-identity + postal address. The legal entity + address are from
 * `brand.md` §1 (IKUP d.o.o., Todor Aleksandrov No. 4, 1000 Skopje). Marketing
 * email legally requires a working unsubscribe + a postal address; this line is
 * flagged for IqUp legal review, tied to the consent wording (`CONSENT_VERSION`).
 */
// The legal ENTITY name stays in its registered Latin form (`IKUP d.o.o.`, as in
// brand.md §1 — and the brand renders itself in Latin throughout the MK site); only
// the street/city is localized. Kept identical across locales so it is a stable,
// assertable token for the unsubscribe-footer legal requirement.
const LEGAL: Record<Locale, string> = {
  en: 'IKUP d.o.o. · Todor Aleksandrov No. 4 · 1000 Skopje, North Macedonia',
  mk: 'IKUP d.o.o. · ул. Тодор Александров бр. 4 · 1000 Скопје, Северна Македонија'
};

/** Reuse the 2.01 footer identity tagline + signoff so the family stays one. */
const MESSAGES = {en: enMessages, mk: mkMessages} as const;
function footerFor(locale: Locale): NurtureFooterCopy {
  const m = MESSAGES[locale].Email.footer;
  return {
    identity: m.identity,
    signoff: m.signoff,
    receiving:
      locale === 'en'
        ? 'You’re receiving this because you asked us to keep in touch.'
        : 'Ја добивате оваа порака бидејќи побаравте да останеме во контакт.',
    legal: LEGAL[locale],
    unsubscribeLabel: locale === 'en' ? 'Unsubscribe' : 'Отпишете се'
  };
}

/** The single trial-CTA label per locale — matches the 2.01 results email. */
const TRIAL_CTA: Record<Locale, string> = {
  en: 'Find your nearest centre',
  mk: 'Најдете го најблискиот центар'
};

const EN_EMAILS: Record<NurtureKey, NurtureEmailCopy> = {
  'welcome-trial': {
    subject: 'Welcome to the IqUp family',
    preview:
      'Your child’s strengths are in your inbox — and a free trial class is waiting.',
    heading: 'Welcome to the IqUp family',
    greeting: 'Hello,',
    intro: `Thank you for exploring the IqUp Brain Games with ${childName('en')}.`,
    body: [
      'Your child’s strengths profile and certificate are already in your inbox — keep them somewhere special, or share them with the family.',
      'Over the next little while we’ll send a couple more notes: a peek at what an IqUp class feels like, and a warm invitation to come and try one.',
      'A free trial class is waiting whenever you’re ready — playful, hands-on, and with no pressure at all.'
    ],
    cta: TRIAL_CTA.en,
    ctaKind: 'trial'
  },
  'welcome-general': {
    subject: 'Welcome to the IqUp family',
    preview:
      'Your child’s strengths are in your inbox — and there’s more to come.',
    heading: 'Welcome to the IqUp family',
    greeting: 'Hello,',
    intro: `Thank you for exploring the IqUp Brain Games with ${childName('en')}.`,
    body: [
      'Your child’s strengths profile and certificate are already in your inbox — keep them somewhere special, or share them with the family.',
      'We love seeing curious minds at work. From time to time we’ll share new ideas, stories and things to try — all in the same warm spirit.',
      'We’re so glad to have you with us.'
    ],
    cta: 'Explore the world of IqUp',
    ctaKind: 'general'
  },
  'trial-invite': {
    subject: 'What an IqUp class feels like',
    preview:
      'A story, hands-on discovery, and something your child creates — come and see.',
    heading: 'Come and see what we do',
    greeting: 'Hello,',
    intro: `We’d love to show you what a day at IqUp looks like for ${childName('en')}.`,
    body: [
      'Every class begins with a story from Bibi, Bobi and Oliver — the characters your child may already know and love.',
      'From there it’s all hands on: real experiments, playful puzzles, and discovery the children lead themselves.',
      'And every class ends with the children creating something of their own — a little project, a game, an idea brought to life.',
      'The best way to feel it is to come along. Your free trial class is waiting — no pressure, just play.'
    ],
    cta: TRIAL_CTA.en,
    ctaKind: 'trial'
  },
  nudge: {
    subject: 'Whenever you’re ready',
    preview:
      'No rush — your child’s free trial class is still here for you.',
    heading: 'Still here, whenever you’re ready',
    greeting: 'Hello,',
    intro: 'Just a gentle note from all of us at IqUp.',
    body: [
      'We know life gets busy, so there’s no rush at all.',
      'Whenever the moment feels right, a free trial class is still waiting — a warm, playful first taste of the world of IqUp.',
      `We’d love to welcome ${childName('en')} along.`
    ],
    cta: TRIAL_CTA.en,
    ctaKind: 'trial'
  }
};

const MK_EMAILS: Record<NurtureKey, NurtureEmailCopy> = {
  'welcome-trial': {
    subject: 'Добредојдовте во семејството на IqUp',
    preview:
      'Силните страни на вашето дете се во вашето сандаче — а ве чека и бесплатен пробен час.',
    heading: 'Добредојдовте во семејството на IqUp',
    greeting: 'Здраво,',
    intro: `Ви благодариме што ги истраживте Мозочните игри на IqUp со ${childName('mk')}.`,
    body: [
      'Прегледот на силните страни и сертификатот на вашето дете се веќе во вашето сандаче — зачувајте ги на посебно место или споделете ги со семејството.',
      'Во наредниов период ќе ви испратиме уште неколку пораки: мал поглед во тоа како изгледа еден час во IqUp и топла покана да дојдете и да го пробате.',
      'Бесплатен пробен час ве чека секогаш кога сте подготвени — забавно, практично и без никаква обврска.'
    ],
    cta: TRIAL_CTA.mk,
    ctaKind: 'trial'
  },
  'welcome-general': {
    subject: 'Добредојдовте во семејството на IqUp',
    preview:
      'Силните страни на вашето дете се во вашето сандаче — а следува и повеќе.',
    heading: 'Добредојдовте во семејството на IqUp',
    greeting: 'Здраво,',
    intro: `Ви благодариме што ги истраживте Мозочните игри на IqUp со ${childName('mk')}.`,
    body: [
      'Прегледот на силните страни и сертификатот на вашето дете се веќе во вашето сандаче — зачувајте ги на посебно место или споделете ги со семејството.',
      'Сакаме да гледаме љубопитни умови во акција. Одвреме-навреме ќе споделуваме нови идеи, приказни и нешта за пробување — во истиот топол дух.',
      'Многу ни е драго што сте со нас.'
    ],
    cta: 'Истражете го светот на IqUp',
    ctaKind: 'general'
  },
  'trial-invite': {
    subject: 'Како изгледа еден час во IqUp',
    preview:
      'Приказна, истражување со раце и нешто што вашето дете го создава — дојдете да видите.',
    heading: 'Дојдете да видите што правиме',
    greeting: 'Здраво,',
    intro: `Со задоволство би ви покажале како изгледа еден ден во IqUp за ${childName('mk')}.`,
    body: [
      'Секој час започнува со приказна од Биби, Боби и Оливер — ликовите што вашето дете можеби веќе ги знае и сака.',
      'Оттаму, сè е практично: вистински експерименти, разиграни загатки и истражување што децата сами го водат.',
      'И секој час завршува со тоа што децата создаваат нешто свое — мал проект, игра или идеја оживеана.',
      'Најдобар начин да го почувствувате е да дојдете. Вашиот бесплатен пробен час ве чека — без притисок, само игра.'
    ],
    cta: TRIAL_CTA.mk,
    ctaKind: 'trial'
  },
  nudge: {
    subject: 'Секогаш кога сте подготвени',
    preview:
      'Без брзање — бесплатниот пробен час за вашето дете сè уште ве чека.',
    heading: 'Сè уште тука, секогаш кога сте подготвени',
    greeting: 'Здраво,',
    intro: 'Само топла порака од сите нас во IqUp.',
    body: [
      'Знаеме дека животот знае да биде зафатен, па нема никаква журба.',
      'Кога и да ви дојде вистинскиот момент, бесплатен пробен час сè уште ве чека — топло, разиграно прво запознавање со светот на IqUp.',
      `Со радост би го пречекале ${childName('mk')}.`
    ],
    cta: TRIAL_CTA.mk,
    ctaKind: 'trial'
  }
};

/** The full bilingual nurture copy, keyed by locale. */
export const NURTURE_COPY: Record<Locale, NurtureLocaleCopy> = {
  en: {footer: footerFor('en'), emails: EN_EMAILS},
  mk: {footer: footerFor('mk'), emails: MK_EMAILS}
};

/** Resolve one email's copy for a locale. */
export function getNurtureCopy(
  key: NurtureKey,
  locale: Locale
): NurtureEmailCopy {
  return NURTURE_COPY[locale].emails[key];
}
