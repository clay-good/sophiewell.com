// spec-v1629 tool 6: salt, base and hydrate conversion factor.
//
// Stoichiometry: two chemical forms of one drug (a salt and its base, a hydrate and the anhydrous
// form, an ester and the parent) carry the same active moiety in different weights.
//   factor = (MW of form A / active moieties in A) / (MW of form B / active moieties in B)
//   weight of A that carries a weight of B = that weight x factor;  the reverse divides.
// The molecular weights are typed, or computed from formulas by lib/molecular-weight-v1629.js
// (IUPAC CIAAW 2024 atomic weights). The number of active moieties per formula unit is 1 unless the
// salt carries two (a sulfate of two drug molecules, for example).
//
// The label's own equivalency statement, where it prints one, is the figure for that product: the
// tool computes from formulas and says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { molecularWeight } from './molecular-weight-v1629.js';

export const QUANTITY_OF = [
  { value: 'b', text: 'Form B (find the weight of form A that carries it)' },
  { value: 'a', text: 'Form A (find the weight of form B it carries)' },
];
const NOTE = 'Stoichiometry on the formulas or molecular weights entered. Where a product label prints its own equivalency statement, that statement is the figure for that product. The tool does the arithmetic; it does not say what to give or make.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

// One form's molecular weight: typed, or from a formula. Exactly one of the two.
function formWeight(label, formula, mw) {
  const haveF = !blank(formula); const haveM = !blank(mw);
  if (haveF === haveM) return { error: `For ${label}, enter either its formula or its molecular weight, not both and not neither.` };
  if (haveM) {
    const f = inputFault([[`the molecular weight of ${label}`, mw, null, 1e6, 'g/mol']]);
    return f ? { error: f } : { mw: Number(mw), from: `${show(Number(mw))} g/mol as entered` };
  }
  const r = molecularWeight({ formula });
  if (!r.valid) return { error: `${label[0].toUpperCase()}${label.slice(1)}: ${r.message}` };
  return { mw: r.molecularWeightUnrounded, from: `${String(formula).replace(/\s+/g, '')} = ${show(r.molecularWeightUnrounded)} g/mol` };
}

function moieties(label, v) {
  if (blank(v)) return { n: 1, stated: false };
  const f = inputFault([[`the active moieties per formula unit of ${label}`, v, 1, 12, '']]);
  if (f) return { error: f };
  if (!Number.isInteger(Number(v))) return { error: `The active moieties per formula unit of ${label} must be a whole number.` };
  return { n: Number(v), stated: true };
}

export function saltBaseFactor(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const a = formWeight('form A', o.aFormula, o.aMw);
  if (a.error) return { valid: false, message: a.error };
  const b = formWeight('form B', o.bFormula, o.bMw);
  if (b.error) return { valid: false, message: b.error };
  const na = moieties('form A', o.aMoieties);
  if (na.error) return { valid: false, message: na.error };
  const nb = moieties('form B', o.bMoieties);
  if (nb.error) return { valid: false, message: nb.error };
  const perA = a.mw / na.n; const perB = b.mw / nb.n;
  const factor = perA / perB;
  const notes = [
    `Form A: ${a.from}${na.n > 1 ? `, ${na.n} active moieties per formula unit, so ${show(perA)} g per mole of moiety` : ''}.`,
    `Form B: ${b.from}${nb.n > 1 ? `, ${nb.n} active moieties per formula unit, so ${show(perB)} g per mole of moiety` : ''}.`,
    `Factor A over B: ${show(perA)} ÷ ${show(perB)} = ${show(factor)}. Factor B over A: ${show(1 / factor)}.`,
  ];
  if (!na.stated || !nb.stated) notes.push(`Active moieties per formula unit ${!na.stated && !nb.stated ? 'were not entered and are' : `of form ${!na.stated ? 'A' : 'B'} was not entered and is`} taken as 1; a salt that carries two drug molecules needs 2 there.`);
  const out = { valid: true, factorAoverB: sig(factor), factorBoverA: sig(1 / factor) };
  let band = `1 g of form B is carried by ${show(factor)} g of form A; 1 g of form A carries ${show(1 / factor)} g of form B.`;
  if (!blank(o.quantity)) {
    const of = String(o.quantityOf ?? '').trim();
    if (of !== 'a' && of !== 'b') return { valid: false, message: 'Choose which form the quantity is a weight of: form A or form B.' };
    const qf = inputFault([['the quantity', o.quantity, null, 1e9, '']]);
    if (qf) return { valid: false, message: qf };
    const q = Number(o.quantity);
    if (of === 'b') {
      out.quantityA = sig(q * factor);
      band = `${show(q)} of form B is carried by ${show(q * factor)} of form A (the same unit).`;
      notes.push(`${show(q)} × ${show(factor)} = ${show(q * factor)}.`);
    } else {
      out.quantityB = sig(q / factor);
      band = `${show(q)} of form A carries ${show(q / factor)} of form B (the same unit).`;
      notes.push(`${show(q)} ÷ ${show(factor)} = ${show(q / factor)}.`);
    }
  } else notes.push('No quantity was entered, so only the factor is given.');
  return { ...out, band, bandLabel: `× ${show(factor)} (A per B)`, notes, note: NOTE };
}
