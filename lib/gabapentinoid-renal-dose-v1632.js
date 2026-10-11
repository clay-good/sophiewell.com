// spec-v1632 tool 6: gabapentin and pregabalin by creatinine clearance, read from each label.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Neurontin (gabapentin; Viatris, DailyMed version 48), section 2.3, Table 1 (12 years and older):
//     >= 60, 900 to 3600 mg/day in three doses; > 30 to 59, 400 to 1400 in two; > 15 to 29, 200 to 700
//     once daily; 15, 100 to 300 once daily. "For patients with creatinine clearance <15 mL/min,
//     reduce daily dose in proportion to creatinine clearance (e.g., patients with a creatinine
//     clearance of 7.5 mL/min should receive one-half the daily dose that patients with a creatinine
//     clearance of 15 mL/min receive)." Hemodialysis: maintenance by clearance, plus a supplemental
//     dose of 125, 150, 200, 250 or 350 mg "after each 4 hours of hemodialysis".
//   Lyrica (pregabalin; Pfizer, version 59), Table 2: each total daily dose for normal renal function
//     (150, 300, 450, 600 mg/day) maps to a dose in each band: >= 60; 30-60; 15-30; less than 15. The
//     bands share their edges (30 and 60 each appear in two rows). Supplement after every 4-hour
//     hemodialysis, by the once-daily regimen.
//
// The gabapentin figure below 15 mL/min is the label's own proportion worked out, with its sentence.
// Adults (gabapentin: 12 years and older).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { findBands, describeBands } from './label-dose.js';

export const DRUGS = [
  { value: 'gabapentin', text: 'Gabapentin (Neurontin)', brand: 'Neurontin', setId: '97935fd9-1d4a-43b6-a5d9-de994591187b' },
  { value: 'pregabalin', text: 'Pregabalin (Lyrica)', brand: 'Lyrica', setId: '60185c88-ecfd-46f9-adb9-b97c6b00a553' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const NORMAL_DOSES = [
  { value: '150', text: '150 mg/day' }, { value: '300', text: '300 mg/day' }, { value: '450', text: '450 mg/day' }, { value: '600', text: '600 mg/day' },
];
export const GABAPENTIN_BANDS = [
  { from: 60, to: null, range: [900, 3600], text: '900 to 3,600 mg/day in three divided doses (300, 400, 600, 800 or 1,200 mg three times a day)' },
  { from: 30, fromExclusive: true, to: 59, range: [400, 1400], text: '400 to 1,400 mg/day in two divided doses (200, 300, 400, 500 or 700 mg twice a day)' },
  { from: 15, fromExclusive: true, to: 29, range: [200, 700], text: '200 to 700 mg/day as a single daily dose (200, 300, 400, 500 or 700 mg)' },
  { from: 15, to: 15, range: [100, 300], text: '100 to 300 mg/day as a single daily dose (100, 125, 150, 200 or 300 mg)' },
];
export const GABAPENTIN_SUPPLEMENTS = [125, 150, 200, 250, 350];
// Lyrica Table 2, one column per normal daily dose (150, 300, 450, 600).
export const PREGABALIN_BANDS = [
  { from: 60, to: null, doses: ['150', '300', '450', '600'], regimen: 'in two or three divided doses' },
  { from: 30, to: 60, doses: ['75', '150', '225', '300'], regimen: 'in two or three divided doses' },
  { from: 15, to: 30, doses: ['25 to 50', '75', '100 to 150', '150'], regimen: 'once daily or in two divided doses' },
  { from: null, to: 15, toExclusive: true, doses: ['25', '25 to 50', '50 to 75', '75'], regimen: 'once daily' },
];
export const PREGABALIN_SUPPLEMENTS = ['25 mg or 50 mg', '50 mg or 75 mg', '75 mg or 100 mg', '100 mg or 150 mg'];
const NOTE = 'This reports the row of the label\'s renal table for the values entered. It is not a recommendation, and it does not choose a dose within a range the label gives.';

const sig = (x) => Number(Number(x).toPrecision(3));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 3 });

