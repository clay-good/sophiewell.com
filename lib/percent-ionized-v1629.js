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
  // The un-ionized share from its own expression, not 100 minus a value that rounds to 100.
  const un = 100 / (1 + 10 ** -exponent);
  // A share that rounds to 100 or 0 while the other side is not 0 is shown as "nearly", never beside a nonzero other.
  const r1 = (x) => (x >= 0.1 && x <= 99.9 ? Math.round(x * 10) / 10 : sig(x));
  const pct = (x, other) => (other > 0 && sig(x) >= 100 ? 'nearly 100' : `${r1(x)}`);
  // Ionized to un-ionized is 10^(-exponent); past a million to one it is written as a power of ten.
  const ratioText = Math.abs(exponent) > 6 ? (exponent < 0 ? `10^${show(-exponent)} to 1` : `1 to 10^${show(exponent)}`) : (exponent <= 0 ? `${show(10 ** -exponent)} to 1` : `1 to ${show(10 ** exponent)}`);
  return {
    valid: true, percentIonized: r1(ionized), percentUnionized: r1(un),
    band: `${pct(ionized, un)}% ionized and ${pct(un, ionized)}% un-ionized at pH ${show(pH)}.`,
    bandLabel: `${pct(ionized, un)}% ionized`,
    notes: [
      `Weak ${type}: 100 ÷ (1 + 10^(${type === 'acid' ? `${show(pKa)} − ${show(pH)}` : `${show(pH)} − ${show(pKa)}`})) = 100 ÷ (1 + ${show(10 ** exponent)}) = ${pct(ionized, un)}%.`,
      `Ionized to un-ionized: ${ratioText}.`,
    ],
    note: ION_NOTE,
  };
}
