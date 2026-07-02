# v12 audit - tei-index

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Tei C, et al. J Cardiol. 1995;26(6):357-366.

`lib/hemo-v194.js teiIndex()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- IVCT 80, IVRT 90, ET 250 -> Tei 0.68 (above LV normal ~0.39).
- >= 3 worked examples in test/unit/tei-index.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- MPI = (IVCT+IVRT)/ET and the LV/RV normal bands verified against the primary and an echo-reference reproduction. ET>0 guarded. PASS.

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
