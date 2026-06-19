/**
 * Phase 2.01 — the results email (parent-facing).
 *
 * A pure presentational React Email component: props in (`ResultsEmailProps`),
 * JSX out — no next-intl runtime, no `server-only` import — so it renders in
 * Vitest and inside the send action's `after()` alike.
 *
 * It mirrors the on-screen result's tone and order (`ResultView.tsx`):
 *   greeting → intro → headline → celebrated strengths (name + warm blurb)
 *   → "also strong" line → "growing" line → certificate-attached note
 *   → trial invite (bands 3–5 / 6–9) OR curious-mind ending (band 10–13)
 *   → muted footer.
 *
 * Every colour is a LITERAL hex from `@/lib/email/brand` (email clients cannot
 * resolve `var(--…)`), and the font is a web-safe stack (brand fonts cannot be
 * @font-faced into an inbox; the brand typography is carried by the attached
 * certificate image, not this HTML). No new visual direction is invented — these
 * are the same 1.03 tokens the rest of the product uses.
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

import {BRAND, strengthHex} from '@/lib/email/brand';
import type {ResultsEmailProps} from './types';

const FONT_STACK =
  "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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

const headlineStyle: React.CSSProperties = {
  color: BRAND.ink,
  fontSize: '22px',
  lineHeight: '30px',
  fontWeight: 700,
  margin: '0 0 20px'
};

const strengthNameStyle = (ink: string): React.CSSProperties => ({
  color: ink,
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 700,
  margin: '0 0 4px'
});

const blurbStyle: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 18px'
};

const supportingLineStyle: React.CSSProperties = {
  color: BRAND.ink,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px'
};

const certificateStyle: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '20px 0 0'
};

const dividerStyle: React.CSSProperties = {
  borderColor: BRAND.border,
  margin: '28px 0'
};

const trialSectionStyle: React.CSSProperties = {
  backgroundColor: BRAND.heroTint,
  borderRadius: '14px',
  padding: '24px',
  margin: '8px 0 0',
  textAlign: 'center'
};

const trialHeadingStyle: React.CSSProperties = {
  color: BRAND.heroInk,
  fontSize: '19px',
  lineHeight: '26px',
  fontWeight: 700,
  margin: '0 0 8px'
};

const trialBodyStyle: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 20px'
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: BRAND.hero,
  color: BRAND.heroInk,
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
  borderRadius: '999px',
  // padding gives a comfortable ≥44px tap target
  padding: '14px 28px',
  display: 'inline-block'
};

const curiousMindStyle: React.CSSProperties = {
  color: BRAND.ink,
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 0 0'
};

const footerStyle: React.CSSProperties = {
  color: BRAND.inkFaint,
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 6px'
};

export function ResultsEmail(props: ResultsEmailProps): React.JSX.Element {
  const {bandKey, copy, chrome, trialUrl} = props;
  const showTrial = bandKey === '3-5' || bandKey === '6-9';

  return (
    <Html lang={props.locale}>
      <Head />
      <Preview>{chrome.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={greetingStyle}>{chrome.greeting}</Text>
            <Text style={introStyle}>{chrome.intro}</Text>

            <Heading as="h1" style={headlineStyle}>
              {copy.headline}
            </Heading>

            {copy.celebrated.map((strength) => {
              const ink = strengthHex(strength.code).ink;
              return (
                <Section key={strength.code}>
                  <Heading as="h2" style={strengthNameStyle(ink)}>
                    {strength.name}
                  </Heading>
                  <Text style={blurbStyle}>{strength.blurb}</Text>
                </Section>
              );
            })}

            <Text style={supportingLineStyle}>{copy.alsoLine}</Text>
            <Text style={supportingLineStyle}>{copy.growingLine}</Text>

            <Text style={certificateStyle}>{chrome.certificateAttached}</Text>
          </Section>

          {showTrial ? (
            <Section style={trialSectionStyle}>
              <Heading as="h2" style={trialHeadingStyle}>
                {chrome.trial.heading}
              </Heading>
              <Text style={trialBodyStyle}>{chrome.trial.body}</Text>
              <Button href={trialUrl} style={buttonStyle}>
                {chrome.trial.cta}
              </Button>
            </Section>
          ) : (
            <Section>
              <Text style={curiousMindStyle}>{chrome.curiousMind}</Text>
            </Section>
          )}

          <Hr style={dividerStyle} />

          <Section>
            <Text style={footerStyle}>{chrome.footer.identity}</Text>
            <Text style={footerStyle}>{chrome.footer.contact}</Text>
            <Text style={{...footerStyle, color: BRAND.inkSoft}}>
              {chrome.footer.signoff}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ResultsEmail;
