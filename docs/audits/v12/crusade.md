# v12 audit - crusade

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Subherwal S, et al. Circulation. 2009;119(14):1873-1882.

`lib/acs-v193.js crusade()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- Hct 35, CrCl 50, HR 95, female, SBP 85, HF, DM -> CRUSADE 68, very high (~19.5%).
- >= 3 worked examples in test/unit/crusade.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The 8-variable point table and 5 bleeding bands cross-verified across two open reproductions (ClinCaseQuest, TheCalculator.co); every sub-range weight and the U-shaped SBP term identical. PASS.

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
