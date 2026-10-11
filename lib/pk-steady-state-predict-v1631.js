// spec-v1631 tool 15: predicted peak, trough and level at any time (one compartment, linear).
//
// The one-compartment model with first-order elimination and a zero-order (intermittent) infusion,
// the model of Sawchuk RJ, Zaske DE, et al. (Clin Pharmacol Ther. 1977). The equations below are
// algebra on that model; no empirical constant is used and every parameter is reader input.
//   k = ln 2 / half-life = clearance / Vd
//   accumulation factor   = 1 / (1 - e^(-k tau))
//   steady-state peak     = (Dose / t') (1 - e^(-k t')) / (k Vd (1 - e^(-k tau)));  bolus: Dose / Vd x accumulation
//   steady-state trough   = peak x e^(-k (tau - t'))
//   level after dose n    = the sum of each dose's own contribution (superposition)
//   fraction of steady state after time t = 1 - e^(-k t)
//   time to fall from C to a target       = ln(C / target) / k
//   average steady-state concentration    = Dose / (CL tau);  AUC24 = daily dose / CL
//
// Linear, one-compartment drugs only. It does not describe phenytoin (saturable elimination) or the
// distribution phase of digoxin or vancomycin, and the result says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'A linear one-compartment model: it does not describe phenytoin (saturable elimination) or the distribution phase of digoxin or vancomycin. Every parameter is yours; the tool does the algebra and does not choose a dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

// Concentration at time t (hours) after the start of ONE dose: infusion over tInf (0 = bolus).
export function singleDose(dose, tInf, k, vd, t) {
  if (t < 0) return 0;
  if (tInf === 0) return (dose / vd) * Math.exp(-k * t);
  const rate = dose / tInf;
  if (t <= tInf) return (rate / (k * vd)) * (1 - Math.exp(-k * t));
  return (rate / (k * vd)) * (1 - Math.exp(-k * tInf)) * Math.exp(-k * (t - tInf));
}
// Steady-state peak (end of infusion) and trough (end of interval).
export function steadyState(dose, tInf, tau, k, vd) {
  const acc = 1 / (1 - Math.exp(-k * tau));
  const peak = tInf === 0 ? (dose / vd) * acc : ((dose / tInf) * (1 - Math.exp(-k * tInf))) / (k * vd * (1 - Math.exp(-k * tau)));
  return { accumulation: acc, peak, trough: peak * Math.exp(-k * (tau - tInf)) };
}
// k from exactly one of k, half-life or clearance (with Vd).
export function rateConstant(o, vd) {
  const given = [['k', o.k], ['halfLife', o.halfLife], ['clearance', o.clearance]].filter(([, v]) => !blank(v));
  if (given.length !== 1) return { fault: 'Enter exactly one of the elimination rate constant, the half-life, or the clearance.' };
  const [which, raw] = given[0];
  const f = inputFault([[{ k: 'the elimination rate constant', halfLife: 'the half-life', clearance: 'the clearance' }[which], raw, null, 1e5, { k: 'per hour', halfLife: 'hours', clearance: 'L/hour' }[which]]]);
  if (f) return { fault: f };
  const v = Number(raw);
  const k = which === 'k' ? v : which === 'halfLife' ? Math.LN2 / v : v / vd;
  return { k, which };
}

