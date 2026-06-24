/**
 * `renderReportPdf` — the Node entry point that turns a `ReportContent` into the
 * report PDF as an in-memory buffer.
 *
 * Runs under the Node runtime (react-pdf + fontkit are Node-only). The caller
 * (`send-report-email.ts`) renders the buffer, attaches it, and discards it — the
 * PDF is NEVER written to disk in production. Determinism contract: the same
 * `ReportContent` + locale + booking URL yields the same rendered TEXT/structure
 * (PDF binaries embed creation metadata, so the bytes are not the contract).
 */
import {renderToBuffer} from '@react-pdf/renderer';
import type {Locale} from '@/content/locale';
import type {ReportContent} from '@/lib/report';
import {ReportDocument} from './ReportDocument';
import {buildReportPdfModel} from './model';
import {registerReportFonts} from './fonts';

export interface RenderReportPdfParams {
  readonly report: ReportContent;
  readonly locale: Locale;
  /** The demo-CTA target (carries `?grad=<centre>`) — from `bookingUrlFor`. */
  readonly bookingUrl: string;
}

/** Render the report to a PDF buffer. Fonts are registered on first call. */
export async function renderReportPdf(params: RenderReportPdfParams): Promise<Buffer> {
  registerReportFonts();
  const model = buildReportPdfModel(params.report, params.locale, params.bookingUrl);
  return renderToBuffer(<ReportDocument model={model} />);
}
