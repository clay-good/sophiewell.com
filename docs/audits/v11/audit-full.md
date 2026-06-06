# v11 audit - audit-full

- Auditor: CG
- Date: 2026-06-06 (spec-v57). Guideline-derived (WHO): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: Saunders 1993 (WHO AUDIT, Addiction 88:791) + WHO AUDIT Manual 2001.

lib/scoring-v5.js auditFull() sums 10 items (0-4) into the WHO risk zones at 8/16/20.

## Boundary examples added
- 4+4+2 -> 10 Zone II hazardous.
- 1+1 -> 2 Zone I low-risk.
- boundary 8 hazardous vs 7 low-risk; >=20 Zone IV.

## Cross-implementation differential
- Hand-sum and zone thresholds match WHO manual. PASS.

## Edge-input handling notes
- requires a 10-element array (throws otherwise); each item 0-4 clamped.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
