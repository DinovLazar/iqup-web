import {describe, it, expect} from 'vitest';

import mk from './mk.json';
import en from './en.json';

/** Collect every leaf key path → value from a nested message object. */
function leafPaths(
  obj: Record<string, unknown>,
  prefix = ''
): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [p, v] of leafPaths(value as Record<string, unknown>, path)) {
        out.set(p, v);
      }
    } else {
      out.set(path, String(value));
    }
  }
  return out;
}

/** ICU-ish `{placeholder}` tokens in a string, sorted for comparison. */
function placeholders(value: string): string[] {
  return (value.match(/\{[^}]+\}/g) ?? []).sort();
}

const mkPaths = leafPaths(mk as Record<string, unknown>);
const enPaths = leafPaths(en as Record<string, unknown>);

describe('i18n message parity (mk ↔ en)', () => {
  it('has exactly the same set of keys in both locales', () => {
    const mkKeys = [...mkPaths.keys()].sort();
    const enKeys = [...enPaths.keys()].sort();
    expect(mkKeys).toEqual(enKeys);
  });

  it('includes the new Gate and Result namespaces in both locales', () => {
    const required = [
      'Gate.heading',
      'Gate.intro',
      'Gate.preview',
      'Gate.email.label',
      'Gate.email.errorInvalid',
      'Gate.childName.label',
      'Gate.consent.label',
      'Gate.consent.error',
      'Gate.marketing.label',
      'Gate.privacyNote',
      'Gate.submit',
      'Gate.submitting',
      'Gate.error',
      'Result.meta.title',
      'Result.badge',
      'Result.heading',
      'Result.topStrengthsLabel',
      'Result.note',
      'Result.home'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('uses the same placeholders for every shared key', () => {
    for (const [key, mkValue] of mkPaths) {
      const enValue = enPaths.get(key);
      expect(enValue, `en missing ${key}`).toBeDefined();
      expect(placeholders(mkValue), `placeholders differ at ${key}`).toEqual(
        placeholders(enValue as string)
      );
    }
  });

  it('has no empty strings in either locale', () => {
    for (const [key, value] of mkPaths) {
      expect(value.trim().length, `mk empty at ${key}`).toBeGreaterThan(0);
    }
    for (const [key, value] of enPaths) {
      expect(value.trim().length, `en empty at ${key}`).toBeGreaterThan(0);
    }
  });
});
