# v11 audit - cam

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Inouye SK, van Dyck CH, Alessi CA, Balkin S, Siegal AP, Horwitz RI. *Clarifying confusion: the confusion assessment method. A new method for detection of delirium.* Ann Intern Med. 1990;113(12):941-948. Four features: (1) acute onset / fluctuating course; (2) inattention; (3) disorganized thinking; (4) altered level of consciousness. CAM-positive when features 1 + 2 are both present AND either feature 3 or feature 4 is present.

`lib/scoring-v4.js cam()` returns `{positive, features, band, text}` per the Inouye 1990 algorithm.

## Boundary examples added
- No features (tile example) -> negative.
- 1 + 2 only -> negative (needs 3 or 4).
- 1 + 2 + 3 -> positive.
- 1 + 2 + 4 -> positive.
- 1 + 3 + 4 (no feature 2) -> negative.
- 2 + 3 + 4 (no feature 1) -> negative.
- All four features -> positive.

## Cross-implementation differential
- Reference: Inouye 1990 algorithm "1 + 2 AND (3 OR 4)."
- Sophie result: matches across all 7 boundary cases above. PASS.

## Edge-input handling notes
- Each input coerced via Boolean(); missing input is "not present."

## A11y / keyboard notes
- Four labeled checkboxes; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
