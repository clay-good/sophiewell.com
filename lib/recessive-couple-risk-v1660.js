// spec-v1660 tool 3: autosomal recessive risk to a pregnancy from the two partners' carrier risks.
//
// Mendelian segregation, an arithmetic identity: two carriers have an affected child with probability 1/4,
// so the risk is partner A's carrier risk × partner B's × 1/4. When both are confirmed carriers, each child
// is affected 1/4, a carrier 1/2, and neither 1/4.
//
// Pure: no DOM, no clock, no network.

import { probability, oneIn } from './bayes-table.js';

const sig = (x) => Number(x.toPrecision(4));

export function recessiveCoupleRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const a = probability('partner A\'s carrier risk', o.riskA);
  if (a.message) return { valid: false, message: a.message };
  const b = probability('partner B\'s carrier risk', o.riskB);
  if (b.message) return { valid: false, message: b.message };
  const risk = a.value * b.value * 0.25;
  const notes = [`${sig(a.value)} × ${sig(b.value)} × 1/4 = ${sig(risk)}.`];
  if (a.value === 1 && b.value === 1) notes.push('Both are confirmed carriers: each pregnancy has a 1 in 4 chance of an affected child, 1 in 2 of a carrier, and 1 in 4 of neither.');
  return {
    valid: true, risk: sig(risk), abnormal: risk >= 0.25,
    band: risk > 0 ? `Risk of an affected child: ${oneIn(risk)} (${sig(risk)}) per pregnancy.` : 'No risk of an affected child from these carrier risks: one of them is zero.',
    bandLabel: risk > 0 ? oneIn(risk) : 'None',
    notes,
    note: 'For one autosomal recessive condition. The carrier risks are as entered; use a residual risk for a partner who screened negative.',
  };
}
