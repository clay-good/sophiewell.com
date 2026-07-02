# v12 audit - timi-risk-index

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Wiviott SD, et al. JACC. 2006;47(8):1553-1558; Morrow DA, et al. Lancet 2001.

`lib/acs-v193.js timiRiskIndex()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- HR 100, age 70, SBP 120 -> TRI 40.8 (top mortality-risk group).
- >= 3 worked examples in test/unit/timi-risk-index.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- TRI = HR x (age/10)^2 / SBP re-derived from the primary; the age/10-squared term and the SBP>0 guard verified against two sources. PASS.

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
