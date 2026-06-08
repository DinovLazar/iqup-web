/**
 * Band 3–5 (`3-5`) question bank — 10 image-only, parent-assisted items.
 *
 * Transcribed verbatim from Phase 1.04 content spec §5A. **The Macedonian copy is
 * provisional and copied exactly from the spec — do not edit, translate, reorder,
 * or "improve" it.** English mirrors it structurally (same ids, same option
 * order). Each item feeds exactly one strength (spec distribution: pattern 2,
 * spatial 2, numeracy 2, words_obs 2, memory 1, logic 1 = 10).
 */
import type {BandContent} from './types';

export const BAND_3_5: BandContent = {
  band: '3-5',
  questions: [
    // A-Q01 — pattern · correct A
    {
      id: 'a-q01',
      band: '3-5',
      strength: 'pattern',
      prompt: {en: 'What comes next?', mk: 'Што доаѓа следно?'},
      stem: {
        kind: 'sequence',
        missing: true,
        items: [
          {glyph: 'circle', color: 'red'},
          {glyph: 'circle', color: 'blue'},
          {glyph: 'circle', color: 'red'},
          {glyph: 'circle', color: 'blue'}
        ]
      },
      options: [
        {id: 'a', label: {en: 'red circle', mk: 'црвен круг'}, glyphs: [{glyph: 'circle', color: 'red'}]},
        {id: 'b', label: {en: 'blue circle', mk: 'син круг'}, glyphs: [{glyph: 'circle', color: 'blue'}]},
        {id: 'c', label: {en: 'yellow circle', mk: 'жолт круг'}, glyphs: [{glyph: 'circle', color: 'yellow'}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // A-Q02 — pattern · correct A
    {
      id: 'a-q02',
      band: '3-5',
      strength: 'pattern',
      prompt: {en: 'Which one finishes the row?', mk: 'Што ја пополнува редицата?'},
      stem: {
        kind: 'sequence',
        missing: true,
        items: [
          {glyph: 'apple'},
          {glyph: 'banana'},
          {glyph: 'apple'},
          {glyph: 'banana'},
          {glyph: 'apple'}
        ]
      },
      options: [
        {id: 'a', label: {en: 'banana', mk: 'банана'}, glyphs: [{glyph: 'banana'}]},
        {id: 'b', label: {en: 'apple', mk: 'јаболко'}, glyphs: [{glyph: 'apple'}]},
        {id: 'c', label: {en: 'grapes', mk: 'грозје'}, glyphs: [{glyph: 'grapes'}]}
      ],
      correct: 'a',
      asset: 'icons'
    },

    // A-Q03 — words_obs · correct D (three identical ducks and one cat)
    {
      id: 'a-q03',
      band: '3-5',
      strength: 'words_obs',
      prompt: {en: 'Which one is different?', mk: 'Кој е различен?'},
      options: [
        {id: 'a', label: {en: 'duck', mk: 'патка'}, glyphs: [{glyph: 'duck'}]},
        {id: 'b', label: {en: 'duck', mk: 'патка'}, glyphs: [{glyph: 'duck'}]},
        {id: 'c', label: {en: 'duck', mk: 'патка'}, glyphs: [{glyph: 'duck'}]},
        {id: 'd', label: {en: 'cat', mk: 'маче'}, glyphs: [{glyph: 'cat'}]}
      ],
      correct: 'd',
      asset: 'icons'
    },

    // A-Q04 — words_obs · correct A
    {
      id: 'a-q04',
      band: '3-5',
      strength: 'words_obs',
      prompt: {en: 'Tap the red ball.', mk: 'Допри ја црвената топка.'},
      stem: {
        kind: 'scene',
        items: [
          {glyph: 'ball', color: 'red'},
          {glyph: 'car', color: 'blue'},
          {glyph: 'tree', color: 'green'}
        ]
      },
      options: [
        {id: 'a', label: {en: 'red ball', mk: 'црвена топка'}, glyphs: [{glyph: 'ball', color: 'red'}]},
        {id: 'b', label: {en: 'blue car', mk: 'син автомобил'}, glyphs: [{glyph: 'car', color: 'blue'}]},
        {id: 'c', label: {en: 'green tree', mk: 'зелено дрво'}, glyphs: [{glyph: 'tree', color: 'green'}]}
      ],
      correct: 'a',
      asset: 'scene'
    },

    // A-Q05 — spatial · correct A
    {
      id: 'a-q05',
      band: '3-5',
      strength: 'spatial',
      prompt: {en: 'Which shape fits the hole?', mk: 'Која форма се вклопува во дупката?'},
      stem: {kind: 'hole', shape: 'star'},
      options: [
        {id: 'a', label: {en: 'star', mk: 'ѕвезда'}, glyphs: [{glyph: 'star', color: 'yellow'}]},
        {id: 'b', label: {en: 'circle', mk: 'круг'}, glyphs: [{glyph: 'circle', color: 'blue'}]},
        {id: 'c', label: {en: 'square', mk: 'квадрат'}, glyphs: [{glyph: 'square', color: 'teal'}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // A-Q06 — spatial · correct B
    {
      id: 'a-q06',
      band: '3-5',
      strength: 'spatial',
      prompt: {en: 'Which one is the same shape?', mk: 'Која форма е иста?'},
      stem: {kind: 'single', item: {glyph: 'triangle', color: 'purple'}},
      options: [
        {id: 'a', label: {en: 'circle', mk: 'круг'}, glyphs: [{glyph: 'circle', color: 'blue'}]},
        {id: 'b', label: {en: 'triangle', mk: 'триаголник'}, glyphs: [{glyph: 'triangle', color: 'purple'}]},
        {id: 'c', label: {en: 'square', mk: 'квадрат'}, glyphs: [{glyph: 'square', color: 'teal'}]}
      ],
      correct: 'b',
      asset: 'shapes'
    },

    // A-Q07 — numeracy · correct B
    {
      id: 'a-q07',
      band: '3-5',
      strength: 'numeracy',
      prompt: {en: 'How many apples?', mk: 'Колку јаболка има?'},
      stem: {kind: 'count', item: {glyph: 'apple'}, count: 3},
      options: [
        {id: 'a', label: {en: '2', mk: '2'}},
        {id: 'b', label: {en: '3', mk: '3'}},
        {id: 'c', label: {en: '4', mk: '4'}}
      ],
      correct: 'b',
      asset: 'icons'
    },

    // A-Q08 — numeracy · correct B
    {
      id: 'a-q08',
      band: '3-5',
      strength: 'numeracy',
      prompt: {en: 'Which group has more?', mk: 'Која група има повеќе?'},
      stem: {kind: 'compare', item: {glyph: 'balloon'}, leftCount: 2, rightCount: 4},
      options: [
        {
          id: 'a',
          label: {en: 'the group of 2', mk: 'групата од 2'},
          glyphs: [{glyph: 'balloon', color: 'red'}, {glyph: 'balloon', color: 'blue'}]
        },
        {
          id: 'b',
          label: {en: 'the group of 4', mk: 'групата од 4'},
          glyphs: [
            {glyph: 'balloon', color: 'red'},
            {glyph: 'balloon', color: 'blue'},
            {glyph: 'balloon', color: 'green'},
            {glyph: 'balloon', color: 'yellow'}
          ]
        }
      ],
      correct: 'b',
      asset: 'icons'
    },

    // A-Q09 — memory · correct A · reveal (~3s)
    {
      id: 'a-q09',
      band: '3-5',
      strength: 'memory',
      prompt: {en: 'Which animal did you just see?', mk: 'Кое животно го виде?'},
      stem: {kind: 'single', item: {glyph: 'cat'}},
      mechanic: 'reveal',
      revealMs: 3000,
      options: [
        {id: 'a', label: {en: 'cat', mk: 'маче'}, glyphs: [{glyph: 'cat'}]},
        {id: 'b', label: {en: 'dog', mk: 'куче'}, glyphs: [{glyph: 'dog'}]},
        {id: 'c', label: {en: 'rabbit', mk: 'зајаче'}, glyphs: [{glyph: 'rabbit'}]}
      ],
      correct: 'a',
      asset: 'icons'
    },

    // A-Q10 — logic · correct A
    {
      id: 'a-q10',
      band: '3-5',
      strength: 'logic',
      prompt: {en: 'Which one goes with the sock?', mk: 'Што оди со чорапот?'},
      stem: {kind: 'single', item: {glyph: 'sock', color: 'purple'}},
      options: [
        {id: 'a', label: {en: 'shoe', mk: 'чевел'}, glyphs: [{glyph: 'shoe', color: 'blue'}]},
        {id: 'b', label: {en: 'apple', mk: 'јаболко'}, glyphs: [{glyph: 'apple'}]},
        {id: 'c', label: {en: 'ball', mk: 'топка'}, glyphs: [{glyph: 'ball', color: 'red'}]}
      ],
      correct: 'a',
      asset: 'icons'
    }
  ]
};
