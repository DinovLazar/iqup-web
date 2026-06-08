/**
 * Localised vocabulary + alt-text generation for the test visuals.
 *
 * Image stems need a text alternative (WCAG 1.1.1). The option tiles already get
 * their alt from each option's bilingual `label`; this builds a concise, locale-
 * correct description of a *stem* from its structured `StemSpec` so screen-reader
 * users get the same puzzle content sighted users see.
 *
 * NOTE: the Macedonian strings here are provisional, Claude-drafted alt text and
 * follow the same "pending native-MK review" rule as the rest of the copy.
 */
import type {Locale} from '@/content/locale';
import type {
  Direction,
  GlyphName,
  GlyphSpec,
  StemSpec,
  ToyColor
} from '@/content/test/types';

/** ToyColor → CSS custom property (globals.css `--toy-*`). */
export function toyVar(color: ToyColor | undefined): string {
  return `var(--toy-${color ?? 'neutral'})`;
}

/** Sensible default colour per object glyph when content omits one. */
export const DEFAULT_GLYPH_COLOR: Partial<Record<GlyphName, ToyColor>> = {
  apple: 'red',
  banana: 'yellow',
  grapes: 'purple',
  bird: 'blue',
  fish: 'teal',
  plane: 'blue',
  sun: 'orange',
  moon: 'blue',
  tree: 'green',
  ball: 'red',
  cat: 'neutral',
  dog: 'neutral',
  rabbit: 'neutral',
  duck: 'yellow',
  butterfly: 'purple'
};

const COLOR_WORD: Record<ToyColor, Record<Locale, string>> = {
  red: {en: 'red', mk: 'црвен'},
  blue: {en: 'blue', mk: 'син'},
  yellow: {en: 'yellow', mk: 'жолт'},
  green: {en: 'green', mk: 'зелен'},
  purple: {en: 'purple', mk: 'виолетов'},
  orange: {en: 'orange', mk: 'портокалов'},
  pink: {en: 'pink', mk: 'розев'},
  teal: {en: 'teal', mk: 'тиркизен'},
  neutral: {en: '', mk: ''}
};

const GLYPH_WORD: Record<GlyphName, Record<Locale, string>> = {
  apple: {en: 'apple', mk: 'јаболко'},
  banana: {en: 'banana', mk: 'банана'},
  grapes: {en: 'grapes', mk: 'грозје'},
  cat: {en: 'cat', mk: 'маче'},
  dog: {en: 'dog', mk: 'куче'},
  rabbit: {en: 'rabbit', mk: 'зајаче'},
  bird: {en: 'bird', mk: 'птица'},
  fish: {en: 'fish', mk: 'риба'},
  duck: {en: 'duck', mk: 'патка'},
  plane: {en: 'aeroplane', mk: 'авион'},
  butterfly: {en: 'butterfly', mk: 'пеперутка'},
  car: {en: 'car', mk: 'автомобил'},
  tree: {en: 'tree', mk: 'дрво'},
  sun: {en: 'sun', mk: 'сонце'},
  moon: {en: 'moon', mk: 'месечина'},
  ball: {en: 'ball', mk: 'топка'},
  sock: {en: 'sock', mk: 'чорап'},
  shoe: {en: 'shoe', mk: 'чевел'},
  balloon: {en: 'balloon', mk: 'балон'},
  block: {en: 'block', mk: 'коцка'},
  circle: {en: 'circle', mk: 'круг'},
  square: {en: 'square', mk: 'квадрат'},
  triangle: {en: 'triangle', mk: 'триаголник'},
  star: {en: 'star', mk: 'ѕвезда'},
  heart: {en: 'heart', mk: 'срце'},
  dots: {en: 'dots', mk: 'точки'},
  arrow: {en: 'arrow', mk: 'стрелка'},
  'wedge-circle': {en: 'a circle with a piece missing', mk: 'круг со парче што недостасува'},
  wedge: {en: 'a wedge piece', mk: 'парче во форма на клин'},
  'piece-square': {en: 'a square piece', mk: 'квадратно парче'},
  'wedge-small': {en: 'a smaller wedge', mk: 'помало парче'},
  'rot-base': {en: 'a shape', mk: 'фигура'},
  'rot-rotated': {en: 'a rotated shape', mk: 'завртена фигура'},
  'rot-mirror': {en: 'a mirrored shape', mk: 'огледална фигура'},
  'rot-different': {en: 'a different shape', mk: 'друга фигура'},
  'cube-net': {en: 'a cube net', mk: 'мрежа на коцка'},
  cube: {en: 'a cube', mk: 'коцка'}
};

const DIRECTION_WORD: Record<Direction, Record<Locale, string>> = {
  up: {en: 'up', mk: 'нагоре'},
  right: {en: 'right', mk: 'надесно'},
  down: {en: 'down', mk: 'надолу'},
  left: {en: 'left', mk: 'налево'},
  'up-right': {en: 'up and right', mk: 'горе-десно'},
  'up-left': {en: 'up and left', mk: 'горе-лево'},
  'down-right': {en: 'down and right', mk: 'долу-десно'},
  'down-left': {en: 'down and left', mk: 'долу-лево'}
};

function describeGlyph(spec: GlyphSpec, locale: Locale): string {
  const noun = GLYPH_WORD[spec.glyph][locale];
  if (spec.glyph === 'arrow' && spec.dir) {
    const dir = DIRECTION_WORD[spec.dir][locale];
    return locale === 'mk' ? `${noun} ${dir}` : `${dir} ${noun}`;
  }
  if (spec.glyph === 'dots' && typeof spec.count === 'number') {
    return `${spec.count} ${noun}`;
  }
  const color = spec.color ? COLOR_WORD[spec.color][locale] : '';
  if (!color) return noun;
  // EN: "red circle"; MK: „црвен круг" — both place the colour adjective first.
  return `${color} ${noun}`;
}

const T = {
  thenWhat: {en: ', then what comes next?', mk: ', а потоа што следи?'},
  hole: {en: 'a {shape}-shaped hole', mk: 'дупка во форма на {shape}'},
  grid: {en: 'a 3 by 3 grid of dot groups', mk: 'мрежа 3×3 со групи точки'},
  treeBirds: {en: 'a tree with {n} birds', mk: 'дрво со {n} птици'},
  versus: {en: ' versus ', mk: ' наспроти '},
  picture: {en: 'puzzle picture', mk: 'сликовна загатка'}
} as const;

/** A concise, localised text alternative for a stem graphic. */
export function stemAlt(stem: StemSpec, locale: Locale): string {
  switch (stem.kind) {
    case 'single':
      return describeGlyph(stem.item, locale);
    case 'sequence': {
      const parts = stem.items.map((g) => describeGlyph(g, locale)).join(', ');
      return stem.missing ? parts + T.thenWhat[locale] : parts;
    }
    case 'count':
      return `${stem.count} ${GLYPH_WORD[stem.item.glyph][locale]}`;
    case 'compare': {
      const noun = GLYPH_WORD[stem.item.glyph][locale];
      return `${stem.leftCount} ${noun}${T.versus[locale]}${stem.rightCount} ${noun}`;
    }
    case 'hole':
      return T.hole[locale].replace('{shape}', GLYPH_WORD[stem.shape][locale]);
    case 'number':
      return stem.values.join(' ');
    case 'grid':
      return T.grid[locale];
    case 'scene':
      return stem.items.map((g) => describeGlyph(g, locale)).join(', ');
    case 'scene-birds':
      return T.treeBirds[locale].replace('{n}', String(stem.count));
    default:
      return T.picture[locale];
  }
}
