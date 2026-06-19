/**
 * The 10 IqUp centres — the single source for the trial-class CTA.
 *
 * ⚠ PROVISIONAL DATA. Seeded from `brand.md` §4 (itself drawn from iqup.mk/lokacii).
 * brand.md flags that **phone numbers and addresses vary across sources**
 * (locations page vs. individual center Facebook pages vs. press) and must be
 * **verified by IqUp before launch** — see the per-entry `verify` notes. These
 * details power conversions, so correct them the moment IqUp confirms them.
 *
 * Reused by Phase 1.10 (results trial invite) and Phase 2.05 (the shared trial
 * booking mechanic — `TrialBooking`). Addresses are kept in Macedonian exactly as
 * published. `mapsUrl` is used when present and otherwise derived into an honest
 * Google Maps *search* link (`mapsUrlFor`); `viber`/`whatsapp` are optional and
 * **left unset** until IqUp/Cowork confirms which centres use them.
 */
import type {Localized} from '@/content/locale';

export interface Center {
  /** Stable slug id (used as the picker option value). */
  readonly id: string;
  /** City label for the picker, per locale. */
  readonly city: Localized;
  /** Full centre name, per locale (e.g. "IQ UP! Аеродром – Скопје"). */
  readonly name: Localized;
  /** Street address, in Macedonian as published. */
  readonly address: string;
  /** Public phone number (provisional — verify before launch). */
  readonly phone: string;
  /** City-specific @iqup.mk email. */
  readonly email: string;
  /** Named local contact. */
  readonly contact: string;
  /** Per-centre Google Maps place link — empty until IqUp supplies it; when
   *  empty, `mapsUrlFor` derives an honest Maps *search* link from city+address. */
  readonly mapsUrl: string;
  /** Optional Viber number (E.164, e.g. `+38970...`). **Unset** until confirmed —
   *  do not fabricate. When present, `viberHref` builds the chat deep link. */
  readonly viber?: string;
  /** Optional WhatsApp number (E.164, e.g. `+38970...`). **Unset** until confirmed
   *  — do not fabricate. When present, `whatsappHref` builds the wa.me link. */
  readonly whatsapp?: string;
  /** Optional verification note carried over from brand.md §4. */
  readonly verify?: string;
}

