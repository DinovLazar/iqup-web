/**
 * Public surface of the server-side PDF report generator (Phase 3.10). Import
 * from `@/lib/pdf`.
 *
 * Turns a `ReportContent` (the 3.07 engine's output) into the branded, bilingual
 * "IQ UP! cognitive profile" PDF, rendering from the SAME `buildReport` output as
 * the 3.09 on-screen results screen so the two can never disagree. Node-only
 * (react-pdf + embedded Montserrat); the PDF is rendered in memory and never
 * stored. The headline entry is {@link renderReportPdf}.
 */
export {renderReportPdf, type RenderReportPdfParams} from './render';
export {ReportDocument} from './ReportDocument';
export {buildReportPdfModel, flattenModelText, type ReportPdfModel} from './model';
