// spec-v1697 tool 2: maximum credible population allele frequency for a disease model, and the allele-count
// ceiling it implies at an allele number (Whiffin N, et al. Genet Med 2017;19:1151-1158, CC BY 4.0).
//
// As the authors compute it (their worked examples and their calculator, github.com/jamesware/alleleFrequencyApp,
// server.R, re-read November 7, 2026):
//   dominant:  maxAF = 1/2 x prevalence x allelic contribution x genetic contribution / penetrance
//   recessive: maxAF = sqrt(prevalence) x allelic contribution x sqrt(genetic contribution) / sqrt(penetrance)
// The printed dominant equation omits the 1/2 and the genetic contribution; the worked HCM example applies the
// 1/2 and the calculator applies both. Ceiling: qpois(0.95, AN x maxAF), the smallest k whose one-tailed Poisson
// CDF reaches 0.95. A variant is too common when its AC exceeds the ceiling, or when its filtering allele
// frequency is at or above maxAF ("a variant with a filtering AF >= the maximum credible AF ... should be
// filtered").
//
// Pure: no DOM, no clock, no network.

import { parseProbability } from './bayes-table.js';

export const INHERITANCE_OPTIONS = [
  { value: 'dominant', text: 'Dominant (one allele causes disease)' },
  { value: 'recessive', text: 'Recessive (two alleles cause disease)' },
];

// A probability as parseProbability reads it, plus scientific notation (5e-5) as population databases print it.
function prob(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (/^\d*\.?\d+e[-+]?\d+$/i.test(s)) return Number(s);
  return parseProbability(s);
}

