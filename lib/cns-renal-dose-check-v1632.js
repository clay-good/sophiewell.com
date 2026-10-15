// spec-v1632 tool 7: renal dose limits for eight CNS drugs, read from each label through
// lib/label-dose.js.
//
// Eight label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Keppra (levetiracetam; UCB, DailyMed version 36), section 2.5, Table 1, by creatinine clearance
//     adjusted for body surface area: "CLcr (mL/min/1.73m2) = CLcr (mL/min) x 1.73 / BSA".
//   Vimpat (lacosamide; UCB, version 63), section 2.4: "For patients with mild to moderate renal
//     impairment, no dosage adjustment is necessary"; severe (CLCR less than 30 mL/min) or end-stage
//     renal disease, "a reduction of 25% of the maximum dosage is recommended"; after a 4-hour
//     hemodialysis, "dosage supplementation of up to 50% should be considered".
//   Topamax (topiramate; Janssen, version 31), sections 2.5 and 2.6: "creatinine clearance less than
//     70 mL/min/1.73 m2, one-half of the usual adult dose".
//   Memantine extended-release capsules (Lupin, version 17): "creatinine clearance of 5 to 29
//     mL/min ... the recommended maintenance dose (and maximum recommended dose) is 14 mg/day".
//   Tramadol hydrochloride tablets (Amneal, version 51): "creatinine clearance less than 30 mL/min
//     ... dosing interval ... increased to 12 hours, with a maximum daily dose of 200 mg"; "dialysis
//     patients can receive their regular dose on the day of dialysis"; severe hepatic impairment,
//     50 mg every 12 hours; over 75 years, not above 300 mg/day.
//   Duloxetine delayed-release capsules (Lupin, version 26), section 2.7: "Avoid use in patients
//     with severe renal impairment, GFR <30 mL/minute"; "Avoid use in patients with chronic liver
//     disease or cirrhosis".
//   Pristiq (desvenlafaxine; Wyeth, version 67), section 2.2: 30 to 50 mL/min, maximum 50 mg per
//     day; 15 to 29 or below 15, "25 mg every day or 50 mg every other day. Supplemental doses
//     should not be given to patients after dialysis".
//   Chantix (varenicline; Pfizer, version 49): below 30 mL/min, start 0.5 mg once daily, maximum
//     0.5 mg twice daily; end-stage renal disease on hemodialysis, "a maximum dose of 0.5 mg once
//     daily may be administered if tolerated".
//
// Where a label states a limit only below a clearance, the row above it says exactly that: the label
// gives no renal limit there. Adults only.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended'; const NG = 'no-recommendation-given';
const b = (from, to, text, flag = D, extra = {}) => ({ from, to, text, flag, ...extra });
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
const above = (from, text, exclusive = false) => ({ from, to: null, fromExclusive: exclusive, text, flag: NA });
const CRCL = { unit: 'mL/min', measure: 'creatinine clearance' };
const NORM = { unit: 'mL/min/1.73 m²', measure: 'creatinine clearance' };

export const LABELS = {
  levetiracetam: { brand: 'Keppra', setId: '3ca9df05-a506-4ec8-a4fe-320f1219ab21', ...NORM },
  lacosamide: { brand: 'Vimpat', setId: '9e79b42c-38a3-4b2c-a196-a5a1948250e2', ...CRCL },
  topiramate: { brand: 'Topamax', setId: '21628112-0c47-11df-95b3-498d55d89593', ...NORM },
  memantine: { brand: 'memantine extended-release', setId: '24290655-47f3-4042-a977-a832c5161d2c', ...CRCL },
  tramadol: { brand: 'tramadol tablets', setId: '67919c2c-2f8a-4bbb-bef5-0cd6c1e63a16', ...CRCL },
  duloxetine: { brand: 'duloxetine', setId: '829a4f51-c882-4b64-81f3-abfb03a52ebe', unit: 'mL/min', measure: 'GFR' },
  desvenlafaxine: { brand: 'Pristiq', setId: '0f43610c-f290-46ea-d186-4f998ed99fce', ...CRCL },
  varenicline: { brand: 'Chantix', setId: 'f0ff4f27-5185-4881-a749-c6b7a0ca5696', ...CRCL },
};
const DESV = '25 mg every day or 50 mg every other day';

