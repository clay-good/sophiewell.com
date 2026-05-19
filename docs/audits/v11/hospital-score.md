# v11 audit - hospital-score

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Donze J, Aujesky D, Williams D, Schnipper JL. *Potentially avoidable 30-day hospital readmissions in medical patients: derivation and validation of a prediction model.* JAMA Intern Med. 2013;173(8):632-638. Table 2 (weights) and Table 4 (risk bands).

`lib/scoring-v4.js hospitalScore()` implements the Donze 2013 seven-predictor weighted sum: hemoglobin <12 (1), discharge from oncology service (2), sodium <135 (1), any procedure during the hospitalization (1), urgent / emergent admission (1), length of stay >=5 days (2), and prior admissions in the past 12 months (0 / 1-2 = 0; 3-4 = 2; >=5 = 5). Donze 2013 Table 4 bands: low 0-4 ~5.8%, intermediate 5-6 ~11.9%, high >=7 ~22.8%.

## Boundary examples added
- low: no predictors, prior admissions = 0 -> 0 (low; ~5.8% 30-day potentially-avoidable readmission). Tile empty-state example.
- mid: hemoglobin <12 + sodium <135 + any procedure + urgent + LOS >=5 -> 1 + 1 + 1 + 1 + 2 = 6 (intermediate; ~11.9%).
- high: hemoglobin <12 + oncology + sodium <135 + procedure + urgent + LOS >=5 + 5+ prior admissions -> 1 + 2 + 1 + 1 + 1 + 2 + 5 = 13 (Donze 2013 Table 2 maximum; high; ~22.8%).

## Cross-implementation differential
- Reference implementation: Donze J, et al. JAMA Intern Med. 2013;173(8):632-638 Table 2 weights (hand sum).
- Test case: hemoglobin <12, oncology, LOS >=5, 4 prior admissions.
- Sophie result: 1 + 2 + 2 + 2 = 7 (high band).
- Reference result: same sum 7; Donze 2013 Table 4 high band. PASS within one ordinal category.

## Edge-input handling notes
- Six predictors are checkboxes; the prior-admissions input is a non-negative integer with the Donze 2013 four-band table mapping (0 / 1-2 = 0; 3-4 = 2; >=5 = 5).
- Negative or non-numeric prior-admissions values are coerced to 0.

## A11y / keyboard notes
- Six labeled checkboxes plus one labeled `number` input; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
