# v11 audit - stone-score

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Moore 2014 (STONE score, BMJ 348:g2191).

lib/scoring-v5.js stoneScore() sums the weighted STONE items (Sex, Timing, Origin, Nausea, Erythrocytes) into low/moderate/high probability.

## Boundary examples added
- max weighted -> 13 high.
- female/>24h/none -> 0 low.
- moderate band 6-9; nausea 1 vs vomiting 2.

## Cross-implementation differential
- Hand-weighted sum matches STONE. PASS.

## Edge-input handling notes
- categorical selects map to fixed weights; no division.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
