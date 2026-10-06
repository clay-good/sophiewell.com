// spec-v1546 tool 3: IMCI pre-referral injections and rectal diazepam for children 2-59 months (WHO).
//
// Source: WHO. IMCI chart booklet, March 2014, p. 17 "Give these treatments in the clinic only" (all rights
// reserved; page image read October 6, 2026, facts restated):
//   - Ampicillin 50 mg/kg (500 mg vial with 2.1 mL sterile water = 500 mg/2.5 mL) and gentamicin 7.5 mg/kg once
//     daily (2 mL vial, 40 mg/mL), IM, for urgent referral: 2-<4 months / 4-<6 kg 1 mL and 0.5-1.0 mL; 4-<12
//     months / 6-<10 kg 2 mL and 1.1-1.8 mL; 12 months-<3 years / 10-<14 kg 3 mL and 1.9-2.7 mL; 3-<5 years /
//     14-19 kg 5 mL and 2.8-3.5 mL. Where referral is impossible or delayed, ampicillin is given again 6-hourly;
//     with a strong suspicion of meningitis its dose may be raised fourfold.
//   - IM quinine (salt) 150 mg/mL or 300 mg/mL: 2-<4 months / 4-<6 kg 0.4 or 0.2 mL; 4-<12 months / 6-<10 kg
//     0.6 or 0.3; 12 months-<2 years / 10-<12 kg 0.8 or 0.4; 2-<3 years / 12-<14 kg 1.0 or 0.5; 3-<5 years /
//     14-19 kg 1.2 or 0.6. Keep the child lying down for an hour; if referral is impossible, repeat at 4 and
//     8 hours, then every 12 hours; no quinine under 4 months where malaria risk is low.
//   - Diazepam 0.5 mg/kg rectally (10 mg/2 mL injection solution, without a needle): 2-<6 months / 5-7 kg
//     0.5 mL; 6-<12 months / 7-<10 kg 1.0 mL; 12 months-<3 years / 10-<14 kg 1.5 mL; 3-<5 years / 14-19 kg
//     2.0 mL; repeat after 10 minutes if convulsions continue.
//
// Stated rather than hidden: the spec read the quinine table as age-only, but the chart prints weight bands
// too, and they are used. Artesunate (IM and rectal), which WHO 2026 prefers, has its own tiles. With a
// weight, the exact mg/kg volume prints beside the band.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DRUG_OPTIONS = [
  { value: 'ampicillin', text: 'Ampicillin IM (500 mg in 2.5 mL)' },
  { value: 'gentamicin', text: 'Gentamicin IM (40 mg/mL)' },
  { value: 'quinine150', text: 'Quinine IM, 150 mg/mL' },
  { value: 'quinine300', text: 'Quinine IM, 300 mg/mL' },
  { value: 'diazepam', text: 'Diazepam rectal (10 mg in 2 mL)' },
];

const NOTE = 'This follows the WHO IMCI chart booklet (2014), p. 17, for children 2 months up to 5 years being referred. Give the first dose and refer urgently.';
const r1 = (x) => Math.round(x * 100) / 100;

function band(kg, months, cuts, ageCuts) {
  if (kg !== null) {
    if (kg < cuts[0] || kg > 19) return -1;
    let i = 0;
    for (let k = 1; k < cuts.length; k++) if (kg >= cuts[k]) i = k;
    return i;
  }
  if (months < 2 || months >= 60) return -1;
  let i = 0;
  for (let k = 0; k < ageCuts.length; k++) if (months >= ageCuts[k]) i = k + 1;
  return i;
}

