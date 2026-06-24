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

  it('includes the new ReportEmail namespace (phase 3.10 report email) in both locales', () => {
    const required = [
      'ReportEmail.subject',
      'ReportEmail.preview',
      'ReportEmail.greeting',
      'ReportEmail.intro',
      'ReportEmail.teaserKicker',
      'ReportEmail.trialHeading',
      'ReportEmail.trialBody',
      'ReportEmail.cta',
      'ReportEmail.footer.identity',
      'ReportEmail.footer.contact',
      'ReportEmail.footer.signoff'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('no ReportEmail string uses a forbidden score/IQ/%/rank token or a literal digit (EN + MK, non-vacuous)', () => {
    // The report email is honest-framing chrome: no magnitude word and no literal
    // digit (the report's age/date live in the attached PDF, not the email body).
    const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
    const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);

    for (const [key, value] of enPaths) {
      if (!key.startsWith('ReportEmail.')) continue;
      expect(FORBIDDEN_EN.test(value), `forbidden EN token in ${key}: "${value}"`).toBe(false);
      expect(/\d/.test(value), `literal digit in ${key}: "${value}"`).toBe(false);
    }
    for (const [key, value] of mkPaths) {
      if (!key.startsWith('ReportEmail.')) continue;
      expect(FORBIDDEN_MK.test(value), `forbidden MK token in ${key}: "${value}"`).toBe(false);
      expect(/\d/.test(value), `literal digit in ${key}: "${value}"`).toBe(false);
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

  it('includes the new Form namespace (phase 3.06 parent form) in both locales', () => {
    const required = [
      'Form.meta.title',
      'Form.meta.description',
      'Form.forParent',
      'Form.heading',
      'Form.intro',
      'Form.parentName.label',
      'Form.parentName.errorRequired',
      'Form.email.label',
      'Form.email.errorInvalid',
      'Form.phone.label',
      'Form.phone.errorRequired',
      'Form.city.label',
      'Form.city.errorRequired',
      'Form.gender.label',
      'Form.gender.female',
      'Form.gender.male',
      'Form.gender.unspecified',
      'Form.consent.process',
      'Form.consent.guardian',
      'Form.consent.marketing',
      'Form.consent.processError',
      'Form.consent.guardianError',
      'Form.consent.privacyLink',
      'Form.submit',
      'Form.submitting',
      'Form.honeypotLabel',
      'Form.privacyNote',
      'Form.interstitial.title',
      'Form.interstitial.body'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('no Form string uses a forbidden score/IQ/%/band/rank token (EN + MK, non-vacuous)', () => {
    // No number, percentage, IQ, percentile, rank, or band WORD may appear in any
    // parent-facing form string (the honest-framing hard rule). The EN matcher
    // covers Latin tokens; the MK matcher covers the Macedonian score/rank stems so
    // a Cyrillic leak is caught too (e.g. поен/ранг/процент/коефициент/перцентил).
    const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
    const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;
    // Guard against a vacuous test: each matcher must fire on a bad sample.
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);

    for (const [key, value] of enPaths) {
      if (!key.startsWith('Form.')) continue;
      expect(FORBIDDEN_EN.test(value), `forbidden EN token in ${key}: "${value}"`).toBe(
        false
      );
    }
    for (const [key, value] of mkPaths) {
      if (!key.startsWith('Form.')) continue;
      expect(FORBIDDEN_MK.test(value), `forbidden MK token in ${key}: "${value}"`).toBe(
        false
      );
    }
  });

  it('includes the new Results namespace (phase 3.09 results screen) in both locales', () => {
    const required = [
      'Results.eyebrow',
      'Results.title',
      'Results.ageLabel',
      'Results.generatedLabel',
      'Results.heroCaption',
      'Results.sectionIndices',
      'Results.sectionNoticed',
      'Results.sectionCertificate',
      'Results.shineKicker',
      'Results.confidencePrefix',
      'Results.solvingStyleLabel',
      'Results.emailedHeading',
      'Results.emailedBody',
      'Results.trialHeading',
      'Results.trialBody',
      'Results.trialCta',
      'Results.certificateHeading',
      'Results.certificateBody',
      'Results.validity.gentleHeading',
      'Results.validity.caveatHeading',
      'Results.validity.retry'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('no Results chrome string uses a forbidden score/IQ/%/rank token or a literal digit (EN + MK, non-vacuous)', () => {
    // The honest-framing hard rule, on the results SCREEN's chrome: no magnitude
    // word and no literal digit (age/date arrive via {age}/{date} placeholders).
    const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
    const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);

    for (const [key, value] of enPaths) {
      if (!key.startsWith('Results.')) continue;
      expect(FORBIDDEN_EN.test(value), `forbidden EN token in ${key}: "${value}"`).toBe(false);
      expect(/\d/.test(value), `literal digit in ${key}: "${value}"`).toBe(false);
    }
    for (const [key, value] of mkPaths) {
      if (!key.startsWith('Results.')) continue;
      expect(FORBIDDEN_MK.test(value), `forbidden MK token in ${key}: "${value}"`).toBe(false);
      expect(/\d/.test(value), `literal digit in ${key}: "${value}"`).toBe(false);
    }
  });

  it('includes the new Certificate namespace (phase 3.11 certificate) in both locales', () => {
    const required = [
      'Certificate.intro',
      'Certificate.addName',
      'Certificate.nameLabel',
      'Certificate.namePlaceholder',
      'Certificate.namePrivacy',
      'Certificate.tag',
      'Certificate.reward',
      'Certificate.awardedTo',
      'Certificate.from',
      'Certificate.bibiPlaceholder',
      'Certificate.bibiPlaceholderNote',
      'Certificate.altLabel',
      'Certificate.download',
      'Certificate.share',
      'Certificate.preparing',
      'Certificate.linkCopied',
      'Certificate.shareError',
      'Certificate.strengthLine.logical',
      'Certificate.strengthLine.spatial',
      'Certificate.strengthLine.memory_focus',
      'Certificate.strengthLine.planning_speed',
      'Certificate.strengthLine.learning_stem',
      'Certificate.og.headline',
      'Certificate.og.tagline'
    ];
    for (const key of required) {
      expect(mkPaths.has(key), `mk missing ${key}`).toBe(true);
      expect(enPaths.has(key), `en missing ${key}`).toBe(true);
    }
  });

  it('no Certificate string uses a forbidden score/IQ/%/rank token or a literal digit (EN + MK, non-vacuous)', () => {
    // The certificate is the JOYFUL surface: no magnitude word, no digit (the only
    // digits on the rendered keepsake are the computed month/year, not a string).
    // The "IQ UP!" wordmark is rendered as structural markup, never an i18n string,
    // so no Certificate value should trip the `\biq\b` matcher either.
    const FORBIDDEN_EN = /\b(iq|score|scores|percentile|percent|rank|ranking|band)\b|%/i;
    const FORBIDDEN_MK = /(поен|ранг|процент|коефициент|перцентил)|%/i;
    expect(FORBIDDEN_EN.test('your IQ score is in the 90th percentile')).toBe(true);
    expect(FORBIDDEN_MK.test('вашиот коефициент е во 90-тиот перцентил')).toBe(true);

    for (const [key, value] of enPaths) {
      if (!key.startsWith('Certificate.')) continue;
      expect(FORBIDDEN_EN.test(value), `forbidden EN token in ${key}: "${value}"`).toBe(false);
      expect(/\d/.test(value), `literal digit in ${key}: "${value}"`).toBe(false);
    }
    for (const [key, value] of mkPaths) {
      if (!key.startsWith('Certificate.')) continue;
      expect(FORBIDDEN_MK.test(value), `forbidden MK token in ${key}: "${value}"`).toBe(false);
      expect(/\d/.test(value), `literal digit in ${key}: "${value}"`).toBe(false);
    }
  });

  it('the Form never asks to collect a child name (no-child-name invariant)', () => {
    // The form collects the PARENT first name + (optional) child GENDER only — never
    // a child's name. No form string may request the child's name.
    const ASKS_CHILD_NAME =
      /(child'?s? name|name of (your |the )?child|име(то)? на детето|детско име)/i;
    for (const [key, value] of [...mkPaths, ...enPaths]) {
      if (!key.startsWith('Form.')) continue;
      expect(ASKS_CHILD_NAME.test(value), `${key} asks for a child name`).toBe(false);
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
