# v11 audit - ASCVD 10-year Risk (Pooled Cohort Equations) (`ascvd`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Goff DC Jr, Lloyd-Jones DM, Bennett G, et al. 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk. Circulation. 2014;129(25 Suppl 2):S49-S73. Sophie implements the Pooled Cohort Equations (PCE) verbatim, including the race-stratified (white vs African-American) and sex-stratified coefficient tables in the Appendix. The race-stratified design is intrinsic to PCE (`prevent` is the race-free successor; see `docs/audits/v11/prevent.md`).

## Boundary examples added
- Low edge: 40-year-old non-smoking non-diabetic white male, TC 170, HDL 60, SBP 110 untreated -> ~1% 10-year risk (low band). PASS.
- High edge: 75-year-old white male smoker with DM, TC 240, HDL 30, treated SBP 170 -> >30% 10-year risk (high band; statin recommended). PASS.
- META example (55yo M, TC 213, HDL 50, SBP 120, no smoking, no DM, untreated): ~5-7% range (borderline/low band). PASS.
- African-American coefficient path: 55yo AA male, otherwise identical inputs -> distinct coefficient set per Appendix 7 of Goff 2014 yields a non-trivial delta from the white path; spot-checked against the ACC ASCVD risk estimator. PASS.

## Cross-implementation differential
- ACC ASCVD Risk Estimator Plus (https://tools.acc.org/ASCVD-Risk-Estimator-Plus) is the canonical reference implementation. Sophie's META example (55yo white M baseline) returns ~5.4% on the ACC tool; Sophie returns within +/- 0.5% (within the spec-v11 §3.1.3 0.5% tolerance). PASS.
- Coefficient table values cross-checked against the PCE Appendix Table A.

## Edge-input handling notes
- Age constrained to 40-79 per the PCE valid age band (the published equations are only validated in this range); out-of-range inputs reject with an inline message.
- Race selector enumerates only the two PCE-supported strata; users outside these strata are directed to PREVENT.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- All inputs labelled; select dropdowns announce options; compute button keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
