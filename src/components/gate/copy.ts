/**
 * Shape of the email gate's chrome copy, resolved server-side from the `Gate`
 * next-intl namespace and handed to the client island as plain strings (so the
 * island ships no translation runtime — matching the landing/runner pattern).
 *
 * All MK strings are PROVISIONAL (Claude-drafted), pending native-MK review and
 * IqUp legal sign-off on the consent + marketing wording (tied to CONSENT_VERSION).
 */
export interface GateCopy {
  /** Small "this step is for the grown-up" badge label. */
  forParent: string;
  heading: string;
  intro: string;
  /** Live personalised line; template with `{name}`. */
  preview: string;
  email: {
    label: string;
    placeholder: string;
    errorRequired: string;
    errorInvalid: string;
  };
  childName: {
    label: string;
    placeholder: string;
    errorRequired: string;
    errorTooLong: string;
  };
  consent: {
    label: string;
    error: string;
  };
  marketing: {
    label: string;
  };
  privacyNote: string;
  submit: string;
  submitting: string;
  error: string;
  honeypotLabel: string;
}

/** Fill the single `{name}` placeholder in a template string. */
export function fillName(template: string, name: string): string {
  return template.replace(/\{name\}/g, name);
}
