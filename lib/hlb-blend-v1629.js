// spec-v1629 tool 22: emulsifier blend for a required HLB (Griffin).
//
// Both papers were re-read on October 10, 2026 in the Society of Cosmetic Chemists library:
//   Griffin WC. Classification of surface-active agents by "HLB". J Soc Cosmet Chem.
//   1949;1(5):311-326: "the HLB values are additive in behavior. Thus, if we blend three parts of
//   emulsifier A having an HLB of 8 and one part of an emulsifier B having an HLB of 16, the resulting
//   HLB of the blend will be the sum of three-quarters of 8 and one-quarter of 16 ... or 10."
//   Griffin WC. Calculation of HLB values of non-ionic surfactants. J Soc Cosmet Chem.
//   1954;5(4):249-256: HLB = 20(1 - S/A) for polyhydric alcohol fatty acid esters (S the
//   saponification number of the ester, A the acid number of the acid); HLB = (E + P)/5 (E and P the
//   weight percentages of oxyethylene and of polyhydric alcohol); HLB = E/5 where ethylene oxide is
//   the only hydrophilic portion. "These formulas are satisfactory for non-ionic surfactants of many
//   types. However, non-ionic surfactants containing propylene oxide, butylene oxide, nitrogen,
//   sulfur, etc., exhibit behavior which has not been related to composition", and for ionic
//   surfactants "the experimental method must be used."
//
//   Blend of two for a required HLB:  fraction of A = (required - HLB of B) / (HLB of A - HLB of B)
//   HLB of a mixture, or required HLB of an oil phase:  sum(weight x HLB) / sum(weight)
//
// The 1954 paper prints its three worked answers rounded (3.8, 14 and 15); the tool gives the
// arithmetic (3.74, 14.36, 15.2) and, for those inputs, the paper's printed figure beside it.
// No HLB table ships: Griffin's tables list trade-named products of the 1950s, and today's values
// come from a supplier's data sheet. A required HLB outside the two emulsifiers' values is refused.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'blend', text: 'Blend two emulsifiers to a required HLB' },
  { value: 'mixture', text: 'HLB of a mixture of emulsifiers' },
  { value: 'oil', text: 'Required HLB of an oil phase' },
  { value: 'sap', text: 'Estimate from saponification and acid numbers' },
  { value: 'eo', text: 'Estimate from oxyethylene content' },
];
const LIMIT = 'Griffin limits these formulas to non-ionic surfactants: those containing propylene oxide, butylene oxide, nitrogen or sulfur, and all ionic surfactants, need the experimental method.';
const NOTE = 'Griffin\'s HLB system: HLB values add by weight fraction. HLB values and required HLB values are yours to supply from the supplier\'s data sheet; none ships here. The tool does the arithmetic and does not say what to make.';
// The 1954 paper's own worked examples and the rounded answers it prints.
const PRINTED = [
  { mode: 'sap', a: 161, b: 198, printed: '3.8' },
  { mode: 'eo', a: 65.1, b: 6.7, printed: '14' },
  { mode: 'eo', a: 76, b: null, printed: '15' },
];

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
const r2 = (x) => Math.round(x * 100) / 100;

// Lines of "weight, HLB" -> the weighted mean.
function weighted(text, what, valueName) {
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { error: `Enter at least two ${what}, one per line: weight (or parts), then ${valueName}.` };
  if (lines.length > 40) return { error: `${lines.length} lines is more than the 40 this tool sums.` };
  let sum = 0; let total = 0; const working = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2) return { error: `Line ${i + 1}: enter the weight, a comma, then ${valueName}.` };
    const f = inputFault([[`the weight on line ${i + 1}`, p[0], null, 1e9, ''], [`${valueName} on line ${i + 1}`, p[1], 0, 40, '']]);
    if (f) return { error: f };
    sum += Number(p[0]) * Number(p[1]); total += Number(p[0]);
    working.push(`${show(Number(p[0]))} × ${show(Number(p[1]))}`);
  }
  return { hlb: sum / total, sum, total, working, count: lines.length };
}

