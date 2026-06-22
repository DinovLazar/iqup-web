import {readdirSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {makeRng} from '@/lib/engine/prng';
import {DOMAINS, type Domain} from '@/lib/engine/types';
import {createTaskItemProvider} from './provider';
import {correctAnswerFor, wrongAnswerFor} from './shared';

const HERE = dirname(fileURLToPath(import.meta.url));

describe('TaskItemProvider — ItemProvider contract', () => {
  const provider = createTaskItemProvider();

  it('supplies an item for every domain at every level, tagged correctly', () => {
    for (const domain of DOMAINS) {
      for (let level = 1; level <= 10; level++) {
        const item = provider.getItem(domain, level, 'standard', makeRng(`${domain}-${level}`));
        expect(item.domain).toBe(domain);
        expect(item.level).toBe(level);
        expect(typeof item.judge).toBe('function');
        expect(item.payload).toBeTruthy();
      }
    }
  });

  it('supplies a stable practice item for every domain', () => {
    for (const domain of DOMAINS) {
      const a = provider.getPracticeItem(domain);
      const b = provider.getPracticeItem(domain);
      expect(a.domain).toBe(domain);
      expect(JSON.stringify(a.payload)).toBe(JSON.stringify(b.payload));
    }
  });

  it('is deterministic: same (domain, level, format, seed) → byte-identical item', () => {
    for (const domain of DOMAINS) {
      const ser = (d: Domain) => {
        const it = provider.getItem(d, 5, 'standard', makeRng('fixed-seed'));
        return JSON.stringify({id: it.id, level: it.level, format: it.format, payload: it.payload, meta: it.meta});
      };
      expect(ser(domain)).toBe(ser(domain));
    }
  });

  it('honored answers judge correctly across the whole bank', () => {
    for (const domain of DOMAINS) {
      for (let level = 1; level <= 10; level++) {
        const item = provider.getItem(domain, level, 'standard', makeRng(`judge-${domain}-${level}`));
        expect(item.judge({itemId: item.id, answer: correctAnswerFor(item), responseTimeMs: 1500}).correct).toBe(true);
        expect(item.judge({itemId: item.id, answer: wrongAnswerFor(item), responseTimeMs: 1500}).correct).toBe(false);
      }
    }
  });
});

describe('determinism invariant — no Math.random on the item path', () => {
  it('no generator source file references Math.random', () => {
    const offenders: string[] = [];
    for (const f of readdirSync(HERE)) {
      if (!f.endsWith('.ts') || f.endsWith('.test.ts')) continue;
      if (/Math\.random/.test(readFileSync(join(HERE, f), 'utf8'))) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});

describe('no-forbidden-token invariant over the whole bank', () => {
  // No score / IQ / percentage / rank / "level N" string may leak into content.
  const FORBIDDEN = [/\bIQ\b/, /percentile/i, /\bscore\b/i, /\brank\b/i, /\d+\s*%/, /level\s*\d/i];

  it('no generated payload (or practice item) contains a forbidden token', () => {
    const provider = createTaskItemProvider();
    for (const domain of DOMAINS) {
      const samples = [provider.getPracticeItem(domain)];
      for (let level = 1; level <= 10; level++) {
        for (let s = 0; s < 5; s++) {
          samples.push(provider.getItem(domain, level, level % 2 ? 'forward' : 'standard', makeRng(`tok-${domain}-${level}-${s}`)));
        }
      }
      for (const item of samples) {
        const json = JSON.stringify(item.payload);
        for (const re of FORBIDDEN) {
          expect(re.test(json), `${domain} payload matched ${re}`).toBe(false);
        }
      }
    }
  });
});
