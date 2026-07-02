# v12 audit - cns-ipi

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Schmitz N, et al. J Clin Oncol. 2016;34(26):3150-3156.

`lib/subspecialty-v198.js cnsIpi()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- age>60 + LDH + ECOG>1 + stage III/IV -> CNS-IPI 4, high (~10.2% 2-yr).
- >= 3 worked examples in test/unit/cns-ipi.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- Six 1-point factors and the 0-1/2-3/4-6 bands with 2-yr relapse 0.6%/3.4%/10.2% cross-verified across the JCO abstract, MDCalc, and two PMC reviews. PASS.

## Edge-input handling notes
- Missing / non-positive / out-of-range inputs return a surfaced complete-the-fields
  fallback (valid:false); zero-denominator and log-domain edges are guarded.

## A11y / keyboard notes
- Every input carries a real <label for>; output aria-live="polite". The 320px sweep
  passes with no horizontal scroll. Risk/prognosis stratification, not an order.

## Defects opened
- none

## Status
- PASS
