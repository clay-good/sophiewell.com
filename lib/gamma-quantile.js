// Gamma quantiles for exact Poisson and gamma-posterior limits.
//
// gammaQuantile(k, p) is the p quantile of a gamma(shape k, scale 1) variable, so X²(2k, p) = 2 ×
// gammaQuantile(k, p). Used by lib/smr-v1659.js (exact Poisson limits, NCI SEER*Stat) and
// lib/disproportionality-2x2-v1634.js (Norén 2013's exact IC limits when the observed count is 0).
//
// Pure: no DOM, no clock, no network.

function lnGamma(z) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = z; let t = z + 5.5; t -= (z + 0.5) * Math.log(t);
  let ser = 1.000000000190015;
  for (const c of g) { y += 1; ser += c / y; }
  return -t + Math.log(2.5066282746310005 * ser / z);
}

// Regularized lower incomplete gamma P(a, x): series for x < a + 1, continued fraction otherwise.
export function gammaP(a, x) {
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

// The p quantile of gamma(k, 1), by bisection; 0 when k is 0 (the chi-square on 0 degrees of freedom).
export function gammaQuantile(k, p) {
  if (k <= 0) return 0;
  let lo = 0; let hi = k + 10 * Math.sqrt(k) + 10;
  while (gammaP(k, hi) < p) hi *= 2;
  for (let i = 0; i < 200; i += 1) { const mid = (lo + hi) / 2; if (gammaP(k, mid) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
