# v11 audit - finnegan

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Finnegan 1975 (Addict Dis 2:141); modified Finnegan.

lib/scoring-v6.js finnegan() — weighted binary signs + 3 graded items summed; higher = worse; >=8/>=12 trend-treatment bands surfaced as trend decisions.

## Boundary examples added
- See test/unit/finnegan.test.js (>=3 boundary cases, including band/age-band edges).

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
