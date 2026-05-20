# v11 audit - gap

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Kondo Y, Abe T, Kohshi K, Tokuda Y, Cook EF, Kukita I. *Revised trauma scoring system to predict in-hospital mortality in the emergency department: Glasgow Coma Scale, Age, and Systolic Blood Pressure score.* Crit Care. 2011;15(4):R191. Components: GCS (3-15); age <60 (3); SBP bands (>120 = 6; 60-120 = 4; <60 = 0). Bands per Kondo 2011: <=10 high, 11-18 moderate, 19-24 low risk.

`lib/scoring-v4.js gap()` validates GCS (3-15) and SBP (non-negative) and returns the total `score`, component `parts`, and `risk` band.

## Boundary examples added
- GCS 15 + age <60 + SBP 130 -> 24 (low risk).
- GCS 5 + age >=60 + SBP 50 -> 5 (high).
- Boundaries: 10 -> high; 11 -> moderate; 19 -> low.

## Cross-implementation differential
- Reference: Kondo 2011.
- Test case: GCS 13 + age >=60 + SBP 130 -> 13 + 0 + 6 = 19.
- Sophie result: score 19, risk low.
- Reference: same. PASS.

## Edge-input handling notes
- GCS outside 3-15 -> throws.
- Negative SBP -> throws.

## A11y / keyboard notes
- Two numeric inputs + age select; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
