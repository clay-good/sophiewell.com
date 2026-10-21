// spec-v1660 tool 1: carrier frequency from the incidence of an autosomal recessive condition
// (Hardy-Weinberg).
//
// Source: Hardy GH. Mendelian proportions in a mixed population. Science 1908;28(706):49-50, read October 19,
// 2026 in the copy at esp.org: with numbers large enough that mating is random, the sexes evenly distributed
// and all genotypes equally fertile, AA : Aa : aa as p : 2q : r reaches a distribution that "will in any case
// continue unchanged after the second generation", the condition being q² = pr. Writing p = x², r = z², q = xz
// with x + z = 1 gives the proportions x² : 2xz : z², so for a recessive allele of frequency z the affected
// frequency is z² and the carrier frequency 2z(1 − z). The page uses the usual letters: q for the recessive
// allele, p = 1 − q, carriers 2pq.
//
// Pure: no DOM, no clock, no network.

import { probability, oneIn } from './bayes-table.js';

const sig = (x) => Number(x.toPrecision(4));

export function hardyWeinbergCarrier(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = o.from === 'allele' ? 'allele' : o.from === 'incidence' ? 'incidence' : null;
  if (!mode) return { valid: false, message: 'Choose whether you are entering the incidence of the condition or the allele frequency.' };
  const p0 = probability(mode === 'incidence' ? 'the incidence of the condition' : 'the allele frequency', mode === 'incidence' ? o.incidence : o.alleleFrequency);
  if (p0.message) return { valid: false, message: p0.message };
  if (p0.value <= 0 || p0.value >= 1) return { valid: false, message: 'Enter a frequency above 0 and below 1.' };
  const q = mode === 'incidence' ? Math.sqrt(p0.value) : p0.value;
  const p = 1 - q;
  const carriers = 2 * p * q;
  const affected = q * q;
  return {
    valid: true, q: sig(q), p: sig(p), carrierFrequency: sig(carriers), abnormal: false,
    band: `Carrier frequency 2pq = ${sig(carriers)} (${oneIn(carriers)}), from q = ${sig(q)} and p = ${sig(p)}${mode === 'allele' ? `; affected q² = ${sig(affected)} (${oneIn(affected)})` : ''}.`,
    bandLabel: oneIn(carriers),
    notes: [
      `When q is small, 2q (${sig(2 * q)}, ${oneIn(2 * q)}) is the common shortcut for 2pq.`,
      'Assumes what Hardy assumed: random mating in a large population, the genotypes equally fertile, and no selection, mutation or migration. The incidence must be the affected frequency at birth.',
    ],
    note: 'The frequency is the one entered; no population figure is built in.',
  };
}
