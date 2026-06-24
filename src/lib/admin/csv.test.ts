/**
 * CSV serialisation spec (Phase 3.13): RFC-4180 escaping + a UTF-8 BOM so Cyrillic
 * opens cleanly in Excel.
 */
import {describe, it, expect} from 'vitest';

import {escapeCsvCell, toCsv, CSV_BOM} from './csv';

describe('escapeCsvCell', () => {
  it('passes plain values through, quotes values that need it', () => {
    expect(escapeCsvCell('plain')).toBe('plain');
    expect(escapeCsvCell(42)).toBe('42');
    expect(escapeCsvCell(true)).toBe('true');
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
  });
});

describe('toCsv', () => {
  it('emits a BOM, a header, and CRLF-joined rows', () => {
    const csv = toCsv(['a', 'b'], [[1, 'x'], [2, 'y,z']]);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const body = csv.slice(1);
    expect(body).toBe('a,b\r\n1,x\r\n2,"y,z"\r\n');
  });

  it('preserves Cyrillic city names', () => {
    const csv = toCsv(['city'], [['Скопје – Аеродром']]);
    expect(csv).toContain('Скопје – Аеродром');
  });
});
