# v12 audit - oral-disposition-index

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Utzschneider KM, et al. Diabetes Care. 2009;32(2):335-341.

`lib/endo-quant-v197.js oralDispositionIndex()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- I0 8, I30 60, G0 90, G30 150 -> DIo 0.108 (IGI 0.867).
- >= 3 worked examples in test/unit/oral-disposition-index.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- Insulinogenic index = dI/dG(0-30); DIo = IGI*(1/fasting insulin) verified against the primary; the dG and fasting-insulin denominators guarded > 0. PASS.

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