export const CENTERS: readonly Center[] = [
  {
    id: 'aerodrom',
    city: {mk: 'Скопје – Аеродром', en: 'Skopje – Aerodrom'},
    name: {mk: 'IQ UP! Аеродром – Скопје', en: 'IQ UP! Skopje – Aerodrom'},
    address: 'Бул. Јане Сандански 113Б, зграда 3, бр.5',
    phone: '070 382 269',
    email: 'aerodrom@iqup.mk',
    contact: 'Сандра Стојанова',
    mapsUrl: ''
  },
  {
    id: 'karpos',
    city: {mk: 'Скопје – Карпош', en: 'Skopje – Karpoš'},
    name: {mk: 'IQ UP! Карпош – Скопје', en: 'IQ UP! Skopje – Karpoš'},
    address: 'ул. Прашка бр.13',
    phone: '071 743 911',
    email: 'karposh@iqup.mk',
    contact: 'Христина Христова',
    mapsUrl: '',
    verify: 'A separate IqUp promo lists a Karpoš number 078 887 889 — confirm.'
  },
  {
    id: 'veles',
    city: {mk: 'Велес', en: 'Veles'},
    name: {mk: 'IQ UP! Велес', en: 'IQ UP! Veles'},
    address: 'ул. Солунска бр. 4',
    phone: '075 340 443',
    email: 'veles@iqup.mk',
    contact: 'Елена Пискачева Јанева',
    mapsUrl: '',
    verify: 'Veles Facebook page also lists "Blagoj Gorev 105, Veles" — confirm address.'
  },
  {
    id: 'stip',
    city: {mk: 'Штип', en: 'Štip'},
    name: {mk: 'IQ UP! Штип', en: 'IQ UP! Štip'},
    address: 'ул. Ген. Михајло Апостолски бр.3/1',
    phone: '075 381 933',
    email: 'shtip@iqup.mk',
    contact: 'Инес Трајковска',
    mapsUrl: ''
  },
  {
    id: 'ohrid',
    city: {mk: 'Охрид', en: 'Ohrid'},
    name: {mk: 'IQ UP! Охрид', en: 'IQ UP! Ohrid'},
    address: 'ул. Мите Богоевски бр.1',
    phone: '078 249 507',
    email: 'ohrid@iqup.mk',
    contact: 'Бисера Карадимче',
    mapsUrl: ''
  },
  {
    id: 'kicevo',
    city: {mk: 'Кичево', en: 'Kičevo'},
    name: {mk: 'IQ UP! Кичево', en: 'IQ UP! Kičevo'},
    address: 'ул. 4-ти ЈУЛИ бр.188-01/188-02, ламела А',
    phone: '071 777 939',
    email: 'kichevo@iqup.mk',
    contact: 'Наташа Блажеска',
    mapsUrl: ''
  },
  {
    id: 'kavadarci',
    city: {mk: 'Кавадарци', en: 'Kavadarci'},
    name: {mk: 'IQ UP! Кавадарци', en: 'IQ UP! Kavadarci'},
    address: 'ул. Максим Горки бр.9а',
    phone: '075 448 873',
    email: 'kavadarci@iqup.mk',
    contact: 'Габриела Делова',
    mapsUrl: ''
  },
  {
    id: 'prilep',
    city: {mk: 'Прилеп', en: 'Prilep'},
    name: {mk: 'IQ UP! Прилеп', en: 'IQ UP! Prilep'},
    address: 'ул. Пере Тошев бр.38',
    phone: '071 308 446',
    email: 'prilep@iqup.mk',
    contact: 'Ивана Петреска',
    mapsUrl: ''
  },
  {
    id: 'gevgelija',
    city: {mk: 'Гевгелија', en: 'Gevgelija'},
    name: {mk: 'IQ UP! Гевгелија', en: 'IQ UP! Gevgelija'},
    address: 'ул. Маршал Тито бр.191',
    phone: '077 771 708',
    email: 'gevgelija@iqup.mk',
    contact: 'Марија Павловски',
    mapsUrl: ''
  },
  {
    id: 'strumica',
    city: {mk: 'Струмица', en: 'Strumica'},
    name: {mk: 'IQ UP! Струмица', en: 'IQ UP! Strumica'},
    address: 'ул. Гоце Делчев бр. 23',
    phone: '070 223 573',
    email: 'strumica@iqup.mk',
    contact: 'Валентина Динова',
    mapsUrl: ''
  }
];

/** Look up a centre by id. */
export function getCenter(id: string): Center | undefined {
  return CENTERS.find((c) => c.id === id);
}

/**
 * The "Get directions" target for a centre. Uses the verified `mapsUrl` when one
 * has been supplied; otherwise derives a deterministic Google Maps **search** link
 * from the published city + address. This is an honest search (not a claimed exact
 * pin) and inherits the PROVISIONAL caveat above — replace with a real place link
 * by setting `mapsUrl`.
 */
export function mapsUrlFor(center: Center): string {
  if (center.mapsUrl.trim()) return center.mapsUrl;
  const query = `IQ UP! ${center.city.mk}, ${center.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Viber chat deep link for a centre, or `undefined` when no Viber number is set. */
export function viberHref(center: Center): string | undefined {
  if (!center.viber) return undefined;
  return `viber://chat?number=${encodeURIComponent(center.viber)}`;
}

/** WhatsApp wa.me link for a centre, or `undefined` when no WhatsApp number is set. */
export function whatsappHref(center: Center): string | undefined {
  if (!center.whatsapp) return undefined;
  // wa.me expects digits only (no `+`, spaces, or punctuation).
  const digits = center.whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : undefined;
}