export function imciPrereferralInjectables(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const d = DRUG_OPTIONS.find((x) => x.value === o.drug);
  if (!d) return { valid: false, message: 'Choose the drug.' };
  let kg = null;
  let months = null;
  if (String(o.weight ?? '').trim() !== '') { const f = inputFault([['the weight', o.weight, 1, 60, 'kg']]); if (f) return { valid: false, message: f }; kg = Number(o.weight); }
  if (String(o.age ?? '').trim() !== '') { const f = inputFault([['the age', o.age, 0, 120, 'months']]); if (f) return { valid: false, message: f }; months = Number(o.age); }
  if (kg === null && months === null) return { valid: false, message: 'Enter the weight (preferred) or the age in months.' };
  const notes = [];
  if (kg === null) notes.push('Weight: not entered, so the age band is used (the chart prefers weight).');
  const out = (band_, label) => ({ valid: true, band: band_, bandLabel: label, abnormal: true, notes, note: NOTE });
  const outside = { valid: false, message: kg !== null ? 'This weight is outside the chart (4 to 19 kg; 5 to 19 kg for diazepam).' : 'Enter an age from 2 up to 59 months.' };

  if (d.value === 'ampicillin' || d.value === 'gentamicin') {
    const i = band(kg, months, [4, 6, 10, 14], [4, 12, 36]);
    if (i < 0) return outside;
    if (d.value === 'ampicillin') {
      const v = [1, 2, 3, 5][i];
      if (kg !== null) notes.push(`Exactly 50 mg/kg at ${kg} kg is ${Math.round(50 * kg)} mg = ${r1((50 * kg) / 200)} mL.`);
      notes.push('Where referral is impossible or delayed, give ampicillin again every 6 hours; with a strong suspicion of meningitis the dose may be raised fourfold.');
      return out(`Ampicillin ${v} mL IM (500 mg vial with 2.1 mL sterile water = 500 mg in 2.5 mL), with gentamicin.`, `${v} mL`);
    }
    const v = ['0.5-1.0', '1.1-1.8', '1.9-2.7', '2.8-3.5'][i];
    if (kg !== null) notes.push(`Exactly 7.5 mg/kg at ${kg} kg is ${r1(7.5 * kg)} mg = ${r1((7.5 * kg) / 40)} mL.`);
    notes.push('Gentamicin is once daily.');
    return out(`Gentamicin ${v} mL IM (40 mg/mL), with ampicillin.`, `${v} mL`);
  }
  if (d.value.startsWith('quinine')) {
    const i = band(kg, months, [4, 6, 10, 12, 14], [4, 12, 24, 36]);
    if (i < 0) return outside;
    const strong = d.value === 'quinine300';
    const v = (strong ? [0.2, 0.3, 0.4, 0.5, 0.6] : [0.4, 0.6, 0.8, 1.0, 1.2])[i];
    if (kg !== null) notes.push(`Exactly 10 mg/kg (salt) at ${kg} kg is ${Math.round(10 * kg)} mg = ${r1((10 * kg) / (strong ? 300 : 150))} mL.`);
    notes.push('Keep the child lying down for an hour. If referral is impossible, repeat at 4 and 8 hours, then every 12 hours until oral treatment is possible. No quinine under 4 months where malaria risk is low.');
    notes.push('WHO\'s 2026 malaria guidelines prefer artesunate (IM, or rectal before referral): see those tiles.');
    return out(`Quinine ${v.toFixed(1)} mL IM (${strong ? '300' : '150'} mg/mL quinine salt), first dose, then refer urgently.`, `${v.toFixed(1)} mL`);
  }
  // Diazepam.
  const i = band(kg, months, [5, 7, 10, 14], [6, 12, 36]);
  if (i < 0) return outside;
  const v = [0.5, 1.0, 1.5, 2.0][i];
  if (kg !== null) notes.push(`Exactly 0.5 mg/kg at ${kg} kg is ${r1(0.5 * kg)} mg = ${r1((0.5 * kg) / 5)} mL.`);
  notes.push('Turn the child on the side and clear the airway; give oxygen; check for low blood sugar. Repeat after 10 minutes if convulsions have not stopped.');
  return out(`Diazepam ${v.toFixed(1)} mL rectally (10 mg/2 mL injection solution, from a syringe without a needle).`, `${v.toFixed(1)} mL`);
}