function field(label, raw, { required = true, zeroOk = false } = {}) {
  const v = prob(raw);
  if (v === null) return required ? { message: `Enter ${label}.` } : { value: null };
  if (!Number.isFinite(v)) return { message: `${label.charAt(0).toUpperCase()}${label.slice(1)} is not a number between 0 and 1. Enter a decimal, a percentage, a fraction or "1 in N".` };
  if (v < 0 || v > 1) return { message: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be between 0 and 1.` };
  if (v === 0 && !zeroOk) return { message: `${label.charAt(0).toUpperCase()}${label.slice(1)} cannot be 0: the model has no credible frequency at 0.` };
  return { value: v };
}

function count(label, raw) {
  const s = String(raw ?? '').trim().replace(/,/g, '');
  if (!s) return { value: null };
  if (!/^\d+$/.test(s)) return { message: `${label} must be a whole number of alleles.` };
  return { value: Number(s) };
}

// Smallest k with Poisson CDF(k; lambda) >= p, summed in log space so a large lambda does not underflow.
export function poissonQuantile(lambda, p = 0.95) {
  if (!(lambda >= 0) || !Number.isFinite(lambda)) return NaN;
  if (lambda === 0) return 0;
  const target = p * (1 - 64 * Number.EPSILON);
  let logTerm = -lambda;
  let cdf = Math.exp(logTerm);
  let k = 0;
  const limit = lambda + 20 * Math.sqrt(lambda) + 100;
  while (cdf < target && k < limit) {
    k += 1;
    logTerm += Math.log(lambda) - Math.log(k);
    cdf += Math.exp(logTerm);
  }
  return k;
}

// 4.0 x 10^-5 style, with superscript digits.
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export function sci(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return 'not a number';
  if (x === 0) return '0';
  const [m, e] = x.toExponential(3).split('e');
  let mant = m.replace(/0+$/, '').replace(/\.$/, '');
  if (!mant.includes('.')) mant += '.0';
  const exp = Number(e);
  if (exp === 0) return mant;
  return `${mant} × 10${String(exp).split('').map((ch) => SUP[ch]).join('')}`;
}

export function maxCredibleAlleleFrequency(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.inheritance ?? '').trim();
  if (mode !== 'dominant' && mode !== 'recessive') return { valid: false, message: 'Choose whether the disease is dominant or recessive.' };
  const prev = field('the disease prevalence', o.prevalence);
  if (prev.message) return { valid: false, message: prev.message };
  const allelic = field('the maximum allelic contribution', o.allelicContribution);
  if (allelic.message) return { valid: false, message: allelic.message };
  const genetic = field('the maximum genetic contribution', o.geneticContribution, { required: false });
  if (genetic.message) return { valid: false, message: genetic.message };
  const pen = field('the penetrance', o.penetrance);
  if (pen.message) return { valid: false, message: pen.message };
  const g = genetic.value ?? 1;

  const maxAF = mode === 'dominant'
    ? 0.5 * prev.value * allelic.value * g / pen.value
    : Math.sqrt(prev.value) * allelic.value * Math.sqrt(g) / Math.sqrt(pen.value);
  if (!Number.isFinite(maxAF)) return { valid: false, message: 'These inputs give no finite allele frequency; check the values.' };

  const ac = count('The allele count', o.alleleCount);
  if (ac.message) return { valid: false, message: ac.message };
  const an = count('The allele number', o.alleleNumber);
  if (an.message) return { valid: false, message: an.message };
  if (an.value === 0) return { valid: false, message: 'The allele number must be above 0.' };
  if (ac.value !== null && an.value === null) return { valid: false, message: 'Enter the allele number (AN) the allele count was observed in; the ceiling depends on it.' };
  if (ac.value !== null && ac.value > an.value) return { valid: false, message: 'The allele count cannot exceed the allele number.' };
  const faf = field('the filtering allele frequency', o.filteringAf, { required: false, zeroOk: true });
  if (faf.message) return { valid: false, message: faf.message };

  const notes = [
    `Model: ${mode}; prevalence ${sci(prev.value)}; maximum allelic contribution ${allelic.value}; maximum genetic contribution ${g}${genetic.value === null ? ' (not entered: taken as 1, as in the paper\'s worked example)' : ''}; penetrance ${pen.value}.`,
    mode === 'dominant'
      ? `maxAF = 1/2 x prevalence x allelic contribution x genetic contribution / penetrance = ${sci(maxAF)}. The paper's printed dominant equation omits the 1/2 and the genetic contribution; its worked example and the authors' calculator apply them, and so does this.`
      : `maxAF = sqrt(prevalence) x allelic contribution x sqrt(genetic contribution) / sqrt(penetrance) = ${sci(maxAF)}.`,
  ];
  let ceiling = null;
  let tooCommon = null;
  const decisions = [];
  if (an.value !== null) {
    const lambda = an.value * maxAF;
    if (lambda > 1e7) return { valid: false, message: 'The expected allele count (AN x maxAF) is above 10 million; check the allele number and model.' };
    ceiling = poissonQuantile(lambda, 0.95);
    notes.push(`Allele-count ceiling at AN ${an.value.toLocaleString('en-US')}: ${ceiling}, the upper bound of the one-tailed 95% Poisson interval around AN x maxAF = ${Number(lambda.toPrecision(4))}.`);
    if (ac.value !== null) {
      tooCommon = ac.value > ceiling;
      decisions.push(tooCommon
        ? `Allele count ${ac.value} is above the ceiling of ${ceiling}: too common to cause this disease as modeled.`
        : `Allele count ${ac.value} is at or below the ceiling of ${ceiling}: not excluded by frequency.`);
    }
  }
  if (faf.value !== null) {
    const common = faf.value >= maxAF;
    tooCommon = tooCommon === null ? common : tooCommon || common;
    decisions.push(common
      ? `Filtering allele frequency ${sci(faf.value)} is at or above maxAF ${sci(maxAF)}: too common to cause this disease as modeled.`
      : `Filtering allele frequency ${sci(faf.value)} is below maxAF ${sci(maxAF)}: not excluded by frequency.`);
    notes.push('gnomAD\'s filtering allele frequency is the lower bound of the 95% Poisson interval for each genetic ancestry group; its GroupMax leaves out the ami, asj, fin and rmi groups.');
  }
  if (an.value === null && faf.value === null) notes.push('Enter an allele number (with or without the allele count) or a filtering allele frequency to test a variant against this ceiling.');

  const head = `Maximum credible allele frequency ${sci(maxAF)}${ceiling !== null ? `; allele-count ceiling ${ceiling}` : ''}.`;
  return {
    valid: true,
    maxAF: Number(maxAF.toPrecision(4)),
    ceiling,
    tooCommon,
    abnormal: tooCommon === true,
    band: decisions.length ? `${head} ${decisions.join(' ')}` : head,
    bandLabel: sci(maxAF),
    notes,
    note: 'The ceiling is only as conservative as the prevalence, contributions and penetrance entered: overstate them and it lets common variants through. Frequency alone never makes a variant pathogenic.',
  };
}
