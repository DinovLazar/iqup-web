/**
 * Per-index presentational identity for the v2 results screen (Phase 3.09) —
 * ported from `docs/design-handovers/surfaces/report-kit.js` (`INDEXES` + the
 * geometric glyph set), but keyed by the REAL `IndexId` values from the 3.07
 * engine (`@/lib/scoring/v2`) rather than the kit's short `code` strings.
 *
 * This is fixed design identity, NOT report content: the five areas, their
 * pentagon angles, their locked hue slug (→ the `--ix-*` tokens in globals.css),
 * their short vertex label, and their line glyph never vary by child. Report
 * content (band words, confidence, prose) comes from `buildReport`; the localised
 * chrome comes from the `Results` messages namespace. Keeping these here (not in
 * `messages`) keeps the pentagon self-contained and avoids duplicating identity
 * labels as free translation keys.
 */
import type {Locale} from '@/content/locale';
import type {IndexId} from '@/lib/scoring/v2';

export interface IndexMeta {
  /** Pentagon vertex angle (deg), top then clockwise — matches the brain motif. */
  readonly angle: number;
  /** The locked hue slug → `var(--ix-${hue})` / `var(--ix-${hue}-tint|-ink)`. */
  readonly hue: 'logic' | 'spatial' | 'memory' | 'planning' | 'learning';
  /** Short vertex label (the pentagon shows the short name only). */
  readonly short: Record<Locale, string>;
  /** Geometric line glyph path(s) for the card icon (24×24 viewBox, stroke). */
  readonly glyph: string;
}

/** Canonical order — identical to `CognitiveProfile.indices` / `ReportContent.indices`. */
export const INDEX_ORDER: readonly IndexId[] = [
  'logical',
  'spatial',
  'memory_focus',
  'planning_speed',
  'learning_stem'
];

export const INDEX_META: Record<IndexId, IndexMeta> = {
  logical: {
    angle: -90,
    hue: 'logic',
    short: {mk: 'Логика', en: 'Logic'},
    glyph:
      '<circle cx="12" cy="5" r="2.4"/><circle cx="5.5" cy="18.5" r="2.4"/><circle cx="18.5" cy="18.5" r="2.4"/><path d="M12 7.4v3.2M12 10.6 6.4 16.6M12 10.6l5.6 6"/>'
  },
  spatial: {
    angle: -18,
    hue: 'spatial',
    short: {mk: 'Простор', en: 'Spatial'},
    glyph:
      '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>'
  },
  memory_focus: {
    angle: 54,
    hue: 'memory',
    short: {mk: 'Меморија', en: 'Memory'},
    glyph:
      '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/><circle cx="12" cy="12" r="1.9"/>'
  },
  planning_speed: {
    angle: 126,
    hue: 'planning',
    short: {mk: 'План', en: 'Planning'},
    glyph:
      '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5 15 10M9.5 2.5h5M12 2.5V6M18.5 6l1.6-1.6"/>'
  },
  learning_stem: {
    angle: 198,
    hue: 'learning',
    short: {mk: 'СТЕМ', en: 'STEM'},
    glyph:
      '<path d="M9 3h6M10 3v6.2L5.4 17a2 2 0 0 0 1.7 3h9.8a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.7 14h8.6"/>'
  }
};
