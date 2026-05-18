# v11 audit - Mean Arterial Pressure (`map`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Standard cardiovascular physiology: MAP ≈ DBP + (SBP - DBP)/3 = ((2 * DBP) + SBP) / 3. The 1/3-systolic/2/3-diastolic weighting assumes a normal cardiac cycle; at very high heart rates the systolic fraction grows, but the bedside formula is the universally taught approximation.

`lib/clinical.js map()` implements `((2*dbp) + sbp) / 3` rounded to one decimal.

## Boundary examples added
- low (hypotension): 80/40 -> MAP (160+80)/3 = 53.3 mmHg.
- mid (META example, normotensive): 120/80 -> MAP (160+120)/3 = 93.3 mmHg.
- high (hypertensive): 180/110 -> MAP (220+180)/3 = 133.3 mmHg.
- pulse-pressure boundary: 120/120 (no pulse) -> 120 mmHg.

## Cross-implementation differential
- Reference: physiology textbook formula, hand-computed.
- Test case: META example. Sophie 93.3 / reference 93.33 -> 93.3. Delta 0%. PASS.

## Edge-input handling notes
- The single-value tile uses the simple weighted-average formula. Sophie's `shock-index` tile reports the same MAP alongside PP and SI, with the same formula, so the two stay consistent.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled number inputs; output is a single labelled value with units. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
