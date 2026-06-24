/**
 * The "IQ UP! cognitive profile" PDF — three A4 pages built with
 * `@react-pdf/renderer`, faithful to the 3.08 PDF surface (`surfaces/Report.html`).
 *
 *   Page 1 — cover/summary: branded header → title + age/generated/city meta →
 *            the identity pentagon (same shape for every child) → top-strength
 *            callout. Footer "Informative, not a diagnosis".
 *   Page 2 — the five indices: each as a hue rail + glyph + name + band WORD pill +
 *            confidence WORD + confidence note. No numbers, no per-axis magnitude.
 *   Page 3 — narrative + next steps: overall profile (shape + solving style +
 *            extremes) · room-to-grow (+ activity) · activities at home (2–3) ·
 *            STEM readiness + the coding/robotics bridge · IqUp positioning +
 *            matched program + the clickable demo CTA (carries ?grad=) · the full
 *            disclaimer + provisional-norms note.
 *
 * Flat fills only (no gradients/shadows/filters — react-pdf + the handover both
 * forbid them); Montserrat embedded (Cyrillic + Latin); NO Bibi / characters; the
 * only digits are the child's age + the generated date. Renders from the model
 * (`buildReportPdfModel`) so the printed text matches what the tests scan.
 */
import {Document, Page, View, Text, Link, StyleSheet} from '@react-pdf/renderer';
import {IdentityPentagonPdf} from './IdentityPentagonPdf';
import {Glyph} from './Glyph';
import {BRAND_FONT} from './fonts';
import {TOKENS} from './tokens';
import type {ReportPdfModel} from './model';

/** millimetres → PDF points (1mm = 2.834645669pt). */
const mm = (n: number): number => n * 2.834645669;

