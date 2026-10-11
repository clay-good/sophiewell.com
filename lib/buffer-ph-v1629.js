// spec-v1629 tool 14: buffer pH and buffer composition (Henderson-Hasselbalch).
//
// Physical chemistry, not a cited table: the mass-action expression for a weak acid in logarithmic
// form (the Henderson-Hasselbalch equation).
//   weak acid and its salt:   pH = pKa + log10([salt] / [acid])
//   weak base and its salt:   pH = pKa + log10([base] / [salt]),  pKa of the conjugate acid
//   reverse:                  ratio = 10^(pH - pKa);  the larger-pH species = total x ratio / (1 + ratio)
// In both pairs the ratio is (proton acceptor) / (proton donor): salt over acid, or base over its salt.
// The weak-base form is therefore not the acid form with the ratio turned over twice; the species
// simply change names.
//
// The pKa is reader input, at the working temperature; none ships. The equation ignores activity
// and holds near the pKa: a ratio beyond 10 to 1 either way (more than 1 pH unit from the pKa) is
// flagged, as arithmetic and not as a cited band.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const PAIRS = [
  { value: 'acid', text: 'Weak acid and its salt' },
  { value: 'base', text: 'Weak base and its salt' },
];
export const BUFFER_MODES = [
  { value: 'ph', text: 'pH from the two concentrations' },
  { value: 'compose', text: 'Composition for a target pH' },
];
const LIMIT_NOTE = 'The equation ignores activity and is reliable only near the pKa.';
const BUFFER_NOTE = `The Henderson-Hasselbalch equation: the mass-action expression for a weak acid, in logarithmic form. The pKa is yours to supply, at the temperature you work at. ${LIMIT_NOTE} The tool does the arithmetic; it does not say what to make.`;

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
const r2 = (x) => Math.round(x * 100) / 100;
const PKA = (v) => ['the pKa', v, -5, 20, ''];
const names = (pair) => (pair === 'acid' ? { acceptor: 'salt', donor: 'acid' } : { acceptor: 'base', donor: 'salt' });
const farNote = (ratio) => (ratio > 10 || ratio < 0.1 ? 'This is more than 1 pH unit from the pKa (a ratio beyond 10 to 1), outside the range where this pair buffers well.' : null);

export function bufferPh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pair = String(o.pair ?? '').trim();
  if (pair !== 'acid' && pair !== 'base') return { valid: false, message: 'Choose the buffer pair: a weak acid and its salt, or a weak base and its salt.' };
  const mode = String(o.mode ?? '').trim();
  if (mode !== 'ph' && mode !== 'compose') return { valid: false, message: 'Choose what to work out: the pH from the two concentrations, or the composition for a target pH.' };
  const n = names(pair);
  const pf = inputFault([PKA(o.pKa)]);
  if (pf) return { valid: false, message: `${pf}${blank(o.pKa) ? ' It is not assumed: take it from a reference, for the temperature you work at' + (pair === 'base' ? ', as the pKa of the conjugate acid.' : '.') : ''}` };
  const pKa = Number(o.pKa);

  if (mode === 'ph') {
    const f = inputFault([[`the ${n.acceptor} concentration`, o.acceptor, null, 100, 'mol/L'], [`the ${n.donor} concentration`, o.donor, null, 100, 'mol/L']]);
    if (f) return { valid: false, message: f };
    const a = Number(o.acceptor); const d = Number(o.donor);
    const ratio = a / d;
    const pH = pKa + Math.log10(ratio);
    const notes = [`pH = ${show(pKa)} + log10(${show(a)} ÷ ${show(d)}) = ${show(pKa)} + ${show(Math.log10(ratio))} = ${r2(pH)}.`, `Ratio of ${n.acceptor} to ${n.donor}: ${show(ratio)} to 1.`];
    if (farNote(ratio)) notes.push(farNote(ratio));
    return { valid: true, mode, pH: r2(pH), ratio: sig(ratio), band: `pH ${r2(pH)}.`, bandLabel: `pH ${r2(pH)}`, abnormal: Boolean(farNote(ratio)), notes, note: BUFFER_NOTE };
  }

  const f = inputFault([['the target pH', o.targetPh, 0, 14, ''], ['the total buffer concentration', o.total, null, 100, 'mol/L']]);
  if (f) return { valid: false, message: f };
  const pH = Number(o.targetPh); const total = Number(o.total);
  const ratio = 10 ** (pH - pKa);
  const acceptor = total * ratio / (1 + ratio); const donor = total - acceptor;
  const notes = [
    `Ratio of ${n.acceptor} to ${n.donor} = 10^(${show(pH)} − ${show(pKa)}) = ${show(ratio)}.`,
    `${n.acceptor[0].toUpperCase()}${n.acceptor.slice(1)}: ${show(total)} × ${show(ratio)} ÷ (1 + ${show(ratio)}) = ${show(acceptor)} mol/L. ${n.donor[0].toUpperCase()}${n.donor.slice(1)}: ${show(total)} − ${show(acceptor)} = ${show(donor)} mol/L.`,
  ];
  const out = { valid: true, mode, ratio: sig(ratio), acceptorMolar: sig(acceptor), donorMolar: sig(donor) };
  const haveGrams = !blank(o.volumeMl) || !blank(o.acceptorMw) || !blank(o.donorMw);
  if (haveGrams) {
    const gf = inputFault([['the volume', o.volumeMl, null, 1e7, 'mL'], [`the molecular weight of the ${n.acceptor}`, o.acceptorMw, null, 1e5, 'g/mol'], [`the molecular weight of the ${n.donor}`, o.donorMw, null, 1e5, 'g/mol']]);
    if (gf) return { valid: false, message: `${gf} Grams need the volume and both molecular weights; leave all three blank for concentrations only.` };
    const L = Number(o.volumeMl) / 1000;
    out.acceptorGrams = sig(acceptor * Number(o.acceptorMw) * L); out.donorGrams = sig(donor * Number(o.donorMw) * L);
    notes.push(`For ${show(Number(o.volumeMl))} mL: ${n.acceptor} ${show(acceptor)} mol/L × ${show(Number(o.acceptorMw))} g/mol × ${show(L)} L = ${show(out.acceptorGrams)} g; ${n.donor} ${show(donor)} × ${show(Number(o.donorMw))} × ${show(L)} = ${show(out.donorGrams)} g. Use the molecular weight of the form you weigh, hydrate included.`);
  }
  if (farNote(ratio)) notes.push(farNote(ratio));
  return {
    ...out,
    band: haveGrams ? `${show(out.acceptorGrams)} g of ${n.acceptor} and ${show(out.donorGrams)} g of ${n.donor} for pH ${show(pH)}.` : `${show(acceptor)} mol/L of ${n.acceptor} and ${show(donor)} mol/L of ${n.donor} for pH ${show(pH)}.`,
    bandLabel: `${show(ratio)} to 1, ${n.acceptor} to ${n.donor}`,
    abnormal: Boolean(farNote(ratio)), notes, note: BUFFER_NOTE,
  };
}
