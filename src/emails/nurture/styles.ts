/**
 * Phase 2.03 — shared style objects for the nurture emails.
 *
 * These are a faithful REUSE of the 2.01 `ResultsEmail.tsx` presentation, not a
 * new email design system (the brief is explicit: do not introduce a parallel
 * one). Same literal-hex brand tokens (`@/lib/email/brand` — email clients can't
 * resolve `var(--…)`), same web-safe font stack, same container / button / footer
 * treatment, mobile-first. Kept in one module so the layout + four templates stay
 * a single visual family.
 */
import type * as React from 'react';
import {BRAND} from '@/lib/email/brand';

/** Web-safe stack — brand fonts can't be @font-faced into an inbox (as in 2.01). */
export const FONT_STACK =
  "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const main: React.CSSProperties = {
  backgroundColor: BRAND.canvas,
  fontFamily: FONT_STACK,
  margin: 0,
  padding: '24px 0'
};

export const container: React.CSSProperties = {
  backgroundColor: BRAND.white,
  borderRadius: '16px',
  border: `1px solid ${BRAND.border}`,
  maxWidth: '600px',
  margin: '0 auto',
  padding: '32px'
};

/** Wordmark stand-in header (placeholder for the official logo, as on screen). */
export const wordmark: React.CSSProperties = {
  color: BRAND.heroInk,
  fontSize: '20px',
  fontWeight: 800,
  letterSpacing: '0.01em',
  margin: '0 0 20px'
};

export const greetingStyle: React.CSSProperties = {
  color: BRAND.ink,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px'
};

export const headlineStyle: React.CSSProperties = {
  color: BRAND.ink,
  fontSize: '22px',
  lineHeight: '30px',
  fontWeight: 700,
  margin: '0 0 16px'
};

export const introStyle: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px'
};

export const bodyStyle: React.CSSProperties = {
  color: BRAND.inkSoft,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px'
};

export const dividerStyle: React.CSSProperties = {
  borderColor: BRAND.border,
  margin: '28px 0'
};

/** Trial CTA block — the warm tinted panel + pill button from 2.01. */
export const ctaSectionStyle: React.CSSProperties = {
  backgroundColor: BRAND.heroTint,
  borderRadius: '14px',
  padding: '24px',
  margin: '8px 0 0',
  textAlign: 'center'
};

export const buttonStyle: React.CSSProperties = {
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

/** The general (non-trial) link — a quiet secondary text link, not a CTA button. */
export const generalLinkStyle: React.CSSProperties = {
  color: BRAND.secondary,
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'underline'
};

export const footerStyle: React.CSSProperties = {
  color: BRAND.inkFaint,
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 6px'
};

export const footerStrongStyle: React.CSSProperties = {
  ...footerStyle,
  color: BRAND.inkSoft
};

export const unsubscribeLinkStyle: React.CSSProperties = {
  color: BRAND.inkSoft,
  textDecoration: 'underline'
};
