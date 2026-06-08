/**
 * Shape of the runner's chrome copy (resolved server-side from the `Test`
 * next-intl namespace and handed to the client island as plain strings, so the
 * island ships no translation runtime — matching the 1.06 landing pattern).
 */
export interface TestCopy {
  start: {
    title: string;
    subtitle: string;
    /** Template with `{count}`. */
    metaCount: string;
    metaTime: string;
    cta: string;
  };
  /** Template with `{current}` and `{total}`. */
  progress: string;
  /** Template with `{current}` and `{total}`. */
  progressAria: string;
  back: string;
  next: string;
  finish: string;
  reveal: {
    title: string;
    intro: string;
    ready: string;
    show: string;
    watching: string;
    hide: string;
  };
  completion: {
    title: string;
    body: string;
    note: string;
  };
}

/** Fill `{name}` placeholders in a template string. */
export function fillTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}
