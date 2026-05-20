# v11 audit - abc-mtp

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Nunez TC, Voskresensky IV, Dossett LA, Shinall R, Dutton WD, Cotton BA. *Early prediction of massive transfusion in trauma: simple as ABC (assessment of blood consumption)?* J Trauma. 2009;66(2):346-352. Four binary criteria, 1 point each: penetrating mechanism; SBP <=90 mmHg; HR >=120 bpm; positive FAST exam. Score >=2 -> activate massive-transfusion protocol (sensitivity 75%, specificity 86% per Nunez 2009 §Results).

`lib/scoring-v4.js abcMtp()` checks each criterion and returns `score`, `activateMtp` (>=2), and a `criteriaPresent` list.

## Boundary examples added
- 0 of 4 (tile example) -> not indicated.
- 1 of 4 -> not indicated.
- 2 of 4 (HR + FAST) -> activate MTP.
- 4 of 4 -> activate MTP.

## Cross-implementation differential
- Reference: Nunez 2009 derivation cohort threshold (>=2).
- Test case: HR >=120 + positive FAST (2/4) -> activate.
- Sophie result: score 2, activateMtp true.
- Reference: same. PASS.

## Edge-input handling notes
- Each input interpreted as truthy boolean. Missing inputs default to "not present".

## A11y / keyboard notes
- Four labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
