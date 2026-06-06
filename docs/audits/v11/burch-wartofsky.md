# v11 audit - burch-wartofsky

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Burch & Wartofsky 1993 (Endocrinol Metab Clin North Am 22:263).

lib/scoring-v6.js burchWartofsky() — weighted category point selects summed; <25/25-44/>=45 bands.

## Boundary examples added
- See test/unit/burch-wartofsky.test.js (>=3 boundary cases, including band/age-band edges).

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
