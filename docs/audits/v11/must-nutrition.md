# v11 audit - must-nutrition

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: BAPEN. *The "MUST" Explanatory Booklet.* British Association for Parenteral and Enteral Nutrition; 2003 (reprinted with minor revisions). Tool derived by Elia M et al. on behalf of the MAG/BAPEN Working Group. BMI 0-2 + weight loss 0-2 + acute disease 0 or 2.

`lib/scoring-v4.js mustNutrition()` implements the three-component sum exactly per the BAPEN 2003 booklet: BMI >20 = 0; 18.5-20 = 1; <18.5 = 2; weight loss <5% = 0; 5-10% = 1; >10% = 2; acute disease with no nutritional intake for >5 days = 2.

## Boundary examples added
- low (tile example): BMI 22, no weight loss, no acute disease -> 0 (low).
- medium: BMI 19 (1), 6% loss (1) -> 2 (high).
- threshold: BMI 22 (0), 7% weight loss (1), no acute -> 1 (medium).
- high: BMI 17 (2) + 12% loss (2) + acute (2) -> 6 (high; maximum).

## Cross-implementation differential
- Reference: BAPEN 2003 booklet hand sum.
- Test case: BMI 19 (1), 4% loss (0), no acute -> 1.
- Sophie result: 1 (medium-risk band).
- Reference: same. PASS.

## Edge-input handling notes
- BMI and weight-loss inputs accept arbitrary positive numbers; band logic uses the BAPEN 2003 thresholds.

## A11y / keyboard notes
- Two labeled number inputs plus one checkbox; Tab-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
