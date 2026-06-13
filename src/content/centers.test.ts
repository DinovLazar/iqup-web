import {describe, it, expect} from 'vitest';

import {CENTERS, getCenter, IQUP_CONTACT_URL} from './centers';

describe('IqUp centers data (brand.md §4)', () => {
  it('has all 10 centers', () => {
    expect(CENTERS).toHaveLength(10);
  });

  it('gives every center the required, non-empty fields in both locales', () => {
    for (const c of CENTERS) {
      expect(c.id.trim().length, `${c.id} id`).toBeGreaterThan(0);
      expect(c.address.trim().length, `${c.id} address`).toBeGreaterThan(0);
      expect(c.phone.trim().length, `${c.id} phone`).toBeGreaterThan(0);
      expect(c.contact.trim().length, `${c.id} contact`).toBeGreaterThan(0);
      expect(typeof c.mapsUrl, `${c.id} mapsUrl is string`).toBe('string');
      for (const locale of ['mk', 'en'] as const) {
        expect(c.city[locale].trim().length, `${c.id} city.${locale}`).toBeGreaterThan(0);
        expect(c.name[locale].trim().length, `${c.id} name.${locale}`).toBeGreaterThan(0);
      }
    }
  });

  it('has unique ids and unique @iqup.mk emails', () => {
    const ids = CENTERS.map((c) => c.id);
    const emails = CENTERS.map((c) => c.email);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(emails).size).toBe(emails.length);
    for (const c of CENTERS) {
      expect(c.email, `${c.id} email domain`).toMatch(/@iqup\.mk$/);
    }
  });

  it('looks up a center by id and returns undefined for unknown ids', () => {
    expect(getCenter('aerodrom')?.city.en).toBe('Skopje – Aerodrom');
    expect(getCenter('strumica')?.email).toBe('strumica@iqup.mk');
    expect(getCenter('does-not-exist')).toBeUndefined();
  });

  it('exposes an https IqUp contact URL fallback', () => {
    expect(IQUP_CONTACT_URL).toMatch(/^https:\/\//);
  });
});
