# v12 audit - sf-ratio

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Rice TW, et al. Chest. 2007;132(2):410-417.

`lib/vent-v195.js sfRatio()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- SpO2 95, FiO2 0.5 -> S/F 190, est P/F 150 (ARDS range).
- >= 3 worked examples in test/unit/sf-ratio.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- S/F = SpO2/FiO2 and P/F = (S/F-64)/0.84 with the SpO2<=97% ceiling caveat verified against the primary and a second ARDS reproduction. PASS.

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
