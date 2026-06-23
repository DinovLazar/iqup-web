import {afterEach, describe, expect, it} from 'vitest';

import {bookingUrlFor, siteUrlFor, trialBookingUrl} from './site-url';

const ORIGINAL_BOOKING = process.env.NEXT_PUBLIC_BOOKING_URL;
const ORIGINAL_SITE = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (ORIGINAL_BOOKING === undefined) delete process.env.NEXT_PUBLIC_BOOKING_URL;
  else process.env.NEXT_PUBLIC_BOOKING_URL = ORIGINAL_BOOKING;
  if (ORIGINAL_SITE === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE;
});

describe('bookingUrlFor — the on-screen demo CTA seam (Phase 3.09)', () => {
  it('falls back to the localized /trial URL with ?grad when no booking env var is set', () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL; // → localhost fallback in siteUrlFor

    const mk = bookingUrlFor('mk', 'veles');
    const en = bookingUrlFor('en', 'veles');

    // Never a dead link: it resolves to /trial and still carries the centre.
    expect(mk).toBe('http://localhost:3000/trial?grad=veles');
    expect(en).toBe('http://localhost:3000/en/trial?grad=veles');
    expect(mk).toContain('grad=veles');
    expect(en).toContain('grad=veles');
  });

  it('prefers NEXT_PUBLIC_BOOKING_URL when set, appending ?grad', () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = 'https://booking.iqup.mk/start';
    expect(bookingUrlFor('mk', 'aerodrom')).toBe(
      'https://booking.iqup.mk/start?grad=aerodrom'
    );
  });

  it('merges ?grad into a booking URL that already carries query params', () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = 'https://booking.iqup.mk/start?ref=results';
    const url = new URL(bookingUrlFor('en', 'ohrid'));
    expect(url.searchParams.get('ref')).toBe('results');
    expect(url.searchParams.get('grad')).toBe('ohrid');
  });

  it('carries the stable centre KEY (slug), never a localized label', () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    // A slug is lower-case ascii; a label would contain spaces / Cyrillic.
    const url = bookingUrlFor('mk', 'karpos');
    expect(url).toContain('grad=karpos');
    expect(url).not.toMatch(/grad=[^&]*[\sА-Ша-ш]/);
  });

  it('keeps siteUrlFor / trialBookingUrl behaviour intact', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrlFor('mk')).toBe('http://localhost:3000');
    expect(siteUrlFor('en')).toBe('http://localhost:3000/en');
    expect(trialBookingUrl('mk')).toBe('http://localhost:3000/trial');
  });
});
