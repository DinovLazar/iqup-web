/**
 * Band → display-WORD and confidence → word + note mappings (spec 6.4 / 6.5).
 *
 * The band enum from `@/lib/scoring/v2` is deliberately word-free; the approved
 * parent-facing words live here (bilingual). NEVER a number or a range — the
 * word only. Words follow plan.md §6.4 verbatim in meaning.
 */
import type {BandWords, ConfidenceWords} from './types';

/**
 * The four bands as parent-facing words (plan.md §6.4):
 *   exceptional → "Exceptionally developed for the age"
 *   strong      → "Strongly developed"
 *   solid       → "Solid for the age"
 *   developing  → "In development"  (never "low" / "below" / a number)
 */
export const BAND_WORDS: BandWords = {
  exceptional: {
    mk: 'Исклучително развиено за возраста',
    en: 'Exceptionally developed for the age'
  },
  strong: {
    mk: 'Силно развиено',
    en: 'Strongly developed'
  },
  solid: {
    mk: 'Солидно за возраста',
    en: 'Solid for the age'
  },
  developing: {
    mk: 'Во развој',
    en: 'In development'
  }
};

/**
 * Confidence as the approved word + a plain-language note about what that
 * confidence means for the reading (spec 6.5). Medium / low gently invite a calm
 * retake — never framed as the child's shortfall.
 */
export const CONFIDENCE_WORDS: ConfidenceWords = {
  high: {
    word: {mk: 'Висока', en: 'High'},
    note: {
      mk: 'Засновано на полн, доследен сет одговори — јасно читање на оваа област.',
      en: 'Based on a full, consistent set of answers — a clear reading of this area.'
    }
  },
  medium: {
    word: {mk: 'Средна', en: 'Medium'},
    note: {
      mk: 'Засновано на умерен сет одговори — во основа сигурно; мирно повторување би го изострило.',
      en: 'Based on a moderate set of answers — broadly reliable; a calm retake would sharpen it.'
    }
  },
  low: {
    word: {mk: 'Ниска', en: 'Low'},
    note: {
      mk: 'Засновано на помалку одговори — земете го како прв поглед; мирно повторување би го изострило.',
      en: 'Based on fewer answers — take it as a first glimpse; a calm retake would sharpen it.'
    }
  }
};