export function pkSteadyStatePredict(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the dose', o.dose, null, 1e7, 'mg'], ['the infusion time', o.infusionHours, 0, 1e3, 'hours'], ['the dosing interval', o.interval, null, 1e4, 'hours'], ['the volume of distribution', o.vd, null, 1e5, 'L']]);
  if (f) return { valid: false, message: `${f} Enter 0 as the infusion time for a bolus.` };
  const dose = Number(o.dose); const tInf = Number(o.infusionHours); const tau = Number(o.interval); const vd = Number(o.vd);
  if (tInf >= tau) return { valid: false, message: 'The infusion time must be shorter than the dosing interval. A continuous infusion is not an intermittent regimen.' };
  const r = rateConstant(o, vd);
  if (r.fault) return { valid: false, message: r.fault };
  const k = r.k;
  if (k * tau > 700 || k * tau < 1e-9) return { valid: false, message: 'These values put the elimination far outside what the model can show (the interval is thousands of half-lives, or almost none). Check the units.' };
  const half = Math.LN2 / k; const cl = k * vd;
  const ss = steadyState(dose, tInf, tau, k, vd);
  const cavg = dose / (cl * tau); const auc24 = (dose * (24 / tau)) / cl;
  const toFraction = (p) => -Math.log(1 - p) / k;
  const table = [0, 0.25, 0.5, 0.75, 1].map((p) => {
    const t = tInf + p * (tau - tInf);
    return { hours: sig(t), level: sig(ss.peak * Math.exp(-k * (t - tInf))) };
  });
  const notes = [
    `k = ${show(k)} per hour (half-life ${show(half)} hours; clearance ${show(cl)} L/hour at a volume of ${show(vd)} L).`,
    `Accumulation factor: 1 ÷ (1 − e^(−k × ${show(tau)})) = ${show(ss.accumulation)}.`,
    `At steady state: peak ${show(ss.peak)} mg/L at the end of the ${tInf === 0 ? 'bolus' : `${show(tInf)}-hour infusion`}, trough ${show(ss.trough)} mg/L at ${show(tau)} hours.`,
    `Average steady-state concentration ${show(cavg)} mg/L; AUC over 24 hours ${show(auc24)} mg·h/L.`,
    `Time to 90%, 95% and 99% of steady state: ${show(toFraction(0.9))}, ${show(toFraction(0.95))} and ${show(toFraction(0.99))} hours (${show(toFraction(0.9) / half)}, ${show(toFraction(0.95) / half)} and ${show(toFraction(0.99) / half)} half-lives).`,
    `Through one interval at steady state: ${table.map((p) => `${show(p.level)} mg/L at ${show(p.hours)} h`).join('; ')}.`,
  ];
  const out = { valid: true, k: sig(k), halfLife: sig(half), clearance: sig(cl), accumulationFactor: sig(ss.accumulation), peak: sig(ss.peak), trough: sig(ss.trough), averageConcentration: sig(cavg), auc24: sig(auc24), hoursTo90: sig(toFraction(0.9)), table };
  const hasN = !blank(o.doseNumber); const hasT = !blank(o.timeAfter);
  if (hasN !== hasT) return { valid: false, message: 'To get a level at a time, enter both the dose number and the hours after that dose started.' };
  if (hasN) {
    const nf = inputFault([['the dose number', o.doseNumber, 1, 1000, ''], ['the time after the dose started', o.timeAfter, 0, 1e4, 'hours']]);
    if (nf) return { valid: false, message: nf };
    const n = Number(o.doseNumber);
    if (!Number.isInteger(n)) return { valid: false, message: 'The dose number must be a whole number.' };
    const t = Number(o.timeAfter);
    let level = 0;
    for (let i = 0; i < n; i += 1) level += singleDose(dose, tInf, k, vd, t + i * tau);
    out.levelAtTime = sig(level); out.fractionOfSteadyState = sig(1 - Math.exp(-k * ((n - 1) * tau + t)));
    notes.push(`Level ${show(t)} hours after the start of dose ${n}: ${show(level)} mg/L, the sum of ${n === 1 ? 'that dose alone' : `all ${n} doses' contributions`}. By then ${show(out.fractionOfSteadyState * 100)}% of steady state has been reached.`);
  }
  const hasC = !blank(o.level); const hasTarget = !blank(o.target);
  if (hasC !== hasTarget) return { valid: false, message: 'To get the time for a level to fall, enter both the level and the target.' };
  if (hasC) {
    const lf = inputFault([['the level', o.level, null, 1e6, 'mg/L'], ['the target', o.target, null, 1e6, 'mg/L']]);
    if (lf) return { valid: false, message: lf };
    const c = Number(o.level); const target = Number(o.target);
    if (!(target < c)) return { valid: false, message: 'The target must be below the level: this is the time for a level to fall with no further dose.' };
    out.hoursToFall = sig(Math.log(c / target) / k);
    notes.push(`With no further dose, ${show(c)} mg/L falls to ${show(target)} mg/L in ln(${show(c)} ÷ ${show(target)}) ÷ k = ${show(out.hoursToFall)} hours.`);
  }
  return { ...out, band: `Steady-state peak ${show(ss.peak)} mg/L and trough ${show(ss.trough)} mg/L; accumulation factor ${show(ss.accumulation)}; half-life ${show(half)} hours.`, bandLabel: `Peak ${show(ss.peak)}, trough ${show(ss.trough)} mg/L`, notes, note: NOTE };
}
