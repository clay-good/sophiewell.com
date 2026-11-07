// spec-v1660 tool 2: residual carrier risk after a negative carrier screen.
//
// Bayes' theorem, an arithmetic identity: prior carrier probability CF against 1 − CF; the chance of a
// negative result is 1 − DR for a carrier (the test misses a fraction 1 − DR of carriers) and 1 for a
// non-carrier; posterior = CF(1 − DR) ÷ (CF(1 − DR) + (1 − CF)). Both inputs are specific to the population
// and the test, and come from the laboratory report; none is built in.
//
// THE ACMG PRACTICE RESOURCE, read November 7, 2026 (spec-v1692). "Screening for autosomal recessive
// and X-linked conditions during pregnancy and preconception: a practice resource of the American
// College of Medical Genetics and Genomics", Genet Med 2021;23:1793, open at PMC8488021. It states the
// calculation as:
//
//   "An individual's residual risk to be a carrier after having a negative screening test can be
//    calculated as follows: Population Carrier frequency x (1 - Detection Rate)."
//
// THAT PRODUCT IS NOT THIS FIGURE, and the difference is reported rather than left to look like a bug.
// The product is the numerator of Bayes' theorem; the posterior renormalizes it over both outcomes, so
// it answers "given the negative result, what is the chance of being a carrier". They converge as the
// carrier frequency gets small and diverge as it grows: at CF 1/25 and DR 0.9 the product is 1 in 250
// and the posterior 1 in 241, but at CF 1/2 the product is 1 in 20 against a posterior of 1 in 11. A
// reader who checks this tool against the sentence above would otherwise think it wrong, so both
// figures are printed whenever they differ.
//
// The resource's cautions, carried on every result because they bound what the number can mean:
//   "A negative screening result does not eliminate the risk of being a carrier for the conditions
//    screened but does reduce that risk. The residual risk to be a carrier for any condition is never
//    zero."
//   "It is impractical to provide a precise residual risk after carrier screening that includes
//    simultaneous analysis of multiple uncommon or rare variants within genes", because "the carrier
//    frequency and detection rate may not be known for each condition being screened".
//   And on reporting: "calculations depend on the patient's self-identified ethnicity", "data sets and
//    populations used to establish carrier frequency can vary", and for many X-linked genes "carrier
//    frequencies are imprecise".
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
  const product = cf.value * (1 - dr.value);
  const notes = tableLines(t.rows);
  // Report ACMG's own printed arithmetic when the gap is one a reader would see. Comparing the
  // rendered "1 in N" strings is no good: they differ even at a carrier frequency of 1 in a million,
  // where the gap is 0.00009% and saying so is noise. The posterior exceeds the product by a factor
  // 1/(product + 1 - CF), which is about 1 + CF -- so the product understates by roughly the carrier
  // frequency, and the comparison earns its place once that reaches a percent.
  const understatement = post / product - 1;
  if (understatement >= 0.01) {
    notes.push(`The ACMG practice resource states this as the carrier frequency times one minus the detection rate, which gives ${oneIn(product)} here. `
      + 'That product is the numerator of the same calculation; this figure renormalizes it over both outcomes, which is the chance of being a carrier '
      + `given the negative result. The product understates it by about the carrier frequency, ${Math.round(understatement * 100)}% here, so the two agree `
      + 'when the frequency is small and separate as it grows.');
  }
  notes.push('A negative result reduces the risk and never removes it: ACMG states that the residual risk to be a carrier for any condition is never zero.');
  notes.push('This applies to one condition with a known carrier frequency and detection rate. ACMG calls a precise residual risk impractical after a multiplex panel, '
    + 'because the frequency and detection rate may not be known for each condition screened.');
  notes.push('Both inputs come from the laboratory report, and ACMG notes that a carrier frequency depends on the patient\'s self-identified ethnicity, varies with the data set it came from, and is imprecise for many X-linked genes.');
  return {
    valid: true, residual: Number(post.toPrecision(4)), acmgProduct: Number(product.toPrecision(4)), abnormal: false,
    band: `Residual carrier risk after a negative screen: ${oneIn(post)} (${Number(post.toPrecision(4))}), down from ${oneIn(cf.value)} before it.`,
    bandLabel: oneIn(post),
    notes,
    note: 'A negative screen lowers the risk; it does not rule carrier status out. The carrier frequency and detection rate are as entered.',
  };
}
