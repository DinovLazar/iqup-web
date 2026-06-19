/**
 * Server-resolved chrome copy for the consent banner + Manage dialog. Resolved
 * once in `ConsentRoot` (server) from the `Consent` i18n namespace and handed to
 * the client islands as props, so they ship no translation runtime — the same
 * pattern as the test/gate/result chrome.
 */
export type ConsentCopy = {
  banner: {
    ariaLabel: string;
    title: string;
    body: string;
    accept: string;
    reject: string;
    manage: string;
  };
  manage: {
    title: string;
    intro: string;
    save: string;
    cancel: string;
    close: string;
    alwaysOn: string;
    necessary: {title: string; description: string};
    analytics: {title: string; description: string};
    marketing: {title: string; description: string};
    note: string;
  };
};
