// spec-v1633 tool 4: starting methadone dose from another oral opioid, as the label's one-way table gives it.
//
// One label row (spec-v1628 section 1): methadone hydrochloride tablets, Hikma (DailyMed version 9),
// re-read on October 11, 2026; the SpecGx tablet label (version 47) prints the same table and text.
//   Section 2.4, Table 1, "Estimated Daily Oral Methadone Requirement as Percent of Total Daily
//     Morphine Equivalent Dose": "< 100 mg 20% to 30%; 100 to 300 mg 10% to 20%; 300 to 600 mg 8% to
//     12%; 600 mg to 1,000 mg 5% to 10%; > 1,000 mg < 5%".
//   "Divide the total daily methadone dose ... to reflect the intended dosing schedule"; "Always round
//     the dose down, if necessary, to the appropriate Methadone Hydrochloride Tablets strength(s)
//     available."
//   The label's example: 100 mg morphine x 15% = 15 mg daily; / 2 = 7.5 mg; "rounded down to 5 mg ...
//     every 12 hours".
//   "The table cannot be used to convert from Methadone Hydrochloride Tablets to another opioid. Doing
//     so will result in an overestimation of the dose of the new opioid and may result in fatal
//     overdose."
//   "Use a conversion ratio of 1:2 mg for parenteral to oral methadone (e.g., 5 mg parenteral
//     methadone to 10 mg oral methadone)."
//
// The table prints 300 and 600 in two rows each; at those values both rows are shown. (100 is in one
// row only: the first row is "< 100".) The result is always a range, never one figure.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { brand: 'methadone hydrochloride tablets (Hikma)', setId: '50f14803-78c0-4d19-8b5d-9a9c17582ac1' };
export const MODES = [
  { value: 'oral-opioid', text: 'From another oral opioid (morphine equivalents)' },
  { value: 'parenteral-methadone', text: 'From parenteral methadone' },
];
export const TABLETS = [{ value: '5', text: '5 mg tablets' }, { value: '10', text: '10 mg tablets' }];
// [low mg, high mg, low %, high %]; a null bound is open. Edges are inclusive as the label prints them.
export const ROWS = [
  { text: 'below 100 mg', lo: null, hi: 100, hiExclusive: true, pct: [20, 30] },
  { text: '100 to 300 mg', lo: 100, hi: 300, pct: [10, 20] },
  { text: '300 to 600 mg', lo: 300, hi: 600, pct: [8, 12] },
  { text: '600 to 1,000 mg', lo: 600, hi: 1000, pct: [5, 10] },
  { text: 'above 1,000 mg', lo: 1000, loExclusive: true, hi: null, pct: [null, 5] },
];
const ONE_WAY = 'One way only. The label: this is not a table of equianalgesic doses, and it cannot be used to convert from methadone to another opioid; doing so overestimates the new opioid and may result in fatal overdose. This tool has no reverse mode.';
const NOTE = 'This reports what the label gives for these inputs. It does not prescribe. The label says it is safer to underestimate the 24-hour methadone dose and provide rescue medication than to overestimate it.';
const mg = (x) => `${Number(x.toFixed(2)).toLocaleString('en-US')} mg`;
const inRow = (r, v) => (r.lo === null || v > r.lo || (v === r.lo && !r.loExclusive)) && (r.hi === null || v < r.hi || (v === r.hi && !r.hiExclusive));

