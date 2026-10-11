// spec-v1629 tool 16: suppository and molded-form displacement.
//
// An arithmetic identity: a calibrated mold holds a fixed volume, so drug that goes in pushes base
// out. How much base depends on the drug's factor, and the factor is published under two
// definitions that are reciprocals of each other. Both are in current use, so the definition is a
// required choice with no default:
//   (a) density factor:       grams of drug that occupy the volume of 1 g of base
//                             base per unit = blank weight - drug / factor
//   (b) displacement factor:  grams of base displaced by 1 g of drug
//                             base per unit = blank weight - drug x factor
// Calibration from three weighings (A = a plain-base unit, B = drug in a medicated unit, C = the
// medicated unit): the base in the medicated unit is C - B, so the drug displaced A - (C - B) of base;
//   density factor (a) = B / (A - C + B);  displacement factor (b) = (A - C + B) / B.
// Nothing here is cited to a textbook or a compendium (spec-v1628 section 2), and no factor table
// ships: the factor is the reader's own, from a reference they hold or from calibration mode.
//
// A drug that would take up the whole mold or more is refused. The same arithmetic serves troches
// and other molded forms.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'batch', text: 'Base and drug for a batch' },
  { value: 'calibrate', text: 'Find the factor from three weighings' },
];
export const DEFINITIONS = [
  { value: 'density', text: 'Density factor: g of drug that fill the space of 1 g of base' },
  { value: 'displacement', text: 'Displacement factor: g of base displaced by 1 g of drug' },
];
const IDENTITY_NOTE = 'An arithmetic identity (the mold holds a fixed volume). The two factor definitions are reciprocals and both are in use, so check which one your reference prints. The factor and the blank weight are yours to supply for your base and your mold; the tool does the arithmetic and does not say what to make.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function suppositoryDisplacement(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (mode !== 'batch' && mode !== 'calibrate') return { valid: false, message: 'Choose what to work out: the base and drug for a batch, or the factor from three weighings.' };

  if (mode === 'calibrate') {
    const f = inputFault([['the weight of a plain-base unit', o.blankWeight, null, 1000, 'g'], ['the drug in one medicated unit', o.drugPerUnit, null, 1000, 'g'], ['the weight of a medicated unit', o.medicatedWeight, null, 2000, 'g']]);
    if (f) return { valid: false, message: f };
    const A = Number(o.blankWeight); const B = Number(o.drugPerUnit); const C = Number(o.medicatedWeight);
    if (!(C > B)) return { valid: false, message: 'A medicated unit must weigh more than the drug in it. Check the weights entered.' };
    const displaced = A - (C - B);
    if (!(displaced > 0)) return { valid: false, message: `These weights say the medicated unit holds ${show(C - B)} g of base, as much as or more than the ${show(A)} g a plain unit holds, so the drug displaced no base. Check the weights entered.` };
    const density = B / displaced; const displacement = displaced / B;
    return {
      valid: true, mode, densityFactor: sig(density), displacementFactor: sig(displacement),
      band: `Density factor ${show(density)}; displacement factor ${show(displacement)}.`,
      bandLabel: `${show(density)} / ${show(displacement)}`,
      notes: [
        `Base in the medicated unit: ${show(C)} − ${show(B)} = ${show(C - B)} g. Base displaced by the drug: ${show(A)} − ${show(C - B)} = ${show(displaced)} g.`,
        `Density factor (g of drug per g of base space): ${show(B)} ÷ ${show(displaced)} = ${show(density)}.`,
        `Displacement factor (g of base per g of drug): ${show(displaced)} ÷ ${show(B)} = ${show(displacement)}.`,
      ],
      note: IDENTITY_NOTE,
    };
  }

  const def = String(o.definition ?? '').trim();
  if (def !== 'density' && def !== 'displacement') return { valid: false, message: 'Choose which definition your factor uses: grams of drug per gram of base space (density factor), or grams of base displaced per gram of drug (displacement factor). They are reciprocals, and the answer differs.' };
  const f = inputFault([['the number of units', o.units, 1, 100000, ''], ['the weight of a plain-base unit in your mold', o.blankWeight, null, 1000, 'g'], ['the drug per unit', o.drugPerUnit, null, 1000, 'g'], ['the factor', o.factor, null, 1000, '']]);
  if (f) return { valid: false, message: f };
  const units = Number(o.units);
  if (!Number.isInteger(units)) return { valid: false, message: 'The number of units must be a whole number.' };
  let extra = 0;
  if (!blank(o.overage)) {
    const ef = inputFault([['the extra units', o.overage, 0, 100000, '']]);
    if (ef) return { valid: false, message: ef };
    extra = Number(o.overage);
    if (!Number.isInteger(extra)) return { valid: false, message: 'The extra units must be a whole number.' };
  }
  const A = Number(o.blankWeight); const B = Number(o.drugPerUnit); const k = Number(o.factor);
  const displaced = def === 'density' ? B / k : B * k;
  const base = A - displaced;
  if (!(base > 0)) return { valid: false, message: `This much drug displaces ${show(displaced)} g of base, as much as or more than the ${show(A)} g the mold holds: it does not fit this mold. Check the factor and which definition it uses.` };
  const n = units + extra;
  const density = def === 'density' ? k : 1 / k;
  return {
    valid: true, mode, basePerUnit: sig(base), baseTotal: sig(base * n), drugTotal: sig(B * n), unitWeight: sig(base + B), unitsMade: n,
    densityFactor: sig(density), displacementFactor: sig(1 / density),
    band: `For ${n} unit${n === 1 ? '' : 's'}: ${show(base * n)} g of base and ${show(B * n)} g of drug.`,
    bandLabel: `${show(base * n)} g of base`,
    notes: [
      def === 'density'
        ? `Base displaced per unit: ${show(B)} g of drug ÷ ${show(k)} = ${show(displaced)} g.`
        : `Base displaced per unit: ${show(B)} g of drug × ${show(k)} = ${show(displaced)} g.`,
      `Base per unit: ${show(A)} − ${show(displaced)} = ${show(base)} g. One finished unit should weigh ${show(base)} + ${show(B)} = ${show(base + B)} g.`,
      `Batch: ${units}${extra ? ` + ${extra} extra` : ''} = ${n} units; ${show(base)} × ${n} = ${show(base * n)} g of base and ${show(B)} × ${n} = ${show(B * n)} g of drug.`,
      `The same factor both ways: density factor ${show(density)}, displacement factor ${show(1 / density)}.`,
    ],
    note: IDENTITY_NOTE,
  };
}
