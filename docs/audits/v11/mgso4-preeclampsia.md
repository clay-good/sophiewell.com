# v11 audit - mgso4-preeclampsia

- Auditor: CG
- Date: 2026-06-06 (spec-v56). Guideline-derived (ACOG): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: ACOG Practice Bulletin 222 (2020); Magpie Trial (Lancet 2002;359(9321):1877-1890).

lib/medication-v5.js mgso4Preeclampsia() converts load (g) and maintenance (g/h) to volume/rate at the bag concentration (g/mL); renal impairment halves the maintenance default with a warning.

## Boundary examples added
- 4 g + 2 g/h at 0.04 g/mL: 100 mL load, 50 mL/h.
- 6 g load: 150 mL.
- renal: maintenance 1 g/h = 25 mL/h.

## Cross-implementation differential
- Hand-calc 2/0.04 = 50 mL/h. Sophie 50. PASS.

## Edge-input handling notes
- concGPerMl min 0.001 prevents divide-by-zero; load/maint bounded. Toxicity monitoring (DTRs, RR, UOP; calcium gluconate antidote) surfaced.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
