/**
 * Gf — Logical thinking (spec Прилог A.1): 3×3 matrices + number/shape series.
 *
 * REFERENCE generator: the pattern every other domain follows —
 *   `generate<Domain>(level, format, rng): Item` (pure given the rng state),
 *   `practice<Domain>(): Item` (a stable, easy demonstrative item),
 * each Item carrying a typed `payload` (presentation + `interaction` + `solution`),
 * a `judge`, and the `meta` the v2 scoring reads (here: `optionCount`).
 *
 * Difficulty (spec A.1 + PROVISIONAL extension above level 5):
 *  - series: rule order grows with level (+k → ×2 → ×k/alternating → second-order);
 *  - matrix: the number of varying attributes (`transformations`) grows with level.
 * Distractors are deterministic rule-violations (never giveaways): a series
 * distractor breaks the rule by a small offset; a matrix distractor mutates
 * exactly one attribute of the correct cell (spec A.1: "дистрактори менуваат еден
 * атрибут").
 */
import {makeRng, nextInt, pick, shuffle, type Rng} from '@/lib/engine/prng';
import type {Item, ItemFormat, ItemJudgment, Response} from '@/lib/engine/types';
import {COLORS, GLYPHS, type ColorToken, type Glyph} from './glyphs';
import {itemId} from './shared';
import type {GfMatrixSpec, GfSeriesSpec, MatrixCell} from './types';

const OPTION_COUNT = 4; // spec A.1: "Избор од 4"
const ROTATIONS: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];

/** Build the shared `select-one` judge: the chosen index equals the correct one. */
function selectJudge(correct: number) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const ok = response.answer === correct;
    return {correct: ok, credit: ok ? 1 : 0};
  };
}

// ─── Number series ───────────────────────────────────────────────────────────

interface SeriesRule {
  rule: string;
  /** Produce the n-th term (0-based) of the sequence. */
  term: (n: number) => number;
}

/** Choose a series rule whose order grows with `level` (spec A.1 table + extension). */
function seriesRuleFor(level: number, rng: Rng): SeriesRule {
  if (level <= 2) {
    const k = nextInt(rng, 1, 3);
    const a0 = nextInt(rng, 1, 4);
    return {rule: `+${k}`, term: (n) => a0 + k * n};
  }
  if (level === 3) {
    const a0 = nextInt(rng, 1, 3);
    return {rule: '×2', term: (n) => a0 * 2 ** n};
  }
  if (level === 4) {
    const k = nextInt(rng, 2, 3);
    const a0 = nextInt(rng, 1, 3);
    return {rule: `×${k}`, term: (n) => a0 * k ** n};
  }
  if (level === 5) {
    // Fibonacci-like second-order (spec A.1 level 5).
    const a = nextInt(rng, 1, 2);
    const b = nextInt(rng, 1, 3);
    const seq = [a, b];
    return {rule: 'second-order (a+b)', term: (n) => {
      while (seq.length <= n) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      return seq[n];
    }};
  }
  // PROVISIONAL (level 6–10): alternating two operations, growing in magnitude.
  const add = nextInt(rng, 2, 4) + level;
  const mul = nextInt(rng, 2, 3);
  const a0 = nextInt(rng, 1, 3);
  const seq = [a0];
  return {
    rule: `alternating ×${mul},+${add}`,
    term: (n) => {
      while (seq.length <= n) {
        const prev = seq[seq.length - 1];
        seq.push(seq.length % 2 === 1 ? prev * mul : prev + add);
      }
      return seq[n];
    }
  };
}

function generateSeries(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('gf.series', level, format, rng);
  const ruleObj = seriesRuleFor(level, rng);
  const visible = 4; // four shown terms + one missing
  const sequence: (number | null)[] = [];
  for (let n = 0; n < visible; n++) sequence.push(ruleObj.term(n));
  const correctValue = ruleObj.term(visible);
  sequence.push(null);
  const missingIndex = visible;

  // Distractors: rule-violations near the correct value, deterministic + distinct.
  const candidates = [correctValue + 1, correctValue - 1, correctValue + 2, sequence[visible - 1] as number];
  const distractors: number[] = [];
  for (const c of candidates) {
    if (c !== correctValue && c > 0 && !distractors.includes(c)) distractors.push(c);
    if (distractors.length === OPTION_COUNT - 1) break;
  }
  let pad = correctValue + 3;
  while (distractors.length < OPTION_COUNT - 1) {
    if (pad !== correctValue && !distractors.includes(pad)) distractors.push(pad);
    pad += 1;
  }

  const options = shuffle(rng, [correctValue, ...distractors]);
  const answer = options.indexOf(correctValue);

  const payload: GfSeriesSpec = {
    taskType: 'gf.series',
    sequence,
    missingIndex,
    options,
    interaction: {mode: 'select-one', optionCount: OPTION_COUNT},
    solution: {answer, rule: ruleObj.rule}
  };
  return {
    id,
    domain: 'Gf',
    level,
    format,
    payload,
    meta: {optionCount: OPTION_COUNT},
    judge: selectJudge(answer)
  };
}

// ─── Matrix ────────────────────────────────────────────────────────────────

type Attr = 'shape' | 'color' | 'count' | 'rotation';
const ALL_ATTRS: Attr[] = ['shape', 'color', 'count', 'rotation'];

