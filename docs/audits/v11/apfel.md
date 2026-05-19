# v11 audit - apfel

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Apfel CC, Laara E, Koivuranta M, Greim CA, Roewer N. *A simplified risk score for predicting postoperative nausea and vomiting: conclusions from cross-validations between two centers.* Anesthesiology. 1999;91(3):693-700. Four binary risk factors (female sex, nonsmoker, history of PONV or motion sickness, postoperative opioids); sum 0-4; predicted PONV risk per Apfel 1999 Table 4 -> 10% / 20% / 40% / 60% / 80%.

`lib/scoring-v4.js apfel()` sums the four Apfel 1999 risk factors and returns the Apfel 1999 Table 4 risk band. Each factor is a single-bit flag; no per-item weighting.

## Boundary examples added
- 0 of 4 -> ~10% PONV per Apfel 1999.
- 1 of 4 (female only) -> ~20% PONV.
- 2 of 4 (female + nonsmoker; tile example) -> ~40% PONV.
- 3 of 4 -> ~60% PONV.
- 4 of 4 (maximum) -> ~80% PONV.

## Cross-implementation differential
- Reference: Apfel 1999 Table 4 (the published risk-by-score row).
- Test case: female + nonsmoker + history of PONV.
- Sophie result: 3 of 4 -> ~60% PONV.
- Reference: same. PASS.

## Edge-input handling notes
- Four boolean inputs; truthy-coerced; no NaN paths.

## A11y / keyboard notes
- Four labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
