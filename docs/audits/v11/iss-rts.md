# v11 audit - iss-rts

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Baker 1974 (ISS, J Trauma 14:187) + Champion 1989 (RTS, J Trauma 29:623).

lib/scoring-v5.js issRts() computes ISS (sum of squares of the 3 highest AIS; any region 6 -> 75) and the coded RTS (0-7.84).

## Boundary examples added
- AIS 4/3/2 -> 29 major trauma; RTS 7.84 (normal vitals).
- any AIS 6 -> 75.
- deranged vitals -> RTS 2.69 (gcs5/sbp60/rr4).

## Cross-implementation differential
- Sum-of-squares and the RTS coefficient sum match the published formulas. PASS.

## Edge-input handling notes
- AIS 0-6, GCS 3-15, SBP/RR clamped; coded bands handle 0 vitals.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
