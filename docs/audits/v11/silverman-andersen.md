# v11 audit - silverman-andersen

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Silverman & Andersen 1956 (Pediatrics 17:1).

lib/scoring-v6.js silvermanAndersen() — five signs 0-2; total 0-10; higher = worse (inverse of APGAR) stated explicitly.

## Boundary examples added
- See test/unit/silverman-andersen.test.js (>=3 boundary cases, including band/age-band edges).

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
