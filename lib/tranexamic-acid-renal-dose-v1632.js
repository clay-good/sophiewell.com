// spec-v1632 tool 15: tranexamic acid by serum creatinine, read from each label.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026. Both tables key on SERUM
// CREATININE in mg/dL, not on a clearance, and their edges differ:
//   Cyklokapron (tranexamic acid injection; Pfizer, DailyMed version 34), sections 2.1 and 2.2: usual,
//     "10 mg/kg actual body weight" as a single dose before tooth extraction, then 3 to 4 times daily
//     for 2 to 8 days. Renal: "1.36 mg/dL to 2.83 mg/dL 10 mg/kg intravenously twice daily; 2.83
//     mg/dL to 5.66 mg/dL 10 mg/kg intravenously daily; >5.66 mg/dL 10 mg/kg intravenously every 48
//     hours or 5 mg/kg intravenously every 24 hours". 2.83 appears in two rows.
//   Tranexamic acid tablets (ANI, version 4), section 2: normal renal function, "1300 mg orally three
//     times daily (3900 mg/day) for a maximum of 5 days". Renal: "Above 1.4 and <= 2.8, 1300 mg two
//     times a day; Above 2.8 and <= 5.7, 1300 mg once a day; Above 5.7, 650 mg once a day".
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { findBands, describeBands } from './label-dose.js';

export const ROUTES = [
  { value: 'iv', text: 'Intravenous (Cyklokapron)', brand: 'Cyklokapron', setId: '6e89a7d9-4da4-42aa-b7f8-c602c24eefe5' },
  { value: 'oral', text: 'Oral tablets', brand: 'tranexamic acid tablets', setId: '82bc4879-bcf5-47c4-8636-a73c4e7d0de9' },
];
// perKg in mg/kg per dose; null where the row is the usual dosage.
export const IV_BANDS = [
  { from: null, to: 1.36, toExclusive: true, flag: 'no-adjustment', text: 'no renal row below 1.36 mg/dL: the usual dosage is 10 mg/kg before tooth extraction, then 10 mg/kg 3 to 4 times daily for 2 to 8 days', perKg: [10] },
  { from: 1.36, to: 2.83, flag: 'dose', text: '10 mg/kg intravenously twice daily', perKg: [10] },
  { from: 2.83, to: 5.66, flag: 'dose', text: '10 mg/kg intravenously daily', perKg: [10] },
  { from: 5.66, fromExclusive: true, to: null, flag: 'dose', text: '10 mg/kg intravenously every 48 hours or 5 mg/kg intravenously every 24 hours', perKg: [10, 5] },
];
export const ORAL_BANDS = [
  { from: null, to: 1.4, flag: 'no-adjustment', text: 'no renal row at 1.4 mg/dL or below: the dosage for normal renal function is 1,300 mg three times daily (3,900 mg/day)' },
  { from: 1.4, fromExclusive: true, to: 2.8, flag: 'dose', text: '1,300 mg two times a day (2,600 mg/day)' },
  { from: 2.8, fromExclusive: true, to: 5.7, flag: 'dose', text: '1,300 mg once a day' },
  { from: 5.7, fromExclusive: true, to: null, flag: 'dose', text: '650 mg once a day' },
];
const NOTE = 'These tables are by serum creatinine in mg/dL, not by creatinine clearance or eGFR. The tool reports the label\'s row; it is not a recommendation.';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function tranexamicAcidRenalDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const route = ROUTES.find((r) => r.value === String(o.route ?? '').trim());
  if (!route) return { valid: false, message: 'Choose the route: intravenous or oral. The two labels use different serum creatinine edges.' };
  const fields = [['the serum creatinine', o.creatinine, 0.1, 20, 'mg/dL']];
  if (route.value === 'iv') fields.push(['the actual body weight', o.weight, 20, 400, 'kg']);
  const f = inputFault(fields);
  if (f) return { valid: false, message: `${f}${route.value === 'iv' ? ' The injection is dosed in mg/kg of actual body weight.' : ''} Enter a serum creatinine, not a clearance.` };
  const row = labelRow(route.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, band: `The ${route.brand} label's rows are withheld, so no dose is reported.`, bandLabel: 'Withheld', notes: [`The ${route.brand} label rows are withheld: ${row.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  }
  const scr = Number(o.creatinine);
  const found = findBands(route.value === 'iv' ? IV_BANDS : ORAL_BANDS, scr);
  const rows = found.rows;
  const notes = [describeBands(found, scr, 'mg/dL', `the ${route.brand} label's table`)];
  const out = { valid: true, route: route.value, rows: rows.map((r) => r.text) };
  if (route.value === 'iv') {
    const kg = Number(o.weight);
    const doses = [...new Set(rows.flatMap((r) => r.perKg))];
    out.dosesMg = doses.map((d) => sig(d * kg));
    notes.push(`At ${show(kg)} kg actual body weight: ${doses.map((d) => `${d} mg/kg = ${show(d * kg)} mg`).join('; ')} per dose.`);
  } else {
    notes.push('The tablet label limits treatment to a maximum of 5 days during menstruation.');
  }
  const flag = rows.every((r) => r.flag === 'no-adjustment') ? 'no-adjustment' : 'dose';
  return {
    ...out, flag, abnormal: false,
    band: rows.length > 1 ? `The ${route.brand} label gives two rows here: ${rows.map((r) => r.text).join('; or ')}.` : `The ${route.brand} label gives ${rows[0].text}.`,
    bandLabel: flag === 'dose' ? 'Dose given' : 'No adjustment',
    notes: [...notes, `Label: ${row.edition}.`], note: NOTE,
  };
}
