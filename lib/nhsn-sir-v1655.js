// spec-v1655 tool 1: the NHSN standardized infection ratio, observed over predicted.
//
// Source: CDC NHSN, "The NHSN Standardized Infection Ratio (SIR): A Guide to the SIR", updated March 2024
// (cdc.gov/nhsn/pdfs/ps-analysis-resources/nhsn-sir-guide.pdf), read October 19, 2026:
//   "The SIR is calculated by dividing the number of observed infections by the number of predicted
//    infections." The predicted number comes from NHSN's regression models over the 2015 baseline,
//    applied inside NHSN; the reader copies it from the facility's report.
//   "SIRs are currently not calculated when the number of predicted infections is less than 1.0"
//    (a minimum precision criterion), with three alternatives: a longer period, infection rates, and
//    the TAP reports.
//   Worked example: 5 CLABSIs observed, 2.365 predicted, SIR 2.114.
// The p-value and the 95% interval (added November 7, 2026) follow NHSN's own published SAS macros, read at
// cdc.gov/nhsn/sas/: p-value-of-sir-compared-to-nominal.sas (two-sided mid-P exact Poisson test when 100 or
// fewer infections were observed, otherwise Byar's approximation after Rothman and Boice 1979, each one-tailed
// value doubled and capped at 1) and rateCIcomp.sas (the mid-P exact interval, which NHSN's macro guide, May
// 2021, says serves "a single incidence density rate (such as a CLABSI rate, SIR)"). The interval is a literal
// port of the macro's bisection, so it rounds as NHSN prints: the guide's 5 / 2.365 gives p 0.1251 and
// 0.775 to 4.686; the Statistics Calculator guide's 1 / 1.05 gives p 1.0000 and 0.048 to 4.697; the macro
// guide's rate example 12 / 35 gives 185.767 to 582.877 per 1,000. No lower limit when 0 are observed, as the
// SIR guide says. Not computed: the cumulative attributable difference, whose one sentence in the guide can be
// read two ways and whose TAP guide was not read.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { gammaP } from './gamma-quantile.js';

const logPmf = (k, mu) => { let l = -mu + k * Math.log(mu); for (let i = 2; i <= k; i += 1) l -= Math.log(i); return l; };
const below = (x, mu) => { let t = 0; for (let k = 0; k < x; k += 1) t += Math.exp(logPmf(k, mu)); return t; };
const normalCdf = (z) => 0.5 * (1 + Math.sign(z) * gammaP(0.5, (z * z) / 2));

// nhsnMidP(observed, predicted) -> the two-sided p-value as p-value-of-sir-compared-to-nominal.sas computes it.
export function nhsnMidP(obs, exp) {
  if (!Number.isInteger(obs) || obs < 0 || !(exp >= 1) || !Number.isFinite(exp)) return null;
  let p;
  if (obs <= 100) {
    const lower = below(obs, exp) + 0.5 * Math.exp(logPmf(obs, exp));
    p = obs < exp ? 2 * lower : 2 * (1 - lower);
  } else {
    const o = obs <= exp ? obs + 1 : obs;
    const z = Math.sqrt(9 * o) * (1 - 1 / (9 * o) - Math.cbrt(exp / o));
    p = obs <= exp ? 2 * normalCdf(z) : 2 * (1 - normalCdf(z));
  }
  return Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : null;
}

// fish(z, x1, x2) -> P(x1 <= X <= x2) for X ~ Poisson(z), summed as rateCIcomp.sas's %fish macro sums it.
function fish(z, x1, x2) {
  let q = 1; let tot = 0; let t = 0; let k = 0;
  while (k < z || q > tot * 1e-10) {
    tot += q;
    if (k >= x1 && k <= x2) t += q;
    if (tot > 1e30) { t /= 1e30; tot /= 1e30; q /= 1e30; }
    k += 1; q = (q * z) / k;
  }
  return t / tot;
}

