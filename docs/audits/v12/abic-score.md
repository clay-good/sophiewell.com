# v12 audit - abic-score

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Dominguez M, et al. Am J Gastroenterol. 2008;103(11):2747-2756.

`lib/liver-v196.js abicScore()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- age 50, bili 8, creat 1.0, INR 1.5 -> ABIC 7.14 (intermediate, ~70% 90-day survival).
- >= 3 worked examples in test/unit/abic-score.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- ABIC = 0.1*age+0.08*bili+0.3*creat+0.8*INR and the 6.71/9.0 bands verified against the primary and MDCalc-aligned reproduction. PASS.

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
