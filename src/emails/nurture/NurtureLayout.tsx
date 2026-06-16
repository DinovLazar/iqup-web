/**
 * Phase 2.03 — the shared shell for the four nurture emails.
 *
 * A pure presentational component (locale in, JSX out — no next-intl runtime, no
 * `server-only` import) so it renders in Vitest and under the `emails:nurture`
 * render script alike, exactly like the 2.01 `ResultsEmail`. It reuses the 2.01
 * brand shell (container, web-safe fonts, literal-hex tokens) + a wordmark
 * stand-in header, and renders the legally-required marketing footer:
 *   - the brand identity tagline (reused from the 2.01 footer);
 *   - a transparency line (why the parent receives this);
 *   - the legal sender identity + postal address (flagged for IqUp legal);
 *   - a working **unsubscribe** link (Brevo's `{{ unsubscribe }}` merge tag);
 *   - the 2.01 signoff.
 *
 * Marketing email legally requires a working unsubscribe + a postal address — both
 * live here so every nurture email carries them.
 */
import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr
} from '@react-email/components';

import type {Locale} from '@/content/locale';
import {MERGE, NURTURE_COPY} from './copy';
import * as S from './styles';

export interface NurtureLayoutProps {
  readonly locale: Locale;
  /** Inbox preview / pre-header snippet. */
  readonly preview: string;
  /** Main heading (rendered as the `<h1>`). */
  readonly heading: string;
  /** Generic greeting line. */
  readonly greeting: string;
  readonly children: React.ReactNode;
}

export function NurtureLayout(props: NurtureLayoutProps): React.JSX.Element {
  const {locale, preview, heading, greeting, children} = props;
  const footer = NURTURE_COPY[locale].footer;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={S.main}>
        <Container style={S.container}>
          <Text style={S.wordmark}>IQ UP!</Text>

          <Section>
            <Text style={S.greetingStyle}>{greeting}</Text>
            <Heading as="h1" style={S.headlineStyle}>
              {heading}
            </Heading>
            {children}
          </Section>

          <Hr style={S.dividerStyle} />

          <Section>
            <Text style={S.footerStrongStyle}>{footer.identity}</Text>
            <Text style={S.footerStyle}>{footer.receiving}</Text>
            <Text style={S.footerStyle}>{footer.legal}</Text>
            <Text style={S.footerStyle}>
              <Link href={MERGE.unsubscribe} style={S.unsubscribeLinkStyle}>
                {footer.unsubscribeLabel}
              </Link>
            </Text>
            <Text style={S.footerStrongStyle}>{footer.signoff}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NurtureLayout;
