# v11 audit - tsat

- Auditor: CG
- Date: 2026-06-06 (spec-v55). Guideline-derived (KDIGO): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: KDIGO Anemia-in-CKD work group and AGA/ACG iron-deficiency guidance. TSAT (%) = serum iron / TIBC x 100.

`lib/clinical-v6.js tsat()` computes TSAT and a pattern: low TSAT + low ferritin = absolute iron deficiency; low TSAT + normal/high ferritin = functional iron deficiency / anemia of inflammation; TSAT >50% = overload pattern. No dosing automation.

## Boundary examples added
- low: iron 50, TIBC 400 -> 12.5%.
- absolute ID: iron 30, TIBC 450, ferritin 10 -> 6.7%, absolute iron deficiency.
- functional: iron 40, TIBC 300, ferritin 200 -> functional pattern.
- overload: iron 200, TIBC 300 -> 66.7% (overload pattern).

## Cross-implementation differential
- Hand-calc 50/400*100 = 12.5. Sophie 12.5. PASS.

## Edge-input handling notes
- TIBC floor 1 (num min) prevents divide-by-zero; ferritin optional (null when blank).

## A11y / keyboard notes
- Three labeled inputs (ferritin optional), aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
