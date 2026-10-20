# spec-v1663 — Exact limits on the SMR and on the information component at zero

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Closes
> [public-health-epidemiology](../openspec/changes/public-health-epidemiology/tasks.md) task 1.4.

`smr` (spec-v1659 tool 7) printed observed ÷ expected and said its interval "is not computed here", because no source
for the exact Poisson limits had been read. One has now been read:

| What | Source read (October 20, 2026) |
|---|---|
| SIR_L = X²(2D, α/2) ÷ 2E\*, SIR_U = X²(2(D+1), 1 − α/2) ÷ 2E\*, X²(v, a) the 100a percentile of chi-square on v degrees of freedom; "these results are also applicable" between the SMR and the SIR | NCI SEER\*Stat help, [Standardized Incidence Ratio and Confidence Limits](https://seer.cancer.gov/help/seerstat/equations-and-algorithms/standardized-incidence-ratio-and-confidence-levels), after Sahai and Khurshid 1993/1996 |

The result now carries `lower` and `upper` and says whether the interval lies above 1, below 1, or includes it,
comparing unrounded limits. The chi-square percentile on 2k degrees of freedom is twice a gamma(k, 1) quantile, found by
bisection on the regularized incomplete gamma; X²(0, a) is 0, so the lower limit at zero observed is 0.

`nhsn-sir` is unchanged on purpose: NHSN's reports use a mid-P exact method, so the SEER limits would disagree with
the number on the facility's NHSN report. Its task 1.4 stays open.

## The information component at an observed count of 0

`disproportionality-2x2` (spec-v1634 tool 6) gave no IC limits when a = 0, because Norén et al. 2013 (PMC6331976,
re-read October 20, 2026) says the approximate formulas (13) and (14) must not be used there and "the exact uncertainty
limits above should be used". Section 3.1 defines them: the posterior for the observed-to-expected ratio is Gamma with
parameters O + α₁ and E + α₂, and the limits are its percentiles. With α₁ = α₂ = ½ and O = 0, IC025 and IC975 are
log2 of the 2.5th and 97.5th percentiles of Gamma(½, E + ½). Counts above 0 keep the paper's approximations. Both tools now
share `lib/gamma-quantile.js`.

## Proof

- `test/unit/public-health-v1659.test.js`: the limits for counts 0, 1, 5 and 30 match the standard exact Poisson table
  (0 to 3.689; 0.0253 to 5.572; 1.623 to 11.668; 20.24 to 42.83); 30 ÷ 20 gives 1.012 to 2.141 ("lies above 1"); 25 ÷ 20
  includes 1; 5 ÷ 20 lies below 1; an expected count of 1e-308 is refused rather than printing infinite limits.
- `test/unit/disproportionality-2x2.test.js`: a = 0, b = 10, c = 5, d = 1,000 gives IC −0.14 with limits −10.13 to 2.19,
  checked against half the chi-square (1 df) percentiles 0.000982 and 5.0239.
