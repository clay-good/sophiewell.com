// spec-v1631 tool 2: vancomycin in intermittent hemodialysis, by the 2020 consensus guideline.
//
// Rybak MJ, et al. Therapeutic monitoring of vancomycin for serious MRSA infections: a revised
// consensus guideline (ASHP/IDSA/PIDS/SIDP). Am J Health-Syst Pharm 2020;77:835-864. Re-read on
// October 11, 2026 (the ASHP PDF):
//   Recommendation 13, the tabulation by timing and dialyzer permeability, mg/kg (TABLE below), with
//     the footnote on the maintenance doses: "Thrice-weekly dose administration."
//   Recommendation 14: "Maintaining predialysis concentrations between 15 and 20 mg/L is likely to
//     achieve the AUC of 400 to 600 mg·h/L in the previous 24 hours ... Predialysis serum
//     concentration monitoring should be performed not less than weekly and should drive subsequent
//     dosing, as opposed to a strict weight-based recommendation."
//   Text: on a "thrice-weekly hemodialysis schedule, 25% larger doses are needed for the 3-day
//     interdialytic period (eg, Friday to Monday)"; "doses should be based on actual body weight."
//   Recommendation 11: "Loading doses should be based on actual body weight and not exceed 3,000 mg."
//   Recommendation 15 (hybrid dialysis): loading 20 to 25 mg/kg actual body weight; "Maintenance
//     doses of 15 mg/kg should be given after hybrid hemodialysis ends or during the final 60 to 90
//     minutes of dialysis."
//   Recommendation 16 (CRRT): loading 20 to 25 mg/kg at effluent rates of 20 to 25 mL/kg/h;
//     maintenance "7.5 to 10 mg/kg every 12 hours."
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const TIMINGS = [
  { value: 'after', text: 'After dialysis ends' },
  { value: 'intra', text: 'During dialysis (intradialytic)' },
];
export const PERMEABILITIES = [
  { value: 'low', text: 'Low permeability' },
  { value: 'high', text: 'High permeability' },
];
// Recommendation 13: [loading mg/kg, maintenance mg/kg low, maintenance mg/kg high].
export const TABLE = {
  after: { low: [25, 7.5, 7.5], high: [25, 10, 10] },
  intra: { low: [30, 7.5, 10], high: [35, 10, 15] },
};
export const LOAD_CAP = 3000;
export const PRE_LEVEL = [15, 20];
const NOTE = 'The guideline calls these doses a starting point: predialysis levels, taken at least weekly, should drive later doses. The tool does the guideline\'s arithmetic on actual body weight; it does not choose the dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const range = (a, b, unit) => (a === b ? `${show(a)} ${unit}` : `${show(a)} to ${show(b)} ${unit}`);

export function vancHdDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const timing = String(o.timing ?? '').trim();
  if (timing !== 'after' && timing !== 'intra') return { valid: false, message: 'Choose when the dose is given: after dialysis ends, or during dialysis.' };
  const perm = String(o.permeability ?? '').trim();
  if (perm !== 'low' && perm !== 'high') return { valid: false, message: 'Choose the dialyzer permeability: low or high. The guideline\'s doses differ.' };
  const f = inputFault([['the actual body weight', o.weight, 20, 300, 'kg']]);
  if (f) return { valid: false, message: f };
  let level = null;
  if (!blank(o.preLevel)) {
    const lf = inputFault([['the predialysis level', o.preLevel, 0, 200, 'mg/L']]);
    if (lf) return { valid: false, message: lf };
    level = Number(o.preLevel);
  }
  const kg = Number(o.weight);
  const [loadKg, lowKg, highKg] = TABLE[timing][perm];
  const rawLoad = loadKg * kg; const load = Math.min(rawLoad, LOAD_CAP);
  const lo = lowKg * kg; const hi = highKg * kg;
  const where = `${timing === 'after' ? 'after dialysis ends' : 'intradialytic'}, ${perm} permeability`;
  const notes = [
    `Loading (${where}): ${loadKg} mg/kg × ${show(kg)} kg = ${show(rawLoad)} mg.${rawLoad > LOAD_CAP ? ' The guideline says loading doses should not exceed 3,000 mg, so 3,000 mg.' : ''}`,
    `Maintenance (${where}): ${range(lowKg, highKg, 'mg/kg')} × ${show(kg)} kg = ${range(lo, hi, 'mg')}, given three times a week.`,
    `Before the 3-day gap of a three-times-a-week schedule the guideline says 25% larger doses are needed: ${range(lo, hi, 'mg')} × 1.25 = ${range(lo * 1.25, hi * 1.25, 'mg')}.`,
  ];
  const out = { valid: true, loadingDose: sig(load), loadingCapped: rawLoad > LOAD_CAP, maintenanceLow: sig(lo), maintenanceHigh: sig(hi), longGapLow: sig(lo * 1.25), longGapHigh: sig(hi * 1.25) };
  if (level !== null) {
    const against = level < PRE_LEVEL[0] ? 'below' : level > PRE_LEVEL[1] ? 'above' : 'within';
    out.levelAgainst = against; out.abnormal = against !== 'within';
    notes.push(`Predialysis level ${show(level)} mg/L: ${against} the 15 to 20 mg/L the guideline says is likely to give an AUC of 400 to 600 mg·h/L in the previous 24 hours.`);
  }
  notes.push(
    `Hybrid dialysis (PIRRT, SLED), same guideline: loading 20 to 25 mg/kg = ${range(Math.min(20 * kg, LOAD_CAP), Math.min(25 * kg, LOAD_CAP), 'mg')}; maintenance 15 mg/kg = ${show(15 * kg)} mg after the session ends or in its final 60 to 90 minutes.`,
    `CRRT at an effluent rate of 20 to 25 mL/kg/h, same guideline: loading 20 to 25 mg/kg = ${range(Math.min(20 * kg, LOAD_CAP), Math.min(25 * kg, LOAD_CAP), 'mg')}; maintenance 7.5 to 10 mg/kg = ${range(7.5 * kg, 10 * kg, 'mg')} every 12 hours.`,
  );
  return {
    ...out,
    band: `Load ${show(load)} mg; maintenance ${range(lo, hi, 'mg')} three times a week (${where}).`,
    bandLabel: range(lo, hi, 'mg'),
    notes, note: NOTE,
  };
}
