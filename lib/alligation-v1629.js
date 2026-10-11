// spec-v1629 tool 1: alligation (mixing strengths to a target).
//
// An arithmetic identity, the mass balance of a mixture: the drug in the parts equals the drug in the
// whole. Nothing here is cited to a textbook or a compendium (spec-v1628 section 2).
//
//   Alternate, two strengths h > l mixed to a target t between them:
//     parts of the higher = t - l;  parts of the lower = h - t;  total parts = h - l.
//     From a total T:            higher = T x (t - l) / (h - l),  lower = T - higher.
//     From a fixed lower W:      higher = W x (t - l) / (h - t)   (fortifying W up to t).
//     From a fixed higher W:     lower  = W x (h - t) / (t - l)   (diluting W down to t).
//   Medial, several lots mixed together:  result = sum(strength x quantity) / sum(quantity).
//
// A lower strength of 0 is a plain diluent; a higher strength of 100% is pure drug. The tool refuses a
// target outside the two strengths: no mixture of the two can reach it. Quantities are taken as
// additive, which holds for weights and does not always hold for volumes (alcohol and water contract
// when mixed), so a volume result says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'two', text: 'Two strengths to a target' },
  { value: 'medial', text: 'Several lots mixed together' },
];
export const STRENGTH_UNITS = [
  { value: 'percent', text: '%' },
  { value: 'mg-ml', text: 'mg/mL' },
  { value: 'mg-g', text: 'mg/g' },
];
export const QUANTITY_UNITS = [
  { value: 'g', text: 'g' },
  { value: 'mL', text: 'mL' },
];
const SU = { percent: '%', 'mg-ml': ' mg/mL', 'mg-g': ' mg/g' };
const VOLUME_NOTE = 'Quantities are taken to add up. That holds for weights. For volumes it holds only when the liquids mix without shrinking: alcohol and water do not, so make such a mixture up to the final volume instead of adding the two measured volumes.';
const IDENTITY_NOTE = 'An arithmetic identity (mass balance): the drug in the parts equals the drug in the mixture. The tool does the arithmetic; it does not say what to make.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
// Six significant figures, without trailing zeros: 1.5384615 -> 1.53846.
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

// The parts in lowest terms: 10 and 40 read 1 : 4. Whole numbers divide by their common factor;
// anything else is scaled so the smaller part is 1.
function lowestTerms(a, b) {
  if (a === 0 || b === 0) return [a === 0 ? 0 : 1, b === 0 ? 0 : 1];
  if (Number.isInteger(a) && Number.isInteger(b)) {
    let x = a; let y = b;
    while (y) [x, y] = [y, x % y];
    return [a / x, b / x];
  }
  const small = Math.min(a, b);
  return [sig(a / small), sig(b / small)];
}

function medial(o, su, qu) {
  const lines = String(o.lots ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { valid: false, message: 'Enter at least two lots, one per line: strength, quantity.' };
  let drug = 0;
  let total = 0;
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2) return { valid: false, message: `Lot line ${i + 1}: enter the strength, a comma, then the quantity.` };
    const f = inputFault([[`the strength on lot line ${i + 1}`, p[0], 0, 1e6, ''], [`the quantity on lot line ${i + 1}`, p[1], null, 1e9, '']]);
    if (f) return { valid: false, message: f };
    if (su === '%' && Number(p[0]) > 100) return { valid: false, message: `Lot line ${i + 1}: a percent strength cannot be above 100.` };
    drug += Number(p[0]) * Number(p[1]);
    total += Number(p[1]);
  }
  const result = drug / total;
  const notes = [`Sum of strength × quantity = ${show(drug)}; sum of quantities = ${show(total)} ${qu}; ${show(drug)} ÷ ${show(total)} = ${show(result)}${su}.`];
  if (qu === 'mL') notes.push(VOLUME_NOTE);
  return {
    valid: true, mode: 'medial', strength: sig(result), total: sig(total),
    band: `${lines.length} lots mixed give ${show(total)} ${qu} at ${show(result)}${su}.`,
    bandLabel: `${show(result)}${su}`,
    notes, note: IDENTITY_NOTE,
  };
}

