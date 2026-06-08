/**
 * Band 10–13 (`10-13`) question bank — 14 full-text + abstract-figure items, solo.
 *
 * Transcribed verbatim from Phase 1.04 content spec §5C. **The Macedonian copy is
 * provisional and copied exactly from the spec — do not edit, translate, reorder,
 * or "improve" it.** English mirrors it structurally. Each item feeds exactly one
 * strength (spec distribution: pattern 3, logic 3, memory 2, spatial 2,
 * numeracy 2, words_obs 2 = 14).
 */
import type {BandContent} from './types';

export const BAND_10_13: BandContent = {
  band: '10-13',
  questions: [
    // C-Q01 — pattern · correct A (3×3 dot grid; each row counts up by one)
    {
      id: 'c-q01',
      band: '10-13',
      strength: 'pattern',
      prompt: {en: 'Which figure is missing?', mk: 'Која фигура недостасува?'},
      stem: {
        kind: 'grid',
        rows: [
          [1, 2, 3],
          [2, 3, 4],
          [3, 4, '?']
        ]
      },
      options: [
        {id: 'a', label: {en: '5 dots', mk: '5 точки'}, glyphs: [{glyph: 'dots', count: 5}]},
        {id: 'b', label: {en: '4 dots', mk: '4 точки'}, glyphs: [{glyph: 'dots', count: 4}]},
        {id: 'c', label: {en: '6 dots', mk: '6 точки'}, glyphs: [{glyph: 'dots', count: 6}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // C-Q02 — pattern · correct A (×3 each step)
    {
      id: 'c-q02',
      band: '10-13',
      strength: 'pattern',
      prompt: {en: 'What number comes next? 2, 6, 18, 54, ?', mk: 'Кој број следи? 2, 6, 18, 54, ?'},
      options: [
        {id: 'a', label: {en: '162', mk: '162'}},
        {id: 'b', label: {en: '108', mk: '108'}},
        {id: 'c', label: {en: '216', mk: '216'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // C-Q03 — pattern · correct A (90° clockwise each step)
    {
      id: 'c-q03',
      band: '10-13',
      strength: 'pattern',
      prompt: {
        en: 'An arrow turns 90° clockwise each step: up → right → down → ?',
        mk: 'Стрелката се врти за 90° во насока на стрелките на часовникот: горе → десно → долу → ?'
      },
      options: [
        {id: 'a', label: {en: 'left', mk: 'лево'}, glyphs: [{glyph: 'arrow', dir: 'left', color: 'purple'}]},
        {id: 'b', label: {en: 'up', mk: 'горе'}, glyphs: [{glyph: 'arrow', dir: 'up', color: 'purple'}]},
        {id: 'c', label: {en: 'right', mk: 'десно'}, glyphs: [{glyph: 'arrow', dir: 'right', color: 'purple'}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // C-Q04 — logic · correct C
    {
      id: 'c-q04',
      band: '10-13',
      strength: 'logic',
      prompt: {
        en: 'Maya is taller than Bojan. Bojan is taller than Sara. Who is the shortest?',
        mk: 'Маја е повисока од Бојан. Бојан е повисок од Сара. Кој е најнизок?'
      },
      options: [
        {id: 'a', label: {en: 'Maya', mk: 'Маја'}},
        {id: 'b', label: {en: 'Bojan', mk: 'Бојан'}},
        {id: 'c', label: {en: 'Sara', mk: 'Сара'}}
      ],
      correct: 'c',
      asset: 'text'
    },

    // C-Q05 — logic · correct A
    {
      id: 'c-q05',
      band: '10-13',
      strength: 'logic',
      prompt: {
        en: 'If it rains, the match is cancelled. The match was NOT cancelled. What can we conclude?',
        mk: 'Ако врне дожд, натпреварот се откажува. Натпреварот НЕ беше откажан. Што можеме да заклучиме?'
      },
      options: [
        {id: 'a', label: {en: 'It did not rain', mk: 'Не врнеше дожд'}},
        {id: 'b', label: {en: 'It rained', mk: 'Врнеше дожд'}},
        {id: 'c', label: {en: 'We cannot know', mk: 'Не можеме да знаеме'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // C-Q06 — logic · correct A
    {
      id: 'c-q06',
      band: '10-13',
      strength: 'logic',
      prompt: {
        en: 'In one class, everyone who plays chess also plays piano. Ana plays chess. Which must be true?',
        mk: 'Во едно одделение, секој што игра шах исто така свири пијано. Ана игра шах. Што мора да е точно?'
      },
      options: [
        {id: 'a', label: {en: 'Ana plays piano', mk: 'Ана свири пијано'}},
        {id: 'b', label: {en: 'Ana does not play piano', mk: 'Ана не свири пијано'}},
        {id: 'c', label: {en: 'We cannot know', mk: 'Не можеме да знаеме'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // C-Q07 — memory · correct C · reveal (~3s), numbers 7 2 9 4
    {
      id: 'c-q07',
      band: '10-13',
      strength: 'memory',
      prompt: {en: 'What was the THIRD number?', mk: 'Кој беше ТРЕТИОТ број?'},
      stem: {kind: 'number', values: ['7', '2', '9', '4']},
      mechanic: 'reveal',
      revealMs: 3000,
      options: [
        {id: 'a', label: {en: '7', mk: '7'}},
        {id: 'b', label: {en: '2', mk: '2'}},
        {id: 'c', label: {en: '9', mk: '9'}},
        {id: 'd', label: {en: '4', mk: '4'}}
      ],
      correct: 'c',
      asset: 'text'
    },

    // C-Q08 — memory · correct A · reveal (~4s), sequence triangle, heart, square, star
    {
      id: 'c-q08',
      band: '10-13',
      strength: 'memory',
      prompt: {en: 'Which option shows the same order?', mk: 'Која опција го покажува истиот редослед?'},
      stem: {
        kind: 'sequence',
        items: [
          {glyph: 'triangle', color: 'purple'},
          {glyph: 'heart', color: 'pink'},
          {glyph: 'square', color: 'teal'},
          {glyph: 'star', color: 'yellow'}
        ]
      },
      mechanic: 'reveal',
      revealMs: 4000,
      options: [
        {
          id: 'a',
          label: {en: 'triangle, heart, square, star', mk: 'триаголник, срце, квадрат, ѕвезда'},
          glyphs: [
            {glyph: 'triangle', color: 'purple'},
            {glyph: 'heart', color: 'pink'},
            {glyph: 'square', color: 'teal'},
            {glyph: 'star', color: 'yellow'}
          ]
        },
        {
          id: 'b',
          label: {en: 'heart, triangle, square, star', mk: 'срце, триаголник, квадрат, ѕвезда'},
          glyphs: [
            {glyph: 'heart', color: 'pink'},
            {glyph: 'triangle', color: 'purple'},
            {glyph: 'square', color: 'teal'},
            {glyph: 'star', color: 'yellow'}
          ]
        },
        {
          id: 'c',
          label: {en: 'triangle, square, heart, star', mk: 'триаголник, квадрат, срце, ѕвезда'},
          glyphs: [
            {glyph: 'triangle', color: 'purple'},
            {glyph: 'square', color: 'teal'},
            {glyph: 'heart', color: 'pink'},
            {glyph: 'star', color: 'yellow'}
          ]
        }
      ],
      correct: 'a',
      asset: 'icons'
    },

    // C-Q09 — spatial · correct A (rotation vs mirror distractor)
    {
      id: 'c-q09',
      band: '10-13',
      strength: 'spatial',
      prompt: {en: 'Which option is the SAME shape, just rotated?', mk: 'Која опција е истата фигура, само завртена?'},
      stem: {kind: 'single', item: {glyph: 'rot-base', color: 'teal'}},
      options: [
        {id: 'a', label: {en: 'the rotation', mk: 'завртената'}, glyphs: [{glyph: 'rot-rotated', color: 'teal'}]},
        {id: 'b', label: {en: 'the mirror image', mk: 'огледалната'}, glyphs: [{glyph: 'rot-mirror', color: 'teal'}]},
        {id: 'c', label: {en: 'a different shape', mk: 'друга фигура'}, glyphs: [{glyph: 'rot-different', color: 'teal'}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // C-Q10 — spatial · correct A (which cube folds from this net)
    {
      id: 'c-q10',
      band: '10-13',
      strength: 'spatial',
      prompt: {en: 'Which cube can be folded from this net?', mk: 'Која коцка може да се состави од оваа мрежа?'},
      stem: {kind: 'single', item: {glyph: 'cube-net', color: 'blue'}},
      options: [
        {id: 'a', label: {en: 'the matching cube', mk: 'коцката што одговара'}, glyphs: [{glyph: 'cube', variant: 'match', color: 'blue'}]},
        {id: 'b', label: {en: 'a cube with two faces swapped', mk: 'коцка со заменети две страни'}, glyphs: [{glyph: 'cube', variant: 'swapped', color: 'blue'}]},
        {id: 'c', label: {en: 'a cube with a wrong face', mk: 'коцка со погрешна страна'}, glyphs: [{glyph: 'cube', variant: 'wrong', color: 'blue'}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // C-Q11 — numeracy · correct A
    {
      id: 'c-q11',
      band: '10-13',
      strength: 'numeracy',
      prompt: {
        en: 'A toy costs 120 denars. It is 25% off. What is the new price?',
        mk: 'Една играчка чини 120 денари. Намалена е за 25%. Која е новата цена?'
      },
      options: [
        {id: 'a', label: {en: '90 denars', mk: '90 денари'}},
        {id: 'b', label: {en: '95 denars', mk: '95 денари'}},
        {id: 'c', label: {en: '100 denars', mk: '100 денари'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // C-Q12 — numeracy · correct A (the others are perfect squares)
    {
      id: 'c-q12',
      band: '10-13',
      strength: 'numeracy',
      prompt: {en: 'Which number does NOT fit? 9, 16, 25, 30, 36', mk: 'Кој број НЕ се вклопува? 9, 16, 25, 30, 36'},
      options: [
        {id: 'a', label: {en: '30', mk: '30'}},
        {id: 'b', label: {en: '16', mk: '16'}},
        {id: 'c', label: {en: '36', mk: '36'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // C-Q13 — words_obs · correct A
    {
      id: 'c-q13',
      band: '10-13',
      strength: 'words_obs',
      prompt: {en: 'Bird is to nest as bee is to ___?', mk: 'Птица е спрема гнездо како пчела спрема ___?'},
      options: [
        {id: 'a', label: {en: 'hive', mk: 'кошница'}},
        {id: 'b', label: {en: 'honey', mk: 'мед'}},
        {id: 'c', label: {en: 'flower', mk: 'цвет'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // C-Q14 — words_obs · correct A
    {
      id: 'c-q14',
      band: '10-13',
      strength: 'words_obs',
      prompt: {
        en: 'Which word is the odd one out? ocean · lake · river · desert · pond',
        mk: 'Кој збор е вишок? океан · езеро · река · пустина · бара'
      },
      options: [
        {id: 'a', label: {en: 'desert', mk: 'пустина'}},
        {id: 'b', label: {en: 'lake', mk: 'езеро'}},
        {id: 'c', label: {en: 'river', mk: 'река'}}
      ],
      correct: 'a',
      asset: 'text'
    }
  ]
};
