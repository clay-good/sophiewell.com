// spec-v1629 tool 2: dilution and stock solutions.
//
// An arithmetic identity: the amount of solute does not change on dilution, so
//   C1 x Q1 = C2 x Q2
// once both strengths are in one unit. Any three of the four terms give the fourth. Nothing here is
// cited to a textbook or a compendium (spec-v1628 section 2).
//
// Strength units, by basis:
//   weight in volume   % w/v (g per 100 mL), mg/mL, mcg/mL, ratio 1:X (1 g in X mL), ppm read as mg/L
//   weight in weight   % w/w
//   volume in volume   % v/v
// The weight-in-volume units convert among themselves (1% w/v = 10 mg/mL = 1:100 = 10,000 mg/L). % w/w
// and % v/v each work only against themselves, with one exception the bench meets daily: a w/w stock
// (a concentrated acid, a stock ointment base) made into a w/v product, which needs the stock's
// specific gravity:  mg of solute per mL of stock = (% w/w / 100) x specific gravity x 1,000.
// Without it the tool refuses; it never assumes 1.
//
// The diluent line reads "add diluent to make Q2", never "add exactly Q2 - Q1": volumes are not always
// additive. Reading ppm as mg/L holds for dilute water-based solutions, and the result says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const UNITS = [
  { value: 'pct-wv', text: '% w/v' },
  { value: 'mg-ml', text: 'mg/mL' },
  { value: 'mcg-ml', text: 'mcg/mL' },
  { value: 'ratio', text: 'ratio 1:X (enter X)' },
  { value: 'ppm', text: 'ppm (as mg/L)' },
  { value: 'pct-ww', text: '% w/w' },
  { value: 'pct-vv', text: '% v/v' },
];
// Weight-in-volume units as mg/mL per one unit; a ratio is 1000 / X.
const WV = { 'pct-wv': 10, 'mg-ml': 1, 'mcg-ml': 0.001, ppm: 0.001 };
const BASIS = { 'pct-wv': 'wv', 'mg-ml': 'wv', 'mcg-ml': 'wv', ratio: 'wv', ppm: 'wv', 'pct-ww': 'ww', 'pct-vv': 'vv' };
const MAX = { 'pct-wv': 100, 'pct-ww': 100, 'pct-vv': 100, 'mg-ml': 1e6, 'mcg-ml': 1e9, ratio: 1e9, ppm: 1e6 };
const IDENTITY_NOTE = 'An arithmetic identity: the amount of solute does not change on dilution (C1 × Q1 = C2 × Q2). The tool does the arithmetic; it does not say what to make.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
const withUnit = (x, unit) => (unit === 'ratio' ? `1:${show(x)}` : unit === 'ppm' ? `${show(x)} ppm` : `${show(x)}${{ 'pct-wv': '% w/v', 'pct-ww': '% w/w', 'pct-vv': '% v/v', 'mg-ml': ' mg/mL', 'mcg-ml': ' mcg/mL' }[unit]}`);

// A strength in its basis's common unit (mg/mL for weight in volume, percent otherwise), and back.
const toCommon = (x, unit) => (unit === 'ratio' ? 1000 / x : BASIS[unit] === 'wv' ? x * WV[unit] : x);
const fromCommon = (c, unit) => (unit === 'ratio' ? 1000 / c : BASIS[unit] === 'wv' ? c / WV[unit] : c);

