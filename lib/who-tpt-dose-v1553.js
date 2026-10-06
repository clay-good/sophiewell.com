// spec-v1553 tool 4: WHO TB preventive treatment (TPT) tablets per dose by weight band, for the chosen
// regimen, with its schedule and antiretroviral interactions.
//
// Source: WHO. Operational handbook on tuberculosis, Module 1: prevention: TB preventive treatment, 2nd ed.,
// 2024 (IRIS 10665/378535; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026:
//   - Table 3 (pp. 42-44, page image read): doses per regimen (6H 182, 3HP 12 weekly, 3HR 84, 4R 120, 1HP 28,
//     6Lfx 182); children (1HP from 13 years; 4R has no child formulation, not generally feasible under 25
//     kg); interactions with ART (3HP and 1HP: contraindicated with all protease inhibitors, nevirapine,
//     doravirine, etravirine and TAF; 3HR: contraindicated with protease inhibitors, nevirapine, doravirine,
//     etravirine, TAF with caution, dolutegravir and raltegravir dose-adjusted; 4R: as 3HR but TAF
//     contraindicated; 6H no restriction; 6Lfx no restriction, may interfere with lamivudine clearance).
//   - Table 4 (pp. 46-47) as corrected by the erratum (row 5 of part 2, the 300/300 FDC), every cell encoded
//     as printed. Part 1 (6H/9H, 4R, 3HR) uses 4-7.9 ... 65+ kg; part 2 (3HP, 1HP, 6Lfx) 3-5.9 ... 50+ kg
//     with age splits at 3 and 6 months. Footnotes: isoniazid 100 mg dispersible at 10 mg/mL, rifapentine
//     150 mg dispersible at 15 mg/mL; the 300/300 FDC under 50 kg needs close monitoring for isoniazid
//     toxicity. Section 5.2: a specialist doses infants of 3 kg or less.
//
// Stated rather than hidden: Table 4 prints the 6H 4-7.9 kg isoniazid 100 mg cell as "0.5 (0.5 mL)", but
// half a tablet at 10 mg/mL is 5 mL, so that cell is printed in tablets only (p. 46). The spec omitted TAF
// from 4R's contraindications; Table 3 lists it.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const REGIMEN_OPTIONS = [
  { value: '3HP', text: '3HP: weekly rifapentine + isoniazid, 3 months' },
  { value: '3HR', text: '3HR: daily rifampicin + isoniazid, 3 months' },
  { value: '6H', text: '6H: daily isoniazid, 6 months' },
  { value: '9H', text: '9H: daily isoniazid, 9 months' },
  { value: '4R', text: '4R: daily rifampicin, 4 months' },
  { value: '1HP', text: '1HP: daily rifapentine + isoniazid, 1 month (13 years or older)' },
  { value: '6Lfx', text: '6Lfx: daily levofloxacin, 6 months (contacts of MDR/RR-TB)' },
];

const n = null;
// Part 1 bands (lower bounds, kg): 4, 8, 12, 16, 25, 30, 35, 50, 65.
const P1 = [4, 8, 12, 16, 25, 30, 35, 50, 65];
const P1_LABEL = ['4-7.9 kg', '8-11.9 kg', '12-15.9 kg', '16-24.9 kg', '25-29.9 kg', '30-34.9 kg', '35-49.9 kg', '50-64.9 kg', '65 kg or more'];
// Part 2 bands: 0 3-5.9 <3 mo, 1 3-5.9 >=3 mo, 2 6-9.9 <6 mo, 3 6-9.9 >=6 mo, 4 10-14.9, 5 15-19.9, 6 20-24.9,
// 7 25-29.9, 8 30-34.9, 9 35-39.9, 10 40-44.9, 11 45-49.9, 12 50+.
const P2_LABEL = ['3-5.9 kg, under 3 months', '3-5.9 kg, 3 months or older', '6-9.9 kg, under 6 months', '6-9.9 kg, 6 months or older', '10-14.9 kg', '15-19.9 kg', '20-24.9 kg', '25-29.9 kg', '30-34.9 kg', '35-39.9 kg', '40-44.9 kg', '45-49.9 kg', '50 kg or more'];

