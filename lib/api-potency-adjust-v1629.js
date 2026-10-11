// spec-v1629 tool 7: weight to weigh after assay and water correction.
//
// An arithmetic identity. A lot of active ingredient is not 100% drug: its certificate of analysis
// gives an assay and a water content (or loss on drying). How much to weigh for a target of pure,
// anhydrous active depends on the BASIS the assay is stated on:
//   as-is basis             weigh = target / (assay / 100)
//   anhydrous or dried      weigh = target / [(assay / 100) x (1 - water / 100)]
// then x a salt factor when the target is stated as the base and the lot is a salt.
// Nothing here is cited to a textbook or a compendium (spec-v1628 section 2).
//
// The basis is a required three-way choice with no default. Applying the water correction to an
// as-is assay over-weighs; skipping it on an anhydrous or dried assay under-doses. The tool refuses
// to answer until the basis is chosen.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const BASES = [
  { value: 'as-is', text: 'As is (the assay already counts the water)' },
  { value: 'anhydrous', text: 'Anhydrous basis' },
  { value: 'dried', text: 'Dried basis' },
];
export const UNITS = [{ value: 'mg', text: 'mg' }, { value: 'g', text: 'g' }];
const IDENTITY_NOTE = 'An arithmetic identity. The assay, its basis and the water content come from the lot\'s certificate of analysis; the tool does the arithmetic and does not say what to make.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function apiPotencyAdjust(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const basis = String(o.basis ?? '').trim();
  if (!BASES.some((b) => b.value === basis)) return { valid: false, message: 'Choose the basis the assay is stated on: as is, anhydrous or dried. It is on the certificate of analysis, and the answer differs by it.' };
  const unit = String(o.unit ?? '').trim();
  if (unit !== 'mg' && unit !== 'g') return { valid: false, message: 'Choose the unit of the target amount: mg or g.' };
  const f = inputFault([['the target amount of pure active', o.target, null, 1e9, unit], ['the assay', o.assay, null, 120, 'percent']]);
  if (f) return { valid: false, message: f };
  const target = Number(o.target); const assay = Number(o.assay);
  const notes = [];
  let weigh = target / (assay / 100);
  notes.push(`Assay: ${show(target)} ${unit} ÷ (${show(assay)} ÷ 100) = ${show(weigh)} ${unit}.`);
  let water = null;
  if (basis === 'as-is') {
    notes.push(blank(o.water)
      ? 'No water correction: an as-is assay already counts the water in the lot.'
      : `No water correction: an as-is assay already counts the water in the lot. The ${show(Number(o.water))}% entered is not applied; applying it would over-weigh.`);
  } else {
    const wf = inputFault([['the water content or loss on drying', o.water, 0, 99, 'percent']]);
    if (wf) return { valid: false, message: `${wf} An ${basis} assay needs it: skipping the correction under-doses.`.replace('An dried', 'A dried') };
    water = Number(o.water);
    const before = weigh;
    weigh /= (1 - water / 100);
    notes.push(`Water (${basis} basis): ${show(before)} ${unit} ÷ (1 − ${show(water)} ÷ 100) = ${show(weigh)} ${unit}.`);
  }
  let salt = null;
  if (!blank(o.saltFactor)) {
    const sf = inputFault([['the salt factor', o.saltFactor, null, 100, '']]);
    if (sf) return { valid: false, message: sf };
    salt = Number(o.saltFactor);
    const before = weigh;
    weigh *= salt;
    notes.push(`Salt factor: ${show(before)} ${unit} × ${show(salt)} = ${show(weigh)} ${unit} (the weight of salt that carries the target of base).`);
  } else notes.push('No salt factor was entered, so the target and the lot are taken to be the same chemical form.');
  return {
    valid: true, weigh: sig(weigh), basis, waterApplied: water !== null, saltFactor: salt,
    band: `Weigh ${show(weigh)} ${unit} of this lot for ${show(target)} ${unit} of pure active.`,
    bandLabel: `${show(weigh)} ${unit}`,
    notes, note: IDENTITY_NOTE,
  };
}
