// spec-v1660 tool 4: an X-linked carrier risk revised by unaffected sons (Bayes).
//
// Bayes' theorem, an arithmetic identity: a carrier's son is unaffected with probability 1/2, so n unaffected
// sons have conditional probability (1/2)^n if she is a carrier and 1 if not. A negative carrier test with
// detection rate DR multiplies the carrier conditional by (1 − DR). The prior is the reader's; no preset is
// offered, because no source stating the usual priors and their assumptions was read for this build.
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
    note: 'The prior is as entered. Each unaffected son halves the carrier conditional.',
  };
}
