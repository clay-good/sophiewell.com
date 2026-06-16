# v12 audit - ckd-epi-cystatin

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Inker LA, Eneanya ND, Coresh J, et al. New creatinine- and cystatin C-based equations to estimate GFR without race. N Engl J Med. 2021;385(19):1737-1749.

`lib/nephro-v92.js ckdEpiCystatin()` computes the 2021 race-free CKD-EPI eGFRcys (cystatin C only) and, when serum creatinine is given, the eGFRcr-cys (combined) and eGFRcr (creatinine only), presented side by side. The combined estimate is the recommended confirmatory test near a decision threshold.

## Boundary worked examples added
- female 70, cystatin 1.5, creatinine 1.1 -> eGFRcys 40.6, eGFRcr-cys 47.4, eGFRcr 54.1 (combined between the two single-marker values).
- eGFRcys alone when creatinine is blank (cystatin 1.2, age 65 -> 59.8).
- Non-positive or blank cystatin C -> valid:false.
- Sex factor lowers eGFRcys for female vs male at the same cystatin/age; a normal young value lands in 100-140.

## Cross-implementation differential
- Reference: Inker 2021 (NEJM) equation coefficients (kappa 0.7/0.9, alpha, the 0.996/0.9938/0.9961 age terms, the female multipliers). The min/max-ratio exponent form and the constants match. PASS.

## Edge-input handling notes
- Cystatin C and creatinine must be positive before exponentiation; the cystatin-only and combined estimates are computed independently, so a missing creatinine still yields eGFRcys. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Three labeled numeric inputs + one labeled sex <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
