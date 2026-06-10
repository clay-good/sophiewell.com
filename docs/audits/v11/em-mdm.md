# v11 audit - MDM-Based E/M Code Selector (`em-mdm`)

- Auditor: CG
- Date: 2026-06-10
- Citation re-verified against: AMA CPT 2021 office/outpatient E/M Medical Decision Making grid (level set by 2 of 3 of problems, data, risk). Code descriptors AMA-owned, not bundled. spec-v63 §3.3.

## Boundary examples added
- problems moderate(4) / data limited(3) / risk moderate(4) -> level 4 (99204/99214), data is the limiting element.
- problems high(5) / data extensive(5) / risk low(3) -> level 5 (two elements at 5); 5/3/3 -> level 3; 2/2/2 -> level 2.
- out-of-range element (1 or NaN) throws RangeError/TypeError (no silent miscode).

## Cross-implementation differential
- 2-of-3 rule: the level is the highest L where at least two of the three elements are >= L. Hand-checked against the AMA grid for the level-3/4/5 boundaries. PASS.

## Edge-input handling notes
- Each element is a <select> with values 2..5; num() bounds [2,5] so any out-of-range value throws (caught by safe()). em-mdm covers the MDM path; em-time the time path -- the two ways a 2021 visit level is set. PASS.

## A11y / keyboard notes
- Three labeled grade <select>s, Tab order = source order; aria-live output. test:a11y clean; 320px no-hscroll clean. PASS.

## Defects opened
- none

## Status
- PASS
