/**
 * Contacts mapping + view-helper spec (Phase 3.13).
 *
 * The headline guarantee: the contact list shows contact + consent + source + date
 * ONLY. `TOP_INDEX` (the silent segmentation field) and any cognitive/score/band
 * field NEVER appear in a mapped row or the CSV.
 */
import {describe, it, expect} from 'vitest';

import {
  toLeadContactRow,
  filterRowsByCity,
  paginateRows,
  CONTACT_ATTRIBUTE_ALLOW_LIST,
  FORBIDDEN_CONTACT_ATTRIBUTES,
  type LeadContactRow,
  type BrevoContact
} from './contact-fields';
import {contactsToCsv, CONTACTS_CSV_HEADER} from './contacts-csv';

const rawContact: BrevoContact = {
  email: 'parent@example.com',
  createdAt: '2026-06-20T10:30:00.000+00:00',
  attributes: {
    PARENT_FIRST_NAME: 'Маја',
    PHONE: '070123456',
    CITY: 'Skopje – Aerodrom',
    CHILD_AGE: 8,
    CHILD_GENDER: 'female',
    CONSENT_PROCESS: true,
    CONSENT_GUARDIAN: true,
    MARKETING_OPT_IN: false,
    CONSENT_VERSION: 'v2-draft-2026-06',
    SOURCE: 'website-assessment',
    // The cognitive segmentation field that MUST NOT surface:
    TOP_INDEX: 'Logical thinking'
  }
};

describe('toLeadContactRow', () => {
  it('maps the allow-listed contact + consent + source + date fields', () => {
    const row = toLeadContactRow(rawContact);
    expect(row).toEqual<LeadContactRow>({
      parentFirstName: 'Маја',
      email: 'parent@example.com',
      phone: '070123456',
      city: 'Skopje – Aerodrom',
      childAge: '8',
      childGender: 'female',
      consentProcess: true,
      consentGuardian: true,
      marketingOptIn: false,
      source: 'website-assessment',
      contactDate: '2026-06-20'
    });
  });

  it('NEVER surfaces TOP_INDEX or any cognitive value', () => {
    const row = toLeadContactRow(rawContact);
    const serialised = JSON.stringify(row);
    // The TOP_INDEX value must not appear anywhere in the row.
    expect(serialised).not.toContain('Logical thinking');
    expect(serialised.toLowerCase()).not.toContain('top_index');
    expect(serialised.toLowerCase()).not.toContain('topindex');
    // No band/score/index key leaked in.
    for (const key of Object.keys(row)) {
      expect(key.toLowerCase()).not.toMatch(/band|score|index|signal/);
    }
  });

  it('the allow-list excludes every forbidden attribute', () => {
    for (const forbidden of FORBIDDEN_CONTACT_ATTRIBUTES) {
      expect(CONTACT_ATTRIBUTE_ALLOW_LIST as readonly string[]).not.toContain(
        forbidden
      );
    }
  });

  it('tolerates a contact missing attributes / date', () => {
    const row = toLeadContactRow({email: 'x@y.com'});
    expect(row.email).toBe('x@y.com');
    expect(row.contactDate).toBe('');
    expect(row.consentProcess).toBe(false);
  });
});

const rows: LeadContactRow[] = Array.from({length: 7}, (_, i) => ({
  parentFirstName: `P${i}`,
  email: `p${i}@example.com`,
  phone: '070',
  city: i % 2 === 0 ? 'Skopje – Aerodrom' : 'Veles',
  childAge: '8',
  childGender: 'female',
  consentProcess: true,
  consentGuardian: true,
  marketingOptIn: false,
  source: 'website-assessment',
  contactDate: '2026-06-20'
}));

describe('filterRowsByCity', () => {
  it('filters to a single city; empty filter returns all', () => {
    expect(filterRowsByCity(rows, 'Veles')).toHaveLength(3);
    expect(filterRowsByCity(rows, '')).toHaveLength(7);
    expect(filterRowsByCity(rows, null)).toHaveLength(7);
  });
});

describe('paginateRows', () => {
  it('slices a clamped 1-based page', () => {
    const p1 = paginateRows(rows, 1, 3);
    expect(p1.pageRows).toHaveLength(3);
    expect(p1.pageCount).toBe(3);
    expect(p1.total).toBe(7);

    const p3 = paginateRows(rows, 3, 3);
    expect(p3.pageRows).toHaveLength(1);

    // Out-of-range pages clamp into [1, pageCount].
    expect(paginateRows(rows, 0, 3).page).toBe(1);
    expect(paginateRows(rows, 99, 3).page).toBe(3);
  });
});

describe('contactsToCsv', () => {
  it('has no cognitive/score/band column', () => {
    for (const col of CONTACTS_CSV_HEADER) {
      expect(col.toLowerCase()).not.toMatch(/band|score|index|signal|top_index/);
    }
  });

  it('starts with a UTF-8 BOM and never emits a cognitive value', () => {
    const csv = contactsToCsv([toLeadContactRow(rawContact)]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).not.toContain('Logical thinking');
    expect(csv).toContain('parent@example.com');
  });
});
