// spec-v1473: Glycemia Risk Index (GRI) from continuous glucose monitoring.
//
// Source, read 2026-09-25: Klonoff DC, Wang J, Rodbard D, et al. A Glycemia Risk Index (GRI) of
// Hypoglycemia and Hyperglycemia for Continuous Glucose Monitoring Validated by Clinician Ratings.
// J Diabetes Sci Technol. 2023;17(5):1226-1242. doi:10.1177/19322968221085273 (PMC10563532).
// Bands of CGM time: VLow < 54 mg/dL, Low 54-<70, TIR 70-180, High > 180-250, VHigh > 250 mg/dL.
// "Hypoglycemia Component = VLow + (0.8 x Low)", "Hyperglycemia Component = VHigh + (0.5 x High)",
// "GRI = (3.0 x HypoComponent) + (1.6 x HyperComponent)", equivalently
// "GRI = (3.0 x VLow) + (2.4 x Low) + (1.6 x VHigh) + (0.8 x High)". "If Equation #4 exceeds 100,
// then the GRI is capped at 100." Worked example: VLow 5, Low 10, VHigh 15, High 20 gives
// components 13 and 25 and GRI 79. Derived from 225 tracings ranked by 14 clinicians (r = 0.95).
//
// Zones: the paper's grid splits the GRI into five zones A-E, "best (first-20th percentile) to
// worst (81st-100th percentile)"; the 2026 consensus report (Klonoff DC et al, J Diabetes Sci
// Technol, PMC12967274) assigns them "in five equal quintiles". So A 0-20, B above 20 to 40,
// C above 40 to 60, D above 60 to 80, E above 80 to 100.
//
// A blank is asked for, never read as 0%. The weights are applied in tenths (30, 24, 16, 8) so a
// boundary like High 25% gives exactly 20, not 20.000000000000004. Pure: no DOM, no clock.

import { inputFault } from './num.js';

const r1 = (x) => Math.round(x * 10) / 10;

function zoneOf(g) {
  if (g <= 20) return 'A';
  if (g <= 40) return 'B';
  if (g <= 60) return 'C';
  if (g <= 80) return 'D';
  return 'E';
}

export function glycemiaRiskIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the percentage of time below 54 mg/dL', o.vlow, 0, 100, ''],
    ['the percentage of time from 54 to 69 mg/dL', o.low, 0, 100, ''],
    ['the percentage of time from 181 to 250 mg/dL', o.high, 0, 100, ''],
    ['the percentage of time above 250 mg/dL', o.vhigh, 0, 100, ''],
  ]);
  if (fault) return { valid: false, message: fault };
  const vlow = Number(o.vlow);
  const low = Number(o.low);
  const high = Number(o.high);
  const vhigh = Number(o.vhigh);
  const four = vlow + low + high + vhigh;
  if (four > 100 + 1e-9) {
    return { valid: false, message: `The four percentages add up to ${r1(four)}%, more than 100%. Check the values entered.` };
  }
  const tirBlank = o.tir === null || o.tir === undefined || String(o.tir).trim() === '';
  if (!tirBlank) {
    const tirFault = inputFault([['the percentage of time from 70 to 180 mg/dL', o.tir, 0, 100, '']]);
    if (tirFault) return { valid: false, message: tirFault };
    const five = four + Number(o.tir);
    if (Math.abs(five - 100) > 1 + 1e-9) {
      return { valid: false, message: `The five percentages add up to ${r1(five)}%; they should total 100%. Check the values entered.` };
    }
  }
  const hypo = (10 * vlow + 8 * low) / 10;
  const hyper = (10 * vhigh + 5 * high) / 10;
  const raw = (30 * vlow + 24 * low + 16 * vhigh + 8 * high) / 10;
  const capped = raw > 100;
  const g = capped ? 100 : raw;
  const zone = zoneOf(g);
  const gri = r1(g);
  const hypoPart = 3 * hypo;
  const hyperPart = 1.6 * hyper;
  let driver;
  if (hypoPart > hyperPart) driver = `Hypoglycemia contributes more: 3.0 x ${r1(hypo)} = ${r1(hypoPart)} points, against 1.6 x ${r1(hyper)} = ${r1(hyperPart)} from hyperglycemia.`;
  else if (hyperPart > hypoPart) driver = `Hyperglycemia contributes more: 1.6 x ${r1(hyper)} = ${r1(hyperPart)} points, against 3.0 x ${r1(hypo)} = ${r1(hypoPart)} from hypoglycemia.`;
  else driver = `Hypoglycemia and hyperglycemia contribute equally: ${r1(hypoPart)} points each.`;
  const notes = [
    driver,
    'Zones A to E are quintiles of clinician ranking of glycemia, from best (A, GRI 0 to 20) to worst (E, above 80).',
    'The GRI summarizes the tracing in one number; it does not replace the ambulatory glucose profile (AGP) report.',
  ];
  if (capped) notes.unshift(`The formula gives ${r1(raw)}; the GRI is capped at 100.`);
  return {
    valid: true,
    abnormal: zone !== 'A',
    gri,
    zone,
    hypoComponent: r1(hypo),
    hyperComponent: r1(hyper),
    band: `GRI ${gri} (zone ${zone}): hypoglycemia component ${r1(hypo)}, hyperglycemia component ${r1(hyper)}.`,
    bandLabel: `GRI ${gri}, zone ${zone}`,
    notes,
    note: 'Klonoff DC et al, J Diabetes Sci Technol 2023 (225 CGM tracings ranked by 14 clinicians; r 0.95).',
  };
}
