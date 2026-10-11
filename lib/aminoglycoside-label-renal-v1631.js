// spec-v1631 tool 5: conventional (multiple daily dose) aminoglycoside dosing by each drug's label.
//
// Three label rows (spec-v1628 section 1), re-read on October 11, 2026:
//
// Gentamicin Sulfate in 0.9% Sodium Chloride Injection (Baxter, DailyMed version 21), Dosage and
// Administration:
//   "3 mg/kg/day administered in three equal doses every eight hours"; "for patients with
//     life-threatening infections, dosages up to 5 mg/kg/day may be administered in three or four
//     equal doses."
//   "The dosage of aminoglycosides in obese patients should be based on an estimate of the lean body
//     mass" (no number).
//   "The interval between doses (in hours) may be approximated by multiplying the serum creatinine
//     level (mg/100 mL) by 8", example 60 kg, creatinine 2: 60 mg every 16 hours.
//   "After the usual initial dose, a rough guide for determining reduced dosage at eight-hour
//     intervals is to divide the normally recommended dose by the serum creatinine level (Table 4)",
//     example 60 mg / 2 = 30 mg every eight hours. Table 4 is TABLE4 below.
//   Hemodialysis: "The recommended dosage at the end of each dialysis period is 1 to 1.7 mg/kg."
//   "prolonged levels above 12 mcg/mL are avoided"; trough "levels above 2 mcg/mL are avoided."
//
// Tobramycin Injection (Mylan Institutional, version 8), Dosage and Administration and boxed warning:
//   3 mg/kg/day in 3 equal doses; up to 5 mg/kg/day in 3 or 4 equal doses; "dosage should not exceed
//     5 mg/kg/day unless serum levels are monitored."
//   "Following a loading dose of 1 mg/kg ... An alternate rough guide for determining reduced dosage
//     at 8-hour intervals ... is to divide the normally recommended dose by the patient's serum
//     creatinine." The primary reduced-dose method is a nomogram printed as an image; not reproduced.
//   "a dosage frequency in hours ... can be determined by multiplying the patient's serum creatinine
//     by 6." "Neither method should be used when dialysis is being performed."
//   Obesity: "estimated lean body weight plus 40% of the excess."
//   Boxed warning: "Prolonged serum concentrations above 12 mcg/mL should be avoided. Rising trough
//     levels (above 2 mcg/mL) may indicate tissue accumulation."
//
// Amikacin Sulfate Injection (Sagent, version 10), Dosage and Administration:
//   "15 mg/kg/day divided into 2 or 3 equal doses ... 7.5 mg/kg q12h or 5 mg/kg q8h. Treatment of
//     patients in the heavier weight classes should not exceed 1.5 gram/day."
//   Interval = serum creatinine x 9, example creatinine 2: 7.5 mg/kg every 18 hours.
//   A 7.5 mg/kg loading dose, then "divide the normally recommended dose by the patient's serum
//     creatinine" at 12-hour intervals. The clearance-proportional formula is printed as an image;
//     not reproduced. "Neither method should be used when dialysis is being performed."
//   "Peak concentrations (30 to 90 minutes after injection) above 35 micrograms per mL and trough
//     concentrations (just prior to the next dose) above 10 micrograms per mL should be avoided."
//   No rule for obesity.
//
// No label gives a formula for lean body weight, so the reader enters their own estimate; the tool
// never derives one. These are the labels' adult schedules.
//
// Each label's figures answer only while that label stands (lib/label-row.js).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'gentamicin', text: 'Gentamicin' },
  { value: 'tobramycin', text: 'Tobramycin' },
  { value: 'amikacin', text: 'Amikacin' },
];
export const SEVERITIES = [
  { value: 'serious', text: 'Serious infection' },
  { value: 'life', text: 'Life-threatening infection' },
];
export const BASES = [
  { value: 'actual', text: 'Actual body weight' },
  { value: 'lean', text: 'Obese: use my lean weight estimate' },
];
export const LABELS = {
  gentamicin: { setId: '449c9a41-d61e-49fd-b5e3-d76f74b92acf', name: 'Gentamicin', factor: 8, every: 8 },
  tobramycin: { setId: 'ac8134d9-a726-4508-b8b9-a536ef17243d', name: 'Tobramycin', factor: 6, every: 8 },
  amikacin: { setId: 'f260ff2a-76a0-4672-9516-91c344b67890', name: 'Amikacin', factor: 9, every: 12 },
};
// Gentamicin label Table 4: [highest serum creatinine of the band (mg/dL), approximate creatinine
// clearance (mL/min/1.73 m2), percent of the usual dose].
export const TABLE4 = [
  [1, '>100', 100], [1.3, '70 to 100', 80], [1.6, '55 to 70', 65], [1.9, '45 to 55', 55],
  [2.2, '40 to 45', 50], [2.5, '35 to 40', 40], [3, '30 to 35', 35], [3.5, '25 to 30', 30],
  [4, '20 to 25', 25], [5.1, '15 to 20', 20], [6.6, '10 to 15', 15], [8, '<10', 10],
];
export const AMIKACIN_DAILY_CAP = 1500;
const LEVELS = {
  gentamicin: 'Label on levels: adjust so that prolonged peaks above 12 mcg/mL and troughs above 2 mcg/mL are avoided.',
  tobramycin: 'Label on levels: prolonged concentrations above 12 mcg/mL should be avoided; rising troughs above 2 mcg/mL may indicate tissue accumulation.',
  amikacin: 'Label on levels: peaks (30 to 90 minutes after injection) above 35 mcg/mL and troughs above 10 mcg/mL should be avoided.',
};
const NOTE = 'These are the labels\' adult schedules, given as guides for when levels cannot be measured, and they assume a stable creatinine. Each label says to measure levels whenever possible. The tool does the label\'s arithmetic; it does not choose the regimen.';

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function aminoglycosideLabelRenal(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = String(o.drug ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(LABELS, drug)) return { valid: false, message: 'Choose the drug: gentamicin, tobramycin or amikacin.' };
  const L = LABELS[drug];
  const severity = String(o.severity ?? '').trim();
  if (drug !== 'amikacin' && severity !== 'serious' && severity !== 'life') return { valid: false, message: 'Choose the severity: the label gives 3 mg/kg/day for a serious infection and up to 5 mg/kg/day for a life-threatening one.' };
  const basis = String(o.basis ?? '').trim();
  if (basis !== 'actual' && basis !== 'lean') return { valid: false, message: 'Choose the weight to dose on: actual body weight, or your lean weight estimate for an obese patient.' };
  const f = inputFault([['the weight', o.weight, 30, 300, 'kg'], ['the serum creatinine', o.creatinine, 0.2, 15, 'mg/dL']]);
  if (f) return { valid: false, message: f };
  const actual = Number(o.weight); const scr = Number(o.creatinine);
  let weight = actual;
  const notes = [];
  if (basis === 'lean') {
    if (drug === 'amikacin') return { valid: false, message: 'The amikacin label gives no rule for obesity, so there is no lean-weight arithmetic to do for it. Choose actual body weight; the label caps the day at 1.5 g.' };
    const lf = inputFault([['the lean weight estimate', o.leanWeight, 30, 300, 'kg']]);
    if (lf) return { valid: false, message: lf };
    const lean = Number(o.leanWeight);
    if (!(lean < actual)) return { valid: false, message: 'The lean weight estimate is not below the actual weight, so there is no excess to adjust for. Choose actual body weight.' };
    if (drug === 'tobramycin') {
      weight = lean + 0.4 * (actual - lean);
      notes.push(`Dosing weight (tobramycin label, lean weight plus 40% of the excess): ${show(lean)} + 0.4 × (${show(actual)} − ${show(lean)}) = ${show(weight)} kg.`);
    } else {
      weight = lean;
      notes.push(`Dosing weight: the ${show(lean)} kg lean estimate. The gentamicin label says to base the dose in obese patients on an estimate of lean body mass and gives no number.`);
    }
    notes.push('The label gives no formula for lean weight; the estimate is yours.');
  }
  const row = labelRow(L.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, dosingWeight: sig(weight), band: `The ${drug} label's dosing figures are withheld, so no dose is worked out.`, bandLabel: 'Withheld', notes: [...notes, `The ${drug} label figures are withheld: ${row.why}.`, 'Work the dose from the label in hand.'], note: NOTE };
  }

  // The usual single dose the adjusted regimens start from.
  let single; let daily; let usual; let capped = false;
  if (drug === 'amikacin') {
    daily = 15 * weight;
    if (daily > AMIKACIN_DAILY_CAP) { daily = AMIKACIN_DAILY_CAP; capped = true; }
    single = daily / 2;
    usual = `${show(daily / 2)} mg every 12 hours or ${show(daily / 3)} mg every 8 hours (${capped ? 'the label\'s 1.5 g/day ceiling' : '15 mg/kg/day'})`;
    notes.push(`Usual dose, normal renal function: 15 mg/kg/day × ${show(weight)} kg = ${show(15 * weight)} mg/day${capped ? ', above the label\'s 1.5 g/day ceiling for heavier patients, so 1,500 mg/day' : ''}: ${show(daily / 2)} mg every 12 hours or ${show(daily / 3)} mg every 8 hours.`);
    if (severity === 'life') notes.push('The amikacin label gives one daily dose whatever the severity; the severity entered changes nothing here.');
  } else if (severity === 'serious') {
    daily = 3 * weight; single = weight;
    usual = `${show(single)} mg every 8 hours (3 mg/kg/day)`;
    notes.push(`Usual dose, normal renal function, serious infection: 3 mg/kg/day × ${show(weight)} kg = ${show(daily)} mg/day, as ${show(single)} mg every 8 hours.`);
  } else {
    daily = 5 * weight; single = daily / 3;
    usual = `up to ${show(single)} mg every 8 hours (5 mg/kg/day)`;
    notes.push(`Normal renal function, life-threatening infection: up to 5 mg/kg/day × ${show(weight)} kg = ${show(daily)} mg/day, as ${show(daily / 3)} mg every 8 hours or ${show(daily / 4)} mg every 6 hours. The label says to reduce to 3 mg/kg/day as soon as clinically indicated.`);
    if (drug === 'tobramycin') notes.push('The tobramycin label says not to exceed 5 mg/kg/day unless serum levels are monitored.');
  }

  const out = { valid: true, drug, dosingWeight: sig(weight), usualDailyDose: sig(daily), usualSingleDose: sig(single) };
  const interval = scr * L.factor;
  out.prolongedIntervalHours = sig(interval);
  const longer = interval > L.every;
  notes.push(longer
    ? `Impaired renal function, usual dose at a longer interval: creatinine ${show(scr)} × ${L.factor} = every ${show(interval)} hours, ${show(single)} mg each.`
    : `Creatinine ${show(scr)} × ${L.factor} = ${show(interval)} hours, which is not longer than the usual ${L.every}: the label's interval method does not lengthen the interval at this creatinine.`);

  let reduced = null;
  if (scr > 1) {
    reduced = single / scr;
    out.reducedDoseRoughGuide = sig(reduced);
    const load = drug === 'gentamicin' ? 'the usual initial dose' : drug === 'tobramycin' ? `a loading dose of 1 mg/kg (${show(weight)} mg)` : `a loading dose equal to the usual ${show(single)} mg (7.5 mg/kg${capped ? ', held to the ceiling' : ''})`;
    notes.push(`Impaired renal function, reduced dose at the usual interval (the label's rough guide): after ${load}, ${show(single)} mg ÷ ${show(scr)} = ${show(reduced)} mg every ${L.every} hours.`);
  } else {
    notes.push(`The label's rough guide divides the usual dose by the serum creatinine; at ${show(scr)} mg/dL that does not reduce it.`);
  }
  if (drug === 'gentamicin') {
    const key = Math.round(scr * 10) / 10;
    const band = TABLE4.find(([top]) => key <= top);
    if (band) {
      out.table4Percent = band[2];
      out.table4Dose = sig(single * band[2] / 100);
      notes.push(`Label Table 4 at a creatinine of ${show(key)} mg/dL (approximate clearance ${band[1]} mL/min/1.73 m²): ${band[2]}% of the usual dose = ${show(single * band[2] / 100)} mg every 8 hours, after the usual initial dose.`);
    } else {
      notes.push(`A creatinine of ${show(scr)} mg/dL is above the label's Table 4, which stops at 8: the table gives no percentage.`);
    }
    notes.push(`After hemodialysis (label): 1 to 1.7 mg/kg at the end of each dialysis, which is ${show(weight)} to ${show(1.7 * weight)} mg on this weight.`);
  } else {
    notes.push(`The ${drug} label says neither method should be used when dialysis is being performed.${drug === 'tobramycin' ? ' Its main reduced-dose method is a nomogram printed as a picture, which this tool does not reproduce.' : ' Its clearance-proportional formula is printed as a picture, which this tool does not reproduce.'}`);
  }
  notes.push(LEVELS[drug]);
  notes.push(`Label: ${row.edition}.`);
  const adjusted = longer
    ? `${show(single)} mg every ${show(interval)} hours${reduced === null ? '' : `, or ${show(reduced)} mg every ${L.every} hours`}`
    : reduced === null ? 'neither label method changes it at this creatinine' : `${show(reduced)} mg every ${L.every} hours`;
  return {
    ...out,
    band: `${L.name} on ${show(weight)} kg: usual ${usual}. At a creatinine of ${show(scr)} mg/dL: ${adjusted}.`,
    bandLabel: longer ? `Every ${show(interval)} h` : reduced === null ? 'No change' : `${show(reduced)} mg`,
    notes, note: NOTE,
  };
}
