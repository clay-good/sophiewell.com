# v11 audit - bhutani-bilirubin

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Bhutani 1999 (Pediatrics 103:6) + AAP CPG Kemper 2022 (Pediatrics 150(3)).

lib/scoring-v6.js bhutaniBilirubin() — hour-specific 40/75/95th percentile tracks (piecewise-linear) classify the zone; AAP-2022 GA-banded phototherapy line compared; reports zone + above/below, no treatment order (spec-v58 §6).

## Boundary examples added
- See test/unit/bhutani-bilirubin.test.js (>=3 boundary cases, including band/age-band edges).

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
