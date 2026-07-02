# v12 audit - page-b

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Papatheodoridis G, et al. J Hepatol. 2016;64(4):800-806.

`lib/liver-v196.js pageB()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- age 65, male, plt 90 -> PAGE-B 23 (high, 5-yr HCC ~17%).
- >= 3 worked examples in test/unit/page-b.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- Age (0/2/4/6/8/10), male sex (6), platelet bands (0/6/9) and the <=9/10-17/>=18 bands cross-verified against the primary and a validation cohort; the stray 150-cutoff platelet scheme was rejected as non-PAGE-B. PASS.

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