/** How many attributes vary at this level (the difficulty measure). spec A.1: 1–3. */
function varyingAttrCount(level: number): number {
  if (level <= 2) return 1;
  if (level <= 5) return 2;
  return 3;
}

/** A per-attribute rule: constant, or a progression along rows or columns. */
interface AttrRule {
  axis: 'const' | 'row' | 'col';
  /** Index base + step (mod the attribute's domain size). */
  base: number;
  step: number;
}

function attrDomainSize(attr: Attr): number {
  switch (attr) {
    case 'shape':
      return 6; // first six glyphs
    case 'color':
      return COLORS.length;
    case 'count':
      return 3; // 1..3
    case 'rotation':
      return ROTATIONS.length;
  }
}

function attrValue(attr: Attr, rule: AttrRule, r: number, c: number): number {
  const size = attrDomainSize(attr);
  const k = rule.axis === 'row' ? r : rule.axis === 'col' ? c : 0;
  return (rule.base + rule.step * k) % size;
}

function buildCell(rules: Record<Attr, AttrRule>, r: number, c: number): MatrixCell {
  const shapeIdx = attrValue('shape', rules.shape, r, c);
  const colorIdx = attrValue('color', rules.color, r, c);
  const countIdx = attrValue('count', rules.count, r, c);
  const rotIdx = attrValue('rotation', rules.rotation, r, c);
  return {
    shape: GLYPHS[shapeIdx] as Glyph,
    color: COLORS[colorIdx] as ColorToken,
    count: countIdx + 1,
    rotationDeg: ROTATIONS[rotIdx]
  };
}

function cellsEqual(a: MatrixCell, b: MatrixCell): boolean {
  return a.shape === b.shape && a.color === b.color && a.count === b.count && a.rotationDeg === b.rotationDeg;
}

function generateMatrix(level: number, format: ItemFormat, rng: Rng): Item {
  const id = itemId('gf.matrix', level, format, rng);
  const size = 3;
  const nVary = varyingAttrCount(level);
  const varying = shuffle(rng, ALL_ATTRS).slice(0, nVary);

  const rules = {} as Record<Attr, AttrRule>;
  for (const attr of ALL_ATTRS) {
    if (varying.includes(attr)) {
      const axis = pick(rng, ['row', 'col'] as const);
      const step = nextInt(rng, 1, 2);
      rules[attr] = {axis, base: nextInt(rng, 0, attrDomainSize(attr) - 1), step};
    } else {
      rules[attr] = {axis: 'const', base: nextInt(rng, 0, attrDomainSize(attr) - 1), step: 0};
    }
  }

  const cells: (MatrixCell | null)[] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) cells.push(buildCell(rules, r, c));
  const missingIndex = size * size - 1; // hide the last cell
  const correctCell = cells[missingIndex] as MatrixCell;
  cells[missingIndex] = null;

  // Distractors: each mutates exactly ONE attribute of the correct cell.
  const options: MatrixCell[] = [correctCell];
  const mutateOrder = shuffle(rng, ALL_ATTRS);
  let mi = 0;
  while (options.length < OPTION_COUNT && mi < mutateOrder.length * 3) {
    const attr = mutateOrder[mi % mutateOrder.length];
    mi += 1;
    const cand: MatrixCell = {...correctCell};
    if (attr === 'shape') cand.shape = GLYPHS[(GLYPHS.indexOf(cand.shape) + 1 + (mi % 3)) % 6] as Glyph;
    else if (attr === 'color') cand.color = COLORS[(COLORS.indexOf(cand.color) + 1 + (mi % 3)) % COLORS.length] as ColorToken;
    else if (attr === 'count') cand.count = (cand.count % 3) + 1;
    else cand.rotationDeg = ROTATIONS[(ROTATIONS.indexOf(cand.rotationDeg) + 1 + (mi % 3)) % ROTATIONS.length];
    if (!options.some((o) => cellsEqual(o, cand))) options.push(cand);
  }
  // Safety pad (tiny attribute domains) — vary count deterministically.
  while (options.length < OPTION_COUNT) {
    const cand: MatrixCell = {...correctCell, count: ((correctCell.count + options.length) % 3) + 1};
    if (!options.some((o) => cellsEqual(o, cand))) options.push(cand);
    else break;
  }

  const shuffled = shuffle(rng, options);
  const answer = shuffled.findIndex((o) => cellsEqual(o, correctCell));

  const payload: GfMatrixSpec = {
    taskType: 'gf.matrix',
    size,
    cells,
    missingIndex,
    options: shuffled,
    interaction: {mode: 'select-one', optionCount: shuffled.length},
    solution: {answer, rule: varying.join('+'), transformations: nVary}
  };
  return {
    id,
    domain: 'Gf',
    level,
    format,
    payload,
    meta: {optionCount: shuffled.length},
    judge: selectJudge(answer)
  };
}

/** Generate a Gf item: matrix or series, chosen deterministically by the rng. */
export function generateGf(level: number, format: ItemFormat, rng: Rng): Item {
  return pick(rng, ['matrix', 'series'] as const) === 'matrix'
    ? generateMatrix(level, format, rng)
    : generateSeries(level, format, rng);
}

/** A stable, easy demonstrative Gf item for the 3.05 practice screen. */
export function practiceGf(): Item {
  return generateSeries(1, 'standard', makeRng('practice::Gf'));
}