function gabapentin(crcl, hd, brand) {
  const notes = []; const out = {};
  let band;
  if (crcl < 15) {
    const f = crcl / 15; const lo = 100 * f; const hi = 300 * f;
    Object.assign(out, { flag: 'dose', dailyLow: sig(lo), dailyHigh: sig(hi), proportion: sig(f) });
    band = `The ${brand} label says to reduce the daily dose in proportion to the creatinine clearance below 15 mL/min: ${show(crcl)} ÷ 15 = ${show(f)} of the 100 to 300 mg/day given at 15 mL/min, which is ${show(lo)} to ${show(hi)} mg/day.`;
    notes.push('The label\'s own example: a clearance of 7.5 mL/min gets one-half the daily dose given at 15 mL/min.');
  } else {
    const found = findBands(GABAPENTIN_BANDS, crcl);
    notes.push(describeBands(found, crcl, 'mL/min', `the ${brand} label's table`));
    const rows = found.rows;
    Object.assign(out, { flag: 'dose', rows: rows.map((r) => r.text), dailyLow: Math.min(...rows.map((r) => r.range[0])), dailyHigh: Math.max(...rows.map((r) => r.range[1])) });
    band = rows.length > 1
      ? `The ${brand} label gives two rows here: ${rows.map((r) => r.text).join('; or ')}.`
      : `The ${brand} label gives ${rows[0].text}.`;
  }
  if (hd === 'yes') notes.push(`Hemodialysis: the label keeps the maintenance dose by clearance above and adds a supplemental dose after each 4 hours of hemodialysis: ${GABAPENTIN_SUPPLEMENTS.join(', ')} mg, matched in order to the five doses of the row.`);
  notes.push('The table is for patients 12 years of age and older; the effective dose for each indication is in the label\'s dosing sections.');
  return { ...out, band, notes };
}

function pregabalin(o, crcl, hd, brand) {
  const col = NORMAL_DOSES.findIndex((n) => n.value === String(o.normalDose ?? '').trim());
  if (col < 0) return { fault: 'Choose the total daily dose for normal renal function (150, 300, 450 or 600 mg/day): the Lyrica table maps each one to a dose in each band.' };
  const found = findBands(PREGABALIN_BANDS, crcl);
  const rows = found.rows;
  const texts = rows.map((r) => `${r.doses[col]} mg/day ${r.regimen}`);
  const notes = [describeBands(found, crcl, 'mL/min', `the ${brand} label's table`), `Column: a normal-renal-function dose of ${NORMAL_DOSES[col].value} mg/day.`];
  if (hd === 'yes') notes.push(`Hemodialysis: the label adds one supplemental dose after every 4-hour hemodialysis, keyed to the once-daily regimen. For the ${PREGABALIN_BANDS[3].doses[col]} mg once-daily regimen of this column: ${PREGABALIN_SUPPLEMENTS[col]}.`);
  return {
    flag: 'dose', rows: texts,
    band: rows.length > 1 ? `The ${brand} label gives two rows here: ${texts.join('; or ')}.` : `The ${brand} label gives ${texts[0]}.`,
    notes,
  };
}

export function gabapentinoidRenalDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the drug: gabapentin or pregabalin.' };
  const hd = String(o.hemodialysis ?? '').trim();
  if (hd !== 'no' && hd !== 'yes') return { valid: false, message: 'Say whether the patient is on hemodialysis: both labels add a supplemental dose after it.' };
  const f = inputFault([['the creatinine clearance', o.crcl, 0, 250, 'mL/min']]);
  if (f) return { valid: false, message: f };
  const crcl = Number(o.crcl);
  const row = labelRow(drug.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, drug: drug.value, band: `The ${drug.brand} label's rows are withheld, so no dose is reported.`, bandLabel: 'Withheld', notes: [`The ${drug.brand} label rows are withheld: ${row.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  }
  const r = drug.value === 'gabapentin' ? gabapentin(crcl, hd, drug.brand) : pregabalin(o, crcl, hd, drug.brand);
  if (r.fault) return { valid: false, message: r.fault };
  const { band, notes, ...extra } = r;
  return { valid: true, drug: drug.value, ...extra, abnormal: false, band, bandLabel: 'Dose given', notes: [...notes, `Label: ${row.edition}.`], note: NOTE };
}
