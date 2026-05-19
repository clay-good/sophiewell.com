# v11 audit - improve-vte

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Spyropoulos AC, Anderson FA Jr, FitzGerald G, et al. *Predictive and associative models to identify hospitalized medical patients at risk for VTE.* Chest. 2011;140(3):706-714. Seven weighted criteria: prior VTE +3, known thrombophilia +2, lower-limb paralysis +2, active cancer +2, immobilized >=7 days +1, ICU/CCU stay +1, age >60 +1. Sum 0-12. Cutoffs: >=2 -> inpatient VTE prophylaxis; >=4 -> extended-duration post-discharge prophylaxis per Spyropoulos 2011.

`lib/scoring-v4.js improveVte()` sums the seven weighted boolean contributions and emits a band keyed to the Spyropoulos 2011 cutoffs. The score ceiling is 12 (3+2+2+2+1+1+1).

## Boundary examples added
- 0 of 12 (tile example) -> low VTE risk; prophylaxis not routinely indicated.
- 2 of 12 (e.g., active cancer alone) -> inpatient prophylaxis candidate band.
- 4 of 12 (e.g., prior VTE (3) + age >60 (1)) -> extended-duration band.
- 12 of 12 (every criterion) -> extended-duration band.
- score 1 boundary (just below cutoff: age >60 alone) -> low VTE risk band.

## Cross-implementation differential
- Reference: Spyropoulos 2011 Table 3 worked through manually.
- Test case: prior VTE (3) + thrombophilia (2) = 5 -> extended-duration band.
- Sophie result: 5 of 12, extended-duration band.
- Reference: same. PASS.

## Edge-input handling notes
- All seven inputs interpreted via `x ? weight : 0` so `undefined` defaults to 0.

## A11y / keyboard notes
- Seven labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
