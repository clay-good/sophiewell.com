# v11 audit - pelod2

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Leteurtre 2013 (Crit Care Med 41:1761).

lib/scoring-v6.js pelod2() — ten variables, five organ systems; age-banded MAP/creatinine cutoffs from ageMonths; active band returned and shown; total 0-33.

## Boundary examples added
- See test/unit/pelod2.test.js (>=3 boundary cases, including band/age-band edges).

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