const styles = StyleSheet.create({
  page: {
    fontFamily: BRAND_FONT,
    color: TOKENS.ink,
    paddingTop: mm(15),
    paddingHorizontal: mm(15),
    paddingBottom: mm(10),
    fontSize: 10.5,
    lineHeight: 1.55,
    flexDirection: 'column'
  },

  // ── shared chrome ────────────────────────────────────────────────
  topRule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: TOKENS.line
  },
  wordmark: {flexDirection: 'row', alignItems: 'center'},
  wmIq: {fontSize: 18, fontWeight: 800, color: TOKENS.action},
  wmUp: {fontSize: 18, fontWeight: 800, color: TOKENS.inkHead},
  wmBadge: {
    marginLeft: 3,
    width: 18,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#ffc20e', // --ix-learning (the wordmark badge)
    color: TOKENS.ink,
    textAlign: 'center'
  },
  wmBadgeTxt: {fontSize: 15, fontWeight: 800, color: '#806100', lineHeight: 1.4},
  kick: {
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: TOKENS.actionInk
  },
  foot: {
    marginTop: 'auto',
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: TOKENS.line,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  footMotto: {fontSize: 8, color: TOKENS.inkFaint},
  secTitle: {fontSize: 15, fontWeight: 800, color: TOKENS.inkHead},

  // ── page 1 cover ─────────────────────────────────────────────────
  coverHead: {paddingTop: mm(8)},
  coverEyebrow: {
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: TOKENS.actionInk
  },
  coverTitle: {fontSize: 30, fontWeight: 800, color: TOKENS.inkHead, marginVertical: 6, lineHeight: 1.05},
  coverMeta: {flexDirection: 'row', marginTop: 8},
  coverMetaCol: {marginRight: mm(10)},
  metaLab: {
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: TOKENS.inkFaint
  },
  metaVal: {fontSize: 11, fontWeight: 700, color: TOKENS.inkHead, marginTop: 2},
  pentWrap: {alignItems: 'center', paddingVertical: mm(5)},
  topStrength: {
    backgroundColor: TOKENS.actionTint,
    borderWidth: 1,
    borderColor: TOKENS.actionSoft,
    borderRadius: 10,
    padding: mm(7),
    marginTop: mm(6)
  },
  tsKick: {
    fontSize: 8.5,
    fontWeight: 800,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: TOKENS.actionInk
  },
  tsTitle: {fontSize: 15, fontWeight: 800, color: TOKENS.inkHead, marginTop: 3, marginBottom: 5},
  tsBody: {fontSize: 10.5, color: TOKENS.ink, lineHeight: 1.55},

  // ── page 2 indices ───────────────────────────────────────────────
  lede: {fontSize: 11, color: TOKENS.inkMuted, lineHeight: 1.5, marginTop: 8, marginBottom: mm(3)},
  ixRow: {
    flexDirection: 'row',
    paddingVertical: mm(5),
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.line,
    alignItems: 'flex-start'
  },
  ixRail: {width: mm(6), borderRadius: 4, alignSelf: 'stretch', marginRight: mm(5)},
  ixIcon: {
    width: mm(9),
    height: mm(9),
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: mm(5)
  },
  ixBody: {flex: 1},
  ixHead: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  ixName: {fontSize: 13, fontWeight: 800, color: TOKENS.inkHead, marginRight: 8},
  ixBand: {fontSize: 9, fontWeight: 800, paddingVertical: 2, paddingHorizontal: 9, borderRadius: 999},
  ixConf: {flexDirection: 'row', marginTop: 6, alignItems: 'flex-start'},
  ixLvl: {
    fontSize: 8.5,
    fontWeight: 800,
    color: TOKENS.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 7
  },
  ixNote: {fontSize: 9, color: TOKENS.inkMuted, lineHeight: 1.45, flex: 1},

  // ── page 3 narrative (compact — the whole narrative fits on one A4, even at
  //    the maximal content: 2 strong-pair sentences in the overview) ──
  block: {marginBottom: mm(1.4)},
  blockHead: {flexDirection: 'row', alignItems: 'center', marginBottom: 1},
  dot: {width: 6, height: 6, borderRadius: 999, backgroundColor: TOKENS.action, marginRight: 6},
  blockHeadTxt: {fontSize: 10.5, fontWeight: 800, color: TOKENS.inkHead},
  para: {fontSize: 9.5, color: TOKENS.ink, lineHeight: 1.38, marginBottom: 1},
  growthAct: {fontSize: 8.5, color: TOKENS.inkMuted, lineHeight: 1.38, marginTop: 1},
  actItem: {flexDirection: 'row', marginTop: 2, alignItems: 'flex-start'},
  // A non-numeric marker — the honest-framing rule permits ONLY the age + the
  // generated date as digits, so the activity list uses a dot, never "1/2/3".
  actMarker: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: TOKENS.action,
    marginTop: 5,
    marginRight: 7
  },
  actTxt: {fontSize: 9.5, color: TOKENS.ink, lineHeight: 1.4, flex: 1},
  stemCard: {backgroundColor: '#daf1fc', borderRadius: 9, padding: mm(3)},
  stemBody: {fontSize: 9.5, color: TOKENS.ink, lineHeight: 1.4},
  stemBridge: {fontSize: 9, color: '#0a6a8c', fontWeight: 600, lineHeight: 1.4, marginTop: 3},
  iqupCard: {backgroundColor: TOKENS.actionTint, borderRadius: 9, padding: mm(3)},
  iqupBody: {fontSize: 9.5, color: TOKENS.ink, lineHeight: 1.4, marginTop: 2},
  iqupFit: {fontSize: 9, color: TOKENS.actionInk, fontWeight: 700, marginTop: 3},
  prog: {
    alignSelf: 'flex-start',
    backgroundColor: TOKENS.white,
    color: TOKENS.actionInk,
    fontSize: 8.5,
    fontWeight: 700,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    marginTop: 4
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: TOKENS.action,
    color: TOKENS.white,
    fontSize: 9.5,
    fontWeight: 700,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginTop: 5,
    textDecoration: 'none'
  },
  disc: {backgroundColor: TOKENS.field, borderRadius: 8, padding: mm(3), marginTop: mm(1)},
  discBody: {fontSize: 8.5, color: TOKENS.inkMuted, lineHeight: 1.4},
  discHonesty: {fontSize: 8, color: TOKENS.inkFaint, marginTop: 3}
});

function Wordmark() {
  return (
    <View style={styles.wordmark}>
      <Text style={styles.wmIq}>IQ</Text>
      <Text style={styles.wmUp}>UP</Text>
      <View style={styles.wmBadge}>
        <Text style={styles.wmBadgeTxt}>!</Text>
      </View>
    </View>
  );
}

function Foot({motto}: {motto: string}) {
  return (
    <View style={styles.foot}>
      <Text style={styles.footMotto}>{motto}</Text>
    </View>
  );
}

