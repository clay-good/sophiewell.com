// spec-v1631 tool 3: vancomycin continuous infusion, by the 2020 consensus guideline and the label.
//
// Rybak MJ, et al. Am J Health-Syst Pharm 2020;77:835-864 (ASHP/IDSA/PIDS/SIDP), re-read on
// October 11, 2026 (the ASHP PDF), recommendation 7 and the continuous-infusion section:
//   "a loading dose of 15 to 20 mg/kg, followed by daily maintenance CI of 30 to 40 mg/kg (up to
//     60 mg/kg) to achieve a target steady-state concentration of 20 to 25 mg/L may be considered
//     for critically ill patients."
//   "AUC24 can be simply calculated by multiplying the steady-state concentration ... by a factor
//     of 24."
//   Recommendation 11: loading doses "based on actual body weight and not exceed 3,000 mg."
//   Recommendation 1: the AUC target of 400 to 600 mg·h/L.
//
// Vancomycin Hydrochloride for Injection label (Gland, a label row, spec-v1628 section 1), Dosage and
// Administration, re-read the same day: "Concentrations of no more than 5 mg/mL ... are recommended
// in adults ... In selected patients in need of fluid restriction, a concentration up to 10 mg/mL
// may be used." The label also says "Intermittent infusion is the recommended method of
// administration", which the result repeats.
//
// The new rate for a target level is a proportion (rate x target / measured), an identity that holds
// only while clearance has not changed.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { setId: '00946db3-d6c5-4534-a870-1ec6e63eda43', concentration: 5, restricted: 10 };
export const GUIDE = { load: [15, 20], daily: [30, 40], dailyUpTo: 60, css: [20, 25], auc: [400, 600], loadCap: 3000 };
const NOTE = 'The guideline says continuous infusion may be considered for critically ill patients when the AUC target cannot be reached with intermittent dosing; the label recommends intermittent infusion. The tool does the arithmetic on actual body weight; it does not choose the dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function vancContinuousInfusion(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the actual body weight', o.weight, 20, 300, 'kg'],
    ['the loading dose', o.loadPerKg, null, 60, 'mg/kg'],
    ['the daily maintenance dose', o.dailyPerKg, null, 120, 'mg/kg/day'],
    ['the bag concentration', o.concentration, null, 50, 'mg/mL'],
  ]);
  if (f) return { valid: false, message: f };
  const hasLevel = !blank(o.level); const hasRate = !blank(o.currentRate); const hasTarget = !blank(o.targetCss);
  if (hasLevel || hasRate || hasTarget) {
    if (!hasLevel) return { valid: false, message: 'Enter the measured steady-state level to work an adjustment, or clear the current rate and the target level.' };
    if (!hasRate) return { valid: false, message: 'Enter the current infusion rate in mg/h that the level was measured on.' };
    if (!hasTarget) return { valid: false, message: 'Enter the target steady-state level. The guideline\'s range is 20 to 25 mg/L.' };
    const lf = inputFault([['the measured steady-state level', o.level, null, 200, 'mg/L'], ['the current rate', o.currentRate, null, 1000, 'mg/h'], ['the target steady-state level', o.targetCss, null, 60, 'mg/L']]);
    if (lf) return { valid: false, message: lf };
  }
  const kg = Number(o.weight); const loadKg = Number(o.loadPerKg); const dailyKg = Number(o.dailyPerKg); const conc = Number(o.concentration);
  const rawLoad = loadKg * kg; const load = Math.min(rawLoad, GUIDE.loadCap);
  const daily = dailyKg * kg; const rate = daily / 24; const pump = rate / conc;
  const notes = [
    `Loading: ${show(loadKg)} mg/kg × ${show(kg)} kg = ${show(rawLoad)} mg.${rawLoad > GUIDE.loadCap ? ' The guideline says loading doses should not exceed 3,000 mg, so 3,000 mg.' : ''}`,
    `Maintenance: ${show(dailyKg)} mg/kg/day × ${show(kg)} kg = ${show(daily)} mg/day = ${show(rate)} mg/h; at ${show(conc)} mg/mL that is ${show(pump)} mL/h.`,
  ];
  const flags = [];
  if (loadKg < GUIDE.load[0] || loadKg > GUIDE.load[1]) flags.push(`A loading dose of ${show(loadKg)} mg/kg is outside the guideline's 15 to 20 mg/kg for continuous infusion.`);
  if (dailyKg > GUIDE.dailyUpTo) flags.push(`A maintenance dose of ${show(dailyKg)} mg/kg/day is above the guideline's 30 to 40 mg/kg/day (up to 60).`);
  else if (dailyKg < GUIDE.daily[0]) flags.push(`A maintenance dose of ${show(dailyKg)} mg/kg/day is below the guideline's 30 to 40 mg/kg/day.`);
  else if (dailyKg > GUIDE.daily[1]) flags.push(`A maintenance dose of ${show(dailyKg)} mg/kg/day is above the guideline's usual 30 to 40 mg/kg/day and within its "up to 60".`);
  const out = { valid: true, loadingDose: sig(load), loadingCapped: rawLoad > GUIDE.loadCap, dailyDose: sig(daily), rateMgPerHour: sig(rate), rateMlPerHour: sig(pump) };
  const row = labelRow(LABEL.setId, now, table);
  if (!row.answers) {
    out.labelWithheld = true; out.labelUrl = row.url;
    notes.push(`The label's concentration limit is withheld: ${row.why}. Check the concentration against the label in hand.`);
  } else {
    if (conc > LABEL.restricted) flags.push(`A concentration of ${show(conc)} mg/mL is above the 10 mg/mL the label allows even for fluid restriction.`);
    else if (conc > LABEL.concentration) flags.push(`A concentration of ${show(conc)} mg/mL is above the label's 5 mg/mL; the label allows up to 10 mg/mL only in selected patients who need fluid restriction, with a higher risk of infusion-related events.`);
  }
  let adjust = '';
  if (hasLevel) {
    const level = Number(o.level); const current = Number(o.currentRate); const target = Number(o.targetCss);
    const auc = level * 24; const next = current * target / level;
    const where = auc < GUIDE.auc[0] ? 'below' : auc > GUIDE.auc[1] ? 'above' : 'within';
    Object.assign(out, { auc24: sig(auc), aucAgainst: where, newRateMgPerHour: sig(next), newRateMlPerHour: sig(next / conc) });
    notes.push(`AUC24 = steady-state level × 24 = ${show(level)} × 24 = ${show(auc)} mg·h/L, ${where} the guideline's 400 to 600.`);
    notes.push(`Rate for a level of ${show(target)} mg/L: ${show(current)} mg/h × ${show(target)} ÷ ${show(level)} = ${show(next)} mg/h (${show(next * 24)} mg/day, ${show(next / conc)} mL/h). This proportion assumes clearance has not changed since the level was drawn.`);
    if (target < GUIDE.css[0] || target > GUIDE.css[1]) flags.push(`A target of ${show(target)} mg/L is outside the guideline's 20 to 25 mg/L.`);
    adjust = ` AUC24 ${show(auc)} mg·h/L (${where} 400 to 600); for ${show(target)} mg/L, ${show(next)} mg/h.`;
    out.abnormal = where !== 'within' || flags.length > 0;
  } else out.abnormal = flags.length > 0;
  notes.push(...flags);
  if (row.answers) notes.push(`Label: ${row.edition}.`);
  return {
    ...out, flags,
    band: `Load ${show(load)} mg, then ${show(rate)} mg/h (${show(daily)} mg/day, ${show(pump)} mL/h).${adjust}`,
    bandLabel: `${show(rate)} mg/h`,
    notes, note: NOTE,
  };
}
