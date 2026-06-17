# v12 audit - gupta-respiratory-failure

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Gupta H, Gupta PK, Fang X, et al. Development and validation of a risk calculator predicting postoperative respiratory failure. Chest. 2011;140(5):1207-1215.

`lib/periop-v97.js guptaRespiratoryFailure()` computes the predicted probability of postoperative respiratory failure (mechanical ventilation > 48 h or unplanned reintubation): risk = 1 / (1 + e^-x), x = -1.7397 + ASA class + sepsis status + functional status + emergency + procedure type. Reference categories (0): ASA V, SIRS, independent, emergency = yes, hernia.

## Boundary worked examples added
- ASA III, no sepsis, independent, elective, intestinal surgery -> x = -3.144 -> 4.13%.
- monotonicity: ASA IV + septic shock + totally dependent + emergency + aortic surgery raises the probability above an elective low-ASA hernia case.

## Cross-implementation differential
- Reference: the published Chest 2011 logistic model (intercept and category coefficients). Match. PASS.

## Edge-input handling notes
- Linear predictor clamped before exponentiation; large-magnitude x yields a finite probability in [0, 100]. Out-of-enum sepsis / ASA / surgery surfaces valid:false, never NaN. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Five labeled selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. A model estimate, not a clearance.

## Defects opened
- none

## Status
- PASS
