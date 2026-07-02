# v12 audit - select-pse

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Galovic M, et al. Lancet Neurol. 2018;17(2):143-152.

`lib/subspecialty-v198.js selectPse()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- NIHSS 4-10, early seizure, cortical -> SeLECT 6, 18%/29% at 1/5 yr.
- >= 3 worked examples in test/unit/select-pse.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The five factors (NIHSS 0/1/2, LAA 1, early 3, cortical 2, MCA 1) and the full 0-9 per-score 1-yr/5-yr risk table read directly from Figure 3 of the primary manuscript, internally cross-checked against Figure 4. PASS.

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
