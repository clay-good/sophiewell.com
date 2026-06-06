# v11 audit - ottawa-knee

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Stiell 1995 (Ottawa Knee Rule, Ann Emerg Med 26:405).

lib/scoring-v5.js ottawaKnee() flags x-ray if ANY of 5 criteria present, else safe to defer.

## Boundary examples added
- age>=55 alone -> indicated; cannot-bear-weight alone -> indicated.
- all absent -> deferred.
- empty input -> all-absent (no throw).

## Cross-implementation differential
- Boolean OR logic, no arithmetic. PASS.

## Edge-input handling notes
- missing booleans coerce to false; no NaN/undefined to DOM.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
