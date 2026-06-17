# v12 audit - pim3

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Straney L, Clements A, Parslow RC, et al. Paediatric index of mortality 3: an updated model for predicting mortality in pediatric intensive care. Pediatr Crit Care Med. 2013;14(7):673-681.

`lib/peds-v98.js pim3()` computes the predicted probability of death from the published Straney 2013 logistic equation (NOT the PIM3-anz13 recalibration). Coefficients cross-verified against two independent reproductions (the JKMS validation paper and the applylogits/andespediatrica reproduction). SBP enters as a linear term plus a squared term (SBP^2/1000); the FiO2*100/PaO2 term contributes only when both gas values are present. Class A.

## Boundary worked examples added
- SBP 90, ventilated, base excess -5, high-risk diagnosis -> logit -1.9 -> 13.04%.
- elective + low-risk diagnosis -> lower probability than a shocked very-high-risk case.
- 1e9 inputs -> finite probability in [0,100].

## Cross-implementation differential
- Reference: the published logistic coefficients and link. Match. PASS.

## Edge-input handling notes
- Linear predictor clamped to [-40,40] before exponentiation; a blank SBP surfaces valid:false; non-finite inputs never reach the DOM. Fuzz harness covers the module with the logistic explicitly fuzzed for overflow.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
