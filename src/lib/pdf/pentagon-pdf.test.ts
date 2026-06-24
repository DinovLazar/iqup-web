// @vitest-environment node
/**
 * Phase 3.10 — the react-pdf identity pentagon must use the SAME geometry as the
 * on-screen `IdentityPentagon` (3.09): the kit's viewBox 410×360, centre 205/176,
 * R 110, the five `index-meta` angles, five wedges + the closing outline. We walk
 * the rendered react-pdf element tree and check its coordinates against the
 * geometry recomputed independently from the shared constants + `INDEX_META`.
 */
import {describe, it, expect} from 'vitest';
import type {ReactElement} from 'react';
import {INDEX_META, INDEX_ORDER} from '@/components/report/index-meta';
import {IdentityPentagonPdf} from './IdentityPentagonPdf';
import {Glyph} from './Glyph';

// The kit constants — identical to `IdentityPentagon.tsx`.
const VBW = 410;
const VBH = 360;
const CX = 205;
const CY = 176;
const R = 110;

const polar = (deg: number, r: number): [number, number] => [
  CX + r * Math.cos((deg * Math.PI) / 180),
  CY + r * Math.sin((deg * Math.PI) / 180)
];
const f = (n: number) => n.toFixed(1);

/** Recursively collect every react element in a tree. */
function collect(node: unknown, acc: ReactElement[]): void {
  if (node == null || node === false) return;
  if (Array.isArray(node)) {
    for (const n of node) collect(n, acc);
    return;
  }
  if (typeof node !== 'object') return;
  const el = node as ReactElement & {props?: {children?: unknown}};
  acc.push(el);
  if (el.props && 'children' in el.props) collect(el.props.children, acc);
}

const root = IdentityPentagonPdf({size: 300, locale: 'en'}) as ReactElement & {
  props: {viewBox: string; children: unknown};
};
const all: ReactElement[] = [];
collect(root.props.children, all);

const polygons = all.filter((e) => typeof (e.props as {points?: string}).points === 'string');
const lines = all.filter((e) => (e.props as {x1?: number}).x1 !== undefined);
const labels = all.filter(
  (e) => (e.props as {textAnchor?: string}).textAnchor !== undefined
);

describe('react-pdf identity pentagon — geometry parity', () => {
  it('uses the kit viewBox 410×360', () => {
    expect(root.props.viewBox).toBe(`0 0 ${VBW} ${VBH}`);
  });

  it('has five hue kites + one closing outline', () => {
    const kites = polygons.filter((p) => (p.props as {fill: string}).fill !== 'none');
    const outlines = polygons.filter((p) => (p.props as {fill: string}).fill === 'none');
    expect(kites).toHaveLength(5);
    expect(outlines).toHaveLength(1);
  });

  it('has five white seams from the centre + five vertex labels', () => {
    expect(lines).toHaveLength(5);
    expect(labels).toHaveLength(5);
    for (const l of lines) {
      expect((l.props as {x1: number}).x1).toBe(CX);
      expect((l.props as {y1: number}).y1).toBe(CY);
    }
  });

  it('the outline vertices match polar(angle, R) for the five index angles', () => {
    const expected = INDEX_ORDER.map((id) => {
      const [x, y] = polar(INDEX_META[id].angle, R);
      return `${f(x)},${f(y)}`;
    }).join(' ');
    const outline = polygons.find((p) => (p.props as {fill: string}).fill === 'none');
    expect((outline!.props as {points: string}).points).toBe(expected);
  });
});

describe('index glyphs — every glyph parses to at least one drawn shape', () => {
  // Guards against the `Glyph` parser silently dropping a future glyph whose
  // markup reorders attributes or adds a fill (the regex is order-sensitive).
  for (const id of INDEX_ORDER) {
    it(`renders ≥1 shape for ${id}`, () => {
      const el = Glyph({glyph: INDEX_META[id].glyph, color: '#000'}) as ReactElement & {
        props: {children: unknown};
      };
      const shapes: ReactElement[] = [];
      collect(el.props.children, shapes);
      const drawn = shapes.filter(
        (s) =>
          (s.props as {d?: string}).d !== undefined ||
          (s.props as {cx?: number}).cx !== undefined
      );
      expect(drawn.length).toBeGreaterThan(0);
    });
  }
});
