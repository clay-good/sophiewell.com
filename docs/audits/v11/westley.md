# v11 audit - westley

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Westley CR, Cotton EK, Brooks JG. *Nebulized racemic epinephrine by IPPB for the treatment of croup: a double-blind study.* Am J Dis Child. 1978;132(5):484-487. Five items with non-uniform per-item maxima: level of consciousness (0/5), cyanosis (0/4/5), stridor (0/1/2), air entry (0/1/2), retractions (0/1/2/3). Sum 0-17. Bands per Westley 1978 §Methods: <3 mild, 3-7 moderate, 8-11 severe, >=12 impending respiratory failure.

`lib/scoring-v4.js westley()` uses a `pickFrom()` helper that snaps each per-item value to the published allowed-token set so a slider drift cannot produce an out-of-rubric weight (e.g., LOC 3 -> snaps to nearest of {0, 5}).

## Boundary examples added
- 0 of 17 (all normal; tile example) -> mild band.
- 2 of 17 (stridor with agitation + retractions mild) -> mild.
- 3 of 17 (lower edge of moderate) -> moderate.
- 7 of 17 (upper edge of moderate) -> moderate.
- 8 of 17 (lower edge of severe) -> severe.
- 11 of 17 (upper edge of severe) -> severe.
- 12 of 17 (lower edge of impending respiratory failure) -> impending band.
- 17 of 17 (max) -> impending respiratory failure band.

## Cross-implementation differential
- Reference: Westley 1978 §Methods.
- Test case: cyanosis at rest (5) + stridor at rest (2) + retractions moderate (2) = 9 -> severe.
- Sophie result: 9 of 17, severe band.
- Reference: same. PASS.

## Edge-input handling notes
- `pickFrom()` snaps each per-item value to the nearest allowed token; non-finite -> first allowed token (0).

## A11y / keyboard notes
- Five labeled select elements; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
