# v11 audit - years-pe

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: van der Hulle 2017 (YEARS, Lancet 390:289).

lib/scoring-v5.js yearsPe() picks the D-dimer threshold from the YEARS item count (0 items -> 1000, >=1 -> 500) and excludes PE below it. The conditional threshold is surfaced.

## Boundary examples added
- 0 items, D-dimer 400 < 1000 -> excluded; 1200 -> CTPA.
- 1 item flips threshold to 500: 600 -> CTPA, 400 -> excluded.

## Cross-implementation differential
- Threshold-flip logic matches the YEARS algorithm. PASS.

## Edge-input handling notes
- dDimer num()-clamped; threshold shown explicitly so the user sees why it flipped.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
