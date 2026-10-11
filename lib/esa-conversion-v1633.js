// spec-v1633 tool 9: epoetin or darbepoetin to Aranesp or Mircera, the starting dose each label's
// table gives. One way: neither label gives a table back to epoetin.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Aranesp (darbepoetin alfa; Amgen, DailyMed version 161), section 2.2, "Conversion from Epoetin
//     alfa to Aranesp in patients with CKD on dialysis": "Administer Aranesp once weekly in patients
//     who were receiving epoetin alfa 2 to 3 times weekly. Administer Aranesp once every 2 weeks in
//     patients who were receiving epoetin alfa once weekly ... Maintain the route of administration".
//     Table 1 (mcg/week, adult and pediatric) by previous weekly epoetin alfa dose: < 1,500, 6.25 and
//     "*" (pediatric: "the available data are insufficient"); 1,500 to 2,499, 6.25 and 6.25; 2,500 to
//     4,999, 12.5 and 10; 5,000 to 10,999, 25 and 20; 11,000 to 17,999, 40 and 40; 18,000 to 33,999,
//     60 and 60; 34,000 to 89,999, 100 and 100; >= 90,000, 200 and 200. CKD not on dialysis: "The dose
//     conversion depicted in Table 1 does not accurately estimate the once monthly dose".
//   Mircera (methoxy polyethylene glycol-epoetin beta; Vifor, version 10), section 2.2, Table 1
//     (adults; once monthly or once every two weeks): epoetin alfa "Less than 8000 units" or
//     darbepoetin "Less than 40 mcg", 120 or 60 mcg; "8000 units to 16000 units" or "40 mcg to 80
//     mcg", 200 or 100 mcg; "More than 16000 units" or "More than 80 mcg", 360 or 180 mcg. Section
//     2.3, Table 2 (pediatric, 3 months to 17 years, once every 4 weeks): nine bands from "Less than
//     1300 units" (30 mcg) to "greater than or equal to 9500 units" (360 mcg), each also stated in
//     weekly darbepoetin.
//
// The Aranesp table's figure is in mcg per week. For the every-2-week interval the text read does not
// say how the weekly figure scales, so the tool shows the weekly figure with the label's interval and
// says so; it does not double it.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const TARGETS = [
  { value: 'aranesp', text: 'Aranesp (darbepoetin alfa)', brand: 'Aranesp', setId: '0fd36cb9-c4f6-4167-93c9-8530865db3f9' },
  { value: 'mircera', text: 'Mircera (methoxy polyethylene glycol-epoetin beta)', brand: 'Mircera', setId: '22c56f2a-f73c-60e7-e054-00144ff88e88' },
];
export const CURRENT = [{ value: 'epoetin', text: 'Epoetin alfa (units a week)' }, { value: 'darbepoetin', text: 'Darbepoetin alfa (mcg a week)' }];
export const POPULATIONS = [{ value: 'adult', text: 'Adult' }, { value: 'pediatric', text: 'Pediatric' }];
export const EPOETIN_FREQUENCIES = [{ value: 'two-to-three-weekly', text: 'Epoetin 2 to 3 times a week' }, { value: 'weekly', text: 'Epoetin once a week' }];
export const MIRCERA_INTERVALS = [{ value: 'monthly', text: 'Once monthly' }, { value: 'every-two-weeks', text: 'Once every two weeks' }];
// Aranesp Table 1: [from, to (inclusive, null = open), adult mcg/week, pediatric mcg/week (null: insufficient data)].
export const ARANESP_ROWS = [[null, 1499, 6.25, null], [1500, 2499, 6.25, 6.25], [2500, 4999, 12.5, 10], [5000, 10999, 25, 20], [11000, 17999, 40, 40], [18000, 33999, 60, 60], [34000, 89999, 100, 100], [90000, null, 200, 200]];
// Mircera Table 1 (adult): [epoetin units/week test, darbepoetin mcg/week test, monthly mcg, every-2-weeks mcg].
const MIRCERA_ADULT = [
  { text: 'less than 8,000 units of epoetin alfa, or less than 40 mcg of darbepoetin alfa, a week', epoetin: (u) => u < 8000, darbepoetin: (m) => m < 40, monthly: 120, biweekly: 60 },
  { text: '8,000 to 16,000 units of epoetin alfa, or 40 to 80 mcg of darbepoetin alfa, a week', epoetin: (u) => u >= 8000 && u <= 16000, darbepoetin: (m) => m >= 40 && m <= 80, monthly: 200, biweekly: 100 },
  { text: 'more than 16,000 units of epoetin alfa, or more than 80 mcg of darbepoetin alfa, a week', epoetin: (u) => u > 16000, darbepoetin: (m) => m > 80, monthly: 360, biweekly: 180 },
];
// Mircera Table 2 (pediatric): upper bound exclusive, [epoetin units/week below, darbepoetin mcg/week below, mcg every 4 weeks].
export const MIRCERA_PEDIATRIC = [[1300, 6, 30], [2000, 9, 50], [2700, 12, 75], [3500, 15, 100], [4200, 19, 120], [5500, 24, 150], [7000, 31, 200], [9500, 42, 250], [null, null, 360]];
const NOTE = 'This reports what the label\'s table gives for these inputs. It does not prescribe, and it runs one way: neither label gives a table back to epoetin alfa. Dose changes by hemoglobin are a separate question.';
const n = (x) => Number(x).toLocaleString('en-US');