export function methadoneLabelConversion(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose what the patient is coming from: another oral opioid, or parenteral methadone.' };
  const lr = labelRow(LABEL.setId, now, table);
  const withheld = () => ({ valid: true, withheld: true, labelUrl: lr.url, band: 'The methadone label\'s conversion text is withheld, so no dose is reported.', bandLabel: 'Withheld', notes: [`The label rows are withheld: ${lr.why}.`, 'Read the conversion from the label in hand.'], note: NOTE });
  if (mode === 'parenteral-methadone') {
    const f = inputFault([['the parenteral methadone dose over 24 hours', o.parenteralMg, null, 1000, 'mg']]);
    if (f) return { valid: false, message: f };
    if (!lr.answers) return withheld();
    const p = Number(o.parenteralMg);
    return { valid: true, mode, flag: 'dose', abnormal: false, labelUrl: lr.url, oralDailyMg: p * 2, band: `The label's ratio for parenteral to oral methadone is 1:2 mg: ${mg(p)} a day of parenteral methadone corresponds to ${mg(p * 2)} a day of oral methadone.`, bandLabel: `${mg(p * 2)} a day by mouth`, notes: ['The label\'s example: 5 mg of parenteral methadone to 10 mg of oral methadone.', `Label: ${lr.edition}.`], note: NOTE };
  }
  const f = inputFault([['the total daily oral morphine-equivalent dose', o.morphineEquivalentMg, null, 20000, 'mg'], ['the number of methadone doses a day', o.dosesPerDay, 1, 6, '']]);
  if (f) return { valid: false, message: f };
  const n = Number(o.dosesPerDay);
  if (!Number.isInteger(n)) return { valid: false, message: 'Enter the number of methadone doses a day as a whole number (2 for every 12 hours, 3 for every 8 hours).' };
  const tablet = String(o.tabletMg ?? '').trim();
  if (tablet !== '5' && tablet !== '10') return { valid: false, message: 'Choose the tablet strength, 5 mg or 10 mg: the label rounds each dose down to it.' };
  if (!lr.answers) return withheld();
  const med = Number(o.morphineEquivalentMg); const t = Number(tablet);
  const rows = ROWS.filter((r) => inRow(r, med));
  const per = (daily) => Math.floor(daily / n / t) * t;
  const parts = rows.map((r) => {
    const high = (med * r.pct[1]) / 100; const low = r.pct[0] === null ? null : (med * r.pct[0]) / 100;
    // The open row is "less than 5%": strictly below its figure, so an exact multiple rounds down one tablet further.
    const open = r.pct[0] === null; const exact = open && Number.isInteger(high / n / t);
    return { row: r.text, percentLow: r.pct[0], percentHigh: r.pct[1], dailyLowMg: open ? null : Number(low.toFixed(2)), dailyHighMg: Number(high.toFixed(2)), perDoseLowMg: open ? null : per(low), perDoseHighMg: exact ? Math.max(0, per(high) - t) : per(high) };
  });
  const say = (p) => (p.percentLow === null
    ? `below ${p.percentHigh}% of the morphine equivalent, which is below ${mg(p.dailyHighMg)} a day (the label gives no lower figure); in ${n} doses, below ${mg(p.dailyHighMg / n)} each, which rounds down to at most ${p.perDoseHighMg} mg each on ${t} mg tablets`
    : `${p.percentLow}% to ${p.percentHigh}%, which is ${mg(p.dailyLowMg)} to ${mg(p.dailyHighMg)} a day; in ${n} doses, ${mg(p.dailyLowMg / n)} to ${mg(p.dailyHighMg / n)} each, rounded down on ${t} mg tablets to ${p.perDoseLowMg} to ${p.perDoseHighMg} mg each`);
  const band = parts.length === 2
    ? `The label prints ${med.toLocaleString('en-US')} mg in two rows, and both are shown. Row ${parts[0].row}: ${say(parts[0])}. Row ${parts[1].row}: ${say(parts[1])}.`
    : `For a morphine equivalent of ${med.toLocaleString('en-US')} mg a day (row ${parts[0].row}) the label estimates methadone at ${say(parts[0])}.`;
  const notes = ['The result is a range because the label gives one; it does not pick a point in it.'];
  if (parts.some((p) => p.perDoseLowMg === 0 || p.perDoseHighMg === 0)) notes.push(`Where a figure rounds down to 0 mg, the estimate is below one ${t} mg tablet per dose at this schedule.`);
  notes.push('The label\'s own example: 100 mg of morphine a day at 15% is 15 mg of methadone a day; in 2 doses that is 7.5 mg, rounded down to 5 mg every 12 hours.');
  notes.push('The morphine equivalent is yours to work out; the label says to use only the opioid component of combination products, and to sum the estimates when the patient takes more than one opioid.');
  notes.push(ONE_WAY, `Label: ${lr.edition}.`);
  const lo = Math.min(...parts.map((p) => (p.perDoseLowMg === null ? 0 : p.perDoseLowMg))); const hi = Math.max(...parts.map((p) => p.perDoseHighMg));
  const label = hi === 0 ? 'Below one tablet per dose' : !parts.every((p) => p.percentLow !== null) ? `At most ${hi} mg per dose` : lo === hi ? `${hi} mg per dose` : `${lo} to ${hi} mg per dose`;
  return { valid: true, mode, flag: 'dose', abnormal: parts.length === 2, labelUrl: lr.url, rows: parts, dosesPerDay: n, tabletMg: t, band, bandLabel: label, notes, note: NOTE };
}
