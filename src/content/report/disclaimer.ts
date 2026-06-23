/**
 * The honest disclaimer (spec 6.4 / plan.md positioning rule) + the validity
 * treatment notes (spec 7.1). The disclaimer is an INDICATIVE cognitive profile,
 * never "clinical IQ", never a number, never a diagnosis — and it states openly
 * that the reference norms are provisional / a starting point.
 *
 * PROVISIONAL WORDING — flagged for IqUp legal.
 */
import type {DisclaimerCopy, ValidityNotes} from './types';

export const DISCLAIMER_COPY: DisclaimerCopy = {
  body: {
    mk: 'Овој извештај е информативен профил на размислувањето на вашето дете, а не клиничка анализа, дијагноза или мерка за вредност. Опишува како вашето дете пристапи кон овие задачи денес — насоки за охрабрување, не конечен суд. Секое дете расте по свое темпо.',
    en: 'This report is an informative profile of your child’s thinking, not a clinical assessment, a diagnosis, or a measure of worth. It describes how your child approached these tasks today — a guide for encouragement, not a final verdict. Every child grows at their own pace.'
  },
  provisional: {
    mk: 'Споредбите со возраста се засноваат на почетни референтни вредности што постојано се усовршуваат — појдовна точка, не завршен стандард. Затоа сликата е дадена како опсег и со зборови, никогаш како точен број.',
    en: 'Comparisons with age rest on initial reference values that are being refined over time — a starting place, not a finished standard. That is why the picture is given as a range and in words, never as a precise figure.'
  }
};

export const VALIDITY_NOTES: ValidityNotes = {
  gentle_note: {
    mk: 'Мала забелешка: неколку одговори дојдоа многу брзо, па оваа слика земете ја како опуштена прва скица. Мирно повторување во миран момент би ја направило поцелосна.',
    en: 'A small note: a few answers came very quickly, so take this picture as a relaxed first sketch. A calm retake in a quiet moment would make it fuller.'
  },
  not_representative: {
    mk: 'Важно: оваа сесија изгледа дека не ја доловила вистинската слика на вашето дете — некои одговори беа пребрзи или налик на погодување. Затоа ова не е сигурно читање. Најдобро е мирно повторување во опуштен момент; тогаш профилот обично изгледа сосема поинаку.',
    en: 'Important: this session does not appear to capture your child’s true picture — some answers were too quick or looked like guessing. So this is not a reliable reading. A calm retake in a relaxed moment is best; the profile then usually looks quite different.'
  }
};
