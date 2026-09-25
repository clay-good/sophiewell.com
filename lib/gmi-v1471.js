// spec-v1471: Glucose Management Indicator (GMI) from a CGM mean glucose.
//
// Source, read 2026-09-25: Bergenstal RM, Beck RW, Close KL, et al. Glucose Management Indicator
// (GMI): A New Term for Estimating A1C From Continuous Glucose Monitoring. Diabetes Care
// 2018;41(11):2275-2280, doi:10.2337/dc18-1581 (PMC6196826): "GMI (%) = 3.31 + 0.02392 x [mean
// glucose in mg/dL] or GMI (mmol/mol) = 12.71 + 4.70587 x [mean glucose in mmol/L]." Derived from
// four trials using Dexcom G4 sensors (N = 528). Its Table 1 runs 100 mg/dL -> 5.7% through
// 250 mg/dL -> 9.3%. The paper renamed "estimated A1C" to GMI because the two can differ.
//
// Battelino T et al, Diabetes Care 2019;42(8):1593-1603 (PMC6973648), the international CGM
// consensus, lists GMI among the standard metrics and recommends 14 days of wear with at least 70%
// of data. An updated formula was proposed in 2026 (Diabetologia, PMC13310218); it is named in the
// notes and not implemented.
//
// Each formula is applied in its own unit: % from mg/dL, mmol/mol from mmol/L, with the entered
// value converted by the catalog's glucose factor (lib/unit-convert.js, 18 mg/dL per mmol/L). The
// unit is required: 8 and 150 are both plausible numbers and give different answers, so a blank unit
// is asked for, never read as mg/dL. Pure: no DOM, no clock.

import { inputFault, gradeFault, r1 } from './num.js';
import { labConvert } from './unit-convert.js';

// mg/dL first: the US unit, and the one the page opens on.
export const GMI_UNITS = [
  { value: 'mg/dL', text: 'mg/dL' },
  { value: 'mmol/L', text: 'mmol/L' },
];

const BOUNDS = { 'mg/dL': [40, 600], 'mmol/L': [2.2, 33.3] };
const REC_DAYS = 14;
const REC_ACTIVE = 70;

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
// An optional reading: null when blank or not a number (never zero).
function opt(v) {
  if (blank(v)) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

function sufficiencyNote(days, active) {
  const rec = `the consensus recommends ${REC_DAYS} days with at least ${REC_ACTIVE}% of data`;
  if (days === null && active === null) {
    return `Days of wear and data sufficiency were not entered; ${rec}.`;
  }
  const short = [];
  if (days !== null && days < REC_DAYS) short.push(`${days} days of wear`);
  if (active !== null && active < REC_ACTIVE) short.push(`${active}% of data`);
  const missing = [];
  if (days === null) missing.push('Days of wear were not entered.');
  if (active === null) missing.push('Data sufficiency was not entered.');
  let head;
  if (short.length) head = `The data are below the consensus recommendation: ${short.join(' and ')}, where ${rec}.`;
  else if (days !== null && active !== null) head = `The data entered meet the consensus recommendation of ${REC_DAYS} days with at least ${REC_ACTIVE}% of data.`;
  else if (days !== null) head = `${days} days of wear meets the consensus recommendation of ${REC_DAYS} days.`;
  else head = `${active}% of data meets the consensus recommendation of at least ${REC_ACTIVE}%.`;
  return [head, ...missing].join(' ');
}

export function gmi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (blank(o.mean)) return { valid: false, message: 'Enter the mean glucose from the CGM report.' };
  const unit = GMI_UNITS.some((x) => x.value === o.unit) ? o.unit : null;
  if (!unit) return { valid: false, message: 'Choose the glucose unit: mg/dL or mmol/L.' };
  const [lo, hi] = BOUNDS[unit];
  const fault = inputFault([['the mean glucose', o.mean, lo, hi, unit]])
    || gradeFault([['days of wear', o.days, 1, 90], ['the percent of time the CGM was active', o.active, 1, 100]]);
  if (fault) return { valid: false, message: fault };

  const mean = Number(String(o.mean).trim());
  const mgdl = unit === 'mg/dL' ? mean : labConvert('glucose', mean, 'fromSi');
  const mmol = unit === 'mmol/L' ? mean : labConvert('glucose', mean, 'toSi');
  const gmiPct = r1(3.31 + 0.02392 * mgdl);
  const gmiMmolMol = Math.round(12.71 + 4.70587 * mmol);
  const days = opt(o.days);
  const active = opt(o.active);

  return {
    valid: true,
    abnormal: false,
    gmiPct,
    gmiMmolMol,
    meanMgDl: Math.round(mgdl),
    band: `GMI ${gmiPct.toFixed(1)}% (${gmiMmolMol} mmol/mol) from a mean CGM glucose of ${mean} ${unit}.`,
    bandLabel: `${gmiPct.toFixed(1)}% (${gmiMmolMol} mmol/mol)`,
    notes: [
      'GMI is an estimate of A1C from CGM data, not a laboratory A1C, and the two can differ in the same person.',
      sufficiencyNote(days, active),
      'The formula was derived from four trials using Dexcom G4 sensors in 528 people.',
      'An updated GMI formula was proposed in 2026 because this linear formula aligns less well with HbA1c at low and high values; this result uses the 2018 formula.',
    ],
    note: 'Bergenstal RM et al, Diabetes Care 2018 (GMI); Battelino T et al, Diabetes Care 2019 (CGM consensus).',
  };
}
