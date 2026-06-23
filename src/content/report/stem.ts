/**
 * STEM-readiness + the STEM bridge (spec 9 / plan.md §6.7). The bridge connects
 * spatial thinking + logical problem-solving (+ computational thinking where
 * present) to the coding / robotics message THROUGH NARRATIVE — it never alters
 * any index formula (indices stay conceptually clean). The variant is chosen by
 * which STEM-relevant strengths are present.
 */
import type {StemCopy} from './types';

export const STEM_COPY: StemCopy = {
  intro: {
    mk: 'Делот за STEM-подготвеност гледа како вашето дете ги поврзува идеите со прават нешта — основата на природните науки, технологијата и кодирањето.',
    en: 'The STEM-readiness part looks at how your child connects ideas to making things — the foundation of science, technology, and coding.'
  },
  bridge: {
    spatial_logical: {
      mk: 'Просторното размислување и логиката се токму двете нешта што го хранат раното кодирање и роботика: да се замисли како нешто се движи и да се испланираат чекорите за да се случи. Кај вашето дете обете се истакнуваат — убава основа за градење и програмирање.',
      en: 'Spatial thinking and logic are exactly the two things that feed early coding and robotics: picturing how something moves and planning the steps to make it happen. In your child both stand out — a lovely foundation for building and programming.'
    },
    computational: {
      mk: 'Вашето дете природно ги разложува работите на чекори и забележува што следи — токму размислувањето зад кодирањето и роботиката. Со малку насока, тоа лесно преминува во правење игри, анимации и мали проекти.',
      en: 'Your child naturally breaks things into steps and notices what comes next — exactly the thinking behind coding and robotics. With a little guidance, that flows easily into making games, animations, and small projects.'
    },
    single: {
      mk: 'Веќе е тука една од градбените блокови на STEM — а просторното размислување, логиката и разложувањето на чекори растат заедно. Игрите со градење и едноставното кодирање убаво ги поврзуваат.',
      en: 'One of the building blocks of STEM is already here — and spatial thinking, logic, and breaking things into steps grow together. Building games and simple coding connect them nicely.'
    },
    emerging: {
      mk: 'Градбените блокови на STEM — да се замислуваат форми, да се планираат чекори, да се пробуваат идеи — се развиваат кај секое дете со игра и време. Раното кодирање и роботиката се одличен, разигран начин тие да се негуваат.',
      en: 'The building blocks of STEM — picturing shapes, planning steps, trying ideas — develop in every child with play and time. Early coding and robotics are a wonderful, playful way to nurture them.'
    }
  }
};
