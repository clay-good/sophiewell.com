// spec-v1549 tool 4: daily weight gain in g/kg/day during treatment for severe acute malnutrition.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced): WHO. Training course on the inpatient
// management of severe acute malnutrition, 2021, module 4, p. 30 (IRIS 10665/352668): 10 g/kg/day or more is
// good, 5 up to 10 moderate, under 5 poor, with the worked example 4.80 to 4.85 kg in a day = 10.4 g/kg/day.
// WHO. Management of severe malnutrition, 1999 (IRIS 10665/41999): gain under 5 g/kg/day for 3 days in a row is
// a failure to respond.
//
// Stated rather than hidden: during stabilization, or while edema is going down, weight change does not
// measure growth; that phase prints the figure with the caveat and no band.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PHASE_OPTIONS = [
  { value: 'rehab', text: 'Rehabilitation (F-100 or RUTF)' },
  { value: 'stabilization', text: 'Stabilization (F-75), or edema still going down' },
];

const NOTE = 'This follows WHO\'s 2021 SAM training course, module 4. Your national protocol may differ; follow it.';

export function samWeightGain(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the previous weight', o.previous, 1, 40, 'kg'], ['the current weight', o.current, 1, 40, 'kg'], ['the days between the weights', o.days, 1, 60]]);
  if (f) return { valid: false, message: f };
  const phase = PHASE_OPTIONS.find((x) => x.value === o.phase);
  if (!phase) return { valid: false, message: 'Choose the phase: weight gain is only judged in rehabilitation.' };
  const prev = Number(o.previous);
  const cur = Number(o.current);
  const days = Number(o.days);
  // Cleaned to 6 decimals so binary floating point cannot grade an exact 10.0 as 9.999...
  const g = Math.round((((cur - prev) * 1000) / prev / days) * 1e6) / 1e6;
  const gt = (Math.round(g * 10) / 10).toFixed(1);
  if (phase.value === 'stabilization') {
    return { valid: true, band: `${gt} g/kg/day. During stabilization, or while edema is going down, a weight change is fluid, not growth, so it is not graded.`, bandLabel: `${gt} g/kg/day (not graded)`, abnormal: false, notes: [], note: NOTE };
  }
  const band = g >= 10 ? 'good' : g >= 5 ? 'moderate' : 'poor';
  const notes = ['WHO grades 10 g/kg/day or more as good, 5 up to 10 as moderate, and under 5 as poor.'];
  if (band === 'poor') notes.push('Under 5 g/kg/day for 3 days in a row is a failure to respond: look for the cause (feeding, infection, other illness).');
  return { valid: true, band: `Weight gain ${gt} g/kg/day: ${band}.`, bandLabel: `${gt} g/kg/day, ${band}`, abnormal: band !== 'good', notes, note: NOTE };
}
