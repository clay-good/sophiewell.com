# v11 audit - apache2

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Knaus 1985 (Crit Care Med 13:818).

lib/scoring-v6.js apache2() — twelve APS step functions + GCS (15-GCS) + age points + chronic-health points; total 0-71; cohort-mortality band, not individual prognosis.

## Boundary examples added
- See test/unit/apache2.test.js (>=3 boundary cases, including band/age-band edges).

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
