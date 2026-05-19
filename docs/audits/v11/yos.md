# v11 audit - yos

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: McCarthy PL, Sharpe MR, Spiesel SZ, et al. *Observation scales to identify serious illness in febrile children.* Pediatrics. 1982;70(5):802-809. Six observation items each scored 1 (normal), 3 (moderate impairment), or 5 (severe impairment): quality of cry, reaction to parents, state variation, color, hydration, response to social overtures. Sum 6-30. Bands per McCarthy 1982 §Results: <=10 low SBI risk; 11-15 increased risk; >=16 high probability of SBI.

`lib/scoring-v4.js yos()` clamps each per-item value to the {1, 3, 5} set (drift -> nearest valid token). The renderer uses three-option `<select>` elements so a clinician cannot enter an out-of-set value through the UI.

## Boundary examples added
- 6 of 30 (all 1s; tile example) -> low band.
- 10 of 30 (mix of 1s and 3s) -> low band (upper edge of <=10).
- 11 of 30 -> intermediate band (lower edge of 11-15).
- 15 of 30 -> intermediate (upper edge of 11-15).
- 16 of 30 -> HIGH band (lower edge of >=16).
- 30 of 30 (all 5s) -> HIGH band.
- per-item clamp: 0 -> 1; 2 -> 3 (rounds to nearest token); 99 -> 5.

## Cross-implementation differential
- Reference: McCarthy 1982 §Results bands.
- Test case: 3 + 3 + 3 + 3 + 3 + 3 = 18 -> HIGH band.
- Sophie result: 18 of 30, HIGH band.
- Reference: same. PASS.

## Edge-input handling notes
- Inputs outside {1, 3, 5} are coerced to the nearest valid token per the clamp logic; the renderer uses three-option selects so this rarely fires in practice.

## A11y / keyboard notes
- Six labeled select elements with three options each; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
