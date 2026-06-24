/**
 * Phase 3.10 — render the report email to the `{html, text}` pair the send path
 * attaches alongside the PDF.
 *
 * A `.ts` helper (no JSX) so the matching `.test.ts` can import it without a JSX
 * transform — the presentational JSX lives in `./ReportEmail.tsx`. Mirrors the
 * 2.01 `renderResultsEmail`.
 */
import * as React from 'react';
import {render} from '@react-email/render';

import {ReportEmail} from './ReportEmail';
import type {ReportEmailProps} from './types';

export async function renderReportEmail(
  props: ReportEmailProps
): Promise<{html: string; text: string}> {
  const element = React.createElement(ReportEmail, props);
  const html = await render(element);
  const text = await render(element, {plainText: true});
  return {html, text};
}