/** The full report document. `model` is the resolved content (no clock here). */
export function ReportDocument({model}: {model: ReportPdfModel}) {
  const {chrome, cover, indices, overview, growth, home, stem, iqup, disclaimer, locale, ctaHref} =
    model;

  return (
    <Document
      title="IQ UP! cognitive profile"
      author="IqUp"
      language={locale}
      creator="IqUp"
      producer="IqUp"
    >
      {/* ───────────────── PAGE 1 — COVER / SUMMARY ───────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule}>
          <Wordmark />
          <Text style={styles.kick}>{chrome.reportKick}</Text>
        </View>

        <View style={styles.coverHead}>
          <Text style={styles.coverEyebrow}>{chrome.coverEyebrow}</Text>
          <Text style={styles.coverTitle}>{chrome.coverTitle}</Text>
          <View style={styles.coverMeta}>
            <View style={styles.coverMetaCol}>
              <Text style={styles.metaLab}>{chrome.ageLabel}</Text>
              <Text style={styles.metaVal}>{cover.age}</Text>
            </View>
            {cover.generated ? (
              <View style={styles.coverMetaCol}>
                <Text style={styles.metaLab}>{chrome.generatedLabel}</Text>
                <Text style={styles.metaVal}>{cover.generated}</Text>
              </View>
            ) : null}
            <View style={styles.coverMetaCol}>
              <Text style={styles.metaLab}>{chrome.cityLabel}</Text>
              <Text style={styles.metaVal}>{cover.cityName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pentWrap}>
          <IdentityPentagonPdf size={300} locale={locale} />
        </View>

        <View style={styles.topStrength}>
          <Text style={styles.tsKick}>{chrome.leadingStrength}</Text>
          <Text style={styles.tsTitle}>{cover.topStrengthName}</Text>
          <Text style={styles.tsBody}>{cover.topStrengthBody}</Text>
        </View>

        <Foot motto={chrome.footMotto1} />
      </Page>

      {/* ───────────────── PAGE 2 — THE FIVE INDICES ───────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule}>
          <Text style={styles.secTitle}>{chrome.p2Title}</Text>
        </View>
        <Text style={styles.lede}>{chrome.p2Lede}</Text>

        {indices.map((idx, i) => (
          <View key={i} style={styles.ixRow}>
            <View style={[styles.ixRail, {backgroundColor: idx.hue.solid}]} />
            <View style={[styles.ixIcon, {backgroundColor: idx.hue.tint}]}>
              <Glyph glyph={idx.glyph} size={22} color={idx.hue.ink} />
            </View>
            <View style={styles.ixBody}>
              <View style={styles.ixHead}>
                <Text style={styles.ixName}>{idx.name}</Text>
                <Text style={[styles.ixBand, {backgroundColor: idx.hue.tint, color: idx.hue.ink}]}>
                  {idx.bandLabel}
                </Text>
              </View>
              <View style={styles.ixConf}>
                <Text style={styles.ixLvl}>{idx.confidenceLine}</Text>
                <Text style={styles.ixNote}>{idx.confidenceNote}</Text>
              </View>
            </View>
          </View>
        ))}

        <Foot motto={chrome.footMotto2} />
      </Page>

      {/* ───────────────── PAGE 3 — NARRATIVE + NEXT STEPS ───────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topRule}>
          <Text style={styles.secTitle}>{chrome.p3Title}</Text>
        </View>

        <View style={{paddingTop: mm(0.5)}}>
          {/* Overall profile */}
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <View style={styles.dot} />
              <Text style={styles.blockHeadTxt}>{overview.heading}</Text>
            </View>
            {overview.paragraphs.map((p, i) => (
              <Text key={i} style={styles.para}>
                {p}
              </Text>
            ))}
          </View>

          {/* Room to grow */}
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <View style={styles.dot} />
              <Text style={styles.blockHeadTxt}>{growth.heading}</Text>
            </View>
            <Text style={styles.para}>{growth.paragraphs[0]}</Text>
            {growth.paragraphs[1] ? (
              <Text style={styles.growthAct}>{`→ ${growth.paragraphs[1]}`}</Text>
            ) : null}
          </View>

          {/* Activities at home */}
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <View style={styles.dot} />
              <Text style={styles.blockHeadTxt}>{home.heading}</Text>
            </View>
            {home.paragraphs.map((p, i) => (
              <View key={i} style={styles.actItem}>
                <View style={styles.actMarker} />
                <Text style={styles.actTxt}>{p}</Text>
              </View>
            ))}
          </View>

          {/* STEM readiness */}
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <View style={styles.dot} />
              <Text style={styles.blockHeadTxt}>{stem.heading}</Text>
            </View>
            <View style={styles.stemCard}>
              <Text style={styles.stemBody}>{stem.body}</Text>
              <Text style={styles.stemBridge}>{`→ ${stem.bridge}`}</Text>
            </View>
          </View>

          {/* IqUp + demo CTA */}
          <View style={styles.block}>
            <View style={styles.iqupCard}>
              <View style={styles.blockHead}>
                <View style={styles.dot} />
                <Text style={styles.blockHeadTxt}>{iqup.heading}</Text>
              </View>
              <Text style={styles.iqupBody}>{iqup.positioning}</Text>
              <Text style={styles.iqupFit}>{iqup.programFit}</Text>
              <Text style={styles.prog}>{iqup.programName}</Text>
              <Link src={ctaHref} style={styles.cta}>
                {iqup.ctaLabel}
              </Link>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disc}>
            <Text style={styles.discBody}>{disclaimer.body}</Text>
            <Text style={styles.discHonesty}>{disclaimer.provisional}</Text>
          </View>
        </View>

        <Foot motto={chrome.footMotto3} />
      </Page>
    </Document>
  );
}
