/**
 * Home-activity bank (spec 9.2, family 8 — the largest content block), keyed by
 * (index, age-cluster). The engine draws 2–3 per child from the cells matching
 * the child's top strength + growth area + a STEM-relevant area, so the set
 * varies child to child. Every activity is screen-light, warm, and free of any
 * number / score language.
 *
 * Clusters mirror `@/lib/engine` (`ageCluster`): 5-7 · 8-9 · 10-13. Each cell has
 * at least two activities for variety and exact MK/EN key parity.
 */
import type {ActivityBank} from './types';

export const ACTIVITY_BANK: ActivityBank = {
  // ── Logical reasoning (Gf) ──────────────────────────────────────────────
  logical: {
    '5-7': [
      {
        title: {mk: 'Што не припаѓа?', en: 'Which one is different?'},
        body: {
          mk: 'Наредете три предмети што одат заедно и еден што не — нека вашето дете го најде натрапникот и каже зошто.',
          en: 'Lay out three things that go together and one that does not — have your child find the odd one and say why.'
        }
      },
      {
        title: {mk: 'Што следи?', en: 'What comes next?'},
        body: {
          mk: 'Направете едноставна низа од играчки или копчиња (црвено-сино-црвено-сино…) и прашајте што доаѓа потоа.',
          en: 'Make a simple pattern with toys or buttons (red-blue-red-blue…) and ask what comes next.'
        }
      }
    ],
    '8-9': [
      {
        title: {mk: 'Дваесет прашања', en: 'Twenty questions'},
        body: {
          mk: 'Замислете предмет; вашето дете го погодува само со прашања на „да/не". Учи да стеснува можности чекор по чекор.',
          en: 'Think of an object; your child guesses it with only yes/no questions. It teaches narrowing down step by step.'
        }
      },
      {
        title: {mk: 'Кој е виновникот?', en: 'Who did it?'},
        body: {
          mk: 'Измислете мала мистерија со неколку траги и решете ја заедно — поврзување на траги до заклучок.',
          en: 'Invent a small mystery with a few clues and solve it together — connecting clues to a conclusion.'
        }
      }
    ],
    '10-13': [
      {
        title: {mk: 'Логички загатки', en: 'Logic grid puzzles'},
        body: {
          mk: 'Пробајте загатки со траги каде се вкрстуваат повеќе услови — идеални за размислување чекор по чекор.',
          en: 'Try clue-based grid puzzles where several conditions cross — ideal for step-by-step reasoning.'
        }
      },
      {
        title: {mk: 'Расправа за вечера', en: 'Dinner-table debate'},
        body: {
          mk: 'Изберете лесна тема и нека вашето дете брани став со причини, па нека ги замени страните. Гради аргументирано размислување.',
          en: 'Pick a light topic and have your child defend a view with reasons, then switch sides. It builds reasoned argument.'
        }
      }
    ]
  },
  // ── Spatial thinking (Gv) ───────────────────────────────────────────────
  spatial: {
    '5-7': [
      {
        title: {mk: 'Кула од коцки', en: 'Block towers'},
        body: {
          mk: 'Градете заедно од коцки и прашувајте „што ако ставиме ова тука?" — рано чувство за рамнотежа и форма.',
          en: 'Build with blocks together and ask "what if we put this here?" — an early feel for balance and shape.'
        }
      },
      {
        title: {mk: 'Преклопување хартија', en: 'Paper folding'},
        body: {
          mk: 'Преклопувајте едноставни форми од хартија (брод, авионче) и забележувајте како рамното станува просторно.',
          en: 'Fold simple paper shapes (a boat, a plane) and notice how flat paper becomes a solid shape.'
        }
      }
    ],
    '8-9': [
      {
        title: {mk: 'Танграм форми', en: 'Tangram shapes'},
        body: {
          mk: 'Со сет танграм, склопувајте дадени силуети — вртење и вклопување делови во целина.',
          en: 'With a tangram set, build given silhouettes — turning and fitting pieces into a whole.'
        }
      },
      {
        title: {mk: 'Карта на собата', en: 'Map the room'},
        body: {
          mk: 'Нека вашето дете нацрта карта на собата одозгора. Преведување на просторот во цртеж.',
          en: 'Have your child draw a map of the room from above. Translating space into a drawing.'
        }
      }
    ],
    '10-13': [
      {
        title: {mk: 'Модели и макети', en: 'Models and builds'},
        body: {
          mk: 'Склопувајте модели по упатство или измислувајте сопствени конструкции — замислување на готовото пред да почне.',
          en: 'Assemble models from instructions or invent your own builds — picturing the finished thing before starting.'
        }
      },
      {
        title: {mk: 'Скици од агли', en: 'Angle sketching'},
        body: {
          mk: 'Пробајте цртање едноставни предмети од различни агли — иста работа, гледана од друга страна.',
          en: 'Try sketching simple objects from different angles — the same thing, seen from another side.'
        }
      }
    ]
  },
  // ── Memory & focus (Gsm + attention) ────────────────────────────────────
  memory_focus: {
    '5-7': [
      {
        title: {mk: 'Меморија со парови', en: 'Memory pairs'},
        body: {
          mk: 'Играјте класична игра со превртување карти и наоѓање парови — кратко помнење на што каде е.',
          en: 'Play the classic flip-the-cards-and-find-pairs game — short-term memory for what is where.'
        }
      },
      {
        title: {mk: 'На пазар купив…', en: 'I went shopping…'},
        body: {
          mk: 'Редете нешта по ред, секој додава едно и ги повторува претходните. Забавно за помнење низа.',
          en: 'Take turns adding items, each repeating the list so far. A fun way to hold a sequence in mind.'
        }
      }
    ],
    '8-9': [
      {
        title: {mk: 'Раскажи по ред', en: 'Retell in order'},
        body: {
          mk: 'По приказна или ден, нека вашето дете го прераскаже по ред — задржување на чекори и редослед.',
          en: 'After a story or a day out, have your child retell it in order — holding steps and sequence.'
        }
      },
      {
        title: {mk: 'Што се промени?', en: 'What changed?'},
        body: {
          mk: 'Наредете неколку предмети, нека ги погледне, па тајно сменете едно — вниманието на детали.',
          en: 'Lay out a few objects, let them look, then secretly change one — attention to detail.'
        }
      }
    ],
    '10-13': [
      {
        title: {mk: 'Помнење со техника', en: 'Memory tricks'},
        body: {
          mk: 'Покажете мали трикови (групирање, мали приказни за факти) за полесно помнење при учење.',
          en: 'Show small tricks (grouping, little stories for facts) to make remembering easier when studying.'
        }
      },
      {
        title: {mk: 'Едно по едно', en: 'One thing at a time'},
        body: {
          mk: 'Вежбајте мирен агол за работа без прекини — кратки фокусирани периоди со паузи. Гради издржливост на вниманието.',
          en: 'Practise a calm corner for distraction-free work — short focused stretches with breaks. It builds attention stamina.'
        }
      }
    ]
  },
  // ── Planning & speed (EF + Gs) ──────────────────────────────────────────
  planning_speed: {
    '5-7': [
      {
        title: {mk: 'Што прво, што потоа', en: 'First, then'},
        body: {
          mk: 'Пред задача (облекување, расчистување), договорете го редоследот гласно. Рано планирање чекори.',
          en: 'Before a task (getting dressed, tidying up), agree the order out loud. Early planning of steps.'
        }
      },
      {
        title: {mk: 'Лавиринт со прст', en: 'Finger mazes'},
        body: {
          mk: 'Цртајте едноставни лавиринти и наоѓајте пат до излезот — гледање неколку чекори напред.',
          en: 'Draw simple mazes and find the way out — looking a few steps ahead.'
        }
      }
    ],
    '8-9': [
      {
        title: {mk: 'Чек-листа за мисија', en: 'Mission checklist'},
        body: {
          mk: 'За мала задача со повеќе делови, направете заедно листа и штиклирајте по ред. Планирање и доследување.',
          en: 'For a small multi-part task, make a checklist together and tick items in order. Planning and following through.'
        }
      },
      {
        title: {mk: 'Игри со потези', en: 'Think-ahead games'},
        body: {
          mk: 'Дама, „четири во ред" или слично — игри каде се планира потег однапред.',
          en: 'Checkers, four-in-a-row, or similar — games where you plan a move ahead.'
        }
      }
    ],
    '10-13': [
      {
        title: {mk: 'Испланирај проект', en: 'Plan a project'},
        body: {
          mk: 'Нека вашето дете води мал проект (рецепт, мала изработка) од план до готово — редослед и темпо.',
          en: 'Have your child run a small project (a recipe, a small build) from plan to finish — order and pace.'
        }
      },
      {
        title: {mk: 'Шах или стратегија', en: 'Chess or strategy'},
        body: {
          mk: 'Стратешки игри наградуваат размислување неколку чекори напред и удобно темпо под притисок.',
          en: 'Strategy games reward thinking several steps ahead and a comfortable pace under a little pressure.'
        }
      }
    ]
  },
  // ── Learning & STEM (CT + Glr) ──────────────────────────────────────────
  learning_stem: {
    '5-7': [
      {
        title: {mk: 'Кодирање без екран', en: 'Screen-free coding'},
        body: {
          mk: 'Играјте „робот": вашето дете ви дава чекори за да стигнете до нешто во собата. Чекори што прават резултат.',
          en: 'Play "robot": your child gives you steps to reach something in the room. Steps that make a result.'
        }
      },
      {
        title: {mk: 'Кујнски експеримент', en: 'Kitchen experiment'},
        body: {
          mk: 'Едноставни безбедни обиди (што плива, што тоне) со прашање „што мислиш ќе се случи?".',
          en: 'Simple safe try-it-out moments (what floats, what sinks) with "what do you think will happen?"'
        }
      }
    ],
    '8-9': [
      {
        title: {mk: 'Чекор-по-чекор рецепт', en: 'Step-by-step recipe'},
        body: {
          mk: 'Гответе нешто едноставно следејќи чекори по ред — рано чувство за алгоритам што дава вкусен резултат.',
          en: 'Cook something simple following steps in order — an early feel for an algorithm with a tasty result.'
        }
      },
      {
        title: {mk: 'Блок-кодирање', en: 'Block coding'},
        body: {
          mk: 'Пробајте разиграно блок-кодирање каде се реди логика за да се движи лик. Учи нови правила со забава.',
          en: 'Try playful block coding where you stack logic to move a character. It learns new rules through fun.'
        }
      }
    ],
    '10-13': [
      {
        title: {mk: 'Направи мала игра', en: 'Make a small game'},
        body: {
          mk: 'Со разигран алат за кодирање, нека вашето дете направи едноставна игра или анимација — идеја до проект.',
          en: 'With a playful coding tool, have your child make a simple game or animation — an idea turned into a project.'
        }
      },
      {
        title: {mk: 'Истражувачко прашање', en: 'A question to investigate'},
        body: {
          mk: 'Изберете прашање од секојдневието и осмислете како да се провери — претпоставка, обид, заклучок.',
          en: 'Pick an everyday question and design how to test it — a guess, a try, a conclusion.'
        }
      }
    ]
  }
};