const H100P1 = ['isoniazid 100 mg dispersible', [0.5, 1, 1.5, 2, n, n, n, n, n]];
const H300P1 = ['isoniazid 300 mg tablet', [n, n, n, n, 0.5, 1, 1, 1, 1.25]];
const R150 = ['rifampicin 150 mg capsule', [n, n, n, n, 2, 3, 4, 4, 5]];
const R300 = ['rifampicin 300 mg capsule', [n, n, n, n, 1, 1.5, 2, 2, 2.5]];
const RH75 = ['rifampicin/isoniazid 75/50 mg dispersible FDC', [1, 2, 3, 4, n, n, n, n, n]];
const RH150 = ['rifampicin/isoniazid 150/75 mg FDC tablet', [n, n, n, n, 2, 3, 4, 4, 5]];
const H100P2 = ['isoniazid 100 mg dispersible', [0.6, 0.7, 1, 1.5, 2.5, 3, 4.5, 4.5, 6, 6, 7.5, 7.5, 9]];
const H300P2 = ['isoniazid 300 mg tablet', [n, n, n, n, n, 1, 1.5, 1.5, 2, 2, 2.5, 2.5, 3]];
const P150 = ['rifapentine 150 mg dispersible', [0.5, 0.7, 1.5, 1.5, 2, 3, 4, 4, 5, 6, 6, 6, 6]];
const P300 = ['rifapentine 300 mg tablet', [n, n, n, n, n, 1.5, 2, 2, 2.5, 3, 3, 3, 3]];
const HPFDC = ['rifapentine/isoniazid 300/300 mg FDC tablet', [n, n, n, n, n, 1, 1.5, 2, 2.5, 3, 3, 3, 3]];
const H300_1HP = ['isoniazid 300 mg tablet', [n, n, n, n, n, n, n, 1, 1, 1, 1, 1, 1]];
const P300_1HP = ['rifapentine 300 mg tablet', [n, n, n, n, n, n, n, 2, 2, 2, 2, 2, 2]];
const L100 = ['levofloxacin 100 mg dispersible', [0.5, 1, 1, 1.5, 2, 2.5, 3, 3.5, n, n, n, n, n]];
const L250 = ['levofloxacin 250 mg tablet', [0.25, 0.5, 0.5, 1, 1, 1.5, 1.5, 2, 2, 2, 2, 2, 3]];
const L500 = ['levofloxacin 500 mg tablet', [n, n, n, n, n, n, n, 1, 1, 1, 1, 1, 1.5]];

// Each regimen: its part, and its options (each option a list of rows given together).
const REG = {
  '6H': { part: 1, schedule: 'daily for 6 months (182 doses)', options: [[H100P1], [H300P1]] },
  '9H': { part: 1, schedule: 'daily for 9 months', options: [[H100P1], [H300P1]] },
  '4R': { part: 1, schedule: 'daily for 4 months (120 doses)', options: [[R150], [R300]] },
  '3HR': { part: 1, schedule: 'daily for 3 months (84 doses)', options: [[RH75], [RH150], [H300P1, R300]] },
  '3HP': { part: 2, schedule: 'once a week for 3 months (12 doses)', options: [[H100P2, P150], [H300P2, P300], [HPFDC]] },
  '1HP': { part: 2, schedule: 'daily for 1 month (28 doses)', options: [[H300_1HP, P300_1HP]] },
  '6Lfx': { part: 2, schedule: 'daily for 6 months (182 doses)', options: [[L100], [L250], [L500]] },
};
const ART = {
  '6H': 'No restriction with antiretrovirals.',
  '9H': 'No restriction with antiretrovirals.',
  '3HP': 'Antiretrovirals: not with any protease inhibitor, nevirapine, doravirine, etravirine or tenofovir alafenamide (TAF); TDF, efavirenz, dolutegravir and raltegravir can be used.',
  '1HP': 'Antiretrovirals: not with any protease inhibitor, nevirapine, doravirine, etravirine or TAF; TDF, efavirenz, dolutegravir and raltegravir can be used.',
  '3HR': 'Antiretrovirals: not with any protease inhibitor, nevirapine, doravirine or etravirine; TAF with caution; adjust the dolutegravir or raltegravir dose; TDF and efavirenz can be used.',
  '4R': 'Antiretrovirals: not with any protease inhibitor, nevirapine, doravirine, etravirine or TAF; adjust the dolutegravir or raltegravir dose; TDF and efavirenz can be used.',
  '6Lfx': 'No restriction with antiretrovirals (levofloxacin may interfere with lamivudine clearance).',
};
// Printed suspension volumes (part 2 only; footnotes a and d).
const ML = { 'isoniazid 100 mg dispersible': { 0: '6 mL', 1: '7 mL' }, 'rifapentine 150 mg dispersible': { 0: '5 mL', 1: '7 mL' } };

