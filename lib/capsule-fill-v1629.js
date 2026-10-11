// spec-v1629 tool 17: capsule fill weight and diluent.
//
// An arithmetic identity: a capsule body holds a fixed volume, so the diluent fills what the active
// leaves.
//   By measured fill weights (the packing method):
//     fraction the active fills = active per capsule / weight of active alone that fills the capsule
//     diluent per capsule       = (1 - that fraction) x weight of diluent alone that fills the capsule
//   By densities:
//     active volume = active per capsule / tapped density of the active
//     diluent       = (capsule volume - active volume) x tapped density of the diluent
// A fraction above 1 does not fit that capsule size. Nothing here is cited to a textbook or a
// compendium (spec-v1628 section 2), and no capsule-size table ships: the volume is on the capsule
// maker's data sheet, and the fill weights and densities are the reader's own measurements.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const METHODS = [
  { value: 'weights', text: 'From measured fill weights of each powder alone' },
  { value: 'densities', text: 'From the capsule volume and tapped densities' },
];
const IDENTITY_NOTE = 'An arithmetic identity (the capsule holds a fixed volume). The fill weights, the capsule volume and the tapped densities are yours to measure or to read from the capsule maker\'s sheet; the tool does the arithmetic and does not say what to make. Powders that mix do not always pack the way each packs alone, so weigh a filled capsule against the target.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function capsuleFill(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const method = String(o.method ?? '').trim();
  if (method !== 'weights' && method !== 'densities') return { valid: false, message: 'Choose the method: measured fill weights of each powder alone, or the capsule volume with tapped densities.' };
  const f = inputFault([['the number of capsules', o.capsules, 1, 1000000, ''], ['the active per capsule', o.activeMg, null, 5000, 'mg']]);
  if (f) return { valid: false, message: f };
  const count = Number(o.capsules);
  if (!Number.isInteger(count)) return { valid: false, message: 'The number of capsules must be a whole number.' };
  let extra = 0;
  if (!blank(o.overage)) {
    const ef = inputFault([['the extra capsules', o.overage, 0, 1000000, '']]);
    if (ef) return { valid: false, message: ef };
    extra = Number(o.overage);
    if (!Number.isInteger(extra)) return { valid: false, message: 'The extra capsules must be a whole number.' };
  }
  const active = Number(o.activeMg);
  let fraction; let diluent; const notes = [];
  if (method === 'weights') {
    const wf = inputFault([['the weight of active alone that fills one capsule', o.activeFillMg, null, 5000, 'mg'], ['the weight of diluent alone that fills one capsule', o.diluentFillMg, null, 5000, 'mg']]);
    if (wf) return { valid: false, message: wf };
    fraction = active / Number(o.activeFillMg);
    diluent = (1 - fraction) * Number(o.diluentFillMg);
    notes.push(`Fraction of the capsule the active fills: ${show(active)} mg ÷ ${show(Number(o.activeFillMg))} mg = ${show(fraction)}.`);
    if (fraction <= 1) notes.push(`Diluent per capsule: (1 − ${show(fraction)}) × ${show(Number(o.diluentFillMg))} mg = ${show(Math.max(0, diluent))} mg.`);
  } else {
    const df = inputFault([['the capsule body volume', o.capsuleVolumeMl, null, 50, 'mL'], ['the tapped density of the active', o.activeDensity, null, 25, 'g/mL'], ['the tapped density of the diluent', o.diluentDensity, null, 25, 'g/mL']]);
    if (df) return { valid: false, message: df };
    const vol = Number(o.capsuleVolumeMl);
    const activeVol = (active / 1000) / Number(o.activeDensity);
    fraction = activeVol / vol;
    diluent = (vol - activeVol) * Number(o.diluentDensity) * 1000;
    notes.push(`Volume of the active: ${show(active / 1000)} g ÷ ${show(Number(o.activeDensity))} g/mL = ${show(activeVol)} mL, ${show(fraction * 100)}% of the ${show(vol)} mL capsule.`);
    if (fraction <= 1) notes.push(`Diluent per capsule: (${show(vol)} − ${show(activeVol)}) mL × ${show(Number(o.diluentDensity))} g/mL = ${show(Math.max(0, diluent))} mg.`);
  }
  if (sig(fraction) > 1) {
    notes.push('The active alone is more than this capsule holds. A larger capsule size, or more than one capsule per dose, is a decision for the compounder.');
    return { valid: true, fits: false, fractionFilled: sig(fraction), abnormal: true, band: `Does not fit this size: the active alone fills ${show(fraction * 100)}% of the capsule.`, bandLabel: 'Does not fit this size', notes, note: IDENTITY_NOTE };
  }
  diluent = sig(fraction) === 1 ? 0 : Math.max(0, diluent);
  const n = count + extra;
  const filled = active + diluent;
  notes.push(`Target fill weight: ${show(active)} + ${show(diluent)} = ${show(filled)} mg of powder per capsule (the empty shell is extra).`);
  notes.push(`Batch: ${count}${extra ? ` + ${extra} extra` : ''} = ${n} capsules; ${show(active * n / 1000)} g of active and ${show(diluent * n / 1000)} g of diluent.`);
  return {
    valid: true, fits: true, fractionFilled: sig(fraction), diluentMg: sig(diluent), fillWeightMg: sig(filled), capsulesMade: n,
    activeTotalG: sig(active * n / 1000), diluentTotalG: sig(diluent * n / 1000),
    band: `${show(diluent)} mg of diluent with ${show(active)} mg of active per capsule; for ${n} capsules, ${show(active * n / 1000)} g of active and ${show(diluent * n / 1000)} g of diluent.`,
    bandLabel: `${show(diluent)} mg diluent per capsule`,
    notes, note: IDENTITY_NOTE,
  };
}
