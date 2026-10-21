// spec-v1661 tool 4: donor-to-recipient weight, height and body surface area ratios.
//
// Arithmetic: each ratio is the donor's value over the recipient's, and the difference is the donor's
// value minus the recipient's as a percentage of the recipient's. BSA is the Mosteller formula, the same
// function the catalog's body weight and BSA tool uses. No acceptable range ships: what counts as a size
// match is specific to the organ and the program.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { bsaMosteller } from './clinical.js';

const r2 = (n) => Math.round(n * 100) / 100;
const r1 = (n) => Math.round(n * 10) / 10;
export const WEIGHT_UNITS = [{ value: 'kg', text: 'kg' }, { value: 'lb', text: 'lb' }];
export const HEIGHT_UNITS = [{ value: 'cm', text: 'cm' }, { value: 'in', text: 'in' }];

export function donorRecipientSizeMatch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (o.weightUnit !== 'kg' && o.weightUnit !== 'lb') return { valid: false, message: 'Choose the weight unit, kg or lb.' };
  if (o.heightUnit !== 'cm' && o.heightUnit !== 'in') return { valid: false, message: 'Choose the height unit, cm or in.' };
  const wMax = o.weightUnit === 'kg' ? 400 : 880;
  const hMax = o.heightUnit === 'cm' ? 250 : 98;
  const f = inputFault([
    ['the donor weight', o.donorWeight, null, wMax, o.weightUnit],
    ['the recipient weight', o.recipientWeight, null, wMax, o.weightUnit],
    ['the donor height', o.donorHeight, null, hMax, o.heightUnit],
    ['the recipient height', o.recipientHeight, null, hMax, o.heightUnit],
  ]);
  if (f) return { valid: false, message: f };
  const kg = (w) => (o.weightUnit === 'kg' ? Number(w) : Number(w) * 0.45359237);
  const cm = (h) => (o.heightUnit === 'cm' ? Number(h) : Number(h) * 2.54);
  const dW = kg(o.donorWeight);
  const rW = kg(o.recipientWeight);
  const dH = cm(o.donorHeight);
  const rH = cm(o.recipientHeight);
  const dB = bsaMosteller({ weightKg: dW, heightCm: dH });
  const rB = bsaMosteller({ weightKg: rW, heightCm: rH });
  // The ratio from unrounded values: Mosteller's BSA is the square root of height × weight over 3,600.
  const bsaRatio = Math.sqrt((dW * dH) / (rW * rH));
  const pct = (d, r) => `${d >= r ? '+' : '−'}${r1(Math.abs((d - r) / r) * 100)}%`;
  return {
    valid: true, weightRatio: r2(dW / rW), heightRatio: r2(dH / rH), bsaRatio: r2(bsaRatio), abnormal: false,
    band: `Donor-to-recipient weight ratio ${r2(dW / rW)}, height ratio ${r2(dH / rH)}, BSA ratio ${r2(bsaRatio)}.`,
    bandLabel: `Weight ${r2(dW / rW)}`,
    notes: [
      `Weight: donor ${r1(dW)} kg, recipient ${r1(rW)} kg (${pct(dW, rW)}).`,
      `Height: donor ${r1(dH)} cm, recipient ${r1(rH)} cm (${pct(dH, rH)}).`,
      `BSA (Mosteller): donor ${dB} m², recipient ${rB} m² (${pct(bsaRatio, 1)}).`,
    ],
    note: 'No acceptable range is built in; what counts as a size match depends on the organ and the program.',
  };
}
