# v11 audit - pram-asthma

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Chalut DS, Ducharme FM, Davis GM. *The Preschool Respiratory Assessment Measure (PRAM): a responsive index of acute asthma severity.* J Pediatr. 2000;137(6):762-768. Five items with non-uniform per-item maxima: suprasternal retractions (0/2), scalene muscle use (0/2), air entry (0/1/2/3), wheezing (0/1/2/3), SpO2 on room air (0/1/2). Sum 0-12. Bands per Chalut 2000 §Results: 0-3 mild, 4-7 moderate, 8-12 severe.

`lib/scoring-v4.js pramAsthma()` uses the same `pickFrom()` helper as Westley to snap each per-item value to the published allowed-token set.

## Boundary examples added
- 0 of 12 (tile example) -> mild band.
- 3 of 12 (upper edge of mild) -> mild.
- 4 of 12 (lower edge of moderate) -> moderate.
- 7 of 12 (upper edge of moderate) -> moderate.
- 8 of 12 (lower edge of severe) -> severe.
- 12 of 12 (max) -> severe band.

## Cross-implementation differential
- Reference: Chalut 2000 §Results.
- Test case: suprasternal (2) + scalene (2) + air entry decreased at base (1) = 5 -> moderate.
- Sophie result: 5 of 12, moderate band.
- Reference: same. PASS.

## Edge-input handling notes
- `pickFrom()` snaps each per-item value to the nearest allowed token.

## A11y / keyboard notes
- Five labeled select elements; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
