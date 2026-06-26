# v12 audit - ireton-jones

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Ireton-Jones C, Jones JD. Improved equations for predicting energy expenditure in patients: the Ireton-Jones equations. Nutr Clin Pract. 2002;17(1):29-31 (the 1997-revised constants cross-verified against two reproductions that list the 1992 and 1997 forms side-by-side; ≥ 2 sources, spec-v97).

`lib/nutrition-energy-v152.js iretonJones()` consumes ventilation status, age,
weight, sex, trauma/burn flags (and height for the spontaneous-form BMI > 27
obesity indicator), and computes the ventilator-dependent or spontaneous EEE.
Class A.

## Source-governance notes
- 1997-revised constants shipped, NOT the distinct 1992 set. Ventilated EEE = 1784
  − 11·age + 5·wt + 244·(male) + 239·(trauma) + 804·(burn). Spontaneous EEE = 629 −
  11·age + 25·wt − 609·(obese, BMI > 27). The 1992 ventilated form (1925/−10/5/281/
  292/851) is explicitly different and was confirmed not to be the shipped one.
- Male indicator 1/0, trauma/burn diagnosis flags 1/0; both branches and the male
  indicator unit-tested.

## Boundary worked examples added
- ventilated male 55/80 → 1823; trauma + burn add 239 + 804; female drops 244;
  spontaneous non-obese → 2024; spontaneous obese (BMI > 27) subtracts 609; blank
  input → valid:false.

## Edge-input handling notes
- Age and weight finite-checked; a blank value surfaces a complete-the-fields
  fallback rather than NaN; covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Mode/sex selects, age/weight/height inputs, trauma/burn checkboxes; output
  aria-live. 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