export const REGIMENS = [
  { value: 'levetiracetam', drug: 'levetiracetam', text: 'Levetiracetam (Keppra)', bands: [{ from: 80, fromExclusive: true, to: null, text: '500 to 1,500 mg every 12 hours', flag: D }, b(50, 80, '500 to 1,000 mg every 12 hours'), b(30, 50, '250 to 750 mg every 12 hours'), lt(30, '250 to 500 mg every 12 hours')], hd: { text: '500 to 1,000 mg every 24 hours, with a 250 to 500 mg supplemental dose after dialysis', flag: D } },
  { value: 'lacosamide', drug: 'lacosamide', text: 'Lacosamide (Vimpat)', bands: [b(30, null, 'no dosage adjustment for mild to moderate renal impairment', NA), lt(30, 'a reduction of 25% of the maximum dosage')], hd: { text: 'for end-stage renal disease, a reduction of 25% of the maximum dosage; after a 4-hour hemodialysis, supplementation of up to 50% should be considered', flag: D } },
  { value: 'topiramate', drug: 'topiramate', text: 'Topiramate (Topamax)', bands: [above(70, 'no renal limit at this clearance (its reduction starts below 70 mL/min/1.73 m²)'), lt(70, 'one-half of the usual adult dose')], hd: { text: 'a supplemental dose may be required, taking into account the duration of dialysis, the clearance rate of the dialysis system and the patient\'s renal clearance of topiramate', flag: D } },
  { value: 'memantine-er', drug: 'memantine', text: 'Memantine extended-release', bands: [above(29, 'no renal limit at this clearance (its limit is for 5 to 29 mL/min)', true), b(5, 29, 'a maintenance dose, and maximum, of 14 mg/day'), lt(5, 'no row: the label\'s renal limit covers 5 to 29 mL/min and gives nothing below 5', NG)] },
  { value: 'tramadol-ir', drug: 'tramadol', text: 'Tramadol immediate-release tablets', bands: [above(30, 'no renal limit at this clearance (its limit starts below 30 mL/min)'), lt(30, 'a dosing interval of 12 hours, with a maximum of 200 mg/day')], hd: { text: 'dialysis patients can receive their regular dose on the day of dialysis (only 7% of a dose is removed by hemodialysis); the clearance row still applies', flag: NA } },
  { value: 'duloxetine', drug: 'duloxetine', text: 'Duloxetine (by GFR)', bands: [above(30, 'no renal limit at this GFR (its "avoid use" starts below 30 mL/minute)'), lt(30, 'avoid use (severe renal impairment, GFR below 30 mL/minute)', NR)] },
  { value: 'desvenlafaxine', drug: 'desvenlafaxine', text: 'Desvenlafaxine (Pristiq)', bands: [above(50, 'no renal limit at this clearance (its limits start at 50 mL/min)', true), b(30, 50, 'a maximum of 50 mg per day'), b(15, 29, DESV), lt(15, DESV)], hd: { text: `${DESV}; supplemental doses should not be given after dialysis`, flag: D }, pd: { text: `${DESV}; supplemental doses should not be given after dialysis`, flag: D } },
  { value: 'varenicline', drug: 'varenicline', text: 'Varenicline (Chantix)', bands: [above(30, 'no renal limit at this clearance (its limit starts below 30 mL/min)'), lt(30, 'a starting dose of 0.5 mg once daily, titrated as needed to a maximum of 0.5 mg twice daily')], hd: { text: 'a maximum of 0.5 mg once daily, if tolerated (end-stage renal disease on hemodialysis)', flag: D } },
];
export { DIALYSIS };
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const NOTE = 'This reports the renal limit the label gives for the values entered. It is not a recommendation, it covers adults only, and it does not pick a dose within a range.';

function notesFor(reg) {
  if (reg.drug === 'tramadol') return ['The same label gives 50 mg every 12 hours for severe hepatic impairment, and no more than 300 mg/day over 75 years of age.'];
  if (reg.drug === 'duloxetine') return ['The same section says to avoid use in chronic liver disease or cirrhosis.'];
  if (reg.drug === 'lacosamide') return ['The label gives the reduction as a percentage of the maximum dosage, not in milligrams, and says titration in renal impairment should follow response and tolerability.'];
  if (reg.drug === 'topiramate') return ['The Topamax label states this clearance per 1.73 m².'];
  return [];
}

