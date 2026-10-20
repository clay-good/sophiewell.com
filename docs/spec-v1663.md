# spec-v1663 — Exact limits on the SMR and the information component; Levin's population fraction

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Closes
> [public-health-epidemiology](../openspec/changes/public-health-epidemiology/tasks.md) tasks 1.2 and 1.4.

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

## Levin's population attributable fraction

`attributable-proportion` (spec-v1659 tool 4) gave the proportion among the exposed only, because no source stating
Levin's formula had been read (task 1.2). Two open papers read October 20, 2026 state it identically,
PAF = Pe (RR − 1) ÷ [Pe (RR − 1) + 1]: Khosravi et al., *Glob Epidemiol* 2021 (PMC10445975), Eq. 3, and Ferguson et
al., *Eur J Epidemiol* 2024 (PMC10904572), Eq. 2. Both say it holds only without confounding. A new optional field, the
share of the population exposed, adds the population fraction; blank leaves the result as before. The tool takes crude
risks, which is the no-confounding case; the note names Miettinen's case-based formula for an adjusted risk ratio,
which is not computed.

## Checked and not done: statin intensity

`statin-ldl-reduction` still gives no intensity category. Table 3 of the 2018 cholesterol guideline (PMC7403606) was
read, but the 2026 ACC/AHA/Multisociety dyslipidemia guideline (*J Am Coll Cardiol*, doi:10.1016/j.jacc.2025.11.016;
*Circulation*, doi:10.1161/CIR.0000000000001423) replaced it in March 2026, and both publishers returned a Cloudflare
check on October 20, 2026. A superseded classification is not shipped as the current one.

Also checked: the Crass 2018 vancomycin obesity model (`vanc-initial-dose`). Its coefficients appear in one open
reprint only (a scoping review, PMC11928783), and no second source agreed, so a dosing model is not built on it.

## Proof

- `test/unit/public-health-v1659.test.js`: the limits for counts 0, 1, 5 and 30 match the standard exact Poisson table
  (0 to 3.689; 0.0253 to 5.572; 1.623 to 11.668; 20.24 to 42.83); 30 ÷ 20 gives 1.012 to 2.141 ("lies above 1"); 25 ÷ 20
  includes 1; 5 ÷ 20 lies below 1; an expected count of 1e-308 is refused rather than printing infinite limits.
- An independent review found two SMR edge cases, both fixed and tested: a lower limit of 1.00004 printed as "1" beside
  "lies above 1" (each limit now takes the fewest decimals, three or more, that agree with the sentence), and strata
  summing to an infinite expected count read as "fewer events beyond chance" (an expected count over 1,000,000,000 is
  now refused, as on direct entry).
- `test/unit/disproportionality-2x2.test.js`: a = 0, b = 10, c = 5, d = 1,000 gives IC −0.14 with limits −10.13 to 2.19,
  checked against half the chi-square (1 df) percentiles 0.000982 and 5.0239.
- `test/unit/public-health-v1659.test.js`: 0.57 and 0.07 with 30% exposed gives 68.2%; 100% exposed equals the
  exposed-group 87.7% and 0% gives 0 (the formula's two identities); 120% is refused; a 0 unexposed risk or a lower exposed
  risk gives no population fraction.
