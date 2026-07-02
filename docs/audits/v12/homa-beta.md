# v12 audit - homa-beta

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Matthews DR, et al. Diabetologia. 1985;28(7):412-419.

`lib/endo-quant-v197.js homaBeta()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- insulin 8, glucose 5.0 -> HOMA-B 106.7%.
- >= 3 worked examples in test/unit/homa-beta.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- HOMA-B = 20*insulin/(glucose_mmol-3.5) verified against the primary; the (glucose-3.5) denominator guarded > 0. PASS.

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
