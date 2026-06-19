import {describe, it, expect} from 'vitest';

import {CENTERS, getCenter, mapsUrlFor, viberHref, whatsappHref} from './centers';

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

  it('derives a Google Maps search link when mapsUrl is empty', () => {
    for (const c of CENTERS) {
      // All centres are PROVISIONAL with empty mapsUrl for now → derived search.
      const url = mapsUrlFor(c);
      expect(url, `${c.id} maps link`).toMatch(
        /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/
      );
      // The encoded query carries the centre's city + address (honest search).
      expect(decodeURIComponent(url), `${c.id} maps query`).toContain(c.address);
    }
  });

  it('uses a supplied mapsUrl verbatim when present', () => {
    const withPin = {...CENTERS[0], mapsUrl: 'https://maps.app.goo.gl/example'};
    expect(mapsUrlFor(withPin)).toBe('https://maps.app.goo.gl/example');
  });

  it('builds Viber/WhatsApp links only when the centre carries the number', () => {
    // None of the seeded centres carry Viber/WhatsApp yet → no link.
    for (const c of CENTERS) {
      expect(viberHref(c), `${c.id} viber`).toBeUndefined();
      expect(whatsappHref(c), `${c.id} whatsapp`).toBeUndefined();
    }
    const withChannels = {...CENTERS[0], viber: '+38970382269', whatsapp: '+38970382269'};
    expect(viberHref(withChannels)).toBe(
      'viber://chat?number=%2B38970382269'
    );
    expect(whatsappHref(withChannels)).toBe('https://wa.me/38970382269');
  });
});
