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
      'Result.og.headline',
      'Result.hero.title',
      'Result.constellation.celebratedTitle',
      'Result.constellation.growingTitle',
      'Result.certificate.download',
      'Result.certificate.share',
      'Result.certificate.alt',
      'Result.trial.heading',
      'Result.trial.nearestCenter',
      'Result.ending.heading'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('includes the new Email namespace (results email chrome) in both locales', () => {
    const required = [
      'Email.subject',
      'Email.preview',
      'Email.greeting',
      'Email.intro',
      'Email.certificateAttached',
      'Email.trial.heading',
      'Email.trial.body',
      'Email.trial.cta',
      'Email.curiousMind',
      'Email.footer.identity',
      'Email.footer.contact',
      'Email.footer.signoff'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('includes the new Consent + Privacy namespaces (phase 2.04) in both locales', () => {
    const required = [
      'Consent.banner.title',
      'Consent.banner.body',
      'Consent.banner.accept',
      'Consent.banner.reject',
      'Consent.banner.manage',
      'Consent.banner.ariaLabel',
      'Consent.manage.title',
      'Consent.manage.intro',
      'Consent.manage.save',
      'Consent.manage.alwaysOn',
      'Consent.manage.necessary.title',
      'Consent.manage.necessary.description',
      'Consent.manage.analytics.title',
      'Consent.manage.analytics.description',
      'Consent.manage.marketing.title',
      'Consent.manage.marketing.description',
      'Consent.manage.note',
      'Privacy.meta.title',
      'Privacy.meta.description',
      'Privacy.lead',
      'Privacy.lastUpdatedLabel',
      'Privacy.manageCookies',
      'Privacy.tableHeaders.name',
      'Privacy.tableHeaders.provider',
      'Privacy.tableHeaders.purpose',
      'Privacy.tableHeaders.category',
      'Privacy.tableHeaders.duration',
      'Gate.consent.privacyLink'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('includes the new Trial namespace (phase 2.05 booking) in both locales', () => {
    const required = [
      'Trial.meta.title',
      'Trial.meta.description',
      'Trial.og.headline',
      'Trial.og.tagline',
      'Trial.heading',
      'Trial.intro',
      'Trial.pickLabel',
      'Trial.pickPlaceholder',
      'Trial.contactLabel',
      'Trial.callCta',
      'Trial.emailCta',
      'Trial.directionsCta',
      'Trial.messageCta',
      'Trial.mailSubject',
      'Trial.mailBody',
      'Trial.reassure'
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
