# v11 audit - downes

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Downes 1970 (Clin Pediatr 9:325).

lib/scoring-v6.js downes() — five parameters 0-2; total 0-10; mild/moderate/severe bands; higher = worse stated.

## Boundary examples added
- See test/unit/downes.test.js (>=3 boundary cases, including band/age-band edges).

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
