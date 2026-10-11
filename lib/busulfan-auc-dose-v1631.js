// spec-v1631 tool 13: IV busulfan AUC and dose adjustment by the label's method.
//
// Busulfan Injection label (Sagent, DailyMed version 7), section 8.4 (Pediatric Use), "Dose
// Adjustment Based on Therapeutic Drug Monitoring", a label row (spec-v1628 section 1), re-read on
// October 11, 2026:
//   "Adjusted dose (mg) = Actual Dose (mg) x Target AUC (uM.min)/Actual AUC (uM.min)", with a target
//     of 1125 uM.min and the example 11 mg x 1125 / 800 = 15.5 mg.
//   Samples: "For dose 1: 2 hr (end of infusion), 4 hr and 6 hr"; for other doses a pre-infusion
//     (baseline) sample as well. "AUC calculations based on fewer than the three specified samples may
//     result in inaccurate AUC determinations."
//   Dose 1: "AUC infinity = AUC 0-6hr + AUC extrapolated", the first "using the linear trapezoidal
//     rule", the second "the ratio of the busulfan concentration at hour 6 and the terminal
//     elimination rate constant", with "a '0' pre-dose busulfan concentration" assumed.
//   Later doses: "steady-state AUCss (AUC 0-6hr) is to be estimated from the trough, 2 hr, 4 hr and 6
//     hr concentrations using the linear trapezoidal rule."
//   Section 11: molecular weight 246 g/mole (micromolar = ng/mL / 246). The label's pediatric trial
//     targeted 900 to 1350 uM.min.
//
// The terminal rate constant is taken from the last two samples; the label says only that it comes
// from the terminal phase, so that choice is this tool's and the result says so. The label prints
// this method in its Pediatric Use section. The target is required: the page offers the label's 1125.
//
// The label's figures answer only while the label stands (lib/label-row.js).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { trapezoid } from './auc-trapezoid-v1631.js';

