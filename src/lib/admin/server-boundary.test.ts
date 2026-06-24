/**
 * Server-only / service-role boundary proof (Phase 3.13) + no-cognitive-field proof.
 *
 *   * The service-role Supabase client (which bypasses RLS) carries `server-only`.
 *   * The stats reader sits behind that server-only client; the contacts reader is
 *     server-only too.
 *   * No `'use client'` admin file IMPORTS a server data reader / the service-role
 *     client / Brevo — so the service-role path is never reachable from the browser.
 *   * The contacts VIEW renders no TOP_INDEX / cognitive field.
 */
import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, relative} from 'node:path';

const ADMIN_DIR = dirname(fileURLToPath(import.meta.url)); // src/lib/admin
const SRC_ROOT = join(ADMIN_DIR, '..', '..'); // src

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

/** Strip line + block comments so prose can't trip a token scan. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const read = (file: string) => readFileSync(file, 'utf8');

describe('server-only boundary', () => {
  it('the service-role Supabase client is server-only', () => {
    expect(read(join(SRC_ROOT, 'lib', 'supabase', 'server.ts'))).toContain(
      "import 'server-only'"
    );
  });

  it('the stats reader sits behind the server-only service-role client', () => {
    const src = read(join(ADMIN_DIR, 'stats', 'read-stats.ts'));
    expect(src).toContain("import 'server-only'");
    expect(importPaths(src)).toContain('@/lib/supabase/server');
  });

  it('the contacts reader is server-only', () => {
    expect(read(join(ADMIN_DIR, 'contacts', 'read-contacts.ts'))).toContain(
      "import 'server-only'"
    );
  });

  it('no client component imports a server data reader, the service-role client, or Brevo', () => {
    const clientDirs = [
      join(SRC_ROOT, 'app', 'admin'),
      join(SRC_ROOT, 'components', 'admin')
    ];
    const forbidden = [
      'read-stats',
      'read-contacts',
      'stats/aggregate',
      'supabase/server',
      'brevo'
    ];
    for (const dir of clientDirs) {
      for (const file of sourceFiles(dir)) {
        const src = read(file);
        if (!/^\s*['"]use client['"]/m.test(src)) continue; // server files exempt
        for (const path of importPaths(src)) {
          for (const token of forbidden) {
            expect(
              path.includes(token),
              `client component ${relative(SRC_ROOT, file)} imports "${path}"`
            ).toBe(false);
          }
        }
      }
    }
  });
});

describe('contacts view renders no cognitive field', () => {
  it('the contacts page carries no TOP_INDEX / score / band / index column', () => {
    const page = join(SRC_ROOT, 'app', 'admin', '(authed)', 'contacts', 'page.tsx');
    const src = stripComments(read(page)).toLowerCase();
    for (const token of ['top_index', 'topindex', 'score', 'band', 'index_', 'signal_']) {
      expect(src.includes(token), `contacts page must not reference "${token}"`).toBe(
        false
      );
    }
  });
});