function band(part, kg, months) {
  if (part === 1) {
    let i = -1;
    for (let k = 0; k < P1.length; k++) if (kg >= P1[k]) i = k;
    return i;
  }
  if (kg < 3) return -1;
  if (kg < 6) return months < 3 ? 0 : 1;
  if (kg < 10) return months < 6 ? 2 : 3;
  const lows = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  let i = 4;
  for (let k = 0; k < lows.length; k++) if (kg >= lows[k]) i = 4 + k;
  return i;
}

const tabs = (x, name) => `${x} ${/capsule/.test(name) ? 'capsule' : 'tablet'}${x === 1 ? '' : 's'}`;

export function whoTptDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = REGIMEN_OPTIONS.find((x) => x.value === o.regimen);
  if (!reg) return { valid: false, message: 'Choose the TPT regimen: 3HP, 3HR, 6H, 9H, 4R, 1HP or 6Lfx.' };
  const f = inputFault([['the weight', o.weight, 1, 250, 'kg'], ['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight);
  const years = Number(o.age);
  const months = years * 12;
  const R = REG[reg.value];
  const note = 'This follows WHO\'s 2024 TPT operational handbook, Tables 3 and 4. Exclude TB disease before starting; your national program may differ.';
  const out = (b, label, notes, abnormal = false) => ({ valid: true, band: b, bandLabel: label, abnormal, notes, note });

  if (kg <= 3) return out('Infants of 3 kg or less: consult a specialist for TPT dosing (WHO gives no weight band).', 'Specialist', [], true);
  if (reg.value === '1HP' && years < 13) return out('1HP is only for people 13 years or older: use another regimen (3HP and 3HR are given at all ages).', 'Not under 13 years', [ART['1HP']], true);
  const i = band(R.part, kg, months);
  if (i < 0) return out(`WHO's table for ${reg.value} starts at 4 kg: for ${Math.round(kg * 10) / 10} kg, use 3HP or 6Lfx (from 3 kg) or ask a specialist.`, 'No weight band', [], true);

  const options = R.options.filter((rows) => rows.every(([, cells]) => cells[i] !== null));
  if (!options.length) {
    const why = reg.value === '4R' ? '4R has no child formulation and is not generally feasible under 25 kg' : `the table gives no ${reg.value} dose under 25 kg`;
    return out(`No ${reg.value} dose for ${Math.round(kg * 10) / 10} kg: ${why}. Use another regimen.`, 'No dose at this weight', [ART[reg.value]], true);
  }
  const label = R.part === 1 ? P1_LABEL[i] : P2_LABEL[i];
  const say = (rows) => rows.map(([name, cells]) => {
    const ml = R.part === 2 && ML[name] && ML[name][i] ? ` (${ML[name][i]} of suspension)` : '';
    return `${name.replace(/ (tablet|capsule)$/, '')} ${tabs(cells[i], name)}${ml}`;
  }).join(' + ');
  const notes = [];
  if (options.length > 1) options.slice(1).forEach((rows) => notes.push(`Or: ${say(rows)}.`));
  notes.push(ART[reg.value]);
  if (R.part === 2 && options.some((rows) => rows[0] === HPFDC) && kg < 50) notes.push('On the 300/300 FDC under 50 kg, monitor closely for isoniazid toxicity and add pyridoxine as needed.');
  if (R.part === 1 && i === 0 && (reg.value === '6H' || reg.value === '9H')) notes.push('WHO\'s table prints "0.5 mL" for this cell, but half a 100 mg tablet dispersed at 10 mg/mL is 5 mL; this gives tablets only.');
  if (R.part === 2 && i <= 3) notes.push('Infants in these bands may be malnourished: take particular care to exclude TB disease first.');
  if (reg.value === '6Lfx') notes.push('For contacts of MDR or RR-TB: exclude TB disease carefully first, to protect the fluoroquinolones.');
  return out(`${reg.value}, ${label}: ${say(options[0])}, ${R.schedule}.`, `${reg.value}, ${label}`, notes);
}
