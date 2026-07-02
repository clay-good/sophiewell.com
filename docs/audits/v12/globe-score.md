# v12 audit - globe-score

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Lammers WJ, et al. Gastroenterology. 2015;149(7):1804-1812.e4.

`lib/liver-v196.js globeScore()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- age 65, bili 1.8x, ALP 2.5x, alb 0.95x, plt 120 -> GLOBE 2.5 (non-responder, >0.30).
- >= 3 worked examples in test/unit/globe-score.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The five coefficients (0.044378, 0.93982, 0.335648, -2.266708, -0.002581) + constant 1.216865 and the negative albumin/platelet signs cross-verified verbatim across three reprints (Goet 2018 PMC5983203, Corpechot 2022). Worked responder profile -0.41 reproduces. PASS.

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
