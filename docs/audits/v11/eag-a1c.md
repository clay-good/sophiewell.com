# v11 audit - eag-a1c

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Nathan DM, et al. (ADAG study group). Diabetes Care. 2008;31(8):1473-1478. eAG (mg/dL) = 28.7 x A1c - 46.7; mmol/L = mg/dL / 18.0.

`lib/clinical-v6.js eagA1c()` returns eAG in mg/dL and mmol/L. The mg/dL value is rounded via r3() first to absorb the floating-point error exactly at the .5 boundary, reproducing the published ADAG table.

## Boundary examples added
- A1c 6.0% -> 28.7*6-46.7 = 125.5 -> 126 mg/dL (published ADAG value).
- A1c 7.0% -> 154 mg/dL.
- A1c 5.0% -> 97 mg/dL.
- A1c 9.0% -> 212 mg/dL.

## Cross-implementation differential
- Published ADAG: A1c 7% -> 154 mg/dL. Sophie 154. PASS. A1c 6% -> 126 (table). Sophie 126. PASS.

## Edge-input handling notes
- A1c bounded [3, 20]; out-of-range or non-finite throws (caught by safe()).

## A11y / keyboard notes
- One labeled input, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
