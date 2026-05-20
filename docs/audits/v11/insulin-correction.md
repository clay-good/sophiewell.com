# v11 audit - insulin-correction

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: American Diabetes Association. *Standards of Care in Diabetes - 2024: 16. Diabetes Care in the Hospital.* Diabetes Care. 2024;47(Suppl 1):S295-S306. Uses ADA-endorsed insulin-sensitivity-factor formulas (1800-rule for rapid-acting analogues; 1500-rule for regular insulin). Correction units = max(0, (currentBG - targetBG) / ISF). Meal coverage = carbs / ICR.

`lib/scoring-v4.js insulinCorrection()` accepts `{currentBG, targetBG, isf, totalDailyDose, isfRule, carbs, icr}` and returns `{isf, isfDerivedFromTdd, correctionUnits, mealUnits, totalUnits, text}`.

## Boundary examples added
- BG 250 / target 150 / ISF 50 -> 2 U correction.
- BG 120 / target 150 -> 0 U correction (BG at/below target).
- BG 250 / target 150 / TDD 50 / rapid -> ISF 36, correction 2.8 U.
- BG 200 / target 100 / TDD 50 / regular -> ISF 30, correction 3.3 U.
- BG 150 / target 150 / carbs 60 / ICR 10 -> 0 correction + 6 meal = 6 U.

## Cross-implementation differential
- Reference: ADA 2024 ch. 16 worked example (ISF derivation 1800/TDD; correction formula).
- Sophie result: matches ADA derivation across all five boundary cases. PASS.

## Edge-input handling notes
- Missing currentBG, targetBG, ISF and TDD throws with a clear message.
- BG <= target returns 0 correction (does not produce a negative unit count).

## A11y / keyboard notes
- Seven labeled number inputs plus one ISF-rule select; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
