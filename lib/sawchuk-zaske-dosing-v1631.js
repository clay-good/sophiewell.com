// spec-v1631 tool 4: a new dose and interval from two levels (intermittent infusion).
//
// Sawchuk RJ, Zaske DE, Cipolle RJ, Wargin WA, Strate RG. Clin Pharmacol Ther. 1977;21(3):362-369
// (PMID 837654; abstract re-read on October 11, 2026): dosing intervals and infusion rates "based on
// each patient's kinetic parameters and desired steady-state peaks and nadirs, assumed a
// one-compartment model with first-order elimination and 1-hr constant-rate input at fixed
// intervals." The equations are the closed-form solution of that model:
//   k    = ln(C1 / C2) / (t2 - t1);  half-life = ln 2 / k        (times are after the END of the infusion)
//   Cmax = C1 x e^(k t1)                       (end of infusion)
//   Cmin = C2 x e^(-k (tau - t' - t2))         (end of interval; before a first dose it is zero, or
//                                               the measured pre-dose level)
//   Vd   = [(Dose / t') (1 - e^(-k t'))] / [k (Cmax - Cmin e^(-k t'))]
//   new interval = t' + ln(desired peak / desired trough) / k
//   new dose     = k Vd t' x desired peak x (1 - e^(-k tau)) / (1 - e^(-k t'))
//
// Drug-agnostic. No target is built in: the paper gives none and targets differ by drug and
// indication, so the desired peak and trough are the reader's. The tool refuses when the two levels
// are less than half a half-life apart, where the estimate of k is unstable; that cutoff is this
// tool's own guard, not the paper's, and the refusal says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { steadyState } from './pk-steady-state-predict-v1631.js';

