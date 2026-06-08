/**
 * Band 6–9 (`6-9`) question bank — 12 short-text + simple-image items, mostly solo.
 *
 * Transcribed verbatim from Phase 1.04 content spec §5B. **The Macedonian copy is
 * provisional and copied exactly from the spec — do not edit, translate, reorder,
 * or "improve" it.** English mirrors it structurally. Each item feeds exactly one
 * strength (spec distribution: pattern 2, logic 2, memory 2, spatial 2,
 * numeracy 2, words_obs 2 = 12).
 */
import type {BandContent} from './types';

export const BAND_6_9: BandContent = {
  band: '6-9',
  questions: [
    // B-Q01 — pattern · correct A
    {
      id: 'b-q01',
      band: '6-9',
      strength: 'pattern',
      prompt: {en: 'What comes next?', mk: 'Што доаѓа следно?'},
      stem: {
        kind: 'sequence',
        missing: true,
        items: [
          {glyph: 'dots', count: 1},
          {glyph: 'dots', count: 2},
          {glyph: 'dots', count: 3}
        ]
      },
      options: [
        {id: 'a', label: {en: '4 dots', mk: '4 точки'}, glyphs: [{glyph: 'dots', count: 4}]},
        {id: 'b', label: {en: '2 dots', mk: '2 точки'}, glyphs: [{glyph: 'dots', count: 2}]},
        {id: 'c', label: {en: '5 dots', mk: '5 точки'}, glyphs: [{glyph: 'dots', count: 5}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // B-Q02 — pattern · correct A
    {
      id: 'b-q02',
      band: '6-9',
      strength: 'pattern',
      prompt: {en: 'Complete the pattern.', mk: 'Дополни го шаблонот.'},
      stem: {
        kind: 'sequence',
        missing: true,
        items: [
          {glyph: 'circle', color: 'blue'},
          {glyph: 'square', color: 'blue'},
          {glyph: 'square', color: 'blue'},
          {glyph: 'circle', color: 'blue'},
          {glyph: 'square', color: 'blue'},
          {glyph: 'square', color: 'blue'},
          {glyph: 'circle', color: 'blue'},
          {glyph: 'square', color: 'blue'}
        ]
      },
      options: [
        {id: 'a', label: {en: 'square', mk: 'квадрат'}, glyphs: [{glyph: 'square', color: 'blue'}]},
        {id: 'b', label: {en: 'circle', mk: 'круг'}, glyphs: [{glyph: 'circle', color: 'blue'}]},
        {id: 'c', label: {en: 'triangle', mk: 'триаголник'}, glyphs: [{glyph: 'triangle', color: 'blue'}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // B-Q03 — logic · correct D (bird, butterfly, aeroplane fly; dog does not)
    {
      id: 'b-q03',
      band: '6-9',
      strength: 'logic',
      prompt: {en: 'Which one does NOT belong?', mk: 'Што НЕ припаѓа?'},
      options: [
        {id: 'a', label: {en: 'bird', mk: 'птица'}, glyphs: [{glyph: 'bird'}]},
        {id: 'b', label: {en: 'butterfly', mk: 'пеперутка'}, glyphs: [{glyph: 'butterfly'}]},
        {id: 'c', label: {en: 'aeroplane', mk: 'авион'}, glyphs: [{glyph: 'plane'}]},
        {id: 'd', label: {en: 'dog', mk: 'куче'}, glyphs: [{glyph: 'dog'}]}
      ],
      correct: 'd',
      asset: 'icons'
    },

    // B-Q04 — logic · correct A
    {
      id: 'b-q04',
      band: '6-9',
      strength: 'logic',
      prompt: {
        en: 'All the red blocks are big. This block is red. So this block is…',
        mk: 'Сите црвени коцки се големи. Оваа коцка е црвена. Значи, оваа коцка е…'
      },
      stem: {kind: 'single', item: {glyph: 'block', color: 'red'}},
      options: [
        {id: 'a', label: {en: 'big', mk: 'голема'}},
        {id: 'b', label: {en: 'small', mk: 'мала'}},
        {id: 'c', label: {en: 'round', mk: 'тркалезна'}}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // B-Q05 — memory · correct B · reveal (~4s), row: sun, star, moon
    {
      id: 'b-q05',
      band: '6-9',
      strength: 'memory',
      prompt: {en: 'Which one was in the MIDDLE?', mk: 'Што беше во СРЕДИНАТА?'},
      stem: {
        kind: 'sequence',
        items: [{glyph: 'sun'}, {glyph: 'star', color: 'yellow'}, {glyph: 'moon'}]
      },
      mechanic: 'reveal',
      revealMs: 4000,
      options: [
        {id: 'a', label: {en: 'sun', mk: 'сонце'}, glyphs: [{glyph: 'sun'}]},
        {id: 'b', label: {en: 'star', mk: 'ѕвезда'}, glyphs: [{glyph: 'star', color: 'yellow'}]},
        {id: 'c', label: {en: 'moon', mk: 'месечина'}, glyphs: [{glyph: 'moon'}]}
      ],
      correct: 'b',
      asset: 'icons'
    },

    // B-Q06 — memory · correct A · reveal (~3s), number 371
    {
      id: 'b-q06',
      band: '6-9',
      strength: 'memory',
      prompt: {en: 'Which number did you just see?', mk: 'Кој број го виде?'},
      stem: {kind: 'number', values: ['371']},
      mechanic: 'reveal',
      revealMs: 3000,
      options: [
        {id: 'a', label: {en: '371', mk: '371'}},
        {id: 'b', label: {en: '317', mk: '317'}},
        {id: 'c', label: {en: '731', mk: '731'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // B-Q07 — spatial · correct A (circle with a triangular wedge missing)
    {
      id: 'b-q07',
      band: '6-9',
      strength: 'spatial',
      prompt: {en: 'Which piece completes the picture?', mk: 'Кое парче ја комплетира сликата?'},
      stem: {kind: 'single', item: {glyph: 'wedge-circle', color: 'teal'}},
      options: [
        {id: 'a', label: {en: 'the matching wedge', mk: 'парчето што се вклопува'}, glyphs: [{glyph: 'wedge', color: 'teal'}]},
        {id: 'b', label: {en: 'a square piece', mk: 'квадратно парче'}, glyphs: [{glyph: 'piece-square', color: 'teal'}]},
        {id: 'c', label: {en: 'a smaller wedge', mk: 'помало парче'}, glyphs: [{glyph: 'wedge-small', color: 'teal'}]}
      ],
      correct: 'a',
      asset: 'shapes'
    },

    // B-Q08 — spatial · correct B (mirror image of an up-and-right arrow)
    {
      id: 'b-q08',
      band: '6-9',
      strength: 'spatial',
      prompt: {en: 'Which one is the mirror image of this arrow?', mk: 'Која е огледалната слика на стрелката?'},
      stem: {kind: 'single', item: {glyph: 'arrow', dir: 'up-right', color: 'purple'}},
      options: [
        {id: 'a', label: {en: 'arrow up-and-right', mk: 'стрелка горе-десно'}, glyphs: [{glyph: 'arrow', dir: 'up-right', color: 'purple'}]},
        {id: 'b', label: {en: 'arrow up-and-left', mk: 'стрелка горе-лево'}, glyphs: [{glyph: 'arrow', dir: 'up-left', color: 'purple'}]},
        {id: 'c', label: {en: 'arrow down-and-right', mk: 'стрелка долу-десно'}, glyphs: [{glyph: 'arrow', dir: 'down-right', color: 'purple'}]}
      ],
      correct: 'b',
      asset: 'shapes'
    },

    // B-Q09 — numeracy · correct A
    {
      id: 'b-q09',
      band: '6-9',
      strength: 'numeracy',
      prompt: {en: 'What number comes next? 2, 4, 6, ?', mk: 'Кој број следи? 2, 4, 6, ?'},
      options: [
        {id: 'a', label: {en: '8', mk: '8'}},
        {id: 'b', label: {en: '7', mk: '7'}},
        {id: 'c', label: {en: '10', mk: '10'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // B-Q10 — numeracy · correct A
    {
      id: 'b-q10',
      band: '6-9',
      strength: 'numeracy',
      prompt: {
        en: 'You have 5 stickers and give 2 away. How many are left?',
        mk: 'Имаш 5 налепници и даваш 2. Колку ти остануваат?'
      },
      options: [
        {id: 'a', label: {en: '3', mk: '3'}},
        {id: 'b', label: {en: '2', mk: '2'}},
        {id: 'c', label: {en: '7', mk: '7'}}
      ],
      correct: 'a',
      asset: 'text'
    },

    // B-Q11 — words_obs · correct C
    {
      id: 'b-q11',
      band: '6-9',
      strength: 'words_obs',
      prompt: {
        en: 'Which word does NOT belong? cat · dog · apple · fish',
        mk: 'Кој збор НЕ припаѓа? маче · куче · јаболко · риба'
      },
      options: [
        {id: 'a', label: {en: 'cat', mk: 'маче'}},
        {id: 'b', label: {en: 'dog', mk: 'куче'}},
        {id: 'c', label: {en: 'apple', mk: 'јаболко'}},
        {id: 'd', label: {en: 'fish', mk: 'риба'}}
      ],
      correct: 'c',
      asset: 'text'
    },

    // B-Q12 — words_obs · correct B (careful observation in a busy scene)
    {
      id: 'b-q12',
      band: '6-9',
      strength: 'words_obs',
      prompt: {
        en: 'Look carefully at the tree. How many birds can you count?',
        mk: 'Погледни го дрвото внимателно. Колку птици има?'
      },
      stem: {kind: 'scene-birds', count: 4},
      options: [
        {id: 'a', label: {en: '3', mk: '3'}},
        {id: 'b', label: {en: '4', mk: '4'}},
        {id: 'c', label: {en: '5', mk: '5'}}
      ],
      correct: 'b',
      asset: 'scene'
    }
  ]
};
