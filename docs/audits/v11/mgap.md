# v11 audit - mgap

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Sartorius D, Le Manach Y, David JS, et al. *Mechanism, glasgow coma scale, age, and arterial pressure (MGAP): a new simple prehospital triage score to predict mortality in trauma patients.* Crit Care Med. 2010;38(3):831-837. Components: mechanism (blunt 4 / penetrating 0); GCS (3-15); age <60 (5); SBP bands (>120 = 5; 60-120 = 3; <60 = 0). Bands per Sartorius 2010 Table 3: <18 high, 18-22 moderate, 23-29 low risk.

`lib/scoring-v4.js mgap()` validates GCS (3-15) and SBP (non-negative) and returns the total `score`, component `parts`, and `risk` band.

## Boundary examples added
- Blunt + GCS 15 + age <60 + SBP 130 -> 29 (low risk).
- Penetrating + GCS 8 + age >=60 + SBP 80 -> 11 (high).
- Boundary: 18 -> moderate; 17 -> high.

## Cross-implementation differential
- Reference: Sartorius 2010 Table 3.
- Test case: blunt + GCS 9 + age >=60 + SBP 130 -> 4 + 9 + 0 + 5 = 18.
- Sophie result: score 18, risk moderate.
- Reference: same. PASS.

## Edge-input handling notes
- GCS outside 3-15 -> throws ('mgap: GCS must be 3-15').
- Negative SBP -> throws.

## A11y / keyboard notes
- Mechanism + age selects, two numeric inputs; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
