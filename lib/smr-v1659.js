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
// results apply to the SMR. X²(2k, a) ÷ 2 is the a quantile of a gamma(k, 1) variable (lib/gamma-quantile.js);
// X²(0, a) is taken as 0 (the lower limit at D = 0).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { gammaQuantile } from './gamma-quantile.js';

const r = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

export function exactPoissonLimits(observed, alpha = 0.05) {
  return { lower: gammaQuantile(observed, alpha / 2), upper: gammaQuantile(observed + 1, 1 - alpha / 2) };
}

// The fewest decimals (three or more) at which the shown value still falls on the same side of 1 as the
// unrounded one, so a printed limit never contradicts the sentence beside it.
const agree = (x, test, from = 3) => {
  for (let dp = from; dp <= 6; dp += 1) {
    const v = Math.round(x * 10 ** dp) / 10 ** dp;
    if (test(v) === test(x)) return v;
  }
  return x;
};

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
  if (!Number.isFinite(exp) || exp > 1e9) return { valid: false, message: 'The expected count from the strata is over 1,000,000,000. Check the person-time and the rates.' };
  const v = obs / exp;
  const lim = exactPoissonLimits(obs);
  const lo = lim.lower / exp; const hi = lim.upper / exp;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { valid: false, message: 'The expected count is too small to divide by. Check the strata.' };
  const loShown = agree(lo, (x) => x > 1); const hiShown = agree(hi, (x) => x < 1);
  // Compared unrounded: a limit of 1.0004 prints as 1 but still excludes 1.
  const where = lo > 1 ? 'lies above 1, so more events than expected beyond chance at the 5% level'
    : hi < 1 ? 'lies below 1, so fewer events than expected beyond chance at the 5% level'
      : 'includes 1, so the difference from the reference rates could be chance';
  return {
    valid: true, smr: r(v), lower: loShown, upper: hiShown, expected: r(exp, 2), abnormal: v > 1,
    band: `SMR ${r(v)}: ${obs} observed ÷ ${r(exp, 2)} expected; ${v > 1 ? 'more' : v < 1 ? 'fewer' : 'as many'} events than the reference rates predict.`,
    bandLabel: r(v).toFixed(3),
    notes: [...notes, `Exact 95% interval ${loShown} to ${hiShown} (Poisson limits on the observed count, divided by the expected count): the interval ${where}.`],
    note: 'Observed over expected, with the expected count from the reference population\'s rates applied to the study population\'s person-time.',
  };
}
