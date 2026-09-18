// spec-v1400: latent TB infection treatment regimens and doses.
//
// Sources:
//   Sterling TR, Njie G, Zenner D, et al. Guidelines for the Treatment of Latent Tuberculosis
//     Infection: Recommendations from the National Tuberculosis Controllers Association and CDC,
//     2020. MMWR Recomm Rep. 2020;69(1):1-11. PMID 32053584.
//   CDC. Treatment Regimens for Latent TB Infection.
//     https://www.cdc.gov/tb/hcp/treatment/latent-tuberculosis-infection.html
//
//   3HP  once weekly x 12 doses. Isoniazid 15 mg/kg (12 and older) or 25 mg/kg (2 to 11), rounded
//        up to the nearest 50 or 100 mg, 900 mg maximum. Rifapentine by weight band: 10-14.0 kg
//        300 mg, 14.1-25.0 450, 25.1-32.0 600, 32.1-49.9 750, 50 or more 900 mg maximum.
//        Not recommended under 2 years, or in pregnancy or when pregnancy is expected during it.
//   4R   daily x 120 doses. Rifampin 10 mg/kg adults, 15-20 mg/kg children, 600 mg maximum.
//   3HR  daily x 90 doses. Isoniazid 5 mg/kg adults (10-20 children), 300 mg maximum; rifampin
//        10 mg/kg adults (15-20 children), 600 mg maximum.
//   6H / 9H  isoniazid daily 5 mg/kg adults (10-20 children), 300 mg maximum; or twice weekly
//        15 mg/kg adults (20-40 children), 900 mg maximum. 6H: 180 daily or 52 twice-weekly doses;
//        9H: 270 or 76.
//
// THE READING THIS TILE PREVENTS: nine months of isoniazid by default. The short rifamycin
// regimens (3HP, 4R, 3HR) are preferred for their completion rates and lower hepatotoxicity.
//
// The CDC table gives adult and child doses without an age cut. This tile uses the adult dose from
// 18, the child dose under 12, and prints BOTH for 12 to 17 rather than inventing a cut (3HP has its
// own published cut at 12, which it uses).
//
// Rifamycin interactions (antiretrovirals, hormonal contraception, and many others) are FLAGGED,
// not resolved: run an interaction check.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const LTBI_NOTE = 'NTCA/CDC 2020 latent TB infection treatment. Preferred: 3HP (isoniazid and rifapentine once weekly for 12 doses), 4R (rifampin daily for 4 months), or 3HR (isoniazid and rifampin daily for 3 months). Alternative: 6 or 9 months of isoniazid. Exclude active TB disease before starting. Rifamycins interact with many drugs, including antiretrovirals and hormonal contraceptives. Doses are per CDC\'s regimen table, with the maxima applied. It calculates doses and is not a prescription.';

