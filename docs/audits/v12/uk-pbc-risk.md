# v12 audit - uk-pbc-risk

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Carbone M, et al. Hepatology. 2016;63(3):930-950.

`lib/liver-v196.js ukPbcRisk()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- ALP 2.0x, ALT 1.5x, bili 1.0x, alb 1.1x, plt 1.5x -> 4.7%/14.9%/26% at 5/10/15 yr.
- >= 3 worked examples in test/unit/uk-pbc-risk.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The mean-centered linear predictor (inverse-power transaminase term, log bilirubin term) and the baseline survivors S0 = 0.982/0.941/0.893 cross-verified across two reprints; risk clamped to [0,1] per spec-v140. PASS.

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
