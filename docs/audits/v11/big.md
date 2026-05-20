# v11 audit - big

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Borgman MA, Maegele M, Wade CE, Blackbourne LH, Spinella PC. *Pediatric trauma BIG score: predicting mortality in children after military and civilian trauma.* Pediatrics. 2011;127(4):e892-e897. Formula: BIG = base deficit + 2.5 * INR + (15 - GCS). Threshold: BIG >=16 predicts mortality with high sensitivity per Borgman 2011 §Results.

`lib/scoring-v4.js big()` validates INR (non-negative), GCS (3-15), and base deficit (finite number) and returns the `score`, `parts` (base deficit, INR component, GCS component), and `highMortalityRisk` flag.

## Boundary examples added
- BD 0, INR 1, GCS 15 -> 2.5 (below threshold).
- BD 8, INR 2, GCS 8 -> 20 (high).
- Boundary: BD 6 + INR 2 + GCS 10 -> 16 (high).

## Cross-implementation differential
- Reference: Borgman 2011 formula.
- Test case: BD 4, INR 1.4, GCS 12 -> 4 + 3.5 + 3 = 10.5.
- Sophie result: score 10.5, highMortalityRisk false.
- Reference: same. PASS.

## Edge-input handling notes
- GCS outside 3-15 -> throws.
- Negative INR -> throws.

## A11y / keyboard notes
- Three numeric inputs; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
