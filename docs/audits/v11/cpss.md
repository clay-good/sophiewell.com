# v11 audit - cpss

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Kothari RU, Pancioli A, Liu T, Brott T, Broderick J. *Cincinnati Prehospital Stroke Scale: reproducibility and validity.* Ann Emerg Med. 1999;33(4):373-378. Three-item bedside screen (facial droop, arm drift, abnormal speech), each scored 0 (normal) or 1 (abnormal). The CPSS is positive when any one of the three items is abnormal.

`lib/scoring-v4.js cpss()` validates each item as integer 0 or 1, sums to `abnormalCount` (0-3), and returns `positive: abnormalCount >= 1`.

## Boundary examples added

- All-normal (tile example) -> negative screen (abnormalCount 0).
- One abnormal item (facial droop) -> positive screen (abnormalCount 1).
- All three abnormal -> positive screen (abnormalCount 3).

## Cross-implementation differential

- Reference: Kothari 1999 reports CPSS positivity at >=1 abnormal item with sensitivity 66% for any stroke and 88% for anterior-circulation stroke.
- Sophie result: any single abnormal item triggers `positive: true`; all-normal returns `positive: false`. PASS.

## Edge-input handling notes

- Non-integer (NaN, 0.5), out-of-range (2, -1), and missing keys throw.

## A11y / keyboard notes

- Three 0-1 range fields with linked labels; aria-live result region wraps the tile output. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
