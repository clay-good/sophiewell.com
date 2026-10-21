// spec-v1629 tool 10: the aliquot method, solid or liquid.
//
// An arithmetic identity, proportion: a quantity too small to measure accurately is measured as a
// multiple, diluted, and a measurable part (the aliquot) carrying the quantity wanted is taken.
// Nothing here is cited to a textbook or a compendium (spec-v1628 section 2).
//
//   m = the smallest whole number with m x needed >= the minimum weighable quantity.
//   Solid:   weigh m x needed of drug; add diluent to make m x A of mixture; take one aliquot A.
//            Each of the three measurements must be at or above the minimum: the drug, the diluent
//            (m x A - m x needed) and the aliquot A. With no aliquot weight entered the tool uses
//            the smallest A that satisfies all three: the larger of the minimum and
//            needed + minimum / m.
//   Liquid:  weigh m x needed of drug; dissolve to volume V; the aliquot is V / m, which must be at
//            or above the smallest measurable volume, as must V.
//
// The minimum weighable quantity and the smallest measurable volume are reader input (see
// min-weighable-quantity); nothing is defaulted. A drug quantity already at or above the minimum
// needs no aliquot, and the tool says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const FORMS = [
  { value: 'solid', text: 'Solid (weigh, dilute with a powder, weigh an aliquot)' },
  { value: 'liquid', text: 'Liquid (weigh, dissolve, measure an aliquot)' },
];
const IDENTITY_NOTE = 'An arithmetic identity (proportion). The minimum weighable quantity and the smallest measurable volume are yours to supply from your devices; the tool does the arithmetic and does not say what to make.';
const MAX_MULTIPLE = 100000;

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
// Decided on the values themselves (0.9999996 mg is below a 1 mg minimum), with a hair of tolerance for float noise.
const atLeast = (x, min) => x >= min - 1e-9;
const check = (label, x, min, unit) => `${label}: ${show(x)} ${unit}, ${atLeast(x, min) ? 'at or above' : 'BELOW'} the minimum of ${show(min)} ${unit}.`;

export function aliquotMethod(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const form = String(o.form ?? '').trim();
  if (form !== 'solid' && form !== 'liquid') return { valid: false, message: 'Choose the method: a solid aliquot or a liquid aliquot.' };
  const f = inputFault([['the quantity of drug needed', o.needed, null, 1e9, 'mg'], ['the minimum weighable quantity', o.minimum, null, 1e9, 'mg']]);
  if (f) return { valid: false, message: f };
  const needed = Number(o.needed); const min = Number(o.minimum);
  if (atLeast(needed, min)) {
    return {
      valid: true, aliquotNeeded: false,
      band: `No aliquot is needed: ${show(needed)} mg is at or above the minimum weighable quantity of ${show(min)} mg.`,
      bandLabel: 'No aliquot needed',
      notes: ['Weigh the drug directly.'], note: IDENTITY_NOTE,
    };
  }
  const m = Math.ceil(sig(min / needed));
  if (m > MAX_MULTIPLE) return { valid: false, message: `That needs ${m.toLocaleString('en-US')} times the quantity, beyond what one aliquot step should carry. Use a serial dilution or a more sensitive balance.` };
  const drug = m * needed;

  if (form === 'solid') {
    let A;
    const chosen = !blank(o.aliquot);
    if (chosen) {
      const af = inputFault([['the aliquot weight', o.aliquot, null, 1e9, 'mg']]);
      if (af) return { valid: false, message: af };
      A = Number(o.aliquot);
      if (!(A > needed)) return { valid: false, message: `An aliquot of ${show(A)} mg cannot carry ${show(needed)} mg of drug with any diluent: the aliquot must weigh more than the drug in it.` };
    } else A = Math.max(min, needed + min / m);
    const mixture = m * A; const diluent = mixture - drug;
    const ok = atLeast(drug, min) && atLeast(diluent, min) && atLeast(A, min);
    const notes = [
      `Multiple: ${m} (the smallest whole number with ${m} × ${show(needed)} mg at or above ${show(min)} mg).`,
      check('Drug to weigh', drug, min, 'mg'),
      check('Diluent to weigh', diluent, min, 'mg'),
      check('Aliquot to weigh', A, min, 'mg'),
      `Check: the mixture is ${show(mixture)} mg holding ${show(drug)} mg of drug, so ${show(A)} mg of it holds ${show(drug)} × ${show(A)} ÷ ${show(mixture)} = ${show(needed)} mg.`,
    ];
    if (!chosen) notes.push(`No aliquot weight was entered, so the smallest one that keeps all three weighings at or above the minimum is used: the larger of ${show(min)} mg and ${show(needed)} + ${show(min)} ÷ ${m} mg.`);
    if (!ok) notes.push(`A measurement is below the minimum. With this multiple, an aliquot of at least ${show(Math.max(min, needed + min / m))} mg keeps all three at or above it.`);
    return {
      valid: true, aliquotNeeded: true, form, multiple: m, drugMg: sig(drug), diluentMg: sig(diluent), aliquotMg: sig(A), mixtureMg: sig(mixture), allMeasurable: ok,
      band: `Weigh ${show(drug)} mg of drug, add ${show(diluent)} mg of diluent to make ${show(mixture)} mg, and take a ${show(A)} mg aliquot, which holds ${show(needed)} mg.${ok ? '' : ' One of these measurements is below the minimum.'}`,
      bandLabel: ok ? `${show(A)} mg aliquot` : 'A measurement is below the minimum',
      abnormal: !ok,
      notes, note: IDENTITY_NOTE,
    };
  }

  const lf = inputFault([['the volume the drug is dissolved to', o.volume, null, 1e6, 'mL'], ['the smallest volume you can measure', o.minVolume, null, 1e6, 'mL']]);
  if (lf) return { valid: false, message: lf };
  const V = Number(o.volume); const minV = Number(o.minVolume);
  const aliquot = V / m;
  const ok = atLeast(drug, min) && atLeast(V, minV) && atLeast(aliquot, minV);
  const notes = [
    `Multiple: ${m} (the smallest whole number with ${m} × ${show(needed)} mg at or above ${show(min)} mg).`,
    check('Drug to weigh', drug, min, 'mg'),
    check('Volume to make', V, minV, 'mL'),
    check('Aliquot to measure', aliquot, minV, 'mL'),
    `Check: ${show(drug)} mg in ${show(V)} mL is ${show(drug / V)} mg/mL, so ${show(aliquot)} mL holds ${show(needed)} mg.`,
  ];
  if (!ok) notes.push(`A measurement is below the minimum. With this multiple, dissolving to at least ${show(m * minV)} mL keeps the aliquot at or above ${show(minV)} mL.`);
  return {
    valid: true, aliquotNeeded: true, form, multiple: m, drugMg: sig(drug), volumeMl: sig(V), aliquotMl: sig(aliquot), allMeasurable: ok,
    band: `Weigh ${show(drug)} mg of drug, dissolve it to ${show(V)} mL, and take a ${show(aliquot)} mL aliquot, which holds ${show(needed)} mg.${ok ? '' : ' One of these measurements is below the minimum.'}`,
    bandLabel: ok ? `${show(aliquot)} mL aliquot` : 'A measurement is below the minimum',
    abnormal: !ok,
    notes, note: IDENTITY_NOTE,
  };
}
