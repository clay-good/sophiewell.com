// spec-v794: Furst formula, the urine-to-plasma electrolyte ratio.
//
// Sources:
//   Furst H, Hallows KR, Post J, et al. The urine/plasma electrolyte ratio: a predictive
//   guide to water restriction. Am J Med Sci. 2000;319(4):240-244. (PMID 10768609.)
//   Bands per Grant P, Ayuk J, Bouloux PM, et al. The diagnosis and management of
//   inpatient hyponatraemia and SIADH. Eur J Clin Invest. 2015;45(8):888-894.
//
//   U/P electrolyte ratio = (urine Na + urine K) / serum Na, all in mmol/L
//
// The ratio says how much of the urine is electrolyte-free water. Restricting intake below
// what the kidney clears as electrolyte-free water is what raises the serum sodium, so the
// ratio predicts whether fluid restriction can work at all:
//
//   under 0.5      restrict to 1000 mL/day
//   0.5 to 1.0     restrict to 500 mL/day
//   above 1.0      no electrolyte-free water is being excreted; restriction alone is
//                  unlikely to help, however severe
//
// Above 1.0 the kidney is generating free water, so every void makes the hyponatremia
// worse - which is why a tighter restriction is not the answer there.
//
// Pure: no DOM, no clock, no network.

import { dpSafe } from './cut-display.js';

export const FURST_NOTE = 'The Furst formula (Furst H, Hallows KR, Post J, et al, Am J Med Sci 2000;319(4):240-244) divides the urine sodium plus the urine potassium by the serum sodium, all in millimoles per liter, and the answer says how much of the urine is electrolyte-free water. That matters because fluid restriction only raises the serum sodium when intake is held below what the kidney clears as electrolyte-free water. Under 0.5 a restriction of 1000 milliliters a day is the published starting point, between 0.5 and 1.0 it is 500 milliliters a day, and above 1.0 no electrolyte-free water is being excreted at all, so restriction alone is unlikely to help however tight it is made. Above 1.0 the kidney is generating free water, so each void makes the sodium lower rather than higher, which is exactly why tightening the restriction is not the answer. The ratio guides how to restrict, and it is not a diagnosis of the cause of hyponatremia, nor a correction-rate plan, nor a reason to delay treating a patient who is symptomatic.';

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

const FIELDS = [
  { arg: 'urineSodium', min: 0, max: 400, name: 'urine sodium' },
  { arg: 'urinePotassium', min: 0, max: 400, name: 'urine potassium' },
  { arg: 'serumSodium', min: 80, max: 200, name: 'serum sodium' },
];

export function furstRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const v = {};
  for (const f of FIELDS) {
    const parsed = optNum(o[f.arg], f.min, f.max);
    if (parsed === undefined) {
      return { valid: false, code: 'INVALID_INPUT', field: f.arg, message: `Enter a ${f.name} between ${f.min} and ${f.max} mmol/L.`, note: FURST_NOTE };
    }
    if (parsed === null) {
      return { valid: false, code: 'MISSING_INPUT', field: f.arg, message: `Enter the ${f.name} in mmol/L.`, note: FURST_NOTE };
    }
    v[f.arg] = parsed;
  }

  // Decided on the unrounded ratio; three decimals, or more where three would print it across 1 or 0.5.
  const ratioRaw = (v.urineSodium + v.urinePotassium) / v.serumSodium;
  const ratio = dpSafe(ratioRaw, [0.5, 1], 3);
  // Printed to two decimals, or more where two would put it on the other side of 0.5 or 1.
  const shown = dpSafe(ratioRaw, [0.5, 1], 2);
  const shownText = shown === Math.round(ratioRaw * 100) / 100 ? ratioRaw.toFixed(2) : String(shown);

  let tier, advice;
  if (ratioRaw > 1) {
    tier = 'restriction-unlikely';
    advice = 'No electrolyte-free water is being excreted. Fluid restriction alone is unlikely to help, however tight.';
  } else if (ratioRaw >= 0.5) {
    tier = 'restrict-500';
    advice = 'Published starting point: fluid restriction of 500 mL/day.';
  } else {
    tier = 'restrict-1000';
    advice = 'Published starting point: fluid restriction of 1000 mL/day.';
  }

  return {
    valid: true,
    ratio,
    tier,
    advice,
    // Above 1.0 is the state that changes the plan rather than tightening it.
    abnormal: ratio > 1,
    bandLabel: `Furst ratio ${shownText}`,
    band: `Furst U/P electrolyte ratio ${shownText} — ${advice}`,
    detail: `(urine Na ${v.urineSodium} + urine K ${v.urinePotassium}) / serum Na ${v.serumSodium} = ${shownText}. Bands: under 0.5 restrict to 1000 mL/day; 0.5 to 1.0 restrict to 500 mL/day; above 1.0 restriction alone is unlikely to help, because the kidney is generating free water and each void lowers the sodium further.`,
    note: FURST_NOTE,
  };
}
