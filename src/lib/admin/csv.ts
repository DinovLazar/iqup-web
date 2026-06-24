/**
 * Minimal, dependency-free CSV serialisation for the two admin exports (Phase 3.13).
 *
 * ISOMORPHIC + pure (no `server-only`): used by the contacts export and the
 * aggregate-stats export, and unit-tested directly. RFC-4180 escaping + a UTF-8 BOM
 * so Cyrillic city names (e.g. "Скопје – Аеродром") open cleanly in Excel.
 *
 * The two exports are deliberately SEPARATE files built from separate data paths —
 * there is no joined export and no shared per-child key (the privacy invariant).
 */

/** A UTF-8 byte-order mark — makes Excel read the file as UTF-8 (Cyrillic-safe). */
export const CSV_BOM = '﻿';

/** Escape one cell: wrap in quotes (doubling inner quotes) when it could break CSV. */
export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Serialise a header row + data rows into a CSV string with a leading BOM (CRLF rows). */
export function toCsv(
  header: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<string | number | boolean | null | undefined>>
): string {
  const lines = [header, ...rows].map((row) => row.map(escapeCsvCell).join(','));
  return CSV_BOM + lines.join('\r\n') + '\r\n';
}

/** Build the standard Response for a CSV download (attachment, UTF-8). */
export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store'
    }
  });
}
