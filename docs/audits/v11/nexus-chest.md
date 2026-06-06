# v11 audit - nexus-chest

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Rodriguez 2015 (NEXUS Chest, PLoS Med 12:e1001883).

lib/scoring-v5.js nexusChest() defers imaging only if all 7 criteria absent, else imaging indicated.

## Boundary examples added
- all absent -> may defer.
- abnormal CXR alone -> indicated; age>60 alone -> indicated.
- two criteria -> indicated.

## Cross-implementation differential
- Boolean OR over 7 criteria. PASS.

## Edge-input handling notes
- missing booleans coerce to false.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
