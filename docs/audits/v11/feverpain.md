# v11 audit - feverpain

- Auditor: CG
- Date: 2026-06-06 (spec-v57). Guideline-endorsed (NICE NG84): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: Little 2013 (FeverPAIN, BMJ 347:f5806); NICE NG84.

lib/scoring-v5.js feverpain() sums 5 items into the streptococcal-likelihood bands with the antibiotic strategy.

## Boundary examples added
- 4 of 5 -> 62-65% strep, consider antibiotic.
- 0 -> no antibiotic strategy.
- boundary 2 -> delayed; 5 -> max.

## Cross-implementation differential
- Item count and bands match FeverPAIN. PASS.

## Edge-input handling notes
- booleans coerced; complements Centor/McIsaac.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
