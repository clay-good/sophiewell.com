# v11 audit - acetaminophen-nomogram

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: Rumack BH, Matthew H. Pediatrics 1975;55(6):871-876 (treatment line 150 ug/mL at 4 h).

lib/medication-v5.js acetaminophenNomogram() evaluates the U.S. treatment line C(t) = 150 x 0.5^((t-4)/4) and reports above/below -> NAC indicated/not. REFUSES outside the 4-24 h window.

## Boundary examples added
- 4 h: line 150; level 160 -> above, NAC indicated.
- 8 h: line 75; level 70 -> below, not indicated.
- 8 h level exactly 75 -> above (treat).
- 2 h or 30 h: throws (validity refusal).

## Cross-implementation differential
- Hand-calc line at 8 h = 150/2 = 75. Sophie 75. PASS.

## Edge-input handling notes
- hours min 4 / max 24 throw RangeError -> renderer shows the refusal message. Single acute ingestion / known time only.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
