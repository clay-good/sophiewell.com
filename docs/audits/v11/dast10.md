# v11 audit - dast10

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Skinner 1982 (DAST, Addict Behav 7:363); 10-item short form, Yudko 2007.

lib/scoring-v5.js dast10() scores 10 yes/no items with item 3 reverse-scored (No=1); bands none/low/moderate/substantial/severe.

## Boundary examples added
- all No -> 1 (item 3 reverse).
- two Yes + item3 No -> 3 moderate; item3 Yes -> 2 low.
- all Yes -> 9 severe (item 3 Yes scores 0).

## Cross-implementation differential
- Hand-count with reverse item matches. PASS.

## Edge-input handling notes
- requires a 10-element array; booleans coerced, no NaN path.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
