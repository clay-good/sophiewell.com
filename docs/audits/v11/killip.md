# v11 audit - killip

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Killip T, Kimball JT. *Treatment of myocardial infarction in a coronary care unit. A two-year experience with 250 patients.* Am J Cardiol. 1967;20(4):457-464. Original 250-patient cohort in-hospital mortality (I 6%, II 17%, III 38%, IV 81%). Contemporary reperfusion-era mortality is documented from the GUSTO-I cohort: Lee KL, et al. *Predictors of 30-day mortality in the era of reperfusion for acute myocardial infarction.* Circulation. 1995;91(6):1659-1668 (Killip I ~5%, II ~14%, III ~32%, IV ~58%).

`lib/scoring-v4.js killip()` exposes a 4-row picker (Killip class I-IV) returning the canonical descriptor and the Killip 1967 original-cohort in-hospital mortality band. The contemporary GUSTO-I (Lee 1995) cohort numbers are surfaced as a secondary citation in the renderer footer and the META interpretation block.

## Boundary examples added
- low (tile example): Killip I -> mortality 6% in the Killip 1967 original cohort.
- mid: Killip II -> mortality 17%.
- mid-high: Killip III -> mortality 38%.
- high: Killip IV -> mortality 81% (Killip 1967 worst-band) / ~58% in the GUSTO-I (Lee 1995) reperfusion-era cohort.

## Cross-implementation differential
- Reference implementation: Killip T, Kimball JT. Am J Cardiol. 1967;20(4):457-464 §Results.
- Test case: Killip III.
- Sophie result: descriptor 'III - Acute pulmonary edema', mortality 38%.
- Reference result: same descriptor, same mortality. PASS.

## Edge-input handling notes
- Input is clamped to 1-4 inclusive via `Math.max(1, Math.min(4, ...))`; out-of-range or non-numeric inputs fall back to class I.

## A11y / keyboard notes
- One labeled `<select>` with four options carrying the descriptor text; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
