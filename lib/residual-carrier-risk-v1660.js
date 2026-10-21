// spec-v1660 tool 2: residual carrier risk after a negative carrier screen.
//
// Bayes' theorem, an arithmetic identity: prior carrier probability CF against 1 − CF; the chance of a
// negative result is 1 − DR for a carrier (the test misses a fraction 1 − DR of carriers) and 1 for a
// non-carrier; posterior = CF(1 − DR) ÷ (CF(1 − DR) + (1 − CF)). Both inputs are specific to the population
// and the test, and come from the laboratory report; none is built in. The ACMG statements on carrier
// screening were not read for this build.
//
// Pure: no DOM, no clock, no network.

import { probability, bayes, oneIn, tableLines } from './bayes-table.js';

export function residualCarrierRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cf = probability('the prior carrier frequency', o.carrierFrequency);
  if (cf.message) return { valid: false, message: cf.message };
  const dr = probability('the detection rate', o.detectionRate);
  if (dr.message) return { valid: false, message: dr.message };
  if (dr.value === 1) return { valid: false, message: 'A detection rate of 100% leaves no residual risk to compute; enter the rate the report gives.' };
  const t = bayes([
    { name: 'Carrier', prior: cf.value, conditionals: [1 - dr.value] },
    { name: 'Not a carrier', prior: 1 - cf.value, conditionals: [1] },
  ]);
  if (t.error) return { valid: false, message: t.error };
  const post = t.rows[0].posterior;
  return {
    valid: true, residual: Number(post.toPrecision(4)), abnormal: false,
    band: `Residual carrier risk after a negative screen: ${oneIn(post)} (${Number(post.toPrecision(4))}), down from ${oneIn(cf.value)} before it.`,
    bandLabel: oneIn(post),
    notes: tableLines(t.rows),
    note: 'A negative screen lowers the risk; it does not rule carrier status out. The carrier frequency and detection rate are as entered.',
  };
}