export const DOSE_STATES = [
  { value: 'first', text: 'A first dose' },
  { value: 'steady', text: 'At steady state' },
];
export const PRACTICAL_INTERVALS = [6, 8, 12, 18, 24, 36, 48];
const NOTE = 'A one-compartment model fitted to two levels. No target is built in: the desired peak and trough are yours, and they differ by drug and indication. The tool does the algebra; it does not choose a regimen.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function sawchukZaskeDosing(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const state = String(o.doseState ?? '').trim();
  if (state !== 'first' && state !== 'steady') return { valid: false, message: 'Choose whether the levels follow a first dose or a dose at steady state: the trough before the dose is worked out differently.' };
  const f = inputFault([['the dose', o.dose, null, 1e7, 'mg'], ['the infusion time', o.infusionHours, null, 1e3, 'hours'], ['the dosing interval', o.interval, null, 1e4, 'hours'], ['the first level', o.level1, null, 1e6, 'mg/L'], ['the time of the first level', o.time1, 0, 1e4, 'hours'], ['the second level', o.level2, null, 1e6, 'mg/L'], ['the time of the second level', o.time2, null, 1e4, 'hours']]);
  if (f) return { valid: false, message: `${f} Times are hours after the end of the infusion.` };
  const dose = Number(o.dose); const tInf = Number(o.infusionHours); const tau = Number(o.interval);
  const c1 = Number(o.level1); const t1 = Number(o.time1); const c2 = Number(o.level2); const t2 = Number(o.time2);
  if (tInf >= tau) return { valid: false, message: 'The infusion time must be shorter than the dosing interval.' };
  if (!(t2 > t1)) return { valid: false, message: 'The second level must be drawn after the first. Times are hours after the end of the infusion.' };
  if (t2 > tau - tInf) return { valid: false, message: `The second level is timed after the end of the interval (${show(tau - tInf)} hours after the infusion ends). Both levels must fall in the same interval.` };
  if (!(c1 > c2)) return { valid: false, message: 'The first level must be above the second: the model reads the fall between them.' };
  const k = Math.log(c1 / c2) / (t2 - t1); const half = Math.LN2 / k;
  if (t2 - t1 < half / 2) return { valid: false, message: `The two levels are ${show(t2 - t1)} hours apart, less than half of the half-life they imply (${show(half)} hours), so the rate constant is unstable. This cutoff is the tool's own guard, not the paper's.` };
  const cmax = c1 * Math.exp(k * t1);
  let cmin; let cminHow;
  if (state === 'steady') { cmin = c2 * Math.exp(-k * (tau - tInf - t2)); cminHow = 'extrapolated to the end of the interval'; }
  else if (!blank(o.preDose)) {
    const pf = inputFault([['the pre-dose level', o.preDose, 0, 1e6, 'mg/L']]);
    if (pf) return { valid: false, message: pf };
    cmin = Number(o.preDose); cminHow = 'the measured pre-dose level';
  } else { cmin = 0; cminHow = 'zero before a first dose'; }
  if (state === 'steady' && !blank(o.preDose)) return { valid: false, message: 'A pre-dose level is used only with a first dose. Clear it, or choose a first dose.' };
  const denominator = k * (cmax - cmin * Math.exp(-k * tInf));
  if (!(denominator > 0)) return { valid: false, message: 'The pre-dose level is too high for these levels: the dose would have added nothing. Check the values.' };
  const vd = ((dose / tInf) * (1 - Math.exp(-k * tInf))) / denominator;
  const notes = [
    `k = ln(${show(c1)} ÷ ${show(c2)}) ÷ (${show(t2)} − ${show(t1)}) = ${show(k)} per hour; half-life ${show(half)} hours.`,
    `Peak at the end of the infusion: ${show(c1)} × e^(k × ${show(t1)}) = ${show(cmax)} mg/L. Trough before the dose: ${show(cmin)} mg/L (${cminHow}).`,
    `Volume of distribution: ${show(vd)} L; clearance k × Vd = ${show(k * vd)} L/hour.`,
  ];
  const out = { valid: true, k: sig(k), halfLife: sig(half), peak: sig(cmax), trough: sig(cmin), vd: sig(vd), clearance: sig(k * vd) };
  if (!blank(o.weight)) {
    const wf = inputFault([['the weight', o.weight, null, 500, 'kg']]);
    if (wf) return { valid: false, message: wf };
    out.vdPerKg = sig(vd / Number(o.weight));
    notes.push(`That is ${show(out.vdPerKg)} L/kg at ${show(Number(o.weight))} kg.`);
  }
  const hasPeak = !blank(o.desiredPeak); const hasTrough = !blank(o.desiredTrough);
  if (hasPeak !== hasTrough) return { valid: false, message: 'For a new regimen enter both the desired peak and the desired trough.' };
  if (!hasPeak) {
    notes.push('No desired peak and trough were entered, so no new regimen is worked out.');
    return { ...out, band: `Half-life ${show(half)} hours and volume of distribution ${show(vd)} L, from a peak of ${show(cmax)} mg/L and a trough of ${show(cmin)} mg/L.`, bandLabel: `t½ ${show(half)} h, Vd ${show(vd)} L`, notes, note: NOTE };
  }
  const df = inputFault([['the desired peak', o.desiredPeak, null, 1e6, 'mg/L'], ['the desired trough', o.desiredTrough, null, 1e6, 'mg/L']]);
  if (df) return { valid: false, message: df };
  const wantPeak = Number(o.desiredPeak); const wantTrough = Number(o.desiredTrough);
  if (!(wantPeak > wantTrough)) return { valid: false, message: 'The desired peak must be above the desired trough.' };
  const exact = tInf + Math.log(wantPeak / wantTrough) / k;
  // The practical intervals on either side of the exact one; the nearer is the headline, and on a
  // tie the longer, whose trough is at or under the one asked for.
  const usable = PRACTICAL_INTERVALS.filter((x) => x > tInf);
  const below = usable.filter((x) => x <= exact).pop(); const above = usable.find((x) => x >= exact);
  const sides = [...new Set([below, above].filter((x) => x !== undefined))];
  const regimen = (tauNew) => {
    const d = (k * vd * tInf * wantPeak * (1 - Math.exp(-k * tauNew))) / (1 - Math.exp(-k * tInf));
    const ss = steadyState(d, tInf, tauNew, k, vd);
    return { interval: tauNew, dose: sig(d), predictedPeak: sig(ss.peak), predictedTrough: sig(ss.trough) };
  };
  const options = sides.map(regimen);
  const practical = sides.length === 1 || sig(above - exact) <= sig(exact - below) ? sides[sides.length - 1] : sides[0];
  const chosen = options.find((x) => x.interval === practical);
  const newDose = chosen.dose; const predicted = { peak: chosen.predictedPeak, trough: chosen.predictedTrough };
  Object.assign(out, { exactInterval: sig(exact), practicalInterval: practical, newDose, predictedPeak: predicted.peak, predictedTrough: predicted.trough, options });
  notes.push(`New interval: ${show(tInf)} + ln(${show(wantPeak)} ÷ ${show(wantTrough)}) ÷ k = ${show(exact)} hours.`);
  for (const x of options) notes.push(`Every ${x.interval} hours, for a peak of ${show(wantPeak)} mg/L over ${show(tInf)} h: ${show(x.dose)} mg before rounding, which predicts a trough of ${show(x.predictedTrough)} mg/L.`);
  return { ...out, band: `${show(newDose)} mg every ${practical} hours predicts a peak of ${show(predicted.peak)} and a trough of ${show(predicted.trough)} mg/L (half-life ${show(half)} hours, Vd ${show(vd)} L).`, bandLabel: `${show(newDose)} mg every ${practical} h`, notes, note: NOTE };
}
