# v11 audit - gds15

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Sheikh & Yesavage 1986 (GDS-15 short form, Clin Gerontol 5:165).

lib/scoring-v5.js gds15() scores 15 yes/no items; items 1,5,7,11,13 score 1 for No, the rest score 1 for Yes; bands normal/mild/moderate/severe.

## Boundary examples added
- all No -> 5 (the five No-scoring items) mild.
- +2 yes-scoring -> 7.
- No-scoring answered Yes -> 0 normal; inverse -> 15 severe.

## Cross-implementation differential
- Hand-count with mixed direction matches the published key. PASS.

## Edge-input handling notes
- requires a 15-element array; direction set encoded once (GDS_NO_SCORES).

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
