# v12 audit - transpulmonary-gradient

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Naeije R, et al. Eur Respir J. 2013;41(1):217-223.

`lib/hemo-v194.js pressureGradients()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- mPAP 40, PADP 30, PCWP 20 -> TPG 20, DPG 10; combined pre/post-capillary (PCWP>15, DPG>=7).
- >= 3 worked examples in test/unit/transpulmonary-gradient.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- TPG = mPAP-PCWP, DPG = PADP-PCWP and the >12 / DPG>=7 (PCWP>15) classifications verified against the primary and a PH-guideline reproduction. PASS.

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
