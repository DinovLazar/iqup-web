/**
 * Phase 3.10 — the REPORT email (parent-facing), the cover note for the attached
 * "IQ UP! cognitive profile" PDF.
 *
 * A pure presentational React Email component (props in, JSX out — no next-intl
 * runtime, no `server-only`), so it renders in Vitest and inside the send action's
 * `after()` alike, exactly like the 2.01 `ResultsEmail` it mirrors in brand +
 * layout:
 *   greeting → intro ("the full profile is attached") → a warm worded
 *   top-strength teaser → the demo-class invite + CTA button → the muted IqUp
 *   identity footer.
 *
 * HONEST FRAMING: no IQ / score / % / rank / number and NO child name anywhere
 * (the copy addresses "your child"). The profile detail lives only in the attached
 * PDF — never in this body. Colours are literal hex (email clients can't resolve
 * `var(--…)`): brand surfaces from `@/lib/email/brand`, the v2 violet action
 * mirrored from `--action` in `globals.css`.
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
  Button,
  Hr
} from '@react-email/components';

import {BRAND} from '@/lib/email/brand';
import type {ReportEmailProps} from './types';

const FONT_STACK = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** v2 violet action ramp — mirror of `--action*` in `globals.css`. */
const ACTION = '#762d90';
const ACTION_TINT = '#efe4f4';
const ACTION_INK = '#5e2274';

const main: React.CSSProperties = {
  backgroundColor: BRAND.canvas,
  fontFamily: FONT_STACK,
  margin: 0,
  padding: '24px 0'
};

const container: React.CSSProperties = {
  backgroundColor: BRAND.white,
  borderRadius: '16px',
  border: `1px solid ${BRAND.border}`,
  maxWidth: '600px',
  margin: '0 auto',
  padding: '32px'
};

const greetingStyle: React.CSSProperties = {
  color: BRAND.ink,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px'
};

const introStyle: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px'
};

const teaserSection: React.CSSProperties = {
  backgroundColor: ACTION_TINT,
  borderRadius: '14px',
  padding: '20px 22px',
  margin: '0 0 24px'
};

const teaserKicker: React.CSSProperties = {
  color: ACTION_INK,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 6px'
};

const teaserName: React.CSSProperties = {
  color: BRAND.ink,
  fontSize: '17px',
  fontWeight: 700,
  lineHeight: '24px',
  margin: '0 0 6px'
};

const teaserBody: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '15px',
  lineHeight: '24px',
  margin: 0
};

const trialSection: React.CSSProperties = {
  backgroundColor: BRAND.heroTint,
  borderRadius: '14px',
  padding: '24px',
  margin: '8px 0 0',
  textAlign: 'center'
};

const trialHeading: React.CSSProperties = {
  color: BRAND.heroInk,
  fontSize: '19px',
  lineHeight: '26px',
  fontWeight: 700,
  margin: '0 0 8px'
};

const trialBody: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 20px'
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: ACTION,
  color: BRAND.white,
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
  borderRadius: '999px',
  padding: '14px 28px',
  display: 'inline-block'
};

const dividerStyle: React.CSSProperties = {
  borderColor: BRAND.border,
  margin: '28px 0'
};

const footerStyle: React.CSSProperties = {
  color: BRAND.inkFaint,
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 6px'
};

export function ReportEmail(props: ReportEmailProps): React.JSX.Element {
  const {chrome, topStrengthName, topStrengthBody, bookingUrl} = props;

  return (
    <Html lang={props.locale}>
      <Head />
      <Preview>{chrome.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={greetingStyle}>{chrome.greeting}</Text>
            <Text style={introStyle}>{chrome.intro}</Text>
          </Section>

          <Section style={teaserSection}>
            <Text style={teaserKicker}>{chrome.teaserKicker}</Text>
            <Heading as="h2" style={teaserName}>
              {topStrengthName}
            </Heading>
            <Text style={teaserBody}>{topStrengthBody}</Text>
          </Section>

          <Section style={trialSection}>
            <Heading as="h2" style={trialHeading}>
              {chrome.trialHeading}
            </Heading>
            <Text style={trialBody}>{chrome.trialBody}</Text>
            <Button href={bookingUrl} style={buttonStyle}>
              {chrome.cta}
            </Button>
          </Section>

          <Hr style={dividerStyle} />

          <Section>
            <Text style={footerStyle}>{chrome.footer.identity}</Text>
            <Text style={footerStyle}>{chrome.footer.contact}</Text>
            <Text style={{...footerStyle, color: BRAND.inkSoft}}>{chrome.footer.signoff}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ReportEmail;
