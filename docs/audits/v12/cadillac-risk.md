# v12 audit - cadillac-risk

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Halkin A, et al. JACC. 2005;45(9):1397-1405.

`lib/acs-v193.js cadillacRisk()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- LVEF 30, CrCl 50, age 70, Killip II-III, TIMI 0-2, anemia, 3-vessel -> CADILLAC 18, high (>12%/yr).
- >= 3 worked examples in test/unit/cadillac-risk.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The 7 weighted items (4/3/3/2/2/2/2) and 3 bands (0-2/3-5/>=6) cross-verified against the primary and a validation reproduction. PASS.

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
