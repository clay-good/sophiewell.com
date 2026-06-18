# v12 audit - oesil

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Colivicchi F, Ammirati F, Melina D, et al. Eur Heart J. 2003;24(9):811-819.

`lib/cardio-v104.js oesil()` sums four 1-point items to a 0-4 total and maps the published 12-month total mortality (0 = 0%, 1 = 0.8%, 2 = 19.6%, 3 = 34.7%, 4 = 57.1%). Class A.

## Boundary worked examples added
- no factors -> 0, 0% mortality, low.
- one factor -> 1, 0.8%, low.
- 1 -> 2 band flip -> 19.6%, high.
- all factors -> 4, 57.1%.
- fuzz: bounded integer sum indexing a fixed lookup, no non-finite leak.

## Cross-implementation differential
- Reference: the Colivicchi 2003 derivation-cohort 12-month mortality table (verified against the Eur Heart J primary paper). Match. PASS.

## Edge-input handling notes
- Boolean flags only; the mortality array is indexed by the 0-4 total, so an out-of-range index is impossible.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no horizontal scroll. Mortality-risk estimate, not an admission order.

## Defects opened
- none

## Status
- PASS
