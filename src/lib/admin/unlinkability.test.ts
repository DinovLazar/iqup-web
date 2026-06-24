/**
 * The unlinkability proof (Phase 3.13) — the point of the phase.
 *
 * Store A and Store B can never be joined. This scans the actual IMPORT EDGES of
 * the two admin data paths (not prose) to prove they are STRUCTURALLY isolated:
 *   * the contacts (Store B / Brevo) path imports nothing from the stats / Store A path;
 *   * the stats (Store A / Supabase) path imports nothing from the contacts / Brevo path;
 *   * no single module reaches BOTH readers (there is no joined path / joined export).
 */
import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, relative} from 'node:path';

const ADMIN_DIR = dirname(fileURLToPath(import.meta.url)); // src/lib/admin
const SRC_ROOT = join(ADMIN_DIR, '..', '..'); // src
const APP_ADMIN_DIR = join(SRC_ROOT, 'app', 'admin');

/** All source files (excluding tests) under a directory, recursively. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Extract every module specifier this file imports (real dependency edges only). */
function importPaths(src: string): string[] {
  const paths: string[] = [];
  const fromRe = /(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g;
  const bareRe = /\bimport\s*['"]([^'"]+)['"]/g;
  for (const re of [fromRe, bareRe]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) paths.push(m[1]);
  }
  return paths;
}

const read = (file: string) => readFileSync(file, 'utf8');

describe('two-store unlinkability (import-edge isolation)', () => {
  const contactsFiles = sourceFiles(join(ADMIN_DIR, 'contacts'));
  const statsFiles = sourceFiles(join(ADMIN_DIR, 'stats'));

  it('the contacts path imports nothing from the stats / Store A path', () => {
    const forbidden = ['stats', 'supabase/server', 'supabase/client', 'scoring'];
    for (const file of contactsFiles) {
      for (const path of importPaths(read(file))) {
        for (const token of forbidden) {
          expect(
            path.includes(token),
            `${relative(SRC_ROOT, file)} imports "${path}" (forbidden: "${token}")`
          ).toBe(false);
        }
      }
    }
  });

  it('the stats path imports nothing from the contacts / Brevo path', () => {
    const forbidden = ['contacts', 'brevo', 'email'];
    for (const file of statsFiles) {
      for (const path of importPaths(read(file))) {
        for (const token of forbidden) {
          expect(
            path.includes(token),
            `${relative(SRC_ROOT, file)} imports "${path}" (forbidden: "${token}")`
          ).toBe(false);
        }
      }
    }
  });

  it('no single module imports BOTH readers (no joined path / joined export)', () => {
    const allAdminSources = [...sourceFiles(ADMIN_DIR), ...sourceFiles(APP_ADMIN_DIR)];
    for (const file of allAdminSources) {
      const paths = importPaths(read(file));
      const touchesContacts = paths.some(
        (p) => p.includes('read-contacts') || p.includes('contacts-csv')
      );
      const touchesStats = paths.some(
        (p) => p.includes('read-stats') || p.includes('stats-csv')
      );
      expect(
        touchesContacts && touchesStats,
        `${relative(SRC_ROOT, file)} must not combine the contacts and stats readers`
      ).toBe(false);
    }
  });
});