function aranesp(o, base) {
  if (o.current !== 'epoetin') return { valid: false, message: 'Aranesp is darbepoetin alfa. Its table converts from epoetin alfa only: choose epoetin alfa, or Mircera as the target.' };
  const freq = String(o.epoetinFrequency ?? '').trim();
  if (!EPOETIN_FREQUENCIES.some((f) => f.value === freq)) return { valid: false, message: 'Say how often the epoetin alfa is given, 2 to 3 times a week or once a week: the Aranesp label sets the interval from it.' };
  const u = o.dose;
  const row = ARANESP_ROWS.find(([lo, hi]) => (lo === null || u >= lo) && (hi === null || u <= hi));
  const interval = freq === 'weekly' ? 'once every 2 weeks' : 'once weekly';
  const tail = ['The label says to maintain the route of administration (intravenous or subcutaneous).', 'Table 1 is for chronic kidney disease on dialysis. For patients not on dialysis the label says it does not accurately estimate the once monthly dose.'];
  if (!row) {
    const i = ARANESP_ROWS.findIndex(([lo]) => lo !== null && lo > u); const below = ARANESP_ROWS[i - 1]; const above = ARANESP_ROWS[i];
    return { ...base, flag: 'between-bands', abnormal: true, band: `${n(u)} units a week falls between two rows as the Aranesp label prints them (up to ${n(below[1])} and from ${n(above[0])}). The label does not cover this value.`, bandLabel: 'Between two rows', notes: tail };
  }
  const [lo, hi, adult, ped] = row; const mcg = o.population === 'adult' ? adult : ped;
  const rowText = lo === null ? `below ${n(hi + 1)}` : hi === null ? `${n(lo)} or more` : `${n(lo)} to ${n(hi)}`;
  if (mcg === null) return { ...base, flag: 'no-recommendation-given', abnormal: true, band: `The Aranesp label: for pediatric patients on less than 1,500 units of epoetin alfa a week, the available data are insufficient to determine a conversion dose.`, bandLabel: 'Insufficient data', notes: tail };
  const notes = [`Row matched: ${rowText} units of epoetin alfa a week (${o.population}).`];
  if (freq === 'weekly') notes.push('The table\'s figure is in mcg per week. The label gives once every 2 weeks as the interval for patients who were on epoetin alfa once weekly; the text read does not say how the weekly figure scales to that interval, so it is shown as printed and not doubled.');
  return { ...base, flag: 'dose', abnormal: false, mcgPerWeek: mcg, interval, band: `The Aranesp label's table gives ${mcg} mcg a week, with Aranesp given ${interval}.`, bandLabel: `${mcg} mcg/week, ${interval}`, notes: [...notes, ...tail] };
}

