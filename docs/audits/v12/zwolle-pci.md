# v12 audit - zwolle-pci

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: De Luca G, et al. Circulation. 2004;109(22):2737-2743.

`lib/acs-v193.js zwollePci()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- Killip I, TIMI 3, age 55 -> Zwolle 0, low risk (early-discharge candidate).
- >= 3 worked examples in test/unit/zwolle-pci.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- Killip (0/4/9), TIMI-flow (0/1/2), age>=60 (2), 3-vessel (1), anterior (1), ischemic time>4h (1) weights cross-verified against the primary and MDCalc-aligned reproductions. PASS.

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
