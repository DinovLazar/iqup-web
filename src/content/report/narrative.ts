/**
 * Narrative module families (spec 9.2): profile-shape (3), index-pair (4),
 * solving-style (5), learning-slope (6), extremes (9). Each is a small module
 * that fires on a `CognitiveProfile` feature and contributes one sentence.
 *
 * Solving style is an OBSERVED style (spec 9.5) — speed–accuracy, persistence,
 * approach to new tasks — never a speculative "learning style". No numbers.
 */
import type {
  ExtremesCopy,
  IndexPairCopy,
  LearningSlopeCopy,
  ProfileShapeCopy,
  SolvingStyleCopy
} from './types';

/** Profile shape: even (flat) vs standout-areas (spiky). */
export const PROFILE_SHAPE_COPY: ProfileShapeCopy = {
  flat: {
    mk: 'Низ петте области сликата е прилично рамномерна — вашето дете носи сличен сет силни страни на сѐ, основа на која убаво се гради во многу насоки.',
    en: 'Across the five areas the picture is fairly even — your child brings a similar set of strengths to everything, a foundation that builds nicely in many directions.'
  },
  spiky: {
    mk: 'Сликата има јасни врвови — некои области се истакнуваат повеќе од другите. Тоа е сосема вообичаено и често укажува каде природно се насочува љубопитноста.',
    en: 'The picture has clear peaks — some areas stand out more than others. That is perfectly common and often shows where curiosity naturally leans.'
  }
};

/** Index-pair narration: meaningful strong pairings. */
export const INDEX_PAIR_COPY: IndexPairCopy = {
  spatial_logical: {
    mk: 'Просторното размислување и логиката одат заедно кај вашето дете — комбинација што многу убаво се вклопува со STEM, градењето и кодирањето.',
    en: 'Spatial thinking and logic travel together for your child — a combination that fits beautifully with STEM, building, and coding.'
  },
  memory_planning: {
    mk: 'Доброто помнење и планирањето се надополнуваат — вашето дете може да држи чекори во умот и да ги нареди по ред, што ја прави секоја посложена задача поудобна.',
    en: 'A good memory and planning reinforce one another — your child can hold steps in mind and put them in order, which makes any longer task feel more comfortable.'
  },
  generic_strong: {
    mk: 'Две области се истакнуваат заедно и се потпираат една на друга — пријатна синергија што му дава на вашето дете повеќе начини да пристапи кон новото.',
    en: 'Two areas stand out together and lean on each other — a pleasant synergy that gives your child more ways to approach something new.'
  }
};

/** Solving style (observed): speed–accuracy / persistence / approach to new tasks. */
export const SOLVING_STYLE_COPY: SolvingStyleCopy = {
  reflective_accurate: {
    mk: 'Во текот на тестот, вашето дете работеше промислено и внимателно — одвојуваше време и стигнуваше до точни одговори. Тоа е смирен, темелен пристап кон новите задачи.',
    en: 'Throughout the test, your child worked thoughtfully and carefully — taking time and arriving at accurate answers. That is a calm, thorough approach to new tasks.'
  },
  fast_accurate: {
    mk: 'Во текот на тестот, вашето дете работеше брзо и сепак точно — фаќаше што се бара и одговараше уверено. Удобен, течен пристап кон новите задачи.',
    en: 'Throughout the test, your child worked quickly and still accurately — grasping what was asked and answering with confidence. A comfortable, fluent approach to new tasks.'
  },
  fast_errors: {
    mk: 'Во текот на тестот, вашето дете одговараше живо и со полет — понекогаш набрзина. Малку повеќе време за проверка пред одговор убаво ќе го пренасочи тој ентузијазам.',
    en: 'Throughout the test, your child answered eagerly and with energy — sometimes in a hurry. A little extra time to double-check before answering will channel that enthusiasm nicely.'
  },
  balanced: {
    mk: 'Во текот на тестот, вашето дете најде урамнотежен ритам меѓу брзината и вниманието, прилагодувајќи се на секоја нова задача. Сестран, флексибилен пристап.',
    en: 'Throughout the test, your child found a balanced rhythm between speed and care, adapting to each new task. A versatile, flexible approach.'
  }
};

/** Learning trajectory across repeated attempts (the Glr slope, kindly framed). */
export const LEARNING_SLOPE_COPY: LearningSlopeCopy = {
  fast: {
    mk: 'Кога нешто се повторуваше, вашето дете брзо се подобруваше од обид во обид — знак дека новото брзо станува познато.',
    en: 'When something repeated, your child improved quickly from one try to the next — a sign that the new becomes familiar fast.'
  },
  steady: {
    mk: 'Кога нешто се повторуваше, вашето дете напредуваше постојано и сигурно — секој обид носеше малку повеќе сигурност.',
    en: 'When something repeated, your child made steady, reliable progress — each try brought a little more confidence.'
  },
  repetition: {
    mk: 'Вашето дете најубаво учи со неколку мирни повторувања — кога новото ќе се види повеќепати, се сложува на свое место. Сосема природно темпо за учење.',
    en: 'Your child learns best with a few calm repetitions — once the new is seen a few times, it settles into place. A perfectly natural pace for learning.'
  }
};

/** Ceiling / floor extremes (plan.md §6.5 / spec 7.3). */
export const EXTREMES_COPY: ExtremesCopy = {
  ceiling: {
    mk: 'Во некои задачи вашето дете стигна до врвот на тоа што го мери овој тест за неговата возраст — знак дека е спремно за поголеми, побогати предизвици.',
    en: 'On some tasks your child reached the top of what this test measures for their age — a sign they are ready for bigger, richer challenges.'
  },
  floor: {
    mk: 'Некои задачи беа нови за моментот, па останаа за следен пат. Тоа не кажува ништо конечно — често е само прашање на запознавање со нов вид задача.',
    en: 'Some tasks were new for the moment, so they were left for next time. That says nothing final — often it is just a matter of meeting a new kind of task.'
  }
};