export function hlbBlend(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose what to work out: a blend of two emulsifiers, the HLB of a mixture, the required HLB of an oil phase, or an estimate.' };

  if (mode === 'blend') {
    const f = inputFault([['the required HLB', o.required, 0, 40, ''], ['the HLB of emulsifier A', o.hlbA, 0, 40, ''], ['the HLB of emulsifier B', o.hlbB, 0, 40, '']]);
    if (f) return { valid: false, message: f };
    const req = Number(o.required); const a = Number(o.hlbA); const b = Number(o.hlbB);
    if (a === b) return { valid: false, message: 'The two emulsifiers have the same HLB, so no blend of them changes it.' };
    if (req > Math.max(a, b) || req < Math.min(a, b)) return { valid: false, message: `A required HLB of ${show(req)} is outside the two emulsifiers' values (${show(Math.min(a, b))} to ${show(Math.max(a, b))}); no blend of them reaches it.` };
    const fa = (req - b) / (a - b); const fb = 1 - fa;
    const notes = [
      `Fraction of A: (${show(req)} − ${show(b)}) ÷ (${show(a)} − ${show(b)}) = ${show(fa)}; fraction of B: ${show(fb)}.`,
      `Check: ${show(fa)} × ${show(a)} + ${show(fb)} × ${show(b)} = ${show(fa * a + fb * b)}.`,
    ];
    const out = { valid: true, mode, fractionA: sig(fa), fractionB: sig(fb) };
    let band = `${show(fa * 100)}% of emulsifier A and ${show(fb * 100)}% of emulsifier B give an HLB of ${show(req)}.`;
    if (!blank(o.totalWeight)) {
      const wf = inputFault([['the total emulsifier weight', o.totalWeight, null, 1e9, 'g']]);
      if (wf) return { valid: false, message: wf };
      const W = Number(o.totalWeight);
      out.gramsA = sig(fa * W); out.gramsB = sig(fb * W);
      band = `${show(fa * W)} g of emulsifier A and ${show(fb * W)} g of emulsifier B (${show(W)} g in all) give an HLB of ${show(req)}.`;
      notes.push(`For ${show(W)} g: ${show(fa)} × ${show(W)} = ${show(fa * W)} g of A and ${show(fb * W)} g of B.`);
    } else notes.push('No total emulsifier weight was entered, so the blend is given as percentages only.');
    return { ...out, band, bandLabel: `${show(fa * 100)}% A, ${show(fb * 100)}% B`, notes, note: NOTE };
  }

  if (mode === 'mixture' || mode === 'oil') {
    const oil = mode === 'oil';
    const w = weighted(oil ? o.oils : o.emulsifiers, oil ? 'oils' : 'emulsifiers', oil ? 'its required HLB' : 'its HLB');
    if (w.error) return { valid: false, message: w.error };
    return {
      valid: true, mode, hlb: r2(w.hlb),
      band: oil ? `Required HLB of the oil phase: ${r2(w.hlb)}.` : `HLB of the mixture: ${r2(w.hlb)}.`,
      bandLabel: `HLB ${r2(w.hlb)}`,
      notes: [`(${w.working.join(' + ')}) ÷ ${show(w.total)} = ${show(w.sum)} ÷ ${show(w.total)} = ${r2(w.hlb)}.`],
      note: NOTE,
    };
  }

  let hlb; const notes = []; let a; let b = null;
  if (mode === 'sap') {
    const f = inputFault([['the saponification number of the ester', o.sapNumber, null, 1000, ''], ['the acid number of the fatty acid', o.acidNumber, null, 1000, '']]);
    if (f) return { valid: false, message: f };
    a = Number(o.sapNumber); b = Number(o.acidNumber);
    if (!(a < b)) return { valid: false, message: 'The saponification number of the ester must be below the acid number of its fatty acid; otherwise the formula gives an HLB of zero or less. Check the two values.' };
    hlb = 20 * (1 - a / b);
    notes.push(`HLB = 20 × (1 − ${show(a)} ÷ ${show(b)}) = ${r2(hlb)} (Griffin 1954, for polyhydric alcohol fatty acid esters).`);
  } else {
    const f = inputFault([['the weight percent of oxyethylene', o.oxyethylenePercent, null, 100, '']]);
    if (f) return { valid: false, message: f };
    a = Number(o.oxyethylenePercent);
    if (!blank(o.polyolPercent)) {
      const pf = inputFault([['the weight percent of polyhydric alcohol', o.polyolPercent, 0, 100, '']]);
      if (pf) return { valid: false, message: pf };
      b = Number(o.polyolPercent);
      if (a + b > 100) return { valid: false, message: 'The oxyethylene and polyhydric alcohol percentages add to more than 100. Check the two values.' };
      hlb = (a + b) / 5;
      notes.push(`HLB = (${show(a)} + ${show(b)}) ÷ 5 = ${r2(hlb)} (Griffin 1954).`);
    } else {
      hlb = a / 5;
      notes.push(`HLB = ${show(a)} ÷ 5 = ${r2(hlb)} (Griffin 1954, where ethylene oxide is the only hydrophilic portion; no polyhydric alcohol percent was entered).`);
    }
  }
  const printed = PRINTED.find((e) => e.mode === mode && e.a === a && e.b === b);
  if (printed) notes.push(`This is the paper's own worked example, which prints ${printed.printed}; the arithmetic gives ${r2(hlb)}.`);
  notes.push(LIMIT);
  return { valid: true, mode, hlb: r2(hlb), paperPrints: printed ? printed.printed : null, band: `Estimated HLB: ${r2(hlb)}.`, bandLabel: `HLB ${r2(hlb)}`, notes, note: NOTE };
}
