# v12 audit - diagnostic-2x2

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Altman DG, Bland JM. Diagnostic tests 1 & 2. BMJ. 1994;308:1552; 309:102 (cross-verified against standard biostatistics references; ≥ 2 sources, spec-v97).

`lib/ebm-v163.js diagnostic2x2()` computes the Diagnostic Test 2×2. Group E, Class A.

## Source-governance notes
- sens = TP/(TP+FN), spec = TN/(TN+FP), PPV = TP/(TP+FP), NPV = TN/(TN+FN), accuracy = (TP+TN)/N, LR+ = sens/(1−spec), LR− = (1−sens)/spec.
- Optional Bayes PPV/NPV at a user prevalence so the study PPV is not implied to transfer to a different population.
- Every row/column denominator guarded; an empty disease column → valid:false; perfect specificity → LR+ surfaced as ∞.

## Boundary worked examples added
- 90/10/10/90 → sens 90%, spec 90%, LR+ 9; at 5% prevalence PPV recomputes to 32.1%; empty disease column and blank cells → valid:false.

## Edge-input handling notes
- counts ≥ 0 allowed (0 valid); zero test-positive/negative column → PPV/NPV null, not NaN. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Five labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
