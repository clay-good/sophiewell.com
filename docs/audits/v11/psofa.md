# v11 audit - psofa

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Matics & Sanchez-Pinto 2017 (JAMA Pediatr 171:e172352).

lib/scoring-v6.js psofa() — six organ systems; age-banded cardiovascular/renal; respiration 3/4 require ventilation; total 0-24.

## Boundary examples added
- See test/unit/psofa.test.js (>=3 boundary cases, including band/age-band edges).

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
