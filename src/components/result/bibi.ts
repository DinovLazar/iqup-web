/**
 * Bibi character art — drop-in swap point.
 *
 * Per the project rule, the licensed "Svetot na Bibi" characters are NEVER
 * generated or redrawn. Until the official transparent art lands in
 * `public/bibi/`, the certificate renders an abstract, licensing-safe placeholder
 * (`CertificatePlaceholderArt`).
 *
 * To swap in the real art when it arrives, set `BIBI_CERT_ART` to its public path
 * (e.g. `/bibi/certificate.png`). The certificate then renders that image inside
 * the exact same drop-in box with no layout change — and falls back to the
 * placeholder if the file fails to load.
 */
export const BIBI_CERT_ART: string | null = null;
