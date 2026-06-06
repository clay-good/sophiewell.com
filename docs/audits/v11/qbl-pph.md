# v11 audit - qbl-pph

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: ACOG PB 183 + AIM/CMQCC Obstetric Hemorrhage bundle.

lib/scoring-v6.js qblPph() — QBL = measured + (pad grams - tare), 1 g = 1 mL; PPH flag >=1000 mL or vaginal >=500 + instability; CMQCC risk tier; no transfusion order.

## Boundary examples added
- See test/unit/qbl-pph.test.js (>=3 boundary cases, including band/age-band edges).

## Cross-implementation differential
- Point/threshold tables transcribed from the cited source; PASS.

## Edge-input handling notes
- Inputs validated via lib/num.js num(); out-of-range/non-finite throws and is caught by the renderer safe() wrapper. No NaN/Infinity/undefined reaches the DOM (spec-v53 §3).

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
