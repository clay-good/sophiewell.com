// spec-v1631 tool 18: kinetic eGFR when creatinine is changing (Chen).
//
// Chen S. J Am Soc Nephrol. 2013;24(6):877-888 (PMID 23704286). The equation was read as reproduced
// in Kwong YD, Chen S, Bouajram R, et al. PLoS One. 2019;14:e0225601 (PMC6879155, CC BY 4.0), Fig 1,
// re-read on October 11, 2026:
//   Equation A: KeGFR = (SSPCr x CrCl / MeanPCr) x (1 - (24 x dPCr) / (dTime(h) x MaxdPCr/Day))
//   Equation B: MaxdPCr = generation / volume of distribution = SSPCr x CrCl / TBW
// with SSPCr the steady-state (baseline) creatinine, CrCl the clearance that went with it, MeanPCr
// the mean of the two creatinines, dPCr their difference, and "total body water was defined as
// 0.6*baseline weight in kilograms".
//
// With creatinine in mg/dL, clearance in mL/min and total body water in liters, Equation B in mg/dL
// per day is 1.44 x SSPCr x CrCl / TBW (1,440 minutes a day / 100 mL per dL / 10 dL per L). That
// factor is a unit conversion worked out here; neither paper prints it.
//
// With no change in creatinine and a mean equal to baseline, the result is the baseline clearance.
// A negative result is reported as zero, with the arithmetic shown. The categories beside the
// result are the ones Kwong used from FDA's guidance (60 or more, 30 to 59, 15 to 29, under 15).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'An estimate for a creatinine that is still moving; it leans on a baseline that was itself an estimate. The tool does the arithmetic and shows the kidney-function category; it does not choose a dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
export const category = (x) => (x >= 60 ? '60 or more' : x >= 30 ? '30 to 59' : x >= 15 ? '15 to 29' : 'under 15');

export function kineticEgfr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the baseline creatinine', o.baselineCreatinine, null, 30, 'mg/dL'], ['the baseline clearance or eGFR', o.baselineClearance, null, 300, 'mL/min'], ['the first creatinine', o.creatinine1, null, 30, 'mg/dL'], ['the second creatinine', o.creatinine2, null, 30, 'mg/dL'], ['the hours between them', o.hours, null, 720, 'hours']]);
  if (f) return { valid: false, message: f };
  const base = Number(o.baselineCreatinine); const crcl = Number(o.baselineClearance); const c1 = Number(o.creatinine1); const c2 = Number(o.creatinine2); const hours = Number(o.hours);
  const byWeight = !blank(o.weight); const byRise = !blank(o.maxRise);
  if (byWeight === byRise) return { valid: false, message: 'Enter the weight (total body water is taken as 0.6 × kg), or the maximum creatinine rise per day, not both.' };
  let maxRise; let riseLine;
  if (byWeight) {
    const wf = inputFault([['the weight', o.weight, null, 500, 'kg']]);
    if (wf) return { valid: false, message: wf };
    const tbw = 0.6 * Number(o.weight);
    maxRise = (1.44 * base * crcl) / tbw;
    riseLine = `Maximum rise per day: 1.44 × ${show(base)} × ${show(crcl)} ÷ ${show(tbw)} L of body water (0.6 × ${show(Number(o.weight))} kg) = ${show(maxRise)} mg/dL per day.`;
  } else {
    const rf = inputFault([['the maximum creatinine rise per day', o.maxRise, null, 30, 'mg/dL per day']]);
    if (rf) return { valid: false, message: rf };
    maxRise = Number(o.maxRise); riseLine = `Maximum rise per day: ${show(maxRise)} mg/dL per day, as you entered it.`;
  }
  const mean = (c1 + c2) / 2; const delta = c2 - c1;
  const raw = ((base * crcl) / mean) * (1 - (24 * delta) / (hours * maxRise));
  const ke = Math.max(raw, 0);
  const notes = [
    riseLine,
    `KeGFR = (${show(base)} × ${show(crcl)} ÷ ${show(mean)}) × (1 − 24 × ${show(delta)} ÷ (${show(hours)} × ${show(maxRise)})) = ${show(raw)} mL/min.`,
  ];
  if (raw < 0) notes.push('The arithmetic is below zero: creatinine is rising faster than this baseline says it could with no filtration at all. It is reported as 0.');
  notes.push(`Category: kinetic ${category(ke)} mL/min; the baseline estimate, ${show(crcl)}, is in ${category(crcl)}.`);
  const moved = category(ke) !== category(crcl);
  return {
    valid: true, kineticEgfr: sig(ke), rawValue: sig(raw), maxRisePerDay: sig(maxRise), meanCreatinine: sig(mean), category: category(ke), baselineCategory: category(crcl), categoryChanged: moved, abnormal: moved && ke < crcl,
    band: `Kinetic eGFR ${show(ke)} mL/min (${category(ke)}); the baseline estimate was ${show(crcl)} (${category(crcl)}).`,
    bandLabel: `${show(ke)} mL/min`,
    notes, note: NOTE,
  };
}
