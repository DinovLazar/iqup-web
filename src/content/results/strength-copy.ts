/**
 * Per-strength result copy — transcribed from Phase 1.04 content spec §6A.
 *
 * MK is verbatim from the spec (provisional, pending native-MK review); EN mirrors
 * it. The `short` descriptor (the constellation badge sub-line) is from the 1.09
 * mockup `Result.html` (also provisional). Strength codes import from the single
 * taxonomy in `@/content/strengths` — never redefined here.
 */
import type {StrengthResultCopy} from './types';

export const STRENGTH_RESULT_COPY: StrengthResultCopy = {
  pattern: {
    celebrated: {
      en: 'Your child has a sharp eye for patterns — noticing what repeats and sensing what comes next. It’s the same thinking that powers maths, music, and coding.',
      mk: 'Вашето дете има остро око за шаблони — забележува што се повторува и насетува што следи. Тоа е истото размислување што стои зад математиката, музиката и програмирањето.'
    },
    growing: {
      en: 'their feel for patterns is blossoming',
      mk: 'нивниот усет за шаблони цвета'
    },
    short: {
      en: 'Spots patterns everywhere',
      mk: 'Гледа обрасци насекаде'
    }
  },
  logic: {
    celebrated: {
      en: 'Your child loves to figure things out — connecting clues and reasoning step by step to an answer. That’s the heart of problem-solving.',
      mk: 'Вашето дете сака да доаѓа до решенија — поврзува траги и размислува чекор по чекор до одговорот. Тоа е срцето на решавањето проблеми.'
    },
    growing: {
      en: 'their reasoning is growing sharper',
      mk: 'нивното логичко размислување станува сè поостро'
    },
    short: {
      en: 'Reasons step by step',
      mk: 'Решава чекор по чекор'
    }
  },
  memory: {
    celebrated: {
      en: 'Your child holds on to what they see and recalls it with ease — a strong memory that makes every kind of learning lighter.',
      mk: 'Вашето дете памти што гледа и лесно се сеќава — силно помнење што го олеснува секој вид учење.'
    },
    growing: {
      en: 'their memory is getting stronger every day',
      mk: 'нивното помнење станува сè поцврсто секој ден'
    },
    short: {
      en: 'Remembers with ease',
      mk: 'Памти со леснотија'
    }
  },
  spatial: {
    celebrated: {
      en: 'Your child thinks in shapes and space — picturing how things fit, turn, and connect. It’s the imagination behind building, art, and engineering.',
      mk: 'Вашето дете размислува преку форми и простор — замислува како нештата се вклопуваат, се вртат и се поврзуваат. Тоа е имагинацијата зад градењето, уметноста и инженерството.'
    },
    growing: {
      en: 'their sense of shape and space is developing beautifully',
      mk: 'нивниот усет за форми и простор убаво се развива'
    },
    short: {
      // 1.09 mockup said "Thinks in 3D"; reworded to avoid a digit (no-number guardrail).
      en: 'Pictures shapes in space',
      mk: 'Мисли во простор'
    }
  },
  numeracy: {
    celebrated: {
      en: 'Your child has a natural friendship with numbers — counting, comparing, and working with quantities with real confidence.',
      mk: 'Вашето дете има природно пријателство со броевите — брои, споредува и работи со количини со вистинска сигурност.'
    },
    growing: {
      en: 'their number sense is growing',
      mk: 'нивниот усет за броеви расте'
    },
    short: {
      en: 'Loves numbers',
      mk: 'Ужива во броеви'
    }
  },
  words_obs: {
    celebrated: {
      en: 'Your child notices the little things and finds the right words — careful observation and language that fuel curiosity and communication.',
      mk: 'Вашето дете ги забележува деталите и ги наоѓа вистинските зборови — внимателно набљудување и јазик што ги поттикнуваат љубопитноста и комуникацијата.'
    },
    growing: {
      en: 'their eye for detail and words keeps growing',
      mk: 'нивното око за детали и зборови постојано расте'
    },
    short: {
      en: 'Notices the details',
      mk: 'Забележува детали'
    }
  }
};