// spec-v1632 tool 7: an entered daily dose against the row's maximum. Each maximum is the number the
// row prints (per-dose ranges every 12 hours count twice a day). Lacosamide's row is 25% off "the maximum
// dosage" and topiramate's is one-half of "the usual adult dose": both need the reader's figure, since
// the rows give no milligrams. Not exported.
const DAILY_MAX = {
  '500 to 1,500 mg every 12 hours': 3000, '500 to 1,000 mg every 12 hours': 2000, '250 to 750 mg every 12 hours': 1500, '250 to 500 mg every 12 hours': 1000,
  'a maintenance dose, and maximum, of 14 mg/day': 14, 'a dosing interval of 12 hours, with a maximum of 200 mg/day': 200, 'a maximum of 50 mg per day': 50,
  'a starting dose of 0.5 mg once daily, titrated as needed to a maximum of 0.5 mg twice daily': 1, 'a maximum of 0.5 mg once daily, if tolerated (end-stage renal disease on hemodialysis)': 0.5,
};
const RELATIVE = { 'a reduction of 25% of the maximum dosage': [0.75, 'the maximum dosage for the indication'], 'one-half of the usual adult dose': [0.5, 'the usual adult dose'] };
function compareDose(r, o) {
  if (!r.valid || r.withheld || blank(o.enteredDose)) return r;
  const f = inputFault([['the daily dose to check', o.enteredDose, 0, 10000, 'mg/day']]);
  if (f) return { valid: false, message: f };
  const dose = Number(o.enteredDose);
  const texts = r.rows || [];
  if (texts.length !== 1) return { ...r, notes: [...r.notes, `The dose entered is not compared: the label gives ${texts.length} rows here.`] };
  const text = texts[0];
  if (/^avoid use/.test(text)) return { ...r, doseCheck: 'label-says-avoid', abnormal: true, notes: [...r.notes, `${dose} mg/day: the label's row here says to avoid use, so no dose is within it.`] };
  let max = DAILY_MAX[text] ?? null; let how = 'the row\'s maximum';
  const lacoHd = r.drug === 'lacosamide' && /reduction of 25% of the maximum dosage/.test(text) ? RELATIVE['a reduction of 25% of the maximum dosage'] : null;
  const rel = RELATIVE[text] || lacoHd;
  if (rel) {
    if (blank(o.referenceDose)) return { ...r, notes: [...r.notes, `The dose entered is not compared: this row is relative to ${rel[1]}, which the label row does not give in milligrams. Enter that figure to compare.`] };
    const g = inputFault([[rel[1], o.referenceDose, 0, 10000, 'mg/day']]);
    if (g) return { valid: false, message: g };
    max = Number((Number(o.referenceDose) * rel[0]).toPrecision(6)); how = `${rel[0] === 0.75 ? '75%' : 'one-half'} of the ${Number(o.referenceDose)} mg/day entered as ${rel[1]}`;
  }
  if (max === null) return { ...r, notes: [...r.notes, 'The dose entered is not compared: this row states no daily maximum in milligrams.'] };
  const over = dose > max + 1e-9;
  return { ...r, doseCheck: over ? 'above-row-maximum' : 'within-row-maximum', rowMaximumMgPerDay: max, abnormal: r.abnormal || over, notes: [...r.notes, `${dose} mg/day is ${over ? 'above' : 'within'} ${how}, ${max} mg/day.`] };
}

// Levetiracetam: the label's own first step is to adjust the clearance for body surface area.
export function cnsRenalDoseCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  return compareDose(rowAnswer(o, now, table), o);
}
function rowAnswer(o, now, table) {
  const cfg = { regimens: REGIMENS, labels: LABELS, note: NOTE, notesFor };
  if (String(o.regimen ?? '').trim() !== 'levetiracetam' || String(o.dialysis ?? '').trim() !== 'none') return bandToolAnswer(cfg, o, now, table);
  const f = inputFault([['the creatinine clearance', o.kidney, 0, 250, 'mL/min'], ['the body surface area', o.bsa, 0.3, 4, 'm²']]);
  if (f) return { valid: false, message: `${f} The Keppra label's table is by creatinine clearance adjusted for body surface area.` };
  const adjusted = Number(((Number(o.kidney) * 1.73) / Number(o.bsa)).toPrecision(4));
  const r = bandToolAnswer(cfg, { ...o, kidney: adjusted }, now, table);
  if (!r.valid || r.withheld) return r;
  return { ...r, adjustedClearance: adjusted, notes: [`The label's adjustment for body surface area: ${Number(o.kidney)} mL/min × 1.73 ÷ ${Number(o.bsa)} m² = ${adjusted} mL/min/1.73 m².`, ...r.notes] };
}
