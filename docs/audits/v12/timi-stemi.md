# v12 audit - timi-stemi

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Morrow DA, Antman EM, Charlesworth A, et al. TIMI risk score for ST-elevation myocardial infarction. Circulation. 2000;102(17):2031-2037.

`lib/cardio-v90.js timiStemi()` computes the 0-14 weighted point sum over nine bedside variables and maps the total to the published 30-day mortality band. No division; the total is bounded; the mortality table is keyed by the integer total (> 8 collapses to the top row, 35.9%).

## Boundary worked examples added
- Age 70 + anterior STE + time > 4 h = 4 points -> 7.3% mortality.
- 0 extreme: no risk factors, blank age -> 0.8%.
- 14 extreme: every variable positive at the >= 75 age band -> 35.9%.
- Band flip: score 8 -> 26.8%, score 9 -> 35.9%.

## Cross-implementation differential
- Reference: Morrow 2000 point table and mortality bands. Age 65-74 = 2 + anterior STE 1 + time > 4 h 1 = 4 -> 7.3%. Sophie matches. PASS.

## Edge-input handling notes
- Age band points: < 65 = 0, 65-74 = 2, >= 75 = 3. A blank age contributes 0 age points and the note flags the omission. The risk-factor selects default "no". The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- One labeled numeric input (age) and seven labeled yes/no selects; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
