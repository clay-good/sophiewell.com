// spec-v1635 tool 15: three-bag, 12-step desensitization arithmetic.
//
// Source: Table 5 of Tsao LR, Young FD, Otani IM, Castells MC. Hypersensitivity Reactions to Platinum
// Agents and Taxanes. Clin Rev Allergy Immunol 2022;62:432-448 (PMC9156473, CC BY 4.0), re-read
// October 11, 2026, which gives the protocol of Castells et al., J Allergy Clin Immunol
// 2008;122:574-580. Its footnote: "Solution 1 is a 100-fold dilution of the final target
// concentration; solution 2 is a tenfold dilution of the final target concentration, and the
// concentration of solution 3 is calculated by subtracting the cumulative dose administered in
// steps 1-8 from the total target dose and dividing by the bag volume."
//
//   Steps 1-4: solution 1 at 2.5, 5, 10, 20 mL/h; steps 5-8: solution 2 at 5, 10, 20, 40 mL/h;
//   steps 9-11: solution 3 at 10, 20, 40 mL/h; each for 15 minutes. Step 12: solution 3 at the final
//   rate (80 mL/h in the table) until the rest of the bag is given.
//
// For 600 mg in 250 mL bags this reproduces every row of the table: 0.024, 0.24 and 2.38 mg/mL;
// 4.73 mg after step 8; 553.61 mg in step 12; 339.38 minutes. Arithmetic for a protocol already
// ordered: no premedication, no risk stratification, and not the 8-step or 16-step variants.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const LADDER = [[1, 2.5], [1, 5], [1, 10], [1, 20], [2, 5], [2, 10], [2, 20], [2, 40], [3, 10], [3, 20], [3, 40]];
const NOTE = 'Arithmetic for a desensitization protocol an allergist has already ordered, following the published 12-step table. It does not say who should be desensitized, and it covers no premedication, monitoring or reaction management. Check every figure against the order before compounding.';
const sig = (x, n = 4) => Number(Number(x).toPrecision(n)).toLocaleString('en-US', { maximumSignificantDigits: n });
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');

export function desensitization12Step(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  // Nothing is defaulted: the table's 250 mL and 80 mL/h are the usual entries, and they are entered.
  const f = inputFault([['the total target dose', o.targetDose, null, 100000, 'mg'], ['the bag volume', o.bagVolume, 50, 2000, 'mL'], ['the final rate', o.finalRate, 40, 500, 'mL/h']]);
  if (f) return { valid: false, message: f };
  const target = Number(o.targetDose); const vol = Number(o.bagVolume); const finalRate = Number(o.finalRate);
  const conc = [null, target / vol / 100, target / vol / 10, null];
  const steps = []; let cumulative = 0; const used = [0, 0, 0, 0];
  for (const [i, [sol, rate]] of LADDER.entries()) {
    if (i === 8) conc[3] = (target - cumulative) / vol;
    const ml = rate * 15 / 60; const mg = ml * conc[sol];
    cumulative += mg; used[sol] += ml;
    steps.push({ step: i + 1, solution: sol, rate, minutes: 15, volume: ml, dose: mg, cumulative });
  }
  const rest = vol - used[3];
  const lastMinutes = rest / finalRate * 60; const lastDose = rest * conc[3];
  cumulative += lastDose; used[3] += rest;
  steps.push({ step: 12, solution: 3, rate: finalRate, minutes: lastMinutes, volume: rest, dose: lastDose, cumulative });
  const totalMinutes = 11 * 15 + lastMinutes;
  const bags = [1, 2, 3].map((n) => ({ solution: n, volume: vol, concentration: conc[n], drug: conc[n] * vol, infused: used[n] }));
  const round = (s) => ({ ...s, minutes: Number(s.minutes.toFixed(2)), volume: Number(s.volume.toFixed(3)), dose: Number(s.dose.toPrecision(6)), cumulative: Number(s.cumulative.toPrecision(6)) });
  const notes = [
    ...bags.map((b) => `Solution ${b.solution}: ${sig(b.drug, 6)} mg in ${vol} mL (${sig(b.concentration)} mg/mL); ${n2(b.infused)} mL of it is infused${b.solution === 3 ? '' : `, ${n2(vol - b.infused)} mL is discarded`}.`),
    ...steps.map((s) => `Step ${s.step}: solution ${s.solution} at ${s.rate} mL/h for ${n2(s.minutes)} min; ${n2(s.volume)} mL; ${sig(s.dose, 5)} mg; cumulative ${sig(s.cumulative, 5)} mg.`),
    `Total time: ${n2(totalMinutes)} minutes (${n2(totalMinutes / 60)} hours): 11 steps of 15 minutes, then ${n2(lastMinutes)} minutes for the rest of bag 3.`,
    'Solution 1 is a 100-fold dilution and solution 2 a tenfold dilution of the target concentration. Solution 3 holds the target dose less what steps 1 to 8 deliver, so the three bags together give the full dose.',
  ];
  if (vol !== 250 || finalRate !== 80) notes.push('The published table uses 250 mL bags and a final rate of 80 mL/h; this result uses the values entered.');
  notes.push('Bag overfill and tubing priming volume change the delivered amounts and are not accounted for here.');
  return {
    valid: true, flag: 'table', bags: bags.map((b) => ({ ...b, concentration: Number(b.concentration.toPrecision(6)), drug: Number(b.drug.toPrecision(6)), infused: Number(b.infused.toFixed(3)) })),
    steps: steps.map(round), totalMinutes: Number(totalMinutes.toFixed(2)),
    band: `Three ${vol} mL bags at ${sig(conc[1])}, ${sig(conc[2])} and ${sig(conc[3])} mg/mL; 12 steps over ${n2(totalMinutes)} minutes (${n2(totalMinutes / 60)} hours) deliver ${sig(cumulative, 6)} mg.`,
    bandLabel: `${n2(totalMinutes)} minutes`, notes, note: NOTE,
  };
}
