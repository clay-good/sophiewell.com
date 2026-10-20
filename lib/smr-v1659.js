// spec-v1659 tool 7: standardized mortality (or incidence) ratio, observed over expected.
//
// Arithmetic: SMR = observed ÷ expected. With age strata, expected = Σ (reference rate × the stratum's
// person-time), the indirect standardization the NHSN SIR guide (March 2024) calls "similar to the method
// used to calculate the Standardized Mortality Ratio".
//
// 95% interval: NCI SEER*Stat help, "Standardized Incidence Ratio and Confidence Limits" (read October 20,
// 2026), after Sahai and Khurshid 1993/1996: with D observed (Poisson) and E* expected,
//   SIR_L = X²(2D, α/2) ÷ 2E*   and   SIR_U = X²(2(D+1), 1 − α/2) ÷ 2E*,
// X²(v, a) being the 100a percentile of chi-square with v degrees of freedom; the page states the same
// results apply to the SMR. X²(2k, a) ÷ 2 is the a quantile of a gamma(k, 1) variable, found here by
// bisection on the regularized lower incomplete gamma; X²(0, a) is taken as 0 (the lower limit at D = 0).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

// Regularized lower incomplete gamma P(a, x): series for x < a + 1, continued fraction otherwise.
function lnGamma(z) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z; let y = z; let t = x + 5.5; t -= (x + 0.5) * Math.log(t);
  let ser = 1.000000000190015;
  for (const c of g) { y += 1; ser += c / y; }
  return -t + Math.log(2.5066282746310005 * ser / x);
}
function gammaP(a, x) {
  if (x <= 0) return 0;
  const lead = -x + a * Math.log(x) - lnGamma(a);
  if (x < a + 1) {
    let ap = a; let sum = 1 / a; let del = sum;
    for (let n = 0; n < 100000; n += 1) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; }
    return sum * Math.exp(lead);
  }
  let b = x + 1 - a; let c = 1e300; let d = 1 / b; let h = d;
  for (let i = 1; i < 100000; i += 1) {
    const an = -i * (i - a); b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
  }
  return 1 - Math.exp(lead) * h;
}
// The p quantile of gamma(k, 1), that is X²(2k, p) ÷ 2.
function gammaQuantile(k, p) {
  if (k <= 0) return 0;
  let lo = 0; let hi = k + 10 * Math.sqrt(k) + 10;
  while (gammaP(k, hi) < p) hi *= 2;
  for (let i = 0; i < 200; i += 1) { const mid = (lo + hi) / 2; if (gammaP(k, mid) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
export function exactPoissonLimits(observed, alpha = 0.05) {
  return { lower: gammaQuantile(observed, alpha / 2), upper: gammaQuantile(observed + 1, 1 - alpha / 2) };
}

const blank = (v) => v === null || v === undefined || String(v).trim() === '';

// "12000, 0.0015" per line: person-time in the stratum, reference rate per person-time unit.
export function parseStrata(text) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    if (c.length === 3) c.shift();
    if (c.length !== 2 || !c.every((x) => /^\d*\.?\d+(e-?\d+)?$/i.test(x))) return { error: `Line ${i + 1} needs the stratum's person-time and the reference rate, such as 12000, 0.0015.` };
    out.push({ pt: Number(c[0]), rate: Number(c[1]) });
  }
  return { strata: out };
}

export function smr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the observed events', o.observed, 0, 1e9, '']]);
  if (f) return { valid: false, message: f };
  const obs = Number(o.observed);
  if (!Number.isInteger(obs)) return { valid: false, message: 'The observed events must be a whole number.' };
  let exp;
  const notes = [];
  if (!blank(o.strata)) {
    const p = parseStrata(o.strata);
    if (p.error) return { valid: false, message: p.error };
    if (!p.strata.length) return { valid: false, message: 'Enter each stratum\'s person-time and reference rate.' };
    exp = p.strata.reduce((s, x) => s + x.pt * x.rate, 0);
    notes.push(`Expected ${r(exp, 2)}: the sum over ${p.strata.length} strata of person-time × reference rate.`);
  } else {
    const g = inputFault([['the expected events', o.expected, null, 1e9, '']]);
    if (g) return { valid: false, message: `${g} Or enter the strata to compute it.` };
    exp = Number(o.expected);
  }
  if (!(exp > 0)) return { valid: false, message: 'The expected count is zero, so there is no ratio. Check the strata.' };
  const v = obs / exp;
  const lim = exactPoissonLimits(obs);
  const lo = lim.lower / exp; const hi = lim.upper / exp;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { valid: false, message: 'The expected count is too small to divide by. Check the strata.' };
  // Compared unrounded: a limit of 1.0004 prints as 1 but still excludes 1.
  const where = lo > 1 ? 'lies above 1, so more events than expected beyond chance at the 5% level'
    : hi < 1 ? 'lies below 1, so fewer events than expected beyond chance at the 5% level'
      : 'includes 1, so the difference from the reference rates could be chance';
  return {
    valid: true, smr: r(v), lower: r(lo), upper: r(hi), expected: r(exp, 2), abnormal: v > 1,
    band: `SMR ${r(v)}: ${obs} observed ÷ ${r(exp, 2)} expected; ${v > 1 ? 'more' : v < 1 ? 'fewer' : 'as many'} events than the reference rates predict.`,
    bandLabel: r(v).toFixed(3),
    notes: [...notes, `Exact 95% interval ${r(lo)} to ${r(hi)} (Poisson limits on the observed count, divided by the expected count): the interval ${where}.`],
    note: 'Observed over expected, with the expected count from the reference population\'s rates applied to the study population\'s person-time.',
  };
}