function mircera(o, base) {
  const d = o.dose; const unit = o.current === 'epoetin' ? 'units' : 'mcg';
  if (o.population === 'adult') {
    const interval = String(o.mirceraInterval ?? '').trim();
    if (!MIRCERA_INTERVALS.some((f) => f.value === interval)) return { valid: false, message: 'Choose the Mircera interval, once monthly or once every two weeks: the label gives a dose for each.' };
    const row = MIRCERA_ADULT.find((r) => r[o.current](d));
    const mcg = interval === 'monthly' ? row.monthly : row.biweekly;
    return { ...base, flag: 'dose', abnormal: false, mcg, interval, monthlyMcg: row.monthly, everyTwoWeeksMcg: row.biweekly, band: `The Mircera label's table gives ${mcg} mcg ${interval === 'monthly' ? 'once monthly' : 'once every two weeks'}.`, bandLabel: `${mcg} mcg ${interval === 'monthly' ? 'monthly' : 'every 2 weeks'}`, notes: [`Row matched: ${row.text}. The same row gives ${row.monthly} mcg once monthly or ${row.biweekly} mcg once every two weeks.`, 'The label applies this to adults whose hemoglobin has been stabilized on an ESA, and says to round to the closest dose the prefilled syringes allow.'] };
  }
  const col = o.current === 'epoetin' ? 0 : 1;
  const i = MIRCERA_PEDIATRIC.findIndex((r) => r[col] === null || d < r[col]);
  const row = MIRCERA_PEDIATRIC[i]; const lower = i === 0 ? null : MIRCERA_PEDIATRIC[i - 1][col];
  const rowText = lower === null ? `less than ${n(row[col])}` : row[col] === null ? `${n(lower)} or more` : `${n(lower)} to less than ${n(row[col])}`;
  return { ...base, flag: 'dose', abnormal: false, mcg: row[2], interval: 'every-four-weeks', band: `The Mircera label's pediatric table gives ${row[2]} mcg once every 4 weeks.`, bandLabel: `${row[2]} mcg every 4 weeks`, notes: [`Row matched: ${rowText} ${unit} a week.`, 'The pediatric table is for ages 3 months to 17 years with hemoglobin stabilized on an ESA. Under 6 years, the label keeps the route of the previous ESA.', 'The label says pediatric patients requiring less than 30 mcg should not be treated with Mircera.'] };
}

export function esaConversion(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const target = TARGETS.find((t) => t.value === String(o.target ?? '').trim());
  if (!target) return { valid: false, message: 'Choose the product being started, Aranesp or Mircera. Each label has its own table.' };
  const current = String(o.current ?? '').trim();
  if (!CURRENT.some((c) => c.value === current)) return { valid: false, message: 'Choose the current ESA: epoetin alfa or darbepoetin alfa.' };
  const population = String(o.population ?? '').trim();
  if (population !== 'adult' && population !== 'pediatric') return { valid: false, message: 'Choose adult or pediatric: both tables have separate figures for children.' };
  const f = inputFault([[current === 'epoetin' ? 'the total weekly epoetin alfa dose' : 'the total weekly darbepoetin alfa dose', o.weeklyDose, null, current === 'epoetin' ? 500000 : 2000, current === 'epoetin' ? 'units' : 'mcg']]);
  if (f) return { valid: false, message: f };
  const lr = labelRow(target.setId, now, table);
  const base = { valid: true, target: target.value, labelUrl: lr.url, note: NOTE };
  const args = { ...o, current, population, dose: Number(o.weeklyDose) };
  const r = target.value === 'aranesp' ? aranesp(args, base) : mircera(args, base);
  if (!r.valid) return r;
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${target.brand} label's table is withheld, so no starting dose is reported.`, bandLabel: 'Withheld', notes: [`The ${target.brand} label rows are withheld: ${lr.why}.`, 'Read the starting dose from the label in hand.'], note: NOTE };
  return { ...r, notes: [...r.notes, `Label: ${lr.edition}.`] };
}