// nhsnMidPLimits(observed) -> { lower, upper } for the Poisson mean, by rateCIcomp.sas's own bisection
// (z = (1 + n) v / (1 - v), v halved to a step of 1e-5); lower is null when nothing was observed.
export function nhsnMidPLimits(n) {
  if (!Number.isInteger(n) || n < 0) return null;
  const solve = (tail, below2) => {
    let v = 0.5; let dv = 0.5;
    while (dv > 1e-5) {
      dv /= 2;
      const z = ((1 + n) * v) / (1 - v);
      const P = tail(z) + 0.5 * fish(z, n, n);
      if (below2 ? P < 0.025 : P > 0.025) v -= dv; else v += dv;
    }
    return ((1 + n) * v) / (1 - v);
  };
  const lower = n === 0 ? null : solve((z) => fish(z, n + 1, 1e10), false);
  const upper = solve((z) => fish(z, 0, n - 1), true);
  return { lower, upper };
}

const NOTE = 'The predicted count is NHSN\'s, from its 2015-baseline models applied to the facility\'s own data; this tool does not estimate it. The p-value and 95% interval follow NHSN\'s published SAS macros (mid-P exact), so they should match the report\'s SIR_pval and sir95ci.';
const MIN_NOTE = 'Instead, NHSN suggests a longer time period, infection rates to track internal incidence, or the TAP reports.';

export function nhsnSir(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the observed infections', o.observed, 0, 100000, ''],
    ['the predicted infections', o.predicted, 0, 100000, ''],
  ]);
  if (f) return { valid: false, message: f };
  const obs = Number(o.observed);
  const pred = Number(o.predicted);
  if (!Number.isInteger(obs)) return { valid: false, message: 'The observed infections must be a whole number.' };
  if (pred < 1) {
    return {
      valid: true, flag: 'below-minimum', sir: null, abnormal: false,
      band: `No SIR: NHSN does not calculate an SIR when the number of predicted infections is less than 1.0, and ${pred} was entered.`,
      bandLabel: 'Not calculated', notes: [MIN_NOTE], note: NOTE,
    };
  }
  const sir = obs / pred;
  const p = nhsnMidP(obs, pred);
  const lim = nhsnMidPLimits(obs);
  if (p === null || !lim || !Number.isFinite(lim.upper)) return { valid: false, message: 'These counts give no finite result.' };
  const pValue = Math.round(p * 10000) / 10000;
  const lower = lim.lower === null ? null : Math.round((lim.lower / pred) * 1000) / 1000;
  const upper = Math.round((lim.upper / pred) * 1000) / 1000;
  const r = Math.round(sir * 1000) / 1000;
  const reading = r > 1 ? 'more infections were observed than predicted'
    : r < 1 ? 'fewer infections were observed than predicted'
      : 'the same number of infections was observed as predicted';
  return {
    valid: true, flag: r > 1 ? 'above-one' : r < 1 ? 'below-one' : 'at-one', sir: r, abnormal: r > 1,
    band: `SIR ${r.toFixed(3)}: ${reading} (${obs} observed ÷ ${pred} predicted).`,
    bandLabel: r.toFixed(3),
    pValue, lower, upper,
    notes: [
      `p-value ${pValue.toFixed(4)} (two-sided, ${obs <= 100 ? 'mid-P exact' : 'Byar approximation, used by NHSN above 100 observed'}); 95% interval ${lower === null ? `upper limit ${upper.toFixed(3)}, with no lower limit (NHSN calculates none when 0 infections were observed)` : `${lower.toFixed(3)} to ${upper.toFixed(3)}`}.`,
      `${pValue <= 0.05 ? 'The p-value is 0.05 or less' : 'The p-value is above 0.05'}${lower === null ? '' : ` and the interval ${lower > 1 || upper < 1 ? 'excludes' : 'includes'} 1`}: by the NHSN guide's reading, the observed count is ${pValue <= 0.05 ? '' : 'not '}significantly different from the predicted count.`,
    ],
    note: NOTE,
  };
}
