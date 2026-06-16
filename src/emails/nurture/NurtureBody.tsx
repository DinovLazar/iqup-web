/**
 * Phase 2.03 — shared body renderer for the four nurture emails.
 *
 * The four templates share the same shape (intro → body paragraphs → CTA), so the
 * per-email difference is pure DATA (`copy.ts`): the strings, and `ctaKind`. This
 * component renders that data inside `NurtureLayout`:
 *   - `ctaKind: 'trial'` → the warm tinted panel + pill button (the trial CTA,
 *     identical to the 2.01 results email) — present in welcome-trial /
 *     trial-invite / nudge;
 *   - `ctaKind: 'general'` → a quiet secondary link (NO trial CTA) — welcome-general.
 * Both link targets are UTM-tagged via `ctaHref` (the single link source).
 */
import * as React from 'react';
import {Section, Text, Button, Link} from '@react-email/components';

import type {Locale} from '@/content/locale';
import {getNurtureCopy, type NurtureKey} from './copy';
import {ctaHref} from './links';
import {NurtureLayout} from './NurtureLayout';
import * as S from './styles';

export interface NurtureBodyProps {
  readonly emailKey: NurtureKey;
  readonly locale: Locale;
}

export function NurtureBody(props: NurtureBodyProps): React.JSX.Element {
  const {emailKey, locale} = props;
  const copy = getNurtureCopy(emailKey, locale);
  const href = ctaHref(locale, emailKey);

  return (
    <NurtureLayout
      locale={locale}
      preview={copy.preview}
      heading={copy.heading}
      greeting={copy.greeting}
    >
      <Text style={S.introStyle}>{copy.intro}</Text>
      {copy.body.map((paragraph, i) => (
        <Text key={`${emailKey}-${i}`} style={S.bodyStyle}>
          {paragraph}
        </Text>
      ))}

      {copy.ctaKind === 'trial' ? (
        <Section style={S.ctaSectionStyle}>
          <Button href={href} style={S.buttonStyle}>
            {copy.cta}
          </Button>
        </Section>
      ) : (
        <Section>
          <Text style={S.bodyStyle}>
            <Link href={href} style={S.generalLinkStyle}>
              {copy.cta}
            </Link>
          </Text>
        </Section>
      )}
    </NurtureLayout>
  );
}

export default NurtureBody;