export function dilutionC1V1(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const u1 = String(o.stockUnit ?? '').trim();
  const u2 = String(o.finalUnit ?? '').trim();
  if (!BASIS[u1] || !Object.prototype.hasOwnProperty.call(BASIS, u1)) return { valid: false, message: 'Choose the unit of the stock strength.' };
  if (!BASIS[u2] || !Object.prototype.hasOwnProperty.call(BASIS, u2)) return { valid: false, message: 'Choose the unit of the final strength.' };

  const terms = [
    ['c1', 'the stock strength', o.stockStrength, MAX[u1]],
    ['q1', 'the stock quantity', o.stockQuantity, 1e9],
    ['c2', 'the final strength', o.finalStrength, MAX[u2]],
    ['q2', 'the final quantity', o.finalQuantity, 1e9],
  ];
  const missing = terms.filter(([, , v]) => blank(v));
  if (missing.length !== 1) return { valid: false, message: 'Enter any three of the stock strength, the stock quantity, the final strength and the final quantity; leave the one to solve for blank.' };
  const solve = missing[0][0];
  const f = inputFault(terms.filter(([k]) => k !== solve).map(([, label, v, hi]) => [label, v, null, hi, '']));
  if (f) return { valid: false, message: f };

  // The one cross-basis case: a w/w stock made into a weight-in-volume product, through specific gravity.
  const cross = BASIS[u1] === 'ww' && BASIS[u2] === 'wv';
  if (BASIS[u1] !== BASIS[u2] && !cross) {
    return { valid: false, message: 'These two strength units are on different bases (weight in volume, weight in weight, volume in volume) and cannot be set against each other. The one crossing this tool makes is a % w/w stock into a weight-in-volume product, with the stock\'s specific gravity.' };
  }
  let sg = null;
  if (cross) {
    if (blank(o.specificGravity)) return { valid: false, message: 'A % w/w stock made into a weight-in-volume product needs the stock\'s specific gravity (from its label or certificate of analysis). It is not assumed to be 1.' };
    const sf = inputFault([['the specific gravity of the stock', o.specificGravity, 0.3, 25, '']]);
    if (sf) return { valid: false, message: sf };
    sg = Number(o.specificGravity);
  }
  const stockCommon = (x) => (cross ? (x / 100) * sg * 1000 : toCommon(x, u1));
  const stockBack = (c) => (cross ? (c / (sg * 1000)) * 100 : fromCommon(c, u1));

  let c1 = solve === 'c1' ? null : stockCommon(Number(o.stockStrength));
  let q1 = solve === 'q1' ? null : Number(o.stockQuantity);
  let c2 = solve === 'c2' ? null : toCommon(Number(o.finalStrength), u2);
  let q2 = solve === 'q2' ? null : Number(o.finalQuantity);
  if (solve === 'c1') c1 = (c2 * q2) / q1;
  else if (solve === 'q1') q1 = (c2 * q2) / c1;
  else if (solve === 'c2') c2 = (c1 * q1) / q2;
  else q2 = (c1 * q1) / c2;

  if (c2 > c1 * (1 + 1e-12)) return { valid: false, message: 'The final strength comes out above the stock strength, which a dilution cannot do. Check the values and their units.' };
  const s1 = stockBack(c1); const s2 = fromCommon(c2, u2);
  if (u1 !== 'ratio' && s1 > MAX[u1] * (1 + 1e-9)) return { valid: false, message: `The stock strength comes out at ${withUnit(s1, u1)}, which is not a possible strength. Check the values and their units.` };

  const qu = BASIS[u2] === 'ww' ? 'g' : 'mL';
  const stockQu = BASIS[u1] === 'ww' && !cross ? 'g' : 'mL';
  const factor = c1 / c2;
  const answer = {
    c1: `Stock strength: ${withUnit(s1, u1)}`,
    q1: `Stock needed: ${show(q1)} ${stockQu}`,
    c2: `Final strength: ${withUnit(s2, u2)}`,
    q2: `Final quantity: ${show(q2)} ${qu}`,
  }[solve];
  const notes = [
    `${withUnit(s1, u1)} × ${show(q1)} ${stockQu} = ${withUnit(s2, u2)} × ${show(q2)} ${qu}${u1 === u2 ? '' : `, with both strengths as ${BASIS[u2] === 'wv' ? `${show(c1)} and ${show(c2)} mg/mL` : 'percent'}`}.`,
    qu === 'mL'
      ? `Measure ${show(q1)} ${stockQu} of stock and add diluent to make ${show(q2)} mL. Do not measure the diluent as ${show(q2 - q1)} mL and add it: volumes are not always additive.`
      : `Weigh ${show(q1)} g of stock and add diluent to make ${show(q2)} g (${show(q2 - q1)} g of diluent; weights add).`,
    `Dilution factor: ${show(factor)} (1 part of stock in ${show(factor)} parts of product).`,
  ];
  if (cross) notes.push(`A ${show(s1)}% w/w stock at specific gravity ${show(sg)} holds ${show(c1)} mg of solute per mL; ${show(q1)} mL of it weighs ${show(q1 * sg)} g.`);
  if (u1 === 'ppm' || u2 === 'ppm') notes.push('ppm is read here as mg per liter, which holds for dilute water-based solutions only.');
  return {
    valid: true, solvedFor: solve,
    stockStrength: sig(s1), stockQuantity: sig(q1), finalStrength: sig(s2), finalQuantity: sig(q2),
    dilutionFactor: sig(factor),
    band: `${answer}.`,
    bandLabel: answer.split(': ')[1],
    notes, note: IDENTITY_NOTE,
  };
}
