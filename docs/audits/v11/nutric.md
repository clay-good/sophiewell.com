# v11 audit - nutric

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Heyland DK, Dhaliwal R, Jiang X, Day AG. *Identifying critically ill patients who benefit the most from nutrition therapy: the development and initial validation of a novel risk assessment tool.* Crit Care. 2011;15(6):R268. Six-component sum with age, APACHE II, SOFA, comorbidities, days hospital to ICU, IL-6. Cutoff >=6 of 10 for high nutritional risk.

`lib/scoring-v4.js nutric()` implements the Heyland 2011 weighted sum exactly per the published bands.

## Boundary examples added
- low (tile example): age 55, APACHE 18, SOFA 6, 1 comorbidity, 0 days, IL-6 0 -> 3 of 10 (low).
- mid (cutoff +/- 1): age 60 (1), APACHE 22 (2), SOFA 7 (1), 3 comorbidities (1), 2 days (1), IL-6 500 (1) -> 7 (high).
- high: age 80 (2), APACHE 30 (3), SOFA 12 (2), 5 comorb (1), 5 days (1), IL-6 500 (1) -> 10 of 10 (Heyland 2011 maximum).

## Cross-implementation differential
- Reference: hand sum from Heyland 2011 §Methods Table 1 bands.
- Test case: age 60, APACHE 22, SOFA 7, 3 comorbidities, 2 days, IL-6 500.
- Sophie result: 7 (high band).
- Reference result: 1+2+1+1+1+1 = 7; >=6 cutoff. PASS.

## Edge-input handling notes
- All inputs are non-negative integers; bands are documented inline.

## A11y / keyboard notes
- Six labeled number inputs; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
