/**
 * Result wrapper templates — transcribed from Phase 1.04 content spec §6B/§6C.
 *
 * MK verbatim from the spec (provisional); EN mirrors it. Slot variables are
 * filled by `getResultCopy` / `TrialInvite` (see `./index.ts` and `./types.ts`).
 */
import type {Locale} from '@/content/locale';
import type {ResultTemplates} from './types';

export const RESULT_TEMPLATES: Readonly<Record<Locale, ResultTemplates>> = {
  en: {
    kidCelebration: 'Hooray! You finished the IqUp Brain Games!',
    headline:
      'Here’s what we noticed about {child}: their brain really lit up in {top1_name} and {top2_name}.',
    alsoStrong: 'We also saw real strength in {top3_name}.',
    growingLine:
      'And there’s more on the way — {growing_list} are all growing beautifully.',
    trialCta:
      'Want to see {child}’s curiosity in action? Come to a free trial class at IqUp {center} — playful, hands-on, and no pressure at all.',
    closing:
      'These strengths are {child}’s to build on — keep feeding that curious mind. You can download and share the certificate below.',
    certificate:
      '{child} completed the IqUp Brain Games and shone in {top1_name} & {top2_name}!'
  },
  mk: {
    kidCelebration: 'Ура! Ги заврши Мозочните игри на IqUp!',
    headline:
      'Еве што забележавме кај {child}: умот вистински засвети во {top1_name} и {top2_name}.',
    alsoStrong: 'Видовме вистинска сила и во {top3_name}.',
    growingLine:
      'И има уште нешто во подем — {growing_list} убаво се развиваат.',
    trialCta:
      'Сакате да ја видите љубопитноста на {child} во акција? Дојдете на бесплатен пробен час во IqUp {center} — забавно, практично и без никаква обврска.',
    closing:
      'Овие сили се основата врз која {child} може да гради — продолжете да го хранат тој љубопитен ум. Подолу можете да го преземете и споделите сертификатот.',
    certificate:
      '{child} ги заврши Мозочните игри на IqUp и заблеска во {top1_name} и {top2_name}!'
  }
};
