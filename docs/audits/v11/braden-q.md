# v11 audit - braden-q

- Auditor: CG
- Date: 2026-06-06 (spec-v58).
- Citation re-verified against: Quigley & Curley 1996 (J Soc Pediatr Nurs 1:7).

lib/scoring-v6.js bradenQ() — seven subscales 1-4; total 7-28; lower = higher risk stated; at-risk <=16.

## Boundary examples added
- See test/unit/braden-q.test.js (>=3 boundary cases, including band/age-band edges).

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
