// spec-v1631 tool 17: time above the MIC for an intermittent dosing regimen.
//
// Algebra on the one-compartment infusion model of lib/pk-steady-state-predict-v1631.js, at steady
// state and on FREE concentrations (unbound fraction fu):
//   free peak P and free trough T; free plateau A = fu x (dose / t') / (k Vd)
//   T at or above the MIC: 100% of the interval. P below the MIC: 0%.
//   otherwise the rising curve crosses the MIC at tc = -ln[(A - MIC) / (A - T)] / k after the start
//   of the infusion, and time above = (t' - tc) + ln(P / MIC) / k, limited to the interval.
//   bolus: ln(P / MIC) / k.
// Checked against a numerical integration when the spec was written and again in the tests.
//
// A longer infusion does not always raise the result: with the same dose it lowers the peak, and
// when the MIC sits just under the new peak the time above it falls. The tool shows the comparison
// and draws no conclusion. No target is printed: pharmacodynamic targets vary by drug class and by
// paper, and none was read in a primary source; the target is the reader's. Vd, half-life and
// protein binding are reader input, from the product label.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { steadyState, rateConstant } from './pk-steady-state-predict-v1631.js';

const NOTE = 'A one-compartment model on free drug at steady state. No target is shown: what percent of the interval is enough depends on the drug and the source, and is yours to set. The tool does not choose a regimen.';

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

// Hours of one interval that the free concentration is above the MIC.
export function hoursAboveMic(dose, tInf, tau, k, vd, fu, mic) {
  const ss = steadyState(dose, tInf, tau, k, vd);
  const P = fu * ss.peak; const T = fu * ss.trough;
  if (T >= mic) return { hours: tau, peak: P, trough: T };
  if (P <= mic) return { hours: 0, peak: P, trough: T };
  let hours;
  if (tInf === 0) hours = Math.log(P / mic) / k;
  else {
    const A = (fu * (dose / tInf)) / (k * vd);
    const tc = -Math.log((A - mic) / (A - T)) / k;
    hours = (tInf - tc) + Math.log(P / mic) / k;
  }
  return { hours: Math.min(hours, tau), peak: P, trough: T };
}

export function tmicBetaLactam(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the dose', o.dose, null, 1e7, 'mg'], ['the infusion time', o.infusionHours, 0, 1e3, 'hours'], ['the dosing interval', o.interval, null, 1e4, 'hours'], ['the volume of distribution', o.vd, null, 1e5, 'L'], ['the unbound fraction', o.unboundFraction, null, 1, ''], ['the MIC', o.mic, null, 1e5, 'mg/L']]);
  if (f) return { valid: false, message: `${f} Enter 0 as the infusion time for a bolus, and the unbound fraction as a number from 0 to 1.` };
  const dose = Number(o.dose); const tInf = Number(o.infusionHours); const tau = Number(o.interval); const vd = Number(o.vd); const fu = Number(o.unboundFraction); const mic = Number(o.mic);
  if (tInf >= tau) return { valid: false, message: 'The infusion time must be shorter than the dosing interval. A continuous infusion is not an intermittent regimen.' };
  const r = rateConstant({ k: o.k, halfLife: o.halfLife }, vd);
  if (r.fault) return { valid: false, message: 'Enter exactly one of the elimination rate constant or the half-life.' };
  const k = r.k;
  if (k * tau > 700 || k * tau < 1e-9) return { valid: false, message: 'These values put the elimination far outside what the model can show. Check the units.' };
  const a = hoursAboveMic(dose, tInf, tau, k, vd, fu, mic);
  const pct = (a.hours / tau) * 100;
  const notes = [
    `Free peak ${show(a.peak)} mg/L and free trough ${show(a.trough)} mg/L at steady state (unbound fraction ${show(fu)}, half-life ${show(Math.LN2 / k)} h, volume ${show(vd)} L).`,
    a.trough >= mic ? `The free trough is at or above the MIC of ${show(mic)} mg/L, so the whole interval is above it.` : a.peak <= mic ? `The free peak does not rise above the MIC of ${show(mic)} mg/L.` : `Above the MIC of ${show(mic)} mg/L for ${show(a.hours)} of every ${show(tau)} hours: ${show(pct)}%.`,
  ];
  const comparisons = [];
  for (const alt of [3, 4]) {
    if (alt === tInf || alt >= tau) continue;
    const b = hoursAboveMic(dose, alt, tau, k, vd, fu, mic);
    comparisons.push({ infusionHours: alt, hours: sig(b.hours), percent: sig((b.hours / tau) * 100), peak: sig(b.peak) });
    notes.push(`The same dose over ${alt} hours: ${show(b.hours)} hours above the MIC (${show((b.hours / tau) * 100)}%), with a free peak of ${show(b.peak)} mg/L.`);
  }
  if (comparisons.some((c) => c.hours < sig(a.hours))) notes.push('A longer infusion lowered the result here: it lowers the peak, and the MIC sits near that peak.');
  // The same amount per interval run as a continuous infusion: free Css = fu x rate / CL, with CL = k x Vd.
  const rate = dose / tau; const css = (fu * rate) / (k * vd);
  const continuous = { rateMgPerHour: sig(rate), freeCss: sig(css), aboveMic: css > mic };
  notes.push(`The same amount as a continuous infusion (${show(rate)} mg/h): a free steady-state concentration of ${show(css)} mg/L, ${css > mic ? 'above' : css === mic ? 'equal to' : 'below'} the MIC of ${show(mic)} mg/L once steady state is reached. A continuous infusion is all of the time above the MIC or none of it.`);
  return {
    valid: true, hoursAboveMic: sig(a.hours), percentAboveMic: sig(pct), freePeak: sig(a.peak), freeTrough: sig(a.trough), comparisons, continuous,
    band: `Free drug is above the MIC for ${show(pct)}% of the interval (${show(a.hours)} of ${show(tau)} hours); free peak ${show(a.peak)} and trough ${show(a.trough)} mg/L.`,
    bandLabel: `${show(pct)}% above the MIC`,
    notes, note: NOTE,
  };
}
