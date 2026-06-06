# v11 audit - phq2-gad2

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Kroenke 2003 (PHQ-2, Med Care 41:1284) + Kroenke 2007 (GAD-2, Ann Intern Med 146:317).

lib/scoring-v5.js phq2Gad2() sums two depression + two anxiety items (0-3 each) and flags each >=3 as positive (proceed to PHQ-9 / GAD-7).

## Boundary examples added
- 2+2 / 2+1 -> PHQ-2 4 positive, GAD-2 3 positive.
- 2+1 -> 3 positive; 1+1 -> 2 negative (boundary).
- all 0 -> 0 negative.

## Cross-implementation differential
- Hand-sum matches. PASS.

## Edge-input handling notes
- each item num()-clamped 0-3 (throws on 4 / NaN).

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
