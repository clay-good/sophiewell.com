// spec-v1629 tool 15: percent ionized at a pH.
//
// Physical chemistry, not a cited table: the mass-action expression for a weak acid in logarithmic
// form (the Henderson-Hasselbalch equation), solved for the ionized fraction.
//   weak acid:  % ionized = 100 / (1 + 10^(pKa - pH))
//   weak base:  % ionized = 100 / (1 + 10^(pH - pKa)),  pKa of the conjugate acid
// The same pH and pKa give opposite answers for an acid and a base, so the type is a required choice.
//
// The pKa is reader input; none ships. One pKa only: a drug with more than one ionizable group is
// answered for the pKa entered, and the result says so. No absorption claim is made.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const DRUG_TYPES = [
  { value: 'acid', text: 'Weak acid' },
  { value: 'base', text: 'Weak base' },
];
const ION_NOTE = 'The mass-action expression for a weak acid, in logarithmic form. One pKa only: a drug with more than one ionizable group is answered for the pKa entered. This is the fraction ionized in solution at that pH; it says nothing about absorption.';

const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
const PKA = (v) => ['the pKa', v, -5, 20, ''];

export function percentIonized(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = String(o.type ?? '').trim();
  if (type !== 'acid' && type !== 'base') return { valid: false, message: 'Choose whether the drug is a weak acid or a weak base: the same pH and pKa give opposite answers.' };
  const f = inputFault([PKA(o.pKa), ['the pH', o.pH, 0, 14, '']]);
  if (f) return { valid: false, message: f };
  const pKa = Number(o.pKa); const pH = Number(o.pH);
  const exponent = type === 'acid' ? pKa - pH : pH - pKa;
  const ionized = 100 / (1 + 10 ** exponent);
  const un = 100 - ionized;
  const r1 = (x) => (x >= 0.1 && x <= 99.9 ? Math.round(x * 10) / 10 : sig(x));
  const ratio = ionized / un;
  return {
    valid: true, percentIonized: r1(ionized), percentUnionized: r1(un),
    band: `${r1(ionized)}% ionized and ${r1(un)}% un-ionized at pH ${show(pH)}.`,
    bandLabel: `${r1(ionized)}% ionized`,
    notes: [
      `Weak ${type}: 100 ÷ (1 + 10^(${type === 'acid' ? `${show(pKa)} − ${show(pH)}` : `${show(pH)} − ${show(pKa)}`})) = 100 ÷ (1 + ${show(10 ** exponent)}) = ${r1(ionized)}%.`,
      `Ionized to un-ionized: ${ratio >= 1 ? `${show(ratio)} to 1` : `1 to ${show(1 / ratio)}`}.`,
    ],
    note: ION_NOTE,
  };
}
