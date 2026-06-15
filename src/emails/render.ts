/**
 * Phase 2.01 — render the results email to the `{html, text}` pair the send
 * action attaches to the outgoing message.
 *
 * Kept as a `.ts` file (no JSX) on purpose: it's a pure async helper that the
 * server orchestrator imports, and using `React.createElement` here means the
 * accompanying `.test.ts` (Vitest's `include` is `src/**\/*.test.ts`) can import
 * it without needing JSX transform in a `.ts` test file. The presentational JSX
 * lives entirely in `./ResultsEmail.tsx`.
 */
import * as React from 'react';
import {render} from '@react-email/render';

import {ResultsEmail} from './ResultsEmail';
import type {ResultsEmailProps} from './types';

export async function renderResultsEmail(
  props: ResultsEmailProps
): Promise<{html: string; text: string}> {
  const element = React.createElement(ResultsEmail, props);
  const html = await render(element);
  const text = await render(element, {plainText: true});
  return {html, text};
}