export function alligation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  // Nothing is defaulted: the mode decides the arithmetic and the units decide what the answer says.
  const mode = String(o.mode ?? '').trim();
  if (mode !== 'two' && mode !== 'medial') return { valid: false, message: 'Choose the mode: two strengths to a target, or several lots mixed together.' };
  const suKey = String(o.strengthUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(SU, suKey)) return { valid: false, message: 'Choose the strength unit: %, mg/mL or mg/g.' };
  const su = SU[suKey];
  const qu = String(o.quantityUnit ?? '').trim();
  if (qu !== 'g' && qu !== 'mL') return { valid: false, message: 'Choose the quantity unit: g or mL.' };
  if (mode === 'medial') return medial(o, su, qu);

  const top = su === '%' ? 100 : 1e6;
  const f = inputFault([['the higher strength', o.higher, 0, top, ''], ['the lower strength', o.lower, 0, top, ''], ['the target strength', o.target, 0, top, '']]);
  if (f) return { valid: false, message: f };
  const h = Number(o.higher); const l = Number(o.lower); const t = Number(o.target);
  if (!(h > l)) return { valid: false, message: 'The higher strength must be above the lower strength.' };
  if (t > h || t < l) return { valid: false, message: `A target of ${show(t)}${su} is outside the two strengths (${show(l)}${su} to ${show(h)}${su}); no mixture of them can reach it.` };

  const given = [['total', o.total], ['higherQty', o.higherQty], ['lowerQty', o.lowerQty]].filter(([, v]) => !blank(v));
  if (given.length !== 1) return { valid: false, message: 'Enter exactly one quantity: the total wanted, or the amount of the higher strength on hand, or the amount of the lower strength on hand.' };
  const [which, raw] = given[0];
  const label = { total: 'the total wanted', higherQty: 'the amount of the higher strength', lowerQty: 'the amount of the lower strength' }[which];
  const qf = inputFault([[label, raw, null, 1e9, qu]]);
  if (qf) return { valid: false, message: qf };
  const q = Number(raw);

  const partsHigh = t - l; const partsLow = h - t;
  let qHigh; let qLow;
  if (which === 'total') { qHigh = q * partsHigh / (h - l); qLow = q - qHigh; }
  else if (which === 'higherQty') {
    if (partsHigh === 0) return { valid: false, message: 'The target equals the lower strength, so the mixture is all of the lower strength: none of the higher strength can be used.' };
    qHigh = q; qLow = q * partsLow / partsHigh;
  } else {
    if (partsLow === 0) return { valid: false, message: 'The target equals the higher strength, so the mixture is all of the higher strength: none of the lower strength can be used.' };
    qLow = q; qHigh = q * partsHigh / partsLow;
  }
  const total = qHigh + qLow;
  const nameHigh = h === 100 && su === '%' ? 'pure drug (100%)' : `the ${show(h)}${su} strength`;
  const nameLow = l === 0 ? 'diluent (0)' : `the ${show(l)}${su} strength`;
  const [ratioHigh, ratioLow] = lowestTerms(sig(partsHigh), sig(partsLow));
  const notes = [
    `Parts: ${show(partsHigh)} of ${nameHigh} to ${show(partsLow)} of ${nameLow} (${show(t)} − ${show(l)} and ${show(h)} − ${show(t)}), which is ${show(ratioHigh)} to ${show(ratioLow)}.`,
    `Check: ${show(h)} × ${show(qHigh)} + ${show(l)} × ${show(qLow)} = ${show(h * qHigh + l * qLow)}, and ${show(t)} × ${show(total)} = ${show(t * total)}.`,
  ];
  if (partsHigh === 0 || partsLow === 0) notes.unshift(`The target equals one of the strengths, so the mixture is all of ${partsHigh === 0 ? nameLow : nameHigh}.`);
  if (qu === 'mL') notes.push(VOLUME_NOTE);
  return {
    valid: true, mode: 'two',
    partsHigher: ratioHigh, partsLower: ratioLow,
    higherQty: sig(qHigh), lowerQty: sig(qLow), total: sig(total),
    band: `${show(qHigh)} ${qu} of ${nameHigh} with ${show(qLow)} ${qu} of ${nameLow} makes ${show(total)} ${qu} at ${show(t)}${su}.`,
    bandLabel: `${show(ratioHigh)} : ${show(ratioLow)} parts`,
    notes, note: IDENTITY_NOTE,
  };
}
