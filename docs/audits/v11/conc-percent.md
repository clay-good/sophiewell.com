# v11 audit - conc-percent

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: USP concentration conventions: 1% w/v = 10 mg/mL; ratio 1:1000 = 1 mg/mL.

lib/medication-v5.js concPercent() converts any one of percent / mg/mL / ratio to the other two.

## Boundary examples added
- 1:1000: 1 mg/mL, 0.1%.
- 1:10000: 0.1 mg/mL, 0.01%.
- 1% -> 10 mg/mL, 1:100.
- 20 mg/mL -> 2%, 1:50.

## Cross-implementation differential
- Hand-calc 1000/1000 = 1 mg/mL; /10 = 0.1%. Sophie matches. PASS.

## Edge-input handling notes
- mode must be percent/mgml/ratio; value min 1e-9 guards 1/value and divide-by-zero.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
