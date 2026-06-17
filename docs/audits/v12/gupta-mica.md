# v12 audit - gupta-mica

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Gupta PK, Gupta H, Sundaram A, et al. Development and validation of a risk calculator for prediction of cardiac risk after surgery. Circulation. 2011;124(4):381-387.

`lib/periop-v97.js guptaMica()` computes the predicted probability of perioperative MI or cardiac arrest from the published fixed logistic equation: risk = 1 / (1 + e^-x), x = -5.25 + 0.02*age + ASA class + functional status + creatinine + procedure type. Coefficients cross-verified against two independent reproductions (MDApp, Omnicalculator) of the Circulation 2011 model. Reference categories (coefficient 0): ASA V, independent, normal creatinine, hernia.

## Boundary worked examples added
- age 65, ASA III, partially dependent, normal creatinine, intestinal surgery -> x = -4.08 -> 1.66% (asserted against 100/(1+e^4.08)).
- monotonicity: higher ASA + totally dependent + elevated creatinine + aortic surgery raises the probability above a young low-ASA hernia case.

## Cross-implementation differential
- Reference: the published logistic coefficients and link function. Match. PASS.

## Edge-input handling notes
- Linear predictor clamped to [-40, 40] before exponentiation; a 1e9 age yields a finite probability in [0, 100], never NaN/Infinity. An out-of-enum ASA / functional / surgery surfaces valid:false, never a silent NaN. Age range-clamped. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Age numeric input + four labeled selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. A model estimate, not a clearance.

## Defects opened
- none

## Status
- PASS
