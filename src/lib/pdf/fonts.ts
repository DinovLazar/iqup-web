/**
 * Register Montserrat (the v2 brand typeface) with `@react-pdf/renderer`.
 *
 * The on-screen surfaces load Montserrat via `next/font/google`, but react-pdf
 * needs the actual font bytes embedded in the document, so this phase ships four
 * static weights as TTFs under `./fonts/` (instanced from the upstream Montserrat
 * variable font; each file carries the FULL Latin + Cyrillic glyph set so the
 * Macedonian report renders with no tofu). The weights mirror the 3.08 handover:
 * 400 / 600 / 700 / 800 — hierarchy by weight, never a second typeface.
 *
 * The bytes are read once at module load (Node only — this module is imported by
 * the `server-only` send path and the Node render entry) and registered as base64
 * data URIs, so there is no font URL/path to resolve at render time. Hyphenation
 * is disabled globally: a formal report should never break a word across a line.
 */
import fs from 'node:fs';
import path from 'node:path';
import {Font} from '@react-pdf/renderer';

/** Montserrat weights the handover uses, mapped to their static TTF files. */
const FACES: ReadonlyArray<{file: string; weight: 400 | 600 | 700 | 800}> = [
  {file: 'Montserrat-Regular.ttf', weight: 400},
  {file: 'Montserrat-SemiBold.ttf', weight: 600},
  {file: 'Montserrat-Bold.ttf', weight: 700},
  {file: 'Montserrat-ExtraBold.ttf', weight: 800}
];

/** The brand family name every PDF style references. */
export const BRAND_FONT = 'Montserrat';

const FONT_DIR = path.join(process.cwd(), 'src', 'lib', 'pdf', 'fonts');

let registered = false;

/** Read a TTF and encode it as a base64 `data:` URI react-pdf can embed. */
function dataUri(file: string): string {
  const bytes = fs.readFileSync(path.join(FONT_DIR, file));
  return `data:font/ttf;base64,${bytes.toString('base64')}`;
}

/**
 * Register Montserrat + disable hyphenation. Idempotent: safe to call before
 * every render (the first call does the work; later calls are a no-op).
 */
export function registerReportFonts(): void {
  if (registered) return;

  Font.register({
    family: BRAND_FONT,
    fonts: FACES.map((f) => ({src: dataUri(f.file), fontWeight: f.weight}))
  });

  // No hyphenation anywhere — return each word whole rather than split it.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
