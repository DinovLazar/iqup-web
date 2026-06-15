/**
 * TDD spec for the server-side certificate PNG renderer.
 *
 * `import 'server-only'` throws outside a Next server build, so we stub it before
 * the module under test is imported. The renderer leans on `next/og`'s
 * `ImageResponse`, which produces real PNG bytes under Vitest here — so we assert
 * the PNG signature, a sane minimum size, and that different children (different
 * tints) yield different bytes.
 */
import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));

import {renderCertificatePng} from './certificate-image';
import type {StrengthCode} from '@/content/strengths';
import type {Locale} from '@/content/locale';

/** PNG magic number: the first 8 bytes of every PNG file. */
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function expectPng(bytes: Buffer | Uint8Array): void {
  expect(bytes).toBeInstanceOf(Uint8Array);
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    expect(bytes[i]).toBe(PNG_SIGNATURE[i]);
  }
  // A 1080×1350 PNG with text + vectors is comfortably larger than this.
  expect(bytes.length).toBeGreaterThan(5000);
}

interface Sample {
  readonly label: string;
  readonly childFirstName: string;
  readonly celebrated: readonly StrengthCode[];
  readonly locale: Locale;
}

const SAMPLES: readonly Sample[] = [
  {
    label: 'Cyrillic name, two strengths, mk',
    childFirstName: 'Ива',
    celebrated: ['spatial', 'words_obs'],
    locale: 'mk'
  },
  {
    label: 'Latin name, two strengths, en',
    childFirstName: 'Maya',
    celebrated: ['pattern', 'logic'],
    locale: 'en'
  },
  {
    label: 'single celebrated strength',
    childFirstName: 'Leo',
    celebrated: ['memory'],
    locale: 'en'
  }
];

const FIXED_DATE = new Date('2026-06-15T10:00:00Z');

describe('renderCertificatePng', () => {
  for (const sample of SAMPLES) {
    it(`renders a PNG for ${sample.label}`, async () => {
      const bytes = await renderCertificatePng({
        childFirstName: sample.childFirstName,
        celebrated: sample.celebrated,
        locale: sample.locale,
        date: FIXED_DATE
      });
      expectPng(bytes);
    });
  }

  it('defaults the date when none is given', async () => {
    const bytes = await renderCertificatePng({
      childFirstName: 'Sam',
      celebrated: ['numeracy', 'logic'],
      locale: 'en'
    });
    expectPng(bytes);
  });

  it('produces different bytes for different children (tint differs)', async () => {
    const [a, b] = await Promise.all([
      renderCertificatePng({
        childFirstName: 'Ива',
        celebrated: ['spatial', 'words_obs'],
        locale: 'mk',
        date: FIXED_DATE
      }),
      renderCertificatePng({
        childFirstName: 'Maya',
        celebrated: ['pattern', 'logic'],
        locale: 'en',
        date: FIXED_DATE
      })
    ]);
    expectPng(a);
    expectPng(b);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
  });
});