export const LABEL = { setId: '086a715e-4958-4bb5-9ebd-86171e6b6203', target: 1125, range: [900, 1350], molecularWeight: 246 };
export const TIMINGS = [
  { value: 'dose-1', text: 'After dose 1' },
  { value: 'later', text: 'After a later dose (steady state)' },
];
export const UNITS = [
  { value: 'uM', text: 'µM (micromolar)' },
  { value: 'ng-mL', text: 'ng/mL' },
];
const NOTE = 'The label gives this method in its Pediatric Use section. The arithmetic is only as good as the sample times and the assay. The tool does the label\'s calculation; it does not choose the dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function busulfanAucDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const timing = String(o.timing ?? '').trim();
  if (timing !== 'dose-1' && timing !== 'later') return { valid: false, message: 'Choose whether the samples followed dose 1 or a later dose: the label works the area out differently.' };
  const unit = String(o.unit ?? '').trim();
  if (unit !== 'uM' && unit !== 'ng-mL') return { valid: false, message: 'Choose the unit of the concentrations: µM or ng/mL.' };
  const df = inputFault([['the dose given', o.dose, null, 2000, 'mg']]);
  if (df) return { valid: false, message: df };
  if (blank(o.target)) return { valid: false, message: `Enter the target AUC in µM·min. The label's target is ${LABEL.target.toLocaleString('en-US')}.` };
  const tf = inputFault([['the target AUC', o.target, null, 10000, 'µM·min']]);
  if (tf) return { valid: false, message: tf };
  const lines = String(o.samples ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { valid: false, message: 'Enter the samples, one per line: hours after the start of the infusion, a comma, then the concentration.' };
  if (lines.length > 20) return { valid: false, message: 'This tool reads up to 20 samples.' };
  const row = labelRow(LABEL.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, band: 'The busulfan label\'s method is withheld, so no AUC or dose is worked out.', bandLabel: 'Withheld', notes: [`The busulfan label figures are withheld: ${row.why}.`, 'Work the adjustment from the label in hand.'], note: NOTE };
  }
  const k = unit === 'ng-mL' ? 1 / LABEL.molecularWeight : 1;
  const points = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2) return { valid: false, message: `Sample line ${i + 1}: enter the hours after the start of the infusion, a comma, then the concentration.` };
    const f = inputFault([[`the time on sample line ${i + 1}`, p[0], 0, 24, 'hours'], [`the concentration on sample line ${i + 1}`, p[1], 0, 1e7, unit === 'uM' ? 'µM' : 'ng/mL']]);
    if (f) return { valid: false, message: f };
    if (points.length && Number(p[0]) * 60 <= points[points.length - 1][0]) return { valid: false, message: `Sample line ${i + 1}: its time is not after the line before it. Put the samples in time order.` };
    points.push([Number(p[0]) * 60, Number(p[1]) * k]);
  }
  const dose = Number(o.dose); const target = Number(o.target);
  const notes = [];
  if (unit === 'ng-mL') notes.push(`Concentrations converted with the label's molecular weight: µM = ng/mL ÷ 246.`);
  let auc;
  const out = { valid: true };
  if (timing === 'dose-1') {
    if (points[0][0] === 0 && points[0][1] !== 0) return { valid: false, message: 'For dose 1 the label assumes a pre-dose concentration of 0. Remove the time-0 sample, or choose a later dose.' };
    const curve = points[0][0] === 0 ? points : [[0, 0], ...points];
    const sampled = trapezoid(curve, 'linear');
    const [t1, c1] = points[points.length - 2]; const [t2, c2] = points[points.length - 1];
    if (!(c1 > c2) || !(c2 > 0)) return { valid: false, message: 'The last two samples are not falling, so there is no terminal rate constant to extrapolate with.' };
    const lz = Math.log(c1 / c2) / (t2 - t1); const extra = c2 / lz;
    auc = sampled + extra;
    Object.assign(out, { aucSampled: sig(sampled), aucExtrapolated: sig(extra), terminalHalfLifeHours: sig(Math.LN2 / lz / 60) });
    notes.push(`Dose 1, with a pre-dose concentration of 0: AUC to ${show(t2 / 60)} hours by the linear trapezoidal rule = ${show(sampled)} µM·min.`);
    notes.push(`Terminal rate constant from the last two samples (this tool's choice): ${show(lz * 60)} per hour, half-life ${show(Math.LN2 / lz / 60)} hours. Extrapolated area: ${show(c2)} µM ÷ that rate = ${show(extra)} µM·min.`);
    if (points.length < 3) notes.push('Fewer than the three samples the label specifies (2, 4 and 6 hours): it warns the AUC may be inaccurate.');
  } else {
    auc = trapezoid(points, 'linear');
    notes.push(`Later dose: steady-state AUC from ${show(points[0][0] / 60)} to ${show(points[points.length - 1][0] / 60)} hours by the linear trapezoidal rule = ${show(auc)} µM·min.`);
    if (points[0][0] !== 0) notes.push('The first sample is not at time 0: the label uses a pre-infusion (trough) sample to start the area.');
    if (points.length < 4) notes.push('Fewer than the four samples the label specifies for a later dose (pre-infusion, 2, 4 and 6 hours): the AUC may be inaccurate.');
  }
  const adjusted = (dose * target) / auc;
  const where = sig(auc) > LABEL.range[1] ? 'above' : sig(auc) < LABEL.range[0] ? 'below' : 'within';
  notes.push(`AUC ${show(auc)} µM·min: ${where} the 900 to 1350 µM·min the label's pediatric trial targeted.`);
  notes.push(`Adjusted dose: ${show(dose)} mg × ${show(target)} ÷ ${show(auc)} = ${show(adjusted)} mg.${target === LABEL.target ? '' : ` The label's target is ${LABEL.target.toLocaleString('en-US')} µM·min; this uses the ${show(target)} you entered.`}`);
  notes.push(`Label: ${row.edition}.`);
  return {
    ...out, auc: sig(auc), adjustedDose: sig(adjusted), aucAgainst: where, abnormal: where !== 'within',
    band: `AUC ${show(auc)} µM·min, ${where} 900 to 1350; adjusted dose ${show(adjusted)} mg for a target of ${show(target)} µM·min.`,
    bandLabel: `${show(adjusted)} mg`,
    notes, note: NOTE,
  };
}
