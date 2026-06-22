/**
 * Language-neutral token catalogs + geometry helpers shared by every generator.
 *
 * Items in this layer NEVER carry localized text — only stable string tokens
 * (shape names, color names, direction names) and numeric geometry. The on-screen
 * rendering of each token (which SVG, which palette swatch) is 3.05's job against
 * the 3.02 design; here a token is just an identifier the renderer maps.
 */
import {pick, shuffle, type Rng} from '@/lib/engine/prng';

/** The shape vocabulary (renderer maps each to an SVG). Language-neutral. */
export const GLYPHS = [
  'circle',
  'square',
  'triangle',
  'star',
  'hexagon',
  'diamond',
  'heart',
  'cross',
  'moon',
  'arrow'
] as const;
export type Glyph = (typeof GLYPHS)[number];

/** The color-token vocabulary (renderer maps each to a brand-safe swatch). */
export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
export type ColorToken = (typeof COLORS)[number];

/** Cardinal directions used by Gsm-free spatial + CT tasks. Language-neutral. */
export const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
export type Direction = (typeof DIRECTIONS)[number];

/** A cell coordinate `[col, row]` (0-based) within a bounded grid. */
export type Cell = readonly [number, number];

/**
 * A small shape expressed as a set of filled cells on a `size × size` grid — a
 * polyomino. Renderer-agnostic and trivially rotatable/mirrorable, so Gv can
 * express mental-rotation stimuli without any image asset.
 */
export interface PolyShape {
  /** The bounding grid edge length. */
  size: number;
  /** The filled cells, normalized to the top-left (always sorted, deduped). */
  cells: Cell[];
}

/** Sort + dedupe cells so two shapes with the same fill compare/serialize equal. */
export function normalizeCells(cells: Cell[]): Cell[] {
  const seen = new Set<string>();
  const out: Cell[] = [];
  for (const [c, r] of cells) {
    const k = `${c},${r}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push([c, r]);
    }
  }
  out.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return out;
}

/** Rotate a shape 90° clockwise within its bounding grid: (c,r) → (size-1-r, c). */
export function rotate90(shape: PolyShape): PolyShape {
  const {size} = shape;
  return {size, cells: normalizeCells(shape.cells.map(([c, r]) => [size - 1 - r, c] as Cell))};
}

/** Rotate a shape by 0/90/180/270° clockwise. */
export function rotate(shape: PolyShape, deg: 0 | 90 | 180 | 270): PolyShape {
  let s = shape;
  for (let i = 0; i < deg / 90; i++) s = rotate90(s);
  return s;
}

/** Mirror a shape horizontally (flip left↔right): (c,r) → (size-1-c, r). */
export function mirrorH(shape: PolyShape): PolyShape {
  const {size} = shape;
  return {size, cells: normalizeCells(shape.cells.map(([c, r]) => [size - 1 - c, r] as Cell))};
}

/** Stable string key for a shape (rotation/mirror-sensitive); for equality + dedupe. */
export function shapeKey(shape: PolyShape): string {
  return `${shape.size}:${normalizeCells(shape.cells)
    .map(([c, r]) => `${c},${r}`)
    .join(';')}`;
}

/** True iff two shapes have the identical filled-cell set at the same size. */
export function shapeEquals(a: PolyShape, b: PolyShape): boolean {
  return shapeKey(a) === shapeKey(b);
}

/** Is the shape symmetric under any 90/180/270° rotation? (rejected for Gv: ambiguous). */
export function isRotationallySymmetric(shape: PolyShape): boolean {
  const k0 = shapeKey(shape);
  return [90, 180, 270].some((d) => shapeKey(rotate(shape, d as 90 | 180 | 270)) === k0);
}

/** Is the shape identical to its own horizontal mirror? (rejected for Gv: mirror == self). */
export function isMirrorSymmetric(shape: PolyShape): boolean {
  return shapeKey(shape) === shapeKey(mirrorH(shape));
}

/**
 * Generate a connected, asymmetric polyomino of `n` cells on a `size × size`
 * grid, seeded. "Asymmetric" = distinguishable from every rotation AND from its
 * mirror, so a mental-rotation item has exactly one true answer and mirror
 * distractors are genuinely wrong. Retries (bounded, deterministic) until both
 * asymmetry tests pass; falls back to an L-tromino-derived shape that is known
 * asymmetric for the smallest sizes.
 */
export function randomAsymmetricShape(rng: Rng, size: number, n: number): PolyShape {
  for (let attempt = 0; attempt < 40; attempt++) {
    const cells: Cell[] = [[Math.floor(size / 2), Math.floor(size / 2)]];
    const occupied = new Set<string>([`${cells[0][0]},${cells[0][1]}`]);
    while (cells.length < n) {
      const [bc, br] = pick(rng, cells);
      const deltas = shuffle(rng, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ] as const);
      let placed = false;
      for (const [dc, dr] of deltas) {
        const nc = bc + dc;
        const nr = br + dr;
        const k = `${nc},${nr}`;
        if (nc >= 0 && nc < size && nr >= 0 && nr < size && !occupied.has(k)) {
          occupied.add(k);
          cells.push([nc, nr]);
          placed = true;
          break;
        }
      }
      if (!placed) break;
    }
    if (cells.length < n) continue;
    const shape: PolyShape = {size, cells: normalizeCells(cells)};
    if (!isRotationallySymmetric(shape) && !isMirrorSymmetric(shape)) return shape;
  }
  // Deterministic fallback: an asymmetric "boot" tetromino on a 3-grid.
  return {size: Math.max(size, 3), cells: normalizeCells([[0, 0], [0, 1], [0, 2], [1, 2]])};
}
