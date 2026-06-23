/**
 * Per-index copy (spec 9.2 families 1–2): the parent-facing index name, the
 * as-the-top-strength body, the as-the-growth-area body, and a supporting "try
 * this" line for the growth area. Plus the two edge-case growth variants
 * (all-strong "next frontier", all-floor gentle) per plan.md §6.5.
 *
 * The five indices mirror `@/lib/scoring/v2` (Logical · Spatial · Memory & focus
 * · Planning & speed · Learning & STEM). Growth is always "room to grow", never
 * a deficit. No numbers, ever.
 */
import type {Localized} from '@/content/locale';
import type {IndexCopyTable} from './types';

export const INDEX_COPY: IndexCopyTable = {
  logical: {
    name: {mk: 'Логичко размислување', en: 'Logical reasoning'},
    strength: {
      mk: 'Вашето дете сака да доаѓа до решение — поврзува траги и размислува чекор по чекор додека работите не се сложат. Тоа е срцето на решавањето проблеми.',
      en: 'Your child loves to reach an answer — connecting clues and reasoning step by step until things click into place. That is the heart of problem-solving.'
    },
    growth: {
      mk: 'Логичкото размислување има убав простор да расте — да се поврзуваат причини и последици и да се гради одговорот чекор по чекор. Се покажува кога новата задача бара план пред да се почне.',
      en: 'Logical reasoning has lovely room to grow — linking cause and effect and building an answer one step at a time. It shows up when a new task asks for a plan before the first move.'
    },
    growthActivity: {
      mk: 'Пробајте заедно: гласно „размислувајте на глас" кога решавате мала загатка или планирате ден.',
      en: 'Try together: "think out loud" as a team when solving a small riddle or planning the day.'
    }
  },
  spatial: {
    name: {mk: 'Просторно размислување', en: 'Spatial thinking'},
    strength: {
      mk: 'Вашето дете размислува преку форми и простор — замислува како нештата се вклопуваат, се вртат и се поврзуваат. Тоа е имагинацијата зад градењето, уметноста и инженерството.',
      en: 'Your child thinks in shapes and space — picturing how things fit, turn, and connect. It is the imagination behind building, art, and engineering.'
    },
    growth: {
      mk: 'Усетот за форми и простор има простор да расте — да се замислува како изгледа нешто од друга страна или склопено. Се покажува при сложувалки, склопување и цртање од замисла.',
      en: 'A feel for shape and space has room to grow — picturing how something looks from another side or once assembled. It shows up with puzzles, building, and drawing from imagination.'
    },
    growthActivity: {
      mk: 'Пробајте заедно: коцки, оригами или сложувалки каде нештата треба да се завртат за да се вклопат.',
      en: 'Try together: building blocks, origami, or puzzles where pieces have to be turned to fit.'
    }
  },
  memory_focus: {
    name: {mk: 'Меморија и концентрација', en: 'Memory & focus'},
    strength: {
      mk: 'Вашето дете задржува што гледа и се враќа на тоа со леснотија, држејќи го вниманието на задачата. Силно помнење што го олеснува секој вид учење.',
      en: 'Your child holds on to what they see and returns to it with ease, keeping attention on the task. A strong memory that makes every kind of learning lighter.'
    },
    growth: {
      mk: 'Помнењето и задржувањето на вниманието имаат простор да растат — да се чува низа чекори во умот додека работите траат. Се покажува при упатства со повеќе чекори или подолги задачи.',
      en: 'Holding things in mind and staying with a task have room to grow — keeping a run of steps in mind while the work continues. It shows up with multi-step instructions or longer tasks.'
    },
    growthActivity: {
      mk: 'Пробајте заедно: игри на помнење, „на пазар купив…" со додавање нешта, или раскажување приказна по ред.',
      en: 'Try together: memory games, "I went shopping and bought…" adding items, or retelling a story in order.'
    }
  },
  planning_speed: {
    name: {mk: 'Планирање и брзина', en: 'Planning & speed'},
    strength: {
      mk: 'Вашето дете прави план пред да дејствува и работи внимателно во добар ритам — гледа неколку чекори напред наместо да брза. Тоа е вештината зад уредна, организирана работа.',
      en: 'Your child makes a plan before acting and works carefully at a good rhythm — looking a few steps ahead instead of rushing. That is the skill behind tidy, organised work.'
    },
    growth: {
      mk: 'Планирањето и ритамот на работа имаат простор да растат — да се замисли редоследот пред да се почне и да се најде удобно темпо. Се покажува кога има повеќе чекори да се наредат.',
      en: 'Planning and working rhythm have room to grow — picturing the order before starting and finding a comfortable pace. It shows up when there are several steps to arrange.'
    },
    growthActivity: {
      mk: 'Пробајте заедно: мали игри со потези однапред (лавиринт, рута) и „што прво, што потоа" при секојдневни задачи.',
      en: 'Try together: small think-ahead games (a maze, a route) and "what first, what next" on everyday tasks.'
    }
  },
  learning_stem: {
    name: {mk: 'Учење и STEM', en: 'Learning & STEM'},
    strength: {
      mk: 'Вашето дете брзо фаќа нови правила и ги претвора во чекори — токму размислувањето што стои зад природните науки, кодирањето и истражувањето. Учи преку обиди и забележува што следи.',
      en: 'Your child picks up new rules quickly and turns them into steps — exactly the thinking behind science, coding, and discovery. It learns by trying and notices what comes next.'
    },
    growth: {
      mk: 'Усвојувањето нови правила и нивното применување имаат простор да растат — да се фати ново упатство и да се проба чекор по чекор. Се покажува при нови игри, експерименти или загатки од нов вид.',
      en: 'Picking up new rules and applying them has room to grow — grasping a fresh instruction and trying it step by step. It shows up with new games, experiments, or unfamiliar kinds of puzzle.'
    },
    growthActivity: {
      mk: 'Пробајте заедно: едноставни домашни експерименти и игри со кодирање без екран („дај ми чекори да стигнам до…").',
      en: 'Try together: simple kitchen experiments and screen-free coding games ("give me the steps to reach…").'
    }
  }
};

/**
 * The all-strong "next frontier" growth framing (plan.md §6.5): when every index
 * sits high, there is no deficit to name — only a most-exciting place to stretch
 * next. The lowest index's name is filled in by assembly via `{index}`.
 */
export const NEXT_FRONTIER_GROWTH: Localized = {
  mk: 'Сите пет области се развиени за возраста, рамномерно силни. Ако барате каде да се истражува понатаму, {index} е природната следна авантура: простор за поголеми, побогати предизвици.',
  en: 'All five areas are developed for the age, evenly strong. If you are looking for where to stretch next, {index} is the natural next adventure: room for bigger, richer challenges.'
};

/**
 * The all-floor gentle framing (plan.md §6.5): the tasks were simply new for the
 * moment — a calm retake on a fresh day usually tells a fuller story. Never a
 * deficit, never "below".
 */
export const GENTLE_FLOOR_GROWTH: Localized = {
  mk: 'Денес задачите беа нови за моментот, па ова е само прв поглед, не целата слика. Мирно повторување во опуштен ден обично открива многу повеќе — секое дете цвета со време и охрабрување.',
  en: 'Today the tasks were new for the moment, so this is just a first glimpse, not the whole picture. A calm retake on a relaxed day usually reveals much more — every child blossoms with time and encouragement.'
};
