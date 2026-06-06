# v11 audit - sfsr

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Quinn 2004 (San Francisco Syncope Rule / CHESS, Ann Emerg Med 43:224).

lib/scoring-v5.js sfsr() flags high risk if ANY CHESS criterion present.

## Boundary examples added
- no criterion -> low risk.
- abnormal ECG alone -> high; SBP<90 alone -> high.
- CHF alone -> high.

## Cross-implementation differential
- Boolean OR over CHESS. PASS.

## Edge-input handling notes
- missing booleans coerce to false; validation-caveat surfaced in the renderer.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
