// spec-v1660 tool 4: an X-linked carrier risk revised by unaffected sons (Bayes).
//
// Bayes' theorem, an arithmetic identity: a carrier's son is unaffected with probability 1/2, so n unaffected
// sons have conditional probability (1/2)^n if she is a carrier and 1 if not. A negative carrier test with
// detection rate DR multiplies the carrier conditional by (1 − DR).
//
// WHY NO PRESET PRIOR, now for a sourced reason rather than an unread one (spec-v1693). The design asked
// for a preset of "2/3 for the sister of an isolated case" once a source stating it with its
// mutation-rate assumptions had been read. The source read is Ferlini, Neri and Gualandi, "Risk
// assessment and genetic counseling in families with Duchenne muscular dystrophy", Acta Myol
// 2012;31:195 (PMC3631803), and it does not support that preset, in two separate ways:
//
//   1. THE 2/3 BELONGS TO THE MOTHER, NOT THE SISTER. The figure comes from Haldane's
//      mutation-selection equilibrium: "Since DMD boys do not pass on their defective allele to the
//      following generation, in every generation one third of mutated alleles is 'lost' from the
//      population ... the selection of mutated alleles from the population must be compensated for by
//      an equivalent rate (i.e. one third) of de novo mutations." That makes two thirds of mothers of
//      isolated cases carriers. A sister's prior is the mother's carrier probability times the one-half
//      chance of inheriting the mutant X, so offering a sister 2/3 would offer her the mother's figure.
//
//   2. EVEN FOR THE MOTHER THE CLEAN 2/3 IS AN IDEALIZATION. It assumes equal mutation rates in the
//      sexes, and the same paper reports that "a breakdown by mutation types can better explain the sex
//      ratio of mutations: Point mutations and duplications arise preferentially during spermatogenesis
//      whereas deletions mostly arise in oogenesis". Empirically it cites Passos-Bueno: mothers of
//      isolated DMD cases have "likelihoods of 62.3% to be carriers, of 6.7% to carry a germline
//      mosaic and of 31% to bear two normal alleles" -- three outcomes, not two, and 62.3% rather than
//      66.7%. Germline mosaicism leaves a recurrence risk even when the mother's lymphocytes are
//      negative (14% in Bakker, 20% with a 10-30% interval in van Essen).
//
// So the prior stays the reader's, the result says which relative a prior belongs to, and nothing is
// preset. A preset would have shipped the wrong relative's figure and hidden a third outcome.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { probability, bayes, oneIn, tableLines } from './bayes-table.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function xLinkedBayesRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const prior = probability('the prior carrier probability', o.prior);
  if (prior.message) return { valid: false, message: prior.message };
  const f = inputFault([['the number of unaffected sons', o.unaffectedSons, 0, 30, '']]);
  if (f) return { valid: false, message: f };
  const n = Number(o.unaffectedSons);
  if (!Number.isInteger(n)) return { valid: false, message: 'Enter the unaffected sons as a whole number.' };
  const carrierConds = [0.5 ** n];
  const notes = [];
  if (!blank(o.detectionRate)) {
    const dr = probability('the carrier test\'s detection rate', o.detectionRate);
    if (dr.message) return { valid: false, message: dr.message };
    carrierConds.push(1 - dr.value);
    notes.push(`A negative carrier test with detection rate ${Number(dr.value.toPrecision(4))} multiplies the carrier conditional by ${Number((1 - dr.value).toPrecision(4))}.`);
  }
  const t = bayes([
    { name: 'Carrier', prior: prior.value, conditionals: carrierConds },
    { name: 'Not a carrier', prior: 1 - prior.value, conditionals: [1, ...(carrierConds.length > 1 ? [1] : [])] },
  ]);
  if (t.error) return { valid: false, message: t.error };
  const post = t.rows[0].posterior;
  return {
    valid: true, posterior: Number(post.toPrecision(4)), abnormal: false,
    band: `Carrier probability ${Number(post.toPrecision(4))} (${oneIn(post)}) after ${n} unaffected son${n === 1 ? '' : 's'}, from a prior of ${Number(prior.value.toPrecision(4))}.`,
    bandLabel: oneIn(post),
    notes: [...tableLines(t.rows), ...notes],
    note: 'The prior is as entered, and it is specific to the relative it describes: for an isolated case the two-thirds figure from Haldane\'s equilibrium is the MOTHER\'s, and a sister\'s prior is that times the one-half chance of inheriting the mutant X. No prior is preset here. Each unaffected son halves the carrier conditional.',
    priorIsPreset: false,
  };
}
