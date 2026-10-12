// spec-v1635 tool 1: re-derive an ordered chemotherapy dose from the regimen's per-unit dose.
//
// The arithmetic is an identity: calculated dose = per-unit dose x body size x (1 - reduction);
// variance = (ordered - calculated) / calculated x 100. Body surface area by Mosteller
// (sqrt(height cm x weight kg / 3600)) and by Du Bois (0.007184 x weight^0.425 x height^0.725), as in
// the body surface area tool; the reader chooses which one the order used.
//
// Why actual weight, and why no cap ships: Griggs JJ, et al. Appropriate Systemic Therapy Dosing for
// Obese Adult Patients With Cancer: ASCO Guideline Update. J Clin Oncol 2021;39:2037-2048 (PubMed
// abstract, PMID 33939491, re-read October 11, 2026): "The Panel continues to recommend that full,
// weight-based cytotoxic chemotherapy doses be used to treat obese adults with cancer", and "full,
// approved doses of immunotherapy and targeted therapies be offered to obese adults with cancer."
// Only the abstract was read, so nothing beyond it is quoted. A body surface area cap (2.0 m2 is a
// common one) is institutional policy, not a guideline value: it is applied only when the reader
// types one, and it is labeled as theirs.
//
// No pass or fail unless the reader enters a tolerance. Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const BASES = [
  { value: 'mg-m2', text: 'mg/m²', unit: 'mg', per: 'm²' },
  { value: 'mg-kg', text: 'mg/kg', unit: 'mg', per: 'kg' },
  { value: 'units-m2', text: 'units/m²', unit: 'units', per: 'm²' },
  { value: 'carboplatin-target', text: 'Target AUC (carboplatin)', unit: 'mg', per: null },
];
export const BSA_FORMULAS = [
  { value: 'mosteller', text: 'Mosteller' },
  { value: 'du-bois', text: 'Du Bois' },
];
const NOTE = 'A re-derivation of the ordered dose from the regimen and the patient\'s size, for the double check. It does not know the regimen, the indication or the patient, and a small variance is not a verified order.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
const signed = (x) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${n1(Math.abs(x))}%`;

export function chemoDoseVerify(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const basis = BASES.find((b) => b.value === String(o.basis ?? '').trim());
  if (!basis) return { valid: false, message: 'Choose the dose basis of the regimen: mg/m², mg/kg, units/m² or a target AUC.' };
  if (basis.value === 'carboplatin-target') {
    return { valid: true, flag: 'handoff', abnormal: true, band: 'A target AUC is not re-derived here: carboplatin dose is the target AUC times (GFR + 25), which needs a kidney function estimate. Use the Calvert carboplatin tool (or the Chatelut tool), then compare its dose with the order.', bandLabel: 'Use the Calvert tool', notes: ['This tool re-derives doses that scale with body surface area or weight.'], note: NOTE };
  }
  const bsaBased = basis.per === 'm²';
  const f = inputFault([['the regimen dose per unit of body size', o.perUnitDose, null, 100000, basis.text], ['the weight', o.weight, 0.4, 400, 'kg'], ['the ordered dose', o.orderedDose, null, 10000000, basis.unit]]);
  if (f) return { valid: false, message: f };
  let height = null; let formula = null;
  if (bsaBased) {
    const hf = inputFault([['the height', o.height, 30, 250, 'cm']]);
    if (hf) return { valid: false, message: hf };
    height = Number(o.height);
    formula = BSA_FORMULAS.find((x) => x.value === String(o.bsaFormula ?? '').trim());
    if (!formula) return { valid: false, message: 'Choose the body surface area formula the order used: Mosteller or Du Bois. They differ by a few percent.' };
  }
  const opt = {};
  for (const [key, label, lo, hi, unit] of [['dosingWeight', 'the dosing weight', 0.4, 400, 'kg'], ['reduction', 'the percent reduction', 0, 99, '%'], ['bsaCap', 'the body surface area cap', 0.5, 3.5, 'm²'], ['tolerance', 'the tolerance', 0, 50, '%']]) {
    if (blank(o[key])) { opt[key] = null; continue; }
    const of = inputFault([[label, o[key], lo, hi, unit]]);
    if (of) return { valid: false, message: of };
    opt[key] = Number(o[key]);
  }
  if (opt.bsaCap !== null && !bsaBased) return { valid: false, message: 'A body surface area cap does not apply to a mg/kg dose: clear it.' };

  const actual = Number(o.weight); const kg = opt.dosingWeight ?? actual;
  const perUnit = Number(o.perUnitDose); const ordered = Number(o.orderedDose);
  const notes = [];
  let size; let sizeText;
  if (bsaBased) {
    const mosteller = Math.sqrt(height * kg / 3600);
    const dubois = 0.007184 * kg ** 0.425 * height ** 0.725;
    const bsa = formula.value === 'mosteller' ? mosteller : dubois;
    size = bsa;
    notes.push(`Body surface area from ${height} cm and ${kg} kg: Mosteller ${n2(mosteller)} m², Du Bois ${n2(dubois)} m². ${formula.text} is used, as chosen.`);
    if (opt.bsaCap !== null) {
      if (bsa > opt.bsaCap) { size = opt.bsaCap; notes.push(`Institutional cap, entered by you: ${n2(bsa)} m² is capped at ${opt.bsaCap} m². A cap is institutional policy, not a guideline value: the ASCO 2021 guideline recommends full weight-based doses.`); }
      else notes.push(`The cap you entered (${opt.bsaCap} m²) is above ${n2(bsa)} m² and changes nothing.`);
    }
    sizeText = `${n2(size)} m²`;
  } else { size = kg; sizeText = `${kg} kg`; }
  notes.push(opt.dosingWeight === null
    ? `Weight used: actual weight, ${actual} kg. The ASCO 2021 guideline recommends full, weight-based doses for obese adults; enter a dosing weight if the institution's policy uses another.`
    : `Weight used: the dosing weight you entered, ${kg} kg (actual ${actual} kg). The ASCO 2021 guideline recommends full, weight-based doses for obese adults.`);
  const factor = opt.reduction === null ? 1 : 1 - opt.reduction / 100;
  const calc = perUnit * size * factor;
  const variance = (ordered - calc) / calc * 100;
  notes.unshift(`Calculated dose = ${perUnit.toLocaleString('en-US')} ${basis.text} × ${sizeText}${opt.reduction === null ? '' : ` × ${n2(factor)} (a ${opt.reduction}% reduction)`} = ${n1(calc)} ${basis.unit}.`,
    `Variance = (${ordered.toLocaleString('en-US')} − ${n1(calc)}) ÷ ${n1(calc)} = ${signed(variance)}.`);
  let flag = 'variance'; let abnormal = false; let verdict = '';
  if (opt.tolerance !== null) {
    const within = Math.abs(variance) <= opt.tolerance + 1e-9;
    flag = within ? 'within-tolerance' : 'outside-tolerance'; abnormal = !within;
    verdict = ` That is ${within ? 'within' : 'outside'} the ${opt.tolerance}% tolerance you entered.`;
    notes.push('The tolerance is yours. Rounding to vial or tablet sizes is a common, legitimate source of a small variance.');
  } else notes.push('No tolerance was entered, so no pass or fail is given. Rounding to vial or tablet sizes is a common, legitimate source of a small variance.');
  return {
    valid: true, flag, abnormal, calculatedDose: Number(calc.toFixed(2)), orderedDose: ordered, variancePercent: Number(variance.toFixed(1)),
    bsa: bsaBased ? Number(size.toFixed(3)) : null, weightUsed: kg,
    band: `Calculated ${n1(calc)} ${basis.unit}; ordered ${ordered.toLocaleString('en-US')} ${basis.unit}; variance ${signed(variance)}.${verdict}`,
    bandLabel: signed(variance), notes, note: NOTE,
  };
}
