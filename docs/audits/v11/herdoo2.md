# v11 audit - herdoo2

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Rodger MA, Le Gal G, Anderson DR, et al. *Validating the HERDOO2 rule to guide treatment duration for women with unprovoked venous thrombosis: multinational prospective cohort management study.* BMJ. 2017;356:j1065. Women only; four criteria each +1: Hyperpigmentation/edema/redness in either leg, D-dimer >=250 ug/L on anticoagulation, BMI >=30, age >=65. Sum 0-4. Cutoff: 0-1 -> low risk; safe to discontinue anticoagulation. >=2 -> continue anticoagulation.

`lib/scoring-v4.js herdoo2()` sums the four boolean contributions and returns the Rodger 2017 cutoff decision. The rule is explicitly women-only; the renderer label and tile name surface this constraint so a clinician does not apply it to a male patient.

## Boundary examples added
- 0 of 4 (tile example) -> safe to discontinue.
- 1 of 4 (legs only) -> safe to discontinue (upper edge of 0-1 band).
- 2 of 4 (legs + D-dimer) -> continue anticoagulation.
- 4 of 4 (all four) -> continue.

## Cross-implementation differential
- Reference: Rodger 2017 cutoff worked through manually.
- Test case: BMI >=30 + age >=65 = 2 -> continue.
- Sophie result: 2 of 4, continue band.
- Reference: same. PASS.

## Edge-input handling notes
- Four boolean inputs interpreted via `x ? 1 : 0`. Sex constraint surfaced in label, not enforced in the math (clinician judgment).

## A11y / keyboard notes
- Four labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