export const REGIMENS = [
  { value: '3HP', text: '3HP: isoniazid + rifapentine, weekly x 12' },
  { value: '4R', text: '4R: rifampin, daily x 4 months' },
  { value: '3HR', text: '3HR: isoniazid + rifampin, daily x 3 months' },
  { value: '6H', text: '6H: isoniazid, 6 months (alternative)' },
  { value: '9H', text: '9H: isoniazid, 9 months (alternative)' },
];
export const H_FREQUENCY = [
  { value: 'daily', text: 'Daily' },
  { value: 'twice-weekly', text: 'Twice weekly (directly observed)' },
];
export const HIV_STATUS = [
  { value: 'negative', text: 'HIV negative' },
  { value: 'hiv-no-art', text: 'HIV, not on antiretrovirals' },
  { value: 'hiv-art', text: 'HIV, on antiretrovirals' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function mg(n) {
  return `${Math.round(n)} mg`;
}
function capped(perKg, weight, max) {
  const raw = perKg * weight;
  return raw > max ? { dose: max, capped: true } : { dose: raw, capped: false };
}
function range(lo, hi, weight, max) {
  const a = Math.min(lo * weight, max);
  const b = Math.min(hi * weight, max);
  return a === b ? `${mg(a)} (maximum)` : `${mg(a)} to ${mg(b)} (${lo}-${hi} mg/kg${hi * weight > max ? `, ${max} mg maximum` : ''})`;
}
function single(perKg, weight, max) {
  const c = capped(perKg, weight, max);
  return `${mg(c.dose)} (${perKg} mg/kg${c.capped ? `, capped at the ${max} mg maximum` : ''})`;
}

export function rifapentineDose(weightKg) {
  if (weightKg < 10) return null;
  if (weightKg <= 14.0) return 300;
  if (weightKg <= 25.0) return 450;
  if (weightKg <= 32.0) return 600;
  if (weightKg < 50.0) return 750;
  return 900;
}
export function isoniazid3hpDose(weightKg, ageYears) {
  const perKg = ageYears >= 12 ? 15 : 25;
  const up = Math.ceil((perKg * weightKg) / 50) * 50;
  return { perKg, dose: Math.min(up, 900), capped: up > 900 };
}

export function ltbiRegimenDosing(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const fault = inputFault([
    ['the weight', o.weightKg, 2, 250, 'kg'],
    ['the age', o.ageYears, 0, 120, 'years'],
  ]);
  if (fault) return { valid: false, message: fault };
  if (isBlank(o.regimen) || !REGIMENS.some((r) => r.value === o.regimen)) {
    return { valid: false, message: 'Choose a regimen: 3HP, 4R, 3HR, 6H, or 9H.' };
  }
  if (isBlank(o.pregnant)) {
    return { valid: false, message: 'Answer whether the patient is pregnant or expects to become pregnant during treatment. 3HP is not recommended then.' };
  }
  if (isBlank(o.hiv)) {
    return { valid: false, message: 'Choose the HIV status. Rifamycin regimens interact with many antiretrovirals.' };
  }

  const w = Number(String(o.weightKg).trim());
  const age = Number(String(o.ageYears).trim());
  const regimen = o.regimen;
  const rifamycin = regimen === '3HP' || regimen === '4R' || regimen === '3HR';
  const band = age >= 18 ? 'adult' : (age < 12 ? 'child' : 'both');

  const cautions = [];
  let lines = [];
  let schedule = '';
  let notRecommended = null;

  if (regimen === '3HP') {
    schedule = 'Once weekly for 12 doses (3 months).';
    if (age < 2) notRecommended = '3HP is not recommended for children younger than 2 years. Choose 4R, 3HR, or isoniazid.';
    else if (o.pregnant === 'yes') notRecommended = '3HP is not recommended in pregnancy or when pregnancy is expected during the 3 months. Choose another regimen.';
    const rpt = rifapentineDose(w);
    if (rpt === null && !notRecommended) notRecommended = 'Rifapentine has no weight band below 10 kg. Choose another regimen.';
    if (!notRecommended) {
      const inh = isoniazid3hpDose(w, age);
      lines = [
        `Isoniazid ${inh.dose} mg once weekly (${inh.perKg} mg/kg at ${w} kg, rounded up to the nearest 50 mg${inh.capped ? ', capped at the 900 mg maximum' : ''}).`,
        `Rifapentine ${rpt} mg once weekly (weight band${rpt === 900 ? ', the 900 mg maximum' : ''}).`,
      ];
    }
  } else if (regimen === '4R') {
    schedule = 'Daily for 120 doses (4 months).';
    if (band === 'adult') lines = [`Rifampin ${single(10, w, 600)} daily.`];
    else if (band === 'child') lines = [`Rifampin ${range(15, 20, w, 600)} daily.`];
    else lines = [`Rifampin, adult dose: ${single(10, w, 600)} daily.`, `Rifampin, child dose: ${range(15, 20, w, 600)} daily.`];
  } else if (regimen === '3HR') {
    schedule = 'Daily for 90 doses (3 months).';
    const adult = [`Isoniazid ${single(5, w, 300)} daily.`, `Rifampin ${single(10, w, 600)} daily.`];
    const child = [`Isoniazid ${range(10, 20, w, 300)} daily.`, `Rifampin ${range(15, 20, w, 600)} daily.`];
    if (band === 'adult') lines = adult;
    else if (band === 'child') lines = child;
    else lines = [...adult.map((l) => 'Adult dose: ' + l), ...child.map((l) => 'Child dose: ' + l)];
  } else {
    if (isBlank(o.frequency)) return { valid: false, message: 'Choose daily or twice-weekly isoniazid. The dose and the number of doses differ.' };
    const twice = o.frequency === 'twice-weekly';
    const months = regimen === '6H' ? 6 : 9;
    const count = regimen === '6H' ? (twice ? 52 : 180) : (twice ? 76 : 270);
    schedule = `${twice ? 'Twice weekly, directly observed' : 'Daily'} for ${count} doses (${months} months).`;
    const adult = twice ? `Isoniazid ${single(15, w, 900)} twice weekly.` : `Isoniazid ${single(5, w, 300)} daily.`;
    const child = twice ? `Isoniazid ${range(20, 40, w, 900)} twice weekly.` : `Isoniazid ${range(10, 20, w, 300)} daily.`;
    if (band === 'adult') lines = [adult];
    else if (band === 'child') lines = [child];
    else lines = ['Adult dose: ' + adult, 'Child dose: ' + child];
    cautions.push('Isoniazid-only regimens are the alternative, not the preference: the shorter rifamycin regimens (3HP, 4R, 3HR) have higher completion and less hepatotoxicity.');
  }

  if (rifamycin) {
    if (o.hiv === 'hiv-art') cautions.push('On antiretrovirals: rifamycins interact with many of them. 3HP is acceptable only with antiretrovirals that have no clinically significant interaction with rifapentine. Run an interaction check before starting.');
    cautions.push('Rifamycins lower the effect of hormonal contraceptives and many other drugs (for example warfarin, some anticonvulsants, and methadone). Flagged, not resolved: run an interaction check.');
  }
  if (o.hiv === 'hiv-no-art' && regimen === '4R') cautions.push('CDC lists 4R for people without HIV; with HIV, discuss the regimen with an HIV or TB specialist.');
  if (band === 'both' && regimen !== '3HP') cautions.push('The CDC table gives adult and child doses without an age cut, so both are shown for ages 12 to 17.');

  return {
    valid: true,
    regimen,
    recommended: notRecommended === null,
    abnormal: notRecommended !== null,
    bandLabel: notRecommended ? `${regimen} not recommended here` : `${regimen} dosing`,
    band: notRecommended || `${REGIMENS.find((r) => r.value === regimen).text}. ${schedule}`,
    doses: lines,
    cautions,
    activeTbNote: 'Exclude active TB disease before starting treatment for latent infection.',
    postureNote: 'Decision support, not a prescription. Check the doses against the current CDC table and the patient\'s other medicines.',
    note: LTBI_NOTE,
  };
}
